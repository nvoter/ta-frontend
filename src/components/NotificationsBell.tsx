import { useEffect, useRef, useState } from 'react'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import type { AppNavbarAction } from './AppNavbar'
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type NotificationDto,
} from '../api/notificationsApi'

interface NotificationsBellProps {
  action: AppNavbarAction
}

export function NotificationsBell({ action }: NotificationsBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isMarkingAll, setIsMarkingAll] = useState(false)
  const [notifications, setNotifications] = useState<NotificationDto[]>([])
  const [error, setError] = useState('')
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    void loadNotifications()
  }, [])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const unreadCount = notifications.filter((item) => !item.isRead).length

  const handleToggle = async () => {
    const nextOpen = !isOpen
    setIsOpen(nextOpen)

    if (nextOpen) {
      await loadNotifications()
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
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

  const handleMarkAllAsRead = async () => {
    try {
      setIsMarkingAll(true)
      setError('')
      await markAllNotificationsAsRead()
      setNotifications((current) =>
        current.map((item) => ({
          ...item,
          isRead: true,
        })),
      )
    } catch (loadError) {
      setError(getErrorMessage(loadError))
    } finally {
      setIsMarkingAll(false)
    }
  }

  async function loadNotifications() {
    try {
      setIsLoading(true)
      setError('')
      const nextNotifications = await getNotifications(false)
      setNotifications(sortNotifications(nextNotifications))
    } catch (loadError) {
      setError(getErrorMessage(loadError))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div ref={rootRef} className="app-navbar__notifications">
      <button
        className="app-navbar__icon-button"
        type="button"
        onClick={() => {
          void handleToggle()
        }}
        aria-label={action.label}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        {action.icon}
        {unreadCount > 0 ? (
          <span className="app-navbar__icon-badge" aria-hidden="true">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div
          className="notifications-popover"
          role="dialog"
          aria-label="Уведомления"
        >
          <div className="notifications-popover__header">
            <h3>Уведомления</h3>
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

          <div className="notifications-popover__body">
            {isLoading ? (
              <p className="notifications-popover__empty">Загружаем уведомления...</p>
            ) : error ? (
              <div className="auth-form__error-box" role="alert">
                <p className="auth-form__error">{error}</p>
              </div>
            ) : notifications.length === 0 ? (
              <p className="notifications-popover__empty">Уведомлений пока нет</p>
            ) : (
              notifications.map((notification) => (
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
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
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
