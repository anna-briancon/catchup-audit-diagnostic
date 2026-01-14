# EventHub - Projet d'Évaluation M2 Développeur Fullstack

![EventHub](https://img.shields.io/badge/Status-Pr%C3%AAt%20pour%20Audit-orange)
![Stack](https://img.shields.io/badge/Stack-Vue.js%20%2B%20Node.js%20%2B%20PostgreSQL-blue)

## 📋 Table des Matières

- [Contexte du Projet](#contexte-du-projet)
- [Objectifs Pédagogiques](#objectifs-pédagogiques)
- [Description Fonctionnelle](#description-fonctionnelle)
- [Stack Technique](#stack-technique)
- [Prérequis](#prérequis)
- [Installation et Lancement](#installation-et-lancement)
- [Architecture du Projet](#architecture-du-projet)
- [Votre Mission](#votre-mission)
- [Livrables Attendus](#livrables-attendus)
- [Critères d'Évaluation](#critères-dévaluation)

---

## 🎯 Contexte du Projet

**EventHub** est une application de gestion d'événements permettant aux utilisateurs de créer, organiser et participer à des événements. Les utilisateurs peuvent consulter les événements disponibles, s'y inscrire et suivre leur participation.

## 🎓 Objectifs Pédagogiques

Ce projet vous permettra de démontrer vos compétences en :

1. **Audit d'architecture technique**
2. **Diagnostic de performance**
3. **Mise en place d'instrumentation**
4. **Optimisation applicative** (Optionel, ne pas mettre en place les optimisations mais ajouter dans le rapport les optimisations à éffectuer)
5. **Optimisation de base de données** (Optionel, ne pas mettre en place les optimisations mais ajouter dans le rapport les optimisations à éffectuer)

## 📱 Description Fonctionnelle

### Fonctionnalités utilisateur

L'application permet aux utilisateurs authentifiés de :

- **Gérer des événements**
  - Créer de nouveaux événements
  - Consulter les événements disponibles
  - Filtrer par statut
  - Rechercher par titre

- **Participer aux événements**
  - S'inscrire à un événement (RSVP)
  - Voir le nombre de participants
  - Vérifier la disponibilité

- **Visualiser les statistiques**
  - Dashboard avec nombre d'événements par statut
  - Nombre total de participants
  - Liste des événements récents

### Comptes de test

- **Email** : `test@example.com`
- **Mot de passe** : `password123`

## 🛠 Stack Technique

### Backend

- **Runtime** : Node.js 20
- **Framework** : Express.js
- **Langage** : TypeScript
- **Base de données** : PostgreSQL 16
- **Architecture** : En couches (Routes → Controllers → Services → Repositories)
- **Authentification** : JWT (JSON Web Tokens)

### Frontend

- **Framework** : Vue 3 (Composition API)
- **Build Tool** : Vite
- **Langage** : TypeScript
- **HTTP Client** : Axios
- **Router** : Vue Router

### Infrastructure

- **Containerisation** : Docker & Docker Compose
- **Serveur Web** : Nginx (pour le frontend en production)

## 📦 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- [Docker](https://www.docker.com/get-started) (version 20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0+)
- [Node.js](https://nodejs.org/) (version 20+) - optionnel pour développement local
- [Git](https://git-scm.com/)

## 🚀 Installation et Lancement

### Avec Docker (Recommandé)

```bash
# 1. Cloner le projet
git clone <url-du-repo>
cd catchup-audit-diagnostic

# 2. Lancer tous les services
docker-compose up -d

# 3. Vérifier que les services sont démarrés
docker-compose ps

# 4. Seed de la base de données (créer plusieurs milliers d'événements)
docker-compose exec backend npm run seed

# 5. Accéder à l'application
# Frontend : http://localhost:5174
# Backend : http://localhost:3001
```

### Développement local (optionnel)

Consultez les README dans les dossiers `backend/` et `frontend/` pour les instructions de développement local.

## 📐 Architecture du Projet

```
catchup-audit-diagnostic/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration (DB, JWT, etc.)
│   │   ├── controllers/     # Contrôleurs HTTP
│   │   ├── services/        # Logique métier
│   │   ├── repositories/    # Accès aux données
│   │   ├── models/          # Types et interfaces
│   │   ├── routes/          # Définition des routes
│   │   ├── middleware/      # Middlewares Express
│   │   ├── scripts/         # Scripts utilitaires
│   │   └── server.ts        # Point d'entrée
│   └── ...
│
├── frontend/
│   ├── src/
│   │   ├── views/           # Pages/Vues
│   │   ├── router.ts        # Configuration du routeur
│   │   ├── api.ts           # Client API
│   │   └── ...
│   └── ...
│
├── database/
│   └── init.sql             # Schéma initial
│
└── docker-compose.yml       # Orchestration des services
```

---

## 🎯 Votre Mission

Réalisez un **audit complet de performance et de qualité de code** en suivant une méthodologie en 4 phases : **(1) Identification des flux** (cartographie de l'architecture et des parcours utilisateurs), **(2) Instrumentation** (collecte de métriques via Lighthouse, DevTools, EXPLAIN ANALYZE), **(3) Analyse** (diagnostic des causes racines et priorisation par impact), **(4) Optimisation** (corrections itératives avec mesures avant/après) (Optionel).

**Documentez chaque phase** avec des preuves concrètes : schémas, screenshots, métriques, et justifications de vos choix techniques.

---

## 📝 Livrables Attendus

### 1. Repository Git

- Fork de ce projet sur GitHub/GitLab
- Commits clairs et descriptifs
- Code propre et commenté

### 2. Rapport d'Audit (`AUDIT_REPORT.md`)

Un rapport structuré contenant :

- Analyse de l'architecture
- Diagnostic technique avec métriques
- Description des optimisations implémentées
- Résultats avant/après
- Recommandations

### 3. Dossier `screenshots/`

Captures d'écran démontrant :

- Les mesures initiales (Lighthouse, DevTools, EXPLAIN)
- Les mesures après optimisation
- Les logs et le monitoring mis en place
- Les améliorations visuelles

### 4. Code fonctionnel

- L'application doit rester fonctionnelle
- Les optimisations doivent être testées
- Le code doit être propre et maintenable

---

## 🔗 Ressources Utiles

### Documentation officielle

- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Vue.js Performance](https://vuejs.org/guide/best-practices/performance.html)
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [PostgreSQL Performance](https://www.postgresql.org/docs/current/performance-tips.html)

---

## 📬 Soumission

Une fois votre travail terminé :

1. **Vérifications finales**
   - [ ] Le projet se lance correctement
   - [ ] Toutes les fonctionnalités sont opérationnelles
   - [ ] Le rapport est complet
   - [ ] Les captures d'écran sont présentes
   - [ ] Les commits sont clairs

2. **Push sur votre repository**
   ```bash
   git add .
   git commit -m "Final: Audit et optimisations EventHub"
   git push origin main
   ```

3. **Envoi**
   - Envoyez le lien de votre repository sur Teams
   - Vérifiez que votre repository est accessible

---

**Bon courage ! 🚀**

N'oubliez pas : l'objectif n'est pas de créer l'application parfaite, mais de démontrer votre capacité à analyser, diagnostiquer et optimiser une application existante de manière méthodique et professionnelle.
