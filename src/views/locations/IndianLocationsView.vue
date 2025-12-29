<template>
  <div class="dashboard-shell">
    <div class="hero">
      <div class="hero-content">
        <div>
          <p class="eyebrow">Locations</p>
          <h2 class="hero-title">Indian Locations</h2>
        </div>
      </div>
    </div>

    <Card class="panel glassy">
      <template #content>
        <div class="tabs">
          <button :class="['tab', activeTab === 'states' ? 'is-active' : '']" @click="activeTab = 'states'">
            <i class="pi pi-map-marker me-2"></i>
            States ({{ filteredStates.length }})
          </button>
          <button :class="['tab', activeTab === 'cities' ? 'is-active' : '']" @click="activeTab = 'cities'">
            <i class="pi pi-building me-2"></i>
            Cities ({{ filteredCities.length }})
          </button>
        </div>

        <div class="toolbar">
          <div class="btn-group">
            <button class="pill-btn" @click="openModal(activeTab)">
              <i class="pi pi-plus me-2"></i>
              New
            </button>
            <button class="pill-btn ghost">
              <i class="pi pi-file-export me-2"></i>
              Export
            </button>
          </div>
          <div class="search-box">
            <i class="pi pi-search"></i>
            <input
              v-if="activeTab === 'states'"
              v-model="stateQuery"
              type="text"
              placeholder="Search states..."
            />
            <input
              v-else
              v-model="cityQuery"
              type="text"
              placeholder="Search cities..."
            />
          </div>
        </div>

        <div v-if="activeTab === 'states'" class="table-wrap">
          <table class="fx-table">
            <thead>
              <tr>
                <th width="80">#</th>
                <th>Title</th>
                <th width="120">Status</th>
                <th width="80">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!statesLoading && filteredStates.length === 0">
                <td colspan="4" class="muted">No states found.</td>
              </tr>
              <tr v-else-if="statesLoading">
                <td colspan="4" class="muted">Loading states...</td>
              </tr>
            <tr v-for="(state, idx) in pagedStates" :key="state.id">
              <td>{{ (statesPage - 1) * perPage + idx + 1 }}</td>
              <td>{{ state.title }}</td>
              <td>
                <label class="switch">
                  <input type="checkbox" :checked="state.status" @change="toggleStatus('states', state)" />
                  <span class="slider"></span>
                </label>
              </td>
              <td class="actions">
                <button class="pill-btn ghost sm" title="Edit" @click="openEdit('states', state)">
                  <i class="pi pi-pencil"></i>
                </button>
              </td>
            </tr>
            </tbody>
          </table>
          <div class="pagination">
            <div class="muted">Showing {{ pagedStates.length }} of {{ filteredStates.length }} states</div>
            <div class="pager">
              <button class="pager-btn" :disabled="statesPage === 1" @click="statesPage--">
                <span aria-hidden="true">‹</span>
              </button>
              <span class="pager-page">Page {{ statesPage }} / {{ statesTotalPages }}</span>
              <button class="pager-btn" :disabled="statesPage === statesTotalPages" @click="statesPage++">
                <span aria-hidden="true">›</span>
              </button>
              <select v-model.number="perPage">
                <option v-for="size in [5, 10, 20, 50]" :key="size" :value="size">{{ size }} / page</option>
              </select>
            </div>
          </div>
        </div>

        <div v-else class="table-wrap">
          <table class="fx-table">
            <thead>
              <tr>
                <th width="80">#</th>
                <th>Title</th>
                <th>State</th>
                <th width="120">Status</th>
                <th width="80">Actions</th>
              </tr>
            </thead>
            <tbody>
            <tr v-if="!citiesLoading && filteredCities.length === 0">
              <td colspan="5" class="muted">No cities found.</td>
            </tr>
            <tr v-else-if="citiesLoading">
              <td colspan="5" class="muted">Loading cities...</td>
            </tr>
              <tr v-for="(city, idx) in pagedCities" :key="city.id">
                <td>{{ (citiesPage - 1) * perPage + idx + 1 }}</td>
                <td>{{ city.title }}</td>
                <td>{{ city.state_title || stateLookup[city.state_id] }}</td>
                <td>
                  <label class="switch">
                    <input type="checkbox" :checked="city.status" @change="toggleStatus('cities', city)" />
                    <span class="slider"></span>
                  </label>
                </td>
                <td class="actions">
                  <button class="pill-btn ghost sm" title="Edit" @click="openEdit('cities', city)">
                    <i class="pi pi-pencil"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="pagination">
            <div class="muted">Showing {{ pagedCities.length }} of {{ filteredCities.length }} cities</div>
            <div class="pager">
              <button class="pager-btn" :disabled="citiesPage === 1" @click="citiesPage--">
                <span aria-hidden="true">‹</span>
              </button>
              <span class="pager-page">Page {{ citiesPage }} / {{ citiesTotalPages }}</span>
              <button class="pager-btn" :disabled="citiesPage === citiesTotalPages" @click="citiesPage++">
                <span aria-hidden="true">›</span>
              </button>
              <select v-model.number="perPage">
                <option v-for="size in [5, 10, 20, 50]" :key="size" :value="size">{{ size }} / page</option>
              </select>
            </div>
          </div>
        </div>
      </template>
    </Card>

    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <div class="modal">
        <h3 class="modal-title">Add new {{ modalType === 'states' ? 'state' : 'city' }}</h3>
        <div class="modal-body">
          <label class="field-label">Title</label>
          <input v-model="form.title" type="text" class="modal-input" placeholder="Enter title" />
          <div class="mt-1">
            <label class="field-label">Status</label>
            <select v-model.number="form.status" class="modal-input">
              <option :value="1">Active</option>
              <option :value="0">Inactive</option>
            </select>
          </div>

          <div v-if="modalType === 'cities'" class="mt-1">
            <label class="field-label">State</label>
            <select v-model="form.state_id" class="modal-input">
              <option value="">Select state</option>
              <option v-for="state in states" :key="state.id" :value="state.id">{{ state.title }}</option>
            </select>
          </div>
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
import { computed, onMounted, ref } from 'vue'
import api from '@/api/http'

const activeTab = ref('states')
const stateQuery = ref('')
const cityQuery = ref('')
const states = ref([])
const cities = ref([])
const statesLoading = ref(false)
const citiesLoading = ref(false)
const statesPage = ref(1)
const citiesPage = ref(1)
const perPage = ref(10)
const showModal = ref(false)
const modalType = ref('states')
const editId = ref(null)
const form = ref({
  title: '',
  state_id: '',
  status: 1,
})

const stateLookup = computed(() =>
  states.value.reduce((acc, state) => {
    acc[state.id] = state.title
    return acc
  }, {})
)

const filteredStates = computed(() => {
  const q = stateQuery.value.toLowerCase()
  return states.value.filter((s) => (s.title || '').toLowerCase().includes(q))
})

const filteredCities = computed(() => {
  const q = cityQuery.value.toLowerCase()
  return cities.value.filter(
    (c) =>
      (c.title || '').toLowerCase().includes(q) ||
      (stateLookup.value[c.state_id] || '').toLowerCase().includes(q)
  )
})

const statesTotalPages = computed(() => Math.max(1, Math.ceil(filteredStates.value.length / perPage.value)))
const citiesTotalPages = computed(() => Math.max(1, Math.ceil(filteredCities.value.length / perPage.value)))

const pagedStates = computed(() => {
  const start = (statesPage.value - 1) * perPage.value
  return filteredStates.value.slice(start, start + perPage.value)
})

const pagedCities = computed(() => {
  const start = (citiesPage.value - 1) * perPage.value
  return filteredCities.value.slice(start, start + perPage.value)
})

const fetchStates = async () => {
  statesLoading.value = true
  try {
    const { data } = await api.get('/locations/states')
    states.value = data.data || []
  } finally {
    statesLoading.value = false
  }
}

const fetchCities = async () => {
  citiesLoading.value = true
  try {
    const { data } = await api.get('/locations/cities')
    cities.value = data.data || []
  } finally {
    citiesLoading.value = false
  }
}

onMounted(() => {
  fetchStates()
  fetchCities()
})

const openModal = (type) => {
  modalType.value = type
  form.value = { title: '', state_id: '', status: 1 }
  editId.value = null
  showModal.value = true
}

const openEdit = (type, record) => {
  modalType.value = type
  form.value = {
    title: record.title,
    state_id: record.state_id || '',
    status: record.status ?? 1,
  }
  editId.value = record.id
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const toggleStatus = async (type, record) => {
  const nextStatus = record.status ? 0 : 1
  try {
    if (type === 'states') {
      await api.patch(`/locations/states/${record.id}`, { status: nextStatus })
      await fetchStates()
    } else {
      await api.patch(`/locations/cities/${record.id}`, { status: nextStatus })
      await fetchCities()
    }
  } catch (e) {
    // ignore
  }
}

const saveRecord = async () => {
  if (!form.value.title.trim()) return

  try {
    if (modalType.value === 'states') {
      if (editId.value) {
        await api.patch(`/locations/states/${editId.value}`, {
          title: form.value.title.trim(),
          status: form.value.status,
        })
      } else {
        await api.post('/locations/states', {
          title: form.value.title.trim(),
          status: form.value.status,
        })
      }
      await fetchStates()
      stateQuery.value = ''
    } else {
      if (!form.value.state_id) return
      if (editId.value) {
        await api.patch(`/locations/cities/${editId.value}`, {
          title: form.value.title.trim(),
          indian_state_id: form.value.state_id,
          status: form.value.status,
        })
      } else {
        await api.post('/locations/cities', {
          title: form.value.title.trim(),
          indian_state_id: form.value.state_id,
          status: form.value.status,
        })
      }
      await fetchCities()
      cityQuery.value = ''
    }
  } catch (e) {
    // handle error silently for now
  } finally {
    closeModal()
  }
}
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

.switch {
  position: relative;
  display: inline-block;
  width: 46px;
  height: 24px;
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
  background-color: #d5d9e6;
  transition: 0.2s;
  border-radius: 24px;
  border: 1px solid #c2c8db;
}

.slider:before {
  position: absolute;
  content: '';
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 2px;
  background-color: white;
  transition: 0.2s;
  border-radius: 50%;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

.switch input:checked + .slider {
  background-color: #22c55e;
  border-color: #22c55e;
}

.switch input:checked + .slider:before {
  transform: translateX(20px);
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

.mt-1 {
  margin-top: 0.35rem;
}
</style>
