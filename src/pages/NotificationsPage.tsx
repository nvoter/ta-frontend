import { NotificationsPageContent } from '../components/NotificationsPageContent'

interface NotificationsPageProps {
  principal: 'employee' | 'student'
}

export function NotificationsPage({ principal }: NotificationsPageProps) {
  return (
    <main className="app-shell">
      <div className="dashboard-panel">
        <NotificationsPageContent principal={principal} />
      </div>
    </main>
  )
}
