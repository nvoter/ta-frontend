import { EmployeeStudentApplications } from '../components/EmployeeStudentApplications'
import { appRoutes } from '../routes/appRoutes'

export function EmployeeStudentApplicationsPage() {
  return (
    <main className="app-shell" data-route={appRoutes.employeeStudentApplications}>
      <section className="dashboard-panel" aria-label="Заявки студентов для сотрудника">
        <EmployeeStudentApplications />
      </section>
    </main>
  )
}
