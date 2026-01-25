import { TrucksManagement } from "@/components/trucks-management"
import { AppLayout } from "@/components/layout/AppLayout"

export default function AdminTrucksPage() {
  return (
    <AppLayout title="Trucks Management">
      <TrucksManagement />
    </AppLayout>
  )
}