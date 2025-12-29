<template>
  <div class="dashboard-shell">
    <div class="hero">
      <div>
        <p class="eyebrow">Pricing</p>
        <h2 class="hero-title">Rate Cards</h2>
      </div>
    </div>

    <div class="panel glassy">
      <div class="toolbar">
        <div class="btn-group">
          <button class="pill-btn" @click="openModal">
            <i class="pi pi-plus me-2"></i>
            New
          </button>
        </div>
        <div class="search-box">
          <i class="pi pi-search"></i>
          <input v-model="search" type="text" placeholder="Search rate cards..." @input="handleSearch" />
        </div>
      </div>

      <div class="table-wrap">
        <table class="fx-table">
          <thead>
            <tr>
              <th width="50">#</th>
              <th @click="setSort('package_type_name')" class="sortable">Package Type</th>
              <th @click="setSort('provider_name')" class="sortable">Provider</th>
              <th @click="setSort('zone_name')" class="sortable">Zone</th>
              <th @click="setSort('weight')" class="sortable">Weight</th>
              <th @click="setSort('price')" class="sortable">Price</th>
              <th @click="setSort('status')" class="sortable">Status</th>
              <th width="120">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="8" class="muted">Loading...</td>
            </tr>
            <tr v-else-if="!formattedRows.length">
              <td colspan="8" class="muted">No rate cards yet.</td>
            </tr>
            <tr v-for="row in formattedRows" :key="row.id">
              <td>{{ row.rowNum }}</td>
              <td>{{ row.package_type_name }}</td>
              <td>{{ row.provider_name }}</td>
              <td>{{ row.zone_name }}</td>
              <td>{{ row.weight }}</td>
              <td>{{ row.price }}</td>
              <td>
                <span :class="['status-chip', row.status ? 'on' : 'off']">
                  {{ row.status ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="actions-inline">
                <button class="pill-btn ghost sm" @click="edit(row)"><i class="pi pi-pencil"></i></button>
                <button class="pill-btn danger sm" @click="remove(row.id)"><i class="pi pi-trash"></i></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pagination">
      <div class="muted">Showing {{ rows.length }} of {{ meta.total }} rate cards</div>
      <div class="pager">
        <button class="pager-btn" :disabled="page === 1" @click="prevPage"><span aria-hidden="true">‹</span></button>
        <span class="pager-page">Page {{ page }} / {{ meta.last_page }}</span>
        <button class="pager-btn" :disabled="page === meta.last_page" @click="nextPage"><span aria-hidden="true">›</span></button>
        <div v-if="meta.total > 10" class="page-size">
          <select v-model.number="perPage" class="page-size-select" @change="changePerPage">
            <option v-for="size in [5,10,20,50]" :key="size" :value="size">{{ size }} / page</option>
          </select>
          <i class="pi pi-chevron-down caret"></i>
        </div>
      </div>
      </div>
    </div>

    <div v-if="showModal" class="modal-backdrop" @click.self="close">
      <div class="modal-card">
        <div class="modal-header">
          <h3>{{ form.id ? 'Edit Rate Card' : 'New Rate Card' }}</h3>
          <button class="ghost-btn" @click="close"><i class="pi pi-times"></i></button>
        </div>
        <div class="modal-body">
          <label class="field-label">Package Type</label>
          <select v-model="form.package_type_id" class="modal-input">
            <option value="">Select package</option>
            <option v-for="pkg in options.packages" :key="pkg.id" :value="pkg.id">{{ pkg.label }}</option>
          </select>

          <label class="field-label">Provider</label>
          <select v-model="form.provider_id" class="modal-input">
            <option value="">Select provider</option>
            <option v-for="p in options.providers" :key="p.id" :value="p.id">{{ p.label }}</option>
          </select>

          <label class="field-label">Zone</label>
          <select v-model="form.zone_id" class="modal-input">
            <option value="">Select zone</option>
            <option v-for="z in options.zones" :key="z.id" :value="z.id">{{ z.label }}</option>
          </select>

          <label class="field-label">Weight</label>
          <input v-model="form.weight" class="modal-input" type="text" min="0" step="0.01" />

          <label class="field-label">Price</label>
          <input v-model="form.price" class="modal-input" type="text" min="0" step="0.01" />

          <div class="toggle-row">
            <label class="field-label">Status</label>
            <label class="switch">
              <input type="checkbox" v-model="form.status" />
              <span class="slider"></span>
            </label>
          </div>
        </div>
        <div class="modal-actions">
          <button class="pill-btn ghost" @click="close">Cancel</button>
          <button class="pill-btn" @click="save">Save</button>
        </div>
      </div>
    </div>
    
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import api from '@/api/http'

const toast = useToast()

const rows = ref([])
const showModal = ref(false)
const loading = ref(false)
const page = ref(1)
const perPage = ref(10)
const meta = reactive({
  total: 0,
  last_page: 1,
})
const sortField = ref('id')
const sortDir = ref('desc')
const search = ref('')
const options = reactive({
  packages: [],
  providers: [],
  zones: [],
})

const form = reactive({
  id: null,
  package_type_id: '',
  provider_id: '',
  zone_id: '',
  weight: '',
  price: '',
  status: true,
})

const formattedRows = computed(() =>
  rows.value.map((r, idx) => ({
    ...r,
    rowNum: (page.value - 1) * perPage.value + idx + 1,
  })),
)

const fetchOptions = async () => {
  const [pkgRes, provRes, zoneRes] = await Promise.all([
    api.get('/package-types'),
    api.get('/service-providers'),
    api.get('/zones'),
  ])
  options.packages = (pkgRes.data.data || []).map((p) => ({ id: p.id, label: p.name }))
  options.providers = (provRes.data.data || []).map((p) => ({ id: p.id, label: p.title }))
  options.zones = (zoneRes.data.data || []).map((z) => ({ id: z.id, label: z.zone_name }))
}

const fetchCards = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/rate-cards', {
      params: {
        page: page.value,
        per_page: perPage.value,
        sort: sortField.value,
        dir: sortDir.value,
        q: search.value,
      },
    })
    rows.value = data.data || []
    meta.total = data.meta?.total || 0
    meta.last_page = data.meta?.last_page || 1
  } finally {
    loading.value = false
  }
}

const openModal = () => {
  reset()
  showModal.value = true
}

const edit = (row) => {
  form.id = row.id
  form.package_type_id = row.package_type_id
  form.provider_id = row.provider_id
  form.zone_id = row.zone_id
  form.weight = row.weight
  form.price = row.price
  form.status = !!row.status
  showModal.value = true
}

const close = () => {
  showModal.value = false
}

const reset = () => {
  form.id = null
  form.package_type_id = ''
  form.provider_id = ''
  form.zone_id = ''
  form.weight = ''
  form.price = ''
  form.status = true
}

const save = async () => {
  if (!form.package_type_id || !form.provider_id || !form.zone_id || !form.weight || !form.price) {
    toast.add({ severity: 'error', summary: 'Missing data', detail: 'All fields are required', life: 2000 })
    return
  }
  const payload = {
    package_type_id: form.package_type_id,
    provider_id: form.provider_id,
    zone_id: form.zone_id,
    weight: form.weight,
    price: form.price,
    status: form.status ? 1 : 0,
  }
  if (form.id) {
    await api.patch(`/rate-cards/${form.id}`, payload)
  } else {
    await api.post('/rate-cards', payload)
  }
  toast.add({ severity: 'success', summary: 'Saved', detail: 'Rate card saved', life: 2000 })
  await fetchCards()
  close()
}

const remove = async (id) => {
  await api.delete(`/rate-cards/${id}`)
  await fetchCards()
  toast.add({ severity: 'success', summary: 'Deleted', detail: 'Rate card removed', life: 1500 })
}

const setSort = (field) => {
  if (sortField.value === field) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDir.value = 'asc'
  }
  fetchCards()
}

const prevPage = () => {
  if (page.value > 1) {
    page.value -= 1
    fetchCards()
  }
}

const nextPage = () => {
  if (page.value < meta.last_page) {
    page.value += 1
    fetchCards()
  }
}

const changePerPage = () => {
  page.value = 1
  fetchCards()
}

const handleSearch = () => {
  page.value = 1
  fetchCards()
}

onMounted(async () => {
  await fetchOptions()
  await fetchCards()
})
</script>

<style scoped>
.dashboard-shell {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.75rem;
  padding: 1rem 0;
}
.search-box {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid #d6ddf2;
  border-radius: 8px;
  padding: 0.35rem 0.55rem;
  background: #fff;
  height: 35px;
}
.search-box input {
  border: none;
  outline: none;
  min-width: 180px;
}
.panel {
  background: #fff;
  border: 1px solid #eef1f7;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 12px 40px rgba(12, 24, 52, 0.05);
}
.table-wrap {
  overflow-x: auto;
}
.fx-table {
  width: 100%;
  border-collapse: collapse;
}
.fx-table th,
.fx-table td {
  padding: 0.65rem 0.75rem;
  text-align: left;
}
.fx-table thead {
  background: #f6f8ff;
}
.status-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.6rem;
  border-radius: 8px;
  font-size: 0.85rem;
}
.status-chip.on {
  background: #e8f8ef;
  color: #1a7f4a;
  border: 1px solid #c7e9d2;
}
.status-chip.off {
  background: #fff0f0;
  color: #b12c2c;
  border: 1px solid #f3c2c2;
}
.actions-inline {
  display: inline-flex;
  gap: 0.35rem;
  align-items: center;
}
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-top: 0.75rem;
  flex-wrap: wrap;
  padding: 0.75rem;
}
.pager {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.pager-btn {
  width: 36px;
  height: 36px;
  border-radius: 5px;
  border: 1px solid rgba(12, 24, 52, 0.12);
  background: #fff;
  cursor: pointer;
  color: #222;
  font-size: 18px;
}
.pager-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.pager-page {
  font-weight: 700;
  color: #0f1f3d;
}
.page-size {
  position: relative;
  border: 1px solid #2f7d4b;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  padding: 0.15rem 0.55rem;
  gap: 0.35rem;
  background: #fff;
  color: #0f1f3d;
}
.page-size-select {
  appearance: none;
  border: none;
  background: transparent;
  padding-right: 1.2rem;
  font-weight: 700;
  color: #0f1f3d;
  cursor: pointer;
  height: 20px;
}
.page-size-select:focus {
  outline: none;
}
.page-size .caret {
  position: absolute;
  right: 8px;
  pointer-events: none;
  color: #2f7d4b;
  font-size: 0.9rem;
}
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(12, 18, 36, 0.45);
  display: grid;
  place-items: center;
  z-index: 10;
}
.modal-card {
  width: min(520px, 96vw);
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 20px 80px rgba(12, 24, 52, 0.25);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.modal-input {
  width: 100%;
  padding: 0.65rem 0.75rem;
  border-radius: 8px;
  border: 1px solid #cbd2e6;
  background: #fff;
}
.field-label {
  display: block;
  margin-top: 0.75rem;
  font-weight: 600;
  color: #1a2743;
}
.toggle-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  width: 46px;
  height: 24px;
  margin-top: 8px;
}
.switch input {
  opacity: 0;
  appearance: none;
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  pointer-events: none;
}
.slider {
  width: 46px;
  height: 24px;
  background-color: #d5d9e6;
  border-radius: 999px;
  position: relative;
  transition: 0.2s;
  border: 1px solid #c2c8db;
}
.slider::before {
  content: '';
  position: absolute;
  height: 18px;
  width: 18px;
  left: 3px;
  top: 2px;
  background: #fff;
  border-radius: 50%;
  transition: 0.2s;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}
.switch input:checked + .slider {
  background-color: #36b47e;
  border-color: #36b47e;
}
.switch input:checked + .slider::before {
  transform: translateX(20px);
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}
.pill-btn {
  border: 1px solid #d6ddf2;
  background: #3152ff;
  color: #fff;
  border-radius: 8px;
  padding: 0.55rem 0.9rem;
  cursor: pointer;
}
.pill-btn.ghost {
  background: #eff3ff;
  color: #3152ff;
}
.pill-btn.danger {
  background: #ff6b6b;
  color: #fff;
  border-color: #ff6b6b;
}
.me-2 {
  margin-right: 0.5rem;
}
.muted {
  color: #7a8699;
}
</style>
