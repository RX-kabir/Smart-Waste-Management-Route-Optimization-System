import { RoutesManagement } from "@/components/routes-management"
import { INITIAL_ROUTES, INITIAL_BINS } from "@/data/mockData"
import { AppLayout } from "@/components/layout/AppLayout"

export default function AdminRoutesPage() {
  return (
    <AppLayout title="Routes Management">
      <RoutesManagement initialRoutes={INITIAL_ROUTES} initialBins={INITIAL_BINS} />
    </AppLayout>
  )
}