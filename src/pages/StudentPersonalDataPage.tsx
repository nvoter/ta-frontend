import { StudentPersonalDataForm } from '../components/StudentPersonalDataForm'
import { appRoutes } from '../routes/appRoutes'

export function StudentPersonalDataPage() {
  return (
    <main className="app-shell" data-route={appRoutes.studentPersonalData}>
      <section
        className="auth-panel auth-panel--wide"
        aria-label="Форма персональных данных студента"
      >
        <StudentPersonalDataForm />
      </section>
    </main>
  )
}
