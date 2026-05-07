import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import { AppNavbar } from './AppNavbar'
import { useStudentDashboard } from '../hooks/useStudentDashboard'
import { logoutAndRedirect } from '../utils/logout'
import { navigateTo } from '../utils/navigation'
import { appRoutes } from '../routes/appRoutes'

export function StudentDisciplines() {
  const {
    activeDisciplineFiltersCount,
    campaignError,
    courseOptions,
    disciplineSearch,
    educationLevelOptions,
    error,
    educationalProgramOptions,
    filteredDisciplines,
    hasActiveCampaign,
    isLoading,
    selectedCourse,
    selectedEducationLevel,
    selectedEducationalProgramId,
    setDisciplineSearch,
    setSelectedCourse,
    setSelectedEducationLevel,
    setSelectedEducationalProgramId,
  } = useStudentDashboard({
    includeApplications: false,
    includeStudentProfile: false,
  })

  return (
    <section className="dashboard-shell" aria-label="Дисциплины студента">
      <AppNavbar
        tabs={[
          {
            isActive: false,
            label: 'Личный кабинет',
            onClick: () => navigateTo(appRoutes.studentDashboard),
          },
          {
            isActive: true,
            label: 'Дисциплины ФКН',
            onClick: () => navigateTo(appRoutes.studentDisciplines),
          },
          ...(hasActiveCampaign
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

      {campaignError ? (
        <div className="auth-form__error-box" role="alert">
          <p className="auth-form__error">{campaignError}</p>
        </div>
      ) : null}

      <section className="dashboard-content" aria-label="Список дисциплин">
        <div className="dashboard-content__header">
          <h2 className="dashboard-content__title">Дисциплины ФКН</h2>
        </div>

        <form className="employee-filters student-disciplines-filters" noValidate>
          <label className="auth-form__field employee-filters__field student-disciplines-filters__search">
            <span className="auth-form__label">Поиск по названию</span>
            <div className="employee-filters__control">
              <input
                className="auth-form__input employee-filters__input"
                type="text"
                value={disciplineSearch}
                onChange={(event) => setDisciplineSearch(event.target.value)}
                placeholder="Введите название дисциплины"
              />
              {disciplineSearch ? (
                <button
                  className="employee-filters__clear"
                  type="button"
                  onClick={() => setDisciplineSearch('')}
                  aria-label="Сбросить поиск по названию дисциплины"
                >
                  <CloseRoundedIcon fontSize="inherit" />
                </button>
              ) : null}
            </div>
          </label>

          <SingleSelectFilter
            className="student-disciplines-filters__education-level"
            label="Уровень образования"
            options={educationLevelOptions.map((option) => ({
              label: option,
              value: option,
            }))}
            emptyLabel="Любой уровень"
            value={selectedEducationLevel}
            onChange={setSelectedEducationLevel}
            onClear={() => setSelectedEducationLevel('')}
          />

          <SingleSelectFilter
            className="student-disciplines-filters__program"
            label="ОП"
            options={educationalProgramOptions.map((option) => ({
              label: option.label,
              value: option.id,
            }))}
            emptyLabel="Все ОП"
            value={selectedEducationalProgramId}
            onChange={setSelectedEducationalProgramId}
            onClear={() => setSelectedEducationalProgramId('')}
          />

          <SingleSelectFilter
            className="student-disciplines-filters__course"
            label="Курс"
            options={courseOptions.map((option) => ({
              label: option,
              value: option,
            }))}
            emptyLabel="Любой курс"
            value={selectedCourse}
            onChange={setSelectedCourse}
            onClear={() => setSelectedCourse('')}
          />
        </form>

        {activeDisciplineFiltersCount > 1 ? (
          <div className="employee-filters__actions">
            <button
              className="employee-filters__reset-all"
              type="button"
              onClick={() => {
                setDisciplineSearch('')
                setSelectedEducationLevel('')
                setSelectedEducationalProgramId('')
                setSelectedCourse('')
              }}
            >
              Сбросить все фильтры
            </button>
          </div>
        ) : null}

        {isLoading ? (
          <StudentDisciplinesSkeleton />
        ) : error ? (
          <div className="auth-form__error-box" role="alert">
            <p className="auth-form__error">{error}</p>
          </div>
        ) : filteredDisciplines.length > 0 ? (
          <div className="admin-table-wrap">
            <table className="admin-table" aria-label="Список дисциплин">
              <thead>
                <tr>
                  <th>Уровень образования</th>
                  <th>ОП</th>
                  <th>Название</th>
                  <th>Курс</th>
                  <th>Модули</th>
                  <th>Групп</th>
                  <th>Макс ассистентов</th>
                </tr>
              </thead>
              <tbody>
                {filteredDisciplines.map((item) => (
                  <tr key={item.id}>
                    <td>{item.educationLevel}</td>
                    <td>{item.educationalProgramName}</td>
                    <td>{item.name}</td>
                    <td>{item.course}</td>
                    <td>{item.modules.join(', ')}</td>
                    <td>{item.groupsCount}</td>
                    <td>{item.maxAssistantsCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="dashboard-empty-state">
            <h3>Дисциплины не найдены</h3>
            <p>Попробуйте изменить фильтры или строку поиска</p>
          </div>
        )}
      </section>
    </section>
  )
}

function SingleSelectFilter({
  className,
  emptyLabel = 'Выберите значение',
  label,
  onChange,
  onClear,
  options,
  value,
}: {
  className?: string
  emptyLabel?: string
  label: string
  onChange: (value: string) => void
  onClear: () => void
  options: Array<{ label: string; value: string }>
  value: string
}) {
  return (
    <div className={['auth-form__field', 'employee-filters__field', className].filter(Boolean).join(' ')}>
      <label className="auth-form__label">
        {label}
      </label>
      <div className="employee-filters__control">
        <select
          className={[
            'auth-form__input',
            value ? 'employee-filters__input employee-filters__input--has-value' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label={label}
        >
          <option value="">{emptyLabel}</option>
          {options.map((option) => (
            <option key={`${label}-${option.value}`} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {value ? (
          <button
            className="employee-filters__clear"
            type="button"
            onClick={onClear}
            aria-label={`Сбросить фильтр ${label}`}
          >
            <CloseRoundedIcon fontSize="inherit" />
          </button>
        ) : null}
      </div>
    </div>
  )
}

function StudentDisciplinesSkeleton() {
  return (
    <div className="admin-table-wrap" aria-label="Загрузка списка дисциплин">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Уровень образования</th>
            <th>ОП</th>
            <th>Название</th>
            <th>Курс</th>
            <th>Модули</th>
            <th>Групп</th>
            <th>Макс ассистентов</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 4 }).map((_, index) => (
            <tr key={`student-discipline-skeleton-${index}`}>
              <td><span className="admin-table-skeleton__line" /></td>
              <td><span className="admin-table-skeleton__line admin-table-skeleton__line--wide" /></td>
              <td><span className="admin-table-skeleton__line admin-table-skeleton__line--wide" /></td>
              <td><span className="admin-table-skeleton__line admin-table-skeleton__line--short" /></td>
              <td><span className="admin-table-skeleton__line admin-table-skeleton__line--short" /></td>
              <td><span className="admin-table-skeleton__line admin-table-skeleton__line--short" /></td>
              <td><span className="admin-table-skeleton__line admin-table-skeleton__line--short" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
