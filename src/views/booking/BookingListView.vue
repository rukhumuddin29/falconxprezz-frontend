<template>
  <div class="dashboard-shell">
    <div class="hero">
      <div class="hero-content">
        <div>
          <p class="eyebrow">Bookings</p>
          <h2 class="hero-title">{{ heading }}</h2>
        </div>
      </div>
    </div>

    <Card class="panel glassy">
      <template #content>
        <div class="toolbar">
          <div>
            <h4 class="m-0">{{ heading }}</h4>
            <p class="muted small">Showing {{ meta.total || 0 }} bookings</p>
          </div>
          <div class="toolbar-actions">
            <div class="search-box">
              <i class="pi pi-search"></i>
              <input v-model="search" type="text" placeholder="Search by reference, manual ID, or consignee" />
            </div>
            <select class="pager-select" v-model.number="perPage">
              <option v-for="size in [10, 20, 50]" :key="size" :value="size">{{ size }} / page</option>
            </select>
          </div>
        </div>

        <div class="table-wrap">
          <table class="fx-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Booking Type</th>
                <th>Courier</th>
          <th>Pieces</th>
          <th>Charged Wt.</th>
          <th>Payable</th>
          <th>Consignee</th>
          <th>Created</th>
          <th width="80">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td colspan="8" class="muted">Loading bookings...</td>
        </tr>
        <tr v-else-if="bookings.length === 0">
          <td colspan="8" class="muted">No bookings found.</td>
        </tr>
        <tr v-for="item in bookings" :key="item.id">
                <td class="dark-text">{{ item.booking_reference || item.manual_booking_id || '--' }}</td>
                <td>{{ item.booking_type || '--' }}</td>
                <td>{{ item.service_provider || '--' }}</td>
          <td>{{ item.number_pieces ?? 0 }}</td>
          <td>{{ formatNumber(item.charged_weight) }}</td>
          <td>{{ formatCurrency(item.payable_amount) }}</td>
          <td>{{ item.consignee || '--' }}</td>
          <td>{{ formatDate(item.created_at) }}</td>
          <td>
            <button class="pill-btn ghost sm round-btn" title="View" @click="goToDetail(item.id)">
              <i class="pi pi-chevron-right"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
        </div>

        <div class="pagination" v-if="meta.total > perPage">
          <div class="muted">Page {{ page }} of {{ totalPages }}</div>
          <div class="pager">
            <button class="pager-btn" :disabled="page === 1" @click="changePage(-1)"><span aria-hidden="true">‹</span></button>
            <span class="pager-page">Page {{ page }} / {{ totalPages }}</span>
            <button class="pager-btn" :disabled="page === totalPages" @click="changePage(1)"><span aria-hidden="true">›</span></button>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api/http'

const route = useRoute()
const router = useRouter()
const bookingTypes = ref([])
const bookings = ref([])
const loading = ref(false)
const search = ref('')
const page = ref(1)
const perPage = ref(10)
const meta = reactive({
  total: 0,
  current_page: 1,
})

const currentTypeId = computed(() => {
  const raw = route.params.typeId
  return raw ? Number(raw) : null
})

const currentType = computed(() => bookingTypes.value.find((bt) => bt.id === currentTypeId.value))
const heading = computed(() => (currentType.value?.title ? `${currentType.value.title} Bookings` : 'Bookings'))
const totalPages = computed(() => Math.max(1, Math.ceil((meta.total || 0) / (perPage.value || 1))))

let searchDebounce

const formatNumber = (val) => {
  const n = Number(val)
  return Number.isFinite(n) ? n.toFixed(2) : '--'
}

const formatCurrency = (val) => {
  const n = Number(val)
  return Number.isFinite(n) ? `₹ ${n.toFixed(2)}` : '--'
}

const formatDate = (val) => {
  if (!val) return '--'
  const d = new Date(val)
  if (Number.isNaN(d.getTime())) return val
  return d.toLocaleString()
}

const fetchBookingTypes = async () => {
  try {
    const { data } = await api.get('/booking-types')
    bookingTypes.value = (data.data || []).filter((bt) => bt.status ?? bt.is_active ?? 1)
  } catch {
    bookingTypes.value = []
  }
}

const fetchBookings = async () => {
  loading.value = true
  try {
    const params = {
      page: page.value,
      per_page: perPage.value,
    }
    if (currentTypeId.value) {
      params.booking_type_id = currentTypeId.value
    }
    if (search.value) {
      params.search = search.value
    }
    const { data } = await api.get('/bookings', { params })
    const list = data.data || []
    const pagination = data.meta || {}
    bookings.value = list
    meta.total = pagination.total ?? list.length ?? 0
    meta.current_page = pagination.current_page ?? page.value
    perPage.value = pagination.per_page ?? perPage.value
    page.value = pagination.current_page ?? page.value
  } catch {
    bookings.value = []
    meta.total = 0
    meta.current_page = 1
  } finally {
    loading.value = false
  }
}

const changePage = (delta) => {
  const next = page.value + delta
  if (next < 1 || next > totalPages.value) return
  page.value = next
  fetchBookings()
}

const goToDetail = (id) => {
  router.push({ name: 'bookings.show', params: { id } })
}

watch(
  () => currentTypeId.value,
  () => {
    page.value = 1
    fetchBookings()
  }
)

watch(perPage, () => {
  page.value = 1
  fetchBookings()
})

watch(search, () => {
  clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => {
    page.value = 1
    fetchBookings()
  }, 300)
})

onMounted(() => {
  fetchBookingTypes()
  fetchBookings()
})

onUnmounted(() => {
  clearTimeout(searchDebounce)
})
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box i {
  position: absolute;
  left: 0.75rem;
  color: #7b88a8;
}

.search-box input {
  padding: 0.6rem 0.75rem 0.6rem 2.2rem;
  border-radius: 10px;
  border: 1px solid #e2e8f5;
  background: #f8f9fc;
  min-width: 280px;
}

.table-wrap {
  border: 1px solid #e2e8f5;
  border-radius: 12px;
  overflow: hidden;
}

.fx-table {
  width: 100%;
  border-collapse: collapse;
}

.fx-table thead {
  background: #f5f7fb;
}

.fx-table th,
.fx-table td {
  padding: 0.85rem 1rem;
  text-align: left;
  border-bottom: 1px solid #e9eef7;
  font-size: 0.95rem;
}

.fx-table th {
  font-weight: 700;
  color: #495065;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.04em;
}

.fx-table tbody tr:last-child td {
  border-bottom: none;
}

.muted {
  color: #8b95b1;
}

.dark-text {
  color: #0f172a;
  font-weight: 600;
}

.panel {
  margin-top: 1rem;
}

.pagination {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.pager {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pager-btn {
  border: 1px solid #dce3f4;
  border-radius: 8px;
  background: #fff;
  padding: 0.4rem 0.6rem;
  min-width: 36px;
}

.pager-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pager-page {
  font-weight: 600;
  color: #1a2745;
}

.pager-select {
  border-radius: 8px;
  border: 1px solid #dce3f4;
  padding: 0.35rem 0.5rem;
  background: #fff;
}

.success-ref strong {
  color: #0f62fe;
}

.round-btn {
  border-radius: 999px;
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}
</style>
