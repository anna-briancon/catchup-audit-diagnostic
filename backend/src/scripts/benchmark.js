const autocannon = require('autocannon');

const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const DURATION = parseInt(process.env.DURATION || '60', 10); // 60 secondes par défaut
const CONNECTIONS = parseInt(process.env.CONNECTIONS || '20', 10); // 20 connexions par défaut

// Credentials pour le login
const LOGIN_BODY = JSON.stringify({
  email: 'test@example.com',
  password: 'password123'
});

// Fonction pour formater et afficher les résultats
function printResults(result) {
  const latency = result.latency || {};
  const requests = result.requests || {};
  const throughput = result.throughput || {};
  
  // Tableau de latence
  console.log('\n┌─────────┬──────────┐');
  console.log('│ Stat    │ Latency  │');
  console.log('├─────────┼──────────┤');
  console.log(`│ 2.5%    │ ${formatLatency(latency.p2_5)} │`);
  console.log(`│ 50%     │ ${formatLatency(latency.p50 || latency.mean)} │`);
  console.log(`│ 97.5%   │ ${formatLatency(latency.p97_5)} │`);
  console.log(`│ 99%     │ ${formatLatency(latency.p99)} │`);
  console.log(`│ Avg     │ ${formatLatency(latency.mean || latency.average)} │`);
  console.log(`│ Stdev   │ ${formatLatency(latency.stddev)} │`);
  console.log(`│ Max     │ ${formatLatency(latency.max)} │`);
  console.log('└─────────┴──────────┘');
  
  // Tableau de requêtes/seconde et bytes/seconde
  console.log('\n┌─────────┬──────────────┬──────────────┐');
  console.log('│ Stat    │ Req/Sec      │ Bytes/Sec    │');
  console.log('├─────────┼──────────────┼──────────────┤');
  console.log(`│ 1%      │ ${formatNumber(requests.p1)} │ ${formatBytes(throughput.p1)} │`);
  console.log(`│ 2.5%    │ ${formatNumber(requests.p2_5)} │ ${formatBytes(throughput.p2_5)} │`);
  console.log(`│ 50%     │ ${formatNumber(requests.p50 || requests.mean)} │ ${formatBytes(throughput.p50 || throughput.mean)} │`);
  console.log(`│ 97.5%   │ ${formatNumber(requests.p97_5)} │ ${formatBytes(throughput.p97_5)} │`);
  console.log(`│ Avg     │ ${formatNumber(requests.mean || requests.average)} │ ${formatBytes(throughput.mean || throughput.average)} │`);
  console.log(`│ Stdev   │ ${formatNumber(requests.stddev)} │ ${formatBytes(throughput.stddev)} │`);
  console.log(`│ Min     │ ${formatNumber(requests.min)} │ ${formatBytes(throughput.min)} │`);
  console.log('└─────────┴──────────────┴──────────────┘');
  
  // Résumé
  const totalRequests = requests.total || 0;
  const totalBytes = throughput.total || 0;
  const duration = result.duration || 0;
  const errors = result.errors || 0;
  const timeouts = result.timeouts || 0;
  // Calculer le nombre de samples basé sur la durée réelle
  const actualDuration = duration / 1000; // convertir ms en secondes
  const samples = requests.samples || Math.max(1, Math.floor(actualDuration));
  
  console.log('\nReq/Bytes counts sampled once per second.');
  console.log(`# of samples: ${samples}`);
  
  let summary = `${totalRequests} requests in ${actualDuration.toFixed(2)}s, ${formatBytes(totalBytes)} read`;
  if (errors > 0 || timeouts > 0) {
    const successResponses = result['2xx'] || (totalRequests - errors - timeouts);
    const non2xxResponses = result['non2xx'] || (errors + timeouts);
    if (non2xxResponses > 0) {
      summary = `${successResponses} 2xx responses, ${non2xxResponses} non 2xx responses\n${summary}`;
    }
    if (timeouts > 0) {
      summary += `\n${timeouts} errors (${timeouts} timeouts)`;
    }
  }
  console.log(summary);
}

function formatLatency(ms) {
  if (ms === undefined || ms === null || isNaN(ms)) return 'N/A     ';
  return `${Math.round(ms)} ms`.padEnd(8);
}

function formatNumber(num) {
  if (num === undefined || num === null || isNaN(num)) return 'N/A           ';
  return Math.round(num).toString().padEnd(12);
}

function formatBytes(bytes) {
  if (bytes === undefined || bytes === null || isNaN(bytes)) return 'N/A           ';
  if (bytes < 1024) return `${bytes} B`.padEnd(12);
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} kB`.padEnd(12);
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`.padEnd(12);
}

// Fonction pour obtenir un token JWT
async function getAuthToken() {
  return new Promise((resolve) => {
    const http = require('http');
    const url = require('url');
    
    const parsedUrl = url.parse(BASE_URL);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 3000,
      path: '/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(LOGIN_BODY)
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.token || null);
        } catch (error) {
          console.error('Erreur lors du parsing de la réponse:', error);
          resolve(null);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('Erreur lors de l\'obtention du token:', error);
      resolve(null);
    });
    
    req.write(LOGIN_BODY);
    req.end();
  });
}

// Tests à exécuter
const tests = [
  {
    name: 'POST /auth/login',
    url: `${BASE_URL}/auth/login`,
    method: 'POST',
    body: LOGIN_BODY,
    headers: {
      'Content-Type': 'application/json'
    }
  },
  {
    name: 'GET /dashboard/summary',
    url: `${BASE_URL}/dashboard/summary`,
    method: 'GET',
    headers: {} // Le token sera ajouté dynamiquement
  },
  {
    name: 'GET /events',
    url: `${BASE_URL}/events`,
    method: 'GET',
    headers: {} // Le token sera ajouté dynamiquement
  }
];

async function runBenchmark(test, index, total, authToken) {
  console.log(`\n[${index}/${total}] Testing ${test.name} (${DURATION}s, ${CONNECTIONS} conn)...`);
  console.log(`Running ${DURATION}s test @ ${test.url}`);
  console.log(`${CONNECTIONS} connections\n`);
  
  const config = {
    url: test.url,
    method: test.method,
    connections: CONNECTIONS,
    duration: DURATION,
    headers: {
      ...test.headers,
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    }
  };
  
  if (test.body) {
    config.body = test.body;
  }
  
  try {
    const result = await autocannon(config);
    
    // Afficher les résultats avec notre fonction personnalisée
    console.log(`\n${test.name}`);
    printResults(result);
    
    return result;
  } catch (error) {
    console.error(`Erreur lors du test ${test.name}:`, error);
    return null;
  }
}

async function runAllBenchmarks() {
  console.log('Démarrage des tests de performance avec autocannon\n');
  console.log(`URL de base: ${BASE_URL}`);
  console.log(`Durée: ${DURATION}s par test`);
  console.log(`Connexions: ${CONNECTIONS}\n`);
  
  // Obtenir le token d'authentification
  console.log('Obtention du token d\'authentification...');
  const authToken = await getAuthToken();
  
  if (!authToken) {
    console.error('Impossible d\'obtenir le token. Les tests protégés vont échouer.');
  } else {
    console.log('Token obtenu avec succès\n');
  }
  
  // Exécuter tous les tests
  const results = [];
  for (let i = 0; i < tests.length; i++) {
    const result = await runBenchmark(tests[i], i + 1, tests.length, authToken);
    results.push({ test: tests[i].name, result });
  }
  
  console.log('\nTous les tests sont terminés!');
}

// Exécuter les benchmarks
runAllBenchmarks().catch(console.error);
