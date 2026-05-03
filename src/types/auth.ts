export type EmployeeEmail = `${string}@hse.ru`
export type StudentEmail = `${string}@edu.hse.ru` | `${string}@hse.ru`

export interface StudentAuthFormState {
  email: string
}
