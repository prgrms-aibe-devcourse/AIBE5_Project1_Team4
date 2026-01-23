import Swal from 'sweetalert2';

const base = {
  heightAuto: false,
  confirmButtonColor: '#4f46e5',
  cancelButtonColor: '#6b7280',
};

const toastTop = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
  didOpen: (el) => {
    el.onmouseenter = Swal.stopTimer;
    el.onmouseleave = Swal.resumeTimer;
  },
});

const toastBottom = Swal.mixin({
  toast: true,
  position: 'bottom',
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
});

export function confirm({
  title = '확인',
  text,
  confirmText = '확인',
  cancelText = '취소',
  icon = 'warning',
  danger = false,
} = {}) {
  return Swal.fire({
    ...base,
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
    confirmButtonColor: danger ? '#dc2626' : base.confirmButtonColor,
  }).then((r) => r.isConfirmed);
}

export function alert({
  title = '',
  text,
  icon = 'info',
  confirmText = '확인',
} = {}) {
  return Swal.fire({
    ...base,
    title,
    text,
    icon,
    confirmButtonText: confirmText,
  });
}

// ✅ 기본 토스트: top-end로 통일 추천
export function toast(
  message,
  { icon = 'success', timer = 2000, position = 'top-end' } = {},
) {
  const instance = position === 'bottom' ? toastBottom : toastTop;
  return instance.fire({ icon, title: message, timer });
}

// 필요하면 명시적 함수도 제공
export function toastBottomOnly(message, opts = {}) {
  return toast(message, { ...opts, position: 'bottom' });
}
