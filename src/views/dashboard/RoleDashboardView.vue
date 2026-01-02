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

    <div class="panel-grid bare-grid">
      <div v-if="isSuper" class="panel-block stat-card">
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

      <div v-else-if="isAdmin" class="panel-block stat-card">
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

      <div class="panel-block stat-card">
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

      <div class="panel-block stat-card">
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

    <div v-if="isSuper" class="wide-row super">
      <div class="panel glassy flex-8">
        <div class="card-header">
          <p class="label">Recent Bookings</p>
          <div class="filter-select" @click="bookingTypeOpen = !bookingTypeOpen">
            <div class="select-display">
              <span>{{ bookingTypeLabel || 'All types' }}</span>
              <i :class="['pi', bookingTypeOpen ? 'pi-chevron-up' : 'pi-chevron-down']"></i>
            </div>
            <div v-if="bookingTypeOpen" class="select-dropdown">
              <div class="select-option" @click.stop="selectBookingType(null)">All types</div>
              <div
                v-for="bt in bookingTypes"
                :key="bt.id"
                class="select-option"
                @click.stop="selectBookingType(bt)"
              >
                {{ bt.title }}
              </div>
            </div>
          </div>
        </div>
        <div class="table-wrap">
          <table class="fx-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Type</th>
                <th>Courier</th>
                <th>Consignee</th>
                <th>Phone</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="recentLoading">
                <td colspan="6" class="muted">Loading bookings...</td>
              </tr>
              <tr v-else-if="recentBookings.length === 0">
                <td colspan="6" class="muted">No bookings found.</td>
              </tr>
              <tr v-for="item in recentBookings" :key="item.id">
                <td>
                  <button class="link-btn" v-if="item.reference" @click="goToBooking(item.id)">
                    {{ item.reference }}
                  </button>
                  <span v-else>{{ item.manual_booking_id || '--' }}</span>
                </td>
                <td>{{ item.booking_type || '--' }}</td>
                <td>{{ item.service_provider || '--' }}</td>
                <td>{{ item.consignee || '--' }}</td>
                <td>{{ item.consignee_phone || '--' }}</td>
                <td class="actions-cell">
                  <span class="muted">{{ formatDate(item.created_at) }}</span>
                  <button class="pill-btn ghost sm round-btn" title="View" @click="goToBooking(item.id)">
                    <i class="pi pi-chevron-right"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="panel glassy flex-4">
        <div class="card-header">
          <p class="label">Recent Users</p>
          <div class="filter-select" @click="roleFilterOpen = !roleFilterOpen">
            <div class="select-display">
              <span>{{ roleFilterLabel || 'All roles' }}</span>
              <i :class="['pi', roleFilterOpen ? 'pi-chevron-up' : 'pi-chevron-down']"></i>
            </div>
            <div v-if="roleFilterOpen" class="select-dropdown">
              <div class="select-option" @click.stop="selectRoleFilter(null)">All roles</div>
              <div
                v-for="role in roleOptions"
                :key="role.value"
                class="select-option"
                @click.stop="selectRoleFilter(role)"
              >
                {{ role.label }}
              </div>
            </div>
          </div>
        </div>
        <div class="table-wrap">
          <table class="fx-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Roles</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="recentLoading">
                <td colspan="4" class="muted">Loading users...</td>
              </tr>
              <tr v-else-if="recentUsers.length === 0">
                <td colspan="4" class="muted">No users found.</td>
              </tr>
              <tr v-for="u in recentUsers" :key="u.id">
                <td>{{ u.name || '--' }}</td>
                <td>{{ u.username || '--' }}</td>
                <td>{{ u.roles?.join(', ') || '--' }}</td>
                <td>{{ formatDateOnly(u.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-else class="wide-row single">
      <div class="panel glassy">
        <div class="card-header">
          <p class="label">Recent Bookings</p>
          <div class="filter-select" @click="bookingTypeOpen = !bookingTypeOpen">
            <div class="select-display">
              <span>{{ bookingTypeLabel || 'All types' }}</span>
              <i :class="['pi', bookingTypeOpen ? 'pi-chevron-up' : 'pi-chevron-down']"></i>
            </div>
            <div v-if="bookingTypeOpen" class="select-dropdown">
              <div class="select-option" @click.stop="selectBookingType(null)">All types</div>
              <div
                v-for="bt in bookingTypes"
                :key="bt.id"
                class="select-option"
                @click.stop="selectBookingType(bt)"
              >
                {{ bt.title }}
              </div>
            </div>
          </div>
        </div>
        <div class="table-wrap">
          <table class="fx-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Type</th>
                <th>Courier</th>
                <th>Consignee</th>
                <th>Phone</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="recentLoading">
                <td colspan="6" class="muted">Loading bookings...</td>
              </tr>
              <tr v-else-if="recentBookings.length === 0">
                <td colspan="6" class="muted">No bookings found.</td>
              </tr>
              <tr v-for="item in recentBookings" :key="item.id">
                <td>
                  <button class="link-btn" v-if="item.reference" @click="goToBooking(item.id)">
                    {{ item.reference }}
                  </button>
                  <span v-else>{{ item.manual_booking_id || '--' }}</span>
                </td>
                <td>{{ item.booking_type || '--' }}</td>
                <td>{{ item.service_provider || '--' }}</td>
                <td>{{ item.consignee || '--' }}</td>
                <td>{{ item.consignee_phone || '--' }}</td>
                <td class="actions-cell">
                  <span class="muted">{{ formatDate(item.created_at) }}</span>
                  <button class="pill-btn ghost sm round-btn" title="View" @click="goToBooking(item.id)">
                    <i class="pi pi-chevron-right"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="wide-row charts-row">
      <div class="panel glassy">
        <div class="card-header">
          <p class="label">Bookings</p>
        </div>
        <div class="chart-wrap">
          <Chart type="bar" :data="bookingsChartData" :options="chartOptions" />
        </div>
      </div>
      <div class="panel glassy">
        <div class="card-header">
          <p class="label">Revenue (FY)</p>
        </div>
        <div class="chart-wrap">
          <Chart type="line" :data="revenueChart" :options="chartOptions" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/api/http'
import { useRouter } from 'vue-router'
import Chart from 'primevue/chart'

const props = defineProps({
  title: { type: String, default: 'Dashboard' },
  highlight: { type: String, default: 'Overview' },
})

const router = useRouter()
const auth = useAuthStore()

const userName = computed(() => auth.user?.name || 'User')
const username = computed(() => auth.user?.username || 'FX----')
const roles = computed(() => (auth.roles.length ? auth.roles : ['unassigned']))

const defaultStats = () => ({
  counts: { international: 0, domestic: 0, cargo: 0 },
  revenue: { today: 0, month: 0, year: 0 },
  users: { users: 0, vendors: 0, agents: 0, franchise: 0 },
})

const stats = ref(defaultStats())
const loading = ref(false)
const recentLoading = ref(false)
const isSuper = computed(() => auth.hasRole(['super_admin']))
const recentBookings = ref([])
const recentUsers = ref([])
const bookingTypes = ref([])
const bookingTypeOpen = ref(false)
const selectedBookingType = ref(null)
const roleOptions = ref([])
const roleFilterOpen = ref(false)
const selectedRole = ref(null)
const bookingsChartRaw = ref(null)
const revenueChartRaw = ref({ labels: [], series: [] })

const fetchStats = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/dashboard/stats')
    stats.value = {
      counts: { international: 0, domestic: 0, cargo: 0, ...(data?.counts || {}) },
      revenue: { today: 0, month: 0, year: 0, ...(data?.revenue || {}) },
      users: { users: 0, vendors: 0, agents: 0, franchise: 0, ...(data?.users || {}) },
    }
  } catch (e) {
    stats.value = defaultStats()
  } finally {
    loading.value = false
  }
}

const fetchRecent = async () => {
  recentLoading.value = true
  try {
    const params = {}
    if (selectedBookingType.value) {
      params.booking_type_id = selectedBookingType.value.id
    }
    if (selectedRole.value) {
      params.role = selectedRole.value.value
    }
    const { data } = await api.get('/dashboard/recent', { params })
    recentBookings.value = data.bookings || []
    recentUsers.value = data.users || []
  } catch {
    recentBookings.value = []
    recentUsers.value = []
  } finally {
    recentLoading.value = false
  }
}

const fetchCharts = async () => {
  try {
    const { data } = await api.get('/dashboard/charts')
    bookingsChartRaw.value = data.bookings_chart || null
    revenueChartRaw.value = data.revenue_by_month || { labels: [], series: [] }
  } catch {
    bookingsChartRaw.value = null
    revenueChartRaw.value = { labels: [], series: [] }
  }
}

const fetchBookingTypes = async () => {
  try {
    const { data } = await api.get('/booking-types')
    bookingTypes.value = (data.data || []).filter((bt) => bt.status ?? bt.is_active ?? 1)
  } catch {
    bookingTypes.value = []
  }
}

const fetchRoleOptions = async () => {
  try {
    const { data } = await api.get('/roles')
    roleOptions.value = (data.data || data || []).map((r) => ({
      label: r.name || r.title || r.slug,
      value: r.slug || r.name || r.id,
    }))
  } catch {
    roleOptions.value = []
  }
}

const bookingTypeLabel = computed(() => selectedBookingType.value?.title || '')
const roleFilterLabel = computed(() => selectedRole.value?.label || '')

const selectBookingType = (bt) => {
  selectedBookingType.value = bt
  bookingTypeOpen.value = false
  fetchRecent()
}

const selectRoleFilter = (role) => {
  selectedRole.value = role
  roleFilterOpen.value = false
  fetchRecent()
}

const formatDate = (val) => {
  if (!val) return '--'
  const d = new Date(val)
  if (Number.isNaN(d.getTime())) return val
  return d.toLocaleString()
}

const formatDateOnly = (val) => {
  if (!val) return '--'
  const d = new Date(val)
  if (Number.isNaN(d.getTime())) return val
  return d.toLocaleDateString()
}

onMounted(() => {
  fetchStats()
  fetchRecent()
  fetchBookingTypes()
  fetchRoleOptions()
  fetchCharts()
})

const bookingsChartData = computed(() => ({
  labels: bookingsChartRaw.value?.labels || [],
  datasets: (bookingsChartRaw.value?.series || []).map((s, idx) => ({
    label: s.label,
    data: s.data,
    backgroundColor: chartColors[idx % chartColors.length],
    borderColor: chartColors[idx % chartColors.length],
  })),
}))

const revenueChart = computed(() => ({
  labels: revenueChartRaw.value?.labels || [],
  datasets: (revenueChartRaw.value?.series || []).map((s, idx) => ({
    label: s.label,
    data: s.data,
    fill: true,
    tension: 0.35,
    borderColor: chartColors[idx % chartColors.length],
    backgroundColor: `${chartColors[idx % chartColors.length]}33`,
  })),
}))

const chartOptions = {
  plugins: {
    legend: { display: true },
  },
  responsive: true,
  maintainAspectRatio: false,
}

const chartColors = ['#4b7bec', '#20bf6b', '#f7b731', '#eb3b5a', '#8854d0']

const goToBooking = (id) => {
  router.push({ name: 'bookings.show', params: { id } })
}
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
  font-size: 1.25rem;
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

.bare-grid {
  margin-top: 1rem;
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
  font-weight: 600;
}

.hero-content .pill{
  font-size: 14px;
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

.stat-card {
  background: #f9fbff;
}

.wide-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.wide-row.super {
  grid-template-columns: 2fr 1fr;
}

.wide-row.super .flex-8,
.wide-row.super .flex-4 {
  grid-column: auto;
}

.charts-row {
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}

.chart-wrap {
  height: 280px;
}

.table-wrap {
  border: 1px solid #e2e8f5;
  border-radius: 12px;
  overflow: hidden;
  margin-top: 0.5rem;
}

.fx-table {
  width: 100%;
  border-collapse: collapse;
}

.fx-table th,
.fx-table td {
  padding: 0.85rem 1rem;
  text-align: left;
  border-bottom: 1px solid #e9eef7;
  font-size: 0.95rem;
}

.fx-table thead {
  background: #f5f7fb;
}

.fx-table tbody tr:last-child td {
  border-bottom: none;
}

.actions-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: space-between;
}

.round-btn {
  border-radius: 999px;
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.link-btn {
  background: none;
  border: none;
  color: #0f62fe;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
}

.link-btn:hover {
  text-decoration: underline;
}

.filter-select {
  position: relative;
  min-width: 180px;
}

.select-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #e2e8f5;
  border-radius: 10px;
  padding: 0.4rem 0.75rem;
  background: #fff;
  cursor: pointer;
  min-height: 38px;
}

.select-display span {
  color: #1a2745;
}

.select-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e2e8f5;
  border-radius: 10px;
  box-shadow: 0 12px 40px rgba(12, 24, 52, 0.08);
  z-index: 5;
  max-height: 260px;
  overflow-y: auto;
}

.select-option {
  padding: 0.55rem 0.75rem;
  cursor: pointer;
}

.select-option:hover {
  background: #f3f6ff;
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

.muted {
  margin: 0.25rem 0 0;
  color: #6b758f;
}

.super .panel.glassy {
    border-radius: 12px;
    padding: 15px 18px 25px 18px;
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
