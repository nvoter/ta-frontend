import { useEffect, useState } from 'react'
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import { downloadGradebookDocument, openGradebookDocument } from '../api/applicationsApi'
import { AppNavbar } from './AppNavbar'
import { EmployeeSessionContextForm } from './EmployeeSessionContextForm'
import {
  getStatusClassName,
  getStatusLabel,
  useEmployeeApplicationDetails,
} from '../hooks/useEmployeeApplicationDetails'
import { appRoutes } from '../routes/appRoutes'
import { logoutAndRedirect } from '../utils/logout'
import { navigateTo } from '../utils/navigation'
import { LoadingIndicator } from './LoadingIndicator'

export function EmployeeApplicationDetails() {
  const {
    actingAsFullName,
    assignmentDraft,
    availableStatusOptions,
    canManageStatus,
    campaignError,
    closeActingConfirm,
    closeInterestedDialog,
    confirmActingStatusSave,
    details,
    formError,
    hasAssignment,
    hasRelatedDisciplines,
    isActingConfirmOpen,
    isInterestedDialogOpen,
    isLoading,
    isReadOnly,
    isSaving,
    isSavingAssignment,
    loadError,
    moduleRows,
    openInterestedDialog,
    openSessionContextPicker,
    plannedPositionsCount,
    refreshActingContext,
    reopenActingConfirm,
    requestStatusSave,
    saveAssignment,
    selectedModulesCount,
    selectedPositionsCount,
    setAssignmentDraft,
    setModuleField,
    setStatusDraft,
    statusDraft,
    statusLabel,
    validationToast,
    maxPositionsPerModule,
  } = useEmployeeApplicationDetails()
  const [isSessionContextModalOpen, setIsSessionContextModalOpen] = useState(false)
  const [shouldReturnToConfirmModal, setShouldReturnToConfirmModal] = useState(false)

  useEffect(() => {
    function handleOpenSessionContext() {
      setIsSessionContextModalOpen(true)
    }

    window.addEventListener('ta:open-session-context', handleOpenSessionContext)

    return () => {
      window.removeEventListener('ta:open-session-context', handleOpenSessionContext)
    }
  }, [])

  if (isLoading) {
    return (
      <section className="dashboard-shell employee-dashboard">
        <div className="dashboard-empty-state">
          <h3>Загружаем детали заявки...</h3>
        </div>
      </section>
    )
  }

  if (loadError || !details) {
    return (
      <section className="dashboard-shell employee-dashboard">
        <div className="auth-form__error-box" role="alert">
          <p className="auth-form__error">
            {loadError || 'Не удалось получить данные заявки'}
          </p>
        </div>
      </section>
    )
  }

  const { application, applicationDiscipline, relatedDisciplines, workload } = details
  const shouldShowIupWarning = matchesStudentProgramAndCourse(
    application.studentProgram,
    application.studentCourse,
    applicationDiscipline.disciplineProgram,
    applicationDiscipline.disciplineCourse,
  )
  const shouldShowGraduateWarning = isGraduateCourse(application.studentCourse)
  const shouldShowModulePositionsEditor =
    statusDraft === 'INTERESTED' || statusDraft === 'AGREED' || statusDraft === 'APPROVED'
  const visibleWorkload = workload
  const disciplineWorkloadByModule = applicationDiscipline.availableModules.map((module) => ({
    module,
    positionsCount:
      visibleWorkload?.disciplinePerModule.find((item) => item.module === module)
        ?.positionsCount ?? 0,
  }))
  const isDocxGradebook =
    application.gradebook.contentType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    application.gradebook.fileName.toLocaleLowerCase('ru-RU').endsWith('.docx')

  return (
    <section
      className="dashboard-shell employee-dashboard"
      aria-labelledby="employee-application-details-title"
    >
      <AppNavbar
        leadingAction={{
          icon: <ArrowBackIosNewRoundedIcon fontSize="inherit" />,
          label: 'Вернуться к списку заявок',
          onClick: () => {
            if (window.history.length > 1) {
              window.history.back()
              return
            }

            navigateTo(appRoutes.employeeStudentApplications)
          },
        }}
        tabs={[]}
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

      <section className="dashboard-hero employee-details-hero">
        <div className="dashboard-hero__copy">
          <h1 id="employee-application-details-title">Детали заявки</h1>
          <p>
            Заявка от {application.studentName} на дисциплину «
            {applicationDiscipline.disciplineName}»
          </p>
        </div>
      </section>

      <section className="employee-details-layout">
        <div className="employee-details-main">
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

          <section className="employee-details-card" aria-labelledby="student-info-title">
            <div className="employee-details-card__header">
              <h2 id="student-info-title" className="employee-details-card__title">
                Данные студента
              </h2>
            </div>

            <div className="employee-student-overview">
              <dl className="employee-student-overview__column">
                <DefinitionItem label="ФИО" value={application.studentName} wide />
                <DefinitionItem label="Программа" value={application.studentProgram} wide />
                <DefinitionItem
                  label="Курс"
                  value={formatStudentCourse(application.studentCourse)}
                  wide
                />
              </dl>

              <dl className="employee-student-overview__column">
                <DefinitionItem label="Почта" value={application.studentEmail} wide />
                <DefinitionItem label="Телефон" value={application.studentPhoneNumber} wide />
                <DefinitionItem label="Telegram" value={application.studentTelegram} wide />
              </dl>

              <div className="employee-document-field">
                <span className="employee-document-field__label">Зачетная книжка</span>
                <div className="employee-gradebook-file-group">
                  <div className="employee-gradebook-file">
                    <div className="employee-gradebook-file__icon" aria-hidden="true">
                      <DescriptionOutlinedIcon fontSize="inherit" />
                    </div>
                    <div className="employee-gradebook-file__content">
                      <h3>{application.gradebook.fileName}</h3>
                    </div>
                  </div>
                  <div className="employee-gradebook-file__actions">
                    {!isDocxGradebook ? (
                      <button
                        className="auth-form__button auth-form__button--secondary employee-gradebook-file__button"
                        type="button"
                        onClick={() => {
                          void openGradebookDocument({
                            fileName: application.gradebook.fileName,
                            url: application.gradebook.viewUrl,
                          })
                        }}
                      >
                        Просмотреть
                      </button>
                    ) : null}
                    <button
                      className="auth-form__button auth-form__button--secondary employee-gradebook-file__button"
                      type="button"
                      onClick={() => {
                        void downloadGradebookDocument({
                          fileName: application.gradebook.fileName,
                          url: application.gradebook.downloadUrl,
                        })
                      }}
                    >
                      Скачать
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="employee-details-top-grid">
            <section className="employee-details-card" aria-labelledby="discipline-workload-title">
              <div className="employee-details-card__header">
                <h2 id="discipline-workload-title" className="employee-details-card__title">
                  Нагрузка по дисциплине
                </h2>
              </div>

              <div className="employee-workload">
                <div className="employee-workload__summary-grid">
                  <div className="employee-workload__summary-card">
                    <span>Зарезервировано позиций</span>
                    <strong>{applicationDiscipline.disciplineApprovedAssistantsCount}</strong>
                  </div>
                  <div className="employee-workload__summary-card">
                    <span>Максимум позиций</span>
                    <strong>{applicationDiscipline.disciplineMaxAssistantsCount}</strong>
                  </div>
                </div>

                {disciplineWorkloadByModule.length ? (
                  <div className="employee-workload__section">
                    <span className="employee-workload__label">По модулям</span>
                    <div className="employee-workload__list">
                      {disciplineWorkloadByModule.map((item) => (
                        <div key={item.module} className="employee-workload__item">
                          <span>Модуль {item.module}</span>
                          <strong>{item.positionsCount}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </section>

            <section className="employee-details-card" aria-labelledby="student-workload-title">
              <div className="employee-details-card__header">
                <h2 id="student-workload-title" className="employee-details-card__title">
                  Нагрузка студента
                </h2>
              </div>

              <div className="employee-workload">
                <div className="employee-workload__summary-grid">
                  <div className="employee-workload__summary-card">
                    <span>Всего позиций</span>
                    <strong>{visibleWorkload?.totalApprovedPositionsCount ?? 0}</strong>
                  </div>
                  <div className="employee-workload__summary-card">
                    <span>Платных позиций</span>
                    <strong>{visibleWorkload?.totalPaidApprovedPositionsCount ?? 0}</strong>
                  </div>
                  <div className="employee-workload__summary-card">
                    <span>Бесплатных позиций</span>
                    <strong>{visibleWorkload?.totalFreeApprovedPositionsCount ?? 0}</strong>
                  </div>
                </div>

                {visibleWorkload?.perModule?.length ? (
                  <div className="employee-workload__section">
                    <span className="employee-workload__label">По модулям</span>
                    <div className="employee-workload__list">
                      {visibleWorkload.perModule.map((item) => (
                        <div key={item.module} className="employee-workload__item">
                          <span>Модуль {item.module}</span>
                          <strong>{item.positionsCount}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="employee-workload__section">
                    <span className="employee-workload__label">По модулям</span>
                    <div className="employee-workload__list">
                        <div className="employee-workload__item">
                          <span>Модуль 1</span>
                          <strong>0</strong>
                        </div>
                        <div className="employee-workload__item">
                          <span>Модуль 2</span>
                          <strong>0</strong>
                        </div>
                        <div className="employee-workload__item">
                          <span>Модуль 3</span>
                          <strong>0</strong>
                        </div>
                        <div className="employee-workload__item">
                          <span>Модуль 4</span>
                          <strong>0</strong>
                        </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </section>

          {shouldShowIupWarning ? (
            <div className="auth-form__notice auth-form__notice--compact" role="note">
              <p>
                Обратите внимание, что вы ходите привлечь студента на курс, который может
                входить в его ИУП
              </p>
              <p>
                По{' '}
                <a
                  href="https://cs.hse.ru/initiative/assistants?_r=38266081750850243.03456&__t=8373750&__r=OK"
                  target="_blank"
                  rel="noreferrer"
                >
                  правилам проекта
                </a>{' '}
                студент не может одновременно изучать дисциплину, на которой планирует
                ассистировать.
              </p>
              <p>
                Проверьте зачетку студента и, в случае необходимости, свяжитесь с кандидатом и
                убедитесь, что у него уже стоит оценка по данному курсу, в противном случае
                заявка будет аннулирована.
              </p>
            </div>
          ) : null}

          {shouldShowGraduateWarning ? (
            <div className="auth-form__notice auth-form__notice--compact" role="note">
              <p>
                Обратите внимание, что данный кандидат завершает свое обучение в НИУ ВШЭ в
                текущем учебном году. Комиссия сможет рассмотреть данную кандидатуру только в
                том случае, если кандидат решит продолжить свое обучение в магистратуре или
                аспирантуре НИУ ВШЭ. Окончательное решение по утверждению УА будет принято
                только после выхода приказа о зачислении (магистров - в конце августа,
                аспирантов - в ноябре)
              </p>
            </div>
          ) : null}

          <section className="employee-details-card" aria-labelledby="assignment-title">
            <div className="employee-details-card__header">
              <h2 id="assignment-title" className="employee-details-card__title">
                Перечень заданий
              </h2>
            </div>

            {applicationDiscipline.assignment ? (
              <div className="employee-details-note">
                <span className="employee-details-note__label">Установленный перечень</span>
                <p className="employee-details-note__preformatted">
                  {applicationDiscipline.assignment}
                </p>
              </div>
            ) : (
              <>
                <AssignmentEditor
                  assignmentDraft={assignmentDraft}
                  onChange={setAssignmentDraft}
                />
                {formError ? (
                  <div className="auth-form__error-box employee-inline-form__error" role="alert">
                    <p className="auth-form__error">{formError}</p>
                  </div>
                ) : null}
                <div className="employee-inline-form__footer employee-inline-form__footer--single">
                  <button
                    className="auth-form__button"
                    type="button"
                    onClick={() => {
                      void saveAssignment()
                    }}
                    disabled={isSavingAssignment || !hasAnyAssignmentValue(assignmentDraft)}
                  >
                    {isSavingAssignment ? <LoadingIndicator /> : 'Сохранить'}
                  </button>
                </div>
              </>
            )}
          </section>

          <section className="employee-details-card" aria-labelledby="discipline-info-title">
            <div className="employee-details-card__header">
              <h2 id="discipline-info-title" className="employee-details-card__title">
                Информация о заявке
              </h2>
              <time className="employee-details-card__date" dateTime={application.createdAt}>
                {formatDateTime(application.createdAt)}
              </time>
            </div>

            <section className="employee-application-overview">
              <div className="employee-application-overview__column">
                <dl className="employee-details-definition-list employee-details-definition-list--stacked">
                  <DefinitionItem label="Приоритет" value={`${applicationDiscipline.priority}`} wide />
                  <DefinitionItem
                    label="Образовательная программа"
                    value={applicationDiscipline.disciplineProgram}
                    wide
                  />
                  <DefinitionItem
                    label="Дисциплина"
                    value={applicationDiscipline.disciplineName}
                    wide
                  />
                </dl>

                <div className="employee-details-status-field">
                  <span className="employee-details-status-field__label">Статус</span>
                  <div className="employee-details-status-field__value">
                    <span
                      className={[
                        'application-card__status',
                        'employee-details-card__status',
                        `application-card__status--${getStatusClassName(
                          applicationDiscipline.status,
                        )}`,
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {statusLabel}
                    </span>
                  </div>
                  {applicationDiscipline.status !== 'NEW' ? (
                    <p className="employee-details-card__updated">
                      Обновлен: {formatDateTime(applicationDiscipline.updatedAt)}
                    </p>
                  ) : null}
                  {applicationDiscipline.status !== 'NEW' ? (
                    <div className="employee-details-card__updated-group">
                      <p className="employee-details-card__updated">
                        Сотрудник:{' '}
                        {applicationDiscipline.updatedByEmployeeName || 'Нет данных'}
                      </p>
                      {applicationDiscipline.updatedForEmployeeName ? (
                        <p className="employee-details-card__updated">
                          От имени: {applicationDiscipline.updatedForEmployeeName}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="employee-application-overview__column employee-application-overview__column--between">
                <dl className="employee-details-definition-list employee-details-definition-list--stacked">
                  <DefinitionItem
                    label="Тип оказания услуг"
                    value={
                      applicationDiscipline.workType === 'FREE'
                        ? 'Безвозмездно'
                        : 'Платно'
                    }
                    wide
                  />
                  <DefinitionItem
                    label="Готовность работать в двух группах"
                    value={applicationDiscipline.twoGroups ? 'Да' : 'Нет'}
                    wide
                  />
                </dl>

                <div className="employee-details-note employee-details-note--motivation">
                  <span className="employee-details-note__label">Мотивация</span>
                  <p>{applicationDiscipline.motivation}</p>
                </div>
              </div>

              <div className="employee-application-overview__column employee-application-overview__column--history">
                <dl className="employee-details-definition-list employee-details-definition-list--stacked">
                  <DefinitionItem
                    label="Название ранее изученной дисциплины"
                    value={applicationDiscipline.studiedDisciplineName}
                    wide
                  />
                  <DefinitionItem
                    label="Оценка"
                    value={`${applicationDiscipline.studiedDisciplineGrade}`}
                    wide
                  />
                  <DefinitionItem label="Лектор" value={applicationDiscipline.lecturerName} wide />
                  <DefinitionItem
                    label="Семинарист"
                    value={applicationDiscipline.seminarianName}
                    wide
                  />
                </dl>
              </div>
            </section>

            {applicationDiscipline.status !== 'NEW' && !isInterestedDialogOpen ? (
              <section className="employee-inline-form employee-inline-form--readonly">
                <div className="employee-inline-form__header">
                  <div className="employee-inline-form__heading">
                    <h3>Резервирование студента</h3>
                    <p>Сохранённое распределение позиций по модулям</p>
                  </div>
                  <div className="employee-inline-form__summary" aria-label="Сводка по плану привлечения">
                    <div className="employee-inline-form__summary-item">
                      <span>ВЫБРАНО МОДУЛЕЙ</span>
                      <strong>{applicationDiscipline.approvedModules.length}</strong>
                    </div>
                    <div className="employee-inline-form__summary-item">
                      <span>ВСЕГО ПОЗИЦИЙ</span>
                      <strong>{plannedPositionsCount}</strong>
                    </div>
                  </div>
                </div>
                {applicationDiscipline.approvedModules.length > 0 ? (
                  <div className="employee-inline-form__body">
                    {applicationDiscipline.approvedModules.map((item) => (
                      <div key={item.module} className="employee-workload__item employee-dialog__row">
                        <div className="employee-dialog__module-label">
                          <span className="employee-dialog__module-label-title">
                            {`Модуль ${item.module}`}
                          </span>
                        </div>
                        <div className="employee-dialog__value">{item.positionsCount}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="employee-details-note__summary">Позиции по модулям пока не указаны</p>
                )}
              </section>
            ) : null}

            {!hasAssignment ? (
              <div className="auth-form__notice auth-form__notice--compact" role="note">
                <p>
                  Для изменения статуса заявки необходимо установить перечень работ
                  учебного ассистента
                </p>
              </div>
            ) : null}

            {canManageStatus && hasAssignment ? (
              <div className="employee-details-inline-actions employee-details-inline-actions--embedded">
                {isInterestedDialogOpen ? (
                  <section className="employee-inline-form" aria-labelledby="status-editor-title">
                    {validationToast ? (
                      <div className="employee-inline-form__toast" role="alert">
                        <p>{validationToast}</p>
                      </div>
                    ) : null}

                    <div className="employee-inline-form__header">
                      <div className="employee-inline-form__heading">
                        <h3 id="status-editor-title">Изменение статуса заявки</h3>
                        <p>
                          {shouldShowModulePositionsEditor
                            ? 'Выберите модули и количество позиций, на которые планируется привлечение учебного ассистента'
                            : 'Выберите новое значение статуса заявки'}
                        </p>
                      </div>
                      {shouldShowModulePositionsEditor ? (
                        <div className="employee-inline-form__summary">
                          <div className="employee-inline-form__summary-item">
                            <span>ВЫБРАНО МОДУЛЕЙ</span>
                            <strong>{selectedModulesCount}</strong>
                          </div>
                          <div className="employee-inline-form__summary-item">
                            <span>ВСЕГО ПОЗИЦИЙ</span>
                            <strong>{selectedPositionsCount}</strong>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="employee-inline-form__body">
                      <label className="auth-form__field">
                        <span className="auth-form__label">Статус</span>
                        <select
                          className="auth-form__input"
                          value={statusDraft}
                          onChange={(event) =>
                            setStatusDraft(
                              event.target.value as
                                | 'NEW'
                                | 'INTERESTED'
                                | 'AGREED'
                                | 'APPROVED'
                                | 'REJECTED'
                                | 'DELETED',
                            )
                          }
                        >
                          {availableStatusOptions.map((option) => (
                            <option key={option} value={option}>
                              {getStatusLabel(option)}
                            </option>
                          ))}
                        </select>
                      </label>

                      {shouldShowModulePositionsEditor
                        ? moduleRows.map((row) => (
                            <div key={row.id} className="employee-workload__item employee-dialog__row">
                              <div className="employee-dialog__module-label">
                                <span className="employee-dialog__module-label-title">
                                  {`Модуль ${row.module}`}
                                </span>
                              </div>

                              <label className="auth-form__field employee-dialog__field">
                                <input
                                  className="auth-form__input employee-dialog__positions-input"
                                  type="number"
                                  min="0"
                                  max={maxPositionsPerModule ?? undefined}
                                  inputMode="numeric"
                                  value={row.positionsCount}
                                  onChange={(event) =>
                                    setModuleField(row.id, 'positionsCount', event.target.value)
                                  }
                                />
                              </label>
                            </div>
                          ))
                        : null}

                      {formError ? (
                        <div className="auth-form__error-box employee-inline-form__error" role="alert">
                          <p className="auth-form__error">{formError}</p>
                        </div>
                      ) : null}
                    </div>

                    <div className="employee-inline-form__footer">
                      <button
                        className="auth-form__button auth-form__button--secondary"
                        type="button"
                        onClick={closeInterestedDialog}
                      >
                        Отмена
                      </button>
                      <button
                        className="auth-form__button"
                        type="button"
                        onClick={() => {
                          void requestStatusSave()
                        }}
                        disabled={isSaving}
                      >
                        {isSaving ? <LoadingIndicator /> : 'Сохранить'}
                      </button>
                    </div>
                  </section>
                ) : (
                  <button
                    className="auth-form__button employee-status-panel__button"
                    type="button"
                    onClick={openInterestedDialog}
                  >
                    Изменить статус
                  </button>
                )}
              </div>
            ) : null}
          </section>

          {hasRelatedDisciplines ? (
            <section className="employee-details-card" aria-labelledby="related-disciplines-title">
              <div className="employee-details-card__header">
                <h2 id="related-disciplines-title" className="employee-details-card__title">
                  Другие заявки студента
                </h2>
              </div>

              <div className="employee-related-list">
                <div className="auth-form__notice auth-form__notice--compact">
                  <p>
                    Обратите, пожалуйста, внимание на другие заявки студента и их текущий статус<br></br>
                    
                    Если студента уже забронировали на максимальное количество позиций / групп (2),
                    рассмотрите иные варианты или обратитесь на почту комиссии obkom.cs@hse.ru для
                    урегулирования конфликта интересов<br></br>
                    
                    Согласно правилам проекта, работа ассистента более чем на двух позициях (группах) одновременно 
                    с оплатой за каждую из них не допускается. Т.е. ассистент может работать максимум на 2-х оплачиваемых 
                    позициях (группах) в модуле
                  </p>
                </div>
                {relatedDisciplines.currentCampaign.map((discipline) => (
                  <article key={discipline.applicationDisciplineId} className="employee-related-card">
                    <div className="employee-related-card__topline">
                      <span className="employee-related-card__priority">
                        Приоритет {discipline.priority}
                      </span>
                      <span
                        className={[
                          'application-card__status',
                          `application-card__status--${getStatusClassName(discipline.status)}`,
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {getStatusLabel(discipline.status)}
                      </span>
                    </div>
                    <h3>{discipline.disciplineName ?? 'Дисциплина не указана'}</h3>
                    <p>{discipline.disciplineProgram ?? 'Программа не указана'}</p>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </section>

      {isActingConfirmOpen ? (
        <ConfirmModal
          description={`Изменение статуса будет выполнено от имени преподавателя ${actingAsFullName}`}
          title="Подтверждение действия"
          onClose={closeActingConfirm}
          onConfirm={() => {
            void confirmActingStatusSave()
          }}
          onSwitch={() => {
            setShouldReturnToConfirmModal(true)
            closeActingConfirm()
            openSessionContextPicker()
          }}
        />
      ) : null}

      {isSessionContextModalOpen ? (
        <ModalShell
          title="Контекст сессии сотрудника"
          onClose={() => {
            setShouldReturnToConfirmModal(false)
            setIsSessionContextModalOpen(false)
          }}
        >
          <EmployeeSessionContextForm
            embedded
            onClose={() => {
              setShouldReturnToConfirmModal(false)
              setIsSessionContextModalOpen(false)
            }}
            onSubmitted={() => {
              setIsSessionContextModalOpen(false)
              void refreshActingContext().then(() => {
                if (shouldReturnToConfirmModal) {
                  reopenActingConfirm()
                  setShouldReturnToConfirmModal(false)
                }
              })
            }}
          />
        </ModalShell>
      ) : null}
    </section>
  )
}

function formatStudentCourse(course: string) {
  if (isGraduateCourse(course) || course === 'Не указан') {
    return course
  }

  return `${course} курс`
}

function isGraduateCourse(course: string) {
  return course.trim().toLocaleLowerCase('ru-RU') === 'выпускник'
}

function normalizeComparableValue(value: string) {
  return value.trim().toLocaleLowerCase('ru-RU')
}

function matchesStudentProgramAndCourse(
  studentProgram: string,
  studentCourse: string,
  disciplineProgram: string,
  disciplineCourse: string,
) {
  return (
    normalizeComparableValue(studentProgram) === normalizeComparableValue(disciplineProgram) &&
    normalizeComparableValue(studentCourse) === normalizeComparableValue(disciplineCourse)
  )
}

function ModalShell({
  children,
  title,
  onClose,
}: {
  children: React.ReactNode
  title: string
  onClose: () => void
}) {
  return (
    <div className="admin-modal" role="dialog" aria-modal="true">
      <button type="button" className="admin-modal__backdrop" onClick={onClose} aria-label="Закрыть окно" />
      <div className="admin-modal__content">
        <div className="admin-modal__header">
          <h3>{title}</h3>
          <button type="button" className="admin-modal__close" onClick={onClose} aria-label="Закрыть окно">
            <CloseRoundedIcon fontSize="inherit" />
          </button>
        </div>
        <div className="admin-modal__body">{children}</div>
      </div>
    </div>
  )
}

function ConfirmModal({
  description,
  title,
  onClose,
  onConfirm,
  onSwitch,
}: {
  description: string
  title: string
  onClose: () => void
  onConfirm: () => void
  onSwitch: () => void
}) {
  return (
    <ModalShell title={title} onClose={onClose}>
      <p className="auth-card__description">{description}</p>
      <div className="auth-form__actions auth-form__actions--inline">
        <button className="auth-form__button" type="button" onClick={onConfirm}>
          Подтвердить
        </button>
        <button className="auth-form__button auth-form__button--secondary" type="button" onClick={onSwitch}>
          Сменить
        </button>
      </div>
    </ModalShell>
  )
}

function AssignmentEditor({
  assignmentDraft,
  onChange,
}: {
  assignmentDraft: string
  onChange: (value: string) => void
}) {
  const [fields, setFields] = useState(() => parseAssignment(assignmentDraft))

  useEffect(() => {
    setFields(parseAssignment(assignmentDraft))
  }, [assignmentDraft])

  function updateFields(patch: Partial<ReturnType<typeof parseAssignment>>) {
    setFields((current) => {
      const nextFields = {
        ...current,
        ...patch,
      }

      onChange(buildAssignment(nextFields))
      return nextFields
    })
  }

  return (
    <div className="profile-form__grid">
      <label className="auth-form__field">
        <span className="auth-form__label">Помощь в проведении занятий</span>
        <input className="auth-form__input" type="number" min="0" placeholder="Введите количество занятий" value={fields.classesCount} onChange={(event) => updateFields({ classesCount: event.target.value })} />
      </label>
      <label className="auth-form__field">
        <span className="auth-form__label">Консультирование студентов</span>
        <input className="auth-form__input" type="number" min="0" placeholder="Введите количество консультаций" value={fields.consultationsCount} onChange={(event) => updateFields({ consultationsCount: event.target.value })} />
      </label>
      <label className="auth-form__field">
        <span className="auth-form__label">Проверка работ</span>
        <input className="auth-form__input" type="number" min="0" placeholder="Введите количество работ" value={fields.workChecksCount} onChange={(event) => updateFields({ workChecksCount: event.target.value })} />
      </label>
      <label className="auth-form__field">
        <span className="auth-form__label">Помощь в организации и проведении элементов контроля</span>
        <input className="auth-form__input" type="number" min="0" placeholder="Введите количество элементов контроля" value={fields.controlElementsCount} onChange={(event) => updateFields({ controlElementsCount: event.target.value })} />
      </label>
      <label className="auth-form__field auth-form__field--wide">
        <span className="auth-form__label">Разработка дидактических материалов</span>
        <div className="employee-assignment-grid">
          <input className="auth-form__input" type="text" placeholder="Наименование" value={fields.didacticName} onChange={(event) => updateFields({ didacticName: event.target.value })} />
          <input className="auth-form__input" type="number" min="0" placeholder="Количество" value={fields.didacticCount} onChange={(event) => updateFields({ didacticCount: event.target.value })} />
        </div>
      </label>
      <label className="auth-form__field auth-form__field--wide">
        <span className="auth-form__label">Другие виды работ</span>
        <textarea className="auth-form__input auth-form__textarea" placeholder="Опишите дополнительные виды работ" value={fields.otherWorks} onChange={(event) => updateFields({ otherWorks: event.target.value })} />
      </label>
      <div className="checkbox-field auth-form__field--wide">
        <label className="checkbox-field__label">
          <input checked={fields.gradebookHelp} className="checkbox-field__input" type="checkbox" onChange={(event) => updateFields({ gradebookHelp: event.target.checked })} />
          <span className="checkbox-field__box" aria-hidden="true" />
          <span className="checkbox-field__text">Помощь в ведении ведомости</span>
        </label>
      </div>
    </div>
  )
}

interface DefinitionItemProps {
  label: string
  value: string
  wide?: boolean
}

function DefinitionItem({ label, value, wide = false }: DefinitionItemProps) {
  return (
    <div
      className={[
        'employee-details-definition-list__item',
        wide ? 'employee-details-definition-list__item--wide' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}

function parseAssignment(value: string) {
  const normalized = value
    .split(';\n')
    .filter((item) => item.trim().length > 0)
  const didacticLine = normalized.find((line) =>
    /^Разработка дидактических материалов\s*[–-]\s*/.test(line),
  )
  const didacticMatch = didacticLine?.match(
    /^Разработка дидактических материалов\s*[–-]\s*(.*?)(?:,\s*(\d+)\s*шт\.)?$/,
  )

  return {
    classesCount: matchNumber(normalized, /^Помощь в проведении занятий\s*[–-]\s*(\d+)/),
    consultationsCount: matchNumber(normalized, /^Консультирование студентов\s*[–-]\s*(\d+)/),
    controlElementsCount: matchNumber(normalized, /^Помощь в организации и проведении элементов контроля\s*[–-]\s*(\d+)/),
    didacticCount: didacticMatch?.[2] ?? '',
    didacticName:
      didacticMatch?.[1]?.trim().replace(/,\s*$/, '') ?? '',
    gradebookHelp: normalized.includes('Помощь в ведении ведомости'),
    otherWorks: matchText(normalized, /^Другие виды работ\s*[–-]\s*([\s\S]*)$/),
    workChecksCount: matchNumber(normalized, /^Проверка работ\s*[–-]\s*(\d+)/),
  }
}

function buildAssignment(fields: ReturnType<typeof parseAssignment>) {
  return [
    formatAssignmentLine('Помощь в проведении занятий', fields.classesCount, 'занятий'),
    formatAssignmentLine('Проверка работ', fields.workChecksCount, 'шт.'),
    formatAssignmentLine('Помощь в организации и проведении элементов контроля', fields.controlElementsCount, 'шт.'),
    fields.didacticName.trim() || fields.didacticCount.trim()
      ? `Разработка дидактических материалов – ${fields.didacticName}${fields.didacticName.trim() && fields.didacticCount.trim() ? ', ' : ''}${fields.didacticCount.trim() ? `${fields.didacticCount.trim()} шт.` : ''}`
      : '',
    formatAssignmentLine('Консультирование студентов', fields.consultationsCount, 'консультаций'),
    fields.gradebookHelp ? 'Помощь в ведении ведомости' : '',
    fields.otherWorks ? `Другие виды работ – ${fields.otherWorks}` : '',
  ]
    .filter(Boolean)
    .join(';\n')
}

function hasAnyAssignmentValue(value: string) {
  return value
    .split(';\n')
    .some((item) => item.trim().length > 0)
}

function formatAssignmentLine(title: string, value: string, suffix: string) {
  if (!value.trim()) {
    return ''
  }

  return `${title} – ${value.trim()} ${suffix}`
}

function matchNumber(lines: string[], pattern: RegExp) {
  const matched = lines.find((line) => pattern.test(line))
  return matched ? matched.match(pattern)?.[1] ?? '' : ''
}

function matchText(lines: string[], pattern: RegExp) {
  const matched = lines.find((line) => pattern.test(line))
  return matched ? matched.match(pattern)?.[1] ?? '' : ''
}
