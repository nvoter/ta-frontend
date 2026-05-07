export type EmployeeApplicationDisciplineStatus =
  | 'NEW'
  | 'INTERESTED'
  | 'AGREED'
  | 'APPROVED'
  | 'REJECTED'
  | 'DELETED'

export interface EmployeeApplicationDocument {
  contentType: string
  downloadUrl: string
  fileName: string
  viewUrl: string
}

export interface EmployeeApplication {
  campaignId: string
  createdAt: string
  gradebook: EmployeeApplicationDocument
  id: string
  studentCourse: string
  studentEmail: string
  studentId: string
  studentName: string
  studentPhoneNumber: string
  studentProgram: string
  studentTelegram: string
}

export interface EmployeeApprovedModule {
  module: number
  positionsCount: number
}

export interface EmployeeApplicationDiscipline {
  assignment: string | null
  availableModules: number[]
  approvedModules: EmployeeApprovedModule[]
  disciplineId: string
  disciplineApprovedAssistantsCount: number
  disciplineCourse: string
  disciplineMaxAssistantsCount: number
  disciplineName: string
  disciplineProgram: string
  id: string
  lecturerAssistant: boolean
  lecturerName: string
  motivation: string
  priority: number
  seminarianName: string
  status: EmployeeApplicationDisciplineStatus
  studiedDisciplineGrade: number
  studiedDisciplineName: string
  twoGroups: boolean
  updatedAt: string
  updatedByEmployeeName: string | null
  updatedForEmployeeName: string | null
  updatedByEmployeeId: string | null
  updatedByEmployeeSessionContextId: string | null
  workType: 'FREE' | 'PAID'
}

export interface EmployeeApplicationWorkload {
  disciplinePerModule: EmployeeApprovedModule[]
  totalFreeApprovedPositionsCount: number
  totalPaidApprovedPositionsCount: number
  perModule: EmployeeApprovedModule[]
  totalApprovedPositionsCount: number
}

export interface EmployeeRelatedDisciplineItem {
  applicationDisciplineId: string
  applicationId: string
  disciplineId: string
  disciplineName?: string
  disciplineProgram?: string
  priority: number
  status: EmployeeApplicationDisciplineStatus
}

export interface EmployeeRelatedDisciplines {
  approvedPastCampaigns: EmployeeRelatedDisciplineItem[]
  currentCampaign: EmployeeRelatedDisciplineItem[]
  totalCount: number
}

export interface EmployeeApplicationDetails {
  application: EmployeeApplication
  applicationDiscipline: EmployeeApplicationDiscipline
  relatedDisciplines: EmployeeRelatedDisciplines
  workload?: EmployeeApplicationWorkload | null
}

export interface EmployeeInterestedModuleFormItem {
  id: string
  module: number
  positionsCount: string
}
