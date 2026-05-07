import { StudentDisciplines } from '../components/StudentDisciplines'
import { appRoutes } from '../routes/appRoutes'

export function StudentDisciplinesPage() {
  return (
    <main className="app-shell" data-route={appRoutes.studentDisciplines}>
      <section className="dashboard-panel" aria-label="Дисциплины ФКН">
        <StudentDisciplines />
      </section>
    </main>
  )
}
