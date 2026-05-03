import { useEffect, useMemo, useRef, useState } from 'react'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import { AppNavbar } from './AppNavbar'
import { getCurrentCampaign, type CampaignDto } from '../api/applicationsApi'
import { useCampaignAccess } from '../hooks/useCampaignAccess'
import { getCurrentStudent, type StudentDto } from '../api/usersApi'
import { logoutAndRedirect } from '../utils/logout'
import { navigateTo } from '../utils/navigation'
import { appRoutes } from '../routes/appRoutes'

export function StudentDocuments() {
  const [student, setStudent] = useState<StudentDto | null>(null)
  const [campaign, setCampaign] = useState<CampaignDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const { hasActiveCampaign } = useCampaignAccess()
  const widgetContainerRef = useRef<HTMLDivElement | null>(null)
  const [widgetHeight, setWidgetHeight] = useState<number | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadStudent() {
      try {
        const [currentStudent, currentCampaign] = await Promise.all([
          getCurrentStudent(),
          getCurrentCampaign(),
        ])

        if (!isMounted) {
          return
        }

        setStudent(currentStudent)
        setCampaign(currentCampaign)
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

  const widgetUrl = useMemo(() => {
    if (!student || !campaign) {
      return null
    }

    return getDocumentsWidgetUrl(student, campaign)
  }, [campaign, student])

  useEffect(() => {
    if (isLoading || !widgetContainerRef.current || !widgetUrl) {
      return
    }

    const container = widgetContainerRef.current
    container.replaceChildren()
    setWidgetHeight(null)

    const script = document.createElement('script')
    script.src = widgetUrl
    script.async = true
    container.append(script)

    let frameId = 0
    let intervalId = 0
    let resizeObserver: ResizeObserver | null = null
    let mutationObserver: MutationObserver | null = null
    const timeoutIds: number[] = []

    const measureHeight = () => {
      const nextHeight = Math.max(
        Math.ceil(container.scrollHeight),
        Math.ceil(container.offsetHeight),
        Math.ceil(container.getBoundingClientRect().height),
        0,
      )

      if (nextHeight > 0) {
        setWidgetHeight(nextHeight)
      }
    }

    const scheduleMeasure = () => {
      window.cancelAnimationFrame(frameId)
      frameId = window.requestAnimationFrame(measureHeight)
    }

    ;[150, 400, 800, 1400, 2200, 3200].forEach((delay) => {
      timeoutIds.push(window.setTimeout(scheduleMeasure, delay))
    })
    intervalId = window.setInterval(scheduleMeasure, 2000)

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(scheduleMeasure)
      resizeObserver.observe(container)
    }

    mutationObserver = new MutationObserver(scheduleMeasure)
    mutationObserver.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    })

    return () => {
      window.cancelAnimationFrame(frameId)
      window.clearInterval(intervalId)
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId))
      resizeObserver?.disconnect()
      mutationObserver?.disconnect()
      container.replaceChildren()
    }
  }, [isLoading, widgetUrl])

  return (
    <section className="dashboard-shell settings-page" aria-label="Документы студента">
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
                  isActive: true,
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

      <section className="settings-page__sections">
        <section className="dashboard-content settings-page__section" aria-labelledby="student-documents-form-title">
          {error ? (
            <div className="auth-form__error-box" role="alert">
              <p className="auth-form__error">{error}</p>
            </div>
          ) : null}

          {student && shouldShowPassportReplacementAlert(student) ? (
            <div className="student-documents-alert" role="alert">
              <p>
                {'\u26A0\uFE0F '}Ваш паспорт подлежит замене. Рекомендуем заменить
                паспорт сразу после дня рождения — не дожидаясь окончания
                90-дневного срока. Без действительного паспорта на момент
                заключения договора ГПХ оплата невозможна
              </p>
            </div>
          ) : null}

          {isLoading ? (
            <div className="auth-form__notice auth-form__notice--compact">
              <p>Загрузка формы документов</p>
            </div>
          ) : student?.isDocumentsUploaded ? (
            <div className="auth-form__notice auth-form__notice--compact" role="status">
              <p>Вы уже предоставили пакет документов</p>
            </div>
          ) : !campaign ? (
            <div className="auth-form__notice auth-form__notice--compact" role="status">
              <p>Сейчас нет активной кампании</p>
            </div>
          ) : !widgetUrl ? (
            <div className="auth-form__notice auth-form__notice--compact" role="status">
              <p>Для текущей кампании ссылка на форму документов пока не настроена</p>
            </div>
          ) : (
            <div
              className="student-documents-frame-wrap"
              style={widgetHeight ? { height: `${widgetHeight}px` } : undefined}
            >
              <div
                ref={widgetContainerRef}
                className="student-documents-widget"
                aria-label="Форма документов студента"
              />
            </div>
          )}
        </section>
      </section>
    </section>
  )
}

function getDocumentsWidgetUrl(student: StudentDto, campaign: CampaignDto) {
  if (isRussianCitizen(student.citizenship)) {
    return normalizeWidgetUrl(campaign.russianCitizenDocumentFormUrl)
  }

  return normalizeWidgetUrl(campaign.foreignCitizenDocumentFormUrl)
}

function normalizeWidgetUrl(value: string | null) {
  const normalized = value?.trim()

  return normalized || null
}

function isRussianCitizen(value: string | null) {
  const normalized = (value || '').trim().toLocaleLowerCase('ru-RU')

  return normalized === 'рф' || normalized === 'россия' || normalized === 'российская федерация'
}

function shouldShowPassportReplacementAlert(student: StudentDto) {
  if (!student.birthDate || !isRussianCitizen(student.citizenship)) {
    return false
  }

  const birthDate = new Date(student.birthDate)

  if (Number.isNaN(birthDate.getTime())) {
    return false
  }

  const currentYear = new Date().getFullYear()
  const ageThisYear = currentYear - birthDate.getFullYear()

  return ageThisYear === 20 || ageThisYear === 45
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Не удалось загрузить данные студента'
}
