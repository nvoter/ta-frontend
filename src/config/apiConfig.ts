const DEFAULT_STUDENT_GATEWAY_URL = '/student-api-gateway/api/v1'
const DEFAULT_EMPLOYEE_GATEWAY_URL = '/employee-api-gateway/api/v1'

export const apiConfig = {
  employeeGatewayUrl:
    import.meta.env.VITE_EMPLOYEE_GATEWAY_URL ??
    DEFAULT_EMPLOYEE_GATEWAY_URL,
  studentGatewayUrl:
    import.meta.env.VITE_STUDENT_GATEWAY_URL ??
    DEFAULT_STUDENT_GATEWAY_URL,
} as const
