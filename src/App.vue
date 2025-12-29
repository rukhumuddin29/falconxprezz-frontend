<script setup>
import { RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import api from '@/api/http'

const auth = useAuthStore()
const router = useRouter()
const navCollapsed = ref(false)
const isMobile = ref(false)
const appSettings = ref(null)

const menuItems = [
  { label: 'Dashboard', icon: 'pi pi-compass', route: { name: 'super.dashboard' }, roles: ['super_admin', 'admin', 'vendor', 'agent', 'customer'] },
  { label: 'Booking', icon: 'pi pi-calendar-plus', route: { name: 'booking' }, roles: ['super_admin', 'admin', 'agent'] },
  { label: 'Create User', icon: 'pi pi-users', route: { name: 'users' }, roles: ['super_admin', 'admin'] },
  { label: 'Rate Cards', icon: 'pi pi-tags', route: { name: 'rate.cards' }, roles: ['super_admin', 'admin'] },
  { label: 'Rate Margin', icon: 'pi pi-percentage', route: { name: 'rate.margins' }, roles: ['super_admin', 'admin'] },
  { label: 'Service Providers', icon: 'pi pi-truck', route: { name: 'service.providers' }, roles: ['super_admin', 'admin'] },
  { label: 'Parcels', icon: 'pi pi-box', route: { name: 'super.dashboard' }, roles: ['super_admin', 'admin', 'vendor', 'agent'] },
  { label: 'Pickups', icon: 'pi pi-send', route: { name: 'super.dashboard' }, roles: ['super_admin', 'admin', 'vendor', 'agent'] },
  { label: 'Roles & Permissions', icon: 'pi pi-key', route: { name: 'roles.permissions' }, roles: ['super_admin', 'admin'] },
  { label: 'Reports', icon: 'pi pi-chart-line', route: { name: 'super.dashboard' }, roles: ['super_admin', 'admin', 'vendor'] },
  { label: 'Served Countries', icon: 'pi pi-globe', route: { name: 'locations.served' }, roles: ['super_admin', 'admin'] },
  { label: 'Indian Locations', icon: 'pi pi-map', route: { name: 'locations.india' }, roles: ['super_admin', 'admin'] },
  { label: 'Zones', icon: 'pi pi-flag', route: { name: 'zones' }, roles: ['super_admin', 'admin'] },
  { label: 'Shipment Settings', icon: 'pi pi-cog', route: { name: 'shipment.settings' }, roles: ['super_admin', 'admin'] },
  { label: 'App Settings', icon: 'pi pi-sliders-h', route: { name: 'app.settings' }, roles: ['super_admin', 'admin'] },
]

const showShell = computed(() => auth.isAuthenticated)

const handleLogout = async () => {
  await auth.logout()
  router.push({ name: 'login' })
}

const visibleMenu = computed(() => {
  if (!auth.user?.roles) return []
  return menuItems.filter((item) => item.roles.some((role) => auth.user.roles.includes(role)))
})

const updateIsMobile = () => {
  isMobile.value = window.innerWidth <= 960
  if (isMobile.value) {
    navCollapsed.value = true
  }
}

onMounted(() => {
  updateIsMobile()
  window.addEventListener('resize', updateIsMobile)
  fetchAppSettings()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateIsMobile)
})

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

const fetchAppSettings = async () => {
  try {
    const { data } = await api.get('/app-settings')
    appSettings.value = data?.data || null
    if (appSettings.value?.favicon) {
      applyFavicon(resolveUrl(appSettings.value.favicon))
    }
  } catch {
    appSettings.value = null
  }
}

const brandLogo = computed(() => resolveUrl(appSettings.value?.company_logo || ''))
const brandIcon = computed(() => resolveUrl(appSettings.value?.logo_icon || ''))
const brandName = computed(() => appSettings.value?.app_name || 'Falcon Xprezz')
const brandSubtitle = computed(() => appSettings.value?.short_description || 'Courier intelligence stack')
</script>

<template>
  <div class="app-shell">
    <Toast position="top-right" />
    <header class="app-bar">
      <div class="brand">
        <Button
          icon="pi pi-bars"
          class="ghost-btn"
          aria-label="Toggle navigation"
          v-if="showShell"
          @click="navCollapsed = !navCollapsed"
        />
        <div class="brand-mark">
          <img v-if="brandLogo" :src="brandLogo" alt="Company logo" />
          <span v-else>FX</span>
        </div>
      </div>
      <div class="app-actions">
        <template v-if="auth.isAuthenticated">
          <div class="user-chip">
            <i class="pi pi-user me-2"></i>
            <span>{{ auth.user?.name || 'User' }}</span>
            <span class="muted ms-2">{{ auth.user?.username }}</span>
          </div>
          <Button
            label="Logout"
            icon="pi pi-sign-out"
            severity="secondary"
            outlined
            class="logout-btn"
            @click="handleLogout"
          />
        </template>
        <template v-else>
          <Button label="Login" icon="pi pi-arrow-right" class="header-login-btn" @click="router.push({ name: 'login' })" />
        </template>
      </div>
    </header>
    <div v-if="showShell" class="layout">
      <aside :class="['side-nav', navCollapsed ? 'is-collapsed' : '', isMobile ? 'is-overlay' : '']">
        <nav class="nav-list">
          <p class="nav-heading">Navigation</p>
          <button
            v-for="item in visibleMenu"
            :key="item.label"
            class="nav-item"
            @click="router.push(item.route)"
            :title="item.label"
          >
            <i :class="['pi', item.icon]"></i>
            <span>{{ item.label }}</span>
          </button>
        </nav>
      </aside>
      <div v-if="isMobile && !navCollapsed" class="nav-backdrop" @click="navCollapsed = true"></div>
      <main class="main-area">
        <RouterView />
      </main>
    </div>
    <main v-else class="app-content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.header-login-btn {
  background: linear-gradient(135deg, #0f62fe, #1f3d7a);
  border-color: #0f62fe;
  color: #fff;
}

.header-login-btn:hover {
  background: linear-gradient(135deg, #0d58e6, #1a3367);
  border-color: #0d58e6;
}

.header-login-btn :deep(.p-button-label),
.header-login-btn :deep(.p-button-icon) {
  color: #fff;
}

.layout {
  display: grid;
  min-height: calc(100vh - 72px);
  grid-template-columns: auto 1fr;
}

.side-nav {
  background: rgba(12, 18, 36, 0.9);
  color: #e8edff;
  padding: 1rem;
  transition: width 0.2s ease, min-width 0.2s ease;
  width: 240px;
}

.side-nav.is-collapsed {
  width: 82px;
  min-width: 82px;
}

.side-nav.is-collapsed .nav-item span,
.side-nav.is-collapsed .nav-heading {
  display: none;
}

.side-nav.is-overlay {
  position: fixed;
  inset: 72px auto 0 0;
  z-index: 20;
}

.nav-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-heading {
  margin: 0 0 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.75rem;
  color: #91a4d1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  color: inherit;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.1s ease;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.16);
  transform: translateY(-1px);
}

.nav-item .pi {
  font-size: 1rem;
}

.main-area {
  padding: 1.5rem;
}

.ghost-btn {
  background: transparent;
  border: 1px solid rgba(15, 98, 254, 0.25);
  color: #0f1f3d;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  margin-right: 0.75rem;
}

.ghost-btn:hover {
  background: rgba(15, 98, 254, 0.08);
}

.brand-mark img {
  width: auto;
}

@media (max-width: 960px) {

  .side-nav {
    width: 82px;
    min-width: 82px;
  }

  .nav-item span,
  .nav-heading {
    display: none;
  }
}
</style>
