import { AdminPanel } from '../components/AdminPanel'
import { appRoutes } from '../routes/appRoutes'

export function AdminPanelPage() {
  return (
    <main className="app-shell" data-route={appRoutes.employeeAdmin}>
      <section className="dashboard-panel dashboard-panel--instant" aria-label="Административная панель">
        <AdminPanel />
      </section>
    </main>
  )
}
