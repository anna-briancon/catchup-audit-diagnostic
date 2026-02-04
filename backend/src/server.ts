import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import eventRoutes from "./routes/events";
import dashboardRoutes from "./routes/dashboard";
import client from "prom-client";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialisation des métriques Prometheus (désactivable via variable d'environnement)
// Les métriques système peuvent être coûteuses, on les désactive par défaut
if (process.env.ENABLE_SYSTEM_METRICS === 'true') {
  client.collectDefaultMetrics({
    register: client.register,
    prefix: 'nodejs_',
    gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
  });
}

// Cache pour la normalisation des routes (évite les calculs répétés)
const routeCache = new Map<string, string>();

// Fonction optimisée pour normaliser les routes
function normalizeRoute(path: string): string {
  // Vérifier le cache d'abord
  if (routeCache.has(path)) {
    return routeCache.get(path)!;
  }

  let route = path;
  
  // Normaliser les routes avec paramètres (remplacer les IDs numériques par :id)
  route = route.replace(/\/\d+/g, "/:id");
  
  // Normaliser les routes spécifiques (optimisé avec early returns)
  if (route.startsWith("/auth")) {
    route = "/auth/login";
  } else if (route.startsWith("/events")) {
    if (route === "/events" || route === "/events/") {
      route = "/events";
    } else if (route.includes("/rsvp")) {
      route = "/events/:id/rsvp";
    } else if (route !== "/events/:id") {
      route = "/events/:id";
    }
  } else if (route.startsWith("/dashboard")) {
    route = "/dashboard/summary";
  }

  // Mettre en cache (limiter la taille du cache)
  if (routeCache.size < 100) {
    routeCache.set(path, route);
  }

  return route;
}

// Histogramme pour la durée des requêtes
const httpDuration = new client.Histogram({
  name: "http_request_duration_ms",
  help: "Durée des requêtes HTTP en ms",
  labelNames: ["method", "route", "status"],
  buckets: [5, 10, 25, 50, 100, 200, 400, 800, 1500, 3000, 6000, 12000],
});

// Compteur pour le total des requêtes
const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Nombre total de requêtes HTTP",
  labelNames: ["method", "route", "status"],
});

// Compteur pour les succès
const httpRequestsSuccess = new client.Counter({
  name: "http_requests_success",
  help: "Nombre de requêtes réussies (2xx, 3xx)",
  labelNames: ["method", "route"],
});

// Compteur pour les erreurs
const httpRequestsErrors = new client.Counter({
  name: "http_requests_errors",
  help: "Nombre de requêtes en erreur (4xx, 5xx)",
  labelNames: ["method", "route", "status"],
});

// Compteur pour les non autorisées
const httpRequestsUnauthorized = new client.Counter({
  name: "http_requests_unauthorized",
  help: "Nombre de requêtes non autorisées (401)",
  labelNames: ["method", "route"],
});

// Routes à exclure du tracking (pour améliorer les performances)
const EXCLUDED_ROUTES = new Set(["/metrics", "/health"]);

// Middleware de mesure des métriques (optimisé)
app.use((req, res, next) => {
  // Ignorer les routes qui n'ont pas besoin de métriques
  if (EXCLUDED_ROUTES.has(req.path)) {
    return next();
  }

  const start = performance.now();

  res.on("finish", () => {
    // Calculer la durée de manière asynchrone pour ne pas bloquer la réponse
    setImmediate(() => {
      const duration = performance.now() - start;
      const route = normalizeRoute(req.path);
      const method = req.method;
      const status = String(res.statusCode);

      // Enregistrer les métriques de manière optimisée
      try {
        httpDuration.labels(method, route, status).observe(duration);
        httpRequestsTotal.labels(method, route, status).inc();

        // Catégoriser par statut (optimisé)
        const statusCode = res.statusCode;
        if (statusCode >= 200 && statusCode < 400) {
          httpRequestsSuccess.labels(method, route).inc();
        } else if (statusCode >= 400) {
          httpRequestsErrors.labels(method, route, status).inc();
          if (statusCode === 401) {
            httpRequestsUnauthorized.labels(method, route).inc();
          }
        }
      } catch (error) {
        // Ignorer les erreurs de métriques pour ne pas affecter l'application
        console.error("Metrics error:", error);
      }
    });
  });

  next();
});

app.use("/auth", authRoutes);
app.use("/events", eventRoutes);
app.use("/dashboard", dashboardRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Endpoint Prometheus
app.get("/metrics", async (_req, res) => {
  res.setHeader("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Metrics available at http://localhost:${PORT}/metrics`);
});