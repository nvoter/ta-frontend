import { useEffect, useId, useRef } from 'react'
import { useAuthCodeForm } from '../hooks/useAuthCodeForm'
import { LoadingIndicator } from './LoadingIndicator'

export function AuthCodeForm() {
  const inputId = useId()
  const errorId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const {
    caretIndex,
    code,
    codeError,
    deliveryEmail,
    handleBlur,
    handleBack,
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
  } = useAuthCodeForm()
  const codeDigits = Array.from({ length: 6 }, (_, index) => code[index] ?? '')
  const activeIndex = Math.min(caretIndex, codeDigits.length - 1)

  useEffect(() => {
    const input = inputRef.current

    if (!input || document.activeElement !== input) {
      return
    }

    input.setSelectionRange(caretIndex, caretIndex)
  }, [caretIndex, code])

  const focusSlot = (index: number) => {
    handleSlotFocus(index)
    inputRef.current?.focus()
    inputRef.current?.setSelectionRange(index, index)
  }

  return (
    <section className="auth-card" aria-labelledby="auth-code-title">
      <div className="auth-card__header">
        <p className="eyebrow">Учебные ассистенты ФКН</p>
        <h2 id="auth-code-title">Код подтверждения</h2>
        <p className="auth-card__description">
          Введите код подтверждения, отправленный на {deliveryEmail}
        </p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-form__field">
          <label className="auth-form__label" htmlFor={inputId}>
            Код подтверждения
          </label>
          <div
            className={[
              'auth-code-input',
              codeError ? 'auth-code-input--error' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {codeDigits.map((digit, index) => (
              <button
                key={index}
                className="auth-code-input__button"
                type="button"
                onClick={() => focusSlot(index)}
                aria-label={`Ввести цифру ${index + 1}`}
              >
                <span
                  className={[
                    'auth-code-input__slot',
                    digit ? 'auth-code-input__slot--filled' : '',
                    index === activeIndex ? 'auth-code-input__slot--active' : '',
                    isFocused && index === activeIndex
                      ? 'auth-code-input__slot--caret'
                      : '',
                    isFocused && index === activeIndex && digit
                      ? 'auth-code-input__slot--caret-after-digit'
                      : '',
                    isFocused &&
                    index === activeIndex &&
                    caretIndex === code.length &&
                    code.length === 6
                      ? 'auth-code-input__slot--caret-right'
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {digit || ''}
                </span>
              </button>
            ))}
            <input
              id={inputId}
              ref={inputRef}
                className={[
                  'auth-code-input__native',
                  codeError ? 'auth-code-input__native--error' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              name="code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              placeholder="000000"
              value={code}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onSelect={handleSelect}
              aria-invalid={Boolean(codeError)}
              aria-describedby={codeError ? errorId : undefined}
            />
          </div>
          {codeError ? (
            <div id={errorId} className="auth-form__error-box" role="alert">
              <p className="auth-form__error">{codeError}</p>
            </div>
          ) : null}
        </div>

        {submitError ? (
          <div className="auth-form__error-box" role="alert">
            <p className="auth-form__error">{submitError}</p>
          </div>
        ) : null}

        <div className="auth-form__actions auth-form__actions--inline">
          <button
            className="auth-form__button auth-form__button--secondary"
            type="button"
            onClick={handleBack}
          >
            Назад
          </button>
          <button className="auth-form__button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? <LoadingIndicator /> : 'Войти'}
          </button>
        </div>

        <p className="auth-form__footnote auth-form__footnote--centered">
          Не получили код?{' '}
          <button
            className="auth-form__text-button"
            type="button"
            onClick={handleResend}
            disabled={isResending}
          >
            {isResending ? <LoadingIndicator size={16} /> : 'Отправить снова'}
          </button>
        </p>
      </form>
    </section>
  )
}
