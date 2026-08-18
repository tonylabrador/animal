import AnimalDashboard from "@/components/AnimalDashboard";
import { getAnimals, getLatestRelease } from "@/lib/getAnimals";

export default function HomePage() {
  const animals = getAnimals();
  const latestRelease = getLatestRelease();
  const subscriptionEnabled = Boolean(
    process.env.RESEND_API_KEY &&
    process.env.RESEND_SEGMENT_ID &&
    process.env.RESEND_FROM_EMAIL &&
    process.env.SUBSCRIBE_SIGNING_SECRET,
  );
  return <AnimalDashboard animals={animals} latestRelease={latestRelease} subscriptionEnabled={subscriptionEnabled} />;
}
