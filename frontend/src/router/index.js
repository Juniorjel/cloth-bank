import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

// Suppress unhandled navigation failure warnings (standard Vue Router 3 pattern)
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location, onResolve, onReject) {
  if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject)
  return originalPush.call(this, location).catch(err => {
    if (VueRouter.isNavigationFailure(err)) return err
    return Promise.reject(err)
  })
}

const originalReplace = VueRouter.prototype.replace
VueRouter.prototype.replace = function replace(location, onResolve, onReject) {
  if (onResolve || onReject) return originalReplace.call(this, location, onResolve, onReject)
  return originalReplace.call(this, location).catch(err => {
    if (VueRouter.isNavigationFailure(err)) return err
    return Promise.reject(err)
  })
}

const Login          = () => import('../views/Login.vue')
const DonateForm     = () => import('../views/DonateForm.vue')
const AdminLayout    = () => import('../layouts/AdminLayout.vue')
const AgentLayout    = () => import('../layouts/AgentLayout.vue')
const Dashboard      = () => import('../views/admin/Dashboard.vue')
const Campaigns      = () => import('../views/admin/Campaigns.vue')
const Donations      = () => import('../views/admin/Donations.vue')
const DonationDetail = () => import('../views/admin/DonationDetail.vue')
const Users          = () => import('../views/admin/Users.vue')
const Roles          = () => import('../views/admin/Roles.vue')
const ClothTypes     = () => import('../views/admin/ClothTypes.vue')
const AgentPickups   = () => import('../views/agent/Pickups.vue')

const routes = [
  { path: '/',       redirect: '/donate' },
  { path: '/login',  component: Login,      meta: { guest: true } },
  { path: '/donate', component: DonateForm, meta: { guest: true } },

  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      { path: '',              redirect: 'dashboard' },
      { path: 'dashboard',    component: Dashboard },
      { path: 'campaigns',    component: Campaigns },
      { path: 'cloth-types',  component: ClothTypes },
      { path: 'donations',    component: Donations },
      { path: 'donations/:id', component: DonationDetail },
      { path: 'users',        component: Users },
      { path: 'roles',        component: Roles },
    ]
  },

  {
    path: '/agent',
    component: AgentLayout,
    meta: { requiresAuth: true, role: 'agent' },
    children: [
      { path: '',        redirect: 'pickups' },
      { path: 'pickups', component: AgentPickups },
    ]
  },

  { path: '*', redirect: '/' }
]

const router = new VueRouter({ mode: 'history', routes })

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token') || localStorage.getItem('cb_token')
  const user  = JSON.parse(localStorage.getItem('user') || localStorage.getItem('cb_user') || 'null')

  if (to.meta.requiresAuth) {
    if (!token || !user) {
      return next({ path: '/login', query: { redirect: to.fullPath } })
    }
    if (to.meta.role && user.role !== to.meta.role) {
      return next(user.role === 'admin' ? '/admin/dashboard' : '/agent/pickups')
    }
  }

  if (to.meta.guest && token && user) {
    if (to.path === '/login') {
      return next(user.role === 'admin' ? '/admin/dashboard' : '/agent/pickups')
    }
  }

  next()
})

export default router
