export const STUDENT_EMAIL_DOMAINS = ['edu.hse.ru', 'hse.ru'] as const

export type StudentEmailDomain = (typeof STUDENT_EMAIL_DOMAINS)[number]
export type StudentEmailKind = 'student' | 'postgraduate' | null

export function getStudentEmailDomain(email: string): StudentEmailDomain | null {
  const normalizedEmail = email.trim().toLowerCase()

  for (const domain of STUDENT_EMAIL_DOMAINS) {
    if (normalizedEmail.endsWith(`@${domain}`)) {
      return domain
    }
  }

  return null
}

export function isStudentEmail(email: string) {
  return getStudentEmailDomain(email) !== null
}

export function getStudentEmailKind(email: string): StudentEmailKind {
  const domain = getStudentEmailDomain(email)

  if (domain === 'edu.hse.ru') {
    return 'student'
  }

  if (domain === 'hse.ru') {
    return 'postgraduate'
  }

  return null
}

export function isPostgraduateStudentEmail(email: string) {
  return getStudentEmailKind(email) === 'postgraduate'
}
