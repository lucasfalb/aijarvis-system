import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import PageTransition from "@/components/page-transition";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="relative max-w-[1400px] mx-auto border w-full">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-4 p-4">
            <PageTransition>
              <SidebarTrigger className="mb-4 md:hidden" />
              {children}
              </PageTransition>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </main>

  );
}