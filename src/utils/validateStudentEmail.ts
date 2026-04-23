const STUDENT_EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@edu\.hse\.ru$/i

export function validateStudentEmail(email: string) {
  if (!email) {
    return 'Введите корпоративную почту'
  }

  if (!STUDENT_EMAIL_PATTERN.test(email)) {
    return 'Введите корректный адрес в домене @edu.hse.ru'
  }

  return null
}
