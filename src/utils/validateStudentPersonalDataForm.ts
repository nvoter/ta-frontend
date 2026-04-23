import type {
  StudentPersonalDataFormErrors,
  StudentPersonalDataFormValues,
} from '../types/studentPersonalData'
import { validateStudentEmail } from './validateStudentEmail'

export function validateStudentPersonalDataForm(
  values: StudentPersonalDataFormValues,
) {
  const errors: StudentPersonalDataFormErrors = {}

  if (!values.agreeToDataProcessing) {
    errors.agreeToDataProcessing =
      'Подтвердите ознакомление с положением об обработке персональных данных'
  }

  if (!values.email) {
    errors.email = 'Введите корпоративную почту'
  } else {
    const emailError = validateStudentEmail(values.email)

    if (emailError) {
      errors.email = emailError
    }
  }

  if (!values.fullName.trim()) {
    errors.fullName = 'Введите ФИО'
  }

  if (!values.educationLevel.trim()) {
    errors.educationLevel = 'Введите уровень образования'
  }

  if (!values.faculty.trim()) {
    errors.faculty = 'Введите факультет'
  }

  if (
    values.educationLevel.trim() !== 'Аспирантура' &&
    !values.educationalProgram.trim()
  ) {
    errors.educationalProgram = 'Введите образовательную программу'
  }

  if (!values.yearOfStudy.trim()) {
    errors.yearOfStudy = 'Введите год обучения'
  }

  if (!values.citizenship.trim()) {
    errors.citizenship = 'Введите гражданство'
  }

  if (!values.dateOfBirth) {
    errors.dateOfBirth = 'Введите дату рождения'
  }

  if (!values.phone.trim()) {
    errors.phone = 'Введите номер телефона'
  }

  if (!values.telegram.trim()) {
    errors.telegram = 'Введите Telegram-аккаунт'
  }

  if (!values.hasPrimaryPhone) {
    errors.hasPrimaryPhone = 'Подтвердите, что указанный номер является основным'
  }

  if (!values.hasConfirmedPublicServicesAccount) {
    errors.hasConfirmedPublicServicesAccount =
      'Подтвердите наличие подтвержденного аккаунта на госуслугах'
  }

  return errors
}
