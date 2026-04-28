import { useEffect, useMemo, useState } from 'react'
import {
  getEmployeeSessionContext,
  updateEmployeeSessionContext,
} from '../api/usersApi'
import {
  EMPLOYEE_OTHER_WORKPLACE_OPTION,
  EMPLOYEE_SESSION_CONTEXT_POSITION_OPTIONS,
  isKnownEmployeeWorkplace,
} from './useEmployeePersonalDataForm'
import { validateEmployeeEmail } from '../utils/validateEmployeeEmail'

type SessionContextMode = 'self' | 'delegate'

interface EmployeeSessionContextDraft {
  applicantEmail: string
  applicantName: string
  applicantPhone: string
  applicantPosition: string
  applicantWorkplace: string
  mode: SessionContextMode
}

interface SessionContextFieldErrors {
  applicantEmail: string | null
  applicantName: string | null
  applicantPhone: string | null
  applicantPosition: string | null
  applicantWorkplace: string | null
}

interface EmployeeSessionContextFormOptions {
  onClose?: () => void
  onSubmitted?: () => void
}

const DEFAULT_DRAFT: EmployeeSessionContextDraft = {
  applicantEmail: '',
  applicantName: '',
  applicantPhone: '',
  applicantPosition: '',
  applicantWorkplace: '',
  mode: 'self',
}

export function useEmployeeSessionContextForm(
  options: EmployeeSessionContextFormOptions = {},
) {
  const [draft, setDraft] = useState<EmployeeSessionContextDraft>(DEFAULT_DRAFT)
  const [isLoadingInitialState, setIsLoadingInitialState] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isCustomWorkplace, setIsCustomWorkplace] = useState(() =>
    shouldUseCustomWorkplaceInput(DEFAULT_DRAFT.applicantWorkplace),
  )

  const fieldErrors = useMemo(
    () => (isSubmitted ? getValidationErrors(draft) : getEmptyErrors()),
    [draft, isSubmitted],
  )

  useEffect(() => {
    let isMounted = true

    async function loadCurrentContext() {
      try {
        const context = await getEmployeeSessionContext()

        if (!isMounted) {
          return
        }

        setDraft({
          applicantEmail: context.applicantEmail ?? '',
          applicantName: context.applicantName ?? '',
          applicantPhone: context.applicantPhone ?? '',
          applicantPosition: context.applicantPosition ?? '',
          applicantWorkplace: context.applicantWorkplace ?? '',
          mode: context.isTheApplicant ? 'self' : 'delegate',
        })
        setIsCustomWorkplace(
          shouldUseCustomWorkplaceInput(context.applicantWorkplace ?? ''),
        )
      } catch (error) {
        if (isMounted) {
          setSubmitError(getErrorMessage(error))
        }
      } finally {
        if (isMounted) {
          setIsLoadingInitialState(false)
        }
      }
    }

    void loadCurrentContext()

    return () => {
      isMounted = false
    }
  }, [])

  const handleModeChange = (mode: SessionContextMode) => {
    setDraft((currentState) => ({
      ...currentState,
      mode,
    }))
    setSubmitError('')
  }

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    const normalizedValue =
      name === 'applicantWorkplace' && value === EMPLOYEE_OTHER_WORKPLACE_OPTION
        ? ''
        : value

    if (name === 'applicantWorkplace') {
      setIsCustomWorkplace(value === EMPLOYEE_OTHER_WORKPLACE_OPTION)
    }

    setDraft((currentState) => ({
      ...currentState,
      [name]: normalizedValue,
    }))
    setSubmitError('')
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitted(true)

    const nextErrors = getValidationErrors(draft)

    if (Object.values(nextErrors).some(Boolean)) {
      return
    }

    try {
      setIsSubmitting(true)
      setSubmitError('')
      await updateEmployeeSessionContext({
        applicantEmail: draft.mode === 'delegate' ? draft.applicantEmail.trim() : null,
        applicantName: draft.mode === 'delegate' ? draft.applicantName.trim() : null,
        applicantPhone: draft.mode === 'delegate' ? draft.applicantPhone.trim() : null,
        applicantPosition:
          draft.mode === 'delegate' ? draft.applicantPosition.trim() : null,
        applicantWorkplace:
          draft.mode === 'delegate' ? draft.applicantWorkplace.trim() : null,
        isTheApplicant: draft.mode === 'self',
      })
      options.onSubmitted?.()
      options.onClose?.()
    } catch (error) {
      setSubmitError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    applicantEmail: draft.applicantEmail,
    applicantEmailError: fieldErrors.applicantEmail,
    applicantName: draft.applicantName,
    applicantNameError: fieldErrors.applicantName,
    applicantPhone: draft.applicantPhone,
    applicantPhoneError: fieldErrors.applicantPhone,
    applicantPosition: draft.applicantPosition,
    applicantPositionError: fieldErrors.applicantPosition,
    applicantWorkplace: draft.applicantWorkplace,
    applicantWorkplaceError: fieldErrors.applicantWorkplace,
    handleChange,
    handleModeChange,
    handleSubmit,
    isDelegateMode: draft.mode === 'delegate',
    isCustomWorkplace,
    isLoadingInitialState,
    isSelfMode: draft.mode === 'self',
    isSubmitting,
    resetWorkplaceToSelect: () => {
      setDraft((currentState) => ({
        ...currentState,
        applicantWorkplace: '',
      }))
      setIsCustomWorkplace(false)
      setSubmitError('')
    },
    submitError,
  }
}

function getValidationErrors(
  draft: EmployeeSessionContextDraft,
): SessionContextFieldErrors {
  if (draft.mode === 'self') {
    return getEmptyErrors()
  }

  return {
    applicantEmail: validateApplicantEmail(draft.applicantEmail),
    applicantName: validateRequiredValue(
      draft.applicantName,
      'Укажите ФИО преподавателя',
    ),
    applicantPhone: validateRequiredValue(
      draft.applicantPhone,
      'Укажите номер телефона преподавателя',
    ),
    applicantPosition: validateRequiredSelectValue(
      draft.applicantPosition,
      'Выберите должность преподавателя',
      EMPLOYEE_SESSION_CONTEXT_POSITION_OPTIONS,
    ),
    applicantWorkplace: validateRequiredWorkplaceValue(
      draft.applicantWorkplace,
      'Выберите место работы преподавателя',
    ),
  }
}

function getEmptyErrors(): SessionContextFieldErrors {
  return {
    applicantEmail: null,
    applicantName: null,
    applicantPhone: null,
    applicantPosition: null,
    applicantWorkplace: null,
  }
}

function validateApplicantEmail(value: string) {
  if (!value.trim()) {
    return 'Укажите корпоративную почту преподавателя'
  }

  return validateEmployeeEmail(value.trim())
}

function validateRequiredValue(value: string, errorMessage: string) {
  if (!value.trim()) {
    return errorMessage
  }

  return null
}

function validateRequiredSelectValue(
  value: string,
  requiredMessage: string,
  options: readonly string[],
) {
  if (!value.trim()) {
    return requiredMessage
  }

  if (!options.includes(value.trim())) {
    return 'Выберите значение из списка'
  }

  return null
}

function validateRequiredWorkplaceValue(value: string, requiredMessage: string) {
  if (!value.trim()) {
    return requiredMessage
  }

  return null
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Не удалось обновить контекст сессии'
}

function shouldUseCustomWorkplaceInput(value: string) {
  const normalizedValue = value.trim()

  return normalizedValue !== '' && !isKnownEmployeeWorkplace(normalizedValue)
}
