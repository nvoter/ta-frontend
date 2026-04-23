import { type FormEvent, useEffect, useMemo, useState } from 'react'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import {
  type FullReportFilters,
  type PartialReportFilters,
  downloadFullApplicationsReport,
  downloadPartialApplicationsReport,
  getApplicationsSummary,
  type ApplicationsSummaryRowDto,
} from '../api/reportingApi'
import { getApplicationDisciplinesOverview } from '../api/applicationsApi'
import { getAllEmployees, getAllStudents } from '../api/adminApi'
import { AppNavbar } from './AppNavbar'
import { appRoutes } from '../routes/appRoutes'
import { getAuthSession } from '../utils/authSessionStorage'
import { logoutAndRedirect } from '../utils/logout'
import { navigateTo } from '../utils/navigation'

type ReportModalType = 'partial' | 'full' | null

interface PartialReportFormState {
  disciplineEducationLevel: string[]
  disciplineEducationalProgram: string[]
  disciplineName: string[]
  status: string[]
  studentEducationalProgram: string[]
  studentFaculty: string[]
  studentFullName: string[]
  workType: string[]
}

interface FullReportFormState {
  assistantSupervisorFullName: string[]
  disciplineEducationLevel: string[]
  disciplineEducationalProgram: string[]
  disciplineName: string[]
  status: string[]
  studentEducationalProgram: string[]
  studentFaculty: string[]
  studentFullName: string[]
  workType: string[]
}

interface SelectOption {
  value: string
  label: string
}

const initialPartialFormState: PartialReportFormState = {
  disciplineEducationLevel: [],
  disciplineEducationalProgram: [],
  disciplineName: [],
  status: [],
  studentEducationalProgram: [],
  studentFaculty: [],
  studentFullName: [],
  workType: [],
}

const initialFullFormState: FullReportFormState = {
  assistantSupervisorFullName: [],
  disciplineEducationLevel: [],
  disciplineEducationalProgram: [],
  disciplineName: [],
  status: [],
  studentEducationalProgram: [],
  studentFaculty: [],
  studentFullName: [],
  workType: [],
}

export function EmployeeStatistics() {
  const isAdmin = getAuthSession()?.userRole === 'ADMIN'
  const [rows, setRows] = useState<ApplicationsSummaryRowDto[]>([])
  const [statusValues, setStatusValues] = useState<string[]>([])
  const [workTypeValues, setWorkTypeValues] = useState<string[]>([])
  const [studentFullNameValues, setStudentFullNameValues] = useState<string[]>([])
  const [studentFacultyValues, setStudentFacultyValues] = useState<string[]>([])
  const [assistantSupervisorValues, setAssistantSupervisorValues] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalType, setModalType] = useState<ReportModalType>(null)
  const [partialForm, setPartialForm] = useState<PartialReportFormState>(
    initialPartialFormState,
  )
  const [fullForm, setFullForm] = useState<FullReportFormState>(initialFullFormState)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState('')

  const disciplineNameOptions = useMemo(
    () => buildSelectOptions(rows.map((row) => row.disciplineName)),
    [rows],
  )
  const educationalProgramOptions = useMemo(
    () => buildSelectOptions(rows.map((row) => row.educationalProgram)),
    [rows],
  )
  const studentFullNameOptions = useMemo(
    () => buildSelectOptions(studentFullNameValues),
    [studentFullNameValues],
  )
  const studentFacultyOptions = useMemo(
    () => buildSelectOptions(studentFacultyValues),
    [studentFacultyValues],
  )
  const assistantSupervisorOptions = useMemo(
    () => buildSelectOptions(assistantSupervisorValues),
    [assistantSupervisorValues],
  )
  const educationLevelOptions = useMemo(
    () => buildSelectOptions(rows.map((row) => row.educationLevel)),
    [rows],
  )
  const statusOptions = useMemo(
    () => buildSelectOptions(statusValues, toStatusLabel),
    [statusValues],
  )
  const workTypeOptions = useMemo(
    () => buildSelectOptions(workTypeValues, toWorkTypeLabel),
    [workTypeValues],
  )
  const partialDisciplineNameOptions = useMemo(
    () =>
      filterDisciplineNameOptions(
        rows,
        partialForm.disciplineEducationalProgram,
        disciplineNameOptions,
      ),
    [disciplineNameOptions, partialForm.disciplineEducationalProgram, rows],
  )
  const fullDisciplineNameOptions = useMemo(
    () =>
      filterDisciplineNameOptions(
        rows,
        fullForm.disciplineEducationalProgram,
        disciplineNameOptions,
      ),
    [disciplineNameOptions, fullForm.disciplineEducationalProgram, rows],
  )
  const hasAnyApplications = useMemo(
    () =>
      rows.some(
        (row) =>
          row.submittedApplicationsCount > 0 ||
          row.agreedApplicationsCount > 0 ||
          row.approvedApplicationsCount > 0,
      ),
    [rows],
  )
  const hasPartialReportApplications = useMemo(
    () =>
      rows.some(
        (row) => row.agreedApplicationsCount > 0 || row.approvedApplicationsCount > 0,
      ),
    [rows],
  )

  useEffect(() => {
    let isMounted = true

    async function loadStatistics() {
      try {
        const [summaryResult, overviewResult] = await Promise.allSettled([
          getApplicationsSummary(),
          getApplicationDisciplinesOverview(),
        ])

        if (!isMounted) {
          return
        }

        if (summaryResult.status === 'fulfilled') {
          setRows(summaryResult.value.items)
        } else {
          setError(getErrorMessage(summaryResult.reason))
        }

        if (overviewResult.status === 'fulfilled') {
          setStatusValues([...new Set(overviewResult.value.map((item) => item.status))])
          setWorkTypeValues([...new Set(overviewResult.value.map((item) => item.workType))])
        }

        if (isAdmin) {
          const [studentsResult, employeesResult] = await Promise.allSettled([
            getAllStudents(),
            getAllEmployees(),
          ])

          if (!isMounted) {
            return
          }

          if (studentsResult.status === 'fulfilled') {
            setStudentFullNameValues(
              studentsResult.value
                .map((student) =>
                  [student.lastName, student.firstName, student.middleName]
                    .filter(Boolean)
                    .join(' ')
                    .trim(),
                )
                .filter((value) => value.length > 0),
            )
            setStudentFacultyValues(
              studentsResult.value
                .map((student) => student.faculty?.trim() ?? '')
                .filter((value) => value.length > 0),
            )
          }

          if (employeesResult.status === 'fulfilled') {
            setAssistantSupervisorValues(
              employeesResult.value
                .map((employee) => employee.fullName?.trim() ?? '')
                .filter((value) => value.length > 0),
            )
          }
        }
      } catch (loadError) {
        if (isMounted) {
          setError(getErrorMessage(loadError))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadStatistics()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section
      className="dashboard-shell employee-dashboard"
      aria-labelledby="employee-statistics-title"
    >
      <AppNavbar
        tabs={
          isAdmin
            ? [
                {
                  label: 'Заявки студентов',
                  isActive: false,
                  onClick: () => navigateTo(appRoutes.employeeStudentApplications),
                },
                {
                  label: 'Мои заявки',
                  isActive: false,
                  onClick: () => navigateTo(appRoutes.employeeStudentApplicationsMine),
                },
                {
                  label: 'Кампании',
                  isActive: false,
                  onClick: () => navigateTo(appRoutes.employeeAdminCampaigns),
                },
                {
                  label: 'Сотрудники',
                  isActive: false,
                  onClick: () => navigateTo(appRoutes.employeeAdminEmployees),
                },
                {
                  label: 'Студенты',
                  isActive: false,
                  onClick: () => navigateTo(appRoutes.employeeAdminStudents),
                },
                {
                  label: 'Документы',
                  isActive: false,
                  onClick: () => navigateTo(appRoutes.employeeAdminDocuments),
                },
                {
                  label: 'Программы и дисциплины',
                  isActive: false,
                  onClick: () => navigateTo(appRoutes.employeeAdminDisciplines),
                },
                {
                  label: 'Статистика',
                  isActive: true,
                  onClick: () => navigateTo(appRoutes.employeeStatistics),
                },
              ]
            : [
                {
                  label: 'Все заявки',
                  isActive: false,
                  onClick: () => navigateTo(appRoutes.employeeStudentApplications),
                },
                {
                  label: 'Мои заявки',
                  isActive: false,
                  onClick: () => navigateTo(appRoutes.employeeStudentApplicationsMine),
                },
                {
                  label: 'Статистика',
                  isActive: true,
                  onClick: () => navigateTo(appRoutes.employeeStatistics),
                },
              ]
        }
        actions={[
          {
            icon: <NotificationsOutlinedIcon fontSize="inherit" />,
            label: 'Уведомления',
          },
          {
            icon: <SettingsOutlinedIcon fontSize="inherit" />,
            label: 'Настройки',
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

      <section className="dashboard-content employee-dashboard__content">
        <div className="dashboard-content__header employee-dashboard__header statistics-header">
          <h1
            id="employee-statistics-title"
            className="dashboard-content__title employee-dashboard__title"
          >
            Статистика
          </h1>
          <div className="statistics-actions">
            {hasPartialReportApplications ? (
              <button
                className="auth-form__button auth-form__button--secondary statistics-export-button"
                type="button"
                onClick={() => openReportModal('partial')}
              >
                Выгрузить частичный отчет
              </button>
            ) : null}
            {isAdmin && hasAnyApplications ? (
              <button
                className="auth-form__button auth-form__button--secondary statistics-export-button"
                type="button"
                onClick={() => openReportModal('full')}
              >
                Выгрузить полный отчет
              </button>
            ) : null}
          </div>
        </div>

        {isLoading ? (
          <StatisticsTableSkeleton />
        ) : error ? (
          <div className="auth-form__error-box" role="alert">
            <p className="auth-form__error">{error}</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table" aria-label="Сводная таблица по заявкам">
              <thead>
                <tr>
                  <th>Уровень</th>
                  <th>ОП</th>
                  <th>Дисциплина</th>
                  <th>Курс</th>
                  <th>Модули</th>
                  <th>Групп</th>
                  <th>Макс ассистентов</th>
                  <th>Подано</th>
                  <th>Согласовано</th>
                  <th>Утверждено</th>
                </tr>
              </thead>
              <tbody>
                {rows.length > 0 ? (
                  rows.map((row, index) => (
                    <tr key={`${row.disciplineName}-${row.course}-${index}`}>
                      <td>{row.educationLevel}</td>
                      <td>{row.educationalProgram}</td>
                      <td>{row.disciplineName}</td>
                      <td>{row.course}</td>
                      <td>{row.modules.join(', ')}</td>
                      <td>{row.groupsCount}</td>
                      <td>{row.maxTeachingAssistantsCount}</td>
                      <td>{row.submittedApplicationsCount}</td>
                      <td>{row.agreedApplicationsCount}</td>
                      <td>{row.approvedApplicationsCount}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modalType ? (
        <div
          className="admin-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-modal-title"
        >
          <button
            type="button"
            className="admin-modal__backdrop"
            onClick={closeReportModal}
            aria-label="Закрыть модальное окно"
            disabled={isDownloading}
          />
          <div className="admin-modal__content statistics-modal__content">
            <header className="admin-modal__header">
              <h3 id="report-modal-title">
                {modalType === 'partial'
                  ? 'Параметры частичного отчета'
                  : 'Параметры полного отчета'}
              </h3>
              <button
                type="button"
                className="admin-modal__close"
                onClick={closeReportModal}
                disabled={isDownloading}
                aria-label="Закрыть модальное окно"
              >
                <CloseRoundedIcon fontSize="inherit" />
              </button>
            </header>
            <form
              className="admin-modal__body statistics-modal__body"
              onSubmit={modalType === 'partial' ? handlePartialReportSubmit : handleFullReportSubmit}
            >
              {modalType === 'partial' ? (
                <div className="statistics-modal-grid">
                  {studentFullNameOptions.length > 0 ? (
                    <MultiSelectField
                      label="ФИО студента"
                      values={partialForm.studentFullName}
                      options={studentFullNameOptions}
                      onChange={(values) =>
                        setPartialForm((current) => ({ ...current, studentFullName: values }))
                      }
                    />
                  ) : (
                    <MultiValueInputField
                      label="ФИО студента"
                      values={partialForm.studentFullName}
                      onChange={(values) =>
                        setPartialForm((current) => ({ ...current, studentFullName: values }))
                      }
                    />
                  )}
                  {studentFacultyOptions.length > 0 ? (
                    <MultiSelectField
                      label="Факультет студента"
                      values={partialForm.studentFaculty}
                      options={studentFacultyOptions}
                      onChange={(values) =>
                        setPartialForm((current) => ({ ...current, studentFaculty: values }))
                      }
                    />
                  ) : (
                    <MultiValueInputField
                      label="Факультет студента"
                      values={partialForm.studentFaculty}
                      onChange={(values) =>
                        setPartialForm((current) => ({ ...current, studentFaculty: values }))
                      }
                    />
                  )}
                  <MultiSelectField
                    label="ОП студента"
                    values={partialForm.studentEducationalProgram}
                    options={educationalProgramOptions}
                    onChange={(values) =>
                      setPartialForm((current) => ({
                        ...current,
                        studentEducationalProgram: values,
                      }))
                    }
                  />
                  <MultiSelectField
                    label="Уровень образования дисциплины"
                    values={partialForm.disciplineEducationLevel}
                    options={educationLevelOptions}
                    onChange={(values) =>
                      setPartialForm((current) => ({
                        ...current,
                        disciplineEducationLevel: values,
                      }))
                    }
                  />
                  <MultiSelectField
                    label="ОП дисциплины"
                    values={partialForm.disciplineEducationalProgram}
                    options={educationalProgramOptions}
                    onChange={(values) =>
                      setPartialForm((current) => ({
                        ...current,
                        disciplineEducationalProgram: values,
                        disciplineName: [],
                      }))
                    }
                  />
                  <MultiSelectField
                    disabled={partialForm.disciplineEducationalProgram.length === 0}
                    label="Название дисциплины"
                    placeholder={
                      partialForm.disciplineEducationalProgram.length === 0
                        ? 'Сначала выберите ОП дисциплины'
                        : undefined
                    }
                    values={partialForm.disciplineName}
                    options={partialDisciplineNameOptions}
                    onChange={(values) =>
                      setPartialForm((current) => ({ ...current, disciplineName: values }))
                    }
                  />
                  <MultiSelectField
                    label="Тип оказания услуг"
                    values={partialForm.workType}
                    options={workTypeOptions}
                    onChange={(values) =>
                      setPartialForm((current) => ({ ...current, workType: values }))
                    }
                  />
                  <MultiSelectField
                    label="Статус заявки"
                    values={partialForm.status}
                    options={statusOptions}
                    onChange={(values) =>
                      setPartialForm((current) => ({ ...current, status: values }))
                    }
                  />
                </div>
              ) : (
                <div className="statistics-modal-grid">
                  {studentFullNameOptions.length > 0 ? (
                    <MultiSelectField
                      label="ФИО студента"
                      values={fullForm.studentFullName}
                      options={studentFullNameOptions}
                      onChange={(values) =>
                        setFullForm((current) => ({ ...current, studentFullName: values }))
                      }
                    />
                  ) : (
                    <MultiValueInputField
                      label="ФИО студента"
                      values={fullForm.studentFullName}
                      onChange={(values) =>
                        setFullForm((current) => ({ ...current, studentFullName: values }))
                      }
                    />
                  )}
                  {studentFacultyOptions.length > 0 ? (
                    <MultiSelectField
                      label="Факультет студента"
                      values={fullForm.studentFaculty}
                      options={studentFacultyOptions}
                      onChange={(values) =>
                        setFullForm((current) => ({ ...current, studentFaculty: values }))
                      }
                    />
                  ) : (
                    <MultiValueInputField
                      label="Факультет студента"
                      values={fullForm.studentFaculty}
                      onChange={(values) =>
                        setFullForm((current) => ({ ...current, studentFaculty: values }))
                      }
                    />
                  )}
                  <MultiSelectField
                    label="ОП студента"
                    values={fullForm.studentEducationalProgram}
                    options={educationalProgramOptions}
                    onChange={(values) =>
                      setFullForm((current) => ({
                        ...current,
                        studentEducationalProgram: values,
                      }))
                    }
                  />
                  <MultiSelectField
                    label="Уровень образования дисциплины"
                    values={fullForm.disciplineEducationLevel}
                    options={educationLevelOptions}
                    onChange={(values) =>
                      setFullForm((current) => ({
                        ...current,
                        disciplineEducationLevel: values,
                      }))
                    }
                  />
                  <MultiSelectField
                    label="ОП дисциплины"
                    values={fullForm.disciplineEducationalProgram}
                    options={educationalProgramOptions}
                    onChange={(values) =>
                      setFullForm((current) => ({
                        ...current,
                        disciplineEducationalProgram: values,
                        disciplineName: [],
                      }))
                    }
                  />
                  <MultiSelectField
                    disabled={fullForm.disciplineEducationalProgram.length === 0}
                    label="Название дисциплины"
                    placeholder={
                      fullForm.disciplineEducationalProgram.length === 0
                        ? 'Сначала выберите ОП дисциплины'
                        : undefined
                    }
                    values={fullForm.disciplineName}
                    options={fullDisciplineNameOptions}
                    onChange={(values) =>
                      setFullForm((current) => ({ ...current, disciplineName: values }))
                    }
                  />
                  <MultiSelectField
                    label="Тип оказания услуг"
                    values={fullForm.workType}
                    options={workTypeOptions}
                    onChange={(values) =>
                      setFullForm((current) => ({ ...current, workType: values }))
                    }
                  />
                  <MultiSelectField
                    label="Статус заявки"
                    values={fullForm.status}
                    options={statusOptions}
                    onChange={(values) =>
                      setFullForm((current) => ({ ...current, status: values }))
                    }
                  />
                  {assistantSupervisorOptions.length > 0 ? (
                    <MultiSelectField
                      label="Руководитель ассистента"
                      values={fullForm.assistantSupervisorFullName}
                      options={assistantSupervisorOptions}
                      onChange={(values) =>
                        setFullForm((current) => ({
                          ...current,
                          assistantSupervisorFullName: values,
                        }))
                      }
                    />
                  ) : (
                    <MultiValueInputField
                      label="Руководитель ассистента"
                      values={fullForm.assistantSupervisorFullName}
                      onChange={(values) =>
                        setFullForm((current) => ({
                          ...current,
                          assistantSupervisorFullName: values,
                        }))
                      }
                    />
                  )}
                </div>
              )}

              {downloadError ? (
                <div className="auth-form__error-box" role="alert">
                  <p className="auth-form__error">{downloadError}</p>
                </div>
              ) : null}

              <div className="admin-actions-row statistics-modal__actions">
                <button className="auth-form__button" type="submit" disabled={isDownloading}>
                  {isDownloading ? 'Формируем отчет...' : 'Выгрузить отчет'}
                </button>
                <button
                  className="auth-form__button auth-form__button--secondary"
                  type="button"
                  onClick={closeReportModal}
                  disabled={isDownloading}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  )

  function openReportModal(type: Exclude<ReportModalType, null>) {
    setDownloadError('')
    setModalType(type)
  }

  function closeReportModal() {
    if (isDownloading) {
      return
    }

    setDownloadError('')
    setModalType(null)
  }

  async function handlePartialReportSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsDownloading(true)
    setDownloadError('')

    try {
      await downloadPartialApplicationsReport(normalizePartialFilters(partialForm))
      setModalType(null)
    } catch (downloadReportError) {
      setDownloadError(getErrorMessage(downloadReportError))
    } finally {
      setIsDownloading(false)
    }
  }

  async function handleFullReportSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!isAdmin) {
      return
    }

    setIsDownloading(true)
    setDownloadError('')

    try {
      await downloadFullApplicationsReport(normalizeFullFilters(fullForm))
      setModalType(null)
    } catch (downloadReportError) {
      setDownloadError(getErrorMessage(downloadReportError))
    } finally {
      setIsDownloading(false)
    }
  }
}

function StatisticsTableSkeleton() {
  return (
    <div className="admin-table-wrap" aria-label="Загрузка статистики">
      <table className="admin-table admin-table-skeleton">
        <thead>
          <tr>
            <th>Уровень</th>
            <th>ОП</th>
            <th>Дисциплина</th>
            <th>Курс</th>
            <th>Модули</th>
            <th>Групп</th>
            <th>Макс ассистентов</th>
            <th>Подано</th>
            <th>Согласовано</th>
            <th>Утверждено</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 8 }).map((_, index) => (
            <tr key={`statistics-skeleton-${index}`}>
              {Array.from({ length: 10 }).map((__, cellIndex) => (
                <td key={`statistics-skeleton-cell-${index}-${cellIndex}`}>
                  <span
                    className={[
                      'admin-table-skeleton__line',
                      cellIndex % 3 === 0 ? 'admin-table-skeleton__line--short' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MultiSelectField({
  disabled = false,
  label,
  onChange,
  options,
  placeholder = 'Выберите одно или несколько значений',
  values,
}: {
  disabled?: boolean
  label: string
  onChange: (values: string[]) => void
  options: SelectOption[]
  placeholder?: string
  values: string[]
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const normalizedOptions = useMemo(
    () => options.filter((option) => option.value !== ''),
    [options],
  )
  const selectedOptions = useMemo(
    () => normalizedOptions.filter((option) => values.includes(option.value)),
    [normalizedOptions, values],
  )
  const filteredOptions = useMemo(() => {
    const query = searchValue.trim().toLocaleLowerCase('ru-RU')

    if (!query) {
      return normalizedOptions
    }

    return normalizedOptions.filter((option) =>
      option.label.toLocaleLowerCase('ru-RU').includes(query),
    )
  }, [normalizedOptions, searchValue])

  useEffect(() => {
    if (disabled) {
      setIsOpen(false)
      setSearchValue('')
    }
  }, [disabled])

  function toggleValue(nextValue: string) {
    onChange(
      values.includes(nextValue)
        ? values.filter((value) => value !== nextValue)
        : [...values, nextValue],
    )
  }

  return (
    <div className="auth-form__field statistics-filter-field">
      <span className="auth-form__label">{label}</span>
      <div
        className={[
          'statistics-picker',
          isOpen ? 'statistics-picker--open' : '',
          disabled ? 'statistics-picker--disabled' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <button
          className="statistics-picker__trigger"
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen((current) => !current)}
        >
          <span className="statistics-picker__trigger-text">
            {selectedOptions.length > 0
              ? `Выбрано: ${selectedOptions.length}`
              : placeholder}
          </span>
          <ExpandMoreRoundedIcon fontSize="inherit" />
        </button>

        {selectedOptions.length > 0 ? (
          <div className="statistics-picker__chips">
            {selectedOptions.map((option) => (
              <button
                key={`${label}-chip-${option.value}`}
                className="statistics-picker__chip"
                type="button"
                onClick={() => toggleValue(option.value)}
              >
                <span>{option.label}</span>
                <CloseRoundedIcon fontSize="inherit" />
              </button>
            ))}
          </div>
        ) : null}

        {isOpen && !disabled ? (
          <div className="statistics-picker__panel">
            {normalizedOptions.length > 8 ? (
              <input
                className="auth-form__input statistics-picker__search"
                type="text"
                placeholder="Поиск значения"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
              />
            ) : null}

            <div className="statistics-picker__options">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const isSelected = values.includes(option.value)

                  return (
                    <button
                      key={`${label}-${option.value}`}
                      className={[
                        'statistics-picker__option',
                        isSelected ? 'statistics-picker__option--selected' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      type="button"
                      onClick={() => toggleValue(option.value)}
                    >
                      <span className="statistics-picker__checkbox" aria-hidden="true">
                        {isSelected ? <CheckRoundedIcon fontSize="inherit" /> : null}
                      </span>
                      <span>{option.label}</span>
                    </button>
                  )
                })
              ) : (
                <p className="statistics-picker__empty">Ничего не найдено</p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function MultiValueInputField({
  label,
  onChange,
  values,
}: {
  label: string
  onChange: (values: string[]) => void
  values: string[]
}) {
  return (
    <label className="auth-form__field">
      <span className="auth-form__label">{label}</span>
      <input
        className="auth-form__input"
        placeholder="Введите значения через точку с запятой"
        value={values.join('; ')}
        onChange={(event) =>
          onChange(
            event.target.value
              .split(';')
              .map((value) => value.trim())
              .filter((value) => value.length > 0),
          )
        }
      />
    </label>
  )
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Не удалось загрузить статистику'
}

function normalizePartialFilters(state: PartialReportFormState): PartialReportFilters {
  return {
    disciplineEducationLevel: normalizeStringArray(state.disciplineEducationLevel),
    disciplineEducationalProgram: normalizeStringArray(state.disciplineEducationalProgram),
    disciplineName: normalizeStringArray(state.disciplineName),
    status: normalizeStringArray(state.status),
    studentEducationalProgram: normalizeStringArray(state.studentEducationalProgram),
    studentFaculty: normalizeStringArray(state.studentFaculty),
    studentFullName: normalizeStringArray(state.studentFullName),
    workType: normalizeStringArray(state.workType),
  }
}

function normalizeFullFilters(state: FullReportFormState): FullReportFilters {
  return {
    assistantSupervisorFullName: normalizeStringArray(state.assistantSupervisorFullName),
    disciplineEducationLevel: normalizeStringArray(state.disciplineEducationLevel),
    disciplineEducationalProgram: normalizeStringArray(state.disciplineEducationalProgram),
    disciplineName: normalizeStringArray(state.disciplineName),
    status: normalizeStringArray(state.status),
    studentEducationalProgram: normalizeStringArray(state.studentEducationalProgram),
    studentFaculty: normalizeStringArray(state.studentFaculty),
    studentFullName: normalizeStringArray(state.studentFullName),
    workType: normalizeStringArray(state.workType),
  }
}

function normalizeStringArray(values: string[]) {
  const normalizedValues = values
    .map((value) => value.trim())
    .filter((value) => value.length > 0)

  if (normalizedValues.length === 0) {
    return undefined
  }

  return normalizedValues
}

function buildSelectOptions(values: string[], labelMapper?: (value: string) => string): SelectOption[] {
  const uniqueValues = [...new Set(values.map((value) => value.trim()).filter((value) => value.length > 0))]
  return uniqueValues
    .map((value) => ({
      value,
      label: labelMapper ? labelMapper(value) : value,
    }))
    .sort((left, right) =>
      left.label.localeCompare(right.label, 'ru-RU', {
        sensitivity: 'base',
      }),
    )
}

function filterDisciplineNameOptions(
  rows: ApplicationsSummaryRowDto[],
  selectedPrograms: string[],
  defaultOptions: SelectOption[],
) {
  if (selectedPrograms.length === 0) {
    return []
  }

  const filteredOptions = buildSelectOptions(
    rows
      .filter((row) => selectedPrograms.includes(row.educationalProgram))
      .map((row) => row.disciplineName),
  )

  return filteredOptions.length > 0 ? filteredOptions : defaultOptions
}

function toWorkTypeLabel(value: string) {
  if (value === 'FREE') {
    return 'Безвозмездно'
  }

  if (value === 'PAID') {
    return 'Платно'
  }

  return value
}

function toStatusLabel(value: string) {
  if (value === 'NEW') {
    return 'Новая'
  }

  if (value === 'INTERESTED') {
    return 'Заинтересован'
  }

  if (value === 'AGREED') {
    return 'На согласовании'
  }

  if (value === 'APPROVED') {
    return 'Утверждена'
  }

  return value
}
