<template>
  <div class="dashboard-shell">
    <div class="hero">
      <div class="hero-content">
        <div>
          <p class="eyebrow">Locations</p>
          <h2 class="hero-title">Served Countries</h2>
        </div>
      </div>
    </div>

    <Card class="panel glassy">
      <template #content>
        <div class="toolbar">
          <div class="btn-group">
            <button class="pill-btn" @click="openModal">
              <i class="pi pi-plus me-2"></i>
              New
            </button>
          </div>
          <div class="search-box">
            <i class="pi pi-search"></i>
            <input v-model="query" type="text" placeholder="Search countries..." />
          </div>
        </div>

        <div class="table-wrap">
          <table class="fx-table">
            <thead>
              <tr>
                <th width="80">#</th>
                <th>Title</th>
                <th>Code</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!loading && pagedCountries.length === 0">
                <td colspan="4" class="muted">No countries found.</td>
              </tr>
              <tr v-else-if="loading">
                <td colspan="4" class="muted">Loading countries...</td>
              </tr>
              <tr v-for="(country, idx) in pagedCountries" :key="country.id">
                <td>{{ (page - 1) * perPage + idx + 1 }}</td>
                <td>{{ country.title }}</td>
                <td>{{ country.code }}</td>
                <td>
                  <span :class="['status-chip', country.is_active ? 'on' : 'off']">
                    {{ country.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td>
                  <label class="switch">
                    <input
                      type="checkbox"
                      :checked="country.is_active"
                      @change="toggleActive(country.id, $event.target.checked)"
                    />
                    <span class="slider"></span>
                  </label>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination">
          <div class="muted">Showing {{ pagedCountries.length }} of {{ filteredCountries.length }} countries</div>
          <div class="pager">
            <button class="pager-btn" :disabled="page === 1" @click="page--">
              <span aria-hidden="true">‹</span>
            </button>
            <span class="pager-page">Page {{ page }} / {{ totalPages }}</span>
            <button class="pager-btn" :disabled="page === totalPages" @click="page++">
              <span aria-hidden="true">›</span>
            </button>
            <select v-model.number="perPage">
              <option v-for="size in [5, 10, 20, 50]" :key="size" :value="size">{{ size }} / page</option>
            </select>
          </div>
        </div>
      </template>
    </Card>

    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <div class="modal">
        <h3 class="modal-title">Add new country</h3>
        <div class="modal-body">
          <label class="field-label">Title</label>
          <input v-model="form.title" type="text" class="modal-input" placeholder="Country name" />

          <label class="field-label">Code</label>
          <input v-model="form.code" type="text" class="modal-input" placeholder="ISO code e.g. IN" />

          <label class="field-label">
            <input v-model="form.is_active" type="checkbox" /> Active
          </label>
        </div>
        <div class="modal-actions">
          <button class="pill-btn ghost" @click="closeModal">Cancel</button>
          <button class="pill-btn" @click="saveRecord">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import api from '@/api/http'

const countries = ref([])
const loading = ref(false)
const saving = ref(false)
const query = ref('')
const page = ref(1)
const perPage = ref(10)
const showModal = ref(false)
const form = ref({
  title: '',
  code: '',
  is_active: true,
})
const toast = useToast()

const filteredCountries = computed(() => {
  const q = query.value.toLowerCase()
  return countries.value.filter(
    (c) => (c.title || '').toLowerCase().includes(q) || (c.code || '').toLowerCase().includes(q)
  )
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredCountries.value.length / perPage.value)))

const pagedCountries = computed(() => {
  const start = (page.value - 1) * perPage.value
  return filteredCountries.value.slice(start, start + perPage.value)
})

watch(perPage, () => {
  page.value = 1
})

const fetchCountries = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/locations/served-countries')
    const rows = data.data || []
    countries.value = rows.map((c) => ({ ...c, is_active: !!c.is_active }))
  } finally {
    loading.value = false
  }
}

const openModal = () => {
  form.value = { title: '', code: '', is_active: true }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const saveRecord = async () => {
  if (!form.value.title.trim() || !form.value.code.trim()) return

  saving.value = true
  try {
    const payload = {
      title: form.value.title.trim(),
      code: form.value.code.trim(),
      is_active: !!form.value.is_active,
    }
    const { data } = await api.post('/locations/served-countries', payload)
    const newCountry = data.data || data
    countries.value = [...countries.value, newCountry]
    closeModal()
    toast.add({ severity: 'success', summary: 'Saved', detail: 'Country added', life: 2000 })
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to add country', life: 2500 })
  } finally {
    saving.value = false
  }
}

const toggleActive = async (id, isActive) => {
  const previous = [...countries.value]
  countries.value = countries.value.map((c) => (c.id === id ? { ...c, is_active: isActive } : c))
  try {
    await api.patch(`/locations/served-countries/${id}`, { is_active: isActive })
    toast.add({ severity: 'success', summary: 'Updated', detail: 'Status updated', life: 1500 })
  } catch (error) {
    countries.value = previous
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update status', life: 2500 })
  }
}

onMounted(fetchCountries)
</script>

<style scoped>
.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.tab {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 0.9rem;
  border-radius: 5px;
  border: 1px solid rgba(12, 24, 52, 0.12);
  background: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  color: #0f1f3d;
  font-weight: 700;
  transition: all 0.15s ease;
}

.tab.is-active {
  background: #0f62fe;
  color: #fff;
  border-color: #0f62fe;
  box-shadow: 0 12px 30px rgba(15, 98, 254, 0.25);
}

.fx-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
  color: #0f1f3d;
}

.fx-table th,
.fx-table td {
  text-align: left;
  padding: 0.75rem 0.65rem;
}

.fx-table thead {
  background: #f4f6ff;
  color: #1b2655;
}

.fx-table tbody tr:nth-child(odd) {
  background: rgba(12, 24, 52, 0.03);
}

.fx-table tbody tr:hover {
  background: rgba(15, 98, 254, 0.08);
}

.table-wrap {
  overflow-x: auto;
}

.panel {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(15, 37, 83, 0.08);
  border-radius: 18px;
  padding: 1.25rem;
  box-shadow: 0 16px 60px rgba(12, 24, 52, 0.08);
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.btn-group {
  display: flex;
  gap: 0.5rem;
}

.pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 0.9rem;
  border-radius: 5px;
  border: 1px solid #0f62fe;
  background: #0f62fe;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.pill-btn.ghost {
  background: #fff;
  color: #0f62fe;
}

.pill-btn:hover {
  box-shadow: 0 10px 30px rgba(15, 98, 254, 0.25);
  transform: translateY(-1px);
}

.pill-btn.ghost:hover {
  background: rgba(15, 98, 254, 0.08);
}

.search-box {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border: 1px solid #cbd2e6;
  background: #fff;
  padding: 0.5rem 0.75rem;
  border-radius: 5px;
  min-width: 240px;
  position: relative;
  z-index: 1;
}

.search-box input {
  border: none;
  outline: none;
  width: 100%;
  background: transparent;
  font-size: 0.95rem;
  pointer-events: auto;
  color: #0f1f3d;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-top: 0.75rem;
  flex-wrap: wrap;
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
  font-size: 20px;
}

.pager-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pager-page {
  font-weight: 700;
  color: #0f1f3d;
}

select {
  border-radius: 5px;
  border: 1px solid #3c9a5f;
  padding: 0.3rem 1.75rem 0.3rem 0.6rem;
  background: #fff;
  color: #0f1f3d;
  font-weight: 600;
  appearance: none;
  background-image: linear-gradient(45deg, transparent 50%, #3c9a5f 50%), linear-gradient(135deg, #3c9a5f 50%, transparent 50%);
  background-position: right 10px center, right 5px center;
  background-size: 6px 6px, 6px 6px;
  background-repeat: no-repeat;
}

select:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(60, 154, 95, 0.2);
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: grid;
  place-items: center;
  z-index: 30;
}

.modal {
  background: #fff;
  border-radius: 8px;
  padding: 1.25rem;
  width: min(420px, 90vw);
  box-shadow: 0 20px 70px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(12, 24, 52, 0.1);
}

.modal-title {
  margin: 0 0 0.75rem;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.modal-input {
  width: 100%;
  padding: 0.65rem 0.75rem;
  border-radius: 5px;
  border: 1px solid rgba(12, 24, 52, 0.18);
  font-size: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.muted {
  color: #6b758f;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: 5px;
  font-weight: 700;
  font-size: 0.85rem;
}

.status-chip.on {
  background: #e7f7ec;
  color: #257a3c;
  border: 1px solid #c7e9d2;
}

.status-chip.off {
  background: #fff0f0;
  color: #b12c2c;
  border: 1px solid #f3c2c2;
}

.switch {
  position: relative;
  display: inline-block;
  width: 42px;
  height: 22px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #d6dbe7;
  transition: 0.2s;
  border-radius: 22px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.slider:before {
  position: absolute;
  content: '';
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 2px;
  background-color: white;
  transition: 0.2s;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.switch input:checked + .slider {
  background-color: #22c55e;
}

.switch input:checked + .slider:before {
  transform: translateX(18px);
}
</style>
