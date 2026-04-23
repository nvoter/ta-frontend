import { useEffect, useMemo, useState } from 'react'
import {
  createApplication,
  getApplicationById,
  updateApplication,
} from '../api/applicationsApi'
import {
  getDisciplinesByProgramId,
  getEducationalPrograms,
} from '../api/disciplinesApi'
import { useCampaignAccess } from './useCampaignAccess'
import { appRoutes } from '../routes/appRoutes'
import type {
  DisciplineFormErrors,
  DisciplineFormItem,
  StudentApplicationFormErrors,
  StudentApplicationFormState,
} from '../types/studentApplicationForm'
import { navigateTo } from '../utils/navigation'
import { sortOptionsByLabel, sortStringsRu } from '../utils/sortOptions'

const GRADE_OPTIONS = ['4', '5', '6', '7', '8', '9', '10']
const WORK_TYPE_OPTIONS = ['Платно', 'Безвозмездно (за счет кредитных единиц)']
const MAX_FILE_SIZE = 5 * 1024 * 1024

const INITIAL_DISCIPLINE_ITEMS: DisciplineFormItem[] = Array.from(
  { length: 5 },
  (_, index) => ({
    discipline: '',
    educationProgram: '',
    grade: '',
    id: `discipline-${index + 1}`,
    isGradeConfirmed: false,
    lecturerName: '',
    motivation: '',
    previousDisciplineName: '',
    priority: index + 1,
    seminarTeacherName: '',
    twoGroups: false,
    workType: '',
  }),
)

export function useStudentApplicationForm() {
  const navigationState = window.history.state as
    | { applicationId?: string }
    | null
    | undefined
  const applicationId =
    typeof navigationState?.applicationId === 'string'
      ? navigationState.applicationId
      : ''
  const isEditMode = applicationId.length > 0
  const { campaignError, isReadOnly } = useCampaignAccess()
  const [formState, setFormState] = useState<StudentApplicationFormState>({
    activeDisciplineTab: INITIAL_DISCIPLINE_ITEMS[0].id,
    fileError: '',
    selectedFileName: '',
  })
  const [disciplineItems, setDisciplineItems] = useState(INITIAL_DISCIPLINE_ITEMS)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [programOptions, setProgramOptions] = useState<Array<{ id: string; label: string }>>(
    [],
  )
  const [disciplineOptionsByProgram, setDisciplineOptionsByProgram] = useState<
    Record<string, Array<{ id: string; label: string }>>
  >({})
  const [loadedDisciplinesCount, setLoadedDisciplinesCount] = useState(0)
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(true)
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(isEditMode)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const gradeOptions = useMemo(() => GRADE_OPTIONS, [])
  const workTypeOptions = useMemo(() => sortStringsRu(WORK_TYPE_OPTIONS), [])
  const errors = useMemo(
    () =>
      isSubmitted
        ? validateStudentApplicationForm(formState, disciplineItems)
        : { disciplineItems: {} },
    [disciplineItems, formState, isSubmitted],
  )

  useEffect(() => {
    let isMounted = true

    async function loadPrograms() {
      try {
        const programs = await getEducationalPrograms()

        if (!isMounted) {
          return
        }

        setProgramOptions(
          sortOptionsByLabel(
            programs.map((program) => ({
              id: program.id,
              label: program.name,
            })),
          ),
        )
      } catch (error) {
        if (isMounted) {
          setSubmitError(getErrorMessage(error))
        }
      } finally {
        if (isMounted) {
          setIsLoadingPrograms(false)
        }
      }
    }

    void loadPrograms()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadApplication() {
      if (!isEditMode) {
        return
      }

      try {
        const application = await getApplicationById(applicationId)

        const loadedProgramIds = [
          ...new Set(
            await Promise.all(
              application.disciplines.map(async (discipline) => {
                const disciplineOptions = await getDisciplineOptionsForDisciplineId(
                  discipline.disciplineId,
                )
                return disciplineOptions.programId
              }),
            ),
          ),
        ]

        const optionsEntries = await Promise.all(
          loadedProgramIds.map(async (programId) => {
            const disciplines = await getDisciplinesByProgramId(programId)

            return [
              programId,
              sortOptionsByLabel(
                disciplines.map((discipline) => ({
                  id: discipline.id,
                  label: discipline.name,
                })),
              ),
            ] as const
          }),
        )

        if (!isMounted) {
          return
        }

        setDisciplineOptionsByProgram((current) => ({
          ...current,
          ...Object.fromEntries(optionsEntries),
        }))

        const disciplinesByPriority = [...application.disciplines].sort(
          (left, right) => left.priority - right.priority,
        )

        setDisciplineItems((current) =>
          current.map((item, index) => {
            const source = disciplinesByPriority[index]

            if (!source) {
              return {
                ...item,
                priority: index + 1,
              }
            }

            const matchedProgramId =
              optionsEntries.find(([, options]) =>
                options.some((option) => option.id === source.disciplineId),
              )?.[0] ?? ''

            return {
              ...item,
              applicationDisciplineId: source.id,
              applicationDisciplineStatus: source.status ?? 'NEW',
              discipline: source.disciplineId,
              educationProgram: matchedProgramId,
              grade: String(source.studiedDisciplineGrade),
              isGradeConfirmed: true,
              lecturerName: source.lecturerName,
              motivation: source.motivation,
              previousDisciplineName: source.studiedDisciplineName,
              priority: source.priority,
              seminarTeacherName: source.seminarianName,
              twoGroups: source.twoGroups,
              workType: fromWorkType(source.workType),
            }
          }),
        )
        setLoadedDisciplinesCount(application.disciplines.length)

        setFormState((current) => ({
          ...current,
          activeDisciplineTab: INITIAL_DISCIPLINE_ITEMS[0].id,
          selectedFileName: application.gradebook.fileName,
        }))
      } catch (error) {
        if (isMounted) {
          setSubmitError(getErrorMessage(error))
        }
      } finally {
        if (isMounted) {
          setIsLoadingInitialData(false)
        }
      }
    }

    void loadApplication()

    return () => {
      isMounted = false
    }
  }, [applicationId, isEditMode])

  function updateFormState<Key extends keyof StudentApplicationFormState>(
    key: Key,
    value: StudentApplicationFormState[Key],
  ) {
    setFormState((current) => ({
      ...current,
      [key]: value,
    }))
  }

  function updateDisciplineItem<Key extends keyof DisciplineFormItem>(
    itemId: string,
    key: Key,
    value: DisciplineFormItem[Key],
  ) {
    setDisciplineItems((current) =>
      current
        .map((item) => {
          if (key === 'priority') {
            const nextPriority = Number(value)
            const currentItem = current.find((entry) => entry.id === itemId)

            if (!currentItem || !Number.isInteger(nextPriority)) {
              return item
            }

            if (item.id === itemId) {
              return {
                ...item,
                priority: nextPriority,
              }
            }

            if (item.priority === nextPriority) {
              return {
                ...item,
                priority: currentItem.priority,
              }
            }

            return item
          }

          if (item.id !== itemId) {
            return item
          }

          if (key === 'educationProgram') {
            void ensureDisciplineOptionsLoaded(String(value))

            return {
              ...item,
              discipline: '',
              educationProgram: String(value),
              previousDisciplineName: '',
            }
          }

          if (key === 'discipline') {
            const nextDisciplineId = String(value)
            const disciplineOptions = disciplineOptionsByProgram[item.educationProgram] ?? []
            const disciplineLabel =
              disciplineOptions.find((option) => option.id === nextDisciplineId)?.label ?? ''

            return {
              ...item,
              discipline: nextDisciplineId,
              previousDisciplineName: disciplineLabel,
            }
          }

          return {
            ...item,
            [key]: value,
          }
        })
        .sort((left, right) => left.priority - right.priority),
    )
  }

  function getDisciplineOptions(programId: string) {
    return disciplineOptionsByProgram[programId] ?? []
  }

  function getAvailableDisciplineOptions(itemId: string, programId: string) {
    const selectedDisciplines = new Set(
      disciplineItems
        .filter((item) => item.id !== itemId)
        .map((item) => item.discipline)
        .filter((value) => value.length > 0),
    )

    return getDisciplineOptions(programId).filter(
      (option) => !selectedDisciplines.has(option.id),
    )
  }

  function handleFileChange(file: File | null) {
    if (!file) {
      return
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    const isSupportedExtension = fileExtension === 'pdf' || fileExtension === 'docx'

    if (!isSupportedExtension) {
      setSelectedFile(null)
      setFormState((current) => ({
        ...current,
        fileError: 'Можно выбрать только файл в формате PDF или DOCX',
        selectedFileName: '',
      }))

      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null)
      setFormState((current) => ({
        ...current,
        fileError: 'Размер файла не должен превышать 5 МБ',
        selectedFileName: '',
      }))

      return
    }

    setSelectedFile(file)
    setFormState((current) => ({
      ...current,
      fileError: '',
      selectedFileName: file.name,
    }))
    setSubmitError('')
  }

  function clearSelectedFile() {
    setSelectedFile(null)
    setFormState((current) => ({
      ...current,
      fileError: '',
      selectedFileName: '',
    }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitted(true)
    setSubmitError('')

    const nextErrors = validateStudentApplicationForm(formState, disciplineItems)

    if (Object.keys(nextErrors.disciplineItems).length > 0) {
      setFormState((current) => ({
        ...current,
        activeDisciplineTab: INITIAL_DISCIPLINE_ITEMS[0].id,
      }))
    }

    if (
      nextErrors.gradebookFile ||
      Object.keys(nextErrors.disciplineItems).length > 0
    ) {
      return
    }

    if (!selectedFile && !isEditMode) {
      setSubmitError('Загрузите файл зачетной книжки')
      return
    }

    const disciplines = disciplineItems
      .filter(getHasAnyFilledField)
      .map((item) => ({
        applicationDisciplineId: item.applicationDisciplineId,
        disciplineId: item.discipline,
        lecturerName: item.lecturerName.trim(),
        motivation: item.motivation.trim(),
        priority: item.priority,
        seminarianName: item.seminarTeacherName.trim(),
        studiedDisciplineGrade: Number(item.grade),
        studiedDisciplineName: item.previousDisciplineName.trim(),
        twoGroups: item.twoGroups,
        workType: toWorkType(item.workType),
      }))

    try {
      setIsSubmitting(true)
      if (isEditMode) {
        await updateApplication({
          applicationId,
          disciplines: disciplines.map((item) => ({
            ...item,
            applicationDisciplineId: item.applicationDisciplineId,
          })),
          gradebook: selectedFile,
        })
      } else {
        await createApplication({
          disciplines: disciplines.map(({ applicationDisciplineId: _ignored, ...item }) => item),
          gradebook: selectedFile as File,
          socialPension: false,
        })
      }
      navigateTo(appRoutes.studentDashboard)
    } catch (error) {
      setSubmitError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function ensureDisciplineOptionsLoaded(programId: string) {
    if (!programId || disciplineOptionsByProgram[programId]) {
      return
    }

    try {
      const disciplines = await getDisciplinesByProgramId(programId)
      setDisciplineOptionsByProgram((current) => ({
        ...current,
        [programId]: sortOptionsByLabel(
          disciplines.map((discipline) => ({
            id: discipline.id,
            label: discipline.name,
          })),
        ),
      }))
    } catch (error) {
      setSubmitError(getErrorMessage(error))
    }
  }

  return {
    campaignError,
    clearSelectedFile,
    disciplineItems,
    errors,
    formState,
    getDisciplineCompletionRatio,
    getIsDisciplineTabEnabled,
    getAvailableDisciplineOptions,
    getDisciplineOptions,
    gradeOptions,
    handleFileChange,
    handleSubmit,
    isEditMode,
    isLoadingInitialData,
    isLoadingPrograms,
    isReadOnly,
    isSubmitting,
    loadedDisciplinesCount,
    programOptions,
    submitError,
    updateDisciplinePriorities: (
      priorityUpdates: Array<{ itemId: string; priority: number }>,
    ) => {
      setDisciplineItems((current) => {
        const priorityById = new Map(
          priorityUpdates.map((item) => [item.itemId, item.priority]),
        )

        return current
          .map((item) => ({
            ...item,
            priority: priorityById.get(item.id) ?? item.priority,
          }))
          .sort((left, right) => left.priority - right.priority)
      })
    },
    updateDisciplineItem,
    updateFormState,
    workTypeOptions,
  }
}

function getFilledFieldsCount(item: DisciplineFormItem) {
  return [
    item.educationProgram,
    item.discipline,
    item.previousDisciplineName,
    item.grade,
    item.motivation,
    item.lecturerName,
    item.seminarTeacherName,
    item.workType,
  ].filter((value) => value.trim().length > 0).length + Number(item.isGradeConfirmed)
}

function getHasAnyFilledField(item: DisciplineFormItem) {
  return getFilledFieldsCount(item) > 0
}

function getDisciplineCompletionRatio(item: DisciplineFormItem) {
  return getFilledFieldsCount(item) / 9
}

function getIsDisciplineTabEnabled(
  disciplineItems: DisciplineFormItem[],
  disciplineId: string,
) {
  const currentIndex = disciplineItems.findIndex((item) => item.id === disciplineId)

  if (currentIndex <= 0) {
    return true
  }

  return disciplineItems
    .slice(0, currentIndex)
    .every((item) => getHasAnyFilledField(item))
}

function validateStudentApplicationForm(
  formState: StudentApplicationFormState,
  disciplineItems: DisciplineFormItem[],
): StudentApplicationFormErrors {
  const disciplineItemsErrors: Record<string, DisciplineFormErrors> = {}
  const hasAtLeastOneFilledDiscipline = disciplineItems.some(getHasAnyFilledField)
  const disciplineIdsCount = disciplineItems.reduce<Map<string, number>>((acc, item) => {
    if (!item.discipline) {
      return acc
    }

    acc.set(item.discipline, (acc.get(item.discipline) ?? 0) + 1)
    return acc
  }, new Map())

  for (const item of disciplineItems) {
    if (!getHasAnyFilledField(item)) {
      continue
    }

    const itemErrors: DisciplineFormErrors = {}

    if (!item.educationProgram) {
      itemErrors.educationProgram = 'Выберите образовательную программу'
    }

    if (!item.discipline) {
      itemErrors.discipline = 'Выберите дисциплину'
    } else if ((disciplineIdsCount.get(item.discipline) ?? 0) > 1) {
      itemErrors.discipline = 'Эта дисциплина уже выбрана в другой заявке текущей кампании'
    }

    if (!item.previousDisciplineName.trim()) {
      itemErrors.previousDisciplineName =
        'Укажите название ранее изученной схожей дисциплины'
    }

    if (!item.grade) {
      itemErrors.grade = 'Выберите оценку'
    }

    if (!item.motivation.trim()) {
      itemErrors.motivation =
        'Укажите, почему Вы хотите ассистировать на дисциплине'
    }

    if (!item.lecturerName.trim()) {
      itemErrors.lecturerName = 'Укажите ФИО лектора'
    }

    if (!item.seminarTeacherName.trim()) {
      itemErrors.seminarTeacherName = 'Укажите ФИО семинариста'
    }

    if (!item.workType) {
      itemErrors.workType = 'Выберите тип оказания услуг'
    }

    if (!item.isGradeConfirmed) {
      itemErrors.isGradeConfirmed = 'Подтвердите соответствие указанной оценки'
    }

    if (Object.keys(itemErrors).length > 0) {
      disciplineItemsErrors[item.id] = itemErrors
    }
  }

  return {
    disciplineGeneral: hasAtLeastOneFilledDiscipline
      ? undefined
      : 'Для подачи заявки заполните хотя бы одну форму дисциплин',
    disciplineItems: disciplineItemsErrors,
    gradebookFile: formState.fileError || undefined,
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Не удалось отправить заявку'
}

function toWorkType(value: string): 'FREE' | 'PAID' {
  return value === 'Платно' ? 'PAID' : 'FREE'
}

function fromWorkType(value: 'FREE' | 'PAID') {
  return value === 'PAID' ? 'Платно' : 'Безвозмездно (за счет кредитных единиц)'
}

async function getDisciplineOptionsForDisciplineId(disciplineId: string) {
  const programs = await getEducationalPrograms()

  for (const program of programs) {
    const disciplines = await getDisciplinesByProgramId(program.id)
    if (disciplines.some((discipline) => discipline.id === disciplineId)) {
      return { programId: program.id }
    }
  }

  return { programId: '' }
}
