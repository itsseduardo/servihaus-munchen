type EmployeeAvailabilityInput = {
  isActive?: boolean | null
  active?: boolean | null
  inactiveSince?: string | Date | null
  inactiveUntil?: string | Date | null
}

function startOfDay(date: Date) {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function endOfDay(date: Date) {
  const copy = new Date(date)
  copy.setHours(23, 59, 59, 999)
  return copy
}

export function isEmployeeInactiveOnDate(
  employee: EmployeeAvailabilityInput,
  dateValue: string | Date = new Date()
) {
  const targetDate = startOfDay(new Date(dateValue))

  const isMarkedInactive =
    employee.isActive === false || employee.active === false

  if (!isMarkedInactive) return false

  const inactiveSince = employee.inactiveSince
    ? startOfDay(new Date(employee.inactiveSince))
    : null

  const inactiveUntil = employee.inactiveUntil
    ? endOfDay(new Date(employee.inactiveUntil))
    : null

  if (inactiveSince && targetDate < inactiveSince) {
    return false
  }

  if (inactiveUntil && targetDate > inactiveUntil) {
    return false
  }

  return true
}

export function isEmployeeAssignableOnDate(
  employee: EmployeeAvailabilityInput,
  dateValue: string | Date
) {
  return !isEmployeeInactiveOnDate(employee, dateValue)
}