import { useState } from 'react'
import { requestEmployeeConfirmationCode } from '../api/authApi'
import { appRoutes } from '../routes/appRoutes'
import type { EmployeeEmail } from '../types/auth'
import {
  getEmployeeAuthDraft,
  saveEmployeeAuthDraft,
} from '../utils/authDraftStorage'
import { saveAuthFlow } from '../utils/authFlowStorage'
import { navigateTo } from '../utils/navigation'
import { validateEmployeeEmail } from '../utils/validateEmployeeEmail'

export function useEmployeeAuthForm() {
  const [draft, setDraft] = useState(() => getEmployeeAuthDraft())
  const [isTouched, setIsTouched] = useState({
    email: false,
    password: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const { email, password } = draft

  const emailError =
    isTouched.email || email.length > 0 ? validateEmployeeEmail(email) : null
  const passwordError =
    isTouched.password || password.length > 0
      ? validatePassword(password)
      : null

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    const nextDraft = {
      ...draft,
      [name]: name === 'email' ? value.trim() : value,
    }

    setDraft(nextDraft)
    saveEmployeeAuthDraft(nextDraft)
    setSubmitError('')

    setIsTouched((currentState) => ({
      ...currentState,
      [name]: true,
    }))
  }

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const { name } = event.target

    setIsTouched((currentState) => ({
      ...currentState,
      [name]: true,
    }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setIsTouched({
      email: true,
      password: true,
    })

    const nextEmailError = validateEmployeeEmail(email)
    const nextPasswordError = validatePassword(password)

    if (nextEmailError || nextPasswordError) {
      return
    }

    try {
      setIsSubmitting(true)
      setSubmitError('')
      await requestEmployeeConfirmationCode({
        email: email as EmployeeEmail,
        password,
        role: 'TEACHER',
      })
      saveAuthFlow({
        email,
        employeeRequest: {
          email,
          password,
          role: 'TEACHER',
        },
        previousPath: appRoutes.employeeAuth,
        principalType: 'EMPLOYEE',
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
    password,
    passwordError,
    submitError,
  }
}

function validatePassword(password: string) {
  if (!password) {
    return 'Введите выданный пароль'
  }

  return null
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Не удалось отправить код подтверждения'
}
