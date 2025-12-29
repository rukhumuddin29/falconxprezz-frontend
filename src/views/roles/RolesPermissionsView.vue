<template>
  <div class="dashboard-shell">
    <div class="hero">
      <div class="hero-content">
        <div>
          <p class="eyebrow">Security</p>
          <h2 class="hero-title">Roles & Permissions</h2>
        </div>
      </div>
    </div>

    <Card class="panel glassy light-panel">
      <template #content>
        <div class="toolbar">
          <div class="btn-group">
            <button class="pill-btn" @click="openModal()">
              <i class="pi pi-plus me-2"></i>
              New Role
            </button>
          </div>
          <div class="search-box">
            <i class="pi pi-search"></i>
            <input v-model="query" type="text" placeholder="Search roles..." />
          </div>
        </div>

        <div class="table-wrap">
          <table class="fx-table">
            <thead>
              <tr>
                <th width="80">#</th>
                <th>Role</th>
                <th>Slug</th>
                <th>Description</th>
                <th>Permissions</th>
                <th width="120">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="6" class="muted">Loading roles...</td>
              </tr>
              <tr v-else-if="filteredRoles.length === 0">
                <td colspan="6" class="muted">No roles found.</td>
              </tr>
              <tr v-for="(role, idx) in pagedRoles" :key="role.id">
                <td class="dark-text">{{ (page - 1) * perPage + idx + 1 }}</td>
                <td class="dark-text">{{ role.name }}</td>
                <td class="muted">{{ role.slug }}</td>
                <td>{{ role.description || '—' }}</td>
                <td>
                  <div class="perm-chips">
                    <span v-for="perm in role.permissions" :key="perm.id" class="chip">{{ perm.name }}</span>
                  </div>
                </td>
                <td class="actions">
                  <button class="pill-btn ghost sm" title="Edit" @click="openModal(role)">
                    <i class="pi pi-pencil"></i>
                  </button>
                  <button class="pill-btn danger sm" title="Delete" @click="removeRole(role.id)">
                    <i class="pi pi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination">
          <div class="muted">Showing {{ pagedRoles.length }} of {{ filteredRoles.length }} roles</div>
          <div class="pager">
            <button class="pager-btn" :disabled="page === 1" @click="page--"><span aria-hidden="true">‹</span></button>
            <span class="pager-page">Page {{ page }} / {{ totalPages }}</span>
            <button class="pager-btn" :disabled="page === totalPages" @click="page++"><span aria-hidden="true">›</span></button>
            <select v-model.number="perPage" class="pager-select">
              <option v-for="size in [5, 10, 20, 50]" :key="size" :value="size">{{ size }} / page</option>
            </select>
          </div>
        </div>
      </template>
    </Card>

    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <div class="modal-card">
        <div class="modal-header">
          <h3>{{ form.id ? 'Edit role' : 'New role' }}</h3>
          <button class="ghost-btn" @click="closeModal">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="grid-2">
            <div>
              <label class="field-label">Name</label>
              <input v-model="form.name" class="modal-input" type="text" />
            </div>
            <div>
              <label class="field-label">Slug</label>
              <input v-model="form.slug" class="modal-input" type="text" />
            </div>
          </div>
          <div>
            <label class="field-label">Description</label>
            <input v-model="form.description" class="modal-input" type="text" />
          </div>
          <div>
            <label class="field-label">Permissions</label>
            <div class="perm-list">
              <label v-for="perm in permissions" :key="perm.id" class="perm-item">
                <input type="checkbox" :value="perm.id" v-model="form.permissions" />
                <span>{{ perm.name }}</span>
              </label>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="pill-btn ghost" @click="closeModal">Cancel</button>
          <button class="pill-btn" :disabled="saving" @click="saveRole">
            {{ saving ? 'Saving...' : 'Save' }}
          </button>
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
const roles = ref([])
const permissions = ref([])
const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const query = ref('')
const page = ref(1)
const perPage = ref(10)

const form = ref({
  id: null,
  name: '',
  slug: '',
  description: '',
  permissions: [],
})

const filteredRoles = computed(() => {
  const q = query.value.toLowerCase()
  return roles.value.filter(
    (r) =>
      r.name.toLowerCase().includes(q) ||
      r.slug.toLowerCase().includes(q) ||
      (r.description || '').toLowerCase().includes(q)
  )
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRoles.value.length / perPage.value)))
const pagedRoles = computed(() => {
  const start = (page.value - 1) * perPage.value
  return filteredRoles.value.slice(start, start + perPage.value)
})

const loadData = async () => {
  loading.value = true
  try {
    const [rolesRes, permsRes] = await Promise.all([
      api.get('/roles-permissions/roles'),
      api.get('/roles-permissions/permissions'),
    ])
    roles.value = rolesRes.data.data || []
    permissions.value = permsRes.data.data || []
  } finally {
    loading.value = false
  }
}

const openModal = (role = null) => {
  if (role) {
    form.value = {
      id: role.id,
      name: role.name,
      slug: role.slug,
      description: role.description || '',
      permissions: (role.permissions || []).map((p) => p.id),
    }
  } else {
    form.value = { id: null, name: '', slug: '', description: '', permissions: [] }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const saveRole = async () => {
  if (!form.value.name || !form.value.slug) {
    toast.add({ severity: 'error', summary: 'Validation', detail: 'Name and slug are required', life: 2000 })
    return
  }
  saving.value = true
  try {
    if (form.value.id) {
      await api.patch(`/roles-permissions/roles/${form.value.id}`, form.value)
      toast.add({ severity: 'success', summary: 'Updated', detail: 'Role updated', life: 2000 })
    } else {
      await api.post('/roles-permissions/roles', form.value)
      toast.add({ severity: 'success', summary: 'Created', detail: 'Role created', life: 2000 })
    }
    await loadData()
    closeModal()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Unable to save role', life: 2500 })
  } finally {
    saving.value = false
  }
}

const removeRole = async (id) => {
  if (!confirm('Delete this role?')) return
  saving.value = true
  try {
    await api.delete(`/roles-permissions/roles/${id}`)
    toast.add({ severity: 'success', summary: 'Deleted', detail: 'Role removed', life: 2000 })
    await loadData()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Unable to delete role', life: 2500 })
  } finally {
    saving.value = false
  }
}

onMounted(loadData)
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

.table-wrap {
  overflow: auto;
  border: 1px solid #eef1f7;
  border-radius: 12px;
  background: linear-gradient(135deg, #f9fbff 0%, #ffffff 100%);
}

tbody{
  color: #7f889a;
}

.fx-table {
  width: 100%;
  border-collapse: collapse;
}

.fx-table th,
.fx-table td {
  padding: 0.75rem 0.9rem;
  text-align: left;
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

.muted {
  color: #7a8699;
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

.pager-select {
  appearance: none;
  border: 1px solid #2f7d4b;
  border-radius: 8px;
  padding: 0.35rem 1.8rem 0.35rem 0.75rem;
  background: #fff;
  color: #0f1f3d;
  font-weight: 700;
  cursor: pointer;
  background-image: linear-gradient(45deg, transparent 50%, #3c9a5f 50%), linear-gradient(135deg, #3c9a5f 50%, transparent 50%);
  background-position: right 10px center, right 5px center;
  background-size: 6px 6px, 6px 6px;
  background-repeat: no-repeat;
}

.pager-select:focus {
  outline: none;
}

.perm-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.chip {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  background: #eef2ff;
  color: #39447a;
  font-size: 0.85rem;
}

.actions {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  width: 100%;
  justify-content: flex-start;
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

.panel {
  border-radius: 18px;
}

.light-panel {
  background: #fff;
  border: 1px solid rgba(15, 37, 83, 0.08);
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
  width: min(720px, 96vw);
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
  gap: 1rem;
}

.grid-2 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
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

.perm-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.35rem;
  max-height: 260px;
  overflow-y: auto;
  padding: 0.5rem;
  border: 1px solid #d6ddf2;
  border-radius: 8px;
  background: #f9fbff;
}

.perm-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.95rem;
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
</style>
