import {
  getDisciplineById,
  getEducationalProgramById,
  type DisciplineDto,
  type EducationalProgramDto,
} from './disciplinesApi'
import { getStudentByIdInternal, type StudentDto } from './usersApi'

const disciplineCache = new Map<string, Promise<DisciplineDto>>()
const programCache = new Map<string, Promise<EducationalProgramDto>>()
const studentCache = new Map<string, Promise<StudentDto>>()

export function getDisciplineByIdCached(disciplineId: string) {
  const existing = disciplineCache.get(disciplineId)

  if (existing) {
    return existing
  }

  const promise = getDisciplineById(disciplineId)
  disciplineCache.set(disciplineId, promise)
  return promise
}

export function getEducationalProgramByIdCached(programId: string) {
  const existing = programCache.get(programId)

  if (existing) {
    return existing
  }

  const promise = getEducationalProgramById(programId)
  programCache.set(programId, promise)
  return promise
}

export function getStudentByIdCached(studentId: string) {
  const existing = studentCache.get(studentId)

  if (existing) {
    return existing
  }

  const promise = getStudentByIdInternal(studentId)
  studentCache.set(studentId, promise)
  return promise
}

export function formatFullName(parts: {
  firstName?: string | null
  lastName?: string | null
  middleName?: string | null
}) {
  return [parts.lastName, parts.firstName, parts.middleName]
    .filter((part) => Boolean(part && part.trim()))
    .join(' ')
}

export async function getDisciplinePresentation(disciplineId: string) {
  const discipline = await getDisciplineByIdCached(disciplineId)
  const program = await getEducationalProgramByIdCached(discipline.educationalProgramId)

  return {
    discipline,
    disciplineLabel: formatDisciplineLabel(discipline),
    program,
  }
}

function formatDisciplineLabel(discipline: DisciplineDto) {
  const modulesLabel = discipline.modules.join(', ')

  return `${discipline.name} (курс: ${discipline.course}, модули: ${modulesLabel})`
}
