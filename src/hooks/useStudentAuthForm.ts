import { useState } from 'react'
import { requestStudentConfirmationCode } from '../api/authApi'
import { appRoutes } from '../routes/appRoutes'
import type { StudentEmail } from '../types/auth'
import {
  getStudentAuthDraft,
  saveStudentAuthDraft,
} from '../utils/authDraftStorage'
import { saveAuthFlow } from '../utils/authFlowStorage'
import { navigateTo } from '../utils/navigation'
import { validateStudentEmail } from '../utils/validateStudentEmail'

export function useStudentAuthForm() {
  const [email, setEmail] = useState(() => getStudentAuthDraft().email)
  const [isTouched, setIsTouched] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const emailError =
    isTouched || email.length > 0 ? validateStudentEmail(email) : null

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextEmail = event.target.value.trim()
    setEmail(nextEmail)
    saveStudentAuthDraft({ email: nextEmail })
    setIsTouched(true)
    setSubmitError('')
  }

  const handleBlur = () => {
    setIsTouched(true)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsTouched(true)

    const nextError = validateStudentEmail(email)

    if (nextError) {
      return
    }

    try {
      setIsSubmitting(true)
      setSubmitError('')
      await requestStudentConfirmationCode(email as StudentEmail)
      saveAuthFlow({
        email,
        previousPath: appRoutes.studentAuth,
        principalType: 'STUDENT',
      })
      navigateTo(appRoutes.authCode)
    } catch (error) {
      setSubmitError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    email,
    emailError,
    handleBlur,
    handleChange,
    handleSubmit,
    isSubmitting,
    submitError,
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Не удалось отправить код подтверждения'
}
