import { isStudentEmail } from './studentEmail'

export function validateStudentEmail(email: string) {
  if (!email) {
    return 'Введите корпоративную почту'
  }

  if (!isStudentEmail(email)) {
    return 'Введите корректный адрес в домене @edu.hse.ru или @hse.ru'
  }

  return null
}
