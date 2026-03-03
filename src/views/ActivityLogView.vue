<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import {
  Activity,
  Clock,
  PlusCircle,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  User,
  ShieldAlert,
} from 'lucide-vue-next'

const logs = ref([])
const isLoading = ref(true)

const fetchLogs = async () => {
  isLoading.value = true
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100) // Ambil 100 aktivitas terakhir

    if (error) throw error
    logs.value = data || []
  } catch (err) {
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

// Fungsi bantu milih warna icon berdasarkan aksi
const getActionStyle = (action) => {
  const act = (action || '').toLowerCase()
  if (act.includes('delete')) return { color: 'text-error', bg: 'bg-error/10', icon: Trash2 }
  if (act.includes('approve'))
    return { color: 'text-success', bg: 'bg-success/10', icon: CheckCircle }
  if (act.includes('reject')) return { color: 'text-warning', bg: 'bg-warning/10', icon: XCircle }
  if (act.includes('create'))
    return { color: 'text-[#2962FF]', bg: 'bg-[#2962FF]/10', icon: PlusCircle }
  if (act.includes('update')) return { color: 'text-amber-500', bg: 'bg-amber-500/10', icon: Edit }
  return { color: 'text-gray-400', bg: 'bg-gray-500/10', icon: Activity }
}

const formatDate = (dateString) => {
  const d = new Date(dateString)
  return d.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(fetchLogs)
</script>

<template>
  <div class="max-w-5xl mx-auto pb-24 pt-4">
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-end gap-5 mb-8 border-b border-white/5 pb-6"
    >
      <div>
        <h2 class="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Activity class="w-8 h-8 text-[#2962FF]" /> Log Aktivitas Sistem
        </h2>
        <p class="text-gray-400 text-sm">
          Pantau semua perubahan data yang dilakukan oleh tim redaksi.
        </p>
      </div>
      <button
        @click="fetchLogs"
        class="btn btn-sm btn-outline border-white/10 text-gray-300 hover:bg-white/5 hover:border-white/20"
      >
        Refresh Data
      </button>
    </div>

    <div v-if="isLoading" class="flex justify-center p-20">
      <span class="loading loading-bars loading-lg text-[#2962FF]"></span>
    </div>

    <div
      v-else-if="logs.length > 0"
      class="bg-[#121212] border border-white/5 rounded-2xl overflow-hidden shadow-xl"
    >
      <div class="divide-y divide-white/5">
        <div
          v-for="log in logs"
          :key="log.id"
          class="p-5 md:p-6 hover:bg-[#1A1A1A] transition-colors flex gap-5 items-start group"
        >
          <div
            :class="[
              'p-3 rounded-2xl shrink-0',
              getActionStyle(log.action).bg,
              getActionStyle(log.action).color,
            ]"
          >
            <component :is="getActionStyle(log.action).icon" class="w-6 h-6" />
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-2">
              <h4 class="text-white font-bold text-sm md:text-base leading-snug">
                <span class="text-gray-400 font-normal">{{ log.user_name }}</span>
                {{ log.action.toUpperCase() }}
                <span class="text-gray-400 font-normal">data di modul</span>
                {{ log.module }}
              </h4>
              <span
                class="text-[11px] text-gray-500 flex items-center gap-1.5 font-medium shrink-0"
              >
                <Clock class="w-3 h-3" /> {{ formatDate(log.created_at) }}
              </span>
            </div>
            <p
              class="text-gray-400 text-sm bg-[#1A1A1A] group-hover:bg-[#222] p-3 rounded-xl border border-white/5 inline-block"
            >
              "{{ log.description }}"
            </p>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="flex flex-col items-center justify-center p-24 text-gray-500 bg-[#1A1A1A] rounded-2xl border border-white/5 border-dashed"
    >
      <ShieldAlert class="w-16 h-16 mb-4 opacity-20" />
      <h3 class="text-lg font-bold text-white mb-1">Log Masih Kosong</h3>
      <p>Belum ada aktivitas yang terekam di sistem.</p>
    </div>
  </div>
</template>
