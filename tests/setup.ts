// tests/setup.ts
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Mock the analytics client so unit tests never make network requests.
vi.mock("@/lib/analytics", () => ({
  analytics: { track: vi.fn(), setBackend: vi.fn() },
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});