const EMPLOYEE_EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/i

export function validateEmployeeEmail(email: string) {
  if (!email) {
    return 'Введите корпоративную почту'
  }

  if (!EMPLOYEE_EMAIL_PATTERN.test(email)) {
    return 'Введите корректный адрес электронной почты'
  }

  return null
}
