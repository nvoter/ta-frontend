import { useId, type ReactNode } from 'react'
import {
  EMPLOYEE_OTHER_WORKPLACE_OPTION,
  EMPLOYEE_SESSION_CONTEXT_POSITION_OPTIONS,
  EMPLOYEE_WORKPLACE_OPTIONS,
} from '../hooks/useEmployeePersonalDataForm'
import { useEmployeeSessionContextForm } from '../hooks/useEmployeeSessionContextForm'
import { LoadingIndicator } from './LoadingIndicator'

interface EmployeeSessionContextFormProps {
  embedded?: boolean
  onClose?: () => void
  onSubmitted?: () => void
}

export function EmployeeSessionContextForm({
  embedded = false,
  onClose,
  onSubmitted,
}: EmployeeSessionContextFormProps) {
  const applicantNameId = useId()
  const applicantEmailId = useId()
  const applicantPhoneId = useId()
  const applicantPositionId = useId()
  const applicantWorkplaceId = useId()
  const {
    applicantEmail,
    applicantEmailError,
    applicantName,
    applicantNameError,
    applicantPhone,
    applicantPhoneError,
    applicantPosition,
    applicantPositionError,
    applicantWorkplace,
    applicantWorkplaceError,
    handleChange,
    handleModeChange,
    handleSubmit,
    isCustomWorkplace,
    isDelegateMode,
    isLoadingInitialState,
    isSelfMode,
    isSubmitting,
    resetWorkplaceToSelect,
    submitError,
  } = useEmployeeSessionContextForm({ onClose, onSubmitted })

  const content = (
    <>
      <div className="auth-card__header">
        <p className="auth-card__description">
          Выберите, от чьего имени будут формироваться заявки в текущей сессии
        </p>
      </div>

      <form className="auth-form session-context-dialog__form" onSubmit={handleSubmit} noValidate>
        {isLoadingInitialState ? (
          <div className="auth-form__notice auth-form__notice--compact">
            <p>Загружаем текущий контекст сессии...</p>
          </div>
        ) : null}

        <div className="session-context-toggle" role="group" aria-label="Режим контекста сессии">
          <button
            className={[
              'session-context-toggle__option',
              isSelfMode ? 'session-context-toggle__option--active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            type="button"
            onClick={() => handleModeChange('self')}
            aria-pressed={isSelfMode}
            disabled={isLoadingInitialState || isSubmitting}
          >
            Заявка от своего лица
          </button>
          <button
            className={[
              'session-context-toggle__option',
              isDelegateMode ? 'session-context-toggle__option--active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            type="button"
            onClick={() => handleModeChange('delegate')}
            aria-pressed={isDelegateMode}
            disabled={isLoadingInitialState || isSubmitting}
          >
            Заявка за другого преподавателя
          </button>
        </div>

        {isDelegateMode ? (
          <div className="session-context-dialog__grid">
            <FieldBlock error={applicantNameError}>
              <label className="auth-form__label" htmlFor={applicantNameId}>
                ФИО преподавателя
              </label>
              <input
                id={applicantNameId}
                className={[
                  'auth-form__input',
                  applicantNameError ? 'auth-form__input--error' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                name="applicantName"
                type="text"
                placeholder="Иванов Иван Иванович"
                value={applicantName}
                onChange={handleChange}
                aria-invalid={Boolean(applicantNameError)}
                disabled={isLoadingInitialState || isSubmitting}
              />
            </FieldBlock>

            <FieldBlock error={applicantEmailError}>
              <label className="auth-form__label" htmlFor={applicantEmailId}>
                Корпоративная почта преподавателя
              </label>
              <input
                id={applicantEmailId}
                className={[
                  'auth-form__input',
                  applicantEmailError ? 'auth-form__input--error' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                name="applicantEmail"
                type="email"
                inputMode="email"
                placeholder="name@hse.ru"
                value={applicantEmail}
                onChange={handleChange}
                aria-invalid={Boolean(applicantEmailError)}
                disabled={isLoadingInitialState || isSubmitting}
              />
            </FieldBlock>

            <FieldBlock error={applicantPhoneError}>
              <label className="auth-form__label" htmlFor={applicantPhoneId}>
                Номер телефона преподавателя
              </label>
              <input
                id={applicantPhoneId}
                className={[
                  'auth-form__input',
                  applicantPhoneError ? 'auth-form__input--error' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                name="applicantPhone"
                type="tel"
                placeholder="+7 999 999-99-99"
                value={applicantPhone}
                onChange={handleChange}
                aria-invalid={Boolean(applicantPhoneError)}
                disabled={isLoadingInitialState || isSubmitting}
              />
            </FieldBlock>

            <FieldBlock error={applicantWorkplaceError}>
              <label className="auth-form__label" htmlFor={applicantWorkplaceId}>
                Место работы преподавателя
              </label>
              {isCustomWorkplace ? (
                <>
                  <input
                    id={applicantWorkplaceId}
                    className={[
                      'auth-form__input',
                      applicantWorkplaceError ? 'auth-form__input--error' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    name="applicantWorkplace"
                    type="text"
                    placeholder="Введите место работы"
                    value={applicantWorkplace}
                    onChange={handleChange}
                    aria-invalid={Boolean(applicantWorkplaceError)}
                    disabled={isLoadingInitialState || isSubmitting}
                  />
                  <div className="auth-form__meta">
                    <button
                      className="auth-form__text-button"
                      type="button"
                      onClick={resetWorkplaceToSelect}
                      disabled={isLoadingInitialState || isSubmitting}
                    >
                      Выбрать из списка
                    </button>
                  </div>
                </>
              ) : (
                <select
                  id={applicantWorkplaceId}
                  className={[
                    'auth-form__input',
                    applicantWorkplaceError ? 'auth-form__input--error' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  name="applicantWorkplace"
                  value={applicantWorkplace}
                  onChange={handleChange}
                  aria-invalid={Boolean(applicantWorkplaceError)}
                  disabled={isLoadingInitialState || isSubmitting}
                >
                  <option value="">Выберите место работы</option>
                  {EMPLOYEE_WORKPLACE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                  <option value={EMPLOYEE_OTHER_WORKPLACE_OPTION}>
                    {EMPLOYEE_OTHER_WORKPLACE_OPTION}
                  </option>
                </select>
              )}
            </FieldBlock>

            <FieldBlock error={applicantPositionError}>
              <label className="auth-form__label" htmlFor={applicantPositionId}>
                Должность преподавателя
              </label>
              <select
                id={applicantPositionId}
                className={[
                  'auth-form__input',
                  applicantPositionError ? 'auth-form__input--error' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                name="applicantPosition"
                value={applicantPosition}
                onChange={handleChange}
                aria-invalid={Boolean(applicantPositionError)}
                disabled={isLoadingInitialState || isSubmitting}
              >
                <option value="">Выберите должность</option>
                {EMPLOYEE_SESSION_CONTEXT_POSITION_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </FieldBlock>
          </div>
        ) : (
          <div className="auth-form__notice auth-form__notice--compact">
            <p>Заявка будет оформляться от вашего имени</p>
          </div>
        )}

        {submitError ? (
          <div className="auth-form__error-box" role="alert">
            <p className="auth-form__error">{submitError}</p>
          </div>
        ) : null}

        <div className="auth-form__actions auth-form__actions--inline session-context-dialog__actions">
          {onClose ? (
            <button
              className="auth-form__button auth-form__button--secondary"
              type="button"
              onClick={onClose}
              disabled={isLoadingInitialState || isSubmitting}
            >
              Отмена
            </button>
          ) : null}
          <button
            className="auth-form__button"
            type="submit"
            disabled={isLoadingInitialState || isSubmitting}
          >
            {isSubmitting ? <LoadingIndicator /> : 'Сохранить'}
          </button>
        </div>
      </form>
    </>
  )

  if (embedded) {
    return (
      <div className="session-context-dialog" aria-labelledby="employee-session-context-title">
        {content}
      </div>
    )
  }

  return (
    <section className="auth-card" aria-labelledby="employee-session-context-title">
      {content}
    </section>
  )
}

interface FieldBlockProps {
  children: ReactNode
  error: string | null
}

function FieldBlock({ children, error }: FieldBlockProps) {
  return (
    <div className="auth-form__field">
      {children}
      {error ? (
        <div className="auth-form__error-box" role="alert">
          <p className="auth-form__error">{error}</p>
        </div>
      ) : null}
    </div>
  )
}
