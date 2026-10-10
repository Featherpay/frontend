// Embeddable widget page — full tip flow in minimal bundle.
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { apiClient } from "@/lib/api";
import { EmbedWidget } from "@/components/EmbedWidget";
import { tokens } from "@/styles/tokens";

interface EmbedPageProps {
  searchParams: Promise<{ creator: string }>;
}

async function CreatorProfile({ creatorHandle }: { creatorHandle: string }) {
  let profile: Awaited<ReturnType<typeof apiClient.getCreator>>;
  try {
    profile = await apiClient.getCreator(creatorHandle);
  } catch {
    return <UnavailableState />;
  }

  if (!profile) {
    notFound();
  }

  const name = profile.display_name ?? creatorHandle;

  return (
    <EmbedWidget
      creatorHandle={creatorHandle}
      creatorName={name}
      minCents={Number(process.env.NEXT_PUBLIC_MIN_TIP_CENTS ?? 100)}
      maxCents={Number(process.env.NEXT_PUBLIC_MAX_TIP_CENTS ?? 10000)}
    />
  );
}

function UnavailableState() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: tokens.spacing["4xl"],
        background: tokens.color.background,
        color: tokens.color.text,
        fontFamily: tokens.typography.fontFamily.sans,
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontSize: tokens.typography.fontSize["3xl"],
          margin: 0,
        }}
      >
        Tip pages are temporarily unavailable.
      </h1>
      <p
        style={{
          color: tokens.color.textMuted,
          marginTop: tokens.spacing.sm,
        }}
      >
        Please try again in a moment.
      </p>
    </main>
  );
}

function LoadingState() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: tokens.spacing["4xl"],
        background: tokens.color.background,
        color: tokens.color.text,
        fontFamily: tokens.typography.fontFamily.sans,
      }}
    >
      <span role="status" aria-live="polite">Loading…</span>
    </main>
  );
}

export default async function EmbedPage({ searchParams }: EmbedPageProps) {
  const params = await searchParams;
  const creator = params.creator;

  return (
    <Suspense fallback={<LoadingState />}>
      <CreatorProfile creatorHandle={creator} />
    </Suspense>
  );
}