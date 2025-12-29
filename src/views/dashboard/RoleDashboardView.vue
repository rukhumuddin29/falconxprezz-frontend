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
      <Divider />
      <p class="muted">
        Use the left navigation to access parcels, pickups, users, roles, and reporting modules. Each dashboard will expose widgets
        tailored to its role group.
      </p>
    </Card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  title: { type: String, default: 'Dashboard' },
  highlight: { type: String, default: 'Overview' },
})

const auth = useAuthStore()

const userName = computed(() => auth.user?.name || 'User')
const username = computed(() => auth.user?.username || 'FX----')
const roles = computed(() => auth.roles.length ? auth.roles : ['unassigned'])
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
