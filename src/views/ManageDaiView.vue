<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import { Users, BadgeCheck, XCircle } from 'lucide-vue-next'

const dais = ref([])
const isLoading = ref(true)

const fetchDais = async () => {
  isLoading.value = true
  try {
    const { data, error } = await supabase
      .from('dais')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) throw error
    dais.value = data || []
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

// Fitur Toggle Centang Biru
const toggleVerification = async (id, currentStatus) => {
  const newStatus = !currentStatus
  const actionText = newStatus ? 'memberikan centang biru pada' : 'mencabut centang biru dari'
  
  if(!confirm(`Yakin ingin ${actionText} penceramah ini?`)) return
  
  try {
    const { error } = await supabase.from('dais').update({ is_verified: newStatus }).eq('id', id)
    if(error) throw error
    fetchDais()
  } catch (err) {
    alert("Gagal update status: " + err.message)
  }
}

onMounted(fetchDais)
</script>

<template>
  <div>
    <div class="mb-8">
      <h2 class="text-3xl font-bold text-white mb-2 flex items-center gap-3">
        <Users class="w-8 h-8 text-[#2962FF]" /> Kelola Database Da'i
      </h2>
      <p class="text-gray-400 text-sm">Berikan lencana verifikasi (Centang Biru) pada penceramah yang telah divalidasi sanadnya.</p>
    </div>

    <div v-if="isLoading" class="flex justify-center p-12">
      <span class="loading loading-spinner loading-lg text-[#2962FF]"></span>
    </div>

    <div v-else class="overflow-x-auto bg-[#121212] border border-white/5 rounded-2xl shadow-lg">
      <table class="table w-full text-gray-300">
        <thead class="bg-[#1A1A1A] text-gray-400 border-b border-white/5">
          <tr>
            <th>No</th>
            <th>Profil</th>
            <th>Nama Penceramah</th>
            <th>Status Validasi</th>
            <th class="text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(dai, index) in dais" :key="dai.id" class="border-b border-white/5 hover:bg-[#1E1E1E]">
            <td>{{ index + 1 }}</td>
            <td>
              <div class="avatar">
                <div class="w-10 rounded-full bg-gray-800">
                  <img v-if="dai.avatar_url" :src="dai.avatar_url" />
                  <span v-else class="flex items-center justify-center w-full h-full text-xs">?</span>
                </div>
              </div>
            </td>
            <td class="font-bold text-white">{{ dai.name }}</td>
            <td>
              <div v-if="dai.is_verified" class="flex items-center gap-1 text-blue-500 font-bold text-xs bg-blue-500/10 w-fit px-2 py-1 rounded">
                <BadgeCheck class="w-4 h-4" /> Terverifikasi
              </div>
              <div v-else class="flex items-center gap-1 text-gray-500 font-bold text-xs bg-gray-800 w-fit px-2 py-1 rounded">
                Belum Diverifikasi
              </div>
            </td>
            <td class="text-center">
              <button 
                @click="toggleVerification(dai.id, dai.is_verified)" 
                :class="['btn btn-sm border-0 text-white', dai.is_verified ? 'bg-error/20 text-error hover:bg-error' : 'bg-[#2962FF]/20 text-[#2962FF] hover:bg-[#2962FF]']"
              >
                <span v-if="dai.is_verified"><XCircle class="w-4 h-4 mr-1" /> Cabut Centang</span>
                <span v-else><BadgeCheck class="w-4 h-4 mr-1" /> Beri Centang Biru</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>