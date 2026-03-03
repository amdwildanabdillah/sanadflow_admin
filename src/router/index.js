import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../supabase'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import AboutView from '../views/AboutView.vue'
import ManageDaiView from '../views/ManageDaiView.vue'
import ManageUsersView from '../views/ManageUsersView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', name: 'login', component: LoginView, meta: { requiresAuth: false } },
    { path: '/', name: 'dashboard', component: HomeView, meta: { requiresAuth: true } },
    { path: '/dai', name: 'manage-dai', component: ManageDaiView, meta: { requiresAuth: true } },
    {
      path: '/users',
      name: 'manage-users',
      component: ManageUsersView,
      meta: { requiresAuth: true, requiresDev: true },
    },
    { path: '/about', name: 'about', component: AboutView, meta: { requiresAuth: true } },
    { path: '/auth/callback', name: 'callback', redirect: '/' },
    {
      path: '/activity',
      name: 'activity',
      component: () => import('../views/ActivityLogView.vue'),
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (to.meta.requiresAuth && !session) return next({ name: 'login' })

  if (to.meta.requiresAuth && session) {
    try {
      const userEmail = session.user.email?.toLowerCase() || ''
      const isFounder = userEmail === 'amd.wildanabdillah@gmail.com'
      const isDeveloper = userEmail.includes('vixel')

      let dbRole = 'user'
      if (!isFounder && !isDeveloper) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
        if (profile) dbRole = profile.role
      }

      // CEK AKSES HALAMAN DEVELOPER (/users)
      if (to.meta.requiresDev && !isFounder && !isDeveloper) {
        alert('Akses Ditolak! Halaman ini khusus Developer/Founder.')
        return next({ name: 'dashboard' })
      }

      if (isFounder || isDeveloper || dbRole === 'admin' || dbRole === 'contributor') {
        return next()
      } else {
        alert('Akses Ditolak! Anda bukan Gatekeeper.')
        await supabase.auth.signOut()
        return next({ name: 'login' })
      }
    } catch (err) {
      await supabase.auth.signOut()
      return next({ name: 'login' })
    }
  }

  if (to.name === 'login' && session) return next({ name: 'dashboard' })
  next()
})

export default router
