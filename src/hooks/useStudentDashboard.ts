import { useEffect, useMemo, useState } from 'react'
import { getMyApplications, type StudentWorkloadDto } from '../api/applicationsApi'
import {
  getDisciplinesByProgramId,
  getEducationalPrograms,
} from '../api/disciplinesApi'
import { getDisciplinePresentation } from '../api/lookupsApi'
import { getCurrentStudent } from '../api/usersApi'
import { sortStringsRu } from '../utils/sortOptions'
import { useCampaignAccess } from './useCampaignAccess'
import type { StudentApplication } from '../types/studentApplication'

interface StudentCampaignApplicationsGroup {
  campaignId: string
  caption: string
  isCurrent: boolean
  items: StudentApplication[]
  periodLabel: string | null
  title: string
}

export interface StudentDashboardDiscipline {
  course: string
  educationLevel: string
  educationalProgramId: string
  educationalProgramName: string
  groupsCount: number
  id: string
  maxAssistantsCount: number
  modules: number[]
  name: string
}

interface UseStudentDashboardOptions {
  includeApplications?: boolean
  includeStudentProfile?: boolean
}

const EDUCATION_LEVEL_ALL = ''
const EDUCATIONAL_PROGRAM_ALL = ''
const COURSE_ALL = ''

export function useStudentDashboard(
  options: UseStudentDashboardOptions = {},
) {
  const {
    includeApplications = true,
    includeStudentProfile = true,
  } = options
  const { campaignError, currentCampaignId, hasActiveCampaign, isReadOnly } =
    useCampaignAccess()
  const [sortOrder, setSortOrder] = useState<'priorityAsc' | 'priorityDesc'>(
    'priorityAsc',
  )
  const [applicationsState, setApplicationsState] = useState<StudentApplication[]>([])
  const [studentWorkload, setStudentWorkload] = useState<StudentWorkloadDto | null>(null)
  const [disciplinesState, setDisciplinesState] = useState<StudentDashboardDiscipline[]>([])
  const [studentName, setStudentName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [disciplineSearch, setDisciplineSearch] = useState('')
  const [selectedEducationLevel, setSelectedEducationLevel] = useState(EDUCATION_LEVEL_ALL)
  const [selectedEducationalProgramId, setSelectedEducationalProgramId] = useState(EDUCATIONAL_PROGRAM_ALL)
  const [selectedCourse, setSelectedCourse] = useState(COURSE_ALL)

  async function loadDashboard() {
    const [student, applicationsResponse, programs] = await Promise.all([
      includeStudentProfile ? getCurrentStudent() : Promise.resolve(null),
      includeApplications
        ? getMyApplications()
        : Promise.resolve({ applications: [], workload: null }),
      getEducationalPrograms(),
    ])
    const { applications, workload } = applicationsResponse

    const nextApplications = includeApplications
      ? await Promise.all(
          applications.flatMap((application) =>
            application.disciplines.map(async (discipline) => {
              const presentation = await getDisciplinePresentation(discipline.disciplineId)

              return {
                applicationId: application.id,
                campaignId: application.campaignId,
                campaignEndsAt: application.campaignEndsAt,
                campaignStartsAt: application.campaignStartsAt,
                createdAt: application.createdAt,
                discipline: presentation.disciplineLabel,
                id: discipline.id,
                priority: discipline.priority,
                program: presentation.program.name,
                status: getStatusLabel(discipline.status),
                workConditions:
                  discipline.workType === 'PAID' ? 'Платно' : 'Безвозмездно',
                workConditionsRaw: discipline.workType,
              } satisfies StudentApplication
            }),
          ),
        )
      : []

    const disciplinesPerProgram = await Promise.all(
      programs.map(async (program) => {
        const disciplines = await getDisciplinesByProgramId(program.id)

        return disciplines.map(
          (discipline) =>
            ({
              course: discipline.course,
              educationLevel: program.educationLevel || 'Не указан',
              educationalProgramId: program.id,
              educationalProgramName: program.name,
              groupsCount: discipline.groupsCount,
              id: discipline.id,
              maxAssistantsCount: discipline.maxAssistantsCount,
              modules: discipline.modules,
              name: discipline.name,
            }) satisfies StudentDashboardDiscipline,
        )
      }),
    )

    setApplicationsState(
      nextApplications.filter((application) => application.status !== 'Удалено'),
    )
    setStudentWorkload(includeApplications ? workload : null)
    setDisciplinesState(
      disciplinesPerProgram
        .flat()
        .sort((left, right) => {
          const comparisons = [
            left.educationLevel.localeCompare(right.educationLevel, 'ru-RU', {
              sensitivity: 'base',
            }),
            left.educationalProgramName.localeCompare(right.educationalProgramName, 'ru-RU', {
              sensitivity: 'base',
            }),
            left.name.localeCompare(right.name, 'ru-RU', {
              sensitivity: 'base',
            }),
            left.course.localeCompare(right.course, 'ru-RU', {
              sensitivity: 'base',
            }),
          ]

          return comparisons.find((value) => value !== 0) ?? 0
        }),
    )
    setStudentName(
      student
        ? formatStudentGreetingName({
            firstName: student.firstName,
            middleName: student.middleName,
          })
        : '',
    )
    setError('')
  }

  useEffect(() => {
    let isMounted = true

    async function loadInitialDashboard() {
      try {
        await loadDashboard()
      } catch (loadError) {
        if (isMounted) {
          setError(getErrorMessage(loadError))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadInitialDashboard()

    return () => {
      isMounted = false
    }
  }, [includeApplications, includeStudentProfile])

  const applications = useMemo(() => {
    return [...applicationsState].sort((left, right) => {
      return sortOrder === 'priorityAsc'
        ? left.priority - right.priority
        : right.priority - left.priority
    })
  }, [applicationsState, sortOrder])

  const groupedApplications = useMemo<StudentCampaignApplicationsGroup[]>(() => {
    const groups = applications.reduce<Map<string, StudentApplication[]>>((acc, application) => {
      const current = acc.get(application.campaignId) ?? []
      current.push(application)
      acc.set(application.campaignId, current)
      return acc
    }, new Map())

    return [...groups.entries()]
      .map(([campaignId, items]) => {
        const campaignPeriod = getCampaignPeriod(items)

        return {
          caption: campaignId === currentCampaignId ? 'Активный набор' : 'Архив кампаний',
          campaignId,
          isCurrent: campaignId === currentCampaignId,
          items,
          periodLabel: campaignPeriod,
          title: getCampaignTitle(campaignPeriod),
        }
      })
      .sort((left, right) => {
        if (left.isCurrent !== right.isCurrent) {
          return left.isCurrent ? -1 : 1
        }

        const leftSortDate = getCampaignSortValue(left.items)
        const rightSortDate = getCampaignSortValue(right.items)

        return rightSortDate - leftSortDate
      })
  }, [applications, currentCampaignId])

  const educationLevelOptions = useMemo(
    () =>
      sortStringsRu([
        ...new Set(disciplinesState.map((item) => item.educationLevel).filter(Boolean)),
      ]),
    [disciplinesState],
  )

  const educationalProgramOptions = useMemo(
    () =>
      Array.from(
        disciplinesState
          .reduce<Map<string, { id: string; label: string }>>((acc, item) => {
          acc.set(item.educationalProgramId, {
            id: item.educationalProgramId,
            label: item.educationalProgramName,
          })
          return acc
        }, new Map())
          .values(),
      ).sort((left, right) =>
        left.label.localeCompare(right.label, 'ru-RU', { sensitivity: 'base' }),
      ),
    [disciplinesState],
  )

  const courseOptions = ['1', '2', '3', '4', 'Любой'] as const

  const filteredDisciplines = useMemo(() => {
    const query = disciplineSearch.trim().toLocaleLowerCase('ru-RU')

    return disciplinesState.filter((item) => {
      const matchesQuery =
        !query ||
        `${item.name} ${item.educationalProgramName} ${item.educationLevel}`
          .toLocaleLowerCase('ru-RU')
          .includes(query)
      const matchesEducationLevel =
        selectedEducationLevel === EDUCATION_LEVEL_ALL ||
        item.educationLevel === selectedEducationLevel
      const matchesProgram =
        selectedEducationalProgramId === EDUCATIONAL_PROGRAM_ALL ||
        item.educationalProgramId === selectedEducationalProgramId
      const matchesCourse =
        selectedCourse === COURSE_ALL ||
        item.course.toLocaleLowerCase('ru-RU').includes(selectedCourse.toLocaleLowerCase('ru-RU'))

      return (
        matchesQuery &&
        matchesEducationLevel &&
        matchesProgram &&
        matchesCourse
      )
    })
  }, [
    disciplineSearch,
    disciplinesState,
    selectedCourse,
    selectedEducationLevel,
    selectedEducationalProgramId,
  ])

  const activeDisciplineFiltersCount = [
    disciplineSearch.trim() !== '',
    selectedEducationLevel !== EDUCATION_LEVEL_ALL,
    selectedEducationalProgramId !== EDUCATIONAL_PROGRAM_ALL,
    selectedCourse !== COURSE_ALL,
  ].filter(Boolean).length

  return {
    activeDisciplineFiltersCount,
    applications,
    campaignError,
    courseOptions,
    currentCampaignApplicationId:
      applicationsState.find((application) => application.campaignId === currentCampaignId)
        ?.applicationId ?? '',
    disciplineSearch,
    educationLevelOptions,
    error,
    educationalProgramOptions,
    filteredDisciplines,
    groupedApplications,
    hasApplicationInCurrentCampaign:
      Boolean(currentCampaignId) &&
      applicationsState.some((application) => application.campaignId === currentCampaignId),
    hasActiveCampaign,
    isLoading,
    isReadOnly,
    reloadApplications: async () => {
      setIsLoading(true)

      try {
        await loadDashboard()
      } catch (loadError) {
        setError(getErrorMessage(loadError))
      } finally {
        setIsLoading(false)
      }
    },
    selectedCourse,
    selectedEducationLevel,
    selectedEducationalProgramId,
    setSortOrder,
    setDisciplineSearch,
    setSelectedCourse,
    setSelectedEducationLevel,
    setSelectedEducationalProgramId,
    sortOrder,
    studentWorkload,
    studentName,
  }
}

function formatStudentGreetingName(parts: {
  firstName?: string | null
  middleName?: string | null
}) {
  return [parts.firstName, parts.middleName]
    .filter((part) => Boolean(part && part.trim()))
    .join(' ')
}

function getStatusLabel(status: string): StudentApplication['status'] {
  if (status === 'NEW') {
    return 'Новая'
  }

  if (status === 'INTERESTED') {
    return 'Заинтересован'
  }

  if (status === 'AGREED') {
    return 'На согласовании'
  }

  if (status === 'REJECTED') {
    return 'Отклонено'
  }

  if (status === 'DELETED') {
    return 'Удалено'
  }

  return 'Утвержден'
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Не удалось загрузить данные личного кабинета'
}

function getCampaignTitle(period: string | null) {
  return period ? `Кампания ${period}` : 'Кампания'
}

function formatCampaignPeriod(startsAt: string, endsAt: string) {
  const formatter = new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  return `${formatter.format(new Date(startsAt))} - ${formatter.format(new Date(endsAt))}`
}

function getCampaignPeriod(items: StudentApplication[]) {
  const application = items[0]

  if (!application?.campaignStartsAt || !application?.campaignEndsAt) {
    return null
  }

  return formatCampaignPeriod(application.campaignStartsAt, application.campaignEndsAt)
}

function getCampaignSortValue(items: StudentApplication[]) {
  const application = items[0]

  if (application?.campaignStartsAt) {
    return new Date(application.campaignStartsAt).getTime()
  }

  return Math.max(...items.map((item) => new Date(item.createdAt).getTime()))
}
