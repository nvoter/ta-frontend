import { useEffect, useMemo, useRef, useState } from 'react'
import {
  getAllEmployees,
  getAllStudents,
  createCampaign,
  createDiscipline,
  createEmployee,
  deleteCampaign,
  deleteDiscipline,
  getCampaigns,
  getDisciplineImports,
  getDisciplines,
  getStudentsDocumentsUploadStartDate,
  importDisciplinesXlsx,
  importStudentsDocumentsXlsx,
  importStudentsXlsx,
  promoteStudentsCourses,
  setStudentsDocumentsUploadStartDate,
  updateCampaign,
  updateDiscipline,
  updateEmployeeBackupEmail,
  type AdminDisciplineDto,
  type CampaignDto,
  type AdminStudentDto,
  type EmployeeDto,
} from '../api/adminApi'
import { getEducationalPrograms, type EducationalProgramDto } from '../api/disciplinesApi'
import { sortStringsRu } from '../utils/sortOptions'

export type AdminSection =
  | 'campaigns'
  | 'employees'
  | 'students'
  | 'documents'
  | 'disciplines'

export interface ActionResult {
  kind: 'error' | 'success'
  message: string
}

interface AdminToastMessage {
  id: number
  kind: ActionResult['kind']
  message: string
}

interface CampaignEditState {
  endsAt: string
  foreignCitizenDocumentFormUrl: string
  isActive: boolean
  russianCitizenDocumentFormUrl: string
  startsAt: string
}

interface DisciplineFormState {
  course: string
  educationalProgramId: string
  groupsCount: string
  maxAssistantsCount: string
  modules: string
  name: string
}

const DISCIPLINE_PROGRAM_ALL = 'Все ОП'
const DISCIPLINE_COURSE_ALL = 'Любой курс'
const EMPTY_RESULT: Record<string, ActionResult | null> = {
  campaignsForm: null,
  campaignsList: null,
  disciplines: null,
  disciplinesImport: null,
  documents: null,
  employees: null,
  students: null,
}

const EMPTY_DISCIPLINE_FORM: DisciplineFormState = {
  course: '',
  educationalProgramId: '',
  groupsCount: '',
  maxAssistantsCount: '',
  modules: '',
  name: '',
}

export function useAdminPanel() {
  const [campaigns, setCampaigns] = useState<CampaignDto[]>([])
  const [isCampaignsLoading, setIsCampaignsLoading] = useState(true)
  const [campaignEdits, setCampaignEdits] = useState<Record<string, CampaignEditState>>({})
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false)
  const [campaignStartAt, setCampaignStartAt] = useState('')
  const [campaignEndAt, setCampaignEndAt] = useState('')
  const [campaignRussianCitizenDocumentFormUrl, setCampaignRussianCitizenDocumentFormUrl] =
    useState('')
  const [campaignForeignCitizenDocumentFormUrl, setCampaignForeignCitizenDocumentFormUrl] =
    useState('')

  const [employees, setEmployees] = useState<EmployeeDto[]>([])
  const [isEmployeesLoading, setIsEmployeesLoading] = useState(true)
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [isEmployeeCreateModalOpen, setIsEmployeeCreateModalOpen] = useState(false)
  const [employeeCorporateEmail, setEmployeeCorporateEmail] = useState('')
  const [employeeFullName, setEmployeeFullName] = useState('')
  const [employeeBackupEmail, setEmployeeBackupEmail] = useState('')
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null)
  const [editingEmployeeBackupEmail, setEditingEmployeeBackupEmail] = useState('')

  const [students, setStudents] = useState<AdminStudentDto[]>([])
  const [isStudentsLoading, setIsStudentsLoading] = useState(true)
  const [studentsSearch, setStudentsSearch] = useState('')
  const [studentsEducationLevel, setStudentsEducationLevel] = useState('Любой уровень')
  const [studentsFaculty, setStudentsFaculty] = useState('Любой факультет')
  const [studentsProgram, setStudentsProgram] = useState('Любая ОП')
  const [studentsCourse, setStudentsCourse] = useState('Любой курс')
  const [studentsDocumentsStatus, setStudentsDocumentsStatus] = useState('Любой статус')
  const [studentsImportFile, setStudentsImportFile] = useState<File | null>(null)

  const [studentsDocsStartDate, setStudentsDocsStartDate] = useState('')
  const [studentsDocumentsFiles, setStudentsDocumentsFiles] = useState<File[]>([])

  const [disciplinesImportFile, setDisciplinesImportFile] = useState<File | null>(null)

  const [disciplines, setDisciplines] = useState<AdminDisciplineDto[]>([])
  const [isDisciplinesLoading, setIsDisciplinesLoading] = useState(true)
  const [disciplineSearch, setDisciplineSearch] = useState('')
  const [disciplineProgram, setDisciplineProgram] = useState(DISCIPLINE_PROGRAM_ALL)
  const [disciplineCourse, setDisciplineCourse] = useState(DISCIPLINE_COURSE_ALL)
  const [programOptions, setProgramOptions] = useState<EducationalProgramDto[]>([])
  const [isProgramsLoading, setIsProgramsLoading] = useState(true)
  const [isDisciplineModalOpen, setIsDisciplineModalOpen] = useState(false)
  const [editingDisciplineId, setEditingDisciplineId] = useState<string | null>(null)
  const [disciplineForm, setDisciplineForm] = useState<DisciplineFormState>(EMPTY_DISCIPLINE_FORM)

  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [busyAction, setBusyAction] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, ActionResult | null>>(EMPTY_RESULT)
  const [toastQueue, setToastQueue] = useState<AdminToastMessage[]>([])
  const toastIdRef = useRef(0)

  useEffect(() => {
    let isMounted = true

    async function loadInitialData() {
      setIsInitialLoading(true)

      await Promise.all([
        loadCampaigns((data) => {
          if (!isMounted) return
          setCampaigns(data)
          setCampaignEdits(buildCampaignEdits(data))
        }),
        loadEmployees(),
        loadStudents(),
        loadStudentsDocumentsStartDate(),
        loadDisciplines(setDisciplines),
        loadPrograms(),
      ])

      if (isMounted) {
        setIsInitialLoading(false)
      }
    }

    void loadInitialData()

    return () => {
      isMounted = false
    }
  }, [])

  const sortedCampaigns = useMemo(
    () =>
      [...campaigns].sort((left, right) => {
        if (left.isActive !== right.isActive) {
          return left.isActive ? -1 : 1
        }

        return new Date(right.startsAt).getTime() - new Date(left.startsAt).getTime()
      }),
    [campaigns],
  )

  const filteredEmployees = useMemo(() => {
    const query = employeeSearch.trim().toLocaleLowerCase('ru-RU')

    if (!query) {
      return employees
    }

    return employees.filter((item) => {
      const haystack = `${item.fullName} ${item.email} ${item.backupEmail ?? ''}`.toLocaleLowerCase(
        'ru-RU',
      )

      return haystack.includes(query)
    })
  }, [employeeSearch, employees])

  const filteredStudents = useMemo(() => {
    const query = studentsSearch.trim().toLocaleLowerCase('ru-RU')
    const filtered = query
      ? students.filter((item) => {
          const fullName = [item.lastName, item.firstName, item.middleName]
            .filter(Boolean)
            .join(' ')
          const haystack = `${fullName} ${item.email}`.toLocaleLowerCase('ru-RU')

          return haystack.includes(query)
        })
      : students

    return filtered
      .filter((item) => {
        if (
          studentsEducationLevel !== 'Любой уровень' &&
          (item.educationLevel || 'Не указан') !== studentsEducationLevel
        ) {
          return false
        }

        if (
          studentsFaculty !== 'Любой факультет' &&
          (item.faculty || 'Не указан') !== studentsFaculty
        ) {
          return false
        }

        if (studentsProgram !== 'Любая ОП' && (item.educationalProgram || 'Не указана') !== studentsProgram) {
          return false
        }

        if (studentsCourse !== 'Любой курс' && (item.course || '-') !== studentsCourse) {
          return false
        }

        if (studentsDocumentsStatus !== 'Любой статус') {
          const value = item.isDocumentsUploaded ? 'Загружены' : 'Не загружены'
          if (value !== studentsDocumentsStatus) {
            return false
          }
        }

        return true
      })
      .sort((left, right) => {
        const comparisons = [
          compareNullableStrings(left.educationLevel, right.educationLevel, 'Не указан'),
          compareNullableStrings(left.faculty, right.faculty, 'Не указан'),
          compareNullableStrings(left.educationalProgram, right.educationalProgram, 'Не указана'),
          compareCourses(left.course, right.course),
          compareStudentNames(left, right),
        ]

        return comparisons.find((value) => value !== 0) ?? 0
      })
  }, [
    students,
    studentsSearch,
    studentsCourse,
    studentsDocumentsStatus,
    studentsEducationLevel,
    studentsFaculty,
    studentsProgram,
  ])

  const studentsEducationLevelOptions = useMemo(
    () => [
      'Любой уровень',
      ...sortStringsRu([
        ...new Set(students.map((item) => item.educationLevel || 'Не указан')),
      ]),
    ],
    [students],
  )

  const studentsFacultyOptions = useMemo(
    () => [
      'Любой факультет',
      ...sortStringsRu([
        ...new Set(students.map((item) => item.faculty || 'Не указан')),
      ]),
    ],
    [students],
  )

  const studentsProgramOptions = useMemo(
    () => [
      'Любая ОП',
      ...sortStringsRu([
        ...new Set(students.map((item) => item.educationalProgram || 'Не указана')),
      ]),
    ],
    [students],
  )

  const studentsCourseOptions = useMemo(
    () => ['Любой курс', ...sortStringsRu([...new Set(students.map((item) => item.course || '-'))])],
    [students],
  )

  const studentsDocumentsStatusOptions = ['Любой статус', 'Загружены', 'Не загружены'] as const

  const activeStudentsFiltersCount = [
    studentsSearch.trim() !== '',
    studentsEducationLevel !== 'Любой уровень',
    studentsFaculty !== 'Любой факультет',
    studentsProgram !== 'Любая ОП',
    studentsCourse !== 'Любой курс',
    studentsDocumentsStatus !== 'Любой статус',
  ].filter(Boolean).length

  const filteredDisciplines = useMemo(() => {
    const query = disciplineSearch.trim().toLocaleLowerCase('ru-RU')
    return disciplines.filter((item) => {
      const matchesQuery = !query || `${item.name} ${item.course}`.toLocaleLowerCase('ru-RU').includes(query)
      const matchesProgram =
        disciplineProgram === DISCIPLINE_PROGRAM_ALL || item.educationalProgramId === disciplineProgram
      const matchesCourse = disciplineCourse === DISCIPLINE_COURSE_ALL || item.course === disciplineCourse

      return matchesQuery && matchesProgram && matchesCourse
    })
  }, [disciplineCourse, disciplineProgram, disciplineSearch, disciplines])

  const disciplineProgramOptions = useMemo(
    () => [
      { label: DISCIPLINE_PROGRAM_ALL, value: DISCIPLINE_PROGRAM_ALL },
      ...[...programOptions]
        .sort((left, right) =>
          left.name.localeCompare(right.name, 'ru-RU', {
            sensitivity: 'base',
          }),
        )
        .map((item) => ({ label: item.name, value: item.id })),
    ],
    [programOptions],
  )

  const disciplineCourseOptions = useMemo(
    () => [
      DISCIPLINE_COURSE_ALL,
      ...sortStringsRu([...new Set(disciplines.map((item) => item.course).filter(Boolean))]),
    ],
    [disciplines],
  )

  async function loadEmployees() {
    setIsEmployeesLoading(true)

    try {
      const data = await getAllEmployees()
      setEmployees(data)
    } catch {
      setEmployees([])
    } finally {
      setIsEmployeesLoading(false)
    }
  }

  async function loadStudents() {
    setIsStudentsLoading(true)

    try {
      const data = await getAllStudents()
      setStudents(data)
    } catch {
      setStudents([])
    } finally {
      setIsStudentsLoading(false)
    }
  }

  async function loadPrograms() {
    setIsProgramsLoading(true)

    try {
      const data = await getEducationalPrograms()
      setProgramOptions(data)
    } catch {
      setProgramOptions([])
    } finally {
      setIsProgramsLoading(false)
    }
  }

  async function loadStudentsDocumentsStartDate() {
    try {
      const data = await getStudentsDocumentsUploadStartDate()
      setStudentsDocsStartDate(data.startDate ?? '')
    } catch {
      setStudentsDocsStartDate('')
    }
  }

  async function reloadCampaigns() {
    await loadCampaigns((data) => {
      setCampaigns(data)
      setCampaignEdits(buildCampaignEdits(data))
    })
  }

  async function reloadStudents() {
    await loadStudents()
  }

  async function reloadDisciplines() {
    await loadDisciplines(setDisciplines)
  }

  async function handleCreateCampaign() {
    if (!campaignStartAt || !campaignEndAt) {
      setResult('campaignsForm', 'error', 'Заполните дату начала и дату завершения кампании')
      return
    }

    await runAction('campaign-create', async () => {
      await createCampaign({
        endsAt: toIsoString(campaignEndAt),
        foreignCitizenDocumentFormUrl: normalizeOptionalString(
          campaignForeignCitizenDocumentFormUrl,
        ),
        russianCitizenDocumentFormUrl: normalizeOptionalString(
          campaignRussianCitizenDocumentFormUrl,
        ),
        startsAt: toIsoString(campaignStartAt),
      })

      setCampaignStartAt('')
      setCampaignEndAt('')
      setCampaignRussianCitizenDocumentFormUrl('')
      setCampaignForeignCitizenDocumentFormUrl('')
      setIsCampaignModalOpen(false)
      clearResult('campaignsForm')
      setResult('campaignsList', 'success', 'Кампания запланирована')
      await reloadCampaigns()
    }, 'campaignsForm', 'Не удалось создать кампанию')
  }

  async function handleSaveCampaign(campaignId: string) {
    const current = campaignEdits[campaignId]

    if (!current) {
      return
    }

    await runAction(`campaign-save-${campaignId}`, async () => {
      await updateCampaign(campaignId, {
        endsAt: toIsoString(current.endsAt),
        foreignCitizenDocumentFormUrl: normalizeOptionalString(
          current.foreignCitizenDocumentFormUrl,
        ),
        isActive: current.isActive,
        russianCitizenDocumentFormUrl: normalizeOptionalString(
          current.russianCitizenDocumentFormUrl,
        ),
        startsAt: toIsoString(current.startsAt),
      })

      clearResult('campaignsForm')
      setResult('campaignsList', 'success', 'Кампания обновлена')
      await reloadCampaigns()
    }, 'campaignsForm', 'Не удалось обновить кампанию')
  }

  async function handleDeleteCampaign(campaignId: string) {
    await runAction(`campaign-delete-${campaignId}`, async () => {
      await deleteCampaign(campaignId)
      setResult('campaignsList', 'success', 'Кампания удалена')
      await reloadCampaigns()
    }, 'campaignsList', 'Не удалось удалить кампанию')
  }

  async function handleToggleCampaignActive(campaignId: string) {
    const current = campaignEdits[campaignId]

    if (!current) {
      return
    }

    await runAction(`campaign-toggle-${campaignId}`, async () => {
      await updateCampaign(campaignId, {
        isActive: !current.isActive,
      })

      setResult(
        'campaignsList',
        'success',
        current.isActive ? 'Кампания деактивирована' : 'Кампания активирована',
      )
      await reloadCampaigns()
    }, 'campaignsList', 'Не удалось изменить статус кампании')
  }

  async function handleCreateEmployee() {
    if (!employeeCorporateEmail.trim() || !employeeFullName.trim()) {
      setResult('employees', 'error', 'Заполните корпоративную почту и ФИО сотрудника')
      return
    }

    await runAction('employee-create', async () => {
      const employee = await createEmployee({
        backupEmail: employeeBackupEmail.trim() || null,
        corporateEmail: employeeCorporateEmail.trim(),
        fullName: employeeFullName.trim(),
      })

      setEmployees((current) => upsertEmployee(current, employee))
      await loadEmployees()
      setEmployeeCorporateEmail('')
      setEmployeeFullName('')
      setEmployeeBackupEmail('')
      setIsEmployeeCreateModalOpen(false)
      setResult('employees', 'success', 'Сотрудник создан')
    }, 'employees', 'Не удалось создать сотрудника')
  }

  async function handleSaveEmployeeEdit() {
    if (!editingEmployeeId) {
      return
    }

    await runAction('employee-edit-save', async () => {
      const employee = await updateEmployeeBackupEmail(
        editingEmployeeId,
        editingEmployeeBackupEmail.trim() || null,
      )

      setEmployees((current) => upsertEmployee(current, employee))
      await loadEmployees()
      setEditingEmployeeId(null)
      setEditingEmployeeBackupEmail('')
      setResult('employees', 'success', 'Данные сотрудника обновлены')
    }, 'employees', 'Не удалось обновить сотрудника')
  }

  async function handleImportStudents() {
    if (!studentsImportFile) {
      setResult('students', 'error', 'Выберите xlsx файл со студентами')
      return
    }

    await runAction('students-import', async () => {
      const response = await importStudentsXlsx(studentsImportFile)

      setStudentsImportFile(null)
      setResult(
        'students',
        'success',
        `Импорт завершен: создано ${response.createdCount}, обновлено ${response.updatedCount}`,
      )
      await loadStudents()
    }, 'students', 'Не удалось импортировать студентов')
  }

  async function handleSetStudentsDocumentsStartDate(inputValue = studentsDocsStartDate) {
    const normalizedStartDate = normalizeStudentsDocumentsStartDate(inputValue)

    if (!normalizedStartDate) {
      setResult(
        'documents',
        'error',
        'Укажите дату начала учета документов в формате ДД.ММ.ГГГГ',
      )
      return false
    }

    return runAction('documents-start-date', async () => {
      const result = await setStudentsDocumentsUploadStartDate(normalizedStartDate)
      setStudentsDocsStartDate(result.startDate ?? '')
      setResult('documents', 'success', `Дата сохранена: ${result.startDate}`)
    }, 'documents', 'Не удалось сохранить дату')
  }

  async function handleImportStudentsDocuments() {
    if (studentsDocumentsFiles.length === 0) {
      setResult('documents', 'error', 'Выберите хотя бы один xlsx файл')
      return
    }

    await runAction('documents-import', async () => {
      const result = await importStudentsDocumentsXlsx(studentsDocumentsFiles)
      setStudentsDocumentsFiles([])
      setResult(
        'documents',
        'success',
        `Импорт выполнен: отмечено ${result.markedUploadedCount}, пропущено ${result.skippedCount}`,
      )
      await loadStudents()
    }, 'documents', 'Не удалось импортировать данные о документах')
  }

  async function handlePromoteStudentsCourses() {
    return runAction('students-promote', async () => {
      const result = await promoteStudentsCourses()
      setResult(
        'students',
        'success',
        `Обновление курсов выполнено: повышено ${result.promotedCount}, выпускников ${result.graduatedCount}`,
      )
      await loadStudents()
    }, 'students', 'Не удалось обновить курсы студентов')
  }

  async function handleImportDisciplines() {
    if (!disciplinesImportFile) {
      setResult('disciplinesImport', 'error', 'Выберите xlsx файл')
      return
    }

    await runAction('disciplines-import', async () => {
      const importResult = await importDisciplinesXlsx(disciplinesImportFile)
      const completedImport = await waitForDisciplineImport(importResult.id)

      setDisciplinesImportFile(null)
      if (completedImport?.status === 'failed') {
        throw new Error('Импорт программ и дисциплин завершился с ошибкой')
      }

      setResult(
        'disciplinesImport',
        'success',
        completedImport?.status === 'completed'
          ? 'Импорт программ и дисциплин завершен'
          : 'Импорт программ и дисциплин запущен',
      )
      await loadPrograms()
      await reloadDisciplines()
    }, 'disciplinesImport', 'Не удалось запустить импорт дисциплин')
  }

  async function handleSaveDiscipline() {
    if (
      !disciplineForm.name.trim() ||
      !disciplineForm.educationalProgramId ||
      !disciplineForm.course.trim()
    ) {
      setResult('disciplines', 'error', 'Заполните название, программу и курс дисциплины')
      return
    }

    await runAction('discipline-save', async () => {
      const payload = {
        course: disciplineForm.course.trim(),
        educationalProgramId: disciplineForm.educationalProgramId,
        groupsCount: Number(disciplineForm.groupsCount || '0'),
        maxAssistantsCount: Number(disciplineForm.maxAssistantsCount || '0'),
        modules: parseModules(disciplineForm.modules),
        name: disciplineForm.name.trim(),
      }

      if (editingDisciplineId) {
        await updateDiscipline(editingDisciplineId, payload)
      } else {
        await createDiscipline(payload)
      }

      setIsDisciplineModalOpen(false)
      setEditingDisciplineId(null)
      setDisciplineForm(EMPTY_DISCIPLINE_FORM)
      setResult('disciplines', 'success', 'Дисциплина сохранена')
      await reloadDisciplines()
    }, 'disciplines', 'Не удалось сохранить дисциплину')
  }

  async function handleDeleteDiscipline(disciplineId: string) {
    await runAction(`discipline-delete-${disciplineId}`, async () => {
      await deleteDiscipline(disciplineId)
      setResult('disciplines', 'success', 'Дисциплина удалена')
      await reloadDisciplines()
    }, 'disciplines', 'Не удалось удалить дисциплину')
  }

  function openCreateDisciplineModal() {
    setEditingDisciplineId(null)
    setDisciplineForm(EMPTY_DISCIPLINE_FORM)
    setIsDisciplineModalOpen(true)
  }

  function openEditDisciplineModal(item: AdminDisciplineDto) {
    setEditingDisciplineId(item.id)
    setDisciplineForm({
      course: item.course,
      educationalProgramId: item.educationalProgramId,
      groupsCount: String(item.groupsCount),
      maxAssistantsCount: String(item.maxAssistantsCount),
      modules: item.modules.join(', '),
      name: item.name,
    })
    setIsDisciplineModalOpen(true)
  }

  function setCampaignEdit(campaignId: string, patch: Partial<CampaignEditState>) {
    setCampaignEdits((current) => {
      const source = current[campaignId]

      if (!source) {
        return current
      }

      return {
        ...current,
        [campaignId]: {
          ...source,
          ...patch,
        },
      }
    })
  }

  function setResult(key: string, kind: ActionResult['kind'], message: string) {
    const toastId = toastIdRef.current + 1
    toastIdRef.current = toastId

    setResults((current) => ({
      ...current,
      [key]: { kind, message },
    }))

    setToastQueue((current) => [...current, { id: toastId, kind, message }])

    window.setTimeout(() => {
      clearResult(key)
    }, 3600)
  }

  function clearResult(key: string) {
    setResults((current) => ({
      ...current,
      [key]: null,
    }))
  }

  function dismissToast(toastId: number) {
    setToastQueue((current) => current.filter((item) => item.id !== toastId))
  }

  async function loadCampaigns(onSuccess: (campaigns: CampaignDto[]) => void) {
    setIsCampaignsLoading(true)

    try {
      const response = await getCampaigns()
      onSuccess(response)
    } catch (error) {
      setResult('campaignsList', 'error', getErrorMessage(error))
    } finally {
      setIsCampaignsLoading(false)
    }
  }

  async function loadDisciplines(onSuccess: (disciplines: AdminDisciplineDto[]) => void) {
    setIsDisciplinesLoading(true)

    try {
      const response = await getDisciplines()
      onSuccess(response)
    } catch (error) {
      setResult('disciplines', 'error', getErrorMessage(error))
    } finally {
      setIsDisciplinesLoading(false)
    }
  }

  async function runAction(
    actionKey: string,
    action: () => Promise<void>,
    resultKey: string,
    fallbackMessage: string,
  ) {
    setBusyAction(actionKey)

    try {
      await action()
      return true
    } catch (error) {
      setResult(resultKey, 'error', getErrorMessage(error) || fallbackMessage)
      return false
    } finally {
      setBusyAction((current) => (current === actionKey ? null : current))
    }
  }

  return {
    adminToasts: toastQueue,
    busyAction,
    campaignEdits,
    campaignEndAt,
    campaignForeignCitizenDocumentFormUrl,
    campaignRussianCitizenDocumentFormUrl,
    campaignStartAt,
    campaigns: sortedCampaigns,
    clearCampaignFormResult: () => clearResult('campaignsForm'),
    clearResult,
    disciplineForm,
    disciplineSearch,
    disciplines: filteredDisciplines,
    disciplinesTotalCount: disciplines.length,
    disciplineCourse,
    disciplineCourseOptions,
    disciplineProgram,
    disciplineProgramOptions,
    disciplinesImportFile,
    editingDisciplineId,
    editingEmployeeBackupEmail,
    editingEmployeeId,
    employeeBackupEmail,
    employeeCorporateEmail,
    employeeFullName,
    employeeSearch,
    employees: filteredEmployees,
    handleCreateCampaign,
    handleCreateEmployee,
    handleDeleteCampaign,
    handleToggleCampaignActive,
    handleDeleteDiscipline,
    handleImportDisciplines,
    handleImportStudents,
    handleImportStudentsDocuments,
    handlePromoteStudentsCourses,
    handleSaveCampaign,
    handleSaveDiscipline,
    handleSaveEmployeeEdit,
    handleSetStudentsDocumentsStartDate,
    isCampaignModalOpen,
    isCampaignsLoading,
    isEmployeesLoading,
    isDisciplinesLoading,
    isDisciplineModalOpen,
    isEmployeeCreateModalOpen,
    isInitialLoading,
    isProgramsLoading,
    isStudentsLoading,
    dismissAdminToast: dismissToast,
    openCreateDisciplineModal,
    openEditDisciplineModal,
    programOptions,
    sortedProgramOptions: [...programOptions].sort((left, right) =>
      left.name.localeCompare(right.name, 'ru-RU', {
        sensitivity: 'base',
      }),
    ),
    reloadCampaigns,
    reloadStudents,
    reloadDisciplines,
    results,
    setCampaignEdit,
    setCampaignEndAt,
    setCampaignForeignCitizenDocumentFormUrl,
    setCampaignRussianCitizenDocumentFormUrl,
    setCampaignStartAt,
    setDisciplineForm,
    setDisciplineCourse,
    setDisciplineProgram,
    setDisciplineSearch,
    setDisciplinesImportFile,
    setEditingEmployeeBackupEmail,
    setEditingEmployeeId,
    setEmployeeBackupEmail,
    setEmployeeCorporateEmail,
    setEmployeeFullName,
    setEmployeeSearch,
    setIsCampaignModalOpen,
    setIsDisciplineModalOpen,
    setIsEmployeeCreateModalOpen,
    setStudentsDocsStartDate,
    setStudentsDocumentsFiles,
    setStudentsImportFile,
    students: filteredStudents,
    studentsTotalCount: students.length,
    studentsCourse,
    studentsCourseOptions,
    studentsDocsStartDate,
    studentsDocumentsStatus,
    studentsDocumentsStatusOptions: [...studentsDocumentsStatusOptions],
    studentsDocumentsFiles,
    studentsEducationLevel,
    studentsEducationLevelOptions,
    studentsFaculty,
    studentsFacultyOptions,
    studentsImportFile,
    studentsProgram,
    studentsProgramOptions,
    studentsSearch,
    activeStudentsFiltersCount,
    resetStudentsFilters: () => {
      setStudentsSearch('')
      setStudentsEducationLevel('Любой уровень')
      setStudentsFaculty('Любой факультет')
      setStudentsProgram('Любая ОП')
      setStudentsCourse('Любой курс')
      setStudentsDocumentsStatus('Любой статус')
    },
    setStudentsCourse,
    setStudentsDocumentsStatus,
    setStudentsEducationLevel,
    setStudentsFaculty,
    setStudentsProgram,
    setStudentsSearch,
  }
}

async function waitForDisciplineImport(importId: string, attempts = 30) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const imports = await getDisciplineImports()
    const currentImport = imports.find((item) => item.id === importId)

    if (!currentImport || currentImport.status !== 'processing') {
      return currentImport ?? null
    }

    await delay(1000)
  }

  return null
}

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function compareStudentNames(left: AdminStudentDto, right: AdminStudentDto) {
  const leftName = [left.lastName, left.firstName, left.middleName]
    .filter(Boolean)
    .join(' ')
  const rightName = [right.lastName, right.firstName, right.middleName]
    .filter(Boolean)
    .join(' ')

  return leftName.localeCompare(rightName, 'ru-RU')
}

function compareNullableStrings(
  left: string | null,
  right: string | null,
  fallback: string,
) {
  return (left || fallback).localeCompare(right || fallback, 'ru-RU')
}

function compareCourses(left: string | null, right: string | null) {
  const leftValue = left || '-'
  const rightValue = right || '-'
  const leftNumber = Number(leftValue)
  const rightNumber = Number(rightValue)

  if (!Number.isNaN(leftNumber) && !Number.isNaN(rightNumber)) {
    return leftNumber - rightNumber
  }

  return leftValue.localeCompare(rightValue, 'ru-RU', { numeric: true })
}

function buildCampaignEdits(campaigns: CampaignDto[]) {
  return campaigns.reduce<Record<string, CampaignEditState>>((acc, campaign) => {
    acc[campaign.id] = {
      endsAt: toDateTimeLocal(campaign.endsAt),
      foreignCitizenDocumentFormUrl: campaign.foreignCitizenDocumentFormUrl ?? '',
      isActive: campaign.isActive,
      russianCitizenDocumentFormUrl: campaign.russianCitizenDocumentFormUrl ?? '',
      startsAt: toDateTimeLocal(campaign.startsAt),
    }

    return acc
  }, {})
}

function parseModules(value: string) {
  return value
    .split(',')
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item) && item > 0)
}

function upsertEmployee(list: EmployeeDto[], employee: EmployeeDto) {
  const existingIndex = list.findIndex((item) => item.id === employee.id)

  if (existingIndex === -1) {
    return [employee, ...list]
  }

  const next = [...list]
  next[existingIndex] = employee
  return next
}

function toDateTimeLocal(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const timezoneOffsetMs = date.getTimezoneOffset() * 60_000
  const localDate = new Date(date.getTime() - timezoneOffsetMs)

  return localDate.toISOString().slice(0, 16)
}

function toIsoString(value: string) {
  return new Date(value).toISOString()
}

function normalizeOptionalString(value: string) {
  const normalized = value.trim()

  return normalized || null
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'Не удалось выполнить действие'
}

function normalizeStudentsDocumentsStartDate(value: string) {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return ''
  }

  const dottedMatch = trimmedValue.match(/^(\d{2})\.(\d{2})\.(\d{4})$/)

  if (dottedMatch) {
    const [, day, month, year] = dottedMatch
    const normalizedValue = `${year}-${month}-${day}`

    return isValidIsoDate(normalizedValue) ? normalizedValue : ''
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
    return isValidIsoDate(trimmedValue) ? trimmedValue : ''
  }

  return ''
}

function isValidIsoDate(value: string) {
  const [yearRaw, monthRaw, dayRaw] = value.split('-')
  const year = Number(yearRaw)
  const month = Number(monthRaw)
  const day = Number(dayRaw)

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    month < 1 ||
    month > 12 ||
    day < 1
  ) {
    return false
  }

  const date = new Date(Date.UTC(year, month - 1, day))

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}
