<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../supabase'
import {
  Users,
  BadgeCheck,
  XCircle,
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Instagram,
  Youtube,
  Share2,
  PlusCircle,
  Building2,
  Image as ImageIcon,
} from 'lucide-vue-next'
// Import SweetAlert & Logger
import { showSuccess, showError, confirmAction } from '../utils/alert'
import { logActivity } from '../utils/logger'

const dais = ref([])
const isLoading = ref(true)
const searchQuery = ref('')
const isSaving = ref(false)
const isFetchingDetail = ref(false)

const isEditMode = ref(false)
const formData = ref({
  id: null,
  name: '',
  bio: '',
  avatar_url: '',
  instagram_url: '',
  youtube_channel: '',
  tiktok_url: '',
  is_verified: false,
})

const fanbaseForms = ref([])
const sanadForms = ref([])

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
    showError('Gagal Memuat Data', error.message)
  } finally {
    isLoading.value = false
  }
}

const filteredDais = computed(() =>
  dais.value.filter((dai) => dai.name.toLowerCase().includes(searchQuery.value.toLowerCase())),
)

const openModal = async (dai = null) => {
  formData.value = {
    id: null,
    name: '',
    bio: '',
    avatar_url: '',
    instagram_url: '',
    youtube_channel: '',
    tiktok_url: '',
    is_verified: false,
  }
  fanbaseForms.value = []
  sanadForms.value = []

  if (dai) {
    isEditMode.value = true
    formData.value = { ...dai }
    isFetchingDetail.value = true
    document.getElementById('modal_dai').showModal()

    try {
      const [fanbaseRes, sanadRes] = await Promise.all([
        supabase.from('dai_fanbases').select('*').eq('dai_id', dai.id),
        supabase
          .from('dai_sanads')
          .select('*, sanad_gurus(*)')
          .eq('dai_id', dai.id)
          .order('created_at', { ascending: true }),
      ])
      if (fanbaseRes.data)
        fanbaseForms.value = fanbaseRes.data.map((f) => ({
          nama_akun: f.nama_akun,
          platform: f.platform,
          url_akun: f.url_akun,
        }))
      if (sanadRes.data)
        sanadForms.value = sanadRes.data.map((s) => ({
          nama_instansi_guru: s.nama_instansi_guru,
          kategori: s.kategori || 'Pesantren',
          periode: s.periode || '',
          website_url: s.website_url || '',
          gurus: s.sanad_gurus
            ? s.sanad_gurus.map((g) => ({
                nama_guru: g.nama_guru,
                spesialisasi_kitab: g.spesialisasi_kitab || '',
              }))
            : [],
        }))
    } catch (err) {
      showError('Gagal Load Data', err.message)
    } finally {
      isFetchingDetail.value = false
    }
  } else {
    isEditMode.value = false
    document.getElementById('modal_dai').showModal()
  }
}

const closeModal = () => document.getElementById('modal_dai').close()

const addFanbase = () =>
  fanbaseForms.value.push({ nama_akun: '', platform: 'instagram', url_akun: '' })
const removeFanbase = (index) => fanbaseForms.value.splice(index, 1)

const addSanad = () =>
  sanadForms.value.push({
    nama_instansi_guru: '',
    kategori: 'Pesantren',
    periode: '',
    website_url: '',
    gurus: [],
  })
const removeSanad = (index) => sanadForms.value.splice(index, 1)

const addGuru = (sanadIndex) =>
  sanadForms.value[sanadIndex].gurus.push({ nama_guru: '', spesialisasi_kitab: '' })
const removeGuru = (sanadIndex, guruIndex) =>
  sanadForms.value[sanadIndex].gurus.splice(guruIndex, 1)

const saveDai = async () => {
  if (!formData.value.name) return showError('Validasi Gagal', 'Nama penceramah wajib diisi!')
  isSaving.value = true

  try {
    let targetDaiId = formData.value.id
    const daiPayload = {
      name: formData.value.name,
      bio: formData.value.bio || null,
      avatar_url: formData.value.avatar_url || null,
      instagram_url: formData.value.instagram_url || null,
      youtube_channel: formData.value.youtube_channel || null,
      tiktok_url: formData.value.tiktok_url || null,
      is_verified: formData.value.is_verified,
    }

    if (isEditMode.value) {
      const { error: errUpdate } = await supabase
        .from('dais')
        .update(daiPayload)
        .eq('id', targetDaiId)
      if (errUpdate) throw errUpdate
      await supabase.from('dai_fanbases').delete().eq('dai_id', targetDaiId)
      await supabase.from('dai_sanads').delete().eq('dai_id', targetDaiId)

      // LOGGER
      await logActivity("Da'i", 'Update', `Memperbarui profil Ustadz/Da'i: "${daiPayload.name}"`)
    } else {
      const { data, error: errInsert } = await supabase
        .from('dais')
        .insert([daiPayload])
        .select('id')
        .single()
      if (errInsert) throw errInsert
      targetDaiId = data.id

      // LOGGER
      await logActivity("Da'i", 'Create', `Menambahkan Ustadz/Da'i baru: "${daiPayload.name}"`)
    }

    const validFanbases = fanbaseForms.value
      .filter((f) => f.nama_akun && f.url_akun)
      .map((f) => ({ dai_id: targetDaiId, ...f }))
    if (validFanbases.length) await supabase.from('dai_fanbases').insert(validFanbases)

    for (const s of sanadForms.value) {
      if (s.nama_instansi_guru) {
        const { data: sanadData, error: sErr } = await supabase
          .from('dai_sanads')
          .insert([
            {
              dai_id: targetDaiId,
              nama_instansi_guru: s.nama_instansi_guru,
              kategori: s.kategori,
              periode: s.periode || null,
              website_url: s.website_url || null,
            },
          ])
          .select('id')
          .single()
        if (sErr) throw sErr

        const validGurus = s.gurus
          .filter((g) => g.nama_guru)
          .map((g) => ({ sanad_id: sanadData.id, ...g }))
        if (validGurus.length) await supabase.from('sanad_gurus').insert(validGurus)
      }
    }
    closeModal()
    fetchDais()
    showSuccess('Tersimpan!', `Data Da'i ${isEditMode.value ? 'diperbarui' : 'ditambahkan'}.`)
  } catch (err) {
    showError('Gagal Menyimpan', err.message)
  } finally {
    isSaving.value = false
  }
}

const deleteDai = async (id, name) => {
  const isConfirmed = await confirmAction(
    "Hapus Da'i?",
    `AWAS! Yakin ingin menghapus Da'i "${name}"? (Data relasi Sanad/Fanbase akan ikut terhapus)`,
    "Ya, Hapus Da'i",
  )
  if (!isConfirmed) return
  try {
    const { error } = await supabase.from('dais').delete().eq('id', id)
    if (error) throw error

    // LOGGER
    await logActivity(
      "Da'i",
      'Delete',
      `Menghapus Ustadz/Da'i: "${name}" beserta seluruh relasinya`,
    )

    fetchDais()
    showSuccess('Terhapus!', 'Penceramah berhasil dihapus.')
  } catch (err) {
    showError('Gagal Menghapus', err.message)
  }
}

const toggleVerification = async (id, currentStatus, name) => {
  const newStatus = !currentStatus
  const actionWord = newStatus ? 'memberikan' : 'mencabut'
  const isConfirmed = await confirmAction(
    'Ubah Verifikasi?',
    `Yakin ingin ${actionWord} Lencana Centang Biru untuk "${name}"?`,
    'Ya, Ubah',
  )
  if (!isConfirmed) return
  try {
    const { error } = await supabase.from('dais').update({ is_verified: newStatus }).eq('id', id)
    if (error) throw error

    // LOGGER
    await logActivity(
      "Da'i",
      'Update',
      `${actionWord.toUpperCase()} lencana verifikasi untuk Da'i: "${name}"`,
    )

    fetchDais()
    showSuccess(
      'Verifikasi Diupdate',
      `Lencana berhasil di${actionWord === 'memberikan' ? 'berikan' : 'cabut'}.`,
    )
  } catch (err) {
    showError('Gagal Update', err.message)
  }
}

onMounted(fetchDais)
</script>

<template>
  <div class="pb-24">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-5 mb-8">
      <div>
        <h2 class="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Users class="w-8 h-8 text-[#2962FF]" /> Database Penceramah
        </h2>
        <p class="text-gray-400 text-sm">
          Kelola profil, akun clipper (fanbase), dan jaringan sanad keilmuan.
        </p>
      </div>
      <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        <div class="relative flex-1 sm:w-64">
          <Search class="w-4 h-4 absolute left-4 top-3.5 text-gray-500" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari nama Da'i..."
            class="input bg-[#121212] border border-white/10 text-white w-full pl-11 focus:border-[#2962FF] focus:outline-none"
          />
        </div>
        <button
          @click="openModal()"
          class="btn bg-[#2962FF] hover:bg-blue-700 text-white border-0 shadow-lg shadow-blue-500/20"
        >
          <Plus class="w-5 h-5" /> Tambah Da'i Baru
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="flex justify-center p-20">
      <span class="loading loading-bars loading-lg text-[#2962FF]"></span>
    </div>

    <div
      v-else-if="filteredDais.length > 0"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      <div
        v-for="dai in filteredDais"
        :key="dai.id"
        class="bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden shadow-lg hover:border-white/10 hover:-translate-y-1 transition-all flex flex-col items-center pt-8 text-center group"
      >
        <div class="relative w-24 h-24 mb-4">
          <div
            class="w-full h-full rounded-full bg-[#121212] border-4 border-[#1A1A1A] overflow-hidden flex items-center justify-center relative z-10"
          >
            <img v-if="dai.avatar_url" :src="dai.avatar_url" class="w-full h-full object-cover" />
            <Users v-else class="w-10 h-10 text-gray-600" />
          </div>
          <div
            :class="[
              'absolute inset-0 rounded-full blur-xl z-0 opacity-40 transition-opacity group-hover:opacity-80',
              dai.is_verified ? 'bg-blue-500' : 'bg-gray-600',
            ]"
          ></div>
        </div>
        <div class="px-4 w-full flex-1 flex flex-col items-center mb-6">
          <h3
            class="text-white font-bold text-lg mb-1 flex items-center justify-center gap-1.5 w-full"
          >
            <span class="truncate max-w-[80%]" :title="dai.name">{{ dai.name }}</span>
            <BadgeCheck v-if="dai.is_verified" class="w-5 h-5 text-blue-500 shrink-0" />
          </h3>
          <span
            :class="[
              'text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded-full border',
              dai.is_verified
                ? 'text-blue-400 border-blue-400/30 bg-blue-400/10'
                : 'text-gray-500 border-gray-500/30 bg-gray-500/10',
            ]"
            >{{ dai.is_verified ? 'Terverifikasi' : 'Belum Verifikasi' }}</span
          >
        </div>
        <div
          class="w-full grid grid-cols-3 border-t border-white/5 bg-[#121212] divide-x divide-white/5 mt-auto"
        >
          <button
            @click="toggleVerification(dai.id, dai.is_verified, dai.name)"
            :class="[
              'p-3 flex items-center justify-center transition-colors font-bold text-[10px] gap-1',
              dai.is_verified
                ? 'text-blue-500 hover:bg-error/20 hover:text-error'
                : 'text-gray-500 hover:bg-blue-500/20 hover:text-blue-500',
            ]"
          >
            <span v-if="dai.is_verified" class="flex items-center gap-1"
              ><XCircle class="w-3 h-3" /> Cabut</span
            >
            <span v-else class="flex items-center gap-1"
              ><CheckCircle class="w-3 h-3" /> Validasi</span
            >
          </button>
          <button
            @click="openModal(dai)"
            class="p-3 flex items-center justify-center text-gray-400 hover:bg-amber-500/20 hover:text-amber-500 transition-colors"
            title="Edit Profil Lengkap"
          >
            <Edit class="w-4 h-4" />
          </button>
          <button
            @click="deleteDai(dai.id, dai.name)"
            class="p-3 flex items-center justify-center text-gray-400 hover:bg-red-500/20 hover:text-red-500 transition-colors"
            title="Hapus Da'i"
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
      <Users class="w-16 h-16 mb-4 opacity-20" />
      <h3 class="text-lg font-bold text-white mb-1">Penceramah Tidak Ditemukan</h3>
    </div>

    <dialog id="modal_dai" class="modal">
      <div
        class="modal-box p-0 bg-[#161616] overflow-hidden max-w-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/10 rounded-2xl"
      >
        <div
          class="px-6 md:px-8 py-5 border-b border-white/5 bg-[#121212] flex justify-between items-center sticky top-0 z-30"
        >
          <div>
            <h3 class="font-bold text-lg md:text-xl text-white flex items-center gap-2">
              <Users class="w-5 h-5 text-[#2962FF]" />
              {{ isEditMode ? 'Edit Data Penceramah' : "Registrasi Da'i Baru" }}
            </h3>
          </div>
          <form method="dialog">
            <button class="btn btn-sm btn-circle btn-ghost text-gray-400">✕</button>
          </form>
        </div>
        <div v-if="isFetchingDetail" class="p-20 flex justify-center">
          <span class="loading loading-spinner loading-lg text-blue-500"></span>
        </div>
        <form
          v-else
          @submit.prevent="saveDai"
          class="flex flex-col h-full max-h-[75vh] overflow-y-auto p-6 md:p-8 gap-8"
        >
          <div class="flex flex-col gap-5">
            <h4
              class="text-blue-400 font-bold flex items-center gap-2 border-b border-white/10 pb-2"
            >
              <Users class="w-4 h-4" /> 1. Profil Utama
            </h4>
            <div class="flex flex-col gap-2">
              <label class="text-sm font-bold text-gray-300">Nama Lengkap / Gelar *</label
              ><input
                v-model="formData.name"
                type="text"
                class="input bg-[#121212] border-white/10 text-white focus:outline-none focus:border-[#2962FF]"
                required
              />
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-sm font-bold text-gray-300">Bio Singkat</label
              ><textarea
                v-model="formData.bio"
                class="textarea bg-[#121212] border-white/10 text-white focus:outline-none focus:border-[#2962FF]"
              ></textarea>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-bold text-gray-300">URL Foto Profil</label
                ><input
                  v-model="formData.avatar_url"
                  type="url"
                  class="input bg-[#121212] border-white/10 text-white focus:outline-none focus:border-[#2962FF]"
                />
              </div>
              <div class="flex items-end mb-2">
                <label
                  class="cursor-pointer flex items-center gap-3 bg-[#1A1A1A] px-4 py-2.5 rounded-lg border border-white/10 hover:border-blue-500 transition-colors w-full"
                >
                  <span class="text-sm font-bold text-gray-300 flex-1">Status Verifikasi</span
                  ><input
                    type="checkbox"
                    v-model="formData.is_verified"
                    class="checkbox checkbox-info checkbox-sm"
                  />
                </label>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <div class="flex flex-col gap-2">
                <label class="text-[11px] font-bold text-gray-400 flex items-center gap-1"
                  ><Instagram class="w-3 h-3" /> Link Instagram</label
                ><input
                  v-model="formData.instagram_url"
                  type="url"
                  class="input input-sm bg-[#121212] border-white/10 text-white"
                />
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-[11px] font-bold text-gray-400 flex items-center gap-1"
                  ><Youtube class="w-3 h-3" /> Link YouTube</label
                ><input
                  v-model="formData.youtube_channel"
                  type="url"
                  class="input input-sm bg-[#121212] border-white/10 text-white"
                />
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-[11px] font-bold text-gray-400 flex items-center gap-1"
                  >Link TikTok</label
                ><input
                  v-model="formData.tiktok_url"
                  type="url"
                  class="input input-sm bg-[#121212] border-white/10 text-white"
                />
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-4">
            <div class="flex justify-between items-center border-b border-white/10 pb-2">
              <h4 class="text-blue-400 font-bold flex items-center gap-2">
                <Share2 class="w-4 h-4" /> 2. Akun Clipper / Fanbase
              </h4>
            </div>
            <div
              v-for="(f, idx) in fanbaseForms"
              :key="'fb' + idx"
              class="bg-[#1A1A1A] p-4 rounded-xl border border-white/10 relative"
            >
              <button
                @click.prevent="removeFanbase(idx)"
                class="absolute -top-3 -right-3 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 shadow-lg"
              >
                <XCircle class="w-4 h-4" />
              </button>
              <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div class="flex flex-col gap-1 md:col-span-4">
                  <label class="text-xs font-bold text-gray-400">Nama Akun *</label
                  ><input
                    v-model="f.nama_akun"
                    type="text"
                    class="input input-sm bg-[#121212] border-white/10 text-white focus:border-blue-500"
                    required
                  />
                </div>
                <div class="flex flex-col gap-1 md:col-span-3">
                  <label class="text-xs font-bold text-gray-400">Platform</label
                  ><select
                    v-model="f.platform"
                    class="select select-sm bg-[#121212] border-white/10 text-white focus:border-blue-500"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="youtube">YouTube</option>
                    <option value="tiktok">TikTok</option>
                  </select>
                </div>
                <div class="flex flex-col gap-1 md:col-span-5">
                  <label class="text-xs font-bold text-gray-400">URL Akun *</label
                  ><input
                    v-model="f.url_akun"
                    type="url"
                    class="input input-sm bg-[#121212] border-white/10 text-white focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
            <button
              type="button"
              @click="addFanbase"
              class="btn btn-sm btn-outline border-blue-500/50 text-blue-400 hover:bg-blue-500 hover:text-white mt-2 w-fit self-center"
            >
              <PlusCircle class="w-4 h-4" /> Tambah Akun Clipper
            </button>
          </div>

          <div class="flex flex-col gap-4">
            <div class="flex justify-between items-center border-b border-white/10 pb-2">
              <h4 class="text-blue-400 font-bold flex items-center gap-2">
                <Building2 class="w-4 h-4" /> 3. Otoritas Keilmuan (Jalur Sanad)
              </h4>
            </div>
            <div
              v-for="(s, sIdx) in sanadForms"
              :key="'snd' + sIdx"
              class="bg-[#151515] p-5 rounded-xl border border-blue-500/30 relative shadow-inner"
            >
              <button
                @click.prevent="removeSanad(sIdx)"
                class="absolute -top-3 -right-3 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 shadow-lg"
              >
                <XCircle class="w-4 h-4" />
              </button>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div class="flex flex-col gap-1">
                  <label class="text-xs font-bold text-gray-400">Instansi / Pondok *</label
                  ><input
                    v-model="s.nama_instansi_guru"
                    type="text"
                    class="input input-sm bg-[#1A1A1A] border-white/10 text-white focus:border-blue-500"
                    required
                  />
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-xs font-bold text-gray-400">Kategori Instansi</label
                  ><select
                    v-model="s.kategori"
                    class="select select-sm bg-[#1A1A1A] border-white/10 text-white focus:border-blue-500"
                  >
                    <option value="Pesantren">Pesantren</option>
                    <option value="Universitas">Universitas</option>
                    <option value="Talaqqi">Talaqqi / Majelis</option>
                    <option value="Keluarga">Keluarga / Nasab</option>
                  </select>
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-xs font-bold text-gray-400">Periode (cth: 2010-2015)</label
                  ><input
                    v-model="s.periode"
                    type="text"
                    class="input input-sm bg-[#1A1A1A] border-white/10 text-white focus:border-blue-500"
                  />
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-xs font-bold text-gray-400">Website Instansi (Tabayyun)</label
                  ><input
                    v-model="s.website_url"
                    type="url"
                    class="input input-sm bg-[#1A1A1A] border-white/10 text-white focus:border-blue-500"
                  />
                </div>
              </div>
              <div class="bg-[#1A1A1A] p-4 rounded-lg border border-white/5">
                <span
                  class="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 block"
                  >Daftar Guru / Kiai di Instansi Ini:</span
                >
                <div
                  v-for="(g, gIdx) in s.gurus"
                  :key="'guru' + sIdx + gIdx"
                  class="flex items-end gap-2 mb-2"
                >
                  <div class="flex-1 flex flex-col gap-1">
                    <input
                      v-model="g.nama_guru"
                      type="text"
                      placeholder="Nama Guru *"
                      class="input input-xs bg-[#121212] border-white/10 text-white"
                      required
                    />
                  </div>
                  <div class="flex-1 flex flex-col gap-1">
                    <input
                      v-model="g.spesialisasi_kitab"
                      type="text"
                      placeholder="Spesialisasi Kitab/Ilmu"
                      class="input input-xs bg-[#121212] border-white/10 text-white"
                    />
                  </div>
                  <button
                    @click.prevent="removeGuru(sIdx, gIdx)"
                    class="btn btn-xs btn-square btn-error text-white"
                  >
                    <Trash2 class="w-3 h-3" />
                  </button>
                </div>
                <button
                  type="button"
                  @click="addGuru(sIdx)"
                  class="btn btn-xs bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-white border-0 mt-2"
                >
                  <Plus class="w-3 h-3" /> Tambah Guru Baru
                </button>
              </div>
            </div>
            <button
              type="button"
              @click="addSanad"
              class="btn btn-sm bg-[#2962FF]/20 text-[#2962FF] hover:bg-[#2962FF] hover:text-white border-0 mt-2 w-full"
            >
              <PlusCircle class="w-4 h-4" /> Tambah Jalur Sanad Baru
            </button>
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
            @click="saveDai"
            class="btn bg-[#2962FF] hover:bg-blue-700 text-white border-0 px-8 shadow-lg shadow-blue-500/20"
            :disabled="isSaving || isFetchingDetail"
          >
            <span v-if="isSaving" class="loading loading-spinner loading-sm"></span
            >{{ isSaving ? 'Menyimpan...' : 'Simpan Semua Data' }}
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop"><button>close</button></form>
    </dialog>
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
