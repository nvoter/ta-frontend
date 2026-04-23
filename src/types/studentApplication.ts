export type StudentApplicationStatus =
  | 'Новая'
  | 'Заинтересован'
  | 'На согласовании'
  | 'Утвержден'
  | 'Отклонено'
  | 'Удалено'

export interface StudentApplication {
  applicationId: string
  campaignId: string
  campaignEndsAt: string
  campaignStartsAt: string
  createdAt: string
  discipline: string
  id: string
  priority: number
  program: string
  status: StudentApplicationStatus
  workConditionsRaw: 'FREE' | 'PAID'
  workConditions: 'Платно' | 'Безвозмездно'
}
