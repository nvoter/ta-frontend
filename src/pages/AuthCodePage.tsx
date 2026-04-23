import { AuthCodeForm } from '../components/AuthCodeForm'
import { appRoutes } from '../routes/appRoutes'

export function AuthCodePage() {
  return (
    <main className="app-shell" data-route={appRoutes.authCode}>
      <section className="auth-panel" aria-label="Форма ввода кода подтверждения">
        <AuthCodeForm />
      </section>
    </main>
  )
}
