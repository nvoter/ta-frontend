import AddRoundedIcon from '@mui/icons-material/AddRounded'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined'
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { AppNavbar } from './AppNavbar'
import { FileUploadField } from './FileUploadField'
import { LoadingIndicator } from './LoadingIndicator'
import { useAdminPanel, type AdminSection } from '../hooks/useAdminPanel'
import { appRoutes } from '../routes/appRoutes'
import { logoutAndRedirect } from '../utils/logout'
import { navigateTo } from '../utils/navigation'

export function AdminPanel() {
  const pathname = window.location.pathname
  const activeSection = getActiveSection(pathname)
  const [optimisticSection, setOptimisticSection] = useState<AdminSection | null>(null)
  const visibleSection = optimisticSection ?? activeSection
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null)
  const [isProgramsExpanded, setIsProgramsExpanded] = useState(true)
  const [isDisciplinesExpanded, setIsDisciplinesExpanded] = useState(true)
  const [isStudentsImportOpen, setIsStudentsImportOpen] = useState(false)
  const [isDisciplinesImportOpen, setIsDisciplinesImportOpen] = useState(false)
  const [isDocumentsDateEditing, setIsDocumentsDateEditing] = useState(false)
  const [studentsDocsStartDateDraft, setStudentsDocsStartDateDraft] = useState('')

  const {
    adminToasts,
    busyAction,
    campaignEdits,
    campaignEndAt,
    campaignForeignCitizenDocumentFormUrl,
    campaignRussianCitizenDocumentFormUrl,
    campaignStartAt,
    campaigns,
    clearCampaignFormResult,
    disciplineCourse,
    disciplineCourseOptions,
    disciplineForm,
    disciplineProgram,
    disciplineProgramOptions,
    disciplineSearch,
    disciplines,
    disciplinesTotalCount,
    disciplinesImportFile,
    editingDisciplineId,
    editingEmployeeBackupEmail,
    editingEmployeeId,
    employeeBackupEmail,
    employeeCorporateEmail,
    employeeFullName,
    employeeSearch,
    employees,
    handleCreateCampaign,
    handleCreateEmployee,
    handleDeleteCampaign,
    handleToggleCampaignActive,
    handleDeleteDiscipline,
    handleImportDisciplines,
    handleImportStudents,
    handleImportStudentsDocuments,
    handlePromoteStudentsCourses,
    handleSaveCampaign,
    handleSaveDiscipline,
    handleSaveEmployeeEdit,
    handleSetStudentsDocumentsStartDate,
    isCampaignModalOpen,
    isCampaignsLoading,
    isEmployeesLoading,
    isDisciplinesLoading,
    isDisciplineModalOpen,
    isEmployeeCreateModalOpen,
    isInitialLoading,
    isProgramsLoading,
    isStudentsLoading,
    openCreateDisciplineModal,
    openEditDisciplineModal,
    programOptions,
    sortedProgramOptions,
    reloadCampaigns,
    reloadStudents,
    dismissAdminToast,
    setCampaignEdit,
    setCampaignEndAt,
    setCampaignForeignCitizenDocumentFormUrl,
    setCampaignRussianCitizenDocumentFormUrl,
    setCampaignStartAt,
    setDisciplineCourse,
    setDisciplineForm,
    setDisciplineProgram,
    setDisciplineSearch,
    setDisciplinesImportFile,
    setEditingEmployeeBackupEmail,
    setEditingEmployeeId,
    setEmployeeBackupEmail,
    setEmployeeCorporateEmail,
    setEmployeeFullName,
    setEmployeeSearch,
    setIsCampaignModalOpen,
    setIsDisciplineModalOpen,
    setIsEmployeeCreateModalOpen,
    setStudentsDocumentsFiles,
    setStudentsImportFile,
    students,
    studentsTotalCount,
    studentsCourse,
    studentsCourseOptions,
    studentsDocsStartDate,
    studentsDocumentsStatus,
    studentsDocumentsStatusOptions,
    studentsDocumentsFiles,
    studentsEducationLevel,
    studentsEducationLevelOptions,
    studentsFaculty,
    studentsFacultyOptions,
    studentsImportFile,
    studentsProgram,
    studentsProgramOptions,
    studentsSearch,
    activeStudentsFiltersCount,
    resetStudentsFilters,
    setStudentsCourse,
    setStudentsDocumentsStatus,
    setStudentsEducationLevel,
    setStudentsFaculty,
    setStudentsProgram,
    setStudentsSearch,
  } = useAdminPanel()

  const activeToast = adminToasts[0] ?? null
  const editingCampaign = editingCampaignId
    ? campaigns.find((item) => item.id === editingCampaignId) ?? null
    : null
  const programsById = new Map(programOptions.map((item) => [item.id, item]))

  useEffect(() => {
    if (!activeToast) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      dismissAdminToast(activeToast.id)
    }, 3200)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [activeToast, dismissAdminToast])

  useEffect(() => {
    if (activeSection !== 'students') {
      return
    }

    void reloadStudents()
  }, [activeSection])

  useEffect(() => {
    setOptimisticSection(null)
  }, [activeSection])

  useEffect(() => {
    if (visibleSection !== 'students') {
      return
    }

    setIsStudentsImportOpen(studentsTotalCount === 0)
  }, [studentsTotalCount, visibleSection])

  useEffect(() => {
    if (visibleSection !== 'disciplines') {
      return
    }

    setIsDisciplinesImportOpen(
      disciplinesTotalCount === 0 && programOptions.length === 0,
    )
  }, [disciplinesTotalCount, programOptions.length, visibleSection])

  useEffect(() => {
    if (visibleSection !== 'documents' || isInitialLoading) {
      return
    }

    setIsDocumentsDateEditing(!studentsDocsStartDate)
  }, [isInitialLoading, studentsDocsStartDate, visibleSection])

  useEffect(() => {
    setStudentsDocsStartDateDraft(formatDocumentsStartDateForInput(studentsDocsStartDate))
  }, [studentsDocsStartDate])

  return (
    <section
      className={[
        'dashboard-shell',
        'employee-dashboard',
        'admin-dashboard',
        visibleSection === 'students' ? 'admin-dashboard--students' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-labelledby="admin-dashboard-title"
    >
      <AppNavbar
        tabs={[
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
            isActive: visibleSection === 'campaigns',
            onClick: () => navigateAdminSection('campaigns', appRoutes.employeeAdminCampaigns),
          },
          {
            label: 'Сотрудники',
            isActive: visibleSection === 'employees',
            onClick: () => navigateAdminSection('employees', appRoutes.employeeAdminEmployees),
          },
          {
            label: 'Студенты',
            isActive: visibleSection === 'students',
            onClick: () => navigateAdminSection('students', appRoutes.employeeAdminStudents),
          },
          {
            label: 'Документы',
            isActive: visibleSection === 'documents',
            onClick: () => navigateAdminSection('documents', appRoutes.employeeAdminDocuments),
          },
          {
            label: 'Программы и дисциплины',
            isActive: visibleSection === 'disciplines',
            onClick: () => navigateAdminSection('disciplines', appRoutes.employeeAdminDisciplines),
          },
          {
            label: 'Статистика',
            isActive: false,
            onClick: () => navigateTo(appRoutes.employeeStatistics),
          },
        ]}
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
        <div className="dashboard-content__header employee-dashboard__header admin-header-row">
          <h1 id="admin-dashboard-title" className="dashboard-content__title employee-dashboard__title">
            {getTitle(visibleSection)}
          </h1>

          {visibleSection === 'campaigns' ? (
            <button
              className="auth-form__button"
              type="button"
              onClick={() => {
                clearCampaignFormResult()
                setIsCampaignModalOpen(true)
              }}
            >
              <AddRoundedIcon fontSize="inherit" />
              <span>Запланировать кампанию</span>
            </button>
          ) : null}

          {visibleSection === 'employees' ? (
            <button
              className="auth-form__button"
              type="button"
              onClick={() => setIsEmployeeCreateModalOpen(true)}
            >
              <AddRoundedIcon fontSize="inherit" />
              <span>Создать сотрудника</span>
            </button>
          ) : null}

          {visibleSection === 'students' && studentsTotalCount > 0 ? (
            <div className="admin-actions-row">
              <button
                className="auth-form__button auth-form__button--secondary"
                type="button"
                onClick={() => setIsStudentsImportOpen((current) => !current)}
              >
                <AddRoundedIcon fontSize="inherit" />
                <span>{isStudentsImportOpen ? 'Отменить' : 'Импорт'}</span>
              </button>
              <button
                className="auth-form__button auth-form__button--secondary"
                type="button"
                onClick={() => {
                  void handlePromoteStudentsCourses()
                }}
                disabled={busyAction === 'students-promote'}
              >
                {busyAction === 'students-promote' ? <LoadingIndicator /> : 'Обновить курсы'}
              </button>
            </div>
          ) : null}
        </div>

        {activeToast ? (
          <div
            className={[
              'admin-toast',
              activeToast.kind === 'error' ? 'admin-toast--error' : 'admin-toast--success',
            ]
              .filter(Boolean)
              .join(' ')}
            role="status"
            aria-live="polite"
          >
            <p>{activeToast.message}</p>
            <button
              className="admin-toast__close"
              type="button"
              onClick={() => dismissAdminToast(activeToast.id)}
              aria-label="Закрыть уведомление"
            >
              <CloseRoundedIcon fontSize="inherit" />
            </button>
          </div>
        ) : null}

        {visibleSection === 'campaigns' ? (
          <section className="application-form__section" aria-labelledby="admin-campaigns-title">
            <div className="admin-actions-row">
              <button className="auth-form__button auth-form__button--secondary" type="button" onClick={() => {
                void reloadCampaigns()
              }}>
                <RefreshOutlinedIcon fontSize="inherit" />
                <span>Обновить</span>
              </button>
            </div>

            {isCampaignsLoading ? (
              <CampaignCardsSkeleton />
            ) : campaigns.length === 0 ? (
              <div className="dashboard-empty-state">
                <h3>Кампаний пока нет</h3>
              </div>
            ) : (
              <div className="admin-campaigns-list">
                {campaigns.map((campaign) => {
                  const editState = campaignEdits[campaign.id]

                  if (!editState) {
                    return null
                  }

                  return (
                    <article key={campaign.id} className="admin-item-card admin-item-card--compact admin-campaign-row">
                      <div className="admin-item-card__header">
                        <div className="admin-campaign-row__headline">
                          <h3>
                            {formatDateTimeShort(campaign.startsAt)} - {formatDateTimeShort(campaign.endsAt)}
                          </h3>
                          <span className="admin-campaign-row__state">
                            {campaign.isActive ? 'Активна' : 'Неактивна'}
                          </span>
                        </div>
                        <div className="admin-campaign-row__actions">
                          <button
                            className="admin-icon-button"
                            type="button"
                            onClick={() => {
                              clearCampaignFormResult()
                              setEditingCampaignId(campaign.id)
                            }}
                            aria-label="Изменить кампанию"
                          >
                            <EditOutlinedIcon fontSize="inherit" />
                          </button>
                          <button
                            className="admin-icon-button admin-icon-button--danger"
                            type="button"
                            onClick={() => {
                              void handleDeleteCampaign(campaign.id)
                            }}
                            aria-label="Удалить кампанию"
                          >
                            <DeleteOutlineRoundedIcon fontSize="inherit" />
                          </button>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        ) : null}

        {visibleSection === 'employees' ? (
          <section className="application-form__section" aria-labelledby="admin-employees-title">
            <label className="auth-form__field">
              <span className="auth-form__label">Фильтр по имени и любой почте</span>
              <div className="employee-filters__control">
                <input
                  className="auth-form__input employee-filters__input"
                  type="text"
                  placeholder="Введите ФИО или email"
                  value={employeeSearch}
                  onChange={(event) => setEmployeeSearch(event.target.value)}
                />
                {employeeSearch ? (
                  <button
                    className="employee-filters__clear"
                    type="button"
                    onClick={() => setEmployeeSearch('')}
                    aria-label="Сбросить фильтр сотрудников"
                  >
                    <CloseRoundedIcon fontSize="inherit" />
                  </button>
                ) : null}
              </div>
            </label>

            {isEmployeesLoading ? (
              <EmployeesTableSkeleton />
            ) : employees.length === 0 ? (
              <div className="dashboard-empty-state">
                <h3>Пока нет данных по сотрудникам</h3>
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table" aria-label="Список сотрудников">
                  <thead>
                    <tr>
                      <th>ФИО</th>
                      <th>Корпоративная почта</th>
                      <th>Резервная почта</th>
                      <th>Роль</th>
                      <th aria-label="Действия" />
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((item) => (
                      <tr key={item.id}>
                        <td>{item.fullName || 'Без ФИО'}</td>
                        <td>{item.email}</td>
                        <td>
                          {editingEmployeeId === item.id ? (
                            <input
                              className="auth-form__input admin-table__input"
                              type="email"
                              value={editingEmployeeBackupEmail}
                              onChange={(event) => setEditingEmployeeBackupEmail(event.target.value)}
                              placeholder="name.backup@example.com"
                            />
                          ) : (
                            item.backupEmail || 'Не указана'
                          )}
                        </td>
                        <td>{getEmployeeRoleLabel(item.role)}</td>
                        <td
                          className={[
                            'admin-table__actions',
                            editingEmployeeId === item.id ? 'admin-table__actions--center' : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        >
                          {editingEmployeeId === item.id ? (
                            <>
                              <button
                                className="admin-icon-button"
                                type="button"
                                onClick={() => {
                                  void handleSaveEmployeeEdit()
                                }}
                                disabled={busyAction === 'employee-edit-save'}
                                aria-label="Сохранить изменения"
                              >
                                <CheckRoundedIcon fontSize="inherit" />
                              </button>
                              <button
                                className="admin-icon-button"
                                type="button"
                                onClick={() => {
                                  setEditingEmployeeId(null)
                                  setEditingEmployeeBackupEmail('')
                                }}
                                aria-label="Отменить редактирование"
                              >
                                <CloseRoundedIcon fontSize="inherit" />
                              </button>
                            </>
                          ) : (
                            <button
                              className="admin-icon-button"
                              type="button"
                              onClick={() => {
                                setEditingEmployeeId(item.id)
                                setEditingEmployeeBackupEmail(item.backupEmail || '')
                              }}
                              aria-label="Редактировать сотрудника"
                            >
                              <EditOutlinedIcon fontSize="inherit" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : null}

        {visibleSection === 'students' ? (
          <section className="application-form__section" aria-labelledby="admin-students-title">
            {busyAction === 'students-import' ? (
              <div className="dashboard-empty-state">
                <LoadingIndicator />
                <h3>Импортируем студентов...</h3>
              </div>
            ) : isStudentsLoading ? (
              <StudentsTableSkeleton />
            ) : studentsTotalCount === 0 ? (
              <section className="admin-import-panel">
                <FileUploadField
                  accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  files={studentsImportFile ? [studentsImportFile] : []}
                  hint="XLSX, до 20 МБ"
                  inputId="students-import-input"
                  resetLabel="Сбросить файл"
                  selectedTitle="Файл загружен"
                  title="Выберите файл"
                  onChange={(files) => setStudentsImportFile(files[0] ?? null)}
                />
                {studentsImportFile ? (
                  <div className="admin-actions-row">
                    <button
                      className="auth-form__button"
                      type="button"
                      onClick={() => {
                        void handleImportStudents()
                      }}
                      disabled={busyAction === 'students-import'}
                    >
                      {busyAction === 'students-import' ? <LoadingIndicator /> : 'Импортировать'}
                    </button>
                  </div>
                ) : null}
              </section>
            ) : (
              <>
                {isStudentsImportOpen ? (
                  <section className="admin-import-panel">
                    <FileUploadField
                      accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      files={studentsImportFile ? [studentsImportFile] : []}
                      hint="XLSX, до 20 МБ"
                      inputId="students-import-input"
                      resetLabel="Сбросить файл"
                      selectedTitle="Файл загружен"
                      title="Выберите файл"
                      onChange={(files) => setStudentsImportFile(files[0] ?? null)}
                    />
                    {studentsImportFile ? (
                      <div className="admin-actions-row">
                        <button
                          className="auth-form__button"
                          type="button"
                          onClick={() => {
                            void handleImportStudents()
                          }}
                          disabled={busyAction === 'students-import'}
                        >
                          {busyAction === 'students-import' ? <LoadingIndicator /> : 'Импортировать'}
                        </button>
                      </div>
                    ) : null}
                  </section>
                ) : null}

                <form className="employee-filters admin-students-filters" onSubmit={preventDefault} noValidate>
                  <label className="auth-form__field employee-filters__field admin-students-search-field">
                    <span className="auth-form__label">ФИО</span>
                    <div className="employee-filters__control">
                      <input
                        className="auth-form__input employee-filters__input"
                        type="text"
                        value={studentsSearch}
                        onChange={(event) => setStudentsSearch(event.target.value)}
                        placeholder="Введите ФИО или email"
                      />
                      {studentsSearch ? (
                        <button
                          className="employee-filters__clear"
                          type="button"
                          onClick={() => setStudentsSearch('')}
                          aria-label="Сбросить фильтр по ФИО и email"
                        >
                          <CloseRoundedIcon fontSize="inherit" />
                        </button>
                      ) : null}
                    </div>
                  </label>

                  <label className="auth-form__field employee-filters__field">
                    <span className="auth-form__label">Уровень образования</span>
                    <div className="employee-filters__control">
                      <select
                        className={[
                          'auth-form__input',
                          'employee-filters__input',
                          studentsEducationLevel !== 'Любой уровень'
                            ? 'employee-filters__input--has-value'
                            : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        value={studentsEducationLevel}
                        onChange={(event) => setStudentsEducationLevel(event.target.value)}
                      >
                        {studentsEducationLevelOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      {studentsEducationLevel !== 'Любой уровень' ? (
                        <button
                          className="employee-filters__clear"
                          type="button"
                          onClick={() => setStudentsEducationLevel('Любой уровень')}
                          aria-label="Сбросить фильтр по уровню образования"
                        >
                          <CloseRoundedIcon fontSize="inherit" />
                        </button>
                      ) : null}
                    </div>
                  </label>

                  <label className="auth-form__field employee-filters__field">
                    <span className="auth-form__label">Факультет</span>
                    <div className="employee-filters__control">
                      <select
                        className={[
                          'auth-form__input',
                          'employee-filters__input',
                          studentsFaculty !== 'Любой факультет'
                            ? 'employee-filters__input--has-value'
                            : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        value={studentsFaculty}
                        onChange={(event) => setStudentsFaculty(event.target.value)}
                      >
                        {studentsFacultyOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      {studentsFaculty !== 'Любой факультет' ? (
                        <button
                          className="employee-filters__clear"
                          type="button"
                          onClick={() => setStudentsFaculty('Любой факультет')}
                          aria-label="Сбросить фильтр по факультету"
                        >
                          <CloseRoundedIcon fontSize="inherit" />
                        </button>
                      ) : null}
                    </div>
                  </label>

                  <label className="auth-form__field employee-filters__field">
                    <span className="auth-form__label">ОП</span>
                    <div className="employee-filters__control">
                      <select
                        className={[
                          'auth-form__input',
                          'employee-filters__input',
                          studentsProgram !== 'Любая ОП' ? 'employee-filters__input--has-value' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        value={studentsProgram}
                        onChange={(event) => setStudentsProgram(event.target.value)}
                      >
                        {studentsProgramOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      {studentsProgram !== 'Любая ОП' ? (
                        <button
                          className="employee-filters__clear"
                          type="button"
                          onClick={() => setStudentsProgram('Любая ОП')}
                          aria-label="Сбросить фильтр по ОП"
                        >
                          <CloseRoundedIcon fontSize="inherit" />
                        </button>
                      ) : null}
                    </div>
                  </label>

                  <label className="auth-form__field employee-filters__field">
                    <span className="auth-form__label">Курс</span>
                    <div className="employee-filters__control">
                      <select
                        className={[
                          'auth-form__input',
                          'employee-filters__input',
                          studentsCourse !== 'Любой курс'
                            ? 'employee-filters__input--has-value'
                            : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        value={studentsCourse}
                        onChange={(event) => setStudentsCourse(event.target.value)}
                      >
                        {studentsCourseOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      {studentsCourse !== 'Любой курс' ? (
                        <button
                          className="employee-filters__clear"
                          type="button"
                          onClick={() => setStudentsCourse('Любой курс')}
                          aria-label="Сбросить фильтр по курсу"
                        >
                          <CloseRoundedIcon fontSize="inherit" />
                        </button>
                      ) : null}
                    </div>
                  </label>

                  <label className="auth-form__field employee-filters__field">
                    <span className="auth-form__label">Документы</span>
                    <div className="employee-filters__control">
                      <select
                        className={[
                          'auth-form__input',
                          'employee-filters__input',
                          studentsDocumentsStatus !== 'Любой статус'
                            ? 'employee-filters__input--has-value'
                            : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        value={studentsDocumentsStatus}
                        onChange={(event) => setStudentsDocumentsStatus(event.target.value)}
                      >
                        {studentsDocumentsStatusOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      {studentsDocumentsStatus !== 'Любой статус' ? (
                        <button
                          className="employee-filters__clear"
                          type="button"
                          onClick={() => setStudentsDocumentsStatus('Любой статус')}
                          aria-label="Сбросить фильтр по документам"
                        >
                          <CloseRoundedIcon fontSize="inherit" />
                        </button>
                      ) : null}
                    </div>
                  </label>
                </form>

                {activeStudentsFiltersCount > 0 ? (
                  <div className="employee-filters__actions">
                    <button
                      className="employee-filters__reset-all"
                      type="button"
                      onClick={resetStudentsFilters}
                    >
                      Сбросить все
                    </button>
                  </div>
                ) : null}

                <div className="admin-table-wrap">
                  <table className="admin-table admin-table--students" aria-label="Список студентов">
                    <thead>
                      <tr>
                        <th>Уровень образования</th>
                        <th>Факультет</th>
                        <th>ОП</th>
                        <th>Курс</th>
                        <th>Почта</th>
                        <th>ФИО</th>
                        <th>Документы</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.id}>
                          <td>{student.educationLevel || 'Не указан'}</td>
                          <td>{student.faculty || 'Не указан'}</td>
                          <td>{student.educationalProgram || 'Не указана'}</td>
                          <td>{student.course || '-'}</td>
                          <td>{student.email}</td>
                          <td>{formatStudentName(student)}</td>
                          <td>{student.isDocumentsUploaded ? 'Загружены' : 'Не загружены'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        ) : null}

        {visibleSection === 'documents' ? (
          <section className="application-form__section" aria-labelledby="admin-documents-title">
            <section className="admin-import-panel">
              {studentsDocsStartDate && !isDocumentsDateEditing ? (
                <div className="admin-readonly-card">
                  <div>
                    <p className="admin-readonly-card__label">Дата начала учета загрузок</p>
                    <p className="admin-readonly-card__value">
                      {formatDocumentsStartDateForInput(studentsDocsStartDate)}
                    </p>
                  </div>
                  <button
                    className="auth-form__button auth-form__button--secondary admin-readonly-card__button"
                    type="button"
                    onClick={() => {
                      setStudentsDocsStartDateDraft(
                        formatDocumentsStartDateForInput(studentsDocsStartDate),
                      )
                      setIsDocumentsDateEditing(true)
                    }}
                  >
                    Редактировать
                  </button>
                </div>
              ) : null}

              {isDocumentsDateEditing || !studentsDocsStartDate ? (
                <>
                  {studentsDocsStartDate ? (
                    <div className="admin-section-block__header">
                      <span className="admin-section-block__title">Редактирование даты</span>
                    </div>
                  ) : null}

                  <label className="auth-form__field">
                    <span className="auth-form__label">Дата начала учета загрузок</span>
                    <input
                      className="auth-form__input"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="ДД.ММ.ГГГГ"
                      value={studentsDocsStartDateDraft}
                      onChange={(event) => setStudentsDocsStartDateDraft(event.target.value)}
                    />
                  </label>

                  <div className="admin-actions-row">
                    <button
                      className="auth-form__button auth-form__button--secondary"
                      type="button"
                      onClick={() => {
                        void (async () => {
                          const isSuccess = await handleSetStudentsDocumentsStartDate(
                            studentsDocsStartDateDraft,
                          )

                          if (isSuccess) {
                            setIsDocumentsDateEditing(false)
                          }
                        })()
                      }}
                      disabled={busyAction === 'documents-start-date'}
                    >
                      {busyAction === 'documents-start-date' ? <LoadingIndicator /> : 'Сохранить дату'}
                    </button>
                    {studentsDocsStartDate ? (
                      <button
                        className="auth-form__button auth-form__button--secondary"
                        type="button"
                        onClick={() => {
                          setStudentsDocsStartDateDraft(
                            formatDocumentsStartDateForInput(studentsDocsStartDate),
                          )
                          setIsDocumentsDateEditing(false)
                        }}
                        disabled={busyAction === 'documents-start-date'}
                      >
                        Отмена
                      </button>
                    ) : null}
                  </div>
                </>
              ) : null}

              {studentsDocsStartDate ? (
                <>
                  <div className="admin-divider" />
                  <FileUploadField
                    accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    files={studentsDocumentsFiles}
                    hint="XLSX, 1-2 файла"
                    inputId="students-documents-import-input"
                    multiple
                    resetLabel="Сбросить файлы"
                    selectedTitle="Файлы загружены"
                    title="Выберите файлы"
                    onChange={(files) => setStudentsDocumentsFiles(files.slice(0, 2))}
                  />

                  {studentsDocumentsFiles.length > 0 ? (
                    <div className="admin-actions-row">
                      <button
                        className="auth-form__button"
                        type="button"
                        onClick={() => {
                          void handleImportStudentsDocuments()
                        }}
                        disabled={busyAction === 'documents-import'}
                      >
                        {busyAction === 'documents-import' ? <LoadingIndicator /> : 'Обновить'}
                      </button>
                    </div>
                  ) : null}
                </>
              ) : null}
            </section>
          </section>
        ) : null}

        {visibleSection === 'disciplines' ? (
          <section className="application-form__section" aria-labelledby="admin-disciplines-title">
            {busyAction === 'disciplines-import' ? (
              <div className="dashboard-empty-state">
                <LoadingIndicator />
                <h3>Импортируем программы и дисциплины...</h3>
              </div>
            ) : null}

            {busyAction !== 'disciplines-import' &&
            !isDisciplinesLoading &&
            disciplinesTotalCount === 0 &&
            programOptions.length === 0 ? (
              <>
                {isDisciplinesImportOpen ? (
                  <FileUploadField
                    accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    files={disciplinesImportFile ? [disciplinesImportFile] : []}
                    hint="XLSX, до 20 МБ"
                    inputId="disciplines-import-input"
                    resetLabel="Сбросить файл"
                    selectedTitle="Файл загружен"
                    title="Выберите файл"
                    onChange={(files) => setDisciplinesImportFile(files[0] ?? null)}
                  />
                ) : null}

                {disciplinesImportFile && isDisciplinesImportOpen ? (
                  <div className="admin-actions-row">
                    <button
                      className="auth-form__button"
                      type="button"
                      onClick={() => {
                        void handleImportDisciplines()
                      }}
                      disabled={busyAction === 'disciplines-import'}
                    >
                      {busyAction === 'disciplines-import' ? <LoadingIndicator /> : 'Импортировать'}
                    </button>
                  </div>
                ) : null}

                <div className="admin-divider" />
              </>
            ) : null}

            {!isProgramsLoading && programOptions.length > 0 ? (
              <section className="admin-section-block" aria-label="Образовательные программы">
                <button
                  className="admin-collapse-toggle"
                  type="button"
                  onClick={() => setIsProgramsExpanded((current) => !current)}
                >
                  <span className="admin-section-block__title">Образовательные программы</span>
                  {isProgramsExpanded ? (
                    <ExpandLessRoundedIcon fontSize="inherit" />
                  ) : (
                    <ExpandMoreRoundedIcon fontSize="inherit" />
                  )}
                </button>

                {isProgramsExpanded ? (
                  <div className="admin-table-wrap">
                    <table className="admin-table" aria-label="Список образовательных программ">
                      <thead>
                        <tr>
                          <th>Уровень образования</th>
                          <th>Название</th>
                          <th>Короткое название</th>
                        </tr>
                      </thead>
                      <tbody>
                        {programOptions.map((program) => (
                          <tr key={program.id}>
                            <td>{program.educationLevel}</td>
                            <td>{program.name}</td>
                            <td>{program.shortName}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </section>
            ) : null}

            {isProgramsLoading ? (
              <section className="admin-section-block" aria-label="Образовательные программы">
                <span className="admin-section-block__title">Образовательные программы</span>
                <ProgramsTableSkeleton />
              </section>
            ) : null}

            {(programOptions.length > 0 || isProgramsLoading) && (disciplinesTotalCount > 0 || isDisciplinesLoading) ? <div className="admin-divider" /> : null}

            {disciplinesTotalCount > 0 || isDisciplinesLoading ? (
              <section className="admin-section-block" aria-label="Дисциплины">
                <button
                  className="admin-collapse-toggle"
                  type="button"
                  onClick={() => setIsDisciplinesExpanded((current) => !current)}
                >
                  <span className="admin-section-block__title">Дисциплины</span>
                  {isDisciplinesExpanded ? (
                    <ExpandLessRoundedIcon fontSize="inherit" />
                  ) : (
                    <ExpandMoreRoundedIcon fontSize="inherit" />
                  )}
                </button>

                {isDisciplinesExpanded ? (
                  <>
                    <form className="employee-filters admin-disciplines-filters" onSubmit={preventDefault} noValidate>
                      <label className="auth-form__field employee-filters__field">
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
                              aria-label="Сбросить фильтр по названию дисциплины"
                            >
                              <CloseRoundedIcon fontSize="inherit" />
                            </button>
                          ) : null}
                        </div>
                      </label>

                      <label className="auth-form__field employee-filters__field">
                        <span className="auth-form__label">ОП</span>
                        <div className="employee-filters__control">
                          <select
                            className={[
                              'auth-form__input',
                              'employee-filters__input',
                              disciplineProgram !== 'Все ОП' ? 'employee-filters__input--has-value' : '',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                            value={disciplineProgram}
                            onChange={(event) => setDisciplineProgram(event.target.value)}
                          >
                            {disciplineProgramOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          {disciplineProgram !== 'Все ОП' ? (
                            <button
                              className="employee-filters__clear"
                              type="button"
                              onClick={() => setDisciplineProgram('Все ОП')}
                              aria-label="Сбросить фильтр по ОП"
                            >
                              <CloseRoundedIcon fontSize="inherit" />
                            </button>
                          ) : null}
                        </div>
                      </label>

                      <label className="auth-form__field employee-filters__field">
                        <span className="auth-form__label">Курс</span>
                        <div className="employee-filters__control">
                          <select
                            className={[
                              'auth-form__input',
                              'employee-filters__input',
                              disciplineCourse !== 'Любой курс' ? 'employee-filters__input--has-value' : '',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                            value={disciplineCourse}
                            onChange={(event) => setDisciplineCourse(event.target.value)}
                          >
                            {disciplineCourseOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                          {disciplineCourse !== 'Любой курс' ? (
                            <button
                              className="employee-filters__clear"
                              type="button"
                              onClick={() => setDisciplineCourse('Любой курс')}
                              aria-label="Сбросить фильтр по курсу дисциплины"
                            >
                              <CloseRoundedIcon fontSize="inherit" />
                            </button>
                          ) : null}
                        </div>
                      </label>

                      <div className="admin-disciplines-filters__action">
                        <button className="auth-form__button admin-section-block__add-button" type="button" onClick={openCreateDisciplineModal}>
                          <AddRoundedIcon fontSize="inherit" />
                          <span>Добавить</span>
                        </button>
                      </div>
                    </form>

                    {isDisciplinesLoading ? (
                      <DisciplinesTableSkeleton />
                    ) : disciplines.length === 0 ? (
                      <div className="dashboard-empty-state">
                        <h3>Дисциплины не найдены</h3>
                      </div>
                    ) : (
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
                            <th aria-label="Действия" />
                          </tr>
                        </thead>
                        <tbody>
                          {disciplines.map((item) => {
                            const program = programsById.get(item.educationalProgramId)
                            return (
                              <tr key={item.id}>
                                <td>{program?.educationLevel || 'Не указан'}</td>
                                <td>{program?.name || 'Не указана'}</td>
                                <td>{item.name}</td>
                                <td>{item.course}</td>
                                <td>{item.modules.join(', ')}</td>
                                <td>{item.groupsCount}</td>
                                <td>{item.maxAssistantsCount}</td>
                                <td>
                                  <div className="admin-table__actions">
                                    <button
                                      className="admin-icon-button"
                                      type="button"
                                      onClick={() => openEditDisciplineModal(item)}
                                      aria-label="Редактировать дисциплину"
                                    >
                                      <EditOutlinedIcon fontSize="inherit" />
                                    </button>
                                    <button
                                      className="admin-icon-button admin-icon-button--danger"
                                      type="button"
                                      onClick={() => {
                                        void handleDeleteDiscipline(item.id)
                                      }}
                                      aria-label="Удалить дисциплину"
                                    >
                                      <DeleteOutlineRoundedIcon fontSize="inherit" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              ) : null}
            </section>
            ) : null}
          </section>
        ) : null}
      </section>

      {isCampaignModalOpen ? (
        <Modal
          title="Запланировать кампанию"
          onClose={() => {
            clearCampaignFormResult()
            setIsCampaignModalOpen(false)
          }}
        >
          <div className="admin-grid admin-grid--campaign-create">
            <label className="auth-form__field">
              <span className="auth-form__label">Начало кампании</span>
              <input className="auth-form__input" type="datetime-local" value={campaignStartAt} onChange={(event) => setCampaignStartAt(event.target.value)} />
            </label>
            <label className="auth-form__field">
              <span className="auth-form__label">Окончание кампании</span>
              <input className="auth-form__input" type="datetime-local" value={campaignEndAt} onChange={(event) => setCampaignEndAt(event.target.value)} />
            </label>
            <label className="auth-form__field">
              <span className="auth-form__label">Ссылка для граждан РФ</span>
              <input
                className="auth-form__input"
                type="url"
                placeholder="https://..."
                value={campaignRussianCitizenDocumentFormUrl}
                onChange={(event) =>
                  setCampaignRussianCitizenDocumentFormUrl(event.target.value)
                }
              />
            </label>
            <label className="auth-form__field">
              <span className="auth-form__label">Ссылка для иностранцев</span>
              <input
                className="auth-form__input"
                type="url"
                placeholder="https://..."
                value={campaignForeignCitizenDocumentFormUrl}
                onChange={(event) =>
                  setCampaignForeignCitizenDocumentFormUrl(event.target.value)
                }
              />
            </label>
          </div>

          <div className="admin-actions-row">
            <button className="auth-form__button" type="button" onClick={() => {
              void handleCreateCampaign()
            }} disabled={busyAction === 'campaign-create'}>
              Сохранить
            </button>
          </div>
        </Modal>
      ) : null}

      {editingCampaignId ? (
        <Modal
          title="Изменить кампанию"
          onClose={() => {
            clearCampaignFormResult()
            setEditingCampaignId(null)
          }}
        >
          <div className="admin-grid admin-grid--campaign-create">
            <label className="auth-form__field">
              <span className="auth-form__label">Начало кампании</span>
              <input
                className="auth-form__input"
                type="datetime-local"
                value={campaignEdits[editingCampaignId]?.startsAt ?? ''}
                onChange={(event) =>
                  setCampaignEdit(editingCampaignId, { startsAt: event.target.value })
                }
              />
            </label>
            <label className="auth-form__field">
              <span className="auth-form__label">Окончание кампании</span>
              <input
                className="auth-form__input"
                type="datetime-local"
                value={campaignEdits[editingCampaignId]?.endsAt ?? ''}
                onChange={(event) =>
                  setCampaignEdit(editingCampaignId, { endsAt: event.target.value })
                }
              />
            </label>
            <label className="auth-form__field">
              <span className="auth-form__label">Ссылка для граждан РФ</span>
              <input
                className="auth-form__input"
                type="url"
                placeholder="https://..."
                value={campaignEdits[editingCampaignId]?.russianCitizenDocumentFormUrl ?? ''}
                onChange={(event) =>
                  setCampaignEdit(editingCampaignId, {
                    russianCitizenDocumentFormUrl: event.target.value,
                  })
                }
              />
            </label>
            <label className="auth-form__field">
              <span className="auth-form__label">Ссылка для иностранцев</span>
              <input
                className="auth-form__input"
                type="url"
                placeholder="https://..."
                value={campaignEdits[editingCampaignId]?.foreignCitizenDocumentFormUrl ?? ''}
                onChange={(event) =>
                  setCampaignEdit(editingCampaignId, {
                    foreignCitizenDocumentFormUrl: event.target.value,
                  })
                }
              />
            </label>
          </div>

          <div className="admin-actions-row">
            {editingCampaign && !isCampaignFinished(editingCampaign.endsAt) ? (
              <button
                className="auth-form__button auth-form__button--secondary"
                type="button"
                onClick={() => {
                  void handleToggleCampaignActive(editingCampaign.id)
                  setEditingCampaignId(null)
                }}
              >
                {editingCampaign.isActive ? 'Сделать неактивной' : 'Сделать активной'}
              </button>
            ) : null}
            <button
              className="auth-form__button"
              type="button"
              onClick={() => {
                void handleSaveCampaign(editingCampaignId)
                setEditingCampaignId(null)
              }}
            >
              Сохранить
            </button>
          </div>
        </Modal>
      ) : null}

      {isEmployeeCreateModalOpen ? (
        <Modal title="Создать сотрудника" onClose={() => setIsEmployeeCreateModalOpen(false)}>
          <div className="admin-grid admin-grid--campaign-create">
            <label className="auth-form__field">
              <span className="auth-form__label">Корпоративная почта</span>
              <input
                className="auth-form__input"
                type="email"
                placeholder="name@hse.ru"
                value={employeeCorporateEmail}
                onChange={(event) => setEmployeeCorporateEmail(event.target.value)}
              />
            </label>
            <label className="auth-form__field">
              <span className="auth-form__label">ФИО</span>
              <input
                className="auth-form__input"
                type="text"
                placeholder="Иванов Иван Иванович"
                value={employeeFullName}
                onChange={(event) => setEmployeeFullName(event.target.value)}
              />
            </label>
            <label className="auth-form__field">
              <span className="auth-form__label">Резервная почта</span>
              <input
                className="auth-form__input"
                type="email"
                placeholder="name.backup@example.com"
                value={employeeBackupEmail}
                onChange={(event) => setEmployeeBackupEmail(event.target.value)}
              />
            </label>
          </div>

          <div className="admin-actions-row">
            <button className="auth-form__button" type="button" onClick={() => {
              void handleCreateEmployee()
            }} disabled={busyAction === 'employee-create'}>
              Создать
            </button>
          </div>
        </Modal>
      ) : null}

      {isDisciplineModalOpen ? (
        <Modal
          title={editingDisciplineId ? 'Редактировать дисциплину' : 'Добавить дисциплину'}
          onClose={() => setIsDisciplineModalOpen(false)}
        >
          <div className="admin-grid admin-grid--campaign-card">
            <label className="auth-form__field">
              <span className="auth-form__label">Название</span>
              <input
                className="auth-form__input"
                type="text"
                placeholder="Название дисциплины"
                value={disciplineForm.name}
                onChange={(event) => setDisciplineForm((current) => ({ ...current, name: event.target.value }))}
              />
            </label>

            <label className="auth-form__field">
              <span className="auth-form__label">Программа</span>
              <select
                className="auth-form__input"
                value={disciplineForm.educationalProgramId}
                onChange={(event) =>
                  setDisciplineForm((current) => ({ ...current, educationalProgramId: event.target.value }))
                }
              >
                <option value="">Выберите программу</option>
                {sortedProgramOptions.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="auth-form__field">
              <span className="auth-form__label">Курс</span>
              <input
                className="auth-form__input"
                type="text"
                placeholder="1"
                value={disciplineForm.course}
                onChange={(event) => setDisciplineForm((current) => ({ ...current, course: event.target.value }))}
              />
            </label>

            <label className="auth-form__field">
              <span className="auth-form__label">Модули (через запятую)</span>
              <input
                className="auth-form__input"
                type="text"
                placeholder="1,2,3"
                value={disciplineForm.modules}
                onChange={(event) => setDisciplineForm((current) => ({ ...current, modules: event.target.value }))}
              />
            </label>

            <label className="auth-form__field">
              <span className="auth-form__label">Количество групп</span>
              <input
                className="auth-form__input"
                type="number"
                min={0}
                placeholder="8"
                value={disciplineForm.groupsCount}
                onChange={(event) =>
                  setDisciplineForm((current) => ({ ...current, groupsCount: event.target.value }))
                }
              />
            </label>

            <label className="auth-form__field">
              <span className="auth-form__label">Макс ассистентов</span>
              <input
                className="auth-form__input"
                type="number"
                min={0}
                placeholder="4"
                value={disciplineForm.maxAssistantsCount}
                onChange={(event) =>
                  setDisciplineForm((current) => ({ ...current, maxAssistantsCount: event.target.value }))
                }
              />
            </label>
          </div>

          <div className="admin-actions-row">
            <button className="auth-form__button" type="button" onClick={() => {
              void handleSaveDiscipline()
            }} disabled={busyAction === 'discipline-save'}>
              Сохранить
            </button>
          </div>
        </Modal>
      ) : null}
    </section>
  )

  function navigateAdminSection(section: AdminSection, path: string) {
    setOptimisticSection(section)

    if (section === 'students') {
      void reloadStudents()
    }

    navigateTo(path)
  }
}

function formatDocumentsStartDateForInput(value: string) {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return ''
  }

  const isoMatch = trimmedValue.match(/^(\d{4})-(\d{2})-(\d{2})$/)

  if (!isoMatch) {
    return trimmedValue
  }

  const [, year, month, day] = isoMatch
  return `${day}.${month}.${year}`
}

interface ModalProps {
  children: ReactNode
  onClose: () => void
  title: string
}

function Modal({ children, onClose, title }: ModalProps) {
  return (
    <div className="admin-modal" role="dialog" aria-modal="true" aria-label={title}>
      <div className="admin-modal__backdrop" onClick={onClose} />
      <section className="admin-modal__content">
        <header className="admin-modal__header">
          <h3>{title}</h3>
          <button className="admin-modal__close" type="button" onClick={onClose} aria-label="Закрыть">
            <CloseRoundedIcon fontSize="inherit" />
          </button>
        </header>
        <div className="admin-modal__body">{children}</div>
      </section>
    </div>
  )
}

function StudentsTableSkeleton() {
  return (
    <div className="admin-table-wrap" aria-label="Загрузка списка студентов">
      <table className="admin-table admin-table-skeleton">
        <thead>
          <tr>
            <th>Уровень образования</th>
            <th>Факультет</th>
            <th>ОП</th>
            <th>Курс</th>
            <th>Почта</th>
            <th>ФИО</th>
            <th>Документы</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }).map((_, index) => (
            <tr key={`students-skeleton-${index}`}>
              <td><span className="admin-table-skeleton__line" /></td>
              <td><span className="admin-table-skeleton__line" /></td>
              <td><span className="admin-table-skeleton__line" /></td>
              <td><span className="admin-table-skeleton__line admin-table-skeleton__line--short" /></td>
              <td><span className="admin-table-skeleton__line" /></td>
              <td><span className="admin-table-skeleton__line admin-table-skeleton__line--wide" /></td>
              <td><span className="admin-table-skeleton__line admin-table-skeleton__line--short" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CampaignCardsSkeleton() {
  return (
    <div className="admin-campaigns-list" aria-label="Загрузка кампаний">
      {Array.from({ length: 4 }).map((_, index) => (
        <article
          key={`campaign-skeleton-${index}`}
          className="admin-item-card admin-item-card--compact admin-campaign-row admin-card-skeleton"
        >
          <div className="admin-item-card__header">
            <div className="admin-campaign-row__headline">
              <span className="admin-table-skeleton__line admin-table-skeleton__line--wide" />
              <span className="admin-table-skeleton__line admin-table-skeleton__line--short" />
            </div>
            <div className="admin-campaign-row__actions">
              <span className="admin-card-skeleton__icon" />
              <span className="admin-card-skeleton__icon" />
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

function EmployeesTableSkeleton() {
  return (
    <div className="admin-table-wrap" aria-label="Загрузка списка сотрудников">
      <table className="admin-table admin-table-skeleton">
        <thead>
          <tr>
            <th>ФИО</th>
            <th>Корпоративная почта</th>
            <th>Резервная почта</th>
            <th>Роль</th>
            <th aria-label="Действия" />
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }).map((_, index) => (
            <tr key={`employees-skeleton-${index}`}>
              <td><span className="admin-table-skeleton__line admin-table-skeleton__line--wide" /></td>
              <td><span className="admin-table-skeleton__line" /></td>
              <td><span className="admin-table-skeleton__line" /></td>
              <td><span className="admin-table-skeleton__line admin-table-skeleton__line--short" /></td>
              <td><span className="admin-table-skeleton__line admin-table-skeleton__line--short" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ProgramsTableSkeleton() {
  return (
    <div className="admin-table-wrap" aria-label="Загрузка образовательных программ">
      <table className="admin-table admin-table-skeleton">
        <thead>
          <tr>
            <th>Уровень образования</th>
            <th>Название</th>
            <th>Короткое название</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, index) => (
            <tr key={`programs-skeleton-${index}`}>
              <td><span className="admin-table-skeleton__line admin-table-skeleton__line--short" /></td>
              <td><span className="admin-table-skeleton__line admin-table-skeleton__line--wide" /></td>
              <td><span className="admin-table-skeleton__line" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function DisciplinesTableSkeleton() {
  return (
    <div className="admin-table-wrap" aria-label="Загрузка списка дисциплин">
      <table className="admin-table admin-table-skeleton">
        <thead>
          <tr>
            <th>Уровень образования</th>
            <th>ОП</th>
            <th>Название</th>
            <th>Курс</th>
            <th>Модули</th>
            <th>Групп</th>
            <th>Макс ассистентов</th>
            <th aria-label="Действия" />
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 7 }).map((_, index) => (
            <tr key={`disciplines-skeleton-${index}`}>
              <td><span className="admin-table-skeleton__line admin-table-skeleton__line--short" /></td>
              <td><span className="admin-table-skeleton__line" /></td>
              <td><span className="admin-table-skeleton__line admin-table-skeleton__line--wide" /></td>
              <td><span className="admin-table-skeleton__line admin-table-skeleton__line--short" /></td>
              <td><span className="admin-table-skeleton__line" /></td>
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

function getTitle(section: string) {
  if (section === 'campaigns') return 'Кампании'
  if (section === 'employees') return 'Сотрудники'
  if (section === 'students') return 'Студенты'
  if (section === 'documents') return 'Документы студентов'
  return 'Программы и дисциплины'
}

function getActiveSection(pathname: string) {
  if (pathname === appRoutes.employeeAdminEmployees) return 'employees'
  if (pathname === appRoutes.employeeAdminStudents) return 'students'
  if (pathname === appRoutes.employeeAdminDocuments) return 'documents'
  if (pathname === appRoutes.employeeAdminDisciplines) return 'disciplines'
  return 'campaigns'
}

function formatDateTimeShort(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = String(date.getFullYear()).slice(-2)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${day}.${month}.${year} ${hours}:${minutes}`
}

function isCampaignFinished(endsAt: string) {
  const date = new Date(endsAt)

  if (Number.isNaN(date.getTime())) {
    return false
  }

  return date.getTime() < Date.now()
}

function formatStudentName(student: {
  faculty?: string | null
  isDocumentsUploaded?: boolean
  firstName: string | null
  lastName: string | null
  middleName: string | null
}) {
  return [student.lastName, student.firstName, student.middleName].filter(Boolean).join(' ') || 'Без имени'
}

function getEmployeeRoleLabel(role: string) {
  if (role === 'ADMIN') {
    return 'Администратор'
  }

  if (role === 'EMPLOYEE') {
    return 'Сотрудник'
  }

  return role
}

function preventDefault(event: FormEvent<HTMLFormElement>) {
  event.preventDefault()
}
