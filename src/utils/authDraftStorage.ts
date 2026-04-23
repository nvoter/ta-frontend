const STUDENT_AUTH_DRAFT_KEY = 'ta-student-auth-draft'
const EMPLOYEE_AUTH_DRAFT_KEY = 'ta-employee-auth-draft'

interface StudentAuthDraft {
  email: string
}

interface EmployeeAuthDraft {
  email: string
  password: string
}

interface StudentPersonalDataDraft {
  agreeToDataProcessing: boolean
  citizenship: string
  dateOfBirth: string
  educationLevel: string
  educationalProgram: string
  email: string
  faculty: string
  fullName: string
  hasConfirmedPublicServicesAccount: boolean
  hasPrimaryPhone: boolean
  phone: string
  receivesSocialPension: boolean
  telegram: string
  yearOfStudy: string
}

interface EmployeePersonalDataDraft {
  fullName: string
  phone: string
  position: string
  workplace: string
}

const STUDENT_PERSONAL_DATA_DRAFT_KEY = 'ta-student-personal-data-draft'
const EMPLOYEE_PERSONAL_DATA_DRAFT_KEY = 'ta-employee-personal-data-draft'

export function getStudentAuthDraft() {
  return getDraft<StudentAuthDraft>(STUDENT_AUTH_DRAFT_KEY, {
    email: '',
  })
}

export function saveStudentAuthDraft(draft: StudentAuthDraft) {
  sessionStorage.setItem(STUDENT_AUTH_DRAFT_KEY, JSON.stringify(draft))
}

export function getEmployeeAuthDraft() {
  return getDraft<EmployeeAuthDraft>(EMPLOYEE_AUTH_DRAFT_KEY, {
    email: '',
    password: '',
  })
}

export function saveEmployeeAuthDraft(draft: EmployeeAuthDraft) {
  sessionStorage.setItem(EMPLOYEE_AUTH_DRAFT_KEY, JSON.stringify(draft))
}

export function getStudentPersonalDataDraft() {
  return getDraft<StudentPersonalDataDraft>(STUDENT_PERSONAL_DATA_DRAFT_KEY, {
    agreeToDataProcessing: false,
    citizenship: '',
    dateOfBirth: '',
    educationLevel: '',
    educationalProgram: '',
    email: '',
    faculty: '',
    fullName: '',
    hasConfirmedPublicServicesAccount: false,
    hasPrimaryPhone: false,
    phone: '',
    receivesSocialPension: false,
    telegram: '',
    yearOfStudy: '',
  })
}

export function saveStudentPersonalDataDraft(draft: StudentPersonalDataDraft) {
  sessionStorage.setItem(
    STUDENT_PERSONAL_DATA_DRAFT_KEY,
    JSON.stringify(draft),
  )
}

export function getEmployeePersonalDataDraft() {
  return getDraft<EmployeePersonalDataDraft>(EMPLOYEE_PERSONAL_DATA_DRAFT_KEY, {
    fullName: '',
    phone: '',
    position: '',
    workplace: '',
  })
}

export function saveEmployeePersonalDataDraft(draft: EmployeePersonalDataDraft) {
  sessionStorage.setItem(
    EMPLOYEE_PERSONAL_DATA_DRAFT_KEY,
    JSON.stringify(draft),
  )
}

function getDraft<T>(key: string, fallback: T) {
  const rawValue = sessionStorage.getItem(key)

  if (!rawValue) {
    return fallback
  }

  try {
    return JSON.parse(rawValue) as T
  } catch {
    return fallback
  }
}
