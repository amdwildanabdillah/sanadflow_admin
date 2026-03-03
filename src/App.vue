<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { supabase } from './supabase'
import { Tv, Info, LogOut, Activity, ShieldCheck, Users, UserCog } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

// STATE UNTUK PROFIL DINAMIS
const currentUser = ref({
  name: 'Memuat...',
  role: 'Loading',
  avatar: null,
  badgeColor: 'badge-ghost',
})
const isDev = ref(false)

// FUNGSI TARIK DATA PROFIL SAAT APLIKASI DIBUKA
onMounted(async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (session) {
    const email = session.user.email?.toLowerCase() || ''
    const meta = session.user.user_metadata // Data dari Google (Nama & Foto)

    let roleName = 'Admin'
    let colorClass = 'badge-primary text-white border-0'

    // LOGIKA KASTA VIP (Sesuai Flutter)
    if (email === 'amd.wildanabdillah@gmail.com') {
      roleName = 'Founder'
      colorClass = 'bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 shadow-md' // Warna Emas Sultan
      isDev.value = true // Buka akses Dev
    } else if (email.includes('vixel')) {
      roleName = 'Lead Dev'
      colorClass = 'badge-accent text-white border-0'
      isDev.value = true // Buka akses Dev
    } else {
      // Cek ke tabel profiles kalau dia umat biasa
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()
      if (profile) {
        if (profile.role === 'contributor') {
          roleName = 'Contributor'
          colorClass = 'badge-success text-white border-0'
        }
      }
    }

    currentUser.value = {
      name: meta.full_name || meta.name || email.split('@')[0],
      avatar: meta.avatar_url || meta.picture || null, // Ambil foto dari Google
      role: roleName,
      badgeColor: colorClass,
    }
  }
})

const handleLogout = async () => {
  if (confirm('Yakin ingin keluar dari Dashboard?')) {
    await supabase.auth.signOut()
    router.push('/login')
  }
}
</script>

<template>
  <div v-if="route.name === 'login'">
    <RouterView />
  </div>

  <div v-else class="flex h-screen bg-base-200">
    <aside class="w-64 bg-[#121212] flex flex-col border-r border-base-300">
      <div class="p-6 border-b border-white/5 text-center">
        <h2 class="text-2xl font-bold text-white tracking-widest">
          SANAD<span class="text-[#2962FF]">FLOW</span>
        </h2>
        <p class="text-[10px] text-gray-500 tracking-widest mt-1 uppercase">Admin Panel</p>
      </div>
      <nav class="flex flex-col py-6 gap-2 px-4">
        <RouterLink
          to="/"
          class="btn btn-ghost justify-start text-gray-400 hover:text-white hover:bg-[#1E1E1E]"
        >
          <Tv class="w-5 h-5 mr-2" /> Moderasi Kajian
        </RouterLink>
        <RouterLink
          to="/dai"
          class="btn btn-ghost justify-start text-gray-400 hover:text-white hover:bg-[#1E1E1E]"
        >
          <Users class="w-5 h-5 mr-2" /> Kelola Penceramah
        </RouterLink>

        <RouterLink
          v-if="isDev"
          to="/users"
          class="btn btn-ghost justify-start text-amber-500/70 hover:text-amber-400 hover:bg-[#1E1E1E]"
        >
          <UserCog class="w-5 h-5 mr-2" /> Kelola User
        </RouterLink>

        <router-link
          to="/activity"
          class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-[#2962FF]/10 hover:text-[#2962FF] transition-colors"
          active-class="bg-[#2962FF] text-white hover:bg-[#2962FF] hover:text-white shadow-lg shadow-blue-500/20 font-bold"
        >
          <Activity class="w-5 h-5" />
          Log Aktivitas
        </router-link>

        <RouterLink
          to="/about"
          class="btn btn-ghost justify-start text-gray-400 hover:text-white hover:bg-[#1E1E1E] mt-auto"
        >
          <Info class="w-5 h-5 mr-2" /> Tentang Sistem
        </RouterLink>
      </nav>
    </aside>

    <main class="flex-1 flex flex-col overflow-y-auto bg-[#1A1A1A]">
      <header class="navbar bg-[#121212] border-b border-white/5 px-8 sticky top-0 z-50">
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <ShieldCheck class="w-6 h-6 text-[#2962FF]" />
            <h3 class="text-lg font-bold text-white">Dashboard Redaksi</h3>
          </div>
        </div>

        <div class="flex-none gap-4">
          <div class="flex items-center gap-4">
            <div class="text-right hidden md:block">
              <div class="text-sm font-bold text-white">{{ currentUser.name }}</div>
              <div
                :class="[
                  'badge badge-sm uppercase text-[9px] tracking-wider mt-1 font-bold',
                  currentUser.badgeColor,
                ]"
              >
                {{ currentUser.role }}
              </div>
            </div>

            <div class="avatar">
              <div class="w-10 rounded-full ring ring-[#2962FF] ring-offset-base-100 ring-offset-2">
                <img v-if="currentUser.avatar" :src="currentUser.avatar" alt="Profile" />
                <img
                  v-else
                  src="https://ui-avatars.com/api/?name=Admin&background=2962FF&color=fff"
                />
              </div>
            </div>

            <button
              @click="handleLogout"
              class="btn btn-sm btn-square btn-ghost hover:bg-error hover:text-white ml-1"
              title="Keluar"
            >
              <LogOut class="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div class="p-8 flex-1">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<style scoped>
@reference "./assets/main.css";

.router-link-exact-active {
  @apply bg-[#2962FF]/10 text-[#2962FF] border-r-4 border-[#2962FF];
}
</style>
