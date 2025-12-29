<template>
  <div class="auth-wrapper">
    <div class="auth-panel">
      <div class="auth-brand">
        <span class="brand-mark">
          <img v-if="iconUrl" :src="iconUrl" alt="Logo icon" />
          <span v-else>FX</span>
        </span>
        <div>
          <p class="brand-name">{{ brandName?.toUpperCase?.() || brandName }}</p>
          <p class="brand-sub">{{ brandSub }}</p>
        </div>
      </div>

      <Card class="login-card">
        <template #title>
          <div class="card-title">
            <i class="pi pi-shield me-2"></i>
            Sign in
          </div>
        </template>
        <template #content>
          <form class="p-fluid grid form-grid" @submit.prevent="submit">
            <div class="col-12">
              <label class="field-label" for="login">Email or Username</label>
              <InputText
                id="login"
                v-model="form.login"
                class="w-full"
                placeholder="e.g. admin@falconxprezz.test or FX0001"
                autocomplete="username"
                required
              />
            </div>
            <div class="col-12">
              <label class="field-label" for="password">Password</label>
              <Password
                id="password"
                v-model="form.password"
                class="w-full"
                :feedback="false"
                toggle-mask
                placeholder="********"
                autocomplete="current-password"
                required
              />
            </div>
            <div class="col-12">
              <Button
                label="Login"
                icon="pi pi-arrow-right"
                class="w-full login-btn"
                type="submit"
                :loading="submitting"
              />
            </div>
          </form>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/auth'
import api from '@/api/http'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const toast = useToast()

const form = reactive({
  login: '',
  password: '',
})

const submitting = ref(false)
const iconUrl = ref('')
const companyLogoUrl = ref('')
const brandName = ref('Falcon Xprezz')
const brandSub = ref('Courier control center')

const backendOrigin =
  import.meta.env.VITE_BACKEND_URL ||
  (window.location.origin.includes(':5173')
    ? window.location.origin.replace(':5173', ':8000')
    : window.location.origin)

const resolveUrl = (val) => {
  if (!val) return ''
  if (val.startsWith('http')) return val
  let clean = val.replace(/^\/+/, '')
  if (!clean.startsWith('storage/')) {
    clean = `storage/${clean}`
  }
  return `${backendOrigin.replace(/\/+$/, '')}/${clean}`
}

const applyFavicon = (url) => {
  if (!url) return
  const link = document.querySelector("link[rel*='icon']") || document.createElement('link')
  link.rel = 'icon'
  link.href = url
  document.head.appendChild(link)
}

const loadAppSettings = async () => {
  try {
    const { data } = await api.get('/app-settings')
    const settings = data?.data || {}
    iconUrl.value = settings.logo_icon ? resolveUrl(settings.logo_icon) : ''
    if (settings.app_name) brandName.value = settings.app_name
    if (settings.short_description) brandSub.value = settings.short_description
    if (settings.favicon) applyFavicon(resolveUrl(settings.favicon))
  } catch {
    // ignore, will fall back to defaults
  }
}

const submit = async () => {
  submitting.value = true
  try {
    await auth.login(form)
    toast.add({ severity: 'success', summary: 'Logged in', detail: `Welcome back, ${auth.user?.name || 'user'}` })
    const redirect = route.query.redirect || auth.defaultDashboardRoute
    router.push(redirect)
  } catch (error) {
    const detail = error.response?.data?.message || error.response?.data?.errors?.login?.[0] || 'Check your credentials.'
    toast.add({ severity: 'error', summary: 'Login failed', detail })
  } finally {
    submitting.value = false
  }
}

loadAppSettings()
</script>

<style scoped>
.login-card {
  background: #17171f;
  border: 1px solid #242a3a;
  color: #fff;
}

.login-card :deep(.p-card-title),
.login-card :deep(.p-card-content),
.login-card :deep(.p-card-body) {
  color: #fff;
}

.login-card .card-title,
.login-card .card-title .pi {
  color: #fff;
}

.login-card .field-label {
  color: #fff;
}

.login-card :deep(.p-inputtext),
.login-card :deep(.p-password-input) {
  width: 100%;
  background: #0f1118;
  color: #fff;
}

.login-btn :deep(.p-button-label) {
  color: #fff;
}

.login-btn :deep(.p-button-icon) {
  color: #fff;
}

.brand-mark img {
  height: 40px;
  width: auto;
}

</style>
