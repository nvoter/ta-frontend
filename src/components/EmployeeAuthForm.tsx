import { useId } from 'react'
import { useEmployeeAuthForm } from '../hooks/useEmployeeAuthForm'
import { LoadingIndicator } from './LoadingIndicator'

export function EmployeeAuthForm() {
  const emailId = useId()
  const emailErrorId = useId()
  const passwordId = useId()
  const passwordErrorId = useId()
  const {
    email,
    emailError,
    handleBlur,
    handleChange,
    handleSubmit,
    isSubmitting,
    password,
    passwordError,
    submitError,
  } = useEmployeeAuthForm()

  return (
    <section className="auth-card" aria-labelledby="employee-auth-title">
      <div className="auth-card__header">
        <p className="eyebrow">Учебные ассистенты ФКН</p>
        <h2 id="employee-auth-title">Вход для сотрудника</h2>
        <p className="auth-card__description">
          Введите данные для входа в личный кабинет сотрудника
        </p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-form__field">
          <label className="auth-form__label" htmlFor={emailId}>
            Корпоративная электронная почта
          </label>
          <input
            id={emailId}
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
            placeholder="name@hse.ru"
            value={email}
            onBlur={handleBlur}
            onChange={handleChange}
            aria-invalid={Boolean(emailError)}
            aria-describedby={emailError ? emailErrorId : undefined}
          />
          {emailError ? (
            <div
              id={emailErrorId}
              className="auth-form__error-box"
              role="alert"
            >
              <p className="auth-form__error">{emailError}</p>
            </div>
          ) : null}
        </div>

        <div className="auth-form__field">
          <label className="auth-form__label" htmlFor={passwordId}>
            Общий пароль
          </label>
          <input
            id={passwordId}
            className={[
              'auth-form__input',
              passwordError ? 'auth-form__input--error' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Введите пароль"
            value={password}
            onBlur={handleBlur}
            onChange={handleChange}
            aria-invalid={Boolean(passwordError)}
            aria-describedby={passwordError ? passwordErrorId : undefined}
          />
          {passwordError ? (
            <div
              id={passwordErrorId}
              className="auth-form__error-box"
              role="alert"
            >
              <p className="auth-form__error">{passwordError}</p>
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
