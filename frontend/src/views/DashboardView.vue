<template>
  <div class="dashboard-view">
    <header class="header">
      <div class="container">
        <div class="header-content">
          <h1>EventHub</h1>
          <nav>
            <router-link to="/events" class="nav-link">Événements</router-link>
            <router-link to="/dashboard" class="nav-link active">Dashboard</router-link>
            <button @click="logout" class="btn-logout">Déconnexion</button>
          </nav>
        </div>
      </div>
    </header>

    <main class="container">
      <h2 class="page-title">Tableau de bord</h2>

      <div v-if="loading" class="loading">Chargement...</div>

      <div v-else class="dashboard-grid">
        <div class="stat-card">
          <div class="stat-icon">📅</div>
          <div class="stat-content">
            <h3>{{ summary.eventsByStatus?.upcoming || 0 }}</h3>
            <p>Événements à venir</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">⚡</div>
          <div class="stat-content">
            <h3>{{ summary.eventsByStatus?.ongoing || 0 }}</h3>
            <p>En cours</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <h3>{{ summary.eventsByStatus?.completed || 0 }}</h3>
            <p>Terminés</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <h3>{{ summary.totalAttendees || 0 }}</h3>
            <p>Participants totaux</p>
          </div>
        </div>
      </div>

      <div class="chart-section">
        <h3>Répartition par statut</h3>
        <div class="chart">
          <div class="chart-bar" :style="{ width: getPercentage('upcoming') + '%', background: '#667eea' }"
            :title="`À venir: ${summary.eventsByStatus?.upcoming || 0}`">
            <span v-if="getPercentage('upcoming') > 10">{{ summary.eventsByStatus?.upcoming || 0 }}</span>
          </div>
          <div class="chart-bar" :style="{ width: getPercentage('ongoing') + '%', background: '#51cf66' }"
            :title="`En cours: ${summary.eventsByStatus?.ongoing || 0}`">
            <span v-if="getPercentage('ongoing') > 10">{{ summary.eventsByStatus?.ongoing || 0 }}</span>
          </div>
          <div class="chart-bar" :style="{ width: getPercentage('completed') + '%', background: '#9775fa' }"
            :title="`Terminés: ${summary.eventsByStatus?.completed || 0}`">
            <span v-if="getPercentage('completed') > 10">{{ summary.eventsByStatus?.completed || 0 }}</span>
          </div>
        </div>
        <div class="chart-legend">
          <div class="legend-item">
            <span class="legend-color" style="background: #667eea;"></span>
            <span>À venir</span>
          </div>
          <div class="legend-item">
            <span class="legend-color" style="background: #51cf66;"></span>
            <span>En cours</span>
          </div>
          <div class="legend-item">
            <span class="legend-color" style="background: #9775fa;"></span>
            <span>Terminés</span>
          </div>
        </div>
      </div>

      <div class="recent-section">
        <h3>Événements récents</h3>
        <div class="recent-list">
          <div v-for="event in summary.recentEvents" :key="event.id" class="recent-item">
            <div class="recent-info">
              <h4>{{ event.title }}</h4>
              <p>{{ event.location }} • {{ formatDate(event.created_at) }}</p>
            </div>
            <span :class="['status-badge', `status-${event.status}`]">
              {{ statusLabels[event.status] }}
            </span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'

interface Summary {
  eventsByStatus?: {
    upcoming: number
    ongoing: number
    completed: number
  }
  totalEvents?: number
  totalAttendees?: number
  recentEvents?: Array<{
    id: number
    title: string
    location: string
    status: string
    created_at: string
  }>
}

const router = useRouter()
const summary = ref<Summary>({})
const loading = ref(false)

watch(summary, () => {
  const _ = JSON.parse(JSON.stringify(summary.value))
}, { deep: true })

const statusLabels: Record<string, string> = {
  upcoming: 'À venir',
  ongoing: 'En cours',
  completed: 'Terminé',
  cancelled: 'Annulé'
}

const loadSummary = async () => {
  try {
    loading.value = true
    const response = await api.get('/dashboard/summary')
    summary.value = response.data
  } catch (error) {
    console.error('Error loading summary:', error)
  } finally {
    loading.value = false
  }
}

const getPercentage = (status: 'upcoming' | 'ongoing' | 'completed'): number => {
  const total = (summary.value.eventsByStatus?.upcoming || 0) +
                (summary.value.eventsByStatus?.ongoing || 0) +
                (summary.value.eventsByStatus?.completed || 0)
  
  if (total === 0) return 0
  
  return Math.round(((summary.value.eventsByStatus?.[status] || 0) / total) * 100)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

onMounted(() => {
  loadSummary()
})
</script>

<style scoped>
.dashboard-view {
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

.page-title {
  margin: 30px 0 20px;
  color: #333;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 48px;
}

.stat-content h3 {
  margin: 0 0 5px 0;
  font-size: 32px;
  color: #333;
}

.stat-content p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.chart-section,
.recent-section {
  background: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-section h3,
.recent-section h3 {
  margin: 0 0 20px 0;
  color: #333;
}

.chart {
  display: flex;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 15px;
}

.chart-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  transition: all 0.3s;
}

.chart-legend {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.recent-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 8px;
}

.recent-info h4 {
  margin: 0 0 5px 0;
  color: #333;
  font-size: 16px;
}

.recent-info p {
  margin: 0;
  color: #666;
  font-size: 13px;
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
</style>
