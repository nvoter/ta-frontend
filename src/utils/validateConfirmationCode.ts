const CONFIRMATION_CODE_PATTERN = /^\d{6}$/

export function validateConfirmationCode(code: string) {
  if (!code) {
    return 'Введите код подтверждения'
  }

  if (!CONFIRMATION_CODE_PATTERN.test(code)) {
    return 'Введите шестизначный код'
  }

  return null
}
