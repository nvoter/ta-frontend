import { useEffect, useState } from 'react'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import SwapVertOutlinedIcon from '@mui/icons-material/SwapVertOutlined'
import { getApplicationById, updateApplicationDisciplinesPriorities } from '../api/applicationsApi'
import { getDisciplinePresentation } from '../api/lookupsApi'
import { AppNavbar } from './AppNavbar'
import { LoadingIndicator } from './LoadingIndicator'
import { useStudentDashboard } from '../hooks/useStudentDashboard'
import { logoutAndRedirect } from '../utils/logout'
import { navigateTo } from '../utils/navigation'
import { appRoutes } from '../routes/appRoutes'

export function StudentDashboard() {
  const {
    applications,
    campaignError,
    currentCampaignApplicationId,
    error,
    groupedApplications,
    hasApplicationInCurrentCampaign,
    hasActiveCampaign,
    isLoading,
    isReadOnly,
    reloadApplications,
    setSortOrder,
    sortOrder,
    studentName,
  } =
    useStudentDashboard()
  const [priorityModalState, setPriorityModalState] = useState<PriorityModalState>({
    error: '',
    isLoading: false,
    isOpen: false,
    isSaving: false,
    items: [],
  })
  const sortLabel =
    sortOrder === 'priorityAsc'
      ? 'Сначала более приоритетные'
      : 'Сначала менее приоритетные'
  const editableCurrentCampaignDisciplinesCount = applications.filter(
    (application) =>
      application.applicationId === currentCampaignApplicationId &&
      application.status === 'Новая',
  ).length

  async function openPriorityModal() {
    if (!currentCampaignApplicationId) {
      return
    }

    setPriorityModalState({
      error: '',
      isLoading: true,
      isOpen: true,
      isSaving: false,
      items: [],
    })

    try {
      const application = await getApplicationById(currentCampaignApplicationId)
      const disciplines = await Promise.all(
        application.disciplines
          .filter((discipline) => discipline.status !== 'DELETED')
          .map(async (discipline) => {
          const presentation = await getDisciplinePresentation(discipline.disciplineId)

          return {
            applicationDisciplineId: discipline.id,
            disciplineId: discipline.disciplineId,
            label: presentation.disciplineLabel,
            program: presentation.program.name,
            lecturerName: discipline.lecturerName,
            motivation: discipline.motivation,
            priority: discipline.priority,
            seminarianName: discipline.seminarianName,
            status: toStudentStatusLabel(discipline.status),
            studiedDisciplineGrade: discipline.studiedDisciplineGrade,
            studiedDisciplineName: discipline.studiedDisciplineName,
            twoGroups: discipline.twoGroups,
            workType: discipline.workType,
          }
          }),
      )

      setPriorityModalState({
        error: '',
        isLoading: false,
        isOpen: true,
        isSaving: false,
        items: sortPriorityItems(disciplines),
      })
    } catch (loadError) {
      setPriorityModalState({
        error: getErrorMessage(loadError),
        isLoading: false,
        isOpen: true,
        isSaving: false,
        items: [],
      })
    }
  }

  async function savePriorityOrder(items: PriorityModalItem[]) {
    if (!currentCampaignApplicationId) {
      return
    }

    setPriorityModalState((current) => ({
      ...current,
      error: '',
      isSaving: true,
    }))

    try {
      const response = await updateApplicationDisciplinesPriorities({
        applicationId: currentCampaignApplicationId,
        disciplines: items.map((item, index) => ({
          id: item.applicationDisciplineId,
          priority: index + 1,
        })),
      })

      setPriorityModalState((current) => ({
        ...current,
        isOpen: false,
        isSaving: false,
        items: sortPriorityItems(
          response.disciplines.map((item) => ({
            applicationDisciplineId: item.id,
            disciplineId: item.disciplineId,
            label: '',
            lecturerName: item.lecturerName,
            motivation: item.motivation,
            program: '',
            priority: item.priority,
            seminarianName: item.seminarianName,
            status: toStudentStatusLabel(item.status),
            studiedDisciplineGrade: item.studiedDisciplineGrade,
            studiedDisciplineName: item.studiedDisciplineName,
            twoGroups: item.twoGroups,
            workType: item.workType,
          })),
        ),
      }))
      await reloadApplications()
      setPriorityModalState((current) => ({
        ...current,
        isOpen: false,
        isSaving: false,
      }))
    } catch (error) {
      setPriorityModalState((current) => ({
        ...current,
        error: error instanceof Error ? error.message : 'Не удалось сохранить приоритеты',
        isSaving: false,
      }))
    }
  }

  return (
    <section className="dashboard-shell" aria-labelledby="student-dashboard-title">
      <AppNavbar
        tabs={[
          {
            isActive: true,
            label: 'Личный кабинет',
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

      <section className="dashboard-hero">
        <div className="dashboard-hero__copy">
          <h1 id="student-dashboard-title">
            Здравствуйте, {studentName || 'студент'}
          </h1>
          <p>
            Здесь отображены все Ваши заявки на работу учебным ассистентом на
            дисциплинах ФКН
          </p>
        </div>
        {hasActiveCampaign ? (
          <div className="dashboard-hero__actions">
            <button
              className="auth-form__button dashboard-hero__button"
              type="button"
              onClick={() =>
                navigateTo(appRoutes.studentApplicationCreate, {
                  ...(hasApplicationInCurrentCampaign && currentCampaignApplicationId
                    ? { applicationId: currentCampaignApplicationId }
                    : {}),
                })
              }
            >
              {hasApplicationInCurrentCampaign ? 'Редактировать заявку' : 'Новая заявка'}
            </button>
            {hasApplicationInCurrentCampaign && editableCurrentCampaignDisciplinesCount > 1 ? (
              <button
                className="auth-form__button auth-form__button--secondary dashboard-hero__button"
                type="button"
                onClick={() => {
                  void openPriorityModal()
                }}
              >
                Изменить приоритеты
              </button>
            ) : null}
          </div>
        ) : null}
      </section>

      {isReadOnly ? (
        <div className="auth-form__notice auth-form__notice--compact" role="note">
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

      <section className="dashboard-content" aria-label="Список заявок студента">
        <div className="dashboard-content__header">
          <h2 className="dashboard-content__title">Мои заявки</h2>
          {applications.length > 0 ? (
            <button
              className="dashboard-sort-toggle"
              type="button"
              onClick={() =>
                setSortOrder(
                  sortOrder === 'priorityAsc' ? 'priorityDesc' : 'priorityAsc',
                )
              }
              aria-label={`Сортировка: ${sortLabel}`}
            >
              <SwapVertOutlinedIcon fontSize="inherit" />
              <span>{sortLabel}</span>
            </button>
          ) : null}
        </div>

        {isLoading ? (
          <StudentApplicationsSkeleton />
        ) : error ? (
          <div className="auth-form__error-box" role="alert">
            <p className="auth-form__error">{error}</p>
          </div>
        ) : applications.length > 0 ? (
          <div className="student-campaign-groups">
            {groupedApplications.map((group) => (
              <section
                key={group.campaignId}
                className={[
                  'student-campaign-group',
                  group.isCurrent ? 'student-campaign-group--current' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-label={group.title}
              >
                <div className="student-campaign-group__header">
                  <div className="student-campaign-group__heading">
                    <span className="student-campaign-group__eyebrow">{group.caption}</span>
                    <h3>{group.periodLabel ? `Кампания ${group.periodLabel}` : group.title}</h3>
                  </div>
                  <span>{`${group.items.length} ${getApplicationsLabel(group.items.length)}`}</span>
                </div>

                <div className="dashboard-applications">
                  {group.items.map((application) => (
                    <article key={application.id} className="application-card">
                      <div className="application-card__header">
                        <div className="application-card__header-main">
                          <h3>{application.discipline}</h3>
                        </div>
                        <div className="application-card__header-side application-card__header-side--actions">
                          <time dateTime={application.createdAt}>
                            {formatApplicationDate(application.createdAt)}
                          </time>
                        </div>
                      </div>
                      <dl className="application-card__details">
                        <div className="application-card__detail">
                          <dt>ПРИОРИТЕТ</dt>
                          <dd>{application.priority}</dd>
                        </div>
                        <div className="application-card__detail">
                          <dt>ПРОГРАММА</dt>
                          <dd>{application.program}</dd>
                        </div>
                        <div className="application-card__detail">
                          <dt>УСЛОВИЯ РАБОТЫ</dt>
                          <dd>{application.workConditions}</dd>
                        </div>
                        <div className="application-card__detail">
                          <dt>СТАТУС</dt>
                          <dd>
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
                          </dd>
                        </div>
                      </dl>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="dashboard-empty-state">
            <h3>Заявок пока нет</h3>
            <p>
              Когда Вы подадите заявки на работу учебным ассистентом, они отобразятся здесь
            </p>
          </div>
        )}
      </section>

      {priorityModalState.isOpen ? (
        <PriorityModal
          error={priorityModalState.error}
          isLoading={priorityModalState.isLoading}
          isSaving={priorityModalState.isSaving}
          items={priorityModalState.items}
          onClose={() =>
            setPriorityModalState((current) => ({
              ...current,
              isOpen: false,
            }))
          }
          onSave={savePriorityOrder}
        />
      ) : null}
    </section>
  )
}

function getApplicationsLabel(count: number) {
  const mod100 = count % 100
  const mod10 = count % 10

  if (mod100 >= 11 && mod100 <= 14) {
    return 'заявок'
  }

  if (mod10 === 1) {
    return 'заявка'
  }

  if (mod10 >= 2 && mod10 <= 4) {
    return 'заявки'
  }

  return 'заявок'
}

interface PriorityModalItem {
  applicationDisciplineId: string
  disciplineId: string
  label: string
  lecturerName: string
  motivation: string
  program: string
  priority: number
  seminarianName: string
  status: string
  studiedDisciplineGrade: number
  studiedDisciplineName: string
  twoGroups: boolean
  workType: 'FREE' | 'PAID'
}

interface PriorityModalState {
  error: string
  isLoading: boolean
  isOpen: boolean
  isSaving: boolean
  items: PriorityModalItem[]
}

function PriorityModal({
  error,
  isLoading,
  isSaving,
  items,
  onClose,
  onSave,
}: {
  error: string
  isLoading: boolean
  isSaving: boolean
  items: PriorityModalItem[]
  onClose: () => void
  onSave: (items: PriorityModalItem[]) => void
}) {
  const [draggedId, setDraggedId] = useState('')
  const [draftItems, setDraftItems] = useState<PriorityModalItem[]>(items)

  useEffect(() => {
    setDraftItems(items)
  }, [items])

  function moveItem(targetId: string) {
    if (!draggedId || draggedId === targetId) {
      return
    }

    setDraftItems((current) => {
      const draggedItem = current.find((item) => item.applicationDisciplineId === draggedId)
      const targetItem = current.find((item) => item.applicationDisciplineId === targetId)
      const movableItems = current.filter(canReorderPriorityItem)
      const draggedIndex = movableItems.findIndex((item) => item.applicationDisciplineId === draggedId)
      const targetIndex = movableItems.findIndex((item) => item.applicationDisciplineId === targetId)

      if (
        !draggedItem ||
        !targetItem ||
        !canReorderPriorityItem(draggedItem) ||
        !canReorderPriorityItem(targetItem) ||
        draggedIndex === -1 ||
        targetIndex === -1
      ) {
        return current
      }

      const reorderedMovableItems = [...movableItems]
      const [movedItem] = reorderedMovableItems.splice(draggedIndex, 1)
      reorderedMovableItems.splice(targetIndex, 0, movedItem)

      let movableIndex = 0
      return current
        .map((item) =>
          canReorderPriorityItem(item) ? reorderedMovableItems[movableIndex++] : item,
        )
        .map((item, index) => ({
          ...item,
          priority: index + 1,
        }))
    })
  }

  return (
    <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="student-priority-modal-title">
      <button
        type="button"
        className="admin-modal__backdrop"
        onClick={onClose}
        aria-label="Закрыть окно изменения приоритетов"
      />
      <div className="admin-modal__content">
        <div className="admin-modal__header">
          <h3 id="student-priority-modal-title">Изменить приоритеты</h3>
          <button type="button" className="admin-modal__close" onClick={onClose} aria-label="Закрыть окно">
            <CloseRoundedIcon fontSize="inherit" />
          </button>
        </div>
        <div className="admin-modal__body">
          {isLoading ? (
            <div className="dashboard-empty-state">
              <h3>Загружаем дисциплины...</h3>
            </div>
          ) : (
            <div className="application-priority-modal">
              <p className="application-form__notice-text">
                Перетащите дисциплины со статусом «Новая», чтобы изменить порядок приоритетов.
                Заявки с другими статусами остаются на своих местах
              </p>
              {draftItems.length > 0 ? (
                <div className="application-priority-modal__list">
                  {draftItems.map((item) => (
                    <div
                      key={item.applicationDisciplineId}
                      className={[
                        'application-priority-modal__card',
                        canReorderPriorityItem(item)
                          ? ''
                          : 'application-priority-modal__card--locked',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      draggable={!isSaving && canReorderPriorityItem(item)}
                      onDragStart={() => setDraggedId(item.applicationDisciplineId)}
                      onDragOver={(event) => {
                        if (canReorderPriorityItem(item)) {
                          event.preventDefault()
                        }
                      }}
                      onDrop={() => moveItem(item.applicationDisciplineId)}
                      onDragEnd={() => setDraggedId('')}
                    >
                      <span className="application-priority-modal__index">{item.priority}</span>
                      <div className="application-priority-modal__content">
                        <strong>{item.label}</strong>
                        <span>{item.program}</span>
                        <span>{item.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="auth-form__notice auth-form__notice--compact">
                  <p>Заявок для изменения приоритетов сейчас нет</p>
                </div>
              )}
              {error ? (
                <div className="auth-form__error-box" role="alert">
                  <p className="auth-form__error">{error}</p>
                </div>
              ) : null}
              <div className="auth-form__actions auth-form__actions--inline">
                <button
                  className="auth-form__button auth-form__button--secondary"
                  type="button"
                  onClick={onClose}
                  disabled={isSaving}
                >
                  Отмена
                </button>
                <button
                  className="auth-form__button"
                  type="button"
                  onClick={() => onSave(draftItems)}
                  disabled={isSaving || draftItems.length === 0}
                >
                  {isSaving ? <LoadingIndicator /> : 'Сохранить'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function canReorderPriorityItem(item: PriorityModalItem) {
  return item.status === 'Новая'
}

function sortPriorityItems<T extends { priority: number }>(items: T[]) {
  return [...items].sort((left, right) => left.priority - right.priority)
}

function toStudentStatusLabel(status: string) {
  if (status === 'NEW') return 'Новая'
  if (status === 'INTERESTED') return 'Заинтересован'
  if (status === 'AGREED') return 'На согласовании'
  if (status === 'REJECTED') return 'Отклонено'
  if (status === 'DELETED') return 'Удалено'
  return 'Утвержден'
}

function StudentApplicationsSkeleton() {
  return (
    <div className="dashboard-applications" aria-label="Загрузка списка заявок">
      {Array.from({ length: 4 }).map((_, index) => (
        <article key={`student-application-skeleton-${index}`} className="application-card admin-card-skeleton">
          <div className="application-card__header">
            <span className="admin-table-skeleton__line admin-table-skeleton__line--wide" />
            <span className="admin-table-skeleton__line admin-table-skeleton__line--short" />
          </div>
          <div className="application-card__details">
            <span className="admin-table-skeleton__line admin-table-skeleton__line--short" />
            <span className="admin-table-skeleton__line" />
            <span className="admin-table-skeleton__line" />
            <span className="admin-table-skeleton__line admin-table-skeleton__line--short" />
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

  if (status === 'Отклонено' || status === 'Удалено') {
    return 'rejected'
  }

  return 'confirmed'
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Не удалось обновить приоритеты'
}
