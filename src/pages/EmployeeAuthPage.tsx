import { EmployeeAuthForm } from '../components/EmployeeAuthForm'
import { appRoutes } from '../routes/appRoutes'

export function EmployeeAuthPage() {
  return (
    <main className="app-shell" data-route={appRoutes.employeeAuth}>
      <section className="auth-panel" aria-label="Форма входа сотрудника">
        <EmployeeAuthForm />
      </section>
    </main>
  )
}
