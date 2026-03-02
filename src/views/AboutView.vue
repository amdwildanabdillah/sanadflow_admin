<script setup>
import { Server, Database, Smartphone } from 'lucide-vue-next'
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <div class="mb-8">
      <h2 class="text-3xl font-bold text-white mb-2">Tentang Sistem</h2>
      <p class="text-gray-400 text-sm">Informasi arsitektur dan pengembang aplikasi SanadFlow.</p>
    </div>

    <div class="bg-[#121212] border border-white/5 rounded-2xl p-8 shadow-lg mb-8">
      <div class="flex flex-col md:flex-row gap-8 items-center md:items-start">
        <div class="w-32 h-32 bg-gradient-to-br from-[#2962FF] to-blue-400 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-900/20 shrink-0">
          <span class="text-4xl font-extrabold text-white tracking-widest">SF</span>
        </div>
        <div class="flex-1 text-center md:text-left">
          <h3 class="text-2xl font-bold text-white mb-2">SanadFlow Ecosystem <span class="badge badge-primary badge-sm ml-2">v1.0.0</span></h3>
          <p class="text-gray-400 leading-relaxed mb-4">
            SanadFlow adalah platform agregator kajian Islami lintas platform (Multi-Platform Video Aggregator) yang berfokus pada validasi keilmuan (Sanad) para Da'i. Sistem ini memastikan umat mendapatkan asupan ilmu dari sumber yang jelas, valid, dan jauh dari hoaks.
          </p>
          <div class="text-sm text-gray-500 font-medium">
            Developed & Designed by <span class="text-white font-bold">Ahmad Wildan Abdillah</span>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      <div class="bg-[#121212] border border-white/5 rounded-2xl p-6 shadow-lg hover:border-[#2962FF]/50 transition-colors">
        <div class="flex items-center gap-4 mb-4">
          <div class="p-3 bg-blue-500/10 text-blue-500 rounded-xl"><Smartphone class="w-6 h-6" /></div>
          <h4 class="text-lg font-bold text-white">Mobile Application</h4>
        </div>
        <p class="text-gray-400 text-sm">Aplikasi pengguna (End-User) dibangun menggunakan Framework <span class="text-white font-semibold">Flutter</span>. Memungkinkan aplikasi berjalan secara native di platform Android maupun iOS dengan performa tinggi.</p>
      </div>

      <div class="bg-[#121212] border border-white/5 rounded-2xl p-6 shadow-lg hover:border-emerald-500/50 transition-colors">
        <div class="flex items-center gap-4 mb-4">
          <div class="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl"><Server class="w-6 h-6" /></div>
          <h4 class="text-lg font-bold text-white">Admin Dashboard</h4>
        </div>
        <p class="text-gray-400 text-sm">Panel kendali redaksi (Gatekeeper) dibangun menggunakan <span class="text-white font-semibold">Vue.js 3 + Vite</span> dan <span class="text-white font-semibold">Tailwind CSS</span>. Berfungsi sebagai pos penyaringan konten sebelum tayang.</p>
      </div>

      <div class="bg-[#121212] border border-white/5 rounded-2xl p-6 shadow-lg hover:border-amber-500/50 transition-colors md:col-span-2">
        <div class="flex items-center gap-4 mb-4">
          <div class="p-3 bg-amber-500/10 text-amber-500 rounded-xl"><Database class="w-6 h-6" /></div>
          <h4 class="text-lg font-bold text-white">Backend & Database</h4>
        </div>
        <p class="text-gray-400 text-sm">Menggunakan <span class="text-white font-semibold">Supabase (PostgreSQL)</span> sebagai BaaS (Backend as a Service). Mengamankan data dengan Row Level Security (RLS) dan autentikasi berlapis.</p>
      </div>

    </div>

    <div class="mt-12 text-center text-gray-600 text-xs">
      &copy; 2026 Vixel Creative & UIN Sunan Ampel Surabaya. All rights reserved.
    </div>
  </div>
</template>