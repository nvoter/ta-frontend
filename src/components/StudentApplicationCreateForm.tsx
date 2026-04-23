import type { CSSProperties, ChangeEvent, ReactNode } from 'react'
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import { AppNavbar } from './AppNavbar'
import { FileUploadField } from './FileUploadField'
import { useStudentApplicationForm } from '../hooks/useStudentApplicationForm'
import type { DisciplineFormErrors, DisciplineFormItem } from '../types/studentApplicationForm'
import { logoutAndRedirect } from '../utils/logout'
import { appRoutes } from '../routes/appRoutes'
import { navigateTo } from '../utils/navigation'
import { LoadingIndicator } from './LoadingIndicator'

export function StudentApplicationCreateForm() {
  const {
    campaignError,
    clearSelectedFile,
    disciplineItems,
    errors,
    formState,
    getAvailableDisciplineOptions,
    getDisciplineCompletionRatio,
    getIsDisciplineTabEnabled,
    gradeOptions,
    handleFileChange,
    handleSubmit,
    isEditMode,
    isLoadingInitialData,
    isLoadingPrograms,
    isReadOnly,
    isSubmitting,
    loadedDisciplinesCount,
    programOptions,
    submitError,
    updateDisciplineItem,
    updateFormState,
    workTypeOptions,
  } = useStudentApplicationForm()
  const activeDiscipline = disciplineItems.find(
    (item) => item.id === formState.activeDisciplineTab,
  )

  return (
    <section className="dashboard-shell" aria-labelledby="student-application-create-title">
      <AppNavbar
        leadingAction={{
          icon: <ArrowBackIosNewRoundedIcon fontSize="inherit" />,
          label: 'Вернуться в личный кабинет',
          onClick: () => navigateTo(appRoutes.studentDashboard),
        }}
        tabs={[
          {
            isActive: false,
            label: 'Личный кабинет',
            onClick: () => navigateTo(appRoutes.studentDashboard),
          },
          ...(!isReadOnly
            ? [
                {
                  isActive: false,
                  label: 'Документы',
                  onClick: () => navigateTo(appRoutes.studentDocuments),
                },
              ]
            : []),
        ]}
        actions={[
          {
            icon: <NotificationsOutlinedIcon fontSize="inherit" />,
            label: 'Уведомления',
          },
          {
            icon: <SettingsOutlinedIcon fontSize="inherit" />,
            label: 'Настройки',
            onClick: () => navigateTo(appRoutes.studentSettings),
          },
          {
            icon: <LogoutOutlinedIcon fontSize="inherit" />,
            label: 'Выйти из аккаунта',
            onClick: () => {
              void logoutAndRedirect()
            },
          },
        ]}
      />

      <section className="dashboard-hero">
        <div className="dashboard-hero__copy">
          <h1 id="student-application-create-title">
            {isEditMode
              ? 'Редактирование заявки на работу учебным ассистентом'
              : 'Заявка на работу учебным ассистентом'}
          </h1>
          <p>{isEditMode ? 'Измените данные заявки' : 'Для подачи заявки заполните форму'}</p>
        </div>
      </section>

      <form className="application-form" onSubmit={handleSubmit} noValidate>
        {isLoadingInitialData ? (
          <div className="dashboard-empty-state">
            <h3>Загружаем заявку...</h3>
          </div>
        ) : null}

        {!isLoadingInitialData ? (
          <>
        {isReadOnly ? (
          <div className="auth-form__notice auth-form__notice--compact" role="note">
            <p>
              Сейчас нет активной кампании, поэтому форма доступна только в режиме
              просмотра
            </p>
          </div>
        ) : null}

        {campaignError ? (
          <div className="auth-form__error-box application-form__submit-error" role="alert">
            <p className="auth-form__error">{campaignError}</p>
          </div>
        ) : null}

        <fieldset className="application-form__fieldset" disabled={isReadOnly}>
        <div className="application-form__alert" role="note">
          <p>
            {'\u{1F4A1} '}Ознакомьтесь с{' '}
            <a
              href="https://cs.hse.ru/initiative/assistants?_r=38266081750850243.03456&__t=8373750&__r=OK"
              target="_blank"
              rel="noreferrer"
            >
              правилами реализации проекта "Учебный ассистент" на ФКН
            </a>{' '}
            и изучите перечень дисциплин, реализуемых на ФКН
          </p>
        </div>

        <section className="application-form__section" aria-labelledby="disciplines-title">
          <div className="application-form__section-header">
            <h2 id="disciplines-title" className="application-form__section-title">
              Дисциплины
            </h2>
            <p className="application-form__notice-text application-form__notice-text--full-width">
              Запись на дисциплины осуществляйте в порядке ваших приоритетов: под
              номером 1 - дисциплина, на которой вы наиболее заинтересованы работать в
              качестве учебного ассистента; под номером 2 и далее - дисциплины с
              меньшим приоритетом
            </p>
            {isLoadingPrograms ? (
              <p className="application-form__notice-text">
                Загружаем образовательные программы...
              </p>
            ) : null}
          </div>

          <div className="discipline-tabs" role="tablist" aria-label="Приоритеты дисциплин">
            {disciplineItems.map((item) => (
              <button
                key={item.id}
                aria-controls={`${item.id}-panel`}
                aria-selected={formState.activeDisciplineTab === item.id}
                className={[
                  'discipline-tabs__button',
                  formState.activeDisciplineTab === item.id
                    ? 'discipline-tabs__button--active'
                    : '',
                  errors.disciplineItems[item.id] ? 'discipline-tabs__button--error' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                disabled={!getIsDisciplineTabEnabled(disciplineItems, item.id)}
                id={`${item.id}-tab`}
                role="tab"
                type="button"
                onClick={() => updateFormState('activeDisciplineTab', item.id)}
              >
                <DisciplineTabProgress completionRatio={getDisciplineCompletionRatio(item)} />
                <span className="discipline-tabs__label">Приоритет {item.priority}</span>
              </button>
            ))}
          </div>

          {activeDiscipline ? (
            <DisciplineTabPanel
              errors={errors.disciplineItems[activeDiscipline.id]}
              getAvailableDisciplineOptions={getAvailableDisciplineOptions}
              gradeOptions={gradeOptions}
              isEditMode={isEditMode}
              item={activeDiscipline}
              loadedDisciplinesCount={loadedDisciplinesCount}
              programOptions={programOptions}
              updateDisciplineItem={updateDisciplineItem}
              workTypeOptions={workTypeOptions}
            />
          ) : null}
        </section>

        <section className="application-form__section" aria-labelledby="gradebook-upload-title">
          <div className="application-form__section-header">
            <h2 id="gradebook-upload-title" className="application-form__section-title">
              Загрузка зачетной книжки
            </h2>
            <p className="application-form__notice-text">
              Обратите внимание, что файл обязательно должен быть в формате PDF или
              DOCX, размером не более 5 МБ
            </p>
          </div>

          <FileUploadField
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            error={errors.gradebookFile}
            fileNames={formState.selectedFileName ? [formState.selectedFileName] : []}
            hint="PDF или DOCX, до 5 МБ"
            inputId="gradebook-file-input"
            resetLabel="Сбросить файл"
            selectedTitle="Файл загружен"
            title="Выберите файл"
            onChange={(files) => {
              const nextFile = files[0]

              if (!nextFile) {
                clearSelectedFile()
                return
              }

              handleFileChange(nextFile)
            }}
          />
        </section>

        {errors.disciplineGeneral ? (
          <div className="auth-form__error-box application-form__submit-error" role="alert">
            <p className="auth-form__error">{errors.disciplineGeneral}</p>
          </div>
        ) : null}

        {submitError ? (
          <div className="auth-form__error-box application-form__submit-error" role="alert">
            <p className="auth-form__error">{submitError}</p>
          </div>
        ) : null}

        <div className="application-form__submit">
          <button
            className="auth-form__button application-form__submit-button"
            type="submit"
            disabled={isSubmitting || isReadOnly}
          >
            {isSubmitting
              ? <LoadingIndicator />
              : isReadOnly
                ? 'Просмотр'
                : isEditMode
                  ? 'Сохранить изменения'
                  : 'Подать заявку'}
          </button>
        </div>
        </fieldset>
          </>
        ) : null}
      </form>
    </section>
  )
}

interface DisciplineTabPanelProps {
  errors?: DisciplineFormErrors
  getAvailableDisciplineOptions: (
    itemId: string,
    program: string,
  ) => Array<{ id: string; label: string }>
  gradeOptions: string[]
  isEditMode: boolean
  item: DisciplineFormItem
  loadedDisciplinesCount: number
  programOptions: Array<{ id: string; label: string }>
  updateDisciplineItem: <Key extends keyof DisciplineFormItem>(
    itemId: string,
    key: Key,
    value: DisciplineFormItem[Key],
  ) => void
  workTypeOptions: string[]
}

function DisciplineTabPanel({
  errors,
  getAvailableDisciplineOptions,
  gradeOptions,
  isEditMode,
  item,
  loadedDisciplinesCount,
  programOptions,
  updateDisciplineItem,
  workTypeOptions,
}: DisciplineTabPanelProps) {
  const disciplineOptions = getAvailableDisciplineOptions(item.id, item.educationProgram)
  const isLockedDiscipline =
    isEditMode &&
    Boolean(item.applicationDisciplineId) &&
    item.priority <= loadedDisciplinesCount &&
    Boolean(item.applicationDisciplineStatus) &&
    item.applicationDisciplineStatus !== 'NEW'

  return (
    <article
      aria-labelledby={`${item.id}-tab`}
      className="discipline-card"
      id={`${item.id}-panel`}
      role="tabpanel"
    >
      <div className="discipline-card__header">
        <h3 className="discipline-card__title">Дисциплина {item.priority}</h3>
      </div>

      <div className="discipline-card__layout">
        <div className="discipline-card__column">
          <SelectField
            disabled={isLockedDiscipline}
            error={errors?.workType}
            id={`${item.id}-work-type`}
            label="Тип оказания услуг"
            value={item.workType}
            onChange={(event) => updateDisciplineItem(item.id, 'workType', event.target.value)}
          >
            <option value="">Выберите вариант</option>
            {workTypeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </SelectField>

          <SelectField
            disabled={isLockedDiscipline}
            error={errors?.educationProgram}
            id={`${item.id}-program`}
            label="Образовательная программа"
            value={item.educationProgram}
            onChange={(event) =>
              updateDisciplineItem(item.id, 'educationProgram', event.target.value)
            }
          >
            <option value="">Выберите программу</option>
            {programOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </SelectField>

          <SelectField
            disabled={isLockedDiscipline || !item.educationProgram}
            error={errors?.discipline}
            id={`${item.id}-discipline`}
            label="Дисциплина"
            value={item.discipline}
            onChange={(event) =>
              updateDisciplineItem(item.id, 'discipline', event.target.value)
            }
          >
            <option value="">
              {item.educationProgram ? 'Выберите дисциплину' : 'Сначала выберите программу'}
            </option>
            {disciplineOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </SelectField>

          <TextAreaField
            className="discipline-card__field discipline-card__field--motivation"
            disabled={isLockedDiscipline}
            error={errors?.motivation}
            id={`${item.id}-motivation`}
            label="Мотивация"
            placeholder="Расскажите, почему Вы хотите работать на этой дисциплине"
            hint={
              <>
                <span>Пожалуйста, кратко опишите свою мотивацию быть учебным ассистентом и ваши учебные достижения</span>
                <span>Изучали ли вы аналогичные курсы раньше? Опишите, пожалуйста, ваш опыт в этой области</span>
                <span>Может ли кто-то из преподавателей дать вам рекомендацию? Если да, укажите, пожалуйста, ФИО и электронную почту</span>
              </>
            }
            value={item.motivation}
            onChange={(event) =>
              updateDisciplineItem(item.id, 'motivation', event.target.value)
            }
          />

          <div className="checkbox-field discipline-card__checkbox-group">
            <label className="checkbox-field__label" htmlFor={`${item.id}-two-groups`}>
              <input
                checked={item.twoGroups}
                className="checkbox-field__input"
                disabled={isLockedDiscipline}
                id={`${item.id}-two-groups`}
                type="checkbox"
                onChange={(event) =>
                  updateDisciplineItem(item.id, 'twoGroups', event.target.checked)
                }
              />
              <span className="checkbox-field__box" aria-hidden="true" />
              <span className="checkbox-field__text">
                Готов работать в двух группах одновременно
              </span>
            </label>
          </div>
        </div>

        <div className="discipline-card__column discipline-card__column--between">
          <TextField
            disabled={isLockedDiscipline}
            error={errors?.previousDisciplineName}
            id={`${item.id}-previous-discipline`}
            label="Название ранее изученной дисциплины"
            placeholder="Введите название дисциплины"
            value={item.previousDisciplineName}
            clearButtonLabel="Очистить название ранее изученной дисциплины"
            onClear={() => updateDisciplineItem(item.id, 'previousDisciplineName', '')}
            onChange={(event) =>
              updateDisciplineItem(item.id, 'previousDisciplineName', event.target.value)
            }
          />

          <TextField
            disabled={isLockedDiscipline}
            error={errors?.lecturerName}
            id={`${item.id}-lecturer`}
            label="ФИО лектора, у которого Вы осваивали дисциплину"
            placeholder="Иванов Иван Иванович"
            value={item.lecturerName}
            onChange={(event) =>
              updateDisciplineItem(item.id, 'lecturerName', event.target.value)
            }
          />

          <TextField
            className="discipline-card__field discipline-card__field--seminar"
            disabled={isLockedDiscipline}
            error={errors?.seminarTeacherName}
            id={`${item.id}-seminar`}
            label="ФИО семинариста, у которого Вы осваивали дисциплину"
            placeholder="Иванов Иван Иванович"
            value={item.seminarTeacherName}
            onChange={(event) =>
              updateDisciplineItem(item.id, 'seminarTeacherName', event.target.value)
            }
          />

          <SelectField
            disabled={isLockedDiscipline}
            error={errors?.grade}
            id={`${item.id}-grade`}
            label="Оценка по ранее изученной дисциплине"
            value={item.grade}
            onChange={(event) => updateDisciplineItem(item.id, 'grade', event.target.value)}
            hint='В случае отсутствия итоговой оценки по предмету (курс еще не завершен в текущем учебном году), внесите промежуточный балл согласно данным рабочей ведомости'
          >
            <option value="">Выберите оценку</option>
            {gradeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </SelectField>
          <div className="checkbox-field discipline-card__checkbox-group discipline-card__checkbox-group--confirmation">
            <label className="checkbox-field__label" htmlFor={`${item.id}-grade-confirmation`}>
              <input
                checked={item.isGradeConfirmed}
                className="checkbox-field__input"
                disabled={isLockedDiscipline}
                id={`${item.id}-grade-confirmation`}
                type="checkbox"
                onChange={(event) =>
                  updateDisciplineItem(item.id, 'isGradeConfirmed', event.target.checked)
                }
              />
              <span className="checkbox-field__box" aria-hidden="true" />
              <span className="checkbox-field__text">
                Подтверждаю, что указанная мною оценка соответствует оценке, выставленной преподавателем в ведомость. Осознаю, что подача недостоверных сведений приведет к отмене моей заявки
              </span>
            </label>
          </div>
        </div>
      </div>

      {errors?.isGradeConfirmed ? (
        <div className="auth-form__error-box" role="alert">
          <p className="auth-form__error">{errors.isGradeConfirmed}</p>
        </div>
      ) : null}
    </article>
  )
}

interface BaseFieldProps {
  className?: string
  disabled?: boolean
  error?: string
  id: string
  label: string
}

interface SelectFieldProps extends BaseFieldProps {
  children: ReactNode
  disabled?: boolean
  hint?: ReactNode
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void
  value: string
}

function SelectField({
  children,
  className,
  disabled,
  error,
  hint,
  id,
  label,
  onChange,
  value,
}: SelectFieldProps) {
  return (
    <label className={['auth-form__field', className].filter(Boolean).join(' ')} htmlFor={id}>
      <span className="auth-form__label">{label}</span>
      <select
        className={['auth-form__input', error ? 'auth-form__input--error' : '']
          .filter(Boolean)
          .join(' ')}
        disabled={disabled}
        id={id}
        value={value}
        onChange={onChange}
      >
        {children}
      </select>
      {hint ? <p className="auth-form__hint">{hint}</p> : null}
      <FieldError error={error} />
    </label>
  )
}

interface TextFieldProps extends BaseFieldProps {
  clearButtonLabel?: string
  hint?: ReactNode
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  onClear?: () => void
  placeholder?: string
  value: string
}

function TextField({
  className,
  clearButtonLabel,
  disabled,
  error,
  hint,
  id,
  label,
  onChange,
  onClear,
  placeholder,
  value,
}: TextFieldProps) {
  return (
    <label className={['auth-form__field', className].filter(Boolean).join(' ')} htmlFor={id}>
      <span className="auth-form__label">{label}</span>
      <div className="application-form__field-control">
        <input
          className={[
            'auth-form__input',
            value && onClear ? 'application-form__input--with-clear' : '',
            error ? 'auth-form__input--error' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          id={id}
          disabled={disabled}
          placeholder={placeholder}
          type="text"
          value={value}
          onChange={onChange}
        />
        {value && onClear ? (
          <button
            className="application-form__field-clear"
            disabled={disabled}
            type="button"
            onClick={onClear}
            aria-label={clearButtonLabel || 'Очистить поле'}
          >
            <CloseRoundedIcon fontSize="inherit" />
          </button>
        ) : null}
      </div>
      {hint ? <p className="auth-form__hint">{hint}</p> : null}
      <FieldError error={error} />
    </label>
  )
}

interface TextAreaFieldProps extends BaseFieldProps {
  hint?: ReactNode
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  value: string
}

function TextAreaField({
  className,
  disabled,
  error,
  hint,
  id,
  label,
  onChange,
  placeholder,
  value,
}: TextAreaFieldProps) {
  return (
    <label className={['auth-form__field', className].filter(Boolean).join(' ')} htmlFor={id}>
      <span className="auth-form__label">{label}</span>
      <textarea
        className={[
          'auth-form__input',
          'auth-form__textarea',
          error ? 'auth-form__input--error' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        id={id}
        disabled={disabled}
        placeholder={placeholder}
        rows={5}
        value={value}
        onChange={onChange}
      />
      {hint ? <div className="auth-form__hint">{hint}</div> : null}
      <FieldError error={error} />
    </label>
  )
}

function FieldError({ error }: { error?: string }) {
  return (
    <div className="auth-form__meta">
      {error ? (
        <div className="auth-form__error-box" role="alert">
          <p className="auth-form__error">{error}</p>
        </div>
      ) : null}
    </div>
  )
}

function DisciplineTabProgress({ completionRatio }: { completionRatio: number }) {
  if (completionRatio >= 1) {
    return <span className="discipline-tabs__progress discipline-tabs__progress--completed" />
  }

  return (
    <span
      className="discipline-tabs__progress"
      style={
        {
          '--discipline-progress': `${Math.round(completionRatio * 100)}%`,
        } as CSSProperties
      }
    />
  )
}
