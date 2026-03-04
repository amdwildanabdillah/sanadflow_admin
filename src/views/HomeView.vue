<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../supabase'
import {
  Tv,
  CheckCircle,
  XCircle,
  Clock,
  PlayCircle,
  Users,
  BadgeCheck,
  Activity,
  Edit,
  Trash2,
  ExternalLink,
  ImageIcon,
  Plus,
  Search,
  Upload,
} from 'lucide-vue-next'
// Import SweetAlert & Logger
import { showSuccess, showError, confirmAction } from '../utils/alert'
import { logActivity } from '../utils/logger'

const kajians = ref([])
const daisList = ref([]) // Menyimpan list nama Da'i untuk dropdown
const isLoading = ref(true)
const searchQuery = ref('')
const isStatsLoading = ref(true)
const isSaving = ref(false)
const isUploading = ref(false)

const categoriesList = ref([
  'Umum',
  'Fiqih',
  'Aqidah',
  'Sejarah',
  'Muamalah',
  'Tazkiyatun Nafs',
  'Parenting',
])
const isCustomCategory = ref(false)
const filterStatus = ref('all')

const stats = ref({
  totalKajian: 0,
  pendingKajian: 0,
  totalDai: 0,
  totalUsers: 0,
})

const isEditMode = ref(false) // Penanda Edit atau Tambah Baru
const editFormData = ref({
  id: null,
  title: '',
  category: 'Umum',
  description: '',
  video_url: '',
  thumbnail_url: '',
  dai_id: '',
  status: 'approved',
})

const setFilter = (status) => {
  filterStatus.value = status
}

// Ambil list nama Da'i untuk form dropdown
const fetchDaisList = async () => {
  try {
    const { data, error } = await supabase
      .from('dais')
      .select('id, name')
      .order('name', { ascending: true })
    if (!error) daisList.value = data || []
  } catch (err) {
    console.error(err)
  }
}

const fetchStats = async () => {
  isStatsLoading.value = true
  try {
    const [resKajians, resPending, resDais, resUsers] = await Promise.all([
      supabase.from('kajian_lengkap').select('*', { count: 'exact', head: true }),
      supabase
        .from('kajian_lengkap')
        .select('*', { count: 'exact', head: true })
        .ilike('status', 'pending'),
      supabase.from('dais').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
    ])
    stats.value = {
      totalKajian: resKajians.count || 0,
      pendingKajian: resPending.count || 0,
      totalDai: resDais.count || 0,
      totalUsers: resUsers.count || 0,
    }
  } catch (err) {
    console.error('Gagal menarik data statistik:', err)
  } finally {
    isStatsLoading.value = false
  }
}

const fetchKajians = async () => {
  isLoading.value = true
  try {
    const { data, error } = await supabase
      .from('kajian_lengkap')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    kajians.value = data || []
  } catch (error) {
    showError('Gagal Memuat Data', error.message)
  } finally {
    isLoading.value = false
  }
}

const filteredKajians = computed(() => {
  let result = kajians.value
  if (filterStatus.value !== 'all') {
    result = result.filter(
      (k) => (k.status || '').toLowerCase() === filterStatus.value.toLowerCase(),
    )
  }
  if (!searchQuery.value) return result

  const query = searchQuery.value.toLowerCase()
  return result.filter(
    (k) =>
      (k.title || '').toLowerCase().includes(query) ||
      (k.dai_name || '').toLowerCase().includes(query),
  )
})

const updateStatus = async (id, newStatus, title) => {
  const action = newStatus === 'approved' ? 'MENYETUJUI' : 'MENOLAK'

  const isConfirmed = await confirmAction(
    `${action} Kajian?`,
    `Yakin ingin ${action.toLowerCase()} kajian:\n"${title}"?`,
    `Ya, Lanjutkan`,
  )
  if (!isConfirmed) return

  try {
    const { error } = await supabase.from('kajians').update({ status: newStatus }).eq('id', id)
    if (error) throw error

    // LOGGER
    await logActivity(
      'Kajian',
      'Update',
      `Mengubah status kajian "${title}" menjadi ${newStatus.toUpperCase()}`,
    )

    fetchKajians()
    fetchStats()
    showSuccess('Berhasil', `Kajian berhasil di-${newStatus}.`)
  } catch (err) {
    showError('Gagal Update', err.message)
  }
}

const openModal = (kajian = null) => {
  isCustomCategory.value = false
  if (kajian) {
    isEditMode.value = true

    // Pastikan kategori ada di list, jika tidak (custom), tambahkan sementara
    const currentCat = kajian.category || 'Umum'
    if (!categoriesList.value.includes(currentCat)) {
      categoriesList.value.push(currentCat)
    }

    editFormData.value = {
      id: kajian.id,
      title: kajian.title || '',
      category: currentCat,
      description: kajian.description || '',
      video_url: kajian.video_url || '',
      thumbnail_url: kajian.thumbnail_url || '',
      dai_id: kajian.dai_id || '',
      status: kajian.status || 'approved',
    }
  } else {
    isEditMode.value = false
    editFormData.value = {
      id: null,
      title: '',
      category: 'Umum',
      description: '',
      video_url: '',
      thumbnail_url: '',
      dai_id: '',
      status: 'approved',
    }
  }
  document.getElementById('modal_kajian').showModal()
}

const closeModal = () => document.getElementById('modal_kajian').close()

const checkCategory = () => {
  if (editFormData.value.category === '__NEW__') {
    isCustomCategory.value = true
    editFormData.value.category = ''
  }
}

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  isUploading.value = true
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `thumb-${Date.now()}.${fileExt}`
    const filePath = `thumbnails/${fileName}`

    const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file)
    if (uploadError) throw uploadError

    const { data } = supabase.storage.from('images').getPublicUrl(filePath)
    editFormData.value.thumbnail_url = data.publicUrl
    showSuccess('Upload Berhasil', 'Thumbnail berhasil diunggah')
  } catch (error) {
    showError('Gagal Upload', error.message)
  } finally {
    isUploading.value = false
  }
}

const saveKajian = async () => {
  isSaving.value = true
  try {
    const payload = {
      title: editFormData.value.title,
      category: editFormData.value.category,
      description: editFormData.value.description,
      video_url: editFormData.value.video_url,
      thumbnail_url: editFormData.value.thumbnail_url,
      dai_id: editFormData.value.dai_id,
      status: editFormData.value.status,
    }

    if (isEditMode.value) {
      const { error } = await supabase
        .from('kajians')
        .update(payload)
        .eq('id', editFormData.value.id)
      if (error) throw error
      await logActivity('Kajian', 'Update', `Memperbarui data kajian: "${payload.title}"`) // LOGGER
      showSuccess('Tersimpan!', 'Perubahan kajian berhasil disimpan.')
    } else {
      const { error } = await supabase.from('kajians').insert([payload])
      if (error) throw error
      await logActivity('Kajian', 'Create', `Menambahkan kajian baru: "${payload.title}"`) // LOGGER
      showSuccess('Berhasil!', 'Kajian baru telah ditambahkan.')
    }

    closeModal()
    fetchKajians()
    fetchStats()
  } catch (err) {
    showError('Gagal Menyimpan', err.message)
  } finally {
    isSaving.value = false
  }
}

const deleteKajian = async (id, title) => {
  const isConfirmed = await confirmAction(
    'Hapus Permanen?',
    `AWAS! Yakin ingin MENGHAPUS PERMANEN kajian:\n"${title}"?`,
    'Ya, Hapus',
  )
  if (!isConfirmed) return

  try {
    const { error } = await supabase.from('kajians').delete().eq('id', id)
    if (error) throw error

    // LOGGER
    await logActivity('Kajian', 'Delete', `Menghapus permanen kajian: "${title}"`)

    fetchKajians()
    fetchStats()
    showSuccess('Terhapus', 'Kajian telah dihapus dari database.')
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

onMounted(() => {
  fetchStats()
  fetchKajians()
  fetchDaisList()
})
</script>

<template>
  <div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div
        @click="setFilter('pending')"
        class="cursor-pointer hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(251,189,35,0.2)] transition-all duration-300 bg-gradient-to-br from-warning/20 to-[#121212] border border-warning/30 rounded-2xl p-6 shadow-lg flex items-center gap-4 relative overflow-hidden"
      >
        <div class="p-4 bg-warning/20 rounded-xl text-warning"><Clock class="w-8 h-8" /></div>
        <div>
          <p class="text-sm text-warning font-semibold tracking-wide uppercase">Butuh Review</p>
          <h4 class="text-3xl font-bold text-white mt-1">
            <span
              v-if="isStatsLoading"
              class="loading loading-spinner loading-md text-warning"
            ></span
            ><span v-else>{{ stats.pendingKajian }}</span>
          </h4>
        </div>
      </div>
      <div
        @click="setFilter('all')"
        class="cursor-pointer hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(41,98,255,0.2)] transition-all duration-300 bg-[#121212] border border-white/5 hover:border-[#2962FF]/50 rounded-2xl p-6 shadow-lg flex items-center gap-4"
      >
        <div class="p-4 bg-[#2962FF]/10 rounded-xl text-[#2962FF]"><Tv class="w-8 h-8" /></div>
        <div>
          <p class="text-sm text-gray-400 font-medium">Total Kajian</p>
          <h4 class="text-3xl font-bold text-white mt-1">
            <span
              v-if="isStatsLoading"
              class="loading loading-spinner loading-md text-[#2962FF]"
            ></span
            ><span v-else>{{ stats.totalKajian }}</span>
          </h4>
        </div>
      </div>
      <div
        class="bg-[#121212] border border-white/5 rounded-2xl p-6 shadow-lg flex items-center gap-4"
      >
        <div class="p-4 bg-success/10 rounded-xl text-success"><BadgeCheck class="w-8 h-8" /></div>
        <div>
          <p class="text-sm text-gray-400 font-medium">Da'i Terdaftar</p>
          <h4 class="text-3xl font-bold text-white mt-1">
            <span
              v-if="isStatsLoading"
              class="loading loading-spinner loading-md text-success"
            ></span
            ><span v-else>{{ stats.totalDai }}</span>
          </h4>
        </div>
      </div>
      <div
        class="bg-[#121212] border border-white/5 rounded-2xl p-6 shadow-lg flex items-center gap-4"
      >
        <div class="p-4 bg-amber-500/10 rounded-xl text-amber-500"><Users class="w-8 h-8" /></div>
        <div>
          <p class="text-sm text-gray-400 font-medium">Pengguna</p>
          <h4 class="text-3xl font-bold text-white mt-1">
            <span
              v-if="isStatsLoading"
              class="loading loading-spinner loading-md text-amber-500"
            ></span
            ><span v-else>{{ stats.totalUsers }}</span>
          </h4>
        </div>
      </div>
    </div>

    <div class="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
      <div class="flex items-center gap-4 w-full md:w-auto">
        <div
          class="w-14 h-14 rounded-2xl bg-[#2962FF]/10 flex items-center justify-center text-[#2962FF] shrink-0"
        >
          <Activity class="w-7 h-7" />
        </div>
        <div>
          <h2 class="text-2xl font-bold text-white">Studio Redaksi</h2>
          <p class="text-gray-400 text-sm">Manajemen konten video layaknya profesional.</p>
        </div>
      </div>

      <div class="relative w-full md:w-72">
        <Search class="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari judul atau da'i..."
          class="input bg-[#121212] border border-white/10 text-white w-full pl-11 focus:border-[#2962FF] focus:outline-none rounded-full h-12 shadow-inner"
        />
      </div>
    </div>

    <div class="flex flex-wrap gap-3 mb-8">
      <button
        @click="setFilter('all')"
        :class="
          filterStatus === 'all'
            ? 'bg-[#2962FF] text-white border-[#2962FF]'
            : 'bg-[#1A1A1A] text-gray-400 border-white/10 hover:border-white/30 hover:text-white'
        "
        class="btn btn-sm rounded-full border px-6 font-medium capitalize"
      >
        Semua Data
      </button>
      <button
        @click="setFilter('pending')"
        :class="
          filterStatus === 'pending'
            ? 'bg-warning text-warning-content border-warning'
            : 'bg-[#1A1A1A] text-gray-400 border-white/10 hover:border-warning/50 hover:text-warning'
        "
        class="btn btn-sm rounded-full border px-6 font-medium capitalize"
      >
        Pending Review
      </button>
      <button
        @click="setFilter('approved')"
        :class="
          filterStatus === 'approved'
            ? 'bg-success text-success-content border-success'
            : 'bg-[#1A1A1A] text-gray-400 border-white/10 hover:border-success/50 hover:text-success'
        "
        class="btn btn-sm rounded-full border px-6 font-medium capitalize"
      >
        Telah Tayang
      </button>
      <button
        @click="setFilter('rejected')"
        :class="
          filterStatus === 'rejected'
            ? 'bg-error text-white border-error'
            : 'bg-[#1A1A1A] text-gray-400 border-white/10 hover:border-error/50 hover:text-error'
        "
        class="btn btn-sm rounded-full border px-6 font-medium capitalize"
      >
        Ditolak
      </button>
    </div>

    <div v-if="isLoading" class="flex justify-center p-20">
      <span class="loading loading-bars loading-lg text-[#2962FF]"></span>
    </div>
    <div
      v-else-if="filteredKajians.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      <div
        v-for="kajian in filteredKajians"
        :key="kajian.id"
        class="bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden shadow-lg hover:border-white/10 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
      >
        <div class="relative aspect-video bg-black group">
          <img
            v-if="kajian.thumbnail_url"
            :src="kajian.thumbnail_url"
            class="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
          />
          <div
            v-else
            class="w-full h-full flex flex-col items-center justify-center text-gray-600 bg-[#121212]"
          >
            <Tv class="w-8 h-8 mb-2 opacity-50" /><span class="text-xs">No Image</span>
          </div>
          <div class="absolute top-3 left-3">
            <div
              v-if="(kajian.status || '').toLowerCase() === 'pending'"
              class="badge badge-warning gap-1 text-[10px] font-bold border-0 shadow-md"
            >
              <Clock class="w-3 h-3" /> Pending
            </div>
            <div
              v-else-if="(kajian.status || '').toLowerCase() === 'approved'"
              class="badge badge-success gap-1 text-[10px] font-bold border-0 text-white shadow-md"
            >
              <CheckCircle class="w-3 h-3" /> Approved
            </div>
            <div
              v-else-if="(kajian.status || '').toLowerCase() === 'rejected'"
              class="badge badge-error gap-1 text-[10px] font-bold border-0 text-white shadow-md"
            >
              <XCircle class="w-3 h-3" /> Rejected
            </div>
          </div>
          <div
            class="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white border border-white/10 uppercase tracking-wider"
          >
            {{ kajian.category || 'Umum' }}
          </div>
          <a
            :href="kajian.video_url"
            target="_blank"
            class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm z-10 cursor-pointer"
            ><div class="bg-[#2962FF] p-3 rounded-full text-white shadow-lg shadow-blue-500/50">
              <PlayCircle class="w-6 h-6" /></div
          ></a>
        </div>

        <div class="p-4 flex-1 flex flex-col">
          <h3
            class="text-white font-bold text-sm line-clamp-2 leading-snug mb-2"
            :title="kajian.title"
          >
            {{ kajian.title }}
          </h3>
          <div class="flex items-center gap-1.5 mt-auto mb-3">
            <div class="avatar placeholder">
              <div class="bg-neutral text-neutral-content rounded-full w-5 h-5">
                <span class="text-[8px]">{{ (kajian.dai_name || 'U').charAt(0) }}</span>
              </div>
            </div>
            <span class="text-xs text-gray-400 truncate">{{
              kajian.dai_name || "Ustadz / Da'i"
            }}</span>
            <BadgeCheck v-if="kajian.is_verified" class="w-3 h-3 text-blue-500 shrink-0" />
          </div>
          <div
            class="text-[10px] text-gray-500 flex justify-between items-center border-t border-white/5 pt-3"
          >
            <span>Diupload: {{ formatDate(kajian.created_at) }}</span
            ><a
              :href="kajian.video_url"
              target="_blank"
              class="hover:text-[#2962FF] flex items-center gap-1"
              >Cek <ExternalLink class="w-3 h-3"
            /></a>
          </div>
        </div>

        <div class="grid grid-cols-4 border-t border-white/5 bg-[#121212] divide-x divide-white/5">
          <button
            @click="updateStatus(kajian.id, 'approved', kajian.title)"
            :class="[
              'p-3 flex items-center justify-center transition-colors',
              (kajian.status || '').toLowerCase() === 'approved'
                ? 'text-success bg-success/10 cursor-not-allowed'
                : 'text-gray-400 hover:bg-success/20 hover:text-success',
            ]"
            :disabled="(kajian.status || '').toLowerCase() === 'approved'"
            title="Approve Tayang"
          >
            <CheckCircle class="w-4 h-4" />
          </button>
          <button
            @click="updateStatus(kajian.id, 'rejected', kajian.title)"
            :class="[
              'p-3 flex items-center justify-center transition-colors',
              (kajian.status || '').toLowerCase() === 'rejected'
                ? 'text-error bg-error/10 cursor-not-allowed'
                : 'text-gray-400 hover:bg-error/20 hover:text-error',
            ]"
            :disabled="(kajian.status || '').toLowerCase() === 'rejected'"
            title="Tolak Kajian"
          >
            <XCircle class="w-4 h-4" />
          </button>
          <button
            @click="openModal(kajian)"
            class="p-3 flex items-center justify-center text-gray-400 hover:bg-amber-500/20 hover:text-amber-500 transition-colors"
            title="Edit Data"
          >
            <Edit class="w-4 h-4" />
          </button>
          <button
            @click="deleteKajian(kajian.id, kajian.title)"
            class="p-3 flex items-center justify-center text-gray-400 hover:bg-red-500/20 hover:text-red-500 transition-colors"
            title="Hapus Permanen"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <div
      v-else
      class="flex flex-col items-center justify-center p-24 text-gray-500 bg-[#1A1A1A] rounded-2xl border border-white/5 border-dashed"
    >
      <Tv class="w-16 h-16 mb-4 opacity-20" />
      <h3 class="text-lg font-bold text-white mb-1">Ruang Redaksi Kosong</h3>
      <p>Tidak ada kajian dalam status "{{ filterStatus }}".</p>
    </div>

    <dialog id="modal_kajian" class="modal">
      <div
        class="modal-box p-0 bg-[#161616] overflow-hidden max-w-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/10 rounded-2xl"
      >
        <div
          class="px-8 py-5 border-b border-white/5 bg-[#121212] flex justify-between items-center sticky top-0 z-20"
        >
          <div>
            <h3 class="font-bold text-xl text-white flex items-center gap-2">
              <Tv class="w-5 h-5 text-[#2962FF]" />
              {{ isEditMode ? 'Edit Kajian' : 'Tambah Kajian Baru' }}
            </h3>
          </div>
          <form method="dialog">
            <button
              class="btn btn-sm btn-circle btn-ghost text-gray-400 hover:text-white hover:bg-white/10 bg-[#1A1A1A]"
            >
              ✕
            </button>
          </form>
        </div>

        <form
          @submit.prevent="saveKajian"
          class="flex flex-col h-full max-h-[75vh] overflow-y-auto p-6 md:p-8 gap-6"
        >
          <div
            class="w-full aspect-video bg-black rounded-xl overflow-hidden border border-white/10 relative shadow-inner flex-shrink-0"
          >
            <img
              v-if="editFormData.thumbnail_url"
              :src="editFormData.thumbnail_url"
              class="w-full h-full object-cover"
              @error="editFormData.thumbnail_url = ''"
            />
            <div
              v-else
              class="absolute inset-0 flex flex-col items-center justify-center text-gray-600 bg-[#1A1A1A]"
            >
              <Tv class="w-8 h-8 mb-2 opacity-50" /><span class="text-sm font-medium"
                >Gambar Tidak Valid</span
              >
            </div>
            <div
              class="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white uppercase border border-white/10"
            >
              Live Preview
            </div>
          </div>

          <div class="flex flex-col gap-5">
            <div class="flex flex-col gap-2">
              <label class="text-sm font-bold text-gray-300">Judul Kajian</label
              ><input
                v-model="editFormData.title"
                type="text"
                class="input input-bordered bg-[#121212] border-white/10 text-white w-full focus:border-[#2962FF] focus:outline-none"
                required
                placeholder="Masukkan judul video..."
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-bold text-gray-300">Penceramah (Da'i) *</label>
                <select
                  v-model="editFormData.dai_id"
                  class="select select-bordered bg-[#121212] border-white/10 text-white w-full focus:border-[#2962FF] focus:outline-none"
                  required
                >
                  <option value="" disabled>Pilih Da'i...</option>
                  <option v-for="dai in daisList" :key="dai.id" :value="dai.id">
                    {{ dai.name }}
                  </option>
                </select>
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-bold text-gray-300">Kategori Topik</label>
                <div v-if="!isCustomCategory">
                  <select
                    v-model="editFormData.category"
                    class="select select-bordered bg-[#121212] border-white/10 text-white w-full focus:border-[#2962FF] focus:outline-none"
                    required
                    @change="checkCategory"
                  >
                    <option v-for="cat in categoriesList" :key="cat" :value="cat">{{ cat }}</option>
                    <option value="__NEW__" class="font-bold text-[#2962FF] bg-[#1A1A1A]">
                      + Tambah Kategori Baru...
                    </option>
                  </select>
                </div>
                <div v-else class="flex gap-2">
                  <input
                    v-model="editFormData.category"
                    type="text"
                    class="input input-bordered bg-[#121212] border-white/10 text-white w-full focus:border-[#2962FF] focus:outline-none"
                    placeholder="Tulis nama kategori baru..."
                    autofocus
                  />
                  <button
                    type="button"
                    @click="((isCustomCategory = false), (editFormData.category = 'Umum'))"
                    class="btn btn-square btn-outline border-white/10 text-gray-400 hover:text-white"
                    title="Batal"
                  >
                    <XCircle class="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-sm font-bold text-gray-300">Thumbnail Gambar</label>
              <div class="flex gap-2">
                <input
                  v-model="editFormData.thumbnail_url"
                  type="text"
                  class="input input-bordered bg-[#121212] border-white/10 text-gray-400 flex-1 focus:border-[#2962FF] focus:outline-none focus:text-white"
                  placeholder="URL atau Upload..."
                />
                <label
                  class="btn btn-square btn-outline border-white/10 hover:bg-white/5 hover:border-white/20 relative"
                >
                  <input type="file" accept="image/*" class="hidden" @change="handleFileUpload" />
                  <span v-if="isUploading" class="loading loading-spinner loading-xs"></span>
                  <Upload v-else class="w-5 h-5 text-gray-400" />
                </label>
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-sm font-bold text-gray-300">URL Video Sumber (YouTube dll)</label
              ><input
                v-model="editFormData.video_url"
                type="url"
                class="input input-bordered bg-[#121212] border-white/10 text-gray-400 w-full focus:border-[#2962FF] focus:outline-none focus:text-white"
                required
                placeholder="https://youtube.com/..."
              />
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-sm font-bold text-gray-300">Status Tayang</label>
              <select
                v-model="editFormData.status"
                class="select select-bordered bg-[#121212] border-white/10 text-white w-full focus:border-[#2962FF] focus:outline-none"
              >
                <option value="approved">Approved (Langsung Tayang)</option>
                <option value="pending">Pending (Menunggu Moderasi)</option>
                <option value="rejected">Rejected (Ditolak)</option>
              </select>
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-sm font-bold text-gray-300">Deskripsi Lengkap</label
              ><textarea
                v-model="editFormData.description"
                class="textarea textarea-bordered bg-[#121212] border-white/10 text-white w-full focus:border-[#2962FF] focus:outline-none min-h-[150px]"
                placeholder="Tulis catatan, rangkuman..."
              ></textarea>
            </div>
          </div>
          <button type="submit" class="hidden"></button>
        </form>

        <div
          class="px-8 py-5 bg-[#121212] border-t border-white/5 flex justify-end gap-3 sticky bottom-0 z-20"
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
            @click="saveKajian"
            class="btn bg-[#2962FF] hover:bg-blue-700 text-white border-0 px-8 shadow-lg shadow-blue-500/20"
            :disabled="isSaving"
          >
            <span v-if="isSaving" class="loading loading-spinner loading-sm"></span
            >{{ isSaving ? 'Menyimpan...' : isEditMode ? 'Simpan Perubahan' : 'Tambah Kajian' }}
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop"><button>close</button></form>
    </dialog>

    <button
      @click="openModal()"
      class="fixed bottom-10 right-10 btn btn-lg bg-[#2962FF] hover:bg-blue-700 text-white border-0 shadow-[0_0_30px_rgba(41,98,255,0.5)] z-50 transition-transform hover:scale-105 rounded-full px-8 gap-2"
      title="Tambah Kajian Baru"
    >
      <Plus class="w-6 h-6" /> Tambah Konten
    </button>
  </div>
</template>

<style scoped>
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #121212;
}
::-webkit-scrollbar-thumb {
  background: #333;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
