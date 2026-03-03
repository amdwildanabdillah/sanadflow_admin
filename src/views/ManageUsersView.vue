<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../supabase'
import {
  Users,
  Search,
  Edit,
  Trash2,
  Shield,
  ShieldCheck,
  User,
  Star,
  ShieldAlert,
  Filter,
} from 'lucide-vue-next'
import { showSuccess, showError, confirmAction } from '../utils/alert'

const usersList = ref([])
const isLoading = ref(true)
const searchQuery = ref('')
const isSaving = ref(false)
const filterRole = ref('all')

const formData = ref({ id: null, full_name: '', email: '', role: 'user', avatar_url: '' })

const fetchUsers = async () => {
  isLoading.value = true
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    usersList.value = data || []
  } catch (error) {
    showError('Gagal Memuat Data', error.message)
  } finally {
    isLoading.value = false
  }
}

const filteredUsers = computed(() => {
  return usersList.value.filter((u) => {
    const nameMatch = (u.full_name || '').toLowerCase().includes(searchQuery.value.toLowerCase())
    const emailMatch = (u.email || '').toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesSearch = nameMatch || emailMatch
    if (filterRole.value === 'all') return matchesSearch
    return matchesSearch && (u.role || 'user').toLowerCase() === filterRole.value.toLowerCase()
  })
})

const setFilter = (role) => (filterRole.value = role)

const getRoleIcon = (role) => {
  switch ((role || '').toLowerCase()) {
    case 'founder':
      return Star
    case 'lead dev':
      return ShieldAlert
    case 'admin':
      return ShieldCheck
    case 'contributor':
      return Shield
    default:
      return User
  }
}

const getRoleColor = (role) => {
  switch ((role || '').toLowerCase()) {
    case 'founder':
      return 'text-amber-500 bg-amber-500/10 border-amber-500/30'
    case 'lead dev':
      return 'text-purple-500 bg-purple-500/10 border-purple-500/30'
    case 'admin':
      return 'text-success bg-success/10 border-success/30'
    case 'contributor':
      return 'text-blue-400 bg-blue-400/10 border-blue-400/30'
    default:
      return 'text-gray-400 bg-gray-500/10 border-gray-500/30'
  }
}

const openModal = (user) => {
  formData.value = {
    id: user.id,
    full_name: user.full_name || 'Tanpa Nama',
    email: user.email || '',
    role: user.role || 'user',
    avatar_url: user.avatar_url || '',
  }
  document.getElementById('modal_user').showModal()
}

const closeModal = () => document.getElementById('modal_user').close()

const saveUser = async () => {
  isSaving.value = true
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role: formData.value.role, full_name: formData.value.full_name })
      .eq('id', formData.value.id)
    if (error) throw error
    closeModal()
    fetchUsers()
    showSuccess('Akses Diperbarui', `Role berhasil diubah menjadi ${formData.value.role}.`)
  } catch (err) {
    showError('Gagal Update', err.message)
  } finally {
    isSaving.value = false
  }
}

const deleteUser = async (id, name) => {
  const isConfirmed = await confirmAction(
    'Hapus Pengguna?',
    `Yakin ingin menghapus profil "${name}"?\n(Akun Auth tidak ikut terhapus otomatis di Supabase)`,
    'Ya, Hapus Profil',
  )
  if (!isConfirmed) return
  try {
    const { error } = await supabase.from('profiles').delete().eq('id', id)
    if (error) throw error
    fetchUsers()
    showSuccess('Terhapus!', 'Profil pengguna berhasil dihapus.')
  } catch (err) {
    showError('Gagal Menghapus', err.message)
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

onMounted(fetchUsers)
</script>

<template>
  <div class="pb-24">
    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-5 mb-8">
      <div>
        <h2 class="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Users class="w-8 h-8 text-[#2962FF]" /> Pengguna Ekosistem
        </h2>
        <p class="text-gray-400 text-sm">Manajemen akses dan pantau pengguna aplikasi SanadFlow.</p>
      </div>
      <div class="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-end">
        <div
          class="flex gap-2 bg-[#121212] p-1.5 rounded-xl border border-white/5 overflow-x-auto w-full sm:w-auto scrollbar-hide"
        >
          <button
            @click="setFilter('all')"
            :class="
              filterRole === 'all'
                ? 'bg-[#2962FF] text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            "
            class="px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap"
          >
            Semua
          </button>
          <button
            @click="setFilter('founder')"
            :class="
              filterRole === 'founder'
                ? 'bg-amber-500 text-amber-900'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            "
            class="px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5"
          >
            <Star class="w-3 h-3" /> Founder
          </button>
          <button
            @click="setFilter('admin')"
            :class="
              filterRole === 'admin'
                ? 'bg-success text-success-content'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            "
            class="px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5"
          >
            <ShieldCheck class="w-3 h-3" /> Admin
          </button>
          <button
            @click="setFilter('contributor')"
            :class="
              filterRole === 'contributor'
                ? 'bg-blue-400 text-blue-900'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            "
            class="px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5"
          >
            <Shield class="w-3 h-3" /> Contributor
          </button>
          <button
            @click="setFilter('user')"
            :class="
              filterRole === 'user'
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            "
            class="px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5"
          >
            <User class="w-3 h-3" /> User
          </button>
        </div>
        <div class="relative w-full sm:w-64">
          <Search class="w-4 h-4 absolute left-4 top-3.5 text-gray-500" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari nama atau email..."
            class="input bg-[#121212] border border-white/10 text-white w-full pl-11 focus:border-[#2962FF] focus:outline-none"
          />
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="flex justify-center p-20">
      <span class="loading loading-bars loading-lg text-[#2962FF]"></span>
    </div>

    <div
      v-else-if="filteredUsers.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      <div
        v-for="user in filteredUsers"
        :key="user.id"
        class="bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden shadow-lg hover:border-white/10 hover:-translate-y-1 transition-all duration-300 flex flex-col group relative"
      >
        <div class="absolute top-3 right-3 z-10">
          <span
            :class="[
              'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border',
              getRoleColor(user.role),
            ]"
          >
            <component :is="getRoleIcon(user.role)" class="w-3 h-3" /> {{ user.role || 'User' }}
          </span>
        </div>
        <div class="p-6 flex flex-col items-center text-center mt-2">
          <div
            class="w-20 h-20 rounded-full bg-[#121212] border border-white/10 shadow-inner mb-4 overflow-hidden flex items-center justify-center relative"
          >
            <img v-if="user.avatar_url" :src="user.avatar_url" class="w-full h-full object-cover" />
            <User v-else class="w-8 h-8 text-gray-600" />
          </div>
          <h3 class="text-white font-bold text-lg mb-1 truncate w-full px-2">
            {{ user.full_name || 'Pengguna Anonim' }}
          </h3>
          <p class="text-xs text-gray-400 mb-4 truncate w-full px-2">
            {{ user.email || 'Email tidak disetel' }}
          </p>
          <div
            class="w-full flex justify-between items-center text-[10px] text-gray-500 bg-[#121212] px-3 py-2 rounded-lg border border-white/5 mt-auto"
          >
            <span>Bergabung:</span><span class="font-bold">{{ formatDate(user.created_at) }}</span>
          </div>
        </div>
        <div
          class="grid grid-cols-2 border-t border-white/5 bg-[#121212] divide-x divide-white/5 mt-auto"
        >
          <button
            @click="openModal(user)"
            class="p-3 flex items-center justify-center text-gray-400 hover:bg-[#2962FF]/10 hover:text-[#2962FF] transition-colors gap-2 text-xs font-bold uppercase tracking-wider"
          >
            <Edit class="w-4 h-4" /> Akses
          </button>
          <button
            @click="deleteUser(user.id, user.full_name)"
            class="p-3 flex items-center justify-center text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-colors gap-2 text-xs font-bold uppercase tracking-wider"
          >
            <Trash2 class="w-4 h-4" /> Hapus
          </button>
        </div>
      </div>
    </div>

    <div
      v-else
      class="flex flex-col items-center justify-center p-24 text-gray-500 bg-[#1A1A1A] rounded-2xl border border-white/5 border-dashed"
    >
      <Filter class="w-16 h-16 mb-4 opacity-20" />
      <h3 class="text-lg font-bold text-white mb-1">Pengguna Tidak Ditemukan</h3>
    </div>

    <dialog id="modal_user" class="modal">
      <div
        class="modal-box p-0 bg-[#161616] overflow-hidden max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/10 rounded-2xl"
      >
        <div
          class="px-6 md:px-8 py-5 border-b border-white/5 bg-[#121212] flex justify-between items-center sticky top-0 z-20"
        >
          <div>
            <h3 class="font-bold text-lg text-white flex items-center gap-2">
              <Shield class="w-5 h-5 text-[#2962FF]" /> Kelola Akses Pengguna
            </h3>
          </div>
          <form method="dialog">
            <button class="btn btn-sm btn-circle btn-ghost text-gray-400">✕</button>
          </form>
        </div>
        <form @submit.prevent="saveUser" class="flex flex-col p-6 md:p-8 gap-6">
          <div class="flex items-center gap-4 p-4 bg-[#1A1A1A] rounded-xl border border-white/5">
            <div
              class="w-12 h-12 rounded-full bg-[#121212] overflow-hidden flex items-center justify-center shrink-0"
            >
              <img
                v-if="formData.avatar_url"
                :src="formData.avatar_url"
                class="w-full h-full object-cover"
              />
              <User v-else class="w-6 h-6 text-gray-600" />
            </div>
            <div class="flex flex-col overflow-hidden">
              <span class="text-sm font-bold text-white truncate">{{
                formData.full_name || 'Pengguna Anonim'
              }}</span>
              <span class="text-xs text-gray-400 truncate">{{ formData.email }}</span>
            </div>
          </div>
          <div class="flex flex-col gap-5">
            <div class="flex flex-col gap-2">
              <label class="text-sm font-bold text-gray-300">Nama Tampilan</label
              ><input
                v-model="formData.full_name"
                type="text"
                class="input input-bordered bg-[#121212] border-white/10 text-white w-full focus:border-[#2962FF] focus:outline-none"
              />
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-sm font-bold text-gray-300">Tingkat Hak Akses (Role)</label>
              <select
                v-model="formData.role"
                class="select select-bordered bg-[#121212] border-white/10 text-white w-full focus:border-[#2962FF] focus:outline-none h-auto py-3"
              >
                <option value="user">User Biasa</option>
                <option value="contributor">Contributor</option>
                <option value="admin">Admin</option>
                <option value="lead dev">Lead Dev</option>
                <option value="founder">Founder</option>
              </select>
            </div>
          </div>
          <button type="submit" class="hidden"></button>
        </form>
        <div
          class="px-6 md:px-8 py-5 bg-[#121212] border-t border-white/5 flex justify-end gap-3 sticky bottom-0 z-20"
        >
          <button
            type="button"
            class="btn btn-ghost hover:bg-white/5 text-gray-400"
            @click="closeModal"
          >
            Batal
          </button>
          <button
            type="button"
            @click="saveUser"
            class="btn bg-[#2962FF] hover:bg-blue-700 text-white border-0 px-8 shadow-lg shadow-blue-500/20"
            :disabled="isSaving"
          >
            <span v-if="isSaving" class="loading loading-spinner loading-sm"></span
            >{{ isSaving ? 'Menyimpan...' : 'Update Akses' }}
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop"><button>close</button></form>
    </dialog>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
