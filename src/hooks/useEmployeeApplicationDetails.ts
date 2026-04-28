import { useEffect, useMemo, useRef, useState } from 'react'
import { getAllEmployees } from '../api/adminApi'
import {
  getApplicationDisciplineDetails,
  updateApplicationDisciplineStatus,
} from '../api/applicationsApi'
import { getDisciplineById, updateDisciplineAssignment } from '../api/disciplinesApi'
import {
  formatFullName,
  getDisciplinePresentation,
  getStudentByIdCached,
} from '../api/lookupsApi'
import {
  getEmployeeActingContext,
  getCurrentEmployeeProfile,
  getEmployeeSessionContext,
} from '../api/usersApi'
import { useCampaignAccess } from './useCampaignAccess'
import { EMPLOYEE_MANAGER_POSITION } from './useEmployeePersonalDataForm'
import { getAuthSession } from '../utils/authSessionStorage'
import type {
  EmployeeApplicationDetails,
  EmployeeApprovedModule,
  EmployeeApplicationDisciplineStatus,
  EmployeeInterestedModuleFormItem,
} from '../types/employeeApplicationDetails'

export function useEmployeeApplicationDetails() {
  const session = getAuthSession()
  const { campaignError, isAdmin, isReadOnly } = useCampaignAccess()
  const navigationState = window.history.state as
    | { applicationDisciplineId?: string }
    | null
    | undefined
  const applicationDisciplineId =
    typeof navigationState?.applicationDisciplineId === 'string'
      ? navigationState.applicationDisciplineId
      : ''

  const [details, setDetails] = useState<EmployeeApplicationDetails | null>(null)
  const [isInterestedDialogOpen, setIsInterestedDialogOpen] = useState(false)
  const [moduleRows, setModuleRows] = useState<EmployeeInterestedModuleFormItem[]>([])
  const [hasAppliedModuleAutofill, setHasAppliedModuleAutofill] = useState(false)
  const [statusDraft, setStatusDraft] =
    useState<EmployeeApplicationDisciplineStatus>('NEW')
  const [assignmentDraft, setAssignmentDraft] = useState('')
  const [actingAsFullName, setActingAsFullName] = useState<string | null>(null)
  const [currentEmployeePosition, setCurrentEmployeePosition] = useState('')
  const [isActingConfirmOpen, setIsActingConfirmOpen] = useState(false)
  const [formError, setFormError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isSavingAssignment, setIsSavingAssignment] = useState(false)
  const [validationToast, setValidationToast] = useState('')
  const validationToastTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadDetails() {
      if (!applicationDisciplineId) {
        setLoadError('Не найден идентификатор заявки')
        setIsLoading(false)
        return
      }

      try {
        const nextDetails = await loadApplicationDetails(applicationDisciplineId)

        if (!isMounted) {
          return
        }

        setDetails(nextDetails)
        setStatusDraft(nextDetails.applicationDiscipline.status)
        setAssignmentDraft(nextDetails.applicationDiscipline.assignment ?? '')
      } catch (error) {
        if (isMounted) {
          setLoadError(getErrorMessage(error))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadDetails()

    return () => {
      isMounted = false
    }
  }, [applicationDisciplineId])

  useEffect(() => {
    let isMounted = true

    async function loadActingContext() {
      try {
        const [context, profile] = await Promise.all([
          getEmployeeActingContext(),
          getCurrentEmployeeProfile(),
        ])

        if (isMounted) {
          setActingAsFullName(context.actingAsFullName)
          setCurrentEmployeePosition(profile.position ?? '')
        }
      } catch {
        if (isMounted) {
          setActingAsFullName(null)
          setCurrentEmployeePosition('')
        }
      }
    }

    void loadActingContext()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(
    () => () => {
      if (validationToastTimeoutRef.current !== null) {
        window.clearTimeout(validationToastTimeoutRef.current)
      }
    },
    [],
  )

  const hasWorkload = details?.workload ? details.workload.perModule.length > 0 : false
  const hasRelatedDisciplines =
    details?.relatedDisciplines.totalCount
      ? details.relatedDisciplines.currentCampaign.length > 0 ||
        details.relatedDisciplines.approvedPastCampaigns.length > 0
      : false

  const plannedPositionsCount = useMemo(
    () => {
      if (!details?.applicationDiscipline.approvedModules.length) {
        return 0
      }

      return details.applicationDiscipline.approvedModules.reduce(
        (maxPositionsCount, item) => Math.max(maxPositionsCount, item.positionsCount),
        0,
      )
    },
    [details?.applicationDiscipline.approvedModules],
  )

  const selectedPositionsCount = useMemo(
    () =>
      moduleRows.reduce((maxPositionsCount, row) => {
        const positionsCount = Number(row.positionsCount)

        if (!Number.isInteger(positionsCount) || positionsCount < 0) {
          return maxPositionsCount
        }

        return Math.max(maxPositionsCount, positionsCount)
      }, 0),
    [moduleRows],
  )

  const selectedModulesCount = useMemo(
    () =>
      moduleRows.filter((row) => {
        const positionsCount = Number(row.positionsCount)
        return Number.isInteger(positionsCount) && positionsCount > 0
      }).length,
    [moduleRows],
  )

  const maxPositionsPerModule = useMemo(() => {
    if (isAdmin) {
      return null
    }

    return details?.applicationDiscipline.twoGroups ? 2 : 1
  }, [details?.applicationDiscipline.twoGroups, isAdmin])

  const statusLabel = details
    ? getStatusLabel(details.applicationDiscipline.status)
    : 'Новая'

  const hasAssignment = Boolean(details?.applicationDiscipline.assignment?.trim())
  const isManagerActingFromSelf =
    currentEmployeePosition.trim() === EMPLOYEE_MANAGER_POSITION && !actingAsFullName

  const availableStatusOptions = useMemo<EmployeeApplicationDisciplineStatus[]>(() => {
    if (!details) {
      return isAdmin ? [] : ['INTERESTED']
    }

    if (isAdmin) {
      return getAdminStatusOptions(details.applicationDiscipline.status)
    }

    if (details.applicationDiscipline.status === 'NEW') {
      return ['INTERESTED']
    }

    return [details.applicationDiscipline.status]
  }, [details, isAdmin])

  async function persistStatusChange() {
    if (!details) {
      return
    }

    const normalizedModules =
      statusDraft === 'INTERESTED' || statusDraft === 'AGREED' || statusDraft === 'APPROVED'
        ? normalizeModules(moduleRows, maxPositionsPerModule)
        : { ok: true as const, value: [] }

    if (!normalizedModules.ok) {
      setFormError(normalizedModules.message)
      return
    }

    try {
      setIsSaving(true)
      setFormError('')

      await updateApplicationDisciplineStatus({
        applicationDisciplineId: details.applicationDiscipline.id,
        applicationId: details.application.id,
        approvedModules: normalizedModules.value,
        status: statusDraft,
      })

      const refreshedDetails = await loadApplicationDetails(details.applicationDiscipline.id)
      setDetails(refreshedDetails)
      setStatusDraft(refreshedDetails.applicationDiscipline.status)
      setAssignmentDraft(refreshedDetails.applicationDiscipline.assignment ?? '')
      setIsInterestedDialogOpen(false)
      setHasAppliedModuleAutofill(false)
      setModuleRows([])
      setValidationToast('')
      setIsActingConfirmOpen(false)
    } catch (error) {
      setFormError(getErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  return {
    actingAsFullName,
    assignmentDraft,
    availableStatusOptions,
    canManageStatus:
      !isReadOnly &&
      Boolean(details) &&
      (isAdmin ||
        (session?.principalType === 'EMPLOYEE' &&
          Boolean(
            details &&
              (details.applicationDiscipline.status === 'NEW' ||
                details.applicationDiscipline.updatedByEmployeeId === session.userId),
          ))),
    campaignError,
    closeInterestedDialog: () => {
      setIsInterestedDialogOpen(false)
      setHasAppliedModuleAutofill(false)
      setFormError('')
      setModuleRows([])
      setValidationToast('')
    },
    details,
    formError,
    hasRelatedDisciplines,
    hasAssignment,
    hasWorkload,
    isActingConfirmOpen,
    isAdmin,
    isInterestedDialogOpen,
    isLoading,
    isReadOnly,
    isSaving,
    isSavingAssignment,
    loadError,
    moduleRows,
    openInterestedDialog: () => {
      if (details) {
        setModuleRows(createModuleRows(details.applicationDiscipline))
        setStatusDraft(
          isAdmin
            ? getAdminStatusOptions(details.applicationDiscipline.status)[0] ??
                details.applicationDiscipline.status
            : details.applicationDiscipline.status === 'NEW'
              ? 'INTERESTED'
              : details.applicationDiscipline.status,
        )
        setAssignmentDraft(details.applicationDiscipline.assignment ?? '')
      }
      setIsInterestedDialogOpen(true)
      setHasAppliedModuleAutofill(false)
      setFormError('')
      setValidationToast('')
    },
    plannedPositionsCount,
    requestStatusSave: async () => {
      if (isManagerActingFromSelf) {
        window.dispatchEvent(new CustomEvent('ta:open-session-context'))
        return 'session-context-required'
      }

      if (actingAsFullName) {
        setIsActingConfirmOpen(true)
        return 'confirmation-required'
      }

      await persistStatusChange()
      return 'saved'
    },
    confirmActingStatusSave: async () => {
      await persistStatusChange()
    },
    closeActingConfirm: () => {
      setIsActingConfirmOpen(false)
    },
    refreshActingContext: async () => {
      try {
        const [context, profile] = await Promise.all([
          getEmployeeActingContext(),
          getCurrentEmployeeProfile(),
        ])
        setActingAsFullName(context.actingAsFullName)
        setCurrentEmployeePosition(profile.position ?? '')
        return context
      } catch {
        setActingAsFullName(null)
        setCurrentEmployeePosition('')
        return { actingAsFullName: null }
      }
    },
    reopenActingConfirm: () => {
      setIsActingConfirmOpen(true)
    },
    saveAssignment: async () => {
      if (!details) {
        return
      }

      if (!hasAnyAssignmentValue(assignmentDraft)) {
        setFormError('Заполните перечень заданий ассистента хотя бы по одному пункту')
        return
      }

      try {
        setIsSavingAssignment(true)
        setFormError('')
        await updateDisciplineAssignment(
          details.applicationDiscipline.disciplineId,
          assignmentDraft.trim(),
        )
        const refreshedDetails = await loadApplicationDetails(details.applicationDiscipline.id)
        setDetails(refreshedDetails)
        setAssignmentDraft(refreshedDetails.applicationDiscipline.assignment ?? '')
      } catch (error) {
        setFormError(getErrorMessage(error))
      } finally {
        setIsSavingAssignment(false)
      }
    },
    setAssignmentDraft,
    setStatusDraft,
    statusDraft,
    openSessionContextPicker: () => {
      window.dispatchEvent(new CustomEvent('ta:open-session-context'))
    },
    setModuleField: (
      rowId: string,
      field: 'positionsCount',
      value: string,
    ) => {
      const normalizedValue = normalizePositionsCountInput(value, maxPositionsPerModule)

      setModuleRows((current) => {
        const nextRows = current.map((row) =>
          row.id === rowId ? { ...row, [field]: normalizedValue } : row,
        )

        if (
          !hasAppliedModuleAutofill &&
          field === 'positionsCount' &&
          normalizedValue.trim() !== '' &&
          Number(normalizedValue) > 0
        ) {
          setHasAppliedModuleAutofill(true)
          return nextRows.map((row) =>
            row.id === rowId ? row : { ...row, positionsCount: normalizedValue },
          )
        }

        return nextRows
      })
      setFormError('')
      setValidationToast('')
    },
    selectedModulesCount,
    selectedPositionsCount,
    statusLabel,
    validationToast,
    maxPositionsPerModule,
  }
}

function normalizeModules(
  rows: EmployeeInterestedModuleFormItem[],
  maxPositionsPerModule: number | null,
) {
  const normalized: EmployeeApprovedModule[] = []
  const normalizedMax = maxPositionsPerModule ?? Number.MAX_SAFE_INTEGER

  for (const row of rows) {
    const positionsCountValue = Number(row.positionsCount)

    if (
      !Number.isInteger(positionsCountValue) ||
      positionsCountValue < 0 ||
      positionsCountValue > normalizedMax
    ) {
      return {
        message:
          maxPositionsPerModule === null
            ? 'Укажите количество позиций целым неотрицательным числом'
            : `Укажите количество позиций целым числом от 0 до ${maxPositionsPerModule}`,
        ok: false as const,
      }
    }

    if (positionsCountValue > 0) {
      normalized.push({
        module: row.module,
        positionsCount: positionsCountValue,
      })
    }
  }

  if (normalized.length === 0) {
    return {
      message: 'Установите количество позиций хотя бы для одного модуля',
      ok: false as const,
    }
  }

  return {
    ok: true as const,
    value: normalized.sort((left, right) => left.module - right.module),
  }
}

function getAdminStatusOptions(currentStatus: EmployeeApplicationDisciplineStatus) {
  const options: EmployeeApplicationDisciplineStatus[] = [
    'NEW',
    'INTERESTED',
    'AGREED',
    'APPROVED',
    'DELETED',
    'REJECTED',
  ]

  return options.filter((option) => option !== currentStatus)
}

export function getStatusLabel(status: EmployeeApplicationDisciplineStatus) {
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

export function getStatusClassName(status: EmployeeApplicationDisciplineStatus) {
  if (status === 'NEW') {
    return 'new'
  }

  if (status === 'INTERESTED') {
    return 'interested'
  }

  if (status === 'AGREED') {
    return 'approved'
  }

  if (status === 'REJECTED' || status === 'DELETED') {
    return 'rejected'
  }

  return 'confirmed'
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Не удалось загрузить детали заявки'
}

async function loadApplicationDetails(applicationDisciplineId: string) {
  const response = await getApplicationDisciplineDetails(applicationDisciplineId)

  if (response.applicationDiscipline.status === 'DELETED') {
    throw new Error('Заявка не найдена')
  }

  const [
    student,
    currentDisciplinePresentation,
    currentCampaign,
    currentDiscipline,
    employees,
    employeeSessionContext,
  ] = await Promise.all([
    getStudentByIdCached(response.application.studentId),
    getDisciplinePresentation(response.applicationDiscipline.disciplineId),
    Promise.all(
      response.relatedDisciplines.currentCampaign.map(async (discipline) => {
        const presentation = await getDisciplinePresentation(discipline.disciplineId)

        return {
          ...discipline,
          disciplineName: presentation.disciplineLabel,
          disciplineProgram: presentation.program.name,
        }
      }),
    ),
    getDisciplineById(response.applicationDiscipline.disciplineId),
    getAllEmployees().catch(() => []),
    getEmployeeSessionContext().catch(() => null),
  ])

  const updatedByEmployeeName =
    employees.find((employee) => employee.id === response.applicationDiscipline.updatedByEmployeeId)
      ?.fullName ?? null

  const updatedForEmployeeName =
    employeeSessionContext && !employeeSessionContext.isTheApplicant
      ? employeeSessionContext.applicantName
      : null

  return {
    application: {
      campaignId: response.application.campaignId,
      createdAt: response.application.createdAt,
      gradebook: response.application.gradebook,
      id: response.application.id,
      studentCourse: normalizeStudentCourse(student.course),
      studentEmail: student.email,
      studentId: student.id,
      studentName: formatFullName({
        firstName: student.firstName,
        lastName: student.lastName,
        middleName: student.middleName,
      }),
      studentPhoneNumber: student.phone || 'Не указан',
      studentProgram: student.educationalProgram || 'Не указана',
      studentTelegram: student.telegram || 'Не указан',
    },
    applicationDiscipline: {
      assignment: currentDiscipline.assignment,
      ...response.applicationDiscipline,
      availableModules: currentDisciplinePresentation.discipline.modules,
      disciplineApprovedAssistantsCount: response.workload?.disciplinePerModule.reduce(
        (total, item) => total + item.positionsCount,
        0,
      ) ?? 0,
      disciplineCourse: currentDiscipline.course,
      disciplineMaxAssistantsCount: currentDiscipline.maxAssistantsCount,
      disciplineName: currentDisciplinePresentation.disciplineLabel,
      disciplineProgram: currentDisciplinePresentation.program.name,
      updatedByEmployeeName,
      updatedForEmployeeName,
      updatedByEmployeeSessionContextId:
        response.applicationDiscipline.updatedByEmployeeSessionContextId,
    },
    relatedDisciplines: {
      ...response.relatedDisciplines,
      approvedPastCampaigns: [],
      currentCampaign: currentCampaign.filter(
        (discipline) =>
          discipline.applicationDisciplineId !== response.applicationDiscipline.id &&
          discipline.status !== 'DELETED',
      ),
    },
    workload: response.workload,
  } satisfies EmployeeApplicationDetails
}

function normalizeStudentCourse(course: string | null) {
  if (!course) {
    return 'Не указан'
  }

  return course
}

function createModuleRows(
  applicationDiscipline: EmployeeApplicationDetails['applicationDiscipline'],
) {
  return applicationDiscipline.availableModules.map((module) => {
    const approvedModule = applicationDiscipline.approvedModules.find(
      (item) => item.module === module,
    )

    return {
      id: `module-${module}`,
      module,
      positionsCount: String(approvedModule?.positionsCount ?? 0),
    }
  })
}

function hasAnyAssignmentValue(value: string) {
  return value
    .split(';\n')
    .map((item) => item.trim())
    .some(Boolean)
}

function normalizePositionsCountInput(value: string, maxPositionsPerModule: number | null) {
  const trimmedValue = value.trim()

  if (trimmedValue === '') {
    return ''
  }

  if (!/^\d+$/.test(trimmedValue)) {
    return value
  }

  if (maxPositionsPerModule === null) {
    return trimmedValue
  }

  return String(Math.min(Number(trimmedValue), maxPositionsPerModule))
}
