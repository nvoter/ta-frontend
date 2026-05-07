import { useId } from 'react'
import { useStudentAuthForm } from '../hooks/useStudentAuthForm'
import { LoadingIndicator } from './LoadingIndicator'

export function StudentAuthForm() {
  const inputId = useId()
  const errorId = useId()
  const {
    email,
    emailError,
    handleBlur,
    handleChange,
    handleSubmit,
    isSubmitting,
    submitError,
  } = useStudentAuthForm()

  return (
    <section className="auth-card" aria-labelledby="student-auth-title">
      <div className="auth-card__header">
        <p className="eyebrow">Учебные ассистенты ФКН</p>
        <h2 id="student-auth-title">Вход для студентов и аспирантов</h2>
        <p className="auth-card__description">
          Введите корпоративную электронную почту для входа в личный кабинет учебного ассистента: @edu.hse.ru (студенты) или @hse.ru (аспиранты)
        </p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-form__field">
          <label className="auth-form__label" htmlFor={inputId}>
            Электронная почта
          </label>
          <input
            id={inputId}
            className={[
              'auth-form__input',
              emailError ? 'auth-form__input--error' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="name@edu.hse.ru или name@hse.ru"
            value={email}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={Boolean(emailError)}
            aria-describedby={emailError ? errorId : undefined}
          />
          {emailError ? (
            <div id={errorId} className="auth-form__error-box" role="alert">
              <p className="auth-form__error">{emailError}</p>
            </div>
          ) : null}
        </div>

        {submitError ? (
          <div className="auth-form__error-box" role="alert">
            <p className="auth-form__error">{submitError}</p>
          </div>
        ) : null}

        <div className="auth-form__actions">
          <button className="auth-form__button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? <LoadingIndicator /> : 'Далее'}
          </button>
          <p className="auth-form__footnote">
            На введенный адрес электронной почты придет код подтверждения
          </p>
        </div>
      </form>
    </section>
  )
}
