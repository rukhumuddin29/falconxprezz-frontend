<template>
  <div class="dashboard-shell">
    <div class="hero">
      <div class="hero-content">
        <div>
          <p class="eyebrow">Partners</p>
          <h2 class="hero-title">Zones</h2>
        </div>
      </div>
    </div>

    <Card class="panel glassy">
      <template #content>
        <div class="toolbar">
          <div class="btn-group">
            <button class="pill-btn" v-if="activeTab === 'zones'" @click="openZoneModal()">
              <i class="pi pi-plus me-2"></i>
              New Zone
            </button>
            <button class="pill-btn" v-else @click="openZonedModal()">
              <i class="pi pi-plus me-2"></i>
              New Zoned Country
            </button>
          </div>
          <div class="search-box">
            <i class="pi pi-search"></i>
            <input
              v-if="activeTab === 'zones'"
              v-model="zoneQuery"
              type="text"
              placeholder="Search zones..."
            />
            <input
              v-else
              v-model="zonedQuery"
              type="text"
              placeholder="Search zoned countries..."
            />
          </div>
        </div>

        <div class="tab-pills">
          <button :class="['tab', activeTab === 'zones' ? 'is-active' : '']" @click="activeTab = 'zones'">
            Zones
          </button>
          <button :class="['tab', activeTab === 'zoned' ? 'is-active' : '']" @click="activeTab = 'zoned'">
            Zoned Countries
          </button>
        </div>

        <div v-if="activeTab === 'zones'" class="table-wrap">
          <table class="fx-table">
            <thead>
              <tr>
                <th width="60">#</th>
                <th>Zone Name</th>
                <th>Service Provider</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!zonesLoading && filteredZones.length === 0">
                <td colspan="5" class="muted">No zones found.</td>
              </tr>
              <tr v-else-if="zonesLoading">
                <td colspan="5" class="muted">Loading zones...</td>
              </tr>
              <tr v-for="(zone, idx) in pagedZones" :key="zone.id">
                <td>{{ (zonePage - 1) * zonePerPage + idx + 1 }}</td>
                <td>{{ zone.zone_name }}</td>
                <td>{{ zone.service_provider_title }}</td>
                <td>
                  <span :class="['status-chip', zone.status ? 'on' : 'off']">
                    {{ zone.status ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="actions">
                  <button class="pill-btn ghost sm" @click="editZone(zone)">
                    <i class="pi pi-pencil"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="table-wrap">
          <table class="fx-table">
            <thead>
              <tr>
                <th width="60">#</th>
                <th>Zone</th>
                <th>Country</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!zonedLoading && filteredZoned.length === 0">
                <td colspan="4" class="muted">No zoned countries found.</td>
              </tr>
              <tr v-else-if="zonedLoading">
                <td colspan="4" class="muted">Loading zoned countries...</td>
              </tr>
              <tr v-for="(row, idx) in pagedZoned" :key="row.id">
                <td>{{ (zonedPage - 1) * zonedPerPage + idx + 1 }}</td>
                <td>{{ row.zone_title }}</td>
                <td>{{ row.country_title }}</td>
                <td class="actions">
                  <button class="pill-btn ghost sm" @click="editZoned(row)">
                    <i class="pi pi-pencil"></i>
                  </button>
                  <button class="pill-btn ghost sm" @click="deleteZoned(row)">
                    <i class="pi pi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="activeTab === 'zones'" class="pagination">
          <div class="muted">Showing {{ pagedZones.length }} of {{ filteredZones.length }} zones</div>
          <div class="pager">
            <button class="pager-btn" :disabled="zonePage === 1" @click="zonePage--">
              <span aria-hidden="true">‹</span>
            </button>
            <span class="pager-page">Page {{ zonePage }} / {{ zonesTotalPages }}</span>
            <button class="pager-btn" :disabled="zonePage === zonesTotalPages" @click="zonePage++">
              <span aria-hidden="true">›</span>
            </button>
            <select v-model.number="zonePerPage">
              <option v-for="size in [5, 10, 20, 50]" :key="size" :value="size">{{ size }} / page</option>
            </select>
          </div>
        </div>

        <div v-else class="pagination">
          <div class="muted">Showing {{ pagedZoned.length }} of {{ filteredZoned.length }} zoned countries</div>
          <div class="pager">
            <button class="pager-btn" :disabled="zonedPage === 1" @click="zonedPage--">
              <span aria-hidden="true">‹</span>
            </button>
            <span class="pager-page">Page {{ zonedPage }} / {{ zonedTotalPages }}</span>
            <button class="pager-btn" :disabled="zonedPage === zonedTotalPages" @click="zonedPage++">
              <span aria-hidden="true">›</span>
            </button>
            <select v-model.number="zonedPerPage">
              <option v-for="size in [5, 10, 20, 50]" :key="size" :value="size">{{ size }} / page</option>
            </select>
          </div>
        </div>
      </template>
    </Card>

    <div v-if="showZoneModal" class="modal-backdrop" @click.self="closeZoneModal">
      <div class="modal">
        <h3 class="modal-title">{{ zoneForm.id ? 'Edit zone' : 'Add zone' }}</h3>
        <div class="modal-body">
          <label class="field-label">Zone Name</label>
          <input v-model="zoneForm.zone_name" type="text" class="modal-input" placeholder="Zone name" />
          <label class="field-label">Service Provider</label>
          <select v-model="zoneForm.service_provider_id" class="modal-input">
            <option value="">Select provider</option>
            <option v-for="p in providers" :key="p.id" :value="p.id">{{ p.title }}</option>
          </select>
          <label class="field-label">
            <input v-model="zoneForm.status" type="checkbox" />
            Active
          </label>
        </div>
        <div class="modal-actions">
          <button class="pill-btn ghost" @click="closeZoneModal">Cancel</button>
          <button class="pill-btn" :disabled="zoneSaving" @click="saveZone">
            {{ zoneSaving ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showZonedModal" class="modal-backdrop" @click.self="closeZonedModal">
      <div class="modal">
        <h3 class="modal-title">{{ zonedForm.id ? 'Edit zoned country' : 'Add zoned country' }}</h3>
        <div class="modal-body">
          <label class="field-label">Zone</label>
          <select v-model="zonedForm.zone_id" class="modal-input">
            <option value="">Select zone</option>
            <option v-for="z in zones" :key="z.id" :value="z.id">{{ z.zone_name }}</option>
          </select>
          <label class="field-label">Country</label>
          <select v-model="zonedForm.country_id" class="modal-input">
            <option value="">Select country</option>
            <option v-for="c in countries" :key="c.id" :value="c.id">{{ c.title }}</option>
          </select>
        </div>
        <div class="modal-actions">
          <button class="pill-btn ghost" @click="closeZonedModal">Cancel</button>
          <button class="pill-btn" :disabled="zonedSaving" @click="saveZoned">
            {{ zonedSaving ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import api from '@/api/http'

const toast = useToast()
const activeTab = ref('zones')

const zones = ref([])
const zonesLoading = ref(false)
const zoneQuery = ref('')
const zonePage = ref(1)
const zonePerPage = ref(10)
const zoneForm = ref({ id: null, zone_name: '', service_provider_id: '', status: true })
const showZoneModal = ref(false)
const zoneSaving = ref(false)

const zonedRows = ref([])
const zonedLoading = ref(false)
const zonedSaving = ref(false)
const zonedForm = ref({ id: null, zone_id: '', country_id: '' })
const zonedQuery = ref('')
const zonedPage = ref(1)
const zonedPerPage = ref(10)
const showZonedModal = ref(false)

const providers = ref([])
const countries = ref([])

const filteredZones = computed(() => {
  const q = zoneQuery.value.toLowerCase()
  return zones.value.filter(
    (z) =>
      (z.zone_name || '').toLowerCase().includes(q) ||
      (z.service_provider_title || '').toLowerCase().includes(q)
  )
})

const pagedZones = computed(() => {
  const start = (zonePage.value - 1) * zonePerPage.value
  return filteredZones.value.slice(start, start + zonePerPage.value)
})

const zonesTotalPages = computed(() => Math.max(1, Math.ceil(filteredZones.value.length / zonePerPage.value)))

const filteredZoned = computed(() => {
  const q = zonedQuery.value.toLowerCase()
  return zonedRows.value.filter(
    (r) => (r.zone_title || '').toLowerCase().includes(q) || (r.country_title || '').toLowerCase().includes(q)
  )
})

const pagedZoned = computed(() => {
  const start = (zonedPage.value - 1) * zonedPerPage.value
  return filteredZoned.value.slice(start, start + zonedPerPage.value)
})

const zonedTotalPages = computed(() => Math.max(1, Math.ceil(filteredZoned.value.length / zonedPerPage.value)))

const fetchZones = async () => {
  zonesLoading.value = true
  try {
    const { data } = await api.get('/zones')
    zones.value = data.data || []
  } finally {
    zonesLoading.value = false
  }
}

const fetchZoned = async () => {
  zonedLoading.value = true
  try {
    const { data } = await api.get('/zoned-countries')
    zonedRows.value = data.data || []
  } finally {
    zonedLoading.value = false
  }
}

const fetchProviders = async () => {
  const { data } = await api.get('/service-providers')
  providers.value = data.data || []
}

const fetchCountries = async () => {
  const { data } = await api.get('/locations/served-countries')
  countries.value = data.data || []
}

const openZoneModal = (zone = null) => {
  zoneForm.value = {
    id: zone?.id || null,
    zone_name: zone?.zone_name || '',
    service_provider_id: zone?.service_provider_id || '',
    status: zone ? !!zone.status : true,
  }
  showZoneModal.value = true
}

const closeZoneModal = () => {
  showZoneModal.value = false
}

const openZonedModal = (row = null) => {
  zonedForm.value = {
    id: row?.id || null,
    zone_id: row?.zone_id || '',
    country_id: row?.country_id || '',
  }
  showZonedModal.value = true
}

const closeZonedModal = () => {
  showZonedModal.value = false
}

const saveZone = async () => {
  if (!zoneForm.value.zone_name.trim() || !zoneForm.value.service_provider_id) return
  zoneSaving.value = true
  try {
    if (zoneForm.value.id) {
      const { data } = await api.patch(`/zones/${zoneForm.value.id}`, {
        zone_name: zoneForm.value.zone_name.trim(),
        service_provider_id: zoneForm.value.service_provider_id,
        status: zoneForm.value.status ? 1 : 0,
      })
      const updated = data.data || data
      zones.value = zones.value.map((z) => (z.id === zoneForm.value.id ? { ...updated } : z))
      toast.add({ severity: 'success', summary: 'Updated', detail: 'Zone updated', life: 1500 })
    } else {
      const { data } = await api.post('/zones', {
        zone_name: zoneForm.value.zone_name.trim(),
        service_provider_id: zoneForm.value.service_provider_id,
        status: zoneForm.value.status ? 1 : 0,
      })
      const created = data.data || data
      zones.value = [...zones.value, created]
      toast.add({ severity: 'success', summary: 'Created', detail: 'Zone added', life: 1500 })
    }
    showZoneModal.value = false
    zoneForm.value = { id: null, zone_name: '', service_provider_id: '', status: true }
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save zone', life: 2500 })
  } finally {
    zoneSaving.value = false
  }
}

const editZone = (zone) => {
  openZoneModal(zone)
}

const saveZoned = async () => {
  if (!zonedForm.value.zone_id || !zonedForm.value.country_id) return
  zonedSaving.value = true
  try {
    if (zonedForm.value.id) {
      const { data } = await api.patch(`/zoned-countries/${zonedForm.value.id}`, {
        zone_id: zonedForm.value.zone_id,
        country_id: zonedForm.value.country_id,
      })
      const updated = data.data || data
      zonedRows.value = zonedRows.value.map((r) =>
        r.id === zonedForm.value.id
          ? {
              ...updated,
              zone_title: zones.value.find((z) => z.id === updated.zone_id)?.zone_name || r.zone_title,
              country_title: countries.value.find((c) => c.id === updated.country_id)?.title || r.country_title,
            }
          : r
      )
      toast.add({ severity: 'success', summary: 'Updated', detail: 'Mapping updated', life: 1500 })
    } else {
      const { data } = await api.post('/zoned-countries', {
        zone_id: zonedForm.value.zone_id,
        country_id: zonedForm.value.country_id,
      })
      const created = data.data || data
      zonedRows.value = [
        ...zonedRows.value,
        {
          ...created,
          zone_title: zones.value.find((z) => z.id === created.zone_id)?.zone_name || 'Zone',
          country_title: countries.value.find((c) => c.id === created.country_id)?.title || 'Country',
        },
      ]
      toast.add({ severity: 'success', summary: 'Created', detail: 'Mapping added', life: 1500 })
    }
    zonedForm.value = { id: null, zone_id: '', country_id: '' }
    showZonedModal.value = false
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save mapping', life: 2500 })
  } finally {
    zonedSaving.value = false
  }
}

const editZoned = (row) => {
  zonedForm.value = { id: row.id, zone_id: row.zone_id, country_id: row.country_id }
  showZonedModal.value = true
}

const deleteZoned = async (row) => {
  const prev = [...zonedRows.value]
  zonedRows.value = zonedRows.value.filter((r) => r.id !== row.id)
  try {
    await api.delete(`/zoned-countries/${row.id}`)
    toast.add({ severity: 'success', summary: 'Deleted', detail: 'Mapping removed', life: 1500 })
  } catch (error) {
    zonedRows.value = prev
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete mapping', life: 2500 })
  }
}

onMounted(() => {
  fetchProviders()
  fetchCountries()
  fetchZones()
  fetchZoned()
})
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
  background: #fff;
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

.actions {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
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
</style>
