import { EmployeeSessionContextForm } from '../components/EmployeeSessionContextForm'
import { appRoutes } from '../routes/appRoutes'
import { navigateTo } from '../utils/navigation'

export function EmployeeSessionContextPage() {
  return (
    <main className="app-shell" data-route={appRoutes.employeeSessionContext}>
      <section className="auth-panel" aria-label="Форма контекста сессии сотрудника">
        <EmployeeSessionContextForm
          onClose={() => navigateTo(appRoutes.employeeStudentApplications)}
          onSubmitted={() => navigateTo(appRoutes.employeeStudentApplications)}
        />
      </section>
    </main>
  )
}
