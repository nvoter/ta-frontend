import { useEffect, useState } from 'react'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import { AppNavbar } from './AppNavbar'
import { EmployeePersonalDataForm } from './EmployeePersonalDataForm'
import {
  getCurrentEmployeeProfile,
  type EmployeeProfileDto,
  updateCurrentEmployeeProfile,
} from '../api/usersApi'
import { appRoutes } from '../routes/appRoutes'
import { getAuthSession } from '../utils/authSessionStorage'
import { logoutAndRedirect } from '../utils/logout'
import { navigateTo } from '../utils/navigation'

export function EmployeeSettings() {
  const isAdmin = getAuthSession()?.userRole === 'ADMIN'
  const [profile, setProfile] = useState<EmployeeProfileDto | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true)
  const [isNotificationsSaving, setIsNotificationsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadProfile() {
      try {
        const nextProfile = await getCurrentEmployeeProfile()

        if (!isMounted) {
          return
        }

        setProfile(nextProfile)
        setEmailNotificationsEnabled(nextProfile.isStatusNotificationEmailEnabled)
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

    void loadProfile()

    return () => {
      isMounted = false
    }
  }, [])

  const handleSaved = async () => {
    setIsEditing(false)

    try {
      const nextProfile = await getCurrentEmployeeProfile()
      setProfile(nextProfile)
      setEmailNotificationsEnabled(nextProfile.isStatusNotificationEmailEnabled)
    } catch (loadError) {
      setError(getErrorMessage(loadError))
    }
  }

  const handleNotificationsToggle = async (nextValue: boolean) => {
    if (!profile) {
      return
    }

    const previousValue = emailNotificationsEnabled

    setEmailNotificationsEnabled(nextValue)
    setIsNotificationsSaving(true)
    setError('')

    try {
      const response = await updateCurrentEmployeeProfile({
        fullName: profile.fullName || '',
        isStatusNotificationEmailEnabled: nextValue,
        phone: profile.phone || '',
        position: profile.position || '',
        workplace: profile.workplace || '',
      })

      setProfile(response)
      setEmailNotificationsEnabled(response.isStatusNotificationEmailEnabled)
    } catch (toggleError) {
      setEmailNotificationsEnabled(previousValue)
      setError(getErrorMessage(toggleError))
    } finally {
      setIsNotificationsSaving(false)
    }
  }

  return (
    <section className="dashboard-shell employee-dashboard settings-page" aria-labelledby="employee-settings-title">
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
                  isActive: false,
                  onClick: () => navigateTo(appRoutes.employeeStatistics),
                },
              ]
            : [
                {
                  isActive: false,
                  label: 'Все заявки',
                  onClick: () => navigateTo(appRoutes.employeeStudentApplications),
                },
                {
                  isActive: false,
                  label: 'Мои заявки',
                  onClick: () => navigateTo(appRoutes.employeeStudentApplicationsMine),
                },
                {
                  isActive: false,
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
            onClick: () => navigateTo(appRoutes.employeeSettings),
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

      <section className="dashboard-hero settings-page__hero">
        <div className="dashboard-hero__copy">
          <h1 id="employee-settings-title">Настройки</h1>
        </div>
      </section>

      <section className="settings-page__sections">
        <section className="dashboard-content settings-page__section" aria-labelledby="employee-profile-settings-title">
          <div className="dashboard-content__header">
            <h2 id="employee-profile-settings-title" className="dashboard-content__title">
              Данные профиля
            </h2>
            {!isEditing && !isLoading ? (
              <button
                className="auth-form__button auth-form__button--secondary"
                type="button"
                onClick={() => setIsEditing(true)}
              >
                Редактировать
              </button>
            ) : null}
          </div>

          {error ? (
            <div className="auth-form__error-box" role="alert">
              <p className="auth-form__error">{error}</p>
            </div>
          ) : null}

          {isLoading ? (
            <div className="auth-form__notice auth-form__notice--compact">
              <p>Загружаем данные профиля...</p>
            </div>
          ) : isEditing ? (
            <EmployeePersonalDataForm
              embedded
              onCancel={() => setIsEditing(false)}
              onSaved={handleSaved}
            />
          ) : profile ? (
            <ProfileSummary
              items={[
                ['Корпоративная почта', profile.email],
                ['ФИО', profile.fullName || 'Не указано'],
                ['Место работы', profile.workplace || 'Не указано'],
                ['Должность', profile.position || 'Не указана'],
                ['Номер телефона', profile.phone || 'Не указан'],
              ]}
            />
          ) : null}
        </section>

        <section className="dashboard-content settings-page__section" aria-labelledby="employee-notifications-settings-title">
          <div className="dashboard-content__header">
            <h2 id="employee-notifications-settings-title" className="dashboard-content__title">
              Уведомления
            </h2>
          </div>

          <label className="settings-toggle" htmlFor="employee-email-notifications">
            <div className="settings-toggle__copy">
              <span className="settings-toggle__title">Email-уведомления</span>
              <p className="settings-toggle__description">
                Отправлять письма с уведомлениями об изменениях статусов заявок на электронную почту
              </p>
            </div>
            <span className="settings-toggle__control">
              <input
                id="employee-email-notifications"
                className="settings-toggle__input"
                type="checkbox"
                checked={emailNotificationsEnabled}
                disabled={isLoading || isEditing || isNotificationsSaving || !profile}
                onChange={(event) => {
                  void handleNotificationsToggle(event.target.checked)
                }}
              />
              <span className="settings-toggle__track" aria-hidden="true">
                <span className="settings-toggle__thumb" />
              </span>
            </span>
          </label>
        </section>
      </section>
    </section>
  )
}

function ProfileSummary({ items }: { items: [string, string][] }) {
  return (
    <dl className="settings-summary">
      {items.map(([label, value]) => (
        <div key={label} className="settings-summary__item">
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Не удалось загрузить данные профиля'
}
