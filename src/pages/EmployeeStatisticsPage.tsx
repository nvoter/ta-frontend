import { EmployeeStatistics } from '../components/EmployeeStatistics'
import { appRoutes } from '../routes/appRoutes'

export function EmployeeStatisticsPage() {
  return (
    <main className="app-shell" data-route={appRoutes.employeeStatistics}>
      <section className="dashboard-panel" aria-label="Статистика сотрудника">
        <EmployeeStatistics />
      </section>
    </main>
  )
}
