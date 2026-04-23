export interface DisciplineFormItem {
  applicationDisciplineId?: string
  applicationDisciplineStatus?: string
  id: string
  priority: number
  educationProgram: string
  discipline: string
  grade: string
  workType: string
  twoGroups: boolean
  previousDisciplineName: string
  motivation: string
  lecturerName: string
  seminarTeacherName: string
  isGradeConfirmed: boolean
}

export interface StudentApplicationFormState {
  activeDisciplineTab: string
  fileError: string
  selectedFileName: string
}

export interface DisciplineFormErrors {
  discipline?: string
  educationProgram?: string
  grade?: string
  isGradeConfirmed?: string
  lecturerName?: string
  motivation?: string
  previousDisciplineName?: string
  seminarTeacherName?: string
  workType?: string
}

export interface StudentApplicationFormErrors {
  disciplineGeneral?: string
  disciplineItems: Record<string, DisciplineFormErrors>
  gradebookFile?: string
}
