import { Sidebar } from "@/components/sidebar"
import { TopHeader } from "@/components/top-header"
import { SidebarProvider } from "@/lib/sidebar-context"
import { ClinicProvider } from "@/lib/clinic-context"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <ClinicProvider>
        <div className="flex h-dvh bg-background">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <TopHeader />
            <main className="flex-1 overflow-y-auto p-4 lg:p-6">
              {children}
            </main>
          </div>
        </div>
      </ClinicProvider>
    </SidebarProvider>
  )
}
