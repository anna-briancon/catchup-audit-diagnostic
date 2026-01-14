<template>
  <div class="event-list-view">
    <header class="header">
      <div class="container">
        <div class="header-content">
          <h1>EventHub</h1>
          <nav>
            <router-link to="/events" class="nav-link active">Événements</router-link>
            <router-link to="/dashboard" class="nav-link">Dashboard</router-link>
            <button @click="logout" class="btn-logout">Déconnexion</button>
          </nav>
        </div>
      </div>
    </header>

    <main class="container">
      <div class="toolbar">
        <div class="search-box">
          <input
            v-model="filters.search"
            @input="loadEvents"
            type="text"
            placeholder="Rechercher un événement..."
          />
        </div>
        
        <div class="filter-group">
          <select v-model="selectedStatus" @change="filterByStatus">
            <option value="all">Tous les statuts</option>
            <option value="upcoming">À venir</option>
            <option value="ongoing">En cours</option>
            <option value="completed">Terminés</option>
            <option value="cancelled">Annulés</option>
          </select>
        </div>

        <button @click="showCreateModal = true" class="btn-primary">+ Nouvel événement</button>
      </div>

      <div v-if="loading" class="loading">Chargement...</div>

      <div v-else class="event-grid">
        <div v-for="event in displayedEvents" :key="event.id" class="event-card">
          <div class="event-header">
            <h3>{{ event.title }}</h3>
            <span :class="['status-badge', `status-${event.status}`]">
              {{ statusLabels[event.status] }}
            </span>
          </div>
          <p class="event-description">{{ event.description }}</p>
          <div class="event-details">
            <div class="detail">
              <span class="icon">📍</span>
              <span>{{ event.location }}</span>
            </div>
            <div class="detail">
              <span class="icon">📅</span>
              <span>{{ formatDate(event.event_date) }}</span>
            </div>
            <div class="detail">
              <span class="icon">👥</span>
              <span>{{ event.attendee_count || 0 }} / {{ event.max_attendees }} participants</span>
            </div>
          </div>
          <button 
            @click="rsvpToEvent(event.id)" 
            class="btn-rsvp"
            :disabled="(event.attendee_count ?? 0) >= event.max_attendees"
          >
            {{ (event.attendee_count ?? 0) >= event.max_attendees ? 'Complet' : 'S\'inscrire' }}
          </button>
        </div>
      </div>

      <p v-if="!loading && displayedEvents.length === 0" class="no-events">
        Aucun événement trouvé
      </p>
    </main>

    <div v-if="showCreateModal" class="modal" @click.self="showCreateModal = false">
      <div class="modal-content">
        <h2>Créer un événement</h2>
        <form @submit.prevent="createEvent">
          <div class="form-group">
            <label>Titre</label>
            <input v-model="newEvent.title" required />
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="newEvent.description" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>Lieu</label>
            <input v-model="newEvent.location" required />
          </div>
          <div class="form-group">
            <label>Date</label>
            <input v-model="newEvent.event_date" type="datetime-local" required />
          </div>
          <div class="form-group">
            <label>Nombre max de participants</label>
            <input v-model="newEvent.max_attendees" type="number" min="1" />
          </div>
          <div class="modal-actions">
            <button type="button" @click="showCreateModal = false" class="btn-cancel">Annuler</button>
            <button type="submit" class="btn-primary">Créer</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'

interface Event {
  id: number
  title: string
  description: string
  location: string
  event_date: string
  max_attendees: number
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  attendee_count?: number
}

const router = useRouter()

const events = ref<Event[]>([])
const loading = ref(false)
const showCreateModal = ref(false)
const selectedStatus = ref('all')

const filters = ref({
  status: '',
  search: ''
})

const newEvent = ref({
  title: '',
  description: '',
  location: '',
  event_date: '',
  max_attendees: 100
})

const statusLabels: Record<string, string> = {
  upcoming: 'À venir',
  ongoing: 'En cours',
  completed: 'Terminé',
  cancelled: 'Annulé'
}

const heavyComputation = () => {
  const start = performance.now()
  let result = 0
  
  for (let i = 0; i < 15000000; i++) {
    result += Math.sqrt(i) * Math.random()
  }
  
  const end = performance.now()
  console.log(`Heavy computation took ${end - start}ms`)
  return result
}

const displayedEvents = computed(() => {
  let result = events.value

  heavyComputation()

  if (selectedStatus.value !== 'all') {
    result = result.filter((e) => e.status === selectedStatus.value)

    result = result.map((e) => ({ ...e }))
    result.forEach(event => {
      const _ = JSON.parse(JSON.stringify(event))
    })
  }

  if (filters.value.search) {
    result = result.filter((e) =>
      e.title.toLowerCase().includes(filters.value.search.toLowerCase())
    )
  }

  return result
})

const loadEvents = async () => {
  try {
    loading.value = true
    
    const params: any = {}
    if (filters.value.status) params.status = filters.value.status
    if (filters.value.search) params.search = filters.value.search
    
    const response = await api.get('/events', { params })
    events.value = response.data
  } catch (error) {
    console.error('Error loading events:', error)
  } finally {
    loading.value = false
  }
}

const filterByStatus = () => {
  filters.value.status = selectedStatus.value === 'all' ? '' : selectedStatus.value
  loadEvents()
}

const createEvent = async () => {
  try {
    await api.post('/events', newEvent.value)
    showCreateModal.value = false
    newEvent.value = {
      title: '',
      description: '',
      location: '',
      event_date: '',
      max_attendees: 100
    }
    await loadEvents()
  } catch (error: any) {
    alert(error.response?.data?.error || 'Erreur lors de la création')
  }
}

const rsvpToEvent = async (eventId: number) => {
  try {
    await api.post(`/events/${eventId}/rsvp`)
    alert('Inscription confirmée !')
    await loadEvents()
  } catch (error: any) {
    alert(error.response?.data?.error || 'Erreur lors de l\'inscription')
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

onMounted(() => {
  heavyComputation()
  loadEvents()
})
</script>

<style scoped>
.event-list-view {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 20px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h1 {
  color: #667eea;
  margin: 0;
}

nav {
  display: flex;
  gap: 15px;
  align-items: center;
}

.nav-link {
  color: #666;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.3s;
}

.nav-link:hover {
  background: #f0f0f0;
}

.nav-link.active {
  background: #667eea;
  color: white;
}

.btn-logout {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-logout:hover {
  background: #f5f5f5;
}

.toolbar {
  margin: 30px 0 20px;
  display: flex;
  gap: 15px;
  align-items: center;
}

.search-box {
  flex: 1;
}

.search-box input,
.filter-group select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.filter-group select {
  min-width: 180px;
}

.btn-primary {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.event-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.event-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.event-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 12px;
}

.event-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.status-upcoming {
  background: #e3f2fd;
  color: #1976d2;
}

.status-ongoing {
  background: #e8f5e9;
  color: #388e3c;
}

.status-completed {
  background: #f3e5f5;
  color: #7b1fa2;
}

.status-cancelled {
  background: #ffebee;
  color: #c62828;
}

.event-description {
  color: #666;
  margin-bottom: 15px;
  font-size: 14px;
}

.event-details {
  margin-bottom: 15px;
}

.detail {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
}

.icon {
  font-size: 16px;
}

.btn-rsvp {
  width: 100%;
  padding: 10px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-rsvp:hover:not(:disabled) {
  background: #5568d3;
}

.btn-rsvp:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.no-events {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 16px;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 25px;
}

.btn-cancel {
  flex: 1;
  padding: 10px;
  background: #f5f5f5;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}
</style>
