import { useSyncExternalStore } from 'react'
import './App.css'
import { AdminPanelPage } from './pages/AdminPanelPage'
import { AuthCodePage } from './pages/AuthCodePage'
import { EmployeeApplicationDetailsPage } from './pages/EmployeeApplicationDetailsPage'
import { EmployeeAuthPage } from './pages/EmployeeAuthPage'
import { EmployeePersonalDataPage } from './pages/EmployeePersonalDataPage'
import { EmployeeSettingsPage } from './pages/EmployeeSettingsPage'
import { EmployeeSessionContextPage } from './pages/EmployeeSessionContextPage'
import { EmployeeStatisticsPage } from './pages/EmployeeStatisticsPage'
import { EmployeeStudentApplicationsPage } from './pages/EmployeeStudentApplicationsPage'
import { StudentApplicationCreatePage } from './pages/StudentApplicationCreatePage'
import { StudentDashboardPage } from './pages/StudentDashboardPage'
import { StudentDocumentsPage } from './pages/StudentDocumentsPage'
import { StudentPersonalDataPage } from './pages/StudentPersonalDataPage'
import { StudentSettingsPage } from './pages/StudentSettingsPage'
import { StudentAuthPage } from './pages/StudentAuthPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { appRoutes } from './routes/appRoutes'
import { getAuthSession } from './utils/authSessionStorage'

function App() {
  const pathname = useSyncExternalStore(
    subscribeToLocation,
    getLocationPathname,
    getLocationPathname,
  )

  if (
    pathname !== appRoutes.studentAuth &&
    pathname !== appRoutes.employeeAuth &&
    pathname !== appRoutes.employeeNotifications &&
    pathname !== appRoutes.employeeAdmin &&
    pathname !== appRoutes.employeeAdminCampaigns &&
    pathname !== appRoutes.employeeAdminEmployees &&
    pathname !== appRoutes.employeeAdminStudents &&
    pathname !== appRoutes.employeeAdminDocuments &&
    pathname !== appRoutes.employeeAdminDisciplines &&
    pathname !== appRoutes.employeeSessionContext &&
    pathname !== appRoutes.employeePersonalData &&
    pathname !== appRoutes.employeeSettings &&
    pathname !== appRoutes.employeeStatistics &&
    pathname !== appRoutes.employeeStudentApplicationDetails &&
    pathname !== appRoutes.employeeStudentApplications &&
    pathname !== appRoutes.employeeStudentApplicationsMine &&
    pathname !== appRoutes.authCode &&
    pathname !== appRoutes.studentApplicationCreate &&
    pathname !== appRoutes.studentDashboard &&
    pathname !== appRoutes.studentDocuments &&
    pathname !== appRoutes.studentNotifications &&
    pathname !== appRoutes.studentPersonalData &&
    pathname !== appRoutes.studentSettings
  ) {
    window.history.replaceState({}, '', appRoutes.studentAuth)
  }

  const isAdminPath =
    pathname === appRoutes.employeeAdmin ||
    pathname === appRoutes.employeeAdminCampaigns ||
    pathname === appRoutes.employeeAdminEmployees ||
    pathname === appRoutes.employeeAdminStudents ||
    pathname === appRoutes.employeeAdminDocuments ||
    pathname === appRoutes.employeeAdminDisciplines

  if (isAdminPath && !getIsAdminSession()) {
    const session = getAuthSession()
    const fallbackPath =
      session?.principalType === 'EMPLOYEE'
        ? appRoutes.employeeStudentApplications
        : appRoutes.employeeAuth

    window.history.replaceState({}, '', fallbackPath)

    if (fallbackPath === appRoutes.employeeStudentApplications) {
      return <EmployeeStudentApplicationsPage />
    }

    return <EmployeeAuthPage />
  }

  if (pathname === appRoutes.employeeAdmin) {
    window.history.replaceState({}, '', appRoutes.employeeAdminCampaigns)
    return <AdminPanelPage />
  }

  if (
    pathname === appRoutes.employeeAdminCampaigns ||
    pathname === appRoutes.employeeAdminEmployees ||
    pathname === appRoutes.employeeAdminStudents ||
    pathname === appRoutes.employeeAdminDocuments ||
    pathname === appRoutes.employeeAdminDisciplines
  ) {
    return <AdminPanelPage key={pathname} />
  }

  if (pathname === appRoutes.studentApplicationCreate) {
    return <StudentApplicationCreatePage />
  }

  if (pathname === appRoutes.employeeStudentApplications) {
    return <EmployeeStudentApplicationsPage key={pathname} />
  }

  if (pathname === appRoutes.employeeStudentApplicationsMine) {
    return <EmployeeStudentApplicationsPage key={pathname} />
  }

  if (pathname === appRoutes.employeeStatistics) {
    return <EmployeeStatisticsPage />
  }

  if (pathname === appRoutes.employeeSessionContext) {
    return <EmployeeSessionContextPage />
  }

  if (pathname === appRoutes.employeePersonalData) {
    return <EmployeePersonalDataPage />
  }

  if (pathname === appRoutes.employeeSettings) {
    return <EmployeeSettingsPage />
  }

  if (pathname === appRoutes.employeeNotifications) {
    return <NotificationsPage principal="employee" />
  }

  if (pathname === appRoutes.employeeStudentApplicationDetails) {
    return <EmployeeApplicationDetailsPage />
  }

  if (pathname === appRoutes.studentDashboard) {
    return <StudentDashboardPage />
  }

  if (pathname === appRoutes.studentDocuments) {
    return <StudentDocumentsPage />
  }

  if (pathname === appRoutes.studentNotifications) {
    return <NotificationsPage principal="student" />
  }

  if (pathname === appRoutes.studentPersonalData) {
    return <StudentPersonalDataPage />
  }

  if (pathname === appRoutes.studentSettings) {
    return <StudentSettingsPage />
  }

  if (pathname === appRoutes.authCode) {
    return <AuthCodePage />
  }

  if (pathname === appRoutes.employeeAuth) {
    return <EmployeeAuthPage />
  }

  return <StudentAuthPage />
}

function subscribeToLocation(onStoreChange: () => void) {
  window.addEventListener('popstate', onStoreChange)

  return () => {
    window.removeEventListener('popstate', onStoreChange)
  }
}

function getLocationPathname() {
  return window.location.pathname.replace(/\/+$/, '') || '/'
}

function getIsAdminSession() {
  const session = getAuthSession()

  return session?.principalType === 'EMPLOYEE' && session.userRole === 'ADMIN'
}

export default App
