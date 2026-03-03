<script setup>
import { ref } from 'vue'
import {
  Server,
  Database,
  Smartphone,
  Info,
  User,
  Instagram,
  Github,
  Youtube,
  Mail,
  Globe,
  Briefcase,
} from 'lucide-vue-next'

const activeTab = ref('system')
</script>

<template>
  <div class="max-w-5xl mx-auto pb-12 pt-4">
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-end gap-5 mb-8 border-b border-white/5 pb-6 sticky top-[72px] bg-[#1A1A1A] z-40 py-2"
    >
      <div>
        <h2 class="text-3xl font-bold text-white mb-2">Informasi & Tentang</h2>
        <p class="text-gray-400 text-sm">Arsitektur sistem dan profil pengembang SanadFlow.</p>
      </div>

      <div class="flex gap-2 bg-[#121212] p-1.5 rounded-xl border border-white/5 w-full md:w-auto">
        <button
          @click="activeTab = 'system'"
          :class="
            activeTab === 'system'
              ? 'bg-[#2962FF] text-white shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          "
          class="flex-1 md:flex-none px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
        >
          <Info class="w-4 h-4" /> Tentang Sistem
        </button>
        <button
          @click="activeTab = 'developer'"
          :class="
            activeTab === 'developer'
              ? 'bg-[#2962FF] text-white shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          "
          class="flex-1 md:flex-none px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
        >
          <User class="w-4 h-4" /> Profil Developer
        </button>
      </div>
    </div>

    <div
      v-if="activeTab === 'system'"
      class="animate-in fade-in duration-500 slide-in-from-bottom-4"
    >
      <div class="bg-[#121212] border border-white/5 rounded-2xl p-8 shadow-lg mb-8">
        <div class="flex flex-col md:flex-row gap-8 items-center md:items-start">
          <div
            class="w-32 h-32 bg-gradient-to-br from-[#2962FF] to-blue-400 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-900/20 shrink-0"
          >
            <span class="text-4xl font-extrabold text-white tracking-widest">SF</span>
          </div>
          <div class="flex-1 text-center md:text-left">
            <h3 class="text-2xl font-bold text-white mb-2">
              SanadFlow Ecosystem <span class="badge badge-primary badge-sm ml-2">v1.0.0</span>
            </h3>
            <p class="text-gray-400 leading-relaxed mb-4 text-sm md:text-base">
              SanadFlow adalah platform agregator video dakwah berbasis kurasi sanad untuk
              meminimalisir fragmentasi informasi di era digital. Dikembangkan dengan pendekatan
              <span class="text-white font-semibold">'Zero Noise'</span>, sistem ini memastikan umat
              mendapatkan asupan ilmu dari sumber yang jelas, valid, dan terverifikasi.
            </p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          class="bg-[#121212] border border-white/5 rounded-2xl p-6 shadow-lg hover:border-[#2962FF]/50 transition-colors group"
        >
          <div class="flex items-center gap-4 mb-4">
            <div
              class="p-3 bg-blue-500/10 text-blue-500 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-colors"
            >
              <Smartphone class="w-6 h-6" />
            </div>
            <h4 class="text-lg font-bold text-white">Mobile Application</h4>
          </div>
          <p class="text-gray-400 text-sm">
            Aplikasi pengguna (End-User) dibangun menggunakan Framework
            <span class="text-white font-semibold">Flutter</span>. Memungkinkan aplikasi berjalan
            secara native di platform Android maupun iOS dengan performa tinggi.
          </p>
        </div>

        <div
          class="bg-[#121212] border border-white/5 rounded-2xl p-6 shadow-lg hover:border-emerald-500/50 transition-colors group"
        >
          <div class="flex items-center gap-4 mb-4">
            <div
              class="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-colors"
            >
              <Server class="w-6 h-6" />
            </div>
            <h4 class="text-lg font-bold text-white">Admin Dashboard</h4>
          </div>
          <p class="text-gray-400 text-sm">
            Panel kendali redaksi (Gatekeeper) dibangun menggunakan
            <span class="text-white font-semibold">Vue.js 3 + Vite</span> dan
            <span class="text-white font-semibold">Tailwind CSS</span>. Berfungsi sebagai pos
            penyaringan konten sebelum tayang.
          </p>
        </div>

        <div
          class="bg-[#121212] border border-white/5 rounded-2xl p-6 shadow-lg hover:border-amber-500/50 transition-colors md:col-span-2 group"
        >
          <div class="flex items-center gap-4 mb-4">
            <div
              class="p-3 bg-amber-500/10 text-amber-500 rounded-xl group-hover:bg-amber-500 group-hover:text-white transition-colors"
            >
              <Database class="w-6 h-6" />
            </div>
            <h4 class="text-lg font-bold text-white">Backend & Database</h4>
          </div>
          <p class="text-gray-400 text-sm">
            Menggunakan <span class="text-white font-semibold">Supabase (PostgreSQL)</span> sebagai
            BaaS (Backend as a Service). Mengamankan data dengan Row Level Security (RLS) dan
            autentikasi berlapis.
          </p>
        </div>
      </div>
    </div>

    <div
      v-else-if="activeTab === 'developer'"
      class="animate-in fade-in duration-500 slide-in-from-bottom-4"
    >
      <div class="flex flex-col items-center mb-16 mt-6 text-center">
        <div
          class="w-40 h-40 rounded-full border-2 border-[#2962FF] p-1.5 shadow-[0_10px_40px_rgba(41,98,255,0.3)] bg-[#121212] mb-5"
        >
          <img
            src="https://avatars.githubusercontent.com/amdwildanabdillah"
            alt="Wildan"
            class="w-full h-full rounded-full object-cover"
          />
        </div>

        <h2 class="text-3xl font-bold text-white tracking-wide">Ahmad Wildan Abdillah</h2>
        <div
          class="mt-3 px-5 py-1.5 rounded-full bg-[#2962FF]/10 border border-[#2962FF]/30 text-[#2962FF] font-bold text-[11px] tracking-widest uppercase"
        >
          Fullstack Developer & Founder
        </div>

        <p class="text-gray-400 text-sm mt-5 max-w-xl leading-relaxed">
          Mahasiswa Program Studi Komunikasi dan Penyiaran Islam (KPI) UIN Sunan Ampel Surabaya.
          Menginisiasi SanadFlow sebagai bentuk dedikasi tugas akhir untuk mempermudah akses dakwah
          yang bersanad.
        </p>

        <div class="flex flex-wrap justify-center gap-3 mt-8 max-w-2xl">
          <a
            href="https://www.linkedin.com/in/ahmadwildanabdillah-vixel"
            target="_blank"
            class="flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 hover:bg-[#0077b5]/10 hover:border-[#0077b5] transition group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 256 256"
              class="w-4 h-4 text-gray-400 group-hover:text-[#0077b5] transition fill-current"
            >
              <path
                d="M216,24H40A16,16,0,0,0,24,40V216a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V40A16,16,0,0,0,216,24Zm-8,192H48V40H208V216ZM96,112v64a8,8,0,0,1-16,0V112a8,8,0,0,1,16,0Zm88,28v36a8,8,0,0,1-16,0V140a20,20,0,0,0-40,0v36a8,8,0,0,1-16,0V112a8,8,0,0,1,15.79-1.78A36,36,0,0,1,184,140ZM100,84A12,12,0,1,1,88,72,12,12,0,0,1,100,84Z"
              ></path>
            </svg>
            <span class="font-bold text-xs text-gray-300 group-hover:text-white transition"
              >LinkedIn</span
            >
          </a>
          <a
            href="https://github.com/amdwildanabdillah"
            target="_blank"
            class="flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white transition group"
          >
            <Github class="w-4 h-4 text-gray-400 group-hover:text-white transition" />
            <span class="font-bold text-xs text-gray-300 group-hover:text-white transition"
              >GitHub</span
            >
          </a>
          <a
            href="https://portfoliowildan.my.id"
            target="_blank"
            class="flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 hover:bg-[#2962FF]/10 hover:border-[#2962FF] transition group"
          >
            <Briefcase class="w-4 h-4 text-gray-400 group-hover:text-[#2962FF] transition" />
            <span class="font-bold text-xs text-gray-300 group-hover:text-white transition"
              >Portfolio Web</span
            >
          </a>
        </div>
      </div>

      <div class="flex items-center gap-4 my-12 opacity-50">
        <div class="h-px bg-gradient-to-r from-transparent to-white/20 flex-1"></div>
        <span class="text-[9px] uppercase tracking-widest text-gray-500 font-bold"
          >Supported & Initiated By</span
        >
        <div class="h-px bg-gradient-to-l from-transparent to-white/20 flex-1"></div>
      </div>

      <div
        class="bg-[#050505] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden"
      >
        <div
          class="absolute -top-32 -right-32 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none"
        ></div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 relative z-10">
          <div class="space-y-6">
            <div class="inline-block">
              <span class="font-extrabold text-3xl tracking-tighter uppercase text-white"
                >VIXEL CREATIVE<span class="text-cyan-400">.</span></span
              >
            </div>
            <p class="text-gray-400 leading-loose max-w-sm text-sm">
              Studio digital berbasis di Surabaya yang menjembatani logika bisnis (Code) dengan
              estetika visual (Art).
            </p>

            <div class="pt-4">
              <span class="text-cyan-400 text-[10px] font-bold uppercase tracking-widest mb-4 block"
                >Initiator</span
              >
              <a
                href="https://portfoliowildan.my.id"
                target="_blank"
                class="flex items-center gap-4 group w-fit bg-white/5 pr-6 p-1 rounded-full border border-white/10 hover:border-cyan-400 transition duration-300"
              >
                <img
                  src="https://avatars.githubusercontent.com/amdwildanabdillah"
                  alt="Founder"
                  class="w-10 h-10 rounded-full border-2 border-transparent object-cover"
                />
                <div class="py-1">
                  <p
                    class="font-bold text-white group-hover:text-cyan-400 transition text-sm leading-none"
                  >
                    Ahmad Wildan A.
                  </p>
                  <p class="text-[9px] uppercase tracking-widest text-gray-500 mt-1">
                    Fullstack Creative
                  </p>
                </div>
              </a>
            </div>
          </div>

          <div>
            <span class="text-gray-500 text-[10px] font-bold uppercase tracking-widest block mb-6"
              >Connect with Us</span
            >
            <div class="grid grid-cols-2 gap-3">
              <a
                href="https://instagram.com/vixelcreative"
                target="_blank"
                class="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-[#E1306C]/10 hover:border-[#E1306C] transition group"
              >
                <Instagram class="w-5 h-5 text-gray-400 group-hover:text-[#E1306C] transition" />
                <span class="font-bold text-xs text-gray-300 group-hover:text-white transition"
                  >Instagram</span
                >
              </a>

              <a
                href="https://www.linkedin.com/in/ahmadwildanabdillah-vixel"
                target="_blank"
                class="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-[#0077b5]/10 hover:border-[#0077b5] transition group"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 256 256"
                  class="w-5 h-5 text-gray-400 group-hover:text-[#0077b5] transition fill-current"
                >
                  <path
                    d="M216,24H40A16,16,0,0,0,24,40V216a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V40A16,16,0,0,0,216,24Zm-8,192H48V40H208V216ZM96,112v64a8,8,0,0,1-16,0V112a8,8,0,0,1,16,0Zm88,28v36a8,8,0,0,1-16,0V140a20,20,0,0,0-40,0v36a8,8,0,0,1-16,0V112a8,8,0,0,1,15.79-1.78A36,36,0,0,1,184,140ZM100,84A12,12,0,1,1,88,72,12,12,0,0,1,100,84Z"
                  ></path>
                </svg>
                <span class="font-bold text-xs text-gray-300 group-hover:text-white transition"
                  >LinkedIn</span
                >
              </a>

              <a
                href="https://github.com/amdwildanabdillah"
                target="_blank"
                class="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white transition group"
              >
                <Github class="w-5 h-5 text-gray-400 group-hover:text-white transition" />
                <span class="font-bold text-xs text-gray-300 group-hover:text-white transition"
                  >GitHub</span
                >
              </a>

              <a
                href="https://behance.net/idan_abdll"
                target="_blank"
                class="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-[#1769ff]/10 hover:border-[#1769ff] transition group"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-5 h-5 text-gray-400 group-hover:text-[#1769ff] transition fill-current"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14h-8.027c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988h-6.466v-14.967h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 2.777 8.061-3.207 8.061zm-3.466-8.988h3.584c2.508 0 2.906-3-.312-3h-3.272v3zm3.391 3h-3.391v3.016h3.341c3.055 0 2.868-3.016.05-3.016z"
                  />
                </svg>
                <span class="font-bold text-xs text-gray-300 group-hover:text-white transition"
                  >Behance</span
                >
              </a>

              <a
                href="https://www.youtube.com/@idan_abdll"
                target="_blank"
                class="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-[#ff0000]/10 hover:border-[#ff0000] transition group"
              >
                <Youtube class="w-5 h-5 text-gray-400 group-hover:text-[#ff0000] transition" />
                <span class="font-bold text-xs text-gray-300 group-hover:text-white transition"
                  >YouTube</span
                >
              </a>

              <a
                href="https://www.vixelcreative.my.id"
                target="_blank"
                class="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-cyan-400/10 hover:border-cyan-400 transition group"
              >
                <Globe class="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition" />
                <span class="font-bold text-xs text-gray-300 group-hover:text-white transition"
                  >Website</span
                >
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-16 text-center text-gray-600 text-[10px] uppercase tracking-widest font-bold">
      &copy; 2026 Vixel Creative. Surabaya, Indonesia.
    </div>
  </div>
</template>
