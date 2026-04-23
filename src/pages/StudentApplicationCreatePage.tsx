import { StudentApplicationCreateForm } from '../components/StudentApplicationCreateForm'
import { appRoutes } from '../routes/appRoutes'

export function StudentApplicationCreatePage() {
  return (
    <main className="app-shell" data-route={appRoutes.studentApplicationCreate}>
      <section className="dashboard-panel" aria-label="Подача заявки студента">
        <StudentApplicationCreateForm />
      </section>
    </main>
  )
}
