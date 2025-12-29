<template>
  <div class="dashboard-shell">
    <div class="hero">
      <div class="hero-content">
        <div>
          <p class="eyebrow">Configuration</p>
          <h2 class="hero-title">App Settings</h2>
        </div>
      </div>
    </div>

    <Card class="panel glassy light-panel">
      <template #content>
        <form class="form-grid" @submit.prevent="save">
          <div class="grid-2">
            <div>
              <label class="field-label">App Name</label>
              <input v-model="form.app_name" class="modal-input" type="text" required />
            </div>
            <div>
              <label class="field-label">Contact Number</label>
              <input v-model="form.contact_number" class="modal-input" type="text" />
            </div>
          </div>

          <div>
            <label class="field-label">Short Description</label>
            <input v-model="form.short_description" class="modal-input" type="text" />
          </div>

          <div class="grid-2">
            <div class="file-field">
              <label class="field-label">Company Logo</label>
              <input class="modal-input" type="file" accept="image/*" @change="handleImage($event, 'company_logo')" />
              <div v-if="previews.company_logo" class="preview">
                <img :src="previews.company_logo" alt="Company Logo" />
              </div>
            </div>
            <div class="file-field">
              <label class="field-label">Logo White (optional)</label>
              <input class="modal-input" type="file" accept="image/*" @change="handleImage($event, 'logo_white')" />
              <div v-if="previews.logo_white" class="preview">
                <img :src="previews.logo_white" alt="Logo White" />
              </div>
            </div>
          </div>

          <div class="grid-2">
            <div class="file-field">
              <label class="field-label">Logo Icon</label>
              <input class="modal-input" type="file" accept="image/*" @change="handleImage($event, 'logo_icon')" />
              <div v-if="previews.logo_icon" class="preview">
                <img :src="previews.logo_icon" alt="Logo Icon" />
              </div>
            </div>
            <div class="file-field">
              <label class="field-label">Favicon</label>
              <input class="modal-input" type="file" accept="image/*" @change="handleImage($event, 'favicon')" />
              <div v-if="previews.favicon" class="preview">
                <img :src="previews.favicon" alt="Favicon" />
              </div>
            </div>
          </div>

          <div class="grid-2">
            <div>
              <label class="field-label">Office Timing</label>
              <div class="time-row">
                <div class="time-group">
                  <select v-model="startHour" class="modal-input select-input">
                    <option v-for="h in hours" :key="h" :value="h">{{ h }}</option>
                  </select>
                  <select v-model="startMinute" class="modal-input select-input">
                    <option v-for="m in minutes" :key="m" :value="m">{{ m }}</option>
                  </select>
                  <select v-model="startPeriod" class="modal-input select-input">
                    <option v-for="p in periods" :key="p" :value="p">{{ p }}</option>
                  </select>
                </div>
                <div class="time-group">
                  <select v-model="endHour" class="modal-input select-input">
                    <option v-for="h in hours" :key="h" :value="h">{{ h }}</option>
                  </select>
                  <select v-model="endMinute" class="modal-input select-input">
                    <option v-for="m in minutes" :key="m" :value="m">{{ m }}</option>
                  </select>
                  <select v-model="endPeriod" class="modal-input select-input">
                    <option v-for="p in periods" :key="p" :value="p">{{ p }}</option>
                  </select>
                </div>
              </div>
              <p class="muted small" v-if="timingDisplay">Stored as "{{ timingDisplay }}"</p>
            </div>
            <div>
              <label class="field-label">Working Days</label>
              <div class="days">
                <button
                  v-for="day in daysOfWeek"
                  :key="day"
                  type="button"
                  :class="['day-pill', workingDays.includes(day) ? 'active' : '']"
                  @click="toggleDay(day)"
                >
                  {{ day }}
                </button>
              </div>
              <p class="muted small">Saved as comma-separated values.</p>
            </div>
          </div>

          <div class="modal-actions">
            <button class="pill-btn" type="submit" :disabled="saving">{{ saving ? 'Saving...' : 'Save Settings' }}</button>
          </div>
        </form>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '@/api/http'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const saving = ref(false)

const form = ref({
  app_name: '',
  short_description: '',
  company_logo: '',
  logo_white: '',
  logo_icon: '',
  favicon: '',
  office_timing: '',
  working_days: '',
  contact_number: '',
})

const previews = ref({
  company_logo: '',
  logo_white: '',
  logo_icon: '',
  favicon: '',
})

const backendOrigin =
  import.meta.env.VITE_BACKEND_URL ||
  (window.location.origin.includes(':5173')
    ? window.location.origin.replace(':5173', ':8000')
    : window.location.origin)

const resolveUrl = (value) => {
  if (!value || typeof value !== 'string') return ''
  if (value.startsWith('http')) return value
  const cleaned = value.replace(/^\/+/, '')
  return `${backendOrigin.replace(/\/+$/, '')}/${cleaned}`
}

const hours = ['01','02','03','04','05','06','07','08','09','10','11','12']
const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'))
const periods = ['AM', 'PM']
const startHour = ref('09')
const startMinute = ref('00')
const startPeriod = ref('AM')
const endHour = ref('06')
const endMinute = ref('00')
const endPeriod = ref('PM')
const workingDays = ref([])
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const timingDisplay = computed(() => {
  if (startHour.value && endHour.value) {
    return `${startHour.value}:${startMinute.value} ${startPeriod.value} - ${endHour.value}:${endMinute.value} ${endPeriod.value}`
  }
  return ''
})

const toggleDay = (day) => {
  if (workingDays.value.includes(day)) {
    workingDays.value = workingDays.value.filter((d) => d !== day)
  } else {
    workingDays.value = [...workingDays.value, day]
  }
}

const handleImage = (e, key) => {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    previews.value[key] = ev.target?.result || ''
    form.value[key] = file
  }
  reader.readAsDataURL(file)
}

const loadSettings = async () => {
  try {
    const { data } = await api.get('/app-settings')
    if (data && data.data) {
      form.value = { ...(form.value || {}), ...data.data }
      // hydrate previews if URLs are provided
      previews.value.company_logo = resolveUrl(data.data.company_logo)
      previews.value.logo_white = resolveUrl(data.data.logo_white)
      previews.value.logo_icon = resolveUrl(data.data.logo_icon)
      previews.value.favicon = resolveUrl(data.data.favicon)
      workingDays.value = data.data.working_days ? data.data.working_days.split(',') : []
      if (data.data.office_timing) {
        const match = data.data.office_timing.match(
          /(\d{1,2}):(\d{2})\s?(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s?(AM|PM)/i
        )
        if (match) {
          startHour.value = match[1].padStart(2, '0')
          startMinute.value = match[2]
          startPeriod.value = match[3].toUpperCase()
          endHour.value = match[4].padStart(2, '0')
          endMinute.value = match[5]
          endPeriod.value = match[6].toUpperCase()
        } else {
          form.value.office_timing = data.data.office_timing
        }
      }
    }
  } catch (e) {
    // ignore if not set yet
  }
}

const save = async () => {
  saving.value = true
  try {
    const payload = new FormData()
    payload.append('app_name', form.value.app_name || '')
    payload.append('short_description', form.value.short_description || '')
    payload.append('contact_number', form.value.contact_number || '')
    const timing = timingDisplay.value
    payload.append('office_timing', timing)
    payload.append('working_days', workingDays.value.join(','))

    const currentForm = form.value || {}
    ;['company_logo', 'logo_white', 'logo_icon', 'favicon'].forEach((key) => {
      const file = currentForm[key]
      if (file instanceof File) {
        payload.append(key, file)
      }
    })

    await api.post('/app-settings', payload, {
      headers: { 'Content-Type': 'multipart/form-data', Accept: 'application/json' },
    })
    toast.add({ severity: 'success', summary: 'Saved', detail: 'App settings updated', life: 2000 })
  } catch (error) {
    const detail = error?.response?.data?.message || 'Unable to save settings'
    console.error('Save settings failed', error?.response || error)
    toast.add({ severity: 'error', summary: 'Error', detail, life: 2500 })
  } finally {
    saving.value = false
  }
}

onMounted(loadSettings)
</script>

<style scoped>
.light-panel {
  background: #fff;
  color: #0f1f3d;
}

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

.grid-2.tight {
  grid-template-columns: repeat(2, minmax(120px, 1fr));
}

.field-label {
  display: block;
  margin-bottom: 0.3rem;
  font-weight: 600;
  color: #0f1f3d;
}

.modal-input {
  width: 100%;
  padding: 0.65rem 0.75rem;
  border-radius: 6px;
  border: 1px solid #cbd2e6;
  background: #fff;
  color: #0f1f3d;
}

.time-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 0.75rem;
}

.time-group {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.4rem;
  padding: 0.5rem;
  background: #fff;
  border: 1px solid #cbd2e6;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(12, 24, 52, 0.08);
}

.select-input {
  appearance: none;
  padding-right: 1.4rem;
  cursor: pointer;
  background-image: linear-gradient(45deg, transparent 50%, #3c9a5f 50%), linear-gradient(135deg, #3c9a5f 50%, transparent 50%);
  background-position: right 10px center, right 5px center;
  background-size: 6px 6px, 6px 6px;
  background-repeat: no-repeat;
  color: #0f1f3d;
}

.time-input {
  cursor: pointer;
  position: relative;
}

.time-input::-webkit-calendar-picker-indicator {
  opacity: 1;
  cursor: pointer;
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.muted {
  color: #7a8699;
}

.small {
  font-size: 0.85rem;
}

.file-field input[type='file'] {
  padding: 0.4rem 0.5rem;
}

.preview {
  margin-top: 0.4rem;
  padding: 0.4rem;
  border: 1px solid #e1e6f2;
  border-radius: 8px;
  background: #f9fbff;
}

.preview img {
  max-height: 80px;
  display: block;
}

.days {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.day-pill {
 padding: 0.75rem 0.7rem;
  border-radius: 8px;
  border: 1px solid #cbd2e6;
  background: #fff;
  cursor: pointer;
  color: #424242
}

.day-pill.active {
  background: #2f64f6;
  border-color: #2f64f6;
  color: #fff;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
}

.pill-btn {
  background: #2f64f6;
  border: 1px solid #2f64f6;
  color: #fff;
  border-radius: 8px;
  padding: 0.5rem 1.4rem;
  cursor: pointer;
}

.pill-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
