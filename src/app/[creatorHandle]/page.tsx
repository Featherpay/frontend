// Public tip page: /@creatorhandle
//
// Highest-conversion surface in the product. Every design decision minimizes
// friction between "I want to tip" and "tip sent." No account or login is
// required for a one-off tip. Zero crypto vocabulary — ever.

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { apiClient } from "@/lib/api";
import { TipAmountSelector } from "@/components/TipAmountSelector";
import { PaymentForm } from "@/components/PaymentForm";
import TipPageClient from "@/components/TipPageClient";
import { tokens } from "@/styles/tokens";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { creatorHandle: string };
}

async function CreatorProfile({
  creatorHandle,
}: {
  creatorHandle: string;
}) {
  let profile: Awaited<ReturnType<typeof apiClient.getCreator>>;
  try {
    profile = await apiClient.getCreator(creatorHandle);
  } catch {
    // Network/API unavailable — never expose HTTP codes or error payloads.
    return <UnavailableState />;
  }

  if (!profile) {
    notFound();
  }

  const name = profile.display_name ?? creatorHandle;

  return (
    <TipPageClient
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

export default function CreatorHandlePage({ params }: PageProps) {
  return (
    <Suspense fallback={<LoadingState />}>
      <CreatorProfile creatorHandle={params.creatorHandle} />
    </Suspense>
  );
}