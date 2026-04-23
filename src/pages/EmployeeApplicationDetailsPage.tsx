import { EmployeeApplicationDetails } from '../components/EmployeeApplicationDetails'
import { appRoutes } from '../routes/appRoutes'

export function EmployeeApplicationDetailsPage() {
  return (
    <main className="app-shell" data-route={appRoutes.employeeStudentApplicationDetails}>
      <section className="dashboard-panel" aria-label="Детали заявки студента">
        <EmployeeApplicationDetails />
      </section>
    </main>
  )
}
