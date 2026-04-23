import { StudentSettings } from '../components/StudentSettings'
import { appRoutes } from '../routes/appRoutes'

export function StudentSettingsPage() {
  return (
    <main className="app-shell" data-route={appRoutes.studentSettings}>
      <section className="dashboard-panel" aria-label="Настройки студента">
        <StudentSettings />
      </section>
    </main>
  )
}
