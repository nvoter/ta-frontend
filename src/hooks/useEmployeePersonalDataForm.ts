import { useEffect, useMemo, useState } from 'react'
import {
  getCurrentEmployeeProfile,
  updateCurrentEmployeeProfile,
} from '../api/usersApi'
import { appRoutes } from '../routes/appRoutes'
import {
  getEmployeePersonalDataDraft,
  saveEmployeePersonalDataDraft,
} from '../utils/authDraftStorage'
import { getAuthSession, saveAuthSession } from '../utils/authSessionStorage'
import { navigateTo } from '../utils/navigation'
import { sortStringsRu } from '../utils/sortOptions'

interface EmployeePersonalDataValues {
  fullName: string
  phone: string
  position: string
  workplace: string
}

const EMPLOYEE_POSITION_VALUES = [
  'Ассистент',
  'Преподаватель',
  'Старший преподаватель',
  'Доцент',
  'Профессор',
  'Приглашенный преподаватель',
] as const

const EMPLOYEE_WORKPLACE_VALUES = [
  'Департамент анализа данных и искусственного интеллекта',
  'Департамент больших данных и информационного поиска',
  'Департамент программной инженерии',
  'Базовая кафедра Яндекс',
  'Базовая кафедра МТС',
  'Базовая кафедра Т-Банка',
  'Базовая кафедра ПАО Сбербанка («Финансовые технологии и анализ данных»)',
  'Базовая кафедра ИППИ РАН (Базовая кафедра Института проблем передачи информации им. А.А. Харкевича РАН)',
  'Базовая кафедра ИВМ РАН (Базовая кафедра Института вычислительной математики им. Г.И. Марчука РАН)',
  'Базовая кафедра ИСП РАН (Базовая кафедра «Системное программирование» Института системного программирования им. В.П. Иванникова РАН)',
  'Базовая кафедра фирмы 1С',
  'Базовая кафедра МИАН (Базовая кафедра Математического института им В.А. Стеклова РАН)',
  'Базовая кафедра ФИЦ ИУ РАН (Базовая кафедра Федерального исследовательского центра «Информатика и управление» РАН)',
] as const

export const EMPLOYEE_POSITION_OPTIONS: readonly string[] = sortStringsRu([
  ...EMPLOYEE_POSITION_VALUES,
])

export const EMPLOYEE_WORKPLACE_OPTIONS: readonly string[] = sortStringsRu([
  ...EMPLOYEE_WORKPLACE_VALUES,
])

interface UseEmployeePersonalDataFormOptions {
  embedded?: boolean
  onCancel?: () => void
  onSaved?: () => void
}

export function useEmployeePersonalDataForm(
  options: UseEmployeePersonalDataFormOptions = {},
) {
  const session = getAuthSession()
  const [initialValues, setInitialValues] = useState<EmployeePersonalDataValues>({
    fullName: '',
    phone: '',
    position: '',
    workplace: '',
  })
  const [values, setValues] = useState<EmployeePersonalDataValues>(() =>
    getEmployeePersonalDataDraft(),
  )
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const errors = useMemo(
    () => (isSubmitted ? validateEmployeePersonalDataForm(values) : {}),
    [isSubmitted, values],
  )

  useEffect(() => {
    let isMounted = true

    async function loadEmployeeProfile() {
      try {
        const employee = await getCurrentEmployeeProfile()

        if (!isMounted) {
          return
        }

        const nextValues = {
          fullName: employee.fullName || '',
          phone: employee.phone || '',
          position: employee.position || '',
          workplace: employee.workplace || '',
        }

        setInitialValues(nextValues)
        setValues(nextValues)
        saveEmployeePersonalDataDraft(nextValues)
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

    void loadEmployeeProfile()

    return () => {
      isMounted = false
    }
  }, [])

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    const nextValues = {
      ...values,
      [name]: value,
    }

    setValues(nextValues)
    saveEmployeePersonalDataDraft(nextValues)
    setSubmitError('')
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitted(true)
    setSubmitError('')

    const nextErrors = validateEmployeePersonalDataForm(values)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    try {
      setIsSaving(true)

      await updateCurrentEmployeeProfile({
        fullName: values.fullName.trim(),
        phone: values.phone.trim(),
        position: values.position.trim(),
        workplace: values.workplace.trim(),
      })

      if (session) {
        saveAuthSession({
          ...session,
          employeeFullName: values.fullName.trim(),
          requiresProfileCompletion: false,
        })
      }

      options.onSaved?.()

      if (!options.embedded) {
        navigateTo(appRoutes.employeeStudentApplications)
      }
    } catch (error) {
      setSubmitError(getErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setValues(initialValues)
    setIsSubmitted(false)
    setSubmitError('')
    saveEmployeePersonalDataDraft(initialValues)
    options.onCancel?.()
  }

  return {
    email: session?.email ?? '',
    errors,
    handleCancel,
    handleInputChange,
    handleSubmit,
    isLoading,
    isSaving,
    submitError,
    values,
  }
}

function validateEmployeePersonalDataForm(values: EmployeePersonalDataValues) {
  const errors: Partial<Record<keyof EmployeePersonalDataValues, string>> = {}

  if (!values.fullName.trim()) {
    errors.fullName = 'Введите ФИО'
  }

  if (!values.position.trim()) {
    errors.position = 'Выберите должность'
  } else if (
    !EMPLOYEE_POSITION_OPTIONS.includes(values.position.trim())
  ) {
    errors.position = 'Выберите должность из списка'
  }

  if (!values.workplace.trim()) {
    errors.workplace = 'Выберите место работы'
  } else if (
    !EMPLOYEE_WORKPLACE_OPTIONS.includes(values.workplace.trim())
  ) {
    errors.workplace = 'Выберите место работы из списка'
  }

  if (!values.phone.trim()) {
    errors.phone = 'Введите номер телефона'
  }

  return errors
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Не удалось сохранить персональные данные'
}
