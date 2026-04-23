import { StudentDocuments } from '../components/StudentDocuments'
import { appRoutes } from '../routes/appRoutes'

export function StudentDocumentsPage() {
  return (
    <main className="app-shell" data-route={appRoutes.studentDocuments}>
      <section className="dashboard-panel" aria-label="Документы студента">
        <StudentDocuments />
      </section>
    </main>
  )
}
