import { useEffect, useMemo, useState } from 'react'
import {
  getApplicationDisciplinesOverview,
  getMyApplicationDisciplinesOverview,
} from '../api/applicationsApi'
import {
  formatFullName,
  getDisciplinePresentation,
  getStudentByIdCached,
} from '../api/lookupsApi'
import { getEmployeeActingContext } from '../api/usersApi'
import { useCampaignAccess } from './useCampaignAccess'
import type { EmployeeStudentApplication } from '../types/employeeStudentApplication'
import { appRoutes } from '../routes/appRoutes'
import { sortStringsRu } from '../utils/sortOptions'

export function useEmployeeStudentApplications() {
  const { campaignError, isAdmin, isReadOnly } = useCampaignAccess()
  const [actingAsFullName, setActingAsFullName] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'mine'>('all')
  const [allApplications, setAllApplications] = useState<EmployeeStudentApplication[]>(
    [],
  )
  const [searchValue, setSearchValue] = useState('')
  const [program, setProgram] = useState('Все программы')
  const [discipline, setDiscipline] = useState('Все дисциплины')
  const [priority, setPriority] = useState('Любой')
  const [status, setStatus] = useState('Любой')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const activeFiltersCount = [
    searchValue.trim() !== '',
    program !== 'Все программы',
    discipline !== 'Все дисциплины',
    priority !== 'Любой',
    status !== 'Любой',
  ].filter(Boolean).length

  useEffect(() => {
    let isMounted = true

    async function loadApplications() {
      try {
        const isMineRoute =
          window.location.pathname === appRoutes.employeeStudentApplicationsMine
        const overview = isMineRoute
          ? await getMyApplicationDisciplinesOverview()
          : await getApplicationDisciplinesOverview()

        const mapped = await Promise.all(
          overview.map(async (item) => {
            const [student, disciplinePresentation] = await Promise.all([
              getStudentByIdCached(item.studentId),
              getDisciplinePresentation(item.disciplineId),
            ])

            return {
              approvedModules: item.approvedModules,
              applicationId: item.applicationId,
              createdAt: item.createdAt,
              discipline: disciplinePresentation.disciplineLabel,
              id: item.applicationDisciplineId,
              priority: item.priority as 1 | 2 | 3 | 4 | 5,
              program: disciplinePresentation.program.name,
              status: getStatusLabel(item.status),
              studentName: formatFullName({
                firstName: student.firstName,
                lastName: student.lastName,
                middleName: student.middleName,
              }),
              teachers: {
                lecturer: item.lecturerName,
                seminarist: item.seminarianName,
              },
              twoGroups: item.twoGroups,
              workType: item.workType,
            } satisfies EmployeeStudentApplication
          }),
        )

        if (isMounted) {
          setAllApplications(
            mapped.filter((application) => application.status !== 'Удалено'),
          )
        }
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

    void loadApplications()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    setActiveTab(
      window.location.pathname === appRoutes.employeeStudentApplicationsMine
        ? 'mine'
        : 'all',
    )
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadActingContext() {
      try {
        const context = await getEmployeeActingContext()

        if (isMounted) {
          setActingAsFullName(context.actingAsFullName)
        }
      } catch {
        if (isMounted) {
          setActingAsFullName(null)
        }
      }
    }

    void loadActingContext()

    return () => {
      isMounted = false
    }
  }, [])

  const applications = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLocaleLowerCase('ru-RU')

    return allApplications
      .filter((application) => {
        if (
          normalizedSearch &&
          !application.studentName
            .toLocaleLowerCase('ru-RU')
            .includes(normalizedSearch)
        ) {
          return false
        }

        if (program !== 'Все программы' && application.program !== program) {
          return false
        }

        if (
          discipline !== 'Все дисциплины' &&
          application.discipline !== discipline
        ) {
          return false
        }

        if (priority !== 'Любой' && String(application.priority) !== priority) {
          return false
        }

        if (status !== 'Любой' && application.status !== status) {
          return false
        }

        return true
      })
      .sort((left, right) => {
        const leftDate = new Date(left.createdAt).getTime()
        const rightDate = new Date(right.createdAt).getTime()

        return sortOrder === 'newest' ? rightDate - leftDate : leftDate - rightDate
      })
  }, [
    allApplications,
    discipline,
    priority,
    program,
    searchValue,
    sortOrder,
    status,
  ])

  const programOptions = useMemo(
    () => [
      'Все программы',
      ...sortStringsRu([...new Set(allApplications.map((item) => item.program))]),
    ],
    [allApplications],
  )
  const disciplineOptions = useMemo(
    () => [
      'Все дисциплины',
      ...sortStringsRu([...new Set(allApplications.map((item) => item.discipline))]),
    ],
    [allApplications],
  )
  const statusOptions = useMemo(
    () => [
      'Любой',
      ...sortStringsRu([...new Set(allApplications.map((item) => item.status))]),
    ],
    [allApplications],
  )

  return {
    actingAsFullName,
    activeFiltersCount,
    activeTab,
    applications,
    campaignError,
    discipline,
    disciplineOptions,
    error,
    isAdmin,
    isLoading,
    isReadOnly,
    priority,
    priorityOptions: ['Любой', '1', '2', '3', '4', '5'],
    program,
    programOptions,
    resetAllFilters: () => {
      setSearchValue('')
      setProgram('Все программы')
      setDiscipline('Все дисциплины')
      setPriority('Любой')
      setStatus('Любой')
    },
    refreshActingContext: async () => {
      try {
        const context = await getEmployeeActingContext()
        setActingAsFullName(context.actingAsFullName)
      } catch {
        setActingAsFullName(null)
      }
    },
    searchValue,
    setActiveTab,
    setDiscipline,
    setPriority,
    setProgram,
    setSearchValue,
    setSortOrder,
    setStatus,
    sortOrder,
    status,
    statusOptions,
  }
}

function getStatusLabel(status: string): EmployeeStudentApplication['status'] {
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

  return 'Не удалось загрузить список заявок'
}
