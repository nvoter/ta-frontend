import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { NotificationsBell } from './NotificationsBell'
import { appRoutes } from '../routes/appRoutes'
import { getAuthSession } from '../utils/authSessionStorage'
import { navigateTo } from '../utils/navigation'

export interface AppNavbarLeadingAction {
  icon: ReactNode
  label: string
  onClick?: () => void
}

export interface AppNavbarTab {
  isActive?: boolean
  label: string
  onClick?: () => void
}

export interface AppNavbarAction {
  icon: ReactNode
  label: string
  onClick?: () => void
}

interface AppNavbarProps {
  actions: AppNavbarAction[]
  leadingAction?: AppNavbarLeadingAction
  tabs: AppNavbarTab[]
}

export function AppNavbar({ actions, leadingAction, tabs }: AppNavbarProps) {
  const session = getAuthSession()
  const currentPathname = window.location.pathname
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCompact, setIsCompact] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 1160 : false,
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1160px)')

    const syncIsCompact = () => {
      setIsCompact(mediaQuery.matches)
    }

    syncIsCompact()
    mediaQuery.addEventListener('change', syncIsCompact)

    return () => {
      mediaQuery.removeEventListener('change', syncIsCompact)
    }
  }, [])

  useEffect(() => {
    if (!isCompact) {
      setIsMobileMenuOpen(false)
    }
  }, [isCompact])

  const renderAction = (action: AppNavbarAction, mobile = false) => {
    const resolvedOnClick =
      action.label === 'Уведомления' && mobile
        ? () =>
            navigateTo(
              session?.principalType === 'EMPLOYEE' || currentPathname.startsWith('/employee')
                ? appRoutes.employeeNotifications
                : appRoutes.studentNotifications,
            )
        : action.label === 'Настройки' && !action.onClick
        ? () =>
            navigateTo(
              session?.principalType === 'EMPLOYEE' || currentPathname.startsWith('/employee')
                ? appRoutes.employeeSettings
                : appRoutes.studentSettings,
            )
        : action.onClick

    if (action.label === 'Уведомления' && !mobile) {
      return <NotificationsBell key={action.label} action={action} />
    }

    return (
      <button
        key={action.label}
        className={mobile ? 'app-navbar__menu-link' : 'app-navbar__icon-button'}
        type="button"
        onClick={() => {
          resolvedOnClick?.()
          if (mobile) {
            setIsMobileMenuOpen(false)
          }
        }}
        aria-label={action.label}
      >
        {mobile ? action.label : action.icon}
      </button>
    )
  }

  return (
    <header className="app-navbar">
      <div className="app-navbar__main">
        {leadingAction ? (
          <button
            className="app-navbar__icon-button app-navbar__icon-button--leading"
            type="button"
            onClick={leadingAction.onClick}
            aria-label={leadingAction.label}
          >
            {leadingAction.icon}
          </button>
        ) : null}

        {!isCompact && tabs.length > 0 ? (
          <nav className="app-navbar__tabs" aria-label="Основная навигация">
            {tabs.map((tab) => (
              <button
                key={tab.label}
                className={[
                  'app-navbar__tab',
                  tab.isActive ? 'app-navbar__tab--active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                type="button"
                onClick={tab.onClick}
                aria-current={tab.isActive ? 'page' : undefined}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        ) : null}
      </div>

      <div className="app-navbar__actions" aria-label="Действия пользователя">
        {isCompact ? (
          <button
            className="app-navbar__icon-button"
            type="button"
            onClick={() => setIsMobileMenuOpen((current) => !current)}
            aria-label={isMobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="app-navbar-mobile-menu"
          >
            {isMobileMenuOpen ? (
              <CloseRoundedIcon fontSize="inherit" />
            ) : (
              <MenuRoundedIcon fontSize="inherit" />
            )}
          </button>
        ) : (
          actions.map((action) => renderAction(action))
        )}
      </div>

      {isCompact && isMobileMenuOpen ? (
        <div id="app-navbar-mobile-menu" className="app-navbar__mobile-menu">
          {tabs.length > 0 ? (
            <nav className="app-navbar__mobile-section" aria-label="Основная навигация">
              {tabs.map((tab) => (
                <button
                  key={tab.label}
                  className={[
                    'app-navbar__menu-link',
                    tab.isActive ? 'app-navbar__menu-link--active' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  type="button"
                  onClick={() => {
                    tab.onClick?.()
                    setIsMobileMenuOpen(false)
                  }}
                  aria-current={tab.isActive ? 'page' : undefined}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          ) : null}

          <div className="app-navbar__mobile-section" aria-label="Действия пользователя">
            {actions.map((action) => renderAction(action, true))}
          </div>
        </div>
      ) : null}
    </header>
  )
}
