// TipAmountSelector.test.tsx
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TipAmountSelector } from "@/components/TipAmountSelector";
import { tokens } from "@/styles/tokens";

describe("TipAmountSelector", () => {
  const minCents = 100;
  const maxCents = 10000;
  const onChange = vi.fn();

  beforeEach(() => {
    onChange.mockClear();
  });

  it("pre-selects $5 as default", () => {
    render(
      <TipAmountSelector
        minCents={minCents}
        maxCents={maxCents}
        onChange={onChange}
      />
    );

    expect(onChange).toHaveBeenCalledWith(500);
    const fiveDollarBtn = screen.getByRole("radio", {
      name: "$5.00",
      checked: true,
    });
    expect(fiveDollarBtn).toBeInTheDocument();
  });

  it("updates selected amount when quick-select clicked", () => {
    render(
      <TipAmountSelector
        minCents={minCents}
        maxCents={maxCents}
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByRole("radio", { name: "$1.00" }));
    expect(onChange).toHaveBeenCalledWith(100);
    expect(screen.getByRole("radio", { name: "$1.00", checked: true })).toBeInTheDocument();
    expect(screen.queryByRole("radio", { name: "$5.00", checked: true })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: "$10.00" }));
    expect(onChange).toHaveBeenCalledWith(1000);
    expect(screen.getByRole("radio", { name: "$10.00", checked: true })).toBeInTheDocument();
    expect(screen.queryByRole("radio", { name: "$5.00", checked: true })).not.toBeInTheDocument();
  });

  it("accepts custom amount within bounds", () => {
    render(
      <TipAmountSelector
        minCents={minCents}
        maxCents={maxCents}
        onChange={onChange}
      />
    );

    const input = screen.getByLabelText(/or enter a custom amount/i);
    fireEvent.change(input, { target: { value: "7.50" } });
    expect(onChange).toHaveBeenCalledWith(750);
  });

  it("shows error for custom amount below min", () => {
    render(
      <TipAmountSelector
        minCents={minCents}
        maxCents={maxCents}
        onChange={onChange}
      />
    );

    const input = screen.getByLabelText(/or enter a custom amount/i);
    fireEvent.change(input, { target: { value: "0.50" } });
    expect(screen.getByText(/tips must be at least \$1.00/i)).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalledWith(50);
  });

  it("shows error for custom amount above max", () => {
    render(
      <TipAmountSelector
        minCents={minCents}
        maxCents={maxCents}
        onChange={onChange}
      />
    );

    const input = screen.getByLabelText(/or enter a custom amount/i);
    fireEvent.change(input, { target: { value: "150.00" } });
    expect(screen.getByText(/tips can't be more than \$100.00/i)).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalledWith(15000);
  });

  it("allows keyboard navigation between quick-select options", () => {
    render(
      <TipAmountSelector
        minCents={minCents}
        maxCents={maxCents}
        onChange={onChange}
      />
    );

    // Focus first $1 button
    const oneBtn = screen.getByRole("radio", { name: "$1.00" });
    oneBtn.focus();
    expect(document.activeElement).toBe(oneBtn);

    // Press Arrow Right to move to $5
    fireEvent.keyDown(oneBtn, { key: "ArrowRight" });
    const fiveBtn = screen.getByRole("radio", { name: "$5.00" });
    expect(document.activeElement).toBe(fiveBtn);

    // Press Arrow Right to move to $10
    fireEvent.keyDown(fiveBtn, { key: "ArrowRight" });
    const tenBtn = screen.getByRole("radio", { name: "$10.00" });
    expect(document.activeElement).toBe(tenBtn);

    // Press Arrow Left to move back to $5
    fireEvent.keyDown(tenBtn, { key: "ArrowLeft" });
    expect(document.activeElement).toBe(fiveBtn);

    // Press Enter/Space to activate focused button
    fireEvent.keyDown(fiveBtn, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith(500);
  });

  it("allows tab to reach custom amount field", () => {
    render(
      <TipAmountSelector
        minCents={minCents}
        maxCents={maxCents}
        onChange={onChange}
      />
    );

    // Start at first radio button
    const oneBtn = screen.getByRole("radio", { name: "$1.00" });
    oneBtn.focus();

    // Tab to $5
    fireEvent.keyDown(oneBtn, { key: "Tab" });
    const fiveBtn = screen.getByRole("radio", { name: "$5.00" });
    expect(document.activeElement).toBe(fiveBtn);

    // Tab to $10
    fireEvent.keyDown(fiveBtn, { key: "Tab" });
    const tenBtn = screen.getByRole("radio", { name: "$10.00" });
    expect(document.activeElement).toBe(tenBtn);

    // Tab to custom input
    fireEvent.keyDown(tenBtn, { key: "Tab" });
    const customInput = screen.getByLabelText(/or enter a custom amount/i);
    expect(document.activeElement).toBe(customInput);
  });

  it("does not allow multiple amounts to be selected simultaneously", () => {
    render(
      <TipAmountSelector
        minCents={minCents}
        maxCents={maxCents}
        onChange={onChange}
      />
    );

    // Initially $5 selected
    expect(screen.getByRole("radio", { name: "$5.00", checked: true })).toBeInTheDocument();
    expect(screen.queryAllByRole("radio", { checked: true }).length).toBe(1);

    // Click $1 - should now be selected, $5 deselected
    fireEvent.click(screen.getByRole("radio", { name: "$1.00" }));
    expect(screen.getByRole("radio", { name: "$1.00", checked: true })).toBeInTheDocument();
    expect(screen.queryByRole("radio", { name: "$5.00", checked: true })).not.toBeInTheDocument();
    expect(screen.queryAllByRole("radio", { checked: true }).length).toBe(1);

    // Enter custom amount - should be selected, quick-selects deselected
    const input = screen.getByLabelText(/or enter a custom amount/i);
    fireEvent.change(input, { target: { value: "7.50" } });
    expect(screen.queryAllByRole("radio", { checked: true }).length).toBe(0);
  });
});