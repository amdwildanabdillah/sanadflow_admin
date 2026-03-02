<script setup>
import { ref } from 'vue'
import { supabase } from '../supabase'

const isLoading = ref(false)

const loginWithGoogle = async () => {
  isLoading.value = true
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Balikin ke URL ini setelah login di Google sukses
        redirectTo: window.location.origin + '/auth/callback',
      },
    })
    if (error) throw error
  } catch (error) {
    alert('Gagal Login: ' + error.message)
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-base-200 flex items-center justify-center p-4">
    <div class="card w-full max-w-md bg-base-100 shadow-xl">
      <div class="card-body items-center text-center">
        <h2 class="card-title text-3xl font-extrabold text-base-content mb-2">
          SanadFlow <span class="text-primary">Admin</span>
        </h2>
        <p class="text-base-content/60 mb-6">Portal Khusus Gatekeeper & Redaksi</p>

        <button
          @click="loginWithGoogle"
          :disabled="isLoading"
          class="btn btn-primary w-full shadow-sm"
        >
          <span v-if="isLoading" class="loading loading-spinner"></span>
          <span v-else class="text-lg mr-2">G</span>
          Masuk dengan Akun Google
        </button>

        <div class="divider text-xs text-base-content/40 mt-6">Akses Terbatas</div>
        <p class="text-xs text-base-content/50">
          Sistem ini diawasi ketat. Segala aktivitas moderasi akan tercatat.
        </p>
      </div>
    </div>
  </div>
</template>
