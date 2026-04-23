export interface StudentPersonalDataFormValues {
  citizenship: string
  dateOfBirth: string
  educationLevel: string
  educationalProgram: string
  email: string
  faculty: string
  fullName: string
  agreeToDataProcessing: boolean
  hasConfirmedPublicServicesAccount: boolean
  hasPrimaryPhone: boolean
  phone: string
  receivesSocialPension: boolean
  telegram: string
  yearOfStudy: string
}

export type StudentPersonalDataSelectField =
  | 'citizenship'
  | 'educationLevel'
  | 'faculty'

export type StudentPersonalDataFormErrors = Partial<
  Record<
    | 'citizenship'
    | 'dateOfBirth'
    | 'educationLevel'
    | 'educationalProgram'
    | 'email'
    | 'faculty'
    | 'fullName'
    | 'agreeToDataProcessing'
    | 'hasConfirmedPublicServicesAccount'
    | 'hasPrimaryPhone'
    | 'phone'
    | 'telegram'
    | 'yearOfStudy',
    string
  >
>
