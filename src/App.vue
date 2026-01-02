<script setup>
import { RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { computed, onBeforeUnmount, onMounted, ref, watchEffect } from 'vue'
import api from '@/api/http'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const navCollapsed = ref(false)
const isMobile = ref(false)
const appSettings = ref(null)
const showUsersMenu = ref(false)
const showLocationsMenu = ref(false)
const mainDashboardRoute = computed(() => auth.defaultDashboardRoute || { name: 'login' })

const menuItems = [
  { label: 'Booking', icon: 'pi pi-calendar-plus', route: { name: 'booking' }, roles: ['super_admin', 'admin', 'agent'] },
  { label: 'Rate Cards', icon: 'pi pi-tags', route: { name: 'rate.cards' }, roles: ['super_admin', 'admin'], permissions: ['manage-rate-card'] },
  { label: 'Rate Margin', icon: 'pi pi-percentage', route: { name: 'rate.margins' }, roles: ['super_admin', 'admin'], permissions: ['manage-rate-margin'] },
  { label: 'Service Providers', icon: 'pi pi-truck', route: { name: 'service.providers' }, roles: ['super_admin', 'admin'], permissions: ['manage-service-providers'] },
  { label: 'Reports', icon: 'pi pi-chart-line', route: { name: 'super.dashboard' }, roles: ['super_admin', 'admin', 'vendor'] },
  { label: 'Shipment Settings', icon: 'pi pi-cog', route: { name: 'shipment.settings' }, roles: ['super_admin', 'admin'], permissions: ['manage_shipment_settings'] },
  { label: 'Roles & Permissions', icon: 'pi pi-key', route: { name: 'roles.permissions' }, roles: ['super_admin', 'admin'], permissions: ['manage_roles', 'manage_permissions'] },
  { label: 'App Settings', icon: 'pi pi-sliders-h', route: { name: 'app.settings' }, roles: ['super_admin', 'admin'], permissions: ['manage-app-settings'] },
]

const locationMenuItems = [
  { label: 'Served Countries', icon: 'pi pi-globe', route: { name: 'locations.served' }, roles: ['super_admin', 'admin'], permissions: ['manage-served-countries'] },
  { label: 'Indian Locations', icon: 'pi pi-map', route: { name: 'locations.india' }, roles: ['super_admin', 'admin'], permissions: ['manage-indian-locations'] },
  { label: 'Zones', icon: 'pi pi-flag', route: { name: 'zones' }, roles: ['super_admin', 'admin'], permissions: ['manage-zones'] },
]

const showShell = computed(() => auth.isAuthenticated)

const handleLogout = async () => {
  await auth.logout()
  router.push({ name: 'login' })
}

const visibleMenu = computed(() => {
  if (!auth.user?.roles) return []
  return menuItems.filter((item) => {
    const roleOk = item.roles.some((role) => auth.user.roles.includes(role))
    const permOk = !item.permissions || auth.hasPermission(item.permissions)
    return roleOk && permOk
  })
})

const visibleLocationMenu = computed(() => {
  if (!auth.user?.roles) return []
  return locationMenuItems.filter((item) => {
    const roleOk = item.roles.some((role) => auth.user.roles.includes(role))
    const permOk = !item.permissions || auth.hasPermission(item.permissions)
    return roleOk && permOk
  })
})

const isUsersGroupActive = computed(() => {
  return ['users', 'users.all', 'companies.list'].includes(route.name)
})

const isLocationsGroupActive = computed(() => {
  return ['locations.served', 'locations.india', 'zones'].includes(route.name)
})

watchEffect(() => {
  if (isUsersGroupActive.value) {
    showUsersMenu.value = true
  }
})

watchEffect(() => {
  if (isLocationsGroupActive.value) {
    showLocationsMenu.value = true
  }
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
            class="nav-item"
            v-if="showShell"
            @click="router.push(mainDashboardRoute)"
            title="Dashboard"
          >
            <i class="pi pi-compass"></i>
            <span>Dashboard</span>
          </button>
          <div v-if="auth.hasRole(['admin', 'super_admin']) && auth.hasPermission(['manage_users', 'manage_roles', 'manage_permissions'])" class="nav-group">
            <div
              class="nav-item nav-parent"
              :class="isUsersGroupActive ? 'is-active' : ''"
              @click="showUsersMenu = !showUsersMenu"
              title="App Users"
            >
              <div class="nav-parent-label">
                <i class="pi pi-users"></i>
                <span>App Users</span>
              </div>
              <i :class="['pi', showUsersMenu ? 'pi-chevron-up' : 'pi-chevron-down']"></i>
            </div>
            <div v-if="showUsersMenu && !navCollapsed" class="nav-submenu">
              <button class="nav-subitem" @click="router.push({ name: 'users' })" title="Create Users">
                <i class="pi pi-plus"></i>
                <span>Create Users</span>
              </button>
              <button class="nav-subitem" @click="router.push({ name: 'users.all' })" title="All Users">
                <i class="pi pi-list"></i>
                <span>All Users</span>
              </button>
              <button
                v-if="auth.hasRole(['super_admin'])"
                class="nav-subitem"
                @click="router.push({ name: 'companies.list' })"
                title="Registered Companies"
              >
                <i class="pi pi-building"></i>
                <span>Registered Companies</span>
              </button>
            </div>
          </div>
          <div v-if="visibleLocationMenu.length" class="nav-group">
            <div
              class="nav-item nav-parent"
              :class="isLocationsGroupActive ? 'is-active' : ''"
              @click="showLocationsMenu = !showLocationsMenu"
              title="Location Settings"
            >
              <div class="nav-parent-label">
                <i class="pi pi-map-marker"></i>
                <span>Location Settings</span>
              </div>
              <i :class="['pi', showLocationsMenu ? 'pi-chevron-up' : 'pi-chevron-down']"></i>
            </div>
            <div v-if="showLocationsMenu && !navCollapsed" class="nav-submenu">
              <button
                v-for="item in visibleLocationMenu"
                :key="item.label"
                class="nav-subitem"
                @click="router.push(item.route)"
                :title="item.label"
              >
                <i :class="['pi', item.icon]"></i>
                <span>{{ item.label }}</span>
              </button>
            </div>
          </div>
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

.nav-group {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  color: inherit;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.1s ease;
  font-family: inherit;
  font-size: 14px;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.16);
  transform: translateY(-1px);
}

.nav-item .pi {
  font-size: 14px;
}

.nav-parent {
  justify-content: space-between;
}

.nav-parent-label {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-submenu {
  padding: 0 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  margin-left: 0.5rem;
}

.nav-subitem {
  width: 100%;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  background: transparent;
  color: #e8edff;
  padding: 0.85rem 0 0.85rem 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.1s ease;
}

.nav-subitem:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(2px);
}

.nav-subitem i {
  font-size: 0.9rem;
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
