import { eventStore } from "@/lib/events/storage";
import { HorizonShell } from "@/components/horizon-shell";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const initialEvents = eventStore.getAll();

  return <HorizonShell initialEvents={initialEvents} />;
}
