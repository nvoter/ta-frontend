import { StudentAuthForm } from '../components/StudentAuthForm'
import { appRoutes } from '../routes/appRoutes'

export function StudentAuthPage() {
  return (
    <main className="app-shell" data-route={appRoutes.studentAuth}>
      <section className="auth-panel" aria-label="Форма входа">
        <StudentAuthForm />
      </section>
    </main>
  )
}
