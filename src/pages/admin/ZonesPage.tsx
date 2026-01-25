import { ZonesManagement } from "@/components/zones-management"
import { AppLayout } from "@/components/layout/AppLayout"

export default function AdminZonesPage() {
  return (
    <AppLayout title="Zones Management">
      <ZonesManagement />
    </AppLayout>
  )
}