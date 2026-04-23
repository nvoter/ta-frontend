import type { StudentApplicationStatus } from './studentApplication'

export interface EmployeeStudentApplicationTeacher {
  lecturer: string
  seminarist: string
}

export interface EmployeeStudentApplication {
  approvedModules: Array<{
    module: number
    positionsCount: number
  }>
  applicationId: string
  createdAt: string
  discipline: string
  id: string
  priority: 1 | 2 | 3 | 4 | 5
  program: string
  status: StudentApplicationStatus
  studentName: string
  teachers: EmployeeStudentApplicationTeacher
  twoGroups: boolean
  workType: 'FREE' | 'PAID'
}
