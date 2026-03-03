import Swal from 'sweetalert2'

// Konfigurasi tema Dark/Glassmorphism otomatis
const swalCustom = Swal.mixin({
  background: '#1A1A1A',
  color: '#ffffff',
  customClass: {
    popup: 'border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)]',
    title: 'text-xl font-bold',
    htmlContainer: 'text-gray-400 text-sm',
    confirmButton: 'btn bg-[#2962FF] hover:bg-blue-700 text-white border-0 px-6 mx-2',
    cancelButton: 'btn btn-ghost text-gray-400 hover:bg-white/5 mx-2',
  },
  buttonsStyling: false,
})

export const showSuccess = (title, text) => {
  return swalCustom.fire({
    icon: 'success',
    title: title,
    text: text,
    timer: 2000,
    showConfirmButton: false,
  })
}

export const showError = (title, text) => {
  return swalCustom.fire({
    icon: 'error',
    title: title,
    text: text,
  })
}

export const confirmAction = async (title, text, confirmText = 'Ya, Lanjutkan') => {
  const result = await swalCustom.fire({
    title: title,
    text: text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Batal',
    reverseButtons: true, // Tombol Batal di kiri, Confirm di kanan
  })
  return result.isConfirmed
}
