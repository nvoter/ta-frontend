import { useEffect, useMemo, useState } from 'react'
import {
  getCurrentStudent,
  getStudentByEmail,
  updateCurrentStudentProfile,
} from '../api/usersApi'
import { appRoutes } from '../routes/appRoutes'
import type { StudentPersonalDataFormValues } from '../types/studentPersonalData'
import {
  getStudentPersonalDataDraft,
  saveStudentPersonalDataDraft,
} from '../utils/authDraftStorage'
import { getAuthFlow } from '../utils/authFlowStorage'
import { navigateTo } from '../utils/navigation'
import { sortStringsRu } from '../utils/sortOptions'
import {
  getStudentEmailKind,
  isPostgraduateStudentEmail,
} from '../utils/studentEmail'
import { validateStudentPersonalDataForm } from '../utils/validateStudentPersonalDataForm'

interface UseStudentPersonalDataFormOptions {
  embedded?: boolean
  onSaved?: () => void
}

const EDUCATION_LEVEL_OPTIONS = sortStringsRu([
  'Бакалавриат',
  'Магистратура',
  'Аспирантура',
])

const FACULTY_OPTIONS_BY_LEVEL = {
  Аспирантура: sortStringsRu([
    'Аспирантская школа по биологии',
    'Аспирантская школа по востоковедению и африканистике',
    'Аспирантская школа по государственному и муниципальному управлению',
    'Аспирантская школа по искусству и дизайну',
    'Аспирантская школа по историческим наукам',
    'Аспирантская школа по когнитивным наукам',
    'Аспирантская школа по коммуникациям и медиа',
    'Аспирантская школа по компьютерным наукам',
    'Аспирантская школа по культурологии',
    'Аспирантская школа по математике',
    'Аспирантская школа по международным отношениям и зарубежным региональным исследованиям',
    'Аспирантская школа по менеджменту',
    'Аспирантская школа по образованию',
    'Аспирантская школа по политическим наукам',
    'Аспирантская школа по праву',
    'Аспирантская школа по психологии',
    'Аспирантская школа по социологическим наукам',
    'Аспирантская школа по техническим наукам',
    'Аспирантская школа по физике',
    'Аспирантская школа по филологическим наукам',
    'Аспирантская школа по философским наукам',
    'Аспирантская школа по химии',
    'Аспирантская школа по экономике',
  ]),
  Бакалавриат: sortStringsRu([
    'Банковский институт',
    'Высшая школа бизнеса (ВШБ)',
    'Высшая школа юриспруденции и администрирования',
    'Институт востоковедения и африканистики',
    'Международный институт экономики и финансов (МИЭФ)',
    'Московский институт электроники и математики им. А.Н. Тихонова (МИЭМ)',
    'Социально-гуманитарный факультет',
    'Факультет биологии и биотехнологии (ФББ)',
    'Факультет географии и геоинформационных технологий (ФГиГИТ)',
    'Факультет городского и регионального развития (ФГРР)',
    'Факультет гуманитарных наук (ФГН)',
    'Факультет гуманитарных наук',
    'Факультет информатики, математики и компьютерных наук',
    'Факультет компьютерных наук (ФКН)',
    'Факультет креативных индустрий (ФКИ)',
    'Факультет менеджмента',
    'Факультет математики (ФМ)',
    'Факультет мировой экономики и мировой политики (ФМЭиМП)',
    'Факультет права (ФП)',
    'Факультет права',
    'Факультет социальных наук (ФСН)',
    'Факультет физики (Физ)',
    'Факультет химии (ФХ)',
    'Факультет экономики',
    'Факультет экономики, менеджмента и бизнес-информатики',
    'Факультет экономических наук (ФЭН)',
    'Школа дизайна',
    'Школа экономики и менеджмента',
    'Школа гуманитарных наук и искусств',
    'Школа иностранных языков (ШИЯ)',
    'Школа информатики, физики и технологий',
    'Школа инноватики и предпринимательства (ШИП)',
    'Школа социальных наук',
    'Юридический факультет',
  ]),
  Магистратура: sortStringsRu([
    'Банковский институт',
    'Высшая школа бизнеса (ВШБ)',
    'Высшая школа юриспруденции и администрирования',
    'Институт востоковедения и африканистики',
    'Международный институт экономики и финансов (МИЭФ)',
    'Московский институт электроники и математики им. А.Н. Тихонова (МИЭМ)',
    'Социально-гуманитарный факультет',
    'Факультет биологии и биотехнологии (ФББ)',
    'Факультет географии и геоинформационных технологий (ФГиГИТ)',
    'Факультет городского и регионального развития (ФГРР)',
    'Факультет гуманитарных наук (ФГН)',
    'Факультет гуманитарных наук',
    'Факультет информатики, математики и компьютерных наук',
    'Факультет компьютерных наук (ФКН)',
    'Факультет креативных индустрий (ФКИ)',
    'Факультет менеджмента',
    'Факультет математики (ФМ)',
    'Факультет мировой экономики и мировой политики (ФМЭиМП)',
    'Факультет права (ФП)',
    'Факультет права',
    'Факультет социальных наук (ФСН)',
    'Факультет физики (Физ)',
    'Факультет химии (ФХ)',
    'Факультет экономики',
    'Факультет экономики, менеджмента и бизнес-информатики',
    'Факультет экономических наук (ФЭН)',
    'Школа дизайна',
    'Школа экономики и менеджмента',
    'Школа гуманитарных наук и искусств',
    'Школа иностранных языков (ШИЯ)',
    'Школа информатики, физики и технологий',
    'Школа инноватики и предпринимательства (ШИП)',
    'Школа социальных наук',
    'Юридический факультет',
  ]),
} as const

const CITIZENSHIP_OPTIONS = sortStringsRu([
  'Россия',
  'Азербайджан',
  'Армения',
  'Беларусь',
  'Великобритания',
  'Вьетнам',
  'Германия',
  'Грузия',
  'Израиль',
  'Индия',
  'Иран',
  'Испания',
  'Италия',
  'Казахстан',
  'Китай',
  'Кыргызстан',
  'Молдова',
  'США',
  'Таджикистан',
  'Туркменистан',
  'Турция',
  'Узбекистан',
  'Украина',
  'Франция',
  'Южная Корея',
])

export function useStudentPersonalDataForm(
  options: UseStudentPersonalDataFormOptions = {},
) {
  const authFlow = getAuthFlow()
  const [values, setValues] = useState(() => {
    const draft = getStudentPersonalDataDraft()

    return normalizeStudentPersonalDataValues({
      ...draft,
      email: draft.email || authFlow?.email || '',
    })
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [lockedFields, setLockedFields] = useState<Record<string, boolean>>({})
  const studentEmail = authFlow?.email ?? values.email
  const studentEmailKind = getStudentEmailKind(studentEmail)
  const isPostgraduate = studentEmailKind === 'postgraduate'
  const educationLevelOptions = isPostgraduate
    ? ['Аспирантура']
    : EDUCATION_LEVEL_OPTIONS.filter((option) => option !== 'Аспирантура')

  const errors = useMemo(
    () => (isSubmitted ? validateStudentPersonalDataForm(values) : {}),
    [isSubmitted, values],
  )

  useEffect(() => {
    let isMounted = true

    async function loadStudent() {
      if (!studentEmail) {
        if (isMounted) {
          setIsLoading(false)
        }
        return
      }

      try {
        const student = authFlow?.email
          ? await getStudentByEmail(studentEmail)
          : await getCurrentStudent()

        if (!isMounted) {
          return
        }

        setValues((currentValues) => {
          const nextValues = normalizeStudentPersonalDataValues({
            ...currentValues,
            citizenship: student.citizenship || currentValues.citizenship,
            dateOfBirth: student.birthDate || currentValues.dateOfBirth,
            educationLevel: student.educationLevel || currentValues.educationLevel,
            educationalProgram:
              student.educationalProgram || currentValues.educationalProgram,
            email: student.email || currentValues.email,
            faculty: student.faculty || currentValues.faculty,
            fullName:
              [student.lastName, student.firstName, student.middleName]
                .filter(Boolean)
                .join(' ') || currentValues.fullName,
            phone: student.phone || currentValues.phone,
            telegram: student.telegram || currentValues.telegram,
            yearOfStudy: student.course || currentValues.yearOfStudy,
          })

          saveStudentPersonalDataDraft(nextValues)
          return nextValues
        })
        setLockedFields({
          citizenship: Boolean(student.citizenship),
          educationLevel: Boolean(student.educationLevel),
          educationalProgram: Boolean(student.educationalProgram),
          email: Boolean(student.email),
          faculty: false,
          fullName: Boolean(student.firstName && student.lastName),
          yearOfStudy: Boolean(student.course),
        })
      } catch (error) {
        if (isMounted) {
          setSubmitError(getErrorMessage(error))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadStudent()

    return () => {
      isMounted = false
    }
  }, [authFlow?.email, studentEmail])

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, type, value } = event.target
    const checked =
      type === 'checkbox' && 'checked' in event.target ? event.target.checked : false

    if (lockedFields[name]) {
      return
    }

    const nextValues = {
      ...values,
      [name]: type === 'checkbox' ? checked : value,
    }

    if (name === 'educationLevel') {
      nextValues.faculty = ''
    }

    const normalizedValues = normalizeStudentPersonalDataValues(nextValues)

    setValues(normalizedValues)
    saveStudentPersonalDataDraft(normalizedValues)
    setSubmitError('')
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitted(true)
    setSubmitError('')

    const nextErrors = validateStudentPersonalDataForm(values)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    const fullNameParts = splitFullName(values.fullName)

    if (!fullNameParts) {
      setSubmitError('Укажите ФИО в формате "Фамилия Имя Отчество"')
      return
    }

    try {
      setIsSaving(true)
      await updateCurrentStudentProfile({
        birthDate: values.dateOfBirth,
        citizenship: values.citizenship.trim(),
        course: values.yearOfStudy.trim(),
        educationLevel: values.educationLevel.trim(),
        educationalProgram: values.educationalProgram.trim(),
        faculty: values.faculty.trim(),
        firstName: fullNameParts.firstName,
        lastName: fullNameParts.lastName,
        middleName: fullNameParts.middleName,
        phone: values.phone.trim(),
        telegram: values.telegram.trim(),
      })
      options.onSaved?.()

      if (!options.embedded) {
        navigateTo(appRoutes.studentDashboard)
      }
    } catch (error) {
      setSubmitError(getErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  return {
    citizenshipOptions: CITIZENSHIP_OPTIONS,
    educationLevelOptions,
    errors,
    facultyOptions:
      FACULTY_OPTIONS_BY_LEVEL[
        values.educationLevel as keyof typeof FACULTY_OPTIONS_BY_LEVEL
      ] ?? [],
    handleInputChange,
    handleSubmit,
    isLoading,
    isPostgraduate,
    isSaving,
    lockedFields,
    submitError,
    values,
  }
}

export function isStudentSelectOtherValue(options: readonly string[], value: string) {
  return value.trim().length > 0 && !options.includes(value)
}

function splitFullName(fullName: string) {
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (parts.length < 2) {
    return null
  }

  return {
    firstName: parts[1],
    lastName: parts[0],
    middleName: parts.slice(2).join(' ') || null,
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Не удалось сохранить персональные данные'
}

function normalizeStudentPersonalDataValues(values: StudentPersonalDataFormValues) {
  if (isPostgraduateStudentEmail(values.email)) {
    return {
      ...values,
      educationLevel: 'Аспирантура',
      educationalProgram: '',
    }
  }

  if (values.educationLevel === 'Аспирантура') {
    return {
      ...values,
      educationLevel: '',
      faculty: '',
    }
  }

  return values
}
