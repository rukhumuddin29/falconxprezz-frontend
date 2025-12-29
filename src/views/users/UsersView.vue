<template>
  <div class="dashboard-shell">
    <div class="hero">
      <div class="hero-content">
        <div>
          <p class="eyebrow">Users</p>
          <h2 class="hero-title">New Agent Login</h2>
        </div>
      </div>
    </div>

    <Card class="panel glassy form-shell">
      <template #content>
        <div class="step-header">
          <div>
            <p class="eyebrow dark-text">User onboarding</p>
            <h3 class="title dark-text">Basic User Information</h3>
          </div>
          <div class="progress-wrap">
            <span class="muted small">{{ step }} of 2 Completed</span>
            <div class="progress-track">
              <div class="progress-bar" :style="{ width: `${(step / 2) * 100}%` }"></div>
            </div>
          </div>
        </div>

        <div class="steps-line">
          <div :class="['step-pill', step === 1 ? 'active' : '']">
            <span class="circle">{{ step > 1 ? "\u2713" : "1" }}</span>
            <span>User Details</span>
          </div>
          <div class="connector"></div>
          <div :class="['step-pill', step === 2 ? 'active' : '']">
            <span class="circle">{{ step > 2 ? "\u2713" : "2" }}</span>
            <span>Company details</span>
          </div>
        </div>

        <div v-if="step === 1" class="form-grid">
          <div class="grid-2">
            <div>
              <label class="field-label">Current City</label>
              <div class="select-search">
                <input
                  v-model="currentCitySearch"
                  class="modal-input"
                  type="text"
                  placeholder="Search city..."
                  @input="filterCurrentCities"
                  @focus="currentCityOpen = true"
                />
                <div v-if="currentCityOpen" class="options">
                  <div
                    v-for="city in filteredCurrentCities.slice(0, 10)"
                    :key="city.id"
                    class="option"
                    @click.stop="selectCurrentCity(city)"
                  >
                    {{ city.title }}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label class="field-label">User ID | Login Code</label>
              <input v-model="form.user.username" class="modal-input" readonly />
            </div>
          </div>

          <div class="grid-2">
            <div>
              <label class="field-label">Name</label>
              <input v-model="form.user.name" class="modal-input" type="text" />
            </div>
            <div>
              <label class="field-label">Email ID</label>
              <input v-model="form.user.email" class="modal-input" type="email" />
            </div>
          </div>

          <div class="grid-2">
            <div>
              <label class="field-label">Phone No</label>
              <input v-model="form.info.phone" class="modal-input" type="text" />
            </div>
            <div>
              <label class="field-label">Password</label>
              <input v-model="form.user.password" class="modal-input" type="password" />
            </div>
          </div>

          <div>
            <label class="field-label">Home Address</label>
            <input v-model="form.info.address" class="modal-input" type="text" />
          </div>

          <div class="grid-2">
            <div>
              <label class="field-label">State</label>
              <div class="select-search">
                <input
                  v-model="stateSearch"
                  class="modal-input"
                  type="text"
                  placeholder="Search state..."
                  @input="filterStates"
                  @focus="stateOpen = true"
                />
                <div v-if="stateOpen" class="options">
                  <div
                    v-for="state in filteredStates.slice(0, 10)"
                    :key="state.id"
                    class="option"
                    @click.stop="selectState(state)"
                  >
                    {{ state.title }}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label class="field-label">City</label>
              <div class="select-search">
                <input
                  v-model="citySearch"
                  class="modal-input"
                  type="text"
                  placeholder="Search city..."
                  @input="filterCitiesForState"
                  @focus="cityOpen = true"
                />
                <div v-if="cityOpen" class="options">
                  <div
                    v-for="city in filteredCities.slice(0, 10)"
                    :key="city.id"
                    class="option"
                    @click.stop="selectCity(city)"
                  >
                    {{ city.title }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="grid-2">
            <div>
              <label class="field-label">Pincode</label>
              <input v-model="form.info.zipcode" class="modal-input" type="text" />
            </div>
            <div>
              <label class="field-label">Aadhaar</label>
              <input v-model="form.info.aadhaar_number" class="modal-input" type="text" />
            </div>
          </div>

          <div class="modal-actions">
            <button class="pill-btn next" @click="goStep(2)">Next</button>
          </div>
        </div>

        <div v-else class="form-grid">
          <h3 class="title">Company Details</h3>
          <div class="grid-2">
            <div>
              <label class="field-label">Company Name</label>
              <div class="select-search">
                <input
                  v-model="form.company.company_name"
                  class="modal-input"
                  type="text"
                  placeholder="Search company..."
                  @input="searchCompanies"
                  @focus="companySuggestOpen = true"
                />
                <div v-if="companySuggestOpen && companySuggestions.length" class="options">
                  <div
                    v-for="company in companySuggestions"
                    :key="company.id"
                    class="option"
                    @click.stop="selectCompany(company)"
                  >
                    {{ company.company_name }}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label class="field-label">User Access Level</label>
              <select v-model="form.user.role_id" class="modal-input">
                <option value="">Select role</option>
                <option v-for="role in roles" :key="role.id" :value="role.id">{{ role.name }}</option>
              </select>
            </div>
          </div>

          <div class="grid-2">
            <div>
              <label class="field-label">Phone No</label>
              <input v-model="form.company.phone_number" class="modal-input" type="text" />
            </div>
            <div>
              <label class="field-label">GSTIN</label>
              <input v-model="form.company.gstin" class="modal-input" type="text" />
            </div>
          </div>

          <div>
            <label class="field-label">Address</label>
            <input v-model="form.company.address" class="modal-input" type="text" />
          </div>

          <div class="grid-2">
            <div>
              <label class="field-label">State</label>
              <div class="select-search">
                <input
                  v-model="companyStateSearch"
                  class="modal-input"
                  type="text"
                  placeholder="Search state..."
                  @input="filterCompanyStates"
                  @focus="companyStateOpen = true"
                />
                <div v-if="companyStateOpen" class="options">
                  <div
                    v-for="state in companyFilteredStates.slice(0, 10)"
                    :key="state.id"
                    class="option"
                    @click.stop="selectCompanyState(state)"
                  >
                    {{ state.title }}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label class="field-label">City</label>
              <div class="select-search">
                <input
                  v-model="companyCitySearch"
                  class="modal-input"
                  type="text"
                  placeholder="Search city..."
                  @input="filterCompanyCities"
                  @focus="companyCityOpen = true"
                />
                <div v-if="companyCityOpen" class="options">
                  <div
                    v-for="city in companyFilteredCities.slice(0, 10)"
                    :key="city.id"
                    class="option"
                    @click.stop="selectCompanyCity(city)"
                  >
                    {{ city.title }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="grid-2">
            <div>
              <label class="field-label">Pincode</label>
              <input v-model="form.company.zipcode" class="modal-input" type="text" />
            </div>
            <div></div>
          </div>

          <div class="modal-actions">
            <button class="pill-btn ghost" @click="goStep(1)">Back</button>
            <button class="pill-btn" :disabled="saving" @click="submit">
              {{ saving ? 'Saving...' : 'Create User' }}
            </button>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import api from '@/api/http'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const step = ref(1)
const saving = ref(false)
const states = ref([])
const cities = ref([])

const filteredStates = ref([])
const filteredCities = ref([])
const filteredCurrentCities = ref([])
const companyFilteredStates = ref([])
const companyFilteredCities = ref([])

const stateSearch = ref('')
const citySearch = ref('')
const currentCitySearch = ref('')
const companyStateSearch = ref('')
const companyCitySearch = ref('')

const roles = ref([])
const stateOpen = ref(false)
const cityOpen = ref(false)
const currentCityOpen = ref(false)
const companyStateOpen = ref(false)
const companyCityOpen = ref(false)
const companySuggestOpen = ref(false)
const companySuggestions = ref([])

const form = ref({
  user: {
    username: '',
    name: '',
    email: '',
    password: '',
    role_id: '',
  },
  info: {
    company_id: '',
    current_city_id: '',
    phone: '',
    address: '',
    state_id: '',
    city_id: '',
    zipcode: '',
    aadhaar_number: '',
  },
  company: {
    company_name: '',
    phone_number: '',
    address: '',
    state_id: '',
    city_id: '',
    zipcode: '',
    gstin: '',
  },
})

const goStep = (n) => {
  if (n === 2) {
    const missing = []
    if (!form.value.user.name) missing.push('Name')
    if (!form.value.user.email) missing.push('Email')
    if (!form.value.user.password) missing.push('Password')
    if (!form.value.info.state_id) missing.push('State')
    if (!form.value.info.city_id) missing.push('City')

    if (missing.length) {
      toast.add({
        severity: 'error',
        summary: 'Missing fields',
        detail: `Please fill: ${missing.join(', ')}`,
        life: 2500,
      })
      return
    }
  }
  step.value = n
}

const filterStates = () => {
  const q = stateSearch.value.toLowerCase()
  filteredStates.value = states.value.filter((s) => (s.title || '').toLowerCase().includes(q))
}

const filterCitiesForState = () => {
  const selectedState = form.value.info.state_id
  const q = citySearch.value.toLowerCase()
  filteredCities.value = cities.value
    .filter((c) => !selectedState || c.state_id === selectedState)
    .filter((c) => (c.title || '').toLowerCase().includes(q))
}

const filterCurrentCities = () => {
  const q = currentCitySearch.value.toLowerCase()
  filteredCurrentCities.value = cities.value.filter((c) => (c.title || '').toLowerCase().includes(q))
}

const filterCompanyStates = () => {
  const q = companyStateSearch.value.toLowerCase()
  companyFilteredStates.value = states.value.filter((s) => (s.title || '').toLowerCase().includes(q))
}

const filterCompanyCities = () => {
  const selected = form.value.company.state_id
  const q = companyCitySearch.value.toLowerCase()
  companyFilteredCities.value = cities.value
    .filter((c) => !selected || c.state_id === selected)
    .filter((c) => (c.title || '').toLowerCase().includes(q))
}

watch(
  () => form.value.info.state_id,
  () => {
    filterCitiesForState()
    form.value.info.city_id = ''
  }
)

watch(
  () => form.value.company.state_id,
  () => {
    filterCompanyCities()
    form.value.company.city_id = ''
  }
)

const selectState = (state) => {
  form.value.info.state_id = state.id
  stateSearch.value = state.title
  stateOpen.value = false
  filterCitiesForState()
}

const selectCity = (city) => {
  form.value.info.city_id = city.id
  citySearch.value = city.title
  cityOpen.value = false
}

const selectCurrentCity = (city) => {
  form.value.info.current_city_id = city.id
  currentCitySearch.value = city.title
  currentCityOpen.value = false
}

const selectCompanyState = (state) => {
  form.value.company.state_id = state.id
  companyStateSearch.value = state.title
  companyStateOpen.value = false
  filterCompanyCities()
}

const selectCompanyCity = (city) => {
  form.value.company.city_id = city.id
  companyCitySearch.value = city.title
  companyCityOpen.value = false
}

let companySearchTimeout
const searchCompanies = () => {
  const term = form.value.company.company_name?.trim() || ''
  form.value.info.company_id = ''
  if (term.length < 3) {
    companySuggestions.value = []
    return
  }
  clearTimeout(companySearchTimeout)
  companySearchTimeout = setTimeout(async () => {
    try {
      const { data } = await api.get('/registered-companies/search', { params: { q: term } })
      companySuggestions.value = data.data || []
    } catch (error) {
      companySuggestions.value = []
    }
  }, 200)
}

const selectCompany = (company) => {
  form.value.company.company_name = company.company_name || ''
  form.value.company.phone_number = company.phone_number || ''
  form.value.company.address = company.address || ''
  form.value.company.state_id = company.state_id || ''
  form.value.company.city_id = company.city_id || ''
  form.value.company.zipcode = company.zipcode || ''
  form.value.company.gstin = company.gstin || ''
  form.value.info.company_id = company.id || ''

  companyStateSearch.value =
    companyFilteredStates.value.find((s) => s.id === company.state_id)?.title ||
    states.value.find((s) => s.id === company.state_id)?.title ||
    ''
  companyCitySearch.value =
    companyFilteredCities.value.find((c) => c.id === company.city_id)?.title ||
    cities.value.find((c) => c.id === company.city_id)?.title ||
    ''
  companySuggestOpen.value = false
  filterCompanyCities()
}

const fetchLists = async () => {
  const [statesRes, citiesRes, nextCode, rolesRes] = await Promise.allSettled([
    api.get('/locations/states'),
    api.get('/locations/cities'),
    api.get('/users/next-code'),
    api.get('/roles'),
  ])
  states.value = statesRes.status === 'fulfilled' ? statesRes.value.data.data || [] : []
  cities.value = citiesRes.status === 'fulfilled' ? citiesRes.value.data.data || [] : []
  filteredStates.value = states.value
  filteredCities.value = cities.value
  filteredCurrentCities.value = cities.value
  companyFilteredStates.value = states.value
  companyFilteredCities.value = cities.value
  if (rolesRes.status === 'fulfilled') {
    roles.value = rolesRes.value.data.data || []
  }
  form.value.user.username = nextCode.status === 'fulfilled' ? nextCode.value.data.code || '' : ''
}

const submit = async () => {
  if (!form.value.user.name || !form.value.user.email || !form.value.user.password || !form.value.user.role_id) {
    toast.add({ severity: 'error', summary: 'Missing fields', detail: 'Fill required fields', life: 2500 })
    return
  }

  saving.value = true
  try {
    const payload = {
      user: {
        name: form.value.user.name,
        email: form.value.user.email,
        password: form.value.user.password,
        role_id: form.value.user.role_id,
      },
      info: form.value.info,
      company: form.value.company,
    }
    await api.post('/users', payload)
    toast.add({ severity: 'success', summary: 'Created', detail: 'User created', life: 2000 })
    resetForm()
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to create user', life: 2500 })
  } finally {
    saving.value = false
  }
}

onMounted(fetchLists)

const resetForm = () => {
  form.value = {
    user: {
      username: form.value.user.username,
      name: '',
      email: '',
      password: '',
      role_id: '',
    },
    info: {
      current_city_id: '',
      phone: '',
      address: '',
      state_id: '',
      city_id: '',
      zipcode: '',
      aadhaar_number: '',
    },
    company: {
      company_name: '',
      phone_number: '',
      address: '',
      state_id: '',
      city_id: '',
      zipcode: '',
      gstin: '',
    },
  }
  stateSearch.value = ''
  citySearch.value = ''
  currentCitySearch.value = ''
  companyStateSearch.value = ''
  companyCitySearch.value = ''
  stateOpen.value = false
  cityOpen.value = false
  currentCityOpen.value = false
  companyStateOpen.value = false
  companyCityOpen.value = false
  filteredStates.value = states.value
  filteredCities.value = cities.value
  filteredCurrentCities.value = cities.value
  companyFilteredStates.value = states.value
  companyFilteredCities.value = cities.value
  form.value.info.company_id = ''
  step.value = 1
}

const handleClickOutside = (event) => {
  if (!event.target.closest('.select-search')) {
    stateOpen.value = false
    cityOpen.value = false
    currentCityOpen.value = false
    companyStateOpen.value = false
    companyCityOpen.value = false
    companySuggestOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.form-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.grid-2 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.75rem;
}

.title {
  margin: 0;
}

.dark-text{
  color: #222;
}

.ghost{
  margin-right: 10px;
}

.modal-input {
  width: 100%;
  padding: 0.65rem 0.75rem;
  border-radius: 5px;
  border: 1px solid #cbd2e6;
  background: #fff;
  color: #0f1f3d;
  font-size: 1rem;
}

.modal-input::placeholder {
  color: #7a8699;
}

select.modal-input {
  appearance: none;
  background-image: linear-gradient(45deg, transparent 50%, #3c9a5f 50%), linear-gradient(135deg, #3c9a5f 50%, transparent 50%);
  background-position: right 10px center, right 5px center;
  background-size: 6px 6px, 6px 6px;
  background-repeat: no-repeat;
  max-height: 180px;
  overflow-y: auto;
  background-color: #fff;
  color: #0f1f3d;
  box-shadow: 0 6px 20px rgba(12, 24, 52, 0.12);
}

select.modal-input::-webkit-scrollbar {
  width: 8px;
}

select.modal-input::-webkit-scrollbar-track {
  background: #eef2ff;
}

select.modal-input::-webkit-scrollbar-thumb {
  background: #93a3f5;
  border-radius: 8px;
}

select.modal-input::-webkit-scrollbar-thumb:hover {
  background: #6f82f0;
}

.form-shell {
  background: #fff;
  border: 1px solid rgba(15, 37, 83, 0.08);
  border-radius: 18px;
  box-shadow: 0 16px 60px rgba(12, 24, 52, 0.08);
}

.field-label {
  display: block;
  margin-bottom: 0.3rem;
  font-weight: 600;
  color: #1a2743;
}

.step-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.progress-wrap {
  min-width: 220px;
}

.progress-track {
  height: 10px;
  background: #e6e9f2;
  border-radius: 999px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #4654d3, #7c89ff);
  width: 0;
  transition: width 0.2s ease;
}

.steps-line {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.step-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b758f;
  font-weight: 700;
}

.step-pill .circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #cbd2e6;
  display: grid;
  place-items: center;
}

.step-pill.active {
  color: #4654d3;
}

.step-pill.active .circle {
  border-color: #4654d3;
  color: #4654d3;
}

.connector {
  flex: 1;
  height: 2px;
  background: #e1e6f2;
}

.small {
  font-size: 0.85rem;
}

.select-search {
  position: relative;
  width: 100%;
}

.options {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  max-height: 220px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #cbd2e6;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(12, 24, 52, 0.15);
  z-index: 5;
}

.option {
  padding: 0.55rem 0.75rem;
  cursor: pointer;
  color: #0f1f3d;
}

.option:hover {
  background: #eef2ff;
}

.pill-btn.next {
  background: #2f64f6;
  border-color: #2f64f6;
  color: #fff;
  padding: 0.5rem 2rem;
  font-size: 1rem;
  border-radius: 5px;
}
</style>
