<template>
  <div class="dashboard-shell">
    <div class="hero">
      <div class="hero-content">
        <div>
          <p class="eyebrow">Shipment</p>
          <h2 class="hero-title">Shipment Settings</h2>
        </div>
      </div>
    </div>

    <Card class="panel glassy light-panel">
      <template #content>
        <div class="tab-pills">
          <button :class="['tab', activeTab === 'csb' ? 'is-active' : '']" @click="activeTab = 'csb'">CSB Types</button>
          <button :class="['tab', activeTab === 'terms' ? 'is-active' : '']" @click="activeTab = 'terms'">Terms of Invoices</button>
          <button :class="['tab', activeTab === 'export' ? 'is-active' : '']" @click="activeTab = 'export'">Export Reasons</button>
          <button :class="['tab', activeTab === 'package' ? 'is-active' : '']" @click="activeTab = 'package'">Package Types</button>
          <button :class="['tab', activeTab === 'booking' ? 'is-active' : '']" @click="activeTab = 'booking'">Booking Types</button>
        </div>

        <div class="toolbar">
          <div class="btn-group">
            <button class="pill-btn" @click="openModal()">
              <i class="pi pi-plus me-2"></i>
              New
            </button>
          </div>
          <div class="search-box">
            <i class="pi pi-search"></i>
            <input v-model="current.query.value" type="text" placeholder="Search types..." />
          </div>
        </div>

        <div class="table-wrap">
          <table class="fx-table">
            <thead>
              <tr>
            <th width="60">#</th>
            <th>Title</th>
            <th v-if="activeTab === 'package'">Max Weight</th>
            <th>Status</th>
            <th width="140">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="current.loading.value">
                <td :colspan="activeTab === 'package' ? 5 : 4" class="muted">Loading...</td>
              </tr>
              <tr v-else-if="current.filtered.length === 0">
                <td :colspan="activeTab === 'package' ? 5 : 4" class="muted">No records found.</td>
              </tr>
              <tr v-for="(item, idx) in current.paged" :key="item.id">
                <td class="dark-text">{{ (current.page.value - 1) * current.perPage.value + idx + 1 }}</td>
                <td class="dark-text">{{ item.title }}</td>
                <td v-if="activeTab === 'package'" class="dark-text">{{ item.maxWeight || '—' }}</td>
                <td>
                  <span :class="['status-chip', item.status ? 'on' : 'off']">
                    {{ item.status ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="actions">
                  <button class="pill-btn ghost sm" title="Edit" @click="openModal(item)">
                    <i class="pi pi-pencil"></i>
                  </button>
                  <button class="pill-btn danger sm" title="Delete" @click="askDelete(item)">
                    <i class="pi pi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination">
          <div class="muted">Showing {{ current.paged.length }} of {{ current.filtered.length }} types</div>
          <div class="pager">
            <button class="pager-btn" :disabled="current.page.value === 1" @click="current.page.value--"><span aria-hidden="true">‹</span></button>
            <span class="pager-page">Page {{ current.page.value }} / {{ current.totalPages }}</span>
            <button class="pager-btn" :disabled="current.page.value === current.totalPages" @click="current.page.value++"><span aria-hidden="true">›</span></button>
            <div v-if="current.filtered.length > 10" class="page-size">
              <select v-model.number="current.perPage.value" class="page-size-select">
                <option v-for="size in [5, 10, 20, 50]" :key="size" :value="size">{{ size }} / page</option>
              </select>
              <i class="pi pi-chevron-down caret"></i>
            </div>
          </div>
        </div>
      </template>
    </Card>

    <div v-if="current.showModal.value" class="modal-backdrop" @click.self="closeModal">
      <div class="modal-card">
        <div class="modal-header">
          <h3>{{ modalLabel }}</h3>
          <button class="ghost-btn" @click="closeModal"><i class="pi pi-times"></i></button>
        </div>
        <div class="modal-body">
          <div>
            <label class="field-label">Title</label>
            <input v-model="current.form.value.title" class="modal-input" type="text" />
          </div>
          <div v-if="activeTab === 'package'">
            <label class="field-label">Max Weight (optional)</label>
            <input v-model="current.form.value.maxWeight" class="modal-input" type="number" min="0" step="0.01" />
          </div>
          <div class="toggle-row">
            <div class="field-label">Status</div>
            <label class="switch">
              <input type="checkbox" v-model="current.form.value.status" :true-value="1" :false-value="0" />
              <span class="slider"></span>
            </label>
          </div>
        </div>
        <div class="modal-actions">
          <button class="pill-btn ghost" @click="closeModal">Cancel</button>
          <button class="pill-btn" :disabled="current.saving.value" @click="save">
            {{ current.saving.value ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="pendingDelete" class="modal-backdrop" @click.self="cancelDelete">
      <div class="modal-card confirm-card">
        <div class="modal-header">
          <h3>Confirm delete</h3>
          <button class="ghost-btn" @click="cancelDelete"><i class="pi pi-times"></i></button>
        </div>
        <div class="modal-body">
          Are you sure you want to delete "<strong>{{ pendingDelete.title }}</strong>"?
        </div>
        <div class="modal-actions">
          <button class="pill-btn ghost" @click="cancelDelete">Cancel</button>
          <button class="pill-btn danger" :disabled="current.saving.value" @click="confirmDelete">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '@/api/http'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const activeTab = ref('csb')

const datasets = {
  csb: {
    items: ref([]),
    loading: ref(false),
    saving: ref(false),
    showModal: ref(false),
    query: ref(''),
    page: ref(1),
    perPage: ref(10),
    form: ref({ id: null, title: '', status: 0 }),
    endpoint: '/csb-types',
  },
  terms: {
    items: ref([]),
    loading: ref(false),
    saving: ref(false),
    showModal: ref(false),
    query: ref(''),
    page: ref(1),
    perPage: ref(10),
    form: ref({ id: null, title: '', status: 1 }),
    endpoint: '/term-invoice-types',
  },
  export: {
    items: ref([]),
    loading: ref(false),
    saving: ref(false),
    showModal: ref(false),
    query: ref(''),
    page: ref(1),
    perPage: ref(10),
    form: ref({ id: null, title: '', status: 1 }),
    endpoint: '/export-reasons',
  },
  package: {
    items: ref([]),
    loading: ref(false),
    saving: ref(false),
    showModal: ref(false),
    query: ref(''),
    page: ref(1),
    perPage: ref(10),
    form: ref({ id: null, title: '', maxWeight: '', status: 1 }),
    endpoint: '/package-types',
  },
  booking: {
    items: ref([]),
    loading: ref(false),
    saving: ref(false),
    showModal: ref(false),
    query: ref(''),
    page: ref(1),
    perPage: ref(10),
    form: ref({ id: null, title: '', status: 1 }),
    endpoint: '/booking-types',
  },
}

const pendingDelete = ref(null)

const filtered = (key) =>
  computed(() => {
    const q = datasets[key].query.value.toLowerCase()
    return datasets[key].items.value.filter((i) => i.title.toLowerCase().includes(q))
  })

const filteredCsb = filtered('csb')
const filteredTerms = filtered('terms')
const filteredExport = filtered('export')
const filteredPackage = filtered('package')
const filteredBooking = filtered('booking')

const paged = (key, filteredList) =>
  computed(() => {
    const start = (datasets[key].page.value - 1) * datasets[key].perPage.value
    return filteredList.value.slice(start, start + datasets[key].perPage.value)
  })

const csbTotalPages = computed(() => Math.max(1, Math.ceil(filteredCsb.value.length / datasets.csb.perPage.value)))
const termsTotalPages = computed(() => Math.max(1, Math.ceil(filteredTerms.value.length / datasets.terms.perPage.value)))
const exportTotalPages = computed(() => Math.max(1, Math.ceil(filteredExport.value.length / datasets.export.perPage.value)))
const packageTotalPages = computed(() => Math.max(1, Math.ceil(filteredPackage.value.length / datasets.package.perPage.value)))
const bookingTotalPages = computed(() => Math.max(1, Math.ceil(filteredBooking.value.length / datasets.booking.perPage.value)))
const csbPaged = paged('csb', filteredCsb)
const termsPaged = paged('terms', filteredTerms)
const exportPaged = paged('export', filteredExport)
const packagePaged = paged('package', filteredPackage)
const bookingPaged = paged('booking', filteredBooking)

const current = computed(() => {
  if (activeTab.value === 'csb') {
    return {
      ...datasets.csb,
      filtered: filteredCsb.value,
      paged: csbPaged.value,
      totalPages: csbTotalPages.value,
    }
  }
  if (activeTab.value === 'terms') {
    return {
      ...datasets.terms,
      filtered: filteredTerms.value,
      paged: termsPaged.value,
      totalPages: termsTotalPages.value,
    }
  }
  if (activeTab.value === 'package') {
    return {
      ...datasets.package,
      filtered: filteredPackage.value,
      paged: packagePaged.value,
      totalPages: packageTotalPages.value,
    }
  }
  if (activeTab.value === 'booking') {
    return {
      ...datasets.booking,
      filtered: filteredBooking.value,
      paged: bookingPaged.value,
      totalPages: bookingTotalPages.value,
    }
  }
  return {
    ...datasets.export,
    filtered: filteredExport.value,
    paged: exportPaged.value,
    totalPages: exportTotalPages.value,
  }
})

const loadSet = async (key) => {
  const set = datasets[key]
  set.loading.value = true
  try {
    const { data } = await api.get(set.endpoint)
    const list = data.data || []
    set.items.value =
      key === 'package'
        ? list.map((p) => ({ id: p.id, title: p.name, maxWeight: p.max_weight, status: p.status }))
        : list
  } finally {
    set.loading.value = false
  }
}

const load = async () => {
  await Promise.all([loadSet('csb'), loadSet('terms'), loadSet('export'), loadSet('package'), loadSet('booking')])
}

const openModal = (item = null) => {
  const set = current.value
  if (item) {
    set.form.value =
      activeTab.value === 'package'
        ? { id: item.id, title: item.title, maxWeight: item.maxWeight || '', status: item.status }
        : { id: item.id, title: item.title, status: item.status }
  } else {
    set.form.value =
      activeTab.value === 'package'
        ? { id: null, title: '', maxWeight: '', status: 1 }
        : { id: null, title: '', status: activeTab.value === 'csb' ? 0 : 1 }
  }
  set.showModal.value = true
}

const closeModal = () => {
  current.value.showModal.value = false
}

const save = async () => {
  const set = current.value
  const form = set.form.value
  if (!form.title) {
    toast.add({ severity: 'error', summary: 'Validation', detail: 'Title is required', life: 2000 })
    return
  }
  set.saving.value = true
  try {
    const payload =
      activeTab.value === 'package'
        ? { name: form.title, max_weight: form.maxWeight || null, status: form.status }
        : form
    if (form.id) {
      await api.patch(`${set.endpoint}/${form.id}`, payload)
    } else {
      await api.post(set.endpoint, payload)
    }
    toast.add({ severity: 'success', summary: 'Saved', detail: 'Saved successfully', life: 2000 })
    await loadSet(activeTab.value)
    closeModal()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Unable to save', life: 2500 })
  } finally {
    set.saving.value = false
  }
}

const remove = async (id) => {
  const set = current.value
  set.saving.value = true
  try {
    await api.delete(`${set.endpoint}/${id}`)
    await loadSet(activeTab.value)
    toast.add({ severity: 'success', summary: 'Deleted', detail: 'Removed', life: 1500 })
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Unable to delete', life: 2500 })
  } finally {
    set.saving.value = false
  }
}

const askDelete = (item) => {
  pendingDelete.value = item
}

const cancelDelete = () => {
  pendingDelete.value = null
}

const confirmDelete = () => {
  if (!pendingDelete.value) return
  remove(pendingDelete.value.id).finally(() => {
    pendingDelete.value = null
  })
}

const modalLabel = computed(() => {
  if (activeTab.value === 'csb') return datasets.csb.form.value.id ? 'Edit CSB Type' : 'New CSB Type'
  if (activeTab.value === 'terms') return datasets.terms.form.value.id ? 'Edit Term of Invoice' : 'New Term of Invoice'
  if (activeTab.value === 'export') return datasets.export.form.value.id ? 'Edit Export Reason' : 'New Export Reason'
  if (activeTab.value === 'booking') return datasets.booking.form.value.id ? 'Edit Booking Type' : 'New Booking Type'
  return datasets.package.form.value.id ? 'Edit Package Type' : 'New Package Type'
})

onMounted(load)
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.btn-group {
  display: flex;
  gap: 0.75rem;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.6rem;
  border: 1px solid #d6ddf2;
  border-radius: 8px;
  background: #fff;
  min-width: 220px;
}

.search-box input {
  border: none;
  outline: none;
  width: 100%;
}

.tab-pills {
  display: inline-flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tab {
  padding: 0.55rem 1rem;
  border-radius: 6px;
  border: 1px solid #cbd2e6;
  background: #f8f9ff;
  color: #1a2743;
  cursor: default;
  font-weight: 700;
}

.tab.is-active {
  background: #2f64f6;
  color: #fff;
  border-color: #2f64f6;
}

.light-panel {
  background: #fff;
  border: 1px solid rgba(15, 37, 83, 0.08);
  color: #0f1f3d;
}

.table-wrap {
  overflow: auto;
  border: 1px solid #eef1f7;
  border-radius: 12px;
  background: linear-gradient(135deg, #f9fbff 0%, #ffffff 100%);
}

.fx-table {
  width: 100%;
  border-collapse: collapse;
}

.fx-table th,
.fx-table td {
  padding: 0.75rem 0.9rem;
  text-align: left;
  border-bottom: 1px solid #eef1f7;
  vertical-align: middle;
}

.fx-table thead th {
  background: #f5f7ff;
  font-weight: 700;
  color: #1a2743;
}

.fx-table tbody tr:nth-child(even) {
  background: #fafbff;
}

.fx-table td:last-child {
  border-left: 1px solid #eef1f7;
}

.muted {
  color: #7a8699;
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

.actions {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.pill-btn {
  background: #2f64f6;
  border: 1px solid #2f64f6;
  color: #fff;
  border-radius: 8px;
  padding: 0.4rem 0.9rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.pill-btn:hover {
  background: #1f54e5;
}

.pill-btn.ghost {
  background: #eef2ff;
  border-color: #c7d0f7;
  color: #1a2743;
}

.pill-btn.danger {
  background: #ff6b6b;
  border-color: #ff6b6b;
  color: #fff;
}

.pill-btn.sm {
  padding: 0.25rem 0.55rem;
  border-radius: 6px;
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
  background: #fff;
  color: #0f1f3d;
  padding: 0;
}

.page-size-select {
  appearance: none;
  border: none;
  background: transparent;
  padding: 0.35rem 1.8rem 0.35rem 0.6rem;
  font-weight: 700;
  color: #0f1f3d;
  cursor: pointer;
  min-width: 120px;
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
  width: min(480px, 96vw);
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 20px 80px rgba(12, 24, 52, 0.25);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.modal-input {
  width: 100%;
  padding: 0.65rem 0.75rem;
  border-radius: 6px;
  border: 1px solid #cbd2e6;
  background: #fff;
}

.field-label {
  display: block;
  margin-bottom: 0.3rem;
  font-weight: 600;
  color: #1a2743;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.ghost-btn {
  background: transparent;
  border: 1px solid #cbd2e6;
  color: #1a2743;
  border-radius: 8px;
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  cursor: pointer;
}

.confirm-card {
  max-width: 420px;
}
.toggle-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.75rem;
}

.switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  width: 46px;
  height: 24px;
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
.modal-card .switch {
  width: 46px;
  height: 24px;
}
.modal-card .switch input {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}
.modal-card .slider {
  width: 46px;
  height: 24px;
  background-color: #d5d9e6;
  border-radius: 999px;
  position: relative;
  transition: 0.2s;
  border: 1px solid #c2c8db;
}
.modal-card .slider::before {
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
.modal-card .switch input:checked + .slider {
  background-color: #36b47e;
  border-color: #36b47e;
}
.modal-card .switch input:checked + .slider::before {
  transform: translateX(20px);
}

.switch-label {
  font-weight: 600;
  color: #0f1f3d;
}

</style>
