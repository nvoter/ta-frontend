import { EmployeeSettings } from '../components/EmployeeSettings'
import { appRoutes } from '../routes/appRoutes'

export function EmployeeSettingsPage() {
  return (
    <main className="app-shell" data-route={appRoutes.employeeSettings}>
      <section className="dashboard-panel" aria-label="Настройки сотрудника">
        <EmployeeSettings />
      </section>
    </main>
  )
}
