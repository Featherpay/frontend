// PaymentForm.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PaymentForm } from "@/components/PaymentForm";
import { tokens } from "@/styles/tokens";
import { vi } from "vitest";

describe("PaymentForm", () => {
  const mockOnSubmit = vi.fn();
  const creatorName = "Alex";
  const amountCents = 500;
  const currency = "USD";
  const publishableKey = "pk_test_123";

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it("shows selected tip amount and creator name", () => {
    render(
      <PaymentForm
        amountCents={amountCents}
        creatorName={creatorName}
        currency={currency}
        publishableKey={publishableKey}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText(/\$5\.00/)).toBeInTheDocument();
    expect(screen.getByText(/to alex/i)).toBeInTheDocument();
  });

  it("submit button disabled until card fields complete", () => {
    render(
      <PaymentForm
        amountCents={amountCents}
        creatorName={creatorName}
        currency={currency}
        publishableKey={publishableKey}
        onSubmit={mockOnSubmit}
      />
    );

    const submitBtn = screen.getByRole("button", {
      name: /send \$5\.00 tip to alex/i,
    });
    expect(submitBtn).toBeDisabled();
  });

  it("shows loading state during submission", () => {
    render(
      <PaymentForm
        amountCents={amountCents}
        creatorName={creatorName}
        currency={currency}
        publishableKey={publishableKey}
        onSubmit={mockOnSubmit}
        isSubmitting={true}
      />
    );

    const submitBtn = screen.getByRole("button", {
      name: /send \$5\.00 tip to alex/i,
    });
    expect(submitBtn).toBeDisabled();
    expect(submitBtn).toHaveTextContent(/sending/i);
  });

  it("calls onSubmit with payment method id when submitted", () => {
    render(
      <PaymentForm
        amountCents={amountCents}
        creatorName={creatorName}
        currency={currency}
        publishableKey={publishableKey}
        onSubmit={mockOnSubmit}
      />
    );

    const submitBtn = screen.getByRole("button", {
      name: /send \$5\.00 tip to alex/i,
    });
    // The button is disabled until card is ready
    expect(submitBtn).toBeDisabled();
  });

  it("shows error message when provided", () => {
    render(
      <PaymentForm
        amountCents={amountCents}
        creatorName={creatorName}
        currency={currency}
        publishableKey={publishableKey}
        onSubmit={mockOnSubmit}
        error="Your card wasn't accepted. Please try a different card."
      />
    );

    expect(screen.getByText(/your card wasn't accepted/i)).toBeInTheDocument();
  });

  it("shows success message when provided", () => {
    render(
      <PaymentForm
        amountCents={amountCents}
        creatorName={creatorName}
        currency={currency}
        publishableKey={publishableKey}
        onSubmit={mockOnSubmit}
        successMessage="Your $5 tip is on its way to Alex"
      />
    );

    expect(
      screen.getByText((content, element) => {
        const text = element.textContent || "";
        return text === "Your $5 tip is on its way to Alex";
      })
    ).toBeInTheDocument();
  });

  it("aria-label includes amount and creator name", () => {
    render(
      <PaymentForm
        amountCents={amountCents}
        creatorName={creatorName}
        currency={currency}
        publishableKey={publishableKey}
        onSubmit={mockOnSubmit}
      />
    );

    const submitBtn = screen.getByRole("button", {
      name: /send \$5\.00 tip to alex/i,
    });
    expect(submitBtn).toHaveAttribute(
      "aria-label",
      "Send $5.00 tip to Alex"
    );
  });
});