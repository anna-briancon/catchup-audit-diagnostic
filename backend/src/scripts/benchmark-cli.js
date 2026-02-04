const { exec } = require('child_process');
const http = require('http');
const url = require('url');

const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const DURATION = parseInt(process.env.DURATION || '60', 10);
const CONNECTIONS = parseInt(process.env.CONNECTIONS || '20', 10);

// Credentials pour le login
const LOGIN_BODY = JSON.stringify({
  email: 'test@example.com',
  password: 'password123'
});

// Fonction pour obtenir un token JWT
function getAuthToken() {
  return new Promise((resolve) => {
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
    headers: {}
  },
  {
    name: 'GET /events',
    url: `${BASE_URL}/events`,
    method: 'GET',
    headers: {}
  }
];

function runAutocannon(test, authToken) {
  return new Promise((resolve, reject) => {
    let command = `npx autocannon -c ${CONNECTIONS} -d ${DURATION} -m ${test.method}`;
    
    // Ajouter les headers
    if (test.headers['Content-Type']) {
      command += ` -H "Content-Type: ${test.headers['Content-Type']}"`;
    }
    if (authToken) {
      command += ` -H "Authorization: Bearer ${authToken}"`;
    }
    
    // Ajouter le body pour POST
    if (test.body) {
      command += ` --body '${test.body}'`;
    }
    
    command += ` ${test.url}`;
    
    console.log(`\n${test.name}`);
    console.log(`Running ${DURATION}s test @ ${test.url}`);
    console.log(`${CONNECTIONS} connections\n`);
    
    const process = exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      console.log(stdout);
      if (stderr) {
        console.error(stderr);
      }
      resolve();
    });
    
    process.stdout.pipe(process.stdout);
    process.stderr.pipe(process.stderr);
  });
}

async function runAllBenchmarks() {
  console.log('🚀 Démarrage des tests de performance avec autocannon\n');
  console.log(`URL de base: ${BASE_URL}`);
  console.log(`Durée: ${DURATION}s par test`);
  console.log(`Connexions: ${CONNECTIONS}\n`);
  
  // Obtenir le token d'authentification
  console.log('🔐 Obtention du token d\'authentification...');
  const authToken = await getAuthToken();
  
  if (!authToken) {
    console.error('❌ Impossible d\'obtenir le token. Les tests protégés vont échouer.');
  } else {
    console.log('✅ Token obtenu avec succès\n');
  }
  
  // Exécuter tous les tests
  for (let i = 0; i < tests.length; i++) {
    console.log(`\n[${i + 1}/${tests.length}] Testing ${tests[i].name} (${DURATION}s, ${CONNECTIONS} conn)...`);
    try {
      await runAutocannon(tests[i], authToken);
    } catch (error) {
      console.error(`Erreur lors du test ${tests[i].name}:`, error);
    }
  }
  
  console.log('\n✅ Tous les tests sont terminés!');
}

// Exécuter les benchmarks
runAllBenchmarks().catch(console.error);
