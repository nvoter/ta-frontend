import { useState } from 'react'
import { confirmAuthCode, resendConfirmationCode } from '../api/authApi'
import { appRoutes } from '../routes/appRoutes'
import { getAuthFlow } from '../utils/authFlowStorage'
import { navigateTo } from '../utils/navigation'
import { validateConfirmationCode } from '../utils/validateConfirmationCode'

export function useAuthCodeForm() {
  const [code, setCode] = useState('')
  const [isTouched, setIsTouched] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [caretIndex, setCaretIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const authFlow = getAuthFlow()

  const codeError =
    isTouched || code.length > 0 ? validateConfirmationCode(code) : null

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value.replace(/\D/g, '').slice(0, 6)
    setCode(nextValue)
    setCaretIndex(Math.min(event.target.selectionStart ?? nextValue.length, 6))
    setIsTouched(true)
    setSubmitError('')
  }

  const handleBlur = () => {
    setIsFocused(false)
    setIsTouched(true)
  }

  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleSelect = (event: React.SyntheticEvent<HTMLInputElement>) => {
    setCaretIndex(
      Math.min(event.currentTarget.selectionStart ?? code.length, 6),
    )
  }

  const handleSlotFocus = (index: number) => {
    setCaretIndex(index)
    setIsFocused(true)
  }

  const handleResend = async () => {
    if (!authFlow) {
      setSubmitError('Данные для подтверждения не найдены. Начните вход заново.')
      return
    }

    try {
      setIsResending(true)
      setSubmitError('')
      await resendConfirmationCode(authFlow)
    } catch (error) {
      setSubmitError(getErrorMessage(error))
    } finally {
      setIsResending(false)
    }
  }

  const handleBack = () => {
    navigateTo(authFlow?.previousPath ?? appRoutes.studentAuth)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsTouched(true)

    const nextError = validateConfirmationCode(code)

    if (nextError) {
      return
    }

    if (!authFlow) {
      setSubmitError('Данные для подтверждения не найдены. Начните вход заново.')
      return
    }

    try {
      setIsSubmitting(true)
      setSubmitError('')
      const session = await confirmAuthCode(code, authFlow)

      if (session.principalType === 'STUDENT') {
        navigateTo(
          session.requiresProfileCompletion
            ? appRoutes.studentPersonalData
            : appRoutes.studentDashboard,
        )
        return
      }

      if (session.requiresProfileCompletion) {
        navigateTo(appRoutes.employeePersonalData)
        return
      }

      if (session.userRole === 'ADMIN') {
        navigateTo(appRoutes.employeeStudentApplications)
        return
      }

      navigateTo(appRoutes.employeeStudentApplications)
    } catch (error) {
      setSubmitError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    caretIndex,
    code,
    codeError,
    deliveryEmail: authFlow?.email ?? 'корпоративную электронную почту',
    handleBack,
    handleBlur,
    handleChange,
    handleFocus,
    handleResend,
    handleSelect,
    handleSlotFocus,
    handleSubmit,
    isFocused,
    isResending,
    isSubmitting,
    submitError,
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Не удалось подтвердить код'
}
