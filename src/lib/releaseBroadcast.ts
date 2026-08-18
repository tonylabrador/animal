import { getSubscriptionConfig } from "@/lib/subscriptions";
import { getReleases, hydrateRelease, releaseEmail } from "@/lib/releases";

const BROADCAST_PREFIX = "wild-explorer-release:";

export class ReleaseNotFoundError extends Error {
  constructor(releaseId: string) {
    super(`Unknown release: ${releaseId}`);
    this.name = "ReleaseNotFoundError";
  }
}

async function broadcastAlreadyExists(
  config: ReturnType<typeof getSubscriptionConfig>,
  broadcastName: string,
) {
  let after: string | undefined;

  do {
    const response = await config.resend.broadcasts.list({ limit: 100, ...(after ? { after } : {}) });
    if (response.error) throw new Error(`Broadcast lookup failed: ${response.error.name}`);
    if (response.data.data.some((broadcast) => broadcast.name === broadcastName)) return true;
    if (!response.data.has_more || response.data.data.length === 0) return false;
    after = response.data.data.at(-1)?.id;
  } while (after);

  return false;
}

export async function sendReleaseBroadcast(releaseId: string) {
  const release = getReleases().find((candidate) => candidate.id === releaseId);
  if (!release) throw new ReleaseNotFoundError(releaseId);

  const config = getSubscriptionConfig();
  const broadcastName = `${BROADCAST_PREFIX}${release.id}`;
  if (await broadcastAlreadyExists(config, broadcastName)) {
    return { status: "already_sent" as const, releaseId: release.id };
  }

  const hydrated = hydrateRelease(release);
  const message = releaseEmail(hydrated, config.siteUrl);
  const response = await config.resend.broadcasts.create({
    segmentId: config.segmentId,
    name: broadcastName,
    from: config.from,
    subject: message.subject,
    previewText: message.previewText,
    html: message.html,
    text: message.text,
    send: true,
  });
  if (response.error) throw new Error(`Broadcast creation failed: ${response.error.name}`);

  return {
    status: "sent" as const,
    releaseId: release.id,
    broadcastId: response.data.id,
    animalCount: hydrated.animals.length,
  };
}
