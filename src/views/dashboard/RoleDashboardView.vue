<template>
  <div class="dashboard-shell">
    <div class="hero">
      <div class="hero-content">
        <div>
          <p class="eyebrow">Dashboard</p>
          <h2 class="hero-title">{{ title }} space</h2>
        </div>
        <span class="pill">
          <i class="pi pi-sparkles me-2"></i>
          {{ highlight }}
        </span>
      </div>
    </div>

    <Card class="panel glassy">
      <div class="panel-grid">
        <div class="panel-block">
          <p class="label">Signed in as</p>
          <h3 class="stat-value">{{ userName }}</h3>
          <p class="muted">Username: {{ username }}</p>
        </div>
        <div class="panel-block roles-block">
          <p class="label">Roles</p>
          <div class="chip-row">
            <span v-for="role in roles" :key="role" class="chip">{{ role }}</span>
          </div>
        </div>
      </div>
    </Card>

    <Card class="panel glassy">
      <div class="panel-grid">
        <div v-if="isSuper && stats" class="panel-block stat-card">
          <div class="card-header">
            <p class="label">App Users</p>
          </div>
          <div class="stat-row two-cols">
            <div>
              <p class="sub-label">Users</p>
              <h3 class="stat-value">{{ stats.users?.users ?? '—' }}</h3>
            </div>
            <div>
              <p class="sub-label">Vendors</p>
              <h3 class="stat-value">{{ stats.users?.vendors ?? '—' }}</h3>
            </div>
          </div>
          <div class="stat-row two-cols">
            <div>
              <p class="sub-label">Agents</p>
              <h3 class="stat-value">{{ stats.users?.agents ?? '—' }}</h3>
            </div>
            <div>
              <p class="sub-label">Franchise</p>
              <h3 class="stat-value">{{ stats.users?.franchise ?? '—' }}</h3>
            </div>
          </div>
        </div>

        <div v-else-if="isAdmin && stats" class="panel-block stat-card">
          <div class="card-header">
            <p class="label">Team</p>
          </div>
          <div class="stat-row">
            <div>
              <p class="sub-label">Agents</p>
              <h3 class="stat-value">{{ stats.users?.agents ?? '—' }}</h3>
            </div>
          </div>
        </div>

        <div v-if="stats" class="panel-block stat-card">
          <div class="card-header">
            <p class="label">Bookings</p>
          </div>
          <div class="stat-row three-cols">
            <div>
              <p class="sub-label">International</p>
              <h3 class="stat-value">{{ stats.counts?.international ?? '—' }}</h3>
            </div>
            <div>
              <p class="sub-label">Domestic</p>
              <h3 class="stat-value">{{ stats.counts?.domestic ?? '—' }}</h3>
            </div>
            <div>
              <p class="sub-label">Cargo</p>
              <h3 class="stat-value">{{ stats.counts?.cargo ?? '—' }}</h3>
            </div>
          </div>
        </div>

        <div v-if="stats" class="panel-block stat-card">
          <div class="card-header">
            <p class="label">Total Revenue</p>
          </div>
          <div class="stat-row three-cols">
            <div>
              <p class="sub-label">Today</p>
              <h3 class="stat-value">₹ {{ (stats.revenue?.today ?? 0).toLocaleString() }}</h3>
            </div>
            <div>
              <p class="sub-label">Month</p>
              <h3 class="stat-value">₹ {{ (stats.revenue?.month ?? 0).toLocaleString() }}</h3>
            </div>
            <div>
              <p class="sub-label">Year</p>
              <h3 class="stat-value">₹ {{ (stats.revenue?.year ?? 0).toLocaleString() }}</h3>
            </div>
          </div>
        </div>
      </div>
      <p v-if="loading" class="muted small">Loading stats...</p>
    </Card>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/api/http'

const props = defineProps({
  title: { type: String, default: 'Dashboard' },
  highlight: { type: String, default: 'Overview' },
})

const auth = useAuthStore()

const userName = computed(() => auth.user?.name || 'User')
const username = computed(() => auth.user?.username || 'FX----')
const roles = computed(() => auth.roles.length ? auth.roles : ['unassigned'])

const stats = ref(null)
const loading = ref(false)
const isSuper = computed(() => auth.hasRole(['super_admin']))
const isAdmin = computed(() => auth.hasRole(['admin']) && !isSuper.value)
const isAgentOrVendor = computed(() => auth.hasRole(['agent']) || auth.hasRole(['vendor']))

const fetchStats = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/dashboard/stats')
    stats.value = data
  } catch (e) {
    stats.value = null
  } finally {
    loading.value = false
  }
}

onMounted(fetchStats)
</script>

<style scoped>
.dashboard-shell {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.hero {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.78), rgba(255, 255, 255, 0.6));
  border: 1px solid rgba(15, 37, 83, 0.06);
  border-radius: 18px;
  padding: 1.1rem 1.25rem;
  box-shadow: 0 14px 60px rgba(12, 24, 52, 0.08);
}

.hero-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.hero-title {
  margin: 0;
  font-size: 1.75rem;
  letter-spacing: -0.01em;
}

.eyebrow {
  margin: 0 0 0.15rem;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  color: #6b758f;
  font-weight: 700;
}

.panel {
  width: 100%;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 18px;
  border: 1px solid rgba(15, 37, 83, 0.06);
  box-shadow: 0 18px 70px rgba(12, 24, 52, 0.06);
}

.panel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
}

.panel-block {
  border: 1px solid rgba(12, 24, 52, 0.08);
  border-radius: 14px;
  padding: 1rem;
  background: #f8fbff;
}

.roles-block {
  background: #f4f6ff;
}

.label {
  margin: 0 0 0.2rem;
  color: #6b758f;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.75rem;
}

.pill {
  display: inline-flex;
  align-items: center;
  padding: 0.55rem 0.85rem;
  border-radius: 999px;
  background: rgba(15, 98, 254, 0.08);
  color: #0b2443;
  border: 1px solid rgba(15, 98, 254, 0.2);
  font-weight: 700;
}

.stat-value {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 800;
  color: #0f1f3d;
}

.chip-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.35rem;
}

.stat-card {
  background: #f9fbff;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.stat-row {
  display: grid;
  gap: 0.75rem;
}

.stat-row.two-cols {
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
}

.stat-row.three-cols {
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
}

.sub-label {
  margin: 0;
  color: #6b758f;
  font-weight: 600;
  font-size: 0.9rem;
}

.stat-value {
  margin: 0.1rem 0 0.25rem;
}

.chip {
  padding: 0.35rem 0.65rem;
  border-radius: 999px;
  background: #eef2ff;
  border: 1px solid #d6defb;
  color: #1b2655;
  font-weight: 700;
  font-size: 0.9rem;
}

.muted {
  margin: 0.25rem 0 0;
  color: #6b758f;
}

@media (max-width: 768px) {
  .hero {
    padding: 1rem;
  }

  .panel {
    padding: 1.1rem;
  }
}
</style>
