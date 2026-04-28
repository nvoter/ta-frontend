import {
  EMPLOYEE_OTHER_WORKPLACE_OPTION,
  EMPLOYEE_POSITION_OPTIONS,
  EMPLOYEE_WORKPLACE_OPTIONS,
  useEmployeePersonalDataForm,
} from '../hooks/useEmployeePersonalDataForm'
import { LoadingIndicator } from './LoadingIndicator'

interface EmployeePersonalDataFormProps {
  embedded?: boolean
  onCancel?: () => void
  onSaved?: () => void
}

export function EmployeePersonalDataForm({
  embedded = false,
  onCancel,
  onSaved,
}: EmployeePersonalDataFormProps) {
  const {
    email,
    errors,
    handleCancel,
    handleInputChange,
    handleSubmit,
    isCustomWorkplace,
    isLoading,
    isSaving,
    resetWorkplaceToSelect,
    submitError,
    values,
  } = useEmployeePersonalDataForm({ embedded, onCancel, onSaved })

  const content = (
    <>
      {!embedded ? (
        <div className="auth-card__header">
          <p className="eyebrow">Учебные ассистенты ФКН</p>
          <h2 id="employee-personal-data-title">Персональные данные сотрудника</h2>
        </div>
      ) : null}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {isLoading ? (
          <div className="auth-form__notice auth-form__notice--compact">
            <p>Загружаем данные сотрудника...</p>
          </div>
        ) : null}

        <div className="profile-form__grid">
          <InputField
            label="Корпоративная электронная почта"
            name="email"
            readOnly
            type="email"
            value={email}
          />
          <InputField
            error={errors.fullName}
            label="ФИО"
            name="fullName"
            onChange={handleInputChange}
            placeholder="Иванов Иван Иванович"
            value={values.fullName}
          />
          {isCustomWorkplace ? (
            <InputField
              error={errors.workplace}
              label="Место работы"
              name="workplace"
              onChange={handleInputChange}
              placeholder="Введите место работы"
              onReset={resetWorkplaceToSelect}
              resetLabel="Выбрать из списка"
              value={values.workplace}
            />
          ) : (
            <SelectField
              error={errors.workplace}
              label="Место работы"
              name="workplace"
              onChange={handleInputChange}
              options={EMPLOYEE_WORKPLACE_OPTIONS}
              placeholder="Выберите место работы"
              trailingOption={EMPLOYEE_OTHER_WORKPLACE_OPTION}
              value={values.workplace}
            />
          )}
          <SelectField
            error={errors.position}
            label="Должность"
            name="position"
            onChange={handleInputChange}
            options={EMPLOYEE_POSITION_OPTIONS}
            placeholder="Выберите должность"
            value={values.position}
          />
          <InputField
            error={errors.phone}
            label="Номер телефона"
            name="phone"
            onChange={handleInputChange}
            placeholder="+7 999 999-99-99"
            type="tel"
            value={values.phone}
          />
        </div>

        {submitError ? (
          <div className="auth-form__error-box" role="alert">
            <p className="auth-form__error">{submitError}</p>
          </div>
        ) : null}

        <div className={embedded ? 'auth-form__actions auth-form__actions--inline' : 'auth-form__actions'}>
          {embedded && onCancel ? (
            <button
              className="auth-form__button auth-form__button--secondary"
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Отмена
            </button>
          ) : null}
          <button className="auth-form__button" type="submit" disabled={isSaving}>
            {isSaving ? <LoadingIndicator /> : 'Сохранить'}
          </button>
        </div>
      </form>
    </>
  )

  if (embedded) {
    return <div className="settings-profile-panel">{content}</div>
  }

  return (
    <section
      className="auth-card auth-card--wide"
      aria-labelledby="employee-personal-data-title"
    >
      {content}
    </section>
  )
}

interface BaseFieldProps {
  error?: string
  label: string
  name: string
  value: string
}

interface InputFieldProps extends BaseFieldProps {
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  onReset?: () => void
  placeholder?: string
  readOnly?: boolean
  resetLabel?: string
  type?: string
}

function InputField({
  error,
  label,
  name,
  onChange,
  onReset,
  placeholder,
  readOnly,
  resetLabel,
  type = 'text',
  value,
}: InputFieldProps) {
  const inputId = `employee-personal-data-${name}`

  return (
    <div className="auth-form__field">
      <label className="auth-form__label" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        className={[
          'auth-form__input',
          error ? 'auth-form__input--error' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        name={name}
        type={type}
        placeholder={placeholder}
        readOnly={readOnly}
        value={value}
        onChange={onChange}
      />
      <div className="auth-form__meta">
        {onReset && resetLabel ? (
          <button className="auth-form__text-button" type="button" onClick={onReset}>
            {resetLabel}
          </button>
        ) : null}
        {error ? (
          <div className="auth-form__error-box" role="alert">
            <p className="auth-form__error">{error}</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

interface SelectFieldProps extends BaseFieldProps {
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
  options: readonly string[]
  placeholder: string
  trailingOption?: string
}

function SelectField({
  error,
  label,
  name,
  onChange,
  options,
  placeholder,
  trailingOption,
  value,
}: SelectFieldProps) {
  const inputId = `employee-personal-data-${name}`

  return (
    <div className="auth-form__field">
      <label className="auth-form__label" htmlFor={inputId}>
        {label}
      </label>
      <select
        id={inputId}
        className={[
          'auth-form__input',
          error ? 'auth-form__input--error' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        name={name}
        value={value}
        onChange={onChange}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
        {trailingOption ? (
          <option value={trailingOption}>{trailingOption}</option>
        ) : null}
      </select>
      <div className="auth-form__meta">
        {error ? (
          <div className="auth-form__error-box" role="alert">
            <p className="auth-form__error">{error}</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
