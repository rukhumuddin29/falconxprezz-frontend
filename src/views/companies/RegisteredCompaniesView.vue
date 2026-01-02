<template>
  <div class="dashboard-shell">
    <div class="hero">
      <div class="hero-content">
        <div>
          <p class="eyebrow">App Users</p>
          <h2 class="hero-title">Registered Companies</h2>
          <p class="small-text">Search and browse registered companies</p>
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
            placeholder="Search by company, phone, or GSTIN"
            @input="debouncedFetch"
          />
          <span class="muted small">Showing {{ companies.length }} companies</span>
        </div>

        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Phone</th>
                <th>Address</th>
                <th>GSTIN</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="company in companies" :key="company.id">
                <td>{{ company.company_name }}</td>
                <td>{{ company.phone_number || '—' }}</td>
                <td>{{ company.address || '—' }}</td>
                <td>{{ company.gstin || '—' }}</td>
              </tr>
              <tr v-if="!companies.length">
                <td colspan="4" class="muted center">No companies found</td>
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
import { onMounted, ref } from 'vue'
import api from '@/api/http'

const search = ref('')
const companies = ref([])
const page = ref(1)
const perPage = ref(10)
const meta = ref({ current_page: 1, last_page: 1, total: 0 })
let searchTimeout

const fetchCompanies = async () => {
  const { data } = await api.get('/registered-companies', {
    params: {
      q: search.value || '',
      page: page.value,
      per_page: perPage.value,
    },
  })
  companies.value = data?.data || []
  meta.value = {
    current_page: data?.meta?.current_page || 1,
    last_page: data?.meta?.last_page || 1,
    total: data?.meta?.total || companies.value.length,
  }
}

const debouncedFetch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(fetchCompanies, 300)
}

onMounted(fetchCompanies)

const changePage = (direction) => {
  const next = page.value + direction
  if (next < 1 || next > meta.value.last_page) return
  page.value = next
  fetchCompanies()
}

const changePerPage = () => {
  page.value = 1
  fetchCompanies()
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

.search-input {
  flex: 1;
  border: 1px solid #dce4ff;
  border-radius: 8px;
  padding: 0.65rem 0.75rem;
  font-size: 0.95rem;
  background: #f8faff;
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
