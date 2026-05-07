import { useEffect, useRef, useState, type FormEvent } from 'react'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import SwapVertOutlinedIcon from '@mui/icons-material/SwapVertOutlined'
import { AppNavbar } from './AppNavbar'
import { EmployeeSessionContextForm } from './EmployeeSessionContextForm'
import { useEmployeeStudentApplications } from '../hooks/useEmployeeStudentApplications'
import { appRoutes } from '../routes/appRoutes'
import { logoutAndRedirect } from '../utils/logout'
import { navigateTo } from '../utils/navigation'

export function EmployeeStudentApplications() {
  const pathname = window.location.pathname
  const [isSessionContextModalOpen, setIsSessionContextModalOpen] = useState(false)
  const {
    actingAsFullName,
    activeFiltersCount,
    applications,
    campaignError,
    discipline,
    disciplineOptions,
    error,
    hasMoreApplications,
    isAdmin,
    isLoading,
    isLoadingMore,
    isReadOnly,
    loadMoreError,
    loadMoreApplications,
    priority,
    priorityOptions,
    program,
    programOptions,
    searchValue,
    setActiveTab,
    refreshActingContext,
    setDiscipline,
    setPriority,
    setProgram,
    setSearchValue,
    setSortOrder,
    setStatus,
    resetAllFilters,
    sortOrder,
    status,
    statusOptions,
    totalApplicationsCount,
  } = useEmployeeStudentApplications()
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null)

  const sortLabel =
    sortOrder === 'newest' ? 'Сначала новые' : 'Сначала старые'
  const pageTitle =
    pathname === appRoutes.employeeStudentApplicationsMine
      ? 'Мои заявки'
      : 'Заявки студентов'
  useEffect(() => {
    if (!isAdmin) {
      return
    }

    setActiveTab(
      pathname === appRoutes.employeeStudentApplicationsMine ? 'mine' : 'all',
    )
  }, [isAdmin, pathname, setActiveTab])

  useEffect(() => {
    const trigger = loadMoreTriggerRef.current

    if (!trigger || isLoading || error || !hasMoreApplications) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadMoreApplications()
        }
      },
      { rootMargin: '360px 0px' },
    )

    observer.observe(trigger)

    return () => {
      observer.disconnect()
    }
  }, [error, hasMoreApplications, isLoading, loadMoreApplications])

  return (
    <section
      className="dashboard-shell employee-dashboard"
      aria-labelledby="employee-student-applications-title"
    >
      <AppNavbar
        tabs={
          isAdmin
            ? [
                {
                  label: 'Заявки студентов',
                  isActive: pathname === appRoutes.employeeStudentApplications,
                  onClick: () => navigateTo(appRoutes.employeeStudentApplications),
                },
                {
                  label: 'Мои заявки',
                  isActive: pathname === appRoutes.employeeStudentApplicationsMine,
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
                  isActive: false,
                  onClick: () => navigateTo(appRoutes.employeeStatistics),
                },
              ]
            : [
                {
                  isActive: pathname === appRoutes.employeeStudentApplications,
                  label: 'Все заявки',
                  onClick: () => navigateTo(appRoutes.employeeStudentApplications),
                },
                {
                  isActive: pathname === appRoutes.employeeStudentApplicationsMine,
                  label: 'Мои заявки',
                  onClick: () => navigateTo(appRoutes.employeeStudentApplicationsMine),
                },
                {
                  isActive: pathname === appRoutes.employeeStatistics,
                  label: 'Статистика',
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

      <section className="employee-dashboard__acting-banner" aria-label="Текущий режим действий">
        <p className="employee-dashboard__acting-label">
          {actingAsFullName ? (
            <>
              Вы действуете как <strong>{actingAsFullName}</strong>
            </>
          ) : (
            'Вы действуете от своего имени'
          )}
        </p>
        <button
          className="employee-dashboard__acting-switch"
          type="button"
          onClick={() => setIsSessionContextModalOpen(true)}
        >
          Сменить
        </button>
      </section>

      <section className="dashboard-content employee-dashboard__content">
        <div className="dashboard-content__header employee-dashboard__header">
          <h1
            id="employee-student-applications-title"
            className="dashboard-content__title employee-dashboard__title"
          >
            {pageTitle}
          </h1>
        </div>

        <form className="employee-filters" onSubmit={preventDefault} noValidate>
          <label className="auth-form__field employee-filters__field">
            <span className="auth-form__label">Поиск по имени студента</span>
            <div className="employee-filters__control">
              <input
                className="auth-form__input employee-filters__input"
                type="text"
                name="studentName"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Введите ФИО"
              />
              {searchValue ? (
                <button
                  className="employee-filters__clear"
                  type="button"
                  onClick={() => setSearchValue('')}
                  aria-label="Очистить фильтр по имени студента"
                >
                  <CloseRoundedIcon fontSize="inherit" />
                </button>
              ) : null}
            </div>
          </label>

          <label className="auth-form__field employee-filters__field">
            <span className="auth-form__label">Программа</span>
            <div className="employee-filters__control">
              <select
                className={[
                  'auth-form__input',
                  'employee-filters__input',
                  program !== 'Все программы'
                    ? 'employee-filters__input--has-value'
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                name="program"
                value={program}
                onChange={(event) => setProgram(event.target.value)}
              >
                {programOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {program !== 'Все программы' ? (
                <button
                  className="employee-filters__clear"
                  type="button"
                  onClick={() => setProgram('Все программы')}
                  aria-label="Очистить фильтр по программе"
                >
                  <CloseRoundedIcon fontSize="inherit" />
                </button>
              ) : null}
            </div>
          </label>

          <label className="auth-form__field employee-filters__field">
            <span className="auth-form__label">Дисциплина</span>
            <div className="employee-filters__control">
              <select
                className={[
                  'auth-form__input',
                  'employee-filters__input',
                  discipline !== 'Все дисциплины'
                    ? 'employee-filters__input--has-value'
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                name="discipline"
                value={discipline}
                onChange={(event) => setDiscipline(event.target.value)}
              >
                {disciplineOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {discipline !== 'Все дисциплины' ? (
                <button
                  className="employee-filters__clear"
                  type="button"
                  onClick={() => setDiscipline('Все дисциплины')}
                  aria-label="Очистить фильтр по дисциплине"
                >
                  <CloseRoundedIcon fontSize="inherit" />
                </button>
              ) : null}
            </div>
          </label>

          <label className="auth-form__field employee-filters__field">
            <span className="auth-form__label">Приоритет</span>
            <div className="employee-filters__control">
              <select
                className={[
                  'auth-form__input',
                  'employee-filters__input',
                  priority !== 'Любой'
                    ? 'employee-filters__input--has-value'
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                name="priority"
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
              >
                {priorityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {priority !== 'Любой' ? (
                <button
                  className="employee-filters__clear"
                  type="button"
                  onClick={() => setPriority('Любой')}
                  aria-label="Очистить фильтр по приоритету"
                >
                  <CloseRoundedIcon fontSize="inherit" />
                </button>
              ) : null}
            </div>
          </label>

          <label className="auth-form__field employee-filters__field">
            <span className="auth-form__label">Статус</span>
            <div className="employee-filters__control">
              <select
                className={[
                  'auth-form__input',
                  'employee-filters__input',
                  status !== 'Любой'
                    ? 'employee-filters__input--has-value'
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                name="status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {status !== 'Любой' ? (
                <button
                  className="employee-filters__clear"
                  type="button"
                  onClick={() => setStatus('Любой')}
                  aria-label="Очистить фильтр по статусу"
                >
                  <CloseRoundedIcon fontSize="inherit" />
                </button>
              ) : null}
            </div>
          </label>
        </form>

        {activeFiltersCount > 1 ? (
          <div className="employee-filters__actions">
            <button
              className="employee-filters__reset-all"
              type="button"
              onClick={resetAllFilters}
            >
              Сбросить все
            </button>
          </div>
        ) : null}

        {isReadOnly ? (
          <div className="auth-form__notice" role="note">
            <p>
              Сейчас нет активной кампании, поэтому интерфейс доступен только в режиме
              просмотра
            </p>
          </div>
        ) : null}

        {campaignError ? (
          <div className="auth-form__error-box" role="alert">
            <p className="auth-form__error">{campaignError}</p>
          </div>
        ) : null}

        <div className="employee-dashboard__toolbar">
          <p className="employee-dashboard__count">
            {totalApplicationsCount}{' '}
            {getApplicationsWord(totalApplicationsCount)}
          </p>
          <button
            className="dashboard-sort-toggle"
            type="button"
            onClick={() =>
              setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')
            }
            aria-label={`Сортировка: ${sortLabel}`}
          >
            <SwapVertOutlinedIcon fontSize="inherit" />
            <span>{sortLabel}</span>
          </button>
        </div>

        {isLoading ? (
          <EmployeeApplicationsSkeleton />
        ) : error ? (
          <div className="auth-form__error-box" role="alert">
            <p className="auth-form__error">{error}</p>
          </div>
        ) : applications.length > 0 ? (
          <>
            <div className="employee-applications" aria-label="Список заявок студентов">
              {applications.map((application) => (
                <button
                  key={application.id}
                  className="application-card employee-application-card employee-application-card--interactive"
                  type="button"
                  onClick={() =>
                    navigateTo(appRoutes.employeeStudentApplicationDetails, {
                      applicationDisciplineId: application.id,
                    })
                  }
                >
                  <div className="application-card__header employee-application-card__header">
                    <div className="employee-application-card__header-main">
                      <h2 className="employee-application-card__title">
                        {application.studentName}
                      </h2>
                    </div>
                    <time
                      className="employee-application-card__date"
                      dateTime={application.createdAt}
                    >
                      {formatApplicationDate(application.createdAt)}
                    </time>
                  </div>

                  <div className="employee-application-card__body">
                    <div className="employee-application-card__topline">
                      <div className="employee-application-card__priority">
                        <span className="employee-application-card__priority-label">
                          ПРИОРИТЕТ
                        </span>
                        <span className="employee-application-card__priority-value">
                          {application.priority}
                        </span>
                      </div>
                      <div className="employee-application-card__summary-status">
                        <span className="employee-application-card__status-label sr-only">
                          Статус
                        </span>
                          <span
                            className={[
                              'application-card__status',
                              `application-card__status--${toStatusClassName(
                                application.status,
                              )}`,
                            ]
                              .filter(Boolean)
                              .join(' ')}
                          >
                            {application.status}
                          </span>
                      </div>
                    </div>

                    <dl className="employee-application-card__summary">
                      <div className="employee-application-card__summary-item">
                        <dt>ПРОГРАММА</dt>
                        <dd>{application.program}</dd>
                      </div>
                      <div className="employee-application-card__summary-item employee-application-card__summary-item--wide">
                        <dt>ДИСЦИПЛИНА</dt>
                        <dd>{application.discipline}</dd>
                      </div>
                      <div className="employee-application-card__summary-item">
                        <dt>ТИП РАБОТЫ</dt>
                        <dd>
                          {application.workType === 'PAID' ? 'Платно' : 'Безвозмездно'}
                        </dd>
                      </div>
                      <div className="employee-application-card__summary-item">
                        <dt>ДВЕ ГРУППЫ</dt>
                        <dd>{application.twoGroups ? 'Да' : 'Нет'}</dd>
                      </div>
                    </dl>

                    <section className="employee-application-card__teachers" aria-label="История обучения">
                      <h3 className="employee-application-card__teachers-title">
                        КУРС РАНЕЕ ИЗУЧАЛ(А) У:
                      </h3>
                      <dl className="employee-application-card__teachers-grid">
                        <div className="employee-application-card__teacher">
                          <dt>ЛЕКТОР</dt>
                          <dd>{application.teachers.lecturer}</dd>
                        </div>
                        <div className="employee-application-card__teacher">
                          <dt>СЕМИНАРИСТ</dt>
                          <dd>{application.teachers.seminarist}</dd>
                        </div>
                      </dl>
                    </section>

                  </div>
                </button>
              ))}
            </div>
            {isLoadingMore ? <EmployeeApplicationsSkeleton /> : null}
            {loadMoreError ? (
              <div className="auth-form__error-box" role="alert">
                <p className="auth-form__error">{loadMoreError}</p>
              </div>
            ) : null}
          </>
        ) : (
          <div className="dashboard-empty-state">
            <h3>Заявки не найдены</h3>
            <p>Попробуйте изменить параметры поиска или фильтры</p>
          </div>
        )}
        {applications.length === 0 && loadMoreError ? (
          <div className="auth-form__error-box" role="alert">
            <p className="auth-form__error">{loadMoreError}</p>
          </div>
        ) : null}
        {!isLoading && !error && hasMoreApplications ? (
          <div
            ref={loadMoreTriggerRef}
            className="employee-applications__load-more"
            aria-hidden={!isLoadingMore}
          >
            {isLoadingMore ? 'Загружаем еще заявки...' : null}
          </div>
        ) : null}
      </section>

      {isSessionContextModalOpen ? (
        <div
          className="admin-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="employee-session-context-modal-title"
        >
          <button
            type="button"
            className="admin-modal__backdrop"
            onClick={() => setIsSessionContextModalOpen(false)}
            aria-label="Закрыть окно"
          />
          <div className="admin-modal__content statistics-modal__content">
            <div className="admin-modal__header">
              <h3 id="employee-session-context-modal-title">Профиль пользователя</h3>
              <button
                type="button"
                className="admin-modal__close"
                onClick={() => setIsSessionContextModalOpen(false)}
                aria-label="Закрыть окно"
              >
                <CloseRoundedIcon fontSize="inherit" />
              </button>
            </div>
            <div className="admin-modal__body statistics-modal__body">
              <EmployeeSessionContextForm
                embedded
                onClose={() => setIsSessionContextModalOpen(false)}
                onSubmitted={() => {
                  void refreshActingContext()
                }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

function EmployeeApplicationsSkeleton() {
  return (
    <div className="employee-applications" aria-label="Загрузка списка заявок студентов">
      {Array.from({ length: 6 }).map((_, index) => (
        <article
          key={`employee-application-skeleton-${index}`}
          className="application-card employee-application-card admin-card-skeleton"
        >
          <div className="employee-application-card__header">
            <div className="employee-application-card__header-main">
              <span className="admin-table-skeleton__line admin-table-skeleton__line--wide" />
            </div>
            <span className="admin-table-skeleton__line admin-table-skeleton__line--short" />
          </div>

          <div className="employee-application-card__body">
            <div className="employee-application-card__topline">
              <span className="admin-table-skeleton__line admin-table-skeleton__line--short" />
              <span className="admin-table-skeleton__line admin-table-skeleton__line--short" />
            </div>
            <span className="admin-table-skeleton__line" />
            <span className="admin-table-skeleton__line admin-table-skeleton__line--wide" />
            <span className="admin-table-skeleton__line" />
          </div>
        </article>
      ))}
    </div>
  )
}

function formatApplicationDate(value: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
    .format(new Date(value))
    .replace(',', '')
}

function preventDefault(event: FormEvent<HTMLFormElement>) {
  event.preventDefault()
}

function toStatusClassName(status: string) {
  if (status === 'Новая') {
    return 'new'
  }

  if (status === 'Заинтересован') {
    return 'interested'
  }

  if (status === 'На согласовании') {
    return 'approved'
  }

  if (status === 'Отклонено') {
    return 'rejected'
  }

  return 'confirmed'
}

function getApplicationsWord(count: number) {
  const mod10 = count % 10
  const mod100 = count % 100

  if (mod10 === 1 && mod100 !== 11) {
    return 'заявка'
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return 'заявки'
  }

  return 'заявок'
}
