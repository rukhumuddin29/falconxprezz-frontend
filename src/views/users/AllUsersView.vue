<template>
  <div class="dashboard-shell">
    <div class="hero">
      <div class="hero-content">
        <div>
          <p class="eyebrow">App Users</p>
          <h2 class="hero-title">All Users</h2>
          <p class="small-text">Search and browse users</p>
        </div>
        <div class="hero-actions">
          <button class="pill-btn" @click="$router.push({ name: 'users' })">
            <i class="pi pi-plus me-2"></i>
            Add New User
          </button>
        </div>
      </div>
    </div>

    <Card class="panel glassy">
      <template #content>
        <div class="toolbar">
          <input
            v-model="search"
            type="text"
            class="search-input"
            placeholder="Search by name, email, or username"
            @input="debouncedFetch"
          />
          <div class="filters">
            <select
              v-if="!isAdminOnly"
              v-model="companyFilter"
              class="select"
              @change="fetchUsers"
            >
              <option value="">All Companies</option>
              <option v-for="company in companies" :key="company.id" :value="company.id">
                {{ company.company_name }}
              </option>
            </select>
            <span class="muted small">Showing {{ users.length }} users</span>
          </div>
        </div>

        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Roles</th>
                <th>Company</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>{{ user.username }}</td>
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>{{ (user.roles || []).join(', ') }}</td>
                <td>{{ user.information?.company?.company_name || '—' }}</td>
              </tr>
              <tr v-if="!users.length">
                <td colspan="5" class="muted center">No users found</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="meta.total > perPage" class="pagination">
          <button class="pager-btn" :disabled="page <= 1" @click="changePage(-1)">
            <span aria-hidden="true">‹</span>
          </button>
          <span class="pager-page">Page {{ meta.current_page }} / {{ meta.last_page }}</span>
          <button class="pager-btn" :disabled="page >= meta.last_page" @click="changePage(1)">
            <span aria-hidden="true">›</span>
          </button>
          <select v-model.number="perPage" class="pager-select" @change="changePerPage">
            <option v-for="size in [10, 20, 50, 100]" :key="size" :value="size">{{ size }} / page</option>
          </select>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '@/api/http'
import { useAuthStore } from '@/stores/auth'

const search = ref('')
const users = ref([])
const companies = ref([])
const companyFilter = ref('')
const page = ref(1)
const perPage = ref(10)
const meta = ref({ current_page: 1, last_page: 1, total: 0 })
let searchTimeout
const auth = useAuthStore()
const isAdminOnly = computed(() => auth.hasRole(['admin']) && !auth.hasRole(['super_admin']))
const adminCompanyId = computed(() => auth.user?.information?.company_id || '')

const fetchUsers = async () => {
  const { data } = await api.get('/users', {
    params: {
      q: search.value || '',
      company_id: companyFilter.value || '',
      page: page.value,
      per_page: perPage.value,
    },
  })
  users.value = (data?.data || []).map((u) => ({
    ...u,
    roles: Array.isArray(u.roles) ? u.roles.map((r) => r?.name || r?.slug || r) : [],
  }))
  meta.value = {
    current_page: data?.meta?.current_page || 1,
    last_page: data?.meta?.last_page || 1,
    total: data?.meta?.total || users.value.length,
  }
}

const debouncedFetch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(fetchUsers, 300)
}

const fetchCompanies = async () => {
  const { data } = await api.get('/registered-companies')
  const list = data?.data || []
  if (isAdminOnly.value && adminCompanyId.value) {
    const match = list.find((c) => c.id === adminCompanyId.value)
    companies.value = match ? [match] : list.filter((c) => c.id === adminCompanyId.value)
    companyFilter.value = adminCompanyId.value
  } else {
    companies.value = list
  }
}

onMounted(() => {
  if (isAdminOnly.value && adminCompanyId.value) {
    companyFilter.value = adminCompanyId.value
  }
  fetchUsers()
  fetchCompanies()
})

const changePage = (direction) => {
  const next = page.value + direction
  if (next < 1 || next > meta.value.last_page) return
  page.value = next
  fetchUsers()
}

const changePerPage = () => {
  page.value = 1
  fetchUsers()
}
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  gap: 1rem;
}

.hero-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hero-actions {
  display: flex;
  align-items: center;
}

.search-input {
  flex: 1;
  border: 1px solid #dce4ff;
  border-radius: 8px;
  padding: 0.65rem 0.75rem;
  font-size: 0.95rem;
  background: #f8faff;
}

.filters {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
}

.select {
  border: 1px solid #dce4ff;
  border-radius: 8px;
  padding: 0.6rem 0.75rem;
  background: #fff;
  min-width: 180px;
}

.table-wrap {
  overflow: auto;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.pager-btn {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid #dfe5f3;
  background: #fff;
  color: #0f1f3d;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.pager-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.pager-btn:hover:not(:disabled) {
  background: #f5f7fd;
  border-color: #c8d4f0;
}

.pager-page {
  font-weight: 700;
  color: #0f1f3d;
}

.pager-select {
  border: 1px solid #69a17a;
  color: #0f1f3d;
  border-radius: 10px;
  padding: 0.4rem 0.75rem;
  background: #fff;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  text-align: left;
  padding: 0.65rem 0.5rem;
  border-bottom: 1px solid #e9ecf5;
}

.data-table th {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #556293;
}

.data-table tr:hover td {
  background: #f7f9ff;
}

.center {
  text-align: center;
}

.small-text{
  margin-top: 0;
  font-size: 13px;
}
</style>
