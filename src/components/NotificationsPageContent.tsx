import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import { useEffect, useState } from 'react'
import { AppNavbar } from './AppNavbar'
import { useCampaignAccess } from '../hooks/useCampaignAccess'
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type NotificationDto,
} from '../api/notificationsApi'
import { appRoutes } from '../routes/appRoutes'
import { logoutAndRedirect } from '../utils/logout'
import { navigateTo } from '../utils/navigation'

interface NotificationsPageContentProps {
  principal: 'employee' | 'student'
}

export function NotificationsPageContent({
  principal,
}: NotificationsPageContentProps) {
  const [notifications, setNotifications] = useState<NotificationDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMarkingAll, setIsMarkingAll] = useState(false)
  const [error, setError] = useState('')
  const { hasActiveCampaign } = useCampaignAccess()

  useEffect(() => {
    void loadNotifications()
  }, [])

  async function loadNotifications() {
    try {
      setIsLoading(true)
      setError('')
      setNotifications(sortNotifications(await getNotifications(false)))
    } catch (loadError) {
      setError(getErrorMessage(loadError))
    } finally {
      setIsLoading(false)
    }
  }

  async function handleMarkAllAsRead() {
    try {
      setIsMarkingAll(true)
      setError('')
      await markAllNotificationsAsRead()
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })))
    } catch (loadError) {
      setError(getErrorMessage(loadError))
    } finally {
      setIsMarkingAll(false)
    }
  }

  async function handleMarkAsRead(notificationId: string) {
    try {
      setError('')
      await markNotificationAsRead(notificationId)
      setNotifications((current) =>
        current.map((item) =>
          item.id === notificationId ? { ...item, isRead: true } : item,
        ),
      )
    } catch (loadError) {
      setError(getErrorMessage(loadError))
    }
  }

  const isEmployee = principal === 'employee'

  return (
    <section className="dashboard-shell" aria-labelledby="notifications-page-title">
      <AppNavbar
        leadingAction={{
          icon: <ArrowBackIosNewRoundedIcon fontSize="inherit" />,
          label: 'Назад',
          onClick: () =>
            navigateTo(
              isEmployee ? appRoutes.employeeStudentApplications : appRoutes.studentDashboard,
            ),
        }}
        tabs={
          isEmployee
            ? [
                {
                  isActive: false,
                  label: 'Заявки студентов',
                  onClick: () => navigateTo(appRoutes.employeeStudentApplications),
                },
                {
                  isActive: false,
                  label: 'Мои заявки',
                  onClick: () => navigateTo(appRoutes.employeeStudentApplicationsMine),
                },
              ]
            : [
                {
                  isActive: false,
                  label: 'Личный кабинет',
                  onClick: () => navigateTo(appRoutes.studentDashboard),
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
              ]
        }
        actions={[
          {
            icon: <NotificationsOutlinedIcon fontSize="inherit" />,
            label: 'Уведомления',
            onClick: () =>
              navigateTo(
                isEmployee ? appRoutes.employeeNotifications : appRoutes.studentNotifications,
              ),
          },
          {
            icon: <SettingsOutlinedIcon fontSize="inherit" />,
            label: 'Настройки',
            onClick: () =>
              navigateTo(isEmployee ? appRoutes.employeeSettings : appRoutes.studentSettings),
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

      <section className="dashboard-content" aria-labelledby="notifications-page-title">
        <div className="dashboard-content__header">
          <h1 id="notifications-page-title" className="dashboard-content__title">
            Уведомления
          </h1>
          <button
            className="notifications-popover__mark-all"
            type="button"
            onClick={() => {
              void handleMarkAllAsRead()
            }}
            disabled={isMarkingAll || notifications.length === 0}
          >
            {isMarkingAll ? 'Читаем...' : 'Прочитать все'}
          </button>
        </div>

        {isLoading ? (
          <p className="notifications-popover__empty">Загружаем уведомления...</p>
        ) : error ? (
          <div className="auth-form__error-box" role="alert">
            <p className="auth-form__error">{error}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="dashboard-empty-state">
            <h3>Уведомлений пока нет</h3>
          </div>
        ) : (
          <div className="notifications-page__list">
            {notifications.map((notification) => (
              <article
                key={notification.id}
                className={[
                  'notifications-popover__item',
                  notification.isRead ? 'notifications-popover__item--read' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <div className="notifications-popover__item-copy">
                  <h4>{notification.title}</h4>
                  <p>{notification.message}</p>
                  <time dateTime={notification.createdAt}>
                    {formatNotificationDate(notification.createdAt)}
                  </time>
                </div>
                {!notification.isRead ? (
                  <button
                    className="notifications-popover__read-button"
                    type="button"
                    onClick={() => {
                      void handleMarkAsRead(notification.id)
                    }}
                    aria-label={`Отметить уведомление «${notification.title}» как прочитанное`}
                  >
                    <CheckRoundedIcon fontSize="inherit" />
                  </button>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  )
}

function formatNotificationDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'long',
  }).format(date)
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Не удалось загрузить уведомления'
}

function sortNotifications(values: NotificationDto[]) {
  return [...values].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  )
}
