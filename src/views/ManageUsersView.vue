<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../supabase'
import { UserCog, Search } from 'lucide-vue-next'

const profiles = ref([])
const isLoading = ref(true)
const searchQuery = ref('')
const filterRole = ref('all')

const fetchProfiles = async () => {
  isLoading.value = true
  try {
    // Kita tarik semua profile (Pastikan RLS di Supabase sudah DISABLE atau Allow SELECT)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    profiles.value = data || []
  } catch (error) {
    console.error('Gagal tarik data:', error.message)
  } finally {
    isLoading.value = false
  }
}

// LOGIKA SEARCH & FILTER
const filteredProfiles = computed(() => {
  return profiles.value.filter((user) => {
    const matchesSearch =
      user.email?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesFilter = filterRole.value === 'all' || user.role === filterRole.value
    return matchesSearch && matchesFilter
  })
})

const updateRole = async (id, newRole) => {
  if (!confirm(`Ubah role user ini menjadi ${newRole.toUpperCase()}?`)) return
  try {
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', id)
    if (error) throw error
    fetchProfiles()
  } catch (err) {
    alert('Gagal ubah role: ' + err.message)
  }
}

onMounted(fetchProfiles)
</script>

<template>
  <div>
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
      <div>
        <h2 class="text-3xl font-bold text-amber-500 mb-2 flex items-center gap-3">
          <UserCog class="w-8 h-8" /> Kelola Hak Akses User
        </h2>
        <p class="text-gray-400 text-sm">Cari dan atur kasta pengguna dalam ekosistem SanadFlow.</p>
      </div>

      <div class="flex flex-wrap gap-2">
        <div class="relative">
          <Search class="w-4 h-4 absolute left-3 top-3 text-gray-500" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari email atau nama..."
            class="input input-bordered input-sm pl-10 w-64 bg-[#121212] text-white border-white/10"
          />
        </div>
        <select
          v-model="filterRole"
          class="select select-bordered select-sm bg-[#121212] text-white border-white/10"
        >
          <option value="all">Semua Role</option>
          <option value="admin">Admin</option>
          <option value="contributor">Contributor</option>
          <option value="user">User Biasa</option>
        </select>
      </div>
    </div>

    <div v-if="isLoading" class="flex justify-center p-12">
      <span class="loading loading-spinner loading-lg text-amber-500"></span>
    </div>

    <div v-else class="overflow-x-auto bg-[#121212] border border-white/5 rounded-2xl shadow-lg">
      <table class="table w-full text-gray-300">
        <thead class="bg-[#1A1A1A] text-gray-400 border-b border-white/5">
          <tr>
            <th>Profil</th>
            <th>Info User</th>
            <th>Role</th>
            <th class="text-center">Aksi Perubahan</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="user in filteredProfiles"
            :key="user.id"
            class="border-b border-white/5 hover:bg-[#1E1E1E]"
          >
            <td>
              <div class="avatar placeholder">
                <div class="bg-neutral text-neutral-content rounded-full w-10">
                  <span class="text-xs">{{ user.full_name?.charAt(0) || 'U' }}</span>
                </div>
              </div>
            </td>
            <td>
              <div class="flex flex-col">
                <span class="font-bold text-white">{{ user.full_name || 'Hamba Allah' }}</span>
                <span class="text-xs text-gray-500">{{ user.email }}</span>
              </div>
            </td>
            <td>
              <span
                :class="[
                  'badge badge-sm font-bold uppercase tracking-widest',
                  user.role === 'admin'
                    ? 'badge-primary'
                    : user.role === 'contributor'
                      ? 'badge-success'
                      : 'badge-ghost',
                ]"
              >
                {{ user.role }}
              </span>
            </td>
            <td class="text-center">
              <div class="flex justify-center gap-2">
                <button
                  @click="updateRole(user.id, 'contributor')"
                  class="btn btn-xs btn-success btn-outline"
                >
                  Set Contributor
                </button>
                <button
                  @click="updateRole(user.id, 'admin')"
                  class="btn btn-xs btn-primary btn-outline"
                >
                  Set Admin
                </button>
                <button
                  @click="updateRole(user.id, 'user')"
                  class="btn btn-xs btn-ghost btn-outline text-gray-500"
                >
                  Reset
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="filteredProfiles.length === 0" class="p-12 text-center text-gray-500">
        User tidak ditemukan...
      </div>
    </div>
  </div>
</template>
