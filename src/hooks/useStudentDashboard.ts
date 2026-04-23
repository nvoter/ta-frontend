import { useEffect, useMemo, useState } from 'react'
import { getMyApplications } from '../api/applicationsApi'
import { getDisciplinePresentation } from '../api/lookupsApi'
import { getCurrentStudent } from '../api/usersApi'
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

export function useStudentDashboard() {
  const { campaignError, currentCampaignId, hasActiveCampaign, isReadOnly } =
    useCampaignAccess()
  const [sortOrder, setSortOrder] = useState<'priorityAsc' | 'priorityDesc'>(
    'priorityAsc',
  )
  const [applicationsState, setApplicationsState] = useState<StudentApplication[]>([])
  const [studentName, setStudentName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadDashboard() {
    const [student, applications] = await Promise.all([getCurrentStudent(), getMyApplications()])

    const nextApplications = await Promise.all(
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

    setApplicationsState(
      nextApplications.filter((application) => application.status !== 'Удалено'),
    )
    setStudentName(
      formatStudentGreetingName({
        firstName: student.firstName,
        middleName: student.middleName,
      }),
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
  }, [])

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

  return {
    applications,
    campaignError,
    currentCampaignApplicationId:
      applicationsState.find((application) => application.campaignId === currentCampaignId)
        ?.applicationId ?? '',
    error,
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
    setSortOrder,
    sortOrder,
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
