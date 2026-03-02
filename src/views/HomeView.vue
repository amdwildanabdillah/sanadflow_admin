<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import { CheckCircle2, XCircle, ExternalLink, BadgeCheck, Inbox } from 'lucide-vue-next'

const pendingVideos = ref([])
const isLoading = ref(true)

const fetchPendingVideos = async () => {
  isLoading.value = true
  try {
    const { data, error } = await supabase
      .from('kajian')
      .select(
        'id, title, video_url, category, created_at, source_account_name, dais ( name, is_verified )',
      )
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) throw error
    pendingVideos.value = data
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    isLoading.value = false
  }
}

const approveVideo = async (id) => {
  try {
    await supabase.from('kajian').update({ status: 'approved' }).eq('id', id)
    fetchPendingVideos()
  } catch (error) {
    alert('Error: ' + error.message)
  }
}

const rejectVideo = async (id) => {
  if (!confirm('🚨 Yakin mau menolak dan menghapus video ini dari sistem?')) return
  try {
    await supabase.from('kajian').delete().eq('id', id)
    fetchPendingVideos()
  } catch (error) {
    alert('Error: ' + error.message)
  }
}

onMounted(() => fetchPendingVideos())
</script>

<template>
  <div>
    <div class="mb-8">
      <h2 class="text-3xl font-bold text-white mb-2">Antrean Moderasi</h2>
      <p class="text-gray-400 text-sm">
        Validasi sanad dan konten kajian sebelum tayang di aplikasi SanadFlow.
      </p>
    </div>

    <div v-if="isLoading" class="flex justify-center p-12">
      <span class="loading loading-spinner loading-lg text-[#2962FF]"></span>
    </div>

    <div
      v-else-if="pendingVideos.length === 0"
      class="bg-[#121212] border border-white/5 rounded-2xl p-16 text-center shadow-lg"
    >
      <Inbox class="w-16 h-16 mx-auto text-success mb-4 opacity-80" />
      <h3 class="text-2xl font-bold text-success mb-2">Antrean Kosong!</h3>
      <p class="text-gray-400 text-sm">Seluruh video telah termoderasi. Tidak ada data pending.</p>
    </div>

    <div v-else class="overflow-x-auto bg-[#121212] border border-white/5 rounded-2xl shadow-lg">
      <table class="table w-full text-gray-300">
        <thead class="bg-[#1A1A1A] text-gray-400 border-b border-white/5">
          <tr>
            <th>No</th>
            <th>Data Kajian</th>
            <th>Penceramah</th>
            <th>Kategori</th>
            <th>Clipper / Sumber</th>
            <th class="text-center">Aksi Moderasi</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(video, index) in pendingVideos"
            :key="video.id"
            class="border-b border-white/5 hover:bg-[#1E1E1E] transition-colors"
          >
            <th>{{ index + 1 }}</th>
            <td class="max-w-xs">
              <div class="flex flex-col gap-1">
                <span class="font-bold text-white line-clamp-2 leading-snug">{{
                  video.title
                }}</span>
                <a
                  :href="video.video_url"
                  target="_blank"
                  class="flex items-center gap-1 text-[#2962FF] hover:text-blue-400 text-xs mt-1 w-fit"
                >
                  <ExternalLink class="w-3 h-3" /> Tonton Video Asli
                </a>
              </div>
            </td>
            <td>
              <div class="flex items-center gap-1.5">
                <span class="font-medium text-white">{{ video.dais?.name || 'Tanpa Nama' }}</span>
                <BadgeCheck v-if="video.dais?.is_verified" class="w-4 h-4 text-blue-500" />
              </div>
            </td>
            <td>
              <span
                class="px-3 py-1 bg-[#2962FF]/20 text-[#2962FF] rounded-md text-[10px] font-bold uppercase tracking-wider"
              >
                {{ video.category }}
              </span>
            </td>
            <td class="text-sm text-gray-400">{{ video.source_account_name || 'Hamba Allah' }}</td>
            <td>
              <div class="flex justify-center gap-2">
                <button
                  @click="approveVideo(video.id)"
                  class="btn btn-sm bg-success/10 hover:bg-success text-success hover:text-white border-0"
                >
                  <CheckCircle2 class="w-4 h-4" /> Setujui
                </button>
                <button
                  @click="rejectVideo(video.id)"
                  class="btn btn-sm bg-error/10 hover:bg-error text-error hover:text-white border-0"
                >
                  <XCircle class="w-4 h-4" /> Tolak
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
