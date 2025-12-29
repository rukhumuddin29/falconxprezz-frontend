import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/auth/LoginView.vue'
import UnauthorizedView from '@/views/UnauthorizedView.vue'
import RoleDashboardView from '@/views/dashboard/RoleDashboardView.vue'
import IndianLocationsView from '@/views/locations/IndianLocationsView.vue'
import ServedCountriesView from '@/views/locations/ServedCountriesView.vue'
import ServiceProvidersView from '@/views/providers/ServiceProvidersView.vue'
import ZonesView from '@/views/zones/ZonesView.vue'
import UsersView from '@/views/users/UsersView.vue'
import AllUsersView from '@/views/users/AllUsersView.vue'
import RegisteredCompaniesView from '@/views/companies/RegisteredCompaniesView.vue'
import RolesPermissionsView from '@/views/roles/RolesPermissionsView.vue'
import ShipmentSettingsView from '@/views/shipment/ShipmentSettingsView.vue'
import AppSettingsView from '@/views/settings/AppSettingsView.vue'
import BookingView from '@/views/booking/BookingView.vue'
import RateMarginView from '@/views/rate/RateMarginView.vue'
import RateCardsView from '@/views/rate/RateCardsView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: { name: 'login' },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { guest: true },
    },
    {
      path: '/unauthorized',
      name: 'unauthorized',
      component: UnauthorizedView,
    },
    {
      path: '/dashboard/super',
      name: 'super.dashboard',
      component: RoleDashboardView,
      props: { title: 'Super Admin', highlight: 'Full system visibility' },
      meta: { requiresAuth: true, roles: ['super_admin'] },
    },
    {
      path: '/dashboard/admin',
      name: 'admin.dashboard',
      component: RoleDashboardView,
      props: { title: 'Admin', highlight: 'Operations and user controls' },
      meta: { requiresAuth: true, roles: ['admin', 'super_admin'] },
    },
    {
      path: '/dashboard/vendor',
      name: 'vendor.dashboard',
      component: RoleDashboardView,
      props: { title: 'Vendor', highlight: 'Shipments and pickups' },
      meta: { requiresAuth: true, roles: ['vendor', 'admin', 'super_admin'] },
    },
    {
      path: '/dashboard/agent',
      name: 'agent.dashboard',
      component: RoleDashboardView,
      props: { title: 'Agent', highlight: 'Route and PODs' },
      meta: { requiresAuth: true, roles: ['agent', 'admin', 'super_admin'] },
    },
    {
      path: '/dashboard/customer',
      name: 'customer.dashboard',
      component: RoleDashboardView,
      props: { title: 'Customer', highlight: 'Track and manage parcels' },
      meta: { requiresAuth: true, roles: ['customer', 'vendor', 'admin', 'super_admin'] },
    },
    {
      path: '/locations/india',
      name: 'locations.india',
      component: IndianLocationsView,
      meta: { requiresAuth: true, roles: ['admin', 'super_admin'] },
    },
    {
      path: '/locations/served',
      name: 'locations.served',
      component: ServedCountriesView,
      meta: { requiresAuth: true, roles: ['admin', 'super_admin'] },
    },
    {
      path: '/service-providers',
      name: 'service.providers',
      component: ServiceProvidersView,
      meta: { requiresAuth: true, roles: ['admin', 'super_admin'] },
    },
    {
      path: '/zones',
      name: 'zones',
      component: ZonesView,
      meta: { requiresAuth: true, roles: ['admin', 'super_admin'] },
    },
    {
      path: '/users',
      name: 'users',
      component: UsersView,
      meta: { requiresAuth: true, roles: ['admin', 'super_admin'] },
    },
    {
      path: '/users/all',
      name: 'users.all',
      component: AllUsersView,
      meta: { requiresAuth: true, roles: ['admin', 'super_admin'] },
    },
    {
      path: '/companies',
      name: 'companies.list',
      component: RegisteredCompaniesView,
      meta: { requiresAuth: true, roles: ['super_admin'] },
    },
    {
      path: '/rate-margins',
      name: 'rate.margins',
      component: RateMarginView,
      meta: { requiresAuth: true, roles: ['admin', 'super_admin'] },
    },
    {
      path: '/rate-cards',
      name: 'rate.cards',
      component: RateCardsView,
      meta: { requiresAuth: true, roles: ['admin', 'super_admin'] },
    },
    {
      path: '/roles',
      name: 'roles.permissions',
      component: RolesPermissionsView,
      meta: { requiresAuth: true, roles: ['admin', 'super_admin'], permissions: ['manage_roles', 'manage_permissions'] },
    },
    {
      path: '/shipment-settings',
      name: 'shipment.settings',
      component: ShipmentSettingsView,
      meta: { requiresAuth: true, roles: ['admin', 'super_admin'], permissions: ['manage_shipment_settings'] },
    },
    {
      path: '/app-settings',
      name: 'app.settings',
      component: AppSettingsView,
      meta: { requiresAuth: true, roles: ['admin', 'super_admin'], permissions: ['manage_app_settings'] },
    },
    {
      path: '/booking',
      name: 'booking',
      component: BookingView,
      meta: { requiresAuth: true, roles: ['admin', 'super_admin', 'agent'] },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: { name: 'unauthorized' },
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()

  await auth.bootstrap()

  if (to.meta?.guest && auth.isAuthenticated) {
    return next(auth.defaultDashboardRoute)
  }

  if (to.meta?.requiresAuth && !auth.isAuthenticated) {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }

  if (to.meta?.roles?.length || to.meta?.permissions?.length) {
    if (!auth.user) {
      await auth.fetchUser().catch(() => null)
    }

    if (to.meta?.roles?.length && !auth.hasRole(to.meta.roles)) {
      return next({ name: 'unauthorized' })
    }

    if (to.meta?.permissions?.length && !auth.hasPermission(to.meta.permissions)) {
      return next({ name: 'unauthorized' })
    }
  }

  return next()
})

export default router
