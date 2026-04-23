import { useEffect, useState } from 'react'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import { AppNavbar } from './AppNavbar'
import { useCampaignAccess } from '../hooks/useCampaignAccess'
import { getCurrentStudent, type StudentDto } from '../api/usersApi'
import { logoutAndRedirect } from '../utils/logout'
import { navigateTo } from '../utils/navigation'
import { appRoutes } from '../routes/appRoutes'

export function StudentSettings() {
  const [student, setStudent] = useState<StudentDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const { hasActiveCampaign } = useCampaignAccess()

  useEffect(() => {
    let isMounted = true

    async function loadStudent() {
      try {
        const currentStudent = await getCurrentStudent()

        if (!isMounted) {
          return
        }

        setStudent(currentStudent)
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

    void loadStudent()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section className="dashboard-shell settings-page" aria-labelledby="student-settings-title">
      <AppNavbar
        tabs={[
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

      <section className="dashboard-hero settings-page__hero">
        <div className="dashboard-hero__copy">
          <h1 id="student-settings-title">Настройки</h1>
        </div>
      </section>

      <section className="settings-page__sections">
        <section className="dashboard-content settings-page__section" aria-labelledby="student-settings-profile-title">
          <div className="dashboard-content__header">
            <h2 id="student-settings-profile-title" className="dashboard-content__title">
              Данные профиля
            </h2>
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
          ) : student ? (
            <ProfileSummary
              items={[
                ['Почта', student.email],
                ['ФИО', formatStudentName(student)],
                ['Уровень образования', student.educationLevel || 'Не указан'],
                ['Факультет', student.faculty || 'Не указан'],
                ['Образовательная программа', student.educationalProgram || 'Не указана'],
                ['Курс', student.course || 'Не указан'],
                ['Гражданство', student.citizenship || 'Не указано'],
                ['Дата рождения', formatBirthDate(student.birthDate)],
                ['Телефон', student.phone || 'Не указан'],
                ['Telegram', student.telegram || 'Не указан'],
              ]}
            />
          ) : null}
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

function formatStudentName(student: StudentDto) {
  const fullName = [student.lastName, student.firstName, student.middleName]
    .filter(Boolean)
    .join(' ')

  return fullName || 'Не указано'
}

function formatBirthDate(value: string | null) {
  if (!value) {
    return 'Не указана'
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Не удалось загрузить данные студента'
}
