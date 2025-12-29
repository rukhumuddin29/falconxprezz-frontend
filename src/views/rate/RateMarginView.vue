<template>
  <div class="dashboard-shell">
    <div class="hero">
      <div>
        <p class="eyebrow">Pricing</p>
        <h2 class="hero-title">Rate Margin</h2>
      </div>
    </div>

    <div class="grid two-col">
      <div class="panel">
        <h4>Add / Update</h4>
        <form class="form-grid" @submit.prevent="saveMargin">
          <div class="field">
            <label class="field-label">User Type</label>
            <div class="custom-select" @click="userTypeOpen = !userTypeOpen">
              <div class="select-display">
                <span v-if="selectedUserLabel">{{ selectedUserLabel }}</span>
                <span v-else class="muted">Select role</span>
                <i :class="['pi', userTypeOpen ? 'pi-chevron-up' : 'pi-chevron-down']"></i>
              </div>
              <div v-if="userTypeOpen" class="select-dropdown">
                <div
                  v-for="opt in userTypes"
                  :key="opt.value"
                  class="select-option"
                  @click.stop="selectUserType(opt.value)"
                >
                  {{ opt.label }}
                </div>
              </div>
            </div>
          </div>
          <div class="field">
            <label class="field-label">Weight Range</label>
            <input class="input" v-model="form.weightRange" type="text" placeholder="e.g. 0 - 5 kg" />
          </div>
          <div class="field">
            <label class="field-label">Margin Amount</label>
            <input class="input" v-model="form.marginAmount" type="number" min="0" step="0.01" placeholder="0.00" />
          </div>
          <div class="field switch-field">
            <label class="field-label">Status</label>
            <label class="switch">
              <input type="checkbox" v-model="form.status" />
              <span class="slider"></span>
            </label>
          </div>
          <div class="actions">
            <button type="submit" class="primary-btn">Save</button>
            <button type="button" class="clear-btn" @click="resetForm">Clear</button>
          </div>
        </form>
      </div>

      <div class="panel">
        <h4>Existing Margins</h4>
        <div class="table">
          <div class="table-head">
            <div>#</div>
            <div>User Type</div>
            <div>Weight Range</div>
            <div>Margin</div>
            <div>Status</div>
            <div>Actions</div>
          </div>
          <div v-for="(row, idx) in margins" :key="row.id" class="table-row">
            <div>{{ idx + 1 }}</div>
            <div>{{ userLabel(row.userType) }}</div>
            <div>{{ row.weightRange }}</div>
            <div>{{ currency(row.marginAmount) }}</div>
            <div>
              <span :class="['chip-pill', row.status ? 'active' : 'inactive']">
                {{ row.status ? 'Active' : 'Inactive' }}
              </span>
            </div>
            <div class="actions-inline">
              <button class="icon-btn" type="button" @click="editRow(row)" title="Edit">
                <i class="pi pi-pencil"></i>
              </button>
              <button class="icon-btn danger" type="button" @click="deleteRow(row.id)" title="Delete">
                <i class="pi pi-trash"></i>
              </button>
            </div>
          </div>
          <div v-if="!margins.length" class="empty">No records yet</div>
        </div>
      </div>
    </div>
  </div>

  <div v-if="confirmOpen" class="confirm-backdrop">
    <div class="confirm-modal">
      <p class="confirm-title">Delete this rate margin?</p>
      <div class="confirm-actions">
        <button class="ghost-btn" type="button" @click="cancelDelete"><i class="pi pi-times"></i></button>
        <button class="primary-btn danger" type="button" @click="confirmDelete">Delete</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import api from '@/api/http'

const toast = useToast()

const userTypes = [
  { value: 4, label: 'Agent' },
  { value: 3, label: 'Vendor' },
]

const userTypeOpen = ref(false)
const margins = ref([])
const confirmOpen = ref(false)
const pendingDeleteId = ref(null)

const form = reactive({
  id: null,
  userType: '',
  weightRange: '',
  marginAmount: '',
  status: true,
})

const selectedUserLabel = computed(() => {
  const found = userTypes.find((u) => u.value === form.userType)
  return found?.label || ''
})

const selectUserType = (val) => {
  form.userType = val
  userTypeOpen.value = false
}

const resetForm = () => {
  form.id = null
  form.userType = ''
  form.weightRange = ''
  form.marginAmount = ''
  form.status = true
}

const saveMargin = async () => {
  if (!form.userType || !form.weightRange || !form.marginAmount) return
  const payload = {
    user_type: form.userType,
    weight_range: form.weightRange,
    margin_amount: Number(form.marginAmount),
    status: form.status ? 1 : 0,
  }
  const isUpdate = !!form.id
  if (isUpdate) {
    await api.patch(`/rate-margins/${form.id}`, payload)
  } else {
    await api.post('/rate-margins', payload)
  }
  await fetchMargins()
  resetForm()
  toast.add({
    severity: 'success',
    summary: 'Saved',
    detail: isUpdate ? 'Rate margin updated' : 'Rate margin created',
    life: 2000,
  })
}

const fetchMargins = async () => {
  const { data } = await api.get('/rate-margins')
  margins.value = (data.data || []).map((m) => ({
    id: m.id,
    userType: m.user_type,
    weightRange: m.weight_range,
    marginAmount: m.margin_amount,
    status: m.status,
  }))
}

const editRow = (row) => {
  form.id = row.id
  form.userType = row.userType
  form.weightRange = row.weightRange
  form.marginAmount = row.marginAmount
  form.status = !!row.status
  userTypeOpen.value = false
}

const deleteRow = (id) => {
  pendingDeleteId.value = id
  confirmOpen.value = true
}

const confirmDelete = async () => {
  if (!pendingDeleteId.value) return
  await api.delete(`/rate-margins/${pendingDeleteId.value}`)
  await fetchMargins()
  toast.add({ severity: 'success', summary: 'Deleted', detail: 'Rate margin removed', life: 2000 })
  pendingDeleteId.value = null
  confirmOpen.value = false
}

const cancelDelete = () => {
  pendingDeleteId.value = null
  confirmOpen.value = false
}

const userLabel = (val) => userTypes.find((u) => u.value === val)?.label || '-'
const currency = (val) => `₹${Number(val || 0).toFixed(2)}`

onMounted(() => {
  fetchMargins()
})
</script>

<style scoped>
.dashboard-shell {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.hero {
  padding: 0.5rem 0;
}
.hero-title {
  margin: 0;
}
.grid.two-col {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1rem;
}
.panel {
  background: #fff;
  border: 1px solid #eef1f7;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 12px 40px rgba(12, 24, 52, 0.05);
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.field-label {
  font-weight: 600;
  color: #0f1f3d;
}
.input {
  width: 100%;
  padding: 0.6rem 0.7rem;
  border-radius: 8px;
  border: 1px solid #d6ddf2;
  background: #fff;
  color: #0f1f3d;
  height: 40px;
}
.custom-select {
  position: relative;
  width: 100%;
}
.select-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.7rem;
  border-radius: 8px;
  border: 1px solid #d6ddf2;
  background: #fff;
  cursor: pointer;
}
.select-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #e1e6f2;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 12px 30px rgba(12, 24, 52, 0.15);
  z-index: 5;
}
.select-option {
  padding: 0.55rem 0.75rem;
  cursor: pointer;
}
.select-option:hover {
  background: #f4f6ff;
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
  background-color: #36b47e;
  border-color: #36b47e;
}
.switch input:checked + .slider:before {
  transform: translateX(20px);
}
.actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.25rem;
}
.primary-btn {
  background: #3152ff;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.65rem 1rem;
  cursor: pointer;
}
.clear-btn {
  background: #e6e5e5;
  color: #202020;
  border: none;
  border-radius: 8px;
  padding: 0.65rem 1rem;
  cursor: pointer;
}
.table {
  width: 100%;
}
.table-head,
.table-row {
  display: grid;
  grid-template-columns: 50px 1fr 1fr 1fr 120px 120px;
  gap: 0.5rem;
  padding: 0.6rem 0.75rem;
  align-items: center;
}
.table-head {
  background: #f6f8ff;
  border-radius: 10px;
  font-weight: 700;
}
.table-row {
  border-bottom: 1px solid #eef1f7;
}
.chip-pill {
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  font-size: 0.85rem;
}
.chip-pill.active {
  background: #e8f8ef;
  color: #1a7f4a;
}
.chip-pill.inactive {
  background: #fff1f1;
  color: #b13030;
}
.empty {
  padding: 0.75rem;
  color: #7a8699;
}
.actions-inline {
  display: flex;
  gap: 0.35rem;
}
.icon-btn {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid #d6ddf2;
  background: #fff;
  cursor: pointer;
}
.icon-btn.danger {
  border-color: #f5c7c7;
}
.icon-btn.danger .pi {
  color: #c0392b;
}
.pi-pencil {
  color: #3963ec;
}
.pi-trash {
  color: #c0392b;
}
.confirm-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: grid;
  place-items: center;
  z-index: 50;
}
.confirm-modal {
  background: #fff;
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0 12px 30px rgba(12, 24, 52, 0.2);
  width: 280px;
}
.confirm-title {
  margin: 0 0 0.75rem;
  font-weight: 700;
  color: #0f1f3d;
}
.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
.primary-btn.danger {
  background: #e74c3c;
}
input{
  font-size: 14px;
}
</style>
