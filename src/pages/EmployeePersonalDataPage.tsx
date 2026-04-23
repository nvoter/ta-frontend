import { EmployeePersonalDataForm } from '../components/EmployeePersonalDataForm'
import { appRoutes } from '../routes/appRoutes'

export function EmployeePersonalDataPage() {
  return (
    <main className="app-shell" data-route={appRoutes.employeePersonalData}>
      <section
        className="auth-panel auth-panel--wide"
        aria-label="Форма персональных данных преподавателя"
      >
        <EmployeePersonalDataForm />
      </section>
    </main>
  )
}
