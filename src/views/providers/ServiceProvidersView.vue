<template>
  <div class="dashboard-shell">
    <div class="hero">
      <div class="hero-content">
        <div>
          <p class="eyebrow">Partners</p>
          <h2 class="hero-title">Service Providers</h2>
        </div>
      </div>
    </div>

    <Card class="panel glassy">
      <template #content>
        <div class="toolbar">
          <div class="btn-group">
            <button class="pill-btn" @click="openModal()" v-if="activeTab === 'providers'">
              <i class="pi pi-plus me-2"></i>
              New
            </button>
          </div>
          <div class="search-box">
            <i class="pi pi-search"></i>
            <input
              v-if="activeTab === 'providers'"
              v-model="query"
              type="text"
              placeholder="Search providers..."
            />
            <input
              v-else
              v-model="typeQuery"
              type="text"
              placeholder="Search service types..."
            />
          </div>
        </div>

        <div class="tab-pills">
          <button :class="['tab', activeTab === 'providers' ? 'is-active' : '']" @click="activeTab = 'providers'">
            Providers
          </button>
          <button :class="['tab', activeTab === 'types' ? 'is-active' : '']" @click="activeTab = 'types'">
            Service Types
          </button>
          <button
            :class="['tab', activeTab === 'provider_types' ? 'is-active' : '']"
            @click="activeTab = 'provider_types'"
          >
            Provider Service Types
          </button>
        </div>

        <div v-if="activeTab === 'providers'" class="table-wrap">
          <table class="fx-table">
            <thead>
              <tr>
                <th width="60">#</th>
                <th>Title</th>
                <th>Delivery Time</th>
                <th>Max Box (kg)</th>
                <th>Max Shipment (kg)</th>
                <th>Min Weight</th>
                <th>Booking Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!loading && pagedProviders.length === 0">
                <td colspan="9" class="muted">No providers found.</td>
              </tr>
              <tr v-else-if="loading">
                <td colspan="9" class="muted">Loading providers...</td>
              </tr>
              <tr v-for="(provider, idx) in pagedProviders" :key="provider.id">
                <td>{{ (page - 1) * perPage + idx + 1 }}</td>
                <td>{{ provider.title }}</td>
                <td>{{ provider.delivery_time }}</td>
                <td>{{ provider.max_box_weight }}</td>
                <td>{{ provider.max_shipment_weight }}</td>
                <td>{{ provider.min_weight ?? '—' }}</td>
                <td>{{ bookingTypeLabel(provider.booking_type_id) }}</td>
                <td>
                  <span :class="['status-chip', provider.status ? 'on' : 'off']">
                    {{ provider.status ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="actions">
                  <label class="switch">
                    <input
                      type="checkbox"
                      :checked="!!provider.status"
                      @change="toggleStatus(provider.id, $event.target.checked)"
                    />
                    <span class="slider"></span>
                  </label>
                  <button class="pill-btn ghost sm" @click="openModal(provider)"><i class="pi pi-pencil"></i></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="activeTab === 'providers'" class="pagination">
          <div class="muted">Showing {{ pagedProviders.length }} of {{ filteredProviders.length }} providers</div>
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

        <div v-else-if="activeTab === 'types'" class="table-wrap">
          <table class="fx-table">
            <thead>
              <tr>
                <th width="60">#</th>
                <th>Title</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!typesLoading && filteredTypes.length === 0">
                <td colspan="3" class="muted">No service types found.</td>
              </tr>
              <tr v-else-if="typesLoading">
                <td colspan="3" class="muted">Loading service types...</td>
              </tr>
              <tr v-for="(type, idx) in filteredTypes" :key="type.id">
                <td>{{ idx + 1 }}</td>
                <td>{{ type.title }}</td>
                <td>
                  <button class="pill-btn ghost sm" @click="editType(type)">
                    <i class="pi pi-pencil"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="type-form">
            <input
              v-model="typeForm.title"
              type="text"
              class="modal-input"
              placeholder="New service type"
              @keyup.enter="saveType"
            />
            <button class="pill-btn" :disabled="typeSaving" @click="saveType">
              {{ typeSaving ? 'Saving...' : typeForm.id ? 'Update' : 'Add type' }}
            </button>
          </div>
        </div>

        <div v-else-if="activeTab === 'provider_types'" class="table-wrap">
          <table class="fx-table">
            <thead>
              <tr>
                <th width="60">#</th>
                <th>Provider</th>
                <th>Service Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!providerTypeLoading && filteredProviderTypes.length === 0">
                <td colspan="4" class="muted">No provider service types found.</td>
              </tr>
              <tr v-else-if="providerTypeLoading">
                <td colspan="4" class="muted">Loading provider service types...</td>
              </tr>
              <tr v-for="(row, idx) in filteredProviderTypes" :key="row.id">
                <td>{{ idx + 1 }}</td>
                <td>{{ row.service_provider_title }}</td>
                <td>{{ row.service_type_title }}</td>
                <td class="actions">
                  <button class="pill-btn ghost sm" @click="editProviderType(row)">
                    <i class="pi pi-pencil"></i>
                  </button>
                  <button class="pill-btn ghost sm" @click="deleteProviderType(row)">
                    <i class="pi pi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="type-form">
            <select v-model="providerTypeForm.service_provider_id" class="modal-input">
              <option value="">Select provider</option>
              <option v-for="p in providers" :key="p.id" :value="p.id">{{ p.title }}</option>
            </select>
            <select v-model="providerTypeForm.service_type_id" class="modal-input">
              <option value="">Select service type</option>
              <option v-for="t in serviceTypes" :key="t.id" :value="t.id">{{ t.title }}</option>
            </select>
            <button class="pill-btn" :disabled="providerTypeSaving" @click="saveProviderType">
              {{ providerTypeSaving ? 'Saving...' : providerTypeForm.id ? 'Update' : 'Add' }}
            </button>
          </div>
        </div>
      </template>
    </Card>

    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <div class="modal">
        <h3 class="modal-title">{{ editing ? 'Edit provider' : 'Add provider' }}</h3>
        <div class="modal-body">
          <label class="field-label">Title</label>
          <input v-model="form.title" type="text" class="modal-input" placeholder="Provider name" />
          <p v-if="formErrors.title" class="error-text">{{ formErrors.title[0] }}</p>

          <label class="field-label">Logo URL</label>
          <input type="file" accept="image/*" class="modal-input" @change="handleLogo" />
          <div v-if="form.logoPreview" class="logo-preview">
            <img :src="form.logoPreview" alt="Logo preview" />
          </div>

          <label class="field-label">Delivery Time</label>
          <input v-model="form.delivery_time" type="text" class="modal-input" placeholder="e.g. 24-48h" />
          <p v-if="formErrors.delivery_time" class="error-text">{{ formErrors.delivery_time[0] }}</p>

          <div class="grid-2">
            <div>
              <label class="field-label">Max Box Weight (kg)</label>
              <input v-model.number="form.max_box_weight" type="number" class="modal-input" min="0" max="255" />
              <p v-if="fieldError('max_box_weight')" class="error-text">{{ fieldError('max_box_weight') }}</p>
            </div>
            <div>
              <label class="field-label">Max Shipment Weight (kg)</label>
              <input v-model.number="form.max_shipment_weight" type="number" class="modal-input" min="0" max="255" />
              <p v-if="fieldError('max_shipment_weight')" class="error-text">{{ fieldError('max_shipment_weight') }}</p>
            </div>
          </div>

          <div class="grid-2">
            <div>
              <label class="field-label">Min Weight (optional)</label>
              <input v-model="form.min_weight" type="text" class="modal-input" placeholder="e.g. 0.5" />
              <p v-if="fieldError('min_weight')" class="error-text">{{ fieldError('min_weight') }}</p>
            </div>
            <div>
              <label class="field-label">Booking Type</label>
              <select v-model="form.booking_type_id" class="modal-input">
                <option value="">Select booking type</option>
                <option v-for="bt in bookingTypes" :key="bt.id" :value="bt.id">{{ bt.title }}</option>
              </select>
              <p v-if="fieldError('booking_type_id')" class="error-text">{{ fieldError('booking_type_id') }}</p>
            </div>
          </div>

          <div class="field-label">Status</div>
          <label class="switch">
            <input v-model="form.status" type="checkbox" />
            <span class="slider"></span>
          </label>
        </div>
        <div class="modal-actions">
          <button class="pill-btn ghost" @click="closeModal">Cancel</button>
          <button class="pill-btn" :disabled="saving" @click="saveRecord">
            {{ saving ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showTypeModal" class="modal-backdrop" @click.self="closeTypeModal">
      <div class="modal">
        <h3 class="modal-title">Edit service type</h3>
        <div class="modal-body">
          <label class="field-label">Title</label>
          <input v-model="typeForm.title" type="text" class="modal-input" placeholder="Service type title" />
        </div>
        <div class="modal-actions">
          <button class="pill-btn ghost" @click="closeTypeModal">Cancel</button>
          <button class="pill-btn" :disabled="typeSaving" @click="saveType">
            {{ typeSaving ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showProviderTypeModal" class="modal-backdrop" @click.self="closeProviderTypeModal">
      <div class="modal">
        <h3 class="modal-title">Edit mapping</h3>
        <div class="modal-body">
          <label class="field-label">Provider</label>
          <select v-model="providerTypeForm.service_provider_id" class="modal-input">
            <option value="">Select provider</option>
            <option v-for="p in providers" :key="p.id" :value="p.id">{{ p.title }}</option>
          </select>
          <label class="field-label">Service Type</label>
          <select v-model="providerTypeForm.service_type_id" class="modal-input">
            <option value="">Select service type</option>
            <option v-for="t in serviceTypes" :key="t.id" :value="t.id">{{ t.title }}</option>
          </select>
        </div>
        <div class="modal-actions">
          <button class="pill-btn ghost" @click="closeProviderTypeModal">Cancel</button>
          <button class="pill-btn" :disabled="providerTypeSaving" @click="saveProviderType">
            {{ providerTypeSaving ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import api from '@/api/http'

const providers = ref([])
const loading = ref(false)
const saving = ref(false)
const query = ref('')
const page = ref(1)
const perPage = ref(10)
const activeTab = ref('providers')
const showModal = ref(false)
const editing = ref(false)
const currentId = ref(null)
const form = ref({
  title: '',
  logo: '',
  logoFile: null,
  logoPreview: '',
  delivery_time: '',
  max_box_weight: 0,
  max_shipment_weight: 0,
  min_weight: '',
  booking_type_id: '',
  status: true,
})
const formErrors = ref({})
const toast = useToast()
const serviceTypes = ref([])
const typesLoading = ref(false)
const typeQuery = ref('')
const typeForm = ref({ id: null, title: '' })
const typeSaving = ref(false)
const bookingTypes = ref([])
const showTypeModal = ref(false)
const providerTypeRows = ref([])
const providerTypeLoading = ref(false)
const providerTypeForm = ref({ id: null, service_provider_id: '', service_type_id: '' })
const providerTypeSaving = ref(false)
const showProviderTypeModal = ref(false)
const closeTypeModal = () => {
  showTypeModal.value = false
  typeForm.value = { id: null, title: '' }
}
const closeProviderTypeModal = () => {
  showProviderTypeModal.value = false
  providerTypeForm.value = { id: null, service_provider_id: '', service_type_id: '' }
}

const filteredProviders = computed(() => {
  const q = query.value.toLowerCase()
  return providers.value.filter(
    (p) =>
      (p.title || '').toLowerCase().includes(q) ||
      (p.delivery_time || '').toLowerCase().includes(q) ||
      String(p.max_box_weight || '').includes(q) ||
      String(p.max_shipment_weight || '').includes(q) ||
      String(p.min_weight || '').includes(q) ||
      bookingTypeLabel(p.booking_type_id).toLowerCase().includes(q)
  )
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredProviders.value.length / perPage.value)))

const pagedProviders = computed(() => {
  const start = (page.value - 1) * perPage.value
  return filteredProviders.value.slice(start, start + perPage.value)
})

const filteredTypes = computed(() => {
  const q = typeQuery.value.toLowerCase()
  return serviceTypes.value.filter((t) => (t.title || '').toLowerCase().includes(q))
})

const filteredProviderTypes = computed(() => providerTypeRows.value)

watch(perPage, () => {
  page.value = 1
})

const bookingTypeLabel = (id) => {
  const match = bookingTypes.value.find((b) => b.id === id)
  return match?.title || ''
}

const fetchProviders = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/service-providers')
    const rows = data.data || []
    providers.value = rows.map((p) => ({ ...p, status: Number(p.status) === 1 }))
  } finally {
    loading.value = false
  }
}

const fetchTypes = async () => {
  typesLoading.value = true
  try {
    const { data } = await api.get('/service-types')
    serviceTypes.value = data.data || []
  } finally {
    typesLoading.value = false
  }
}

const fetchBookingTypes = async () => {
  try {
    const { data } = await api.get('/booking-types')
    bookingTypes.value = (data.data || []).filter((t) => t.status ?? t.is_active ?? 1)
  } catch (e) {
    bookingTypes.value = []
  }
}

const fetchProviderTypes = async () => {
  providerTypeLoading.value = true
  try {
    const { data } = await api.get('/provider-service-types')
    providerTypeRows.value = data.data || []
  } finally {
    providerTypeLoading.value = false
  }
}

const fieldError = (name) => formErrors.value?.[name]?.[0] || ''

const openModal = (provider = null) => {
  editing.value = !!provider
  currentId.value = provider?.id || null
  formErrors.value = {}
  form.value = {
    title: provider?.title || '',
    logo: provider?.logo || '',
    logoPreview: resolveLogo(provider?.logo),
    logoFile: null,
    delivery_time: provider?.delivery_time || '',
    max_box_weight: provider?.max_box_weight || 0,
    max_shipment_weight: provider?.max_shipment_weight || 0,
    min_weight: provider?.min_weight ?? '',
    booking_type_id: provider?.booking_type_id ?? '',
    status: provider ? !!provider.status : true,
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const saveRecord = async () => {
  if (!form.value.title.trim() || !form.value.delivery_time.trim()) return
  saving.value = true
  formErrors.value = {}
  try {
    const payload = new FormData()
    payload.append('title', form.value.title.trim())
    payload.append('delivery_time', form.value.delivery_time.trim())
    payload.append('max_box_weight', Number(form.value.max_box_weight) || 0)
    payload.append('max_shipment_weight', Number(form.value.max_shipment_weight) || 0)
    if (form.value.min_weight !== '') {
      payload.append('min_weight', form.value.min_weight)
    }
    if (form.value.booking_type_id) {
      payload.append('booking_type_id', form.value.booking_type_id)
    }
    payload.append('status', form.value.status ? 1 : 0)
    if (form.value.logoFile) {
      payload.append('logo', form.value.logoFile)
    }

    if (editing.value && currentId.value) {
      const { data } = await api.post(`/service-providers/${currentId.value}?_method=PATCH`, payload)
      const updated = data.data || data
      await fetchProviders()
      toast.add({ severity: 'success', summary: 'Updated', detail: 'Provider updated', life: 2000 })
    } else {
      const { data } = await api.post('/service-providers', payload)
      await fetchProviders()
      toast.add({ severity: 'success', summary: 'Created', detail: 'Provider added', life: 2000 })
    }
    closeModal()
  } catch (error) {
    const errors = error?.response?.data?.errors
    if (errors) {
      formErrors.value = errors
      const first = Object.values(errors)[0]
      toast.add({ severity: 'error', summary: 'Validation failed', detail: Array.isArray(first) ? first[0] : String(first), life: 3000 })
    } else {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save provider', life: 2500 })
    }
  } finally {
    saving.value = false
  }
}

const toggleStatus = async (id, isActive) => {
  const prev = [...providers.value]
  providers.value = providers.value.map((p) => (p.id === id ? { ...p, status: isActive } : p))
  try {
    await api.patch(`/service-providers/${id}`, { status: isActive ? 1 : 0 })
    toast.add({ severity: 'success', summary: 'Updated', detail: 'Status updated', life: 1500 })
  } catch (error) {
    providers.value = prev
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update status', life: 2500 })
  }
}

onMounted(fetchProviders)
onMounted(fetchBookingTypes)

const handleLogo = (event) => {
  const file = event.target.files?.[0]
  form.value.logoFile = file || null
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      form.value.logoPreview = e.target?.result
    }
    reader.readAsDataURL(file)
  }
}

const resolveLogo = (path) => {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path
  // Handle paths that may already include /storage prefix
  const normalized = path.startsWith('storage/') ? path : `storage/${path}`
  let base =
    import.meta.env.VITE_BACKEND_URL?.replace(/\/+$/, '') ||
    import.meta.env.VITE_APP_URL?.replace(/\/+$/, '') ||
    window.location.origin

  // If running on Vite dev server (5173), default backend likely on 8000
  if (base.includes('://localhost:5173')) {
    base = base.replace(':5173', ':8000')
  }

  return `${base}/${normalized}`
}

const saveType = async () => {
  if (!typeForm.value.title.trim()) return
  typeSaving.value = true
  try {
    if (typeForm.value.id) {
      const { data } = await api.patch(`/service-types/${typeForm.value.id}`, { title: typeForm.value.title.trim() })
      const updated = data.data || data
      serviceTypes.value = serviceTypes.value.map((t) => (t.id === typeForm.value.id ? updated : t))
      toast.add({ severity: 'success', summary: 'Updated', detail: 'Service type updated', life: 2000 })
    } else {
      const { data } = await api.post('/service-types', { title: typeForm.value.title.trim() })
      const created = data.data || data
      serviceTypes.value = [...serviceTypes.value, created]
      toast.add({ severity: 'success', summary: 'Created', detail: 'Service type added', life: 2000 })
    }
    typeForm.value = { id: null, title: '' }
    showTypeModal.value = false
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save service type', life: 2500 })
  } finally {
    typeSaving.value = false
  }
}

onMounted(() => {
  fetchProviders()
  fetchTypes()
  fetchProviderTypes()
})

const editType = (type) => {
  typeForm.value = { id: type.id, title: type.title }
  showTypeModal.value = true
}

const editProviderType = (row) => {
  providerTypeForm.value = {
    id: row.id,
    service_provider_id: row.service_provider_id,
    service_type_id: row.service_type_id,
  }
  showProviderTypeModal.value = true
}

const deleteProviderType = async (row) => {
  const prev = [...providerTypeRows.value]
  providerTypeRows.value = providerTypeRows.value.filter((r) => r.id !== row.id)
  try {
    await api.delete(`/provider-service-types/${row.id}`)
    toast.add({ severity: 'success', summary: 'Deleted', detail: 'Mapping removed', life: 1500 })
  } catch (error) {
    providerTypeRows.value = prev
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete mapping', life: 2500 })
  }
}

const saveProviderType = async () => {
  if (!providerTypeForm.value.service_provider_id || !providerTypeForm.value.service_type_id) return
  providerTypeSaving.value = true
  try {
    if (providerTypeForm.value.id) {
      const { data } = await api.patch(`/provider-service-types/${providerTypeForm.value.id}`, {
        service_provider_id: providerTypeForm.value.service_provider_id,
        service_type_id: providerTypeForm.value.service_type_id,
      })
      const updated = data.data || data
      providerTypeRows.value = providerTypeRows.value.map((r) =>
        r.id === providerTypeForm.value.id
          ? {
              ...updated,
              service_provider_title:
                providers.value.find((p) => p.id === updated.service_provider_id)?.title || r.service_provider_title,
              service_type_title:
                serviceTypes.value.find((t) => t.id === updated.service_type_id)?.title || r.service_type_title,
            }
          : r
      )
      toast.add({ severity: 'success', summary: 'Updated', detail: 'Mapping updated', life: 1500 })
    } else {
      const { data } = await api.post('/provider-service-types', {
        service_provider_id: providerTypeForm.value.service_provider_id,
        service_type_id: providerTypeForm.value.service_type_id,
      })
      const created = data.data || data
      providerTypeRows.value = [
        ...providerTypeRows.value,
        {
          ...created,
          service_provider_title:
            providers.value.find((p) => p.id === created.service_provider_id)?.title || 'Provider',
          service_type_title: serviceTypes.value.find((t) => t.id === created.service_type_id)?.title || 'Service type',
        },
      ]
      toast.add({ severity: 'success', summary: 'Created', detail: 'Mapping added', life: 1500 })
    }
    providerTypeForm.value = { id: null, service_provider_id: '', service_type_id: '' }
    showProviderTypeModal.value = false
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save mapping', life: 2500 })
  } finally {
    providerTypeSaving.value = false
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

.tab-pills {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
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

.pill-btn.sm {
  padding: 0.35rem 0.6rem;
  font-size: 0.9rem;
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
  width: min(480px, 90vw);
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
  background: #fff;
  color: #0f1f3d;
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

.actions {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.grid-2 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.5rem;
}

.type-form {
  margin-top: 0.75rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.type-form .modal-input {
  max-width: 260px;
}

.logo-preview {
  margin-top: 0.5rem;
  padding: 0.35rem;
  border: 1px solid rgba(12, 24, 52, 0.18);
  border-radius: 8px;
  background: #f8fafc;
}

.logo-preview img {
  max-width: 100%;
  max-height: 120px;
  display: block;
}
</style>
