import { StudentDashboard } from '../components/StudentDashboard'
import { appRoutes } from '../routes/appRoutes'

export function StudentDashboardPage() {
  return (
    <main className="app-shell" data-route={appRoutes.studentDashboard}>
      <section className="dashboard-panel" aria-label="Личный кабинет студента">
        <StudentDashboard />
      </section>
    </main>
  )
}
