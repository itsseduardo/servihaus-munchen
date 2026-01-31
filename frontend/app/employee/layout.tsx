import EmployeeSidebar from "@/components/employee/EmployeeSidebar";

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <EmployeeSidebar />
      <main className="ml-64 flex-1 min-h-screen bg-background-light">
        {children}
      </main>
    </div>
  );
}
