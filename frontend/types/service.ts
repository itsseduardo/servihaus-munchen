export type ServiceType = {
  [x: string]: any
  serviceCode: any
  id: number
  code: string
  date: string
  time: string
  duration?: string
  address: string
  notes?: string
  importantNotes?: string
  requiresKey?: boolean
  status: string
  assignments?: {
    employee: {
      firstName: string
      lastName: string
    }
  }[]
}