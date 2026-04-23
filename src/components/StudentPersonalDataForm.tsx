import { useState } from 'react'
import {
  isStudentSelectOtherValue,
  useStudentPersonalDataForm,
} from '../hooks/useStudentPersonalDataForm'
import { LoadingIndicator } from './LoadingIndicator'

interface StudentPersonalDataFormProps {
  embedded?: boolean
  onSaved?: () => void
}

export function StudentPersonalDataForm({
  embedded = false,
  onSaved,
}: StudentPersonalDataFormProps) {
  const {
    errors,
    citizenshipOptions,
    educationLevelOptions,
    facultyOptions,
    handleInputChange,
    handleSubmit,
    isLoading,
    isSaving,
    lockedFields,
    submitError,
    values,
  } = useStudentPersonalDataForm({ embedded, onSaved })

  const content = (
    <>
      {!embedded ? (
        <>
          <div className="auth-card__header">
            <p className="eyebrow">Учебные ассистенты ФКН</p>
            <h2 id="student-personal-data-title">Персональные данные студента</h2>
          </div>

          <div className="auth-form__notice">
            <p>
              <b>Уважаемые студенты ФКН!</b><br /> Ваши ФИО, образовательная программа, год
              обучения и гражданство <b>должны определяться автоматически</b> по Вашей
              учебной электронной почте. Если указанные данные не заполнены или
              заполнены некорректно, то просьба сообщить об этом на почту
              {' '}
              <a href="mailto:obkom@cs.hse.ru">obkom@cs.hse.ru</a>
              {' '}
              и отложить заполнение формы до устранения данной проблемы
            </p>
          </div>
        </>
      ) : null}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {isLoading ? (
          <div className="auth-form__notice auth-form__notice--compact">
            <p>Загружаем данные студента...</p>
          </div>
        ) : null}

        <div className="profile-form__grid">
          <FormField
            error={errors.email}
            label="Корпоративная электронная почта"
            name="email"
            onChange={handleInputChange}
            placeholder="name@edu.hse.ru"
            readOnly={lockedFields.email}
            required
            type="email"
            value={values.email}
          />
          <FormField
            error={errors.fullName}
            label="ФИО"
            name="fullName"
            onChange={handleInputChange}
            placeholder="Иванов Иван Иванович"
            readOnly={lockedFields.fullName}
            required
            value={values.fullName}
          />
          <SelectWithOtherField
            allowOther={false}
            error={errors.educationLevel}
            label="Уровень образования"
            name="educationLevel"
            options={educationLevelOptions}
            readOnly={lockedFields.educationLevel}
            required
            value={values.educationLevel}
            onChange={handleInputChange}
          />
          <SelectWithOtherField
            allowOther
            error={errors.faculty}
            label="Факультет"
            name="faculty"
            disabled={!values.educationLevel}
            readOnly={lockedFields.faculty}
            required
            value={values.faculty}
            options={facultyOptions}
            onChange={handleInputChange}
          />
          <FormField
            error={errors.educationalProgram}
            label="Образовательная программа"
            name="educationalProgram"
            onChange={handleInputChange}
            placeholder="Программная инженерия"
            readOnly={lockedFields.educationalProgram}
            required={values.educationLevel !== 'Аспирантура'}
            value={values.educationalProgram}
          />
          <FormField
            error={errors.yearOfStudy}
            label="Год обучения"
            name="yearOfStudy"
            onChange={handleInputChange}
            placeholder="3"
            readOnly={lockedFields.yearOfStudy}
            required
            value={values.yearOfStudy}
          />
          <SelectWithOtherField
            allowOther
            error={errors.citizenship}
            label="Гражданство"
            name="citizenship"
            readOnly={lockedFields.citizenship}
            required
            value={values.citizenship}
            options={citizenshipOptions}
            onChange={handleInputChange}
          />
          <FormField
            error={errors.dateOfBirth}
            label="Дата рождения"
            name="dateOfBirth"
            onChange={handleInputChange}
            required
            type="date"
            value={values.dateOfBirth}
          />
          <div className="auth-form__field auth-form__field--phone-row">
            <label className="auth-form__label" htmlFor="student-phone">
              {renderFieldLabel('Номер телефона', true)}
            </label>
            <input
              id="student-phone"
              className={[
                'auth-form__input',
                errors.phone ? 'auth-form__input--error' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              name="phone"
              type="tel"
              placeholder="+7 999 999-99-99"
              value={values.phone}
              onChange={handleInputChange}
            />
            <div className="auth-form__meta auth-form__meta--phone-row">
              <p className="auth-form__hint">
                На указанный номер телефона у Вас должен быть зарегистрирован
                аккаунт на госуслугах и выпущена УНЭП (электронная подпись для
                подписания договора)
              </p>
              {errors.phone ? (
                <div className="auth-form__error-box" role="alert">
                  <p className="auth-form__error">{errors.phone}</p>
                </div>
              ) : null}
            </div>
          </div>
          <FormField
            error={errors.telegram}
            fieldClassName="auth-form__field--phone-row"
            label="Telegram-аккаунт"
            metaClassName="auth-form__meta--phone-row"
            name="telegram"
            onChange={handleInputChange}
            placeholder="@username"
            required
            value={values.telegram}
          />
        </div>

        <div className="profile-form__checkboxes">
          <CheckboxField
            checked={values.hasPrimaryPhone}
            error={errors.hasPrimaryPhone}
            label="Подтверждаю, что указанный номер является основным"
            name="hasPrimaryPhone"
            onChange={handleInputChange}
            required
          />
          <CheckboxField
            checked={values.hasConfirmedPublicServicesAccount}
            error={errors.hasConfirmedPublicServicesAccount}
            label="Имею подтвержденный аккаунт на госуслугах"
            name="hasConfirmedPublicServicesAccount"
            onChange={handleInputChange}
            required
          />
          <CheckboxField
            checked={values.receivesSocialPension}
            label="Получаю социальную пенсию"
            name="receivesSocialPension"
            onChange={handleInputChange}
          />
          {values.receivesSocialPension ? (
            <div className="auth-form__notice auth-form__notice--compact">
              <p>
                При подаче заявок на трудоустройство на платной основе,
                учитывайте, что работа по договору гражданско-правового
                характера (ГПХ) не влияет на право получения пенсии, однако
                страховая пенсия на период работы выплачивается без индексации,
                а федеральная социальная доплата не выплачивается, за
                исключением предусмотренных законом случаев
              </p>
            </div>
          ) : null}
          <CheckboxField
            checked={values.agreeToDataProcessing}
            className="checkbox-field--emphasis"
            error={errors.agreeToDataProcessing}
            label={
              <>
                Я подтверждаю, что лично ознакомился с{' '}
                <a
                  className="application-form__link"
                  href="https://www.hse.ru/data_protection_regulation"
                  rel="noreferrer"
                  target="_blank"
                >
                  Положением об обработке персональных данных НИУ ВШЭ
                </a>
                , вправе предоставлять свои персональные данные и давать
                согласие на их обработку
              </>
            }
            name="agreeToDataProcessing"
            onChange={handleInputChange}
            required
          />
        </div>

        {submitError ? (
          <div className="auth-form__error-box" role="alert">
            <p className="auth-form__error">{submitError}</p>
          </div>
        ) : null}

        <div className="auth-form__actions">
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
      aria-labelledby="student-personal-data-title"
    >
      {content}
    </section>
  )
}

interface FormFieldProps {
  error?: string
  fieldClassName?: string
  label: string
  metaClassName?: string
  name: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  readOnly?: boolean
  required?: boolean
  type?: string
  value: string
}

interface SelectWithOtherFieldProps {
  allowOther?: boolean
  error?: string
  label: string
  name: 'educationLevel' | 'faculty' | 'citizenship'
  disabled?: boolean
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void
  options: readonly string[]
  readOnly?: boolean
  required?: boolean
  value: string
}

function FormField({
  error,
  fieldClassName,
  label,
  metaClassName,
  name,
  onChange,
  placeholder,
  readOnly,
  required,
  type = 'text',
  value,
}: FormFieldProps) {
  const inputId = `student-personal-data-${name}`

  return (
    <div
      className={['auth-form__field', fieldClassName].filter(Boolean).join(' ')}
    >
      <label className="auth-form__label" htmlFor={inputId}>
        {renderFieldLabel(label, required)}
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
      <div className={['auth-form__meta', metaClassName].filter(Boolean).join(' ')}>
        {error ? (
          <div className="auth-form__error-box" role="alert">
            <p className="auth-form__error">{error}</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function SelectWithOtherField({
  allowOther = true,
  disabled,
  error,
  label,
  name,
  onChange,
  options,
  readOnly,
  required,
  value,
}: SelectWithOtherFieldProps) {
  const [isManualMode, setIsManualMode] = useState(
    allowOther && isStudentSelectOtherValue(options, value),
  )
  const inputId = `student-personal-data-${name}`
  const shouldShowManualMode =
    allowOther && (isManualMode || isStudentSelectOtherValue(options, value))

  const handlePickerChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (event.target.value === '__other__') {
      setIsManualMode(true)
      onChange({
        target: {
          name,
          value: '',
        },
      } as React.ChangeEvent<HTMLInputElement>)
      return
    }

    setIsManualMode(false)
    onChange(event)
  }

  return (
    <div className="auth-form__field">
      <label className="auth-form__label" htmlFor={inputId}>
        {renderFieldLabel(label, required)}
      </label>
      {shouldShowManualMode ? (
        <>
          <input
            id={inputId}
            className={[
              'auth-form__input',
              error ? 'auth-form__input--error' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            name={name}
            type="text"
            placeholder="Введите значение"
            readOnly={readOnly || disabled}
            value={value}
            onChange={onChange}
          />
          {!readOnly && !disabled ? (
            <button
              className="auth-form__field-switch"
              type="button"
              onClick={() => {
                setIsManualMode(false)
                onChange({
                  target: {
                    name,
                    value: '',
                  },
                } as React.ChangeEvent<HTMLInputElement>)
              }}
            >
              Вернуться к списку
            </button>
          ) : null}
        </>
      ) : (
        <select
          id={inputId}
          className={[
            'auth-form__input',
            error ? 'auth-form__input--error' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-disabled={disabled}
          disabled={readOnly || disabled}
          name={name}
          value={value}
          onChange={handlePickerChange}
        >
          <option value="">Выберите значение</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
          {allowOther ? <option value="__other__">Другое</option> : null}
        </select>
      )}

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

interface CheckboxFieldProps {
  checked: boolean
  className?: string
  error?: string
  label: React.ReactNode
  name: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
}

function CheckboxField({
  checked,
  className,
  error,
  label,
  name,
  onChange,
  required,
}: CheckboxFieldProps) {
  const inputId = `student-personal-data-${name}`

  return (
    <div className={['checkbox-field', className].filter(Boolean).join(' ')}>
      <label className="checkbox-field__label" htmlFor={inputId}>
        <input
          id={inputId}
          className="checkbox-field__input"
          name={name}
          type="checkbox"
          checked={checked}
          onChange={onChange}
        />
        <span className="checkbox-field__box" aria-hidden="true" />
        <span className="checkbox-field__text">
          {renderNodeLabel(label, required)}
        </span>
      </label>
      {error ? (
        <div className="auth-form__error-box" role="alert">
          <p className="auth-form__error">{error}</p>
        </div>
      ) : null}
    </div>
  )
}

function renderFieldLabel(label: string, required?: boolean) {
  return (
    <>
      {label}
      {required ? <span className="form-required-mark" aria-hidden="true"> *</span> : null}
    </>
  )
}

function renderNodeLabel(label: React.ReactNode, required?: boolean) {
  return (
    <>
      {required ? <span className="form-required-mark" aria-hidden="true">* </span> : null}
      {label}
    </>
  )
}
