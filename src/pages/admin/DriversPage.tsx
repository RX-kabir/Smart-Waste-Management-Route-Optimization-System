import { INITIAL_ROUTES } from "@/data/mockData"
import { DriversManagement } from "@/components/drivers-management"
import { AppLayout } from "@/components/layout/AppLayout"

export default function AdminDriversPage() {
  return (
    <AppLayout title="Drivers Management">
      <DriversManagement />
    </AppLayout>
  )
}