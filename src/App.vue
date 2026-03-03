<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { supabase } from './supabase'
import { Tv, Info, LogOut, Activity, ShieldCheck, Users, UserCog, User } from 'lucide-vue-next'
// Import SweetAlert Custom
import { confirmAction, showSuccess } from './utils/alert'

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

// FUNGSI LOGOUT DENGAN SWEETALERT
const handleLogout = async () => {
  const isConfirmed = await confirmAction(
    'Keluar dari Sistem?',
    'Sesi Anda akan diakhiri dan Anda harus login kembali untuk masuk.',
    'Ya, Logout',
  )

  if (isConfirmed) {
    await supabase.auth.signOut()
    showSuccess('Logout Berhasil', 'Sampai jumpa kembali!')
    router.push('/login')
  }
}
</script>

<template>
  <div v-if="route.name === 'login'">
    <RouterView />
  </div>

  <div v-else class="flex h-screen bg-base-200">
    <aside class="w-64 bg-[#121212] flex flex-col border-r border-base-300 z-50">
      <div class="p-6 border-b border-white/5 text-center">
        <h2 class="text-2xl font-bold text-white tracking-widest">
          SANAD<span class="text-[#2962FF]">FLOW</span>
        </h2>
        <p class="text-[10px] text-gray-500 tracking-widest mt-1 uppercase">Admin Panel</p>
      </div>

      <nav class="flex flex-col py-6 gap-2 px-4 flex-1">
        <RouterLink
          to="/"
          class="btn btn-ghost justify-start text-gray-400 hover:text-white hover:bg-[#1E1E1E]"
        >
          <Tv class="w-5 h-5 mr-3" /> Moderasi Kajian
        </RouterLink>
        <RouterLink
          to="/dai"
          class="btn btn-ghost justify-start text-gray-400 hover:text-white hover:bg-[#1E1E1E]"
        >
          <Users class="w-5 h-5 mr-3" /> Kelola Penceramah
        </RouterLink>

        <RouterLink
          v-if="isDev"
          to="/users"
          class="btn btn-ghost justify-start text-amber-500/70 hover:text-amber-400 hover:bg-[#1E1E1E]"
        >
          <UserCog class="w-5 h-5 mr-3" /> Kelola User
        </RouterLink>

        <RouterLink
          to="/activity"
          class="btn btn-ghost justify-start text-gray-400 hover:text-white hover:bg-[#1E1E1E]"
        >
          <Activity class="w-5 h-5 mr-3" /> Log Aktivitas
        </RouterLink>
      </nav>

      <div class="px-4 pb-6 flex flex-col gap-2 border-t border-white/5 pt-6">
        <RouterLink
          to="/about"
          class="btn btn-ghost justify-start text-gray-400 hover:text-white hover:bg-[#1E1E1E]"
        >
          <Info class="w-5 h-5 mr-3" /> Tentang Sistem
        </RouterLink>
        <button
          @click="handleLogout"
          class="btn btn-ghost justify-start text-red-500/70 hover:text-red-400 hover:bg-red-500/10"
        >
          <LogOut class="w-5 h-5 mr-3" /> Keluar Sistem
        </button>
      </div>
    </aside>

    <main class="flex-1 flex flex-col overflow-y-auto bg-[#1A1A1A] relative">
      <header
        class="bg-[#121212]/95 backdrop-blur-md border-b border-white/5 px-8 py-4 sticky top-0 z-40 flex justify-between items-center"
      >
        <div class="flex items-center gap-3">
          <div class="p-2 bg-[#2962FF]/10 rounded-lg">
            <ShieldCheck class="w-6 h-6 text-[#2962FF]" />
          </div>
          <h3 class="text-xl font-bold text-white tracking-wide">Dashboard Redaksi</h3>
        </div>

        <div
          class="flex items-center gap-4 bg-[#1A1A1A] py-2 pl-6 pr-2 rounded-full border border-white/5 shadow-inner"
        >
          <div class="text-right hidden md:block">
            <div class="text-sm font-bold text-white leading-none">{{ currentUser.name }}</div>
            <div
              :class="[
                'badge badge-sm uppercase text-[9px] tracking-wider mt-1.5 font-bold',
                currentUser.badgeColor,
              ]"
            >
              {{ currentUser.role }}
            </div>
          </div>

          <div class="avatar">
            <div
              class="w-11 h-11 rounded-full ring-2 ring-[#2962FF]/50 ring-offset-[#1A1A1A] ring-offset-2 overflow-hidden bg-[#121212] flex items-center justify-center shadow-lg"
            >
              <img
                v-if="currentUser.avatar"
                :src="currentUser.avatar"
                alt="Profile"
                class="w-full h-full object-cover"
              />
              <User v-else class="w-6 h-6 text-gray-500" />
            </div>
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

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: #1a1a1a;
}
::-webkit-scrollbar-thumb {
  background: #333;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
