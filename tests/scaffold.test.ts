import { describe, it, expect } from "vitest";

describe("scaffold smoke test", () => {
  it("design tokens are typed and complete", async () => {
    const tokens = (await import("@/styles/tokens")).tokens;
    expect(tokens.color.accent).toBe("#F59E0B");
    expect(tokens.borderRadius.md).toBe("0.625rem");
    expect(tokens.touchTarget.min).toBe("44px");
  });

  it("apiClient exposes all required endpoints", async () => {
    const { apiClient } = await import("@/lib/api");
    expect(typeof apiClient.createAccount).toBe("function");
    expect(typeof apiClient.getCreator).toBe("function");
    expect(typeof apiClient.submitTip).toBe("function");
    expect(typeof apiClient.getEarnings).toBe("function");
    expect(typeof apiClient.getTipHistory).toBe("function");
    expect(typeof apiClient.requestWithdrawal).toBe("function");
    expect(typeof apiClient.getWithdrawalStatus).toBe("function");
  });
});