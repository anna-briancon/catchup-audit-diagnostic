<template>
  <div class="login-view">
    <div class="login-container">
      <div class="login-card">
        <h1>EventHub</h1>
        <p class="subtitle">Gestion d'événements simplifiée</p>

        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              placeholder="test@example.com"
              required
            />
          </div>

          <div class="form-group">
            <label for="password">Mot de passe</label>
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="password123"
              required
            />
          </div>

          <button type="submit" :disabled="loading" class="btn-primary">
            {{ loading ? 'Connexion...' : 'Se connecter' }}
          </button>

          <p v-if="error" class="error">{{ error }}</p>

          <p class="hint">
            <strong>Compte de test :</strong><br>
            Email: test@example.com<br>
            Mot de passe: password123
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'

const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const response = await api.post('/auth/login', {
      email: email.value,
      password: password.value
    })
    
    localStorage.setItem('token', response.data.token)
    localStorage.setItem('user', JSON.stringify(response.data.user))
    
    router.push('/events')
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Erreur de connexion'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-container {
  width: 100%;
  max-width: 400px;
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

h1 {
  color: #667eea;
  margin-bottom: 8px;
  font-size: 32px;
  text-align: center;
}

.subtitle {
  color: #666;
  margin-bottom: 30px;
  text-align: center;
  font-size: 14px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: #667eea;
}

.btn-primary {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  margin-top: 15px;
  padding: 12px;
  background: #fee;
  color: #c33;
  border-radius: 6px;
  text-align: center;
  font-size: 14px;
}

.hint {
  margin-top: 20px;
  padding: 15px;
  background: #f0f4ff;
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.6;
  color: #555;
  text-align: center;
}
</style>
