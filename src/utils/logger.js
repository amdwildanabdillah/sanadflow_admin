import { supabase } from '../supabase'

export const logActivity = async (module, action, description) => {
  try {
    // 1. Cek siapa yang lagi login
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    // 2. Ambil namanya dari tabel profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    const userName = profile?.full_name || user.email || 'Admin'

    // 3. Simpan ke tabel activity_logs
    await supabase.from('activity_logs').insert([
      {
        user_id: user.id,
        user_name: userName,
        module: module, // Contoh: "Kajian", "Da'i", "User"
        action: action, // Contoh: "Create", "Update", "Delete", "Approve"
        description: description, // Contoh: "Menyetujui kajian Hukum Puasa"
      },
    ])
  } catch (err) {
    console.error('Gagal mencatat log aktivitas:', err)
  }
}
