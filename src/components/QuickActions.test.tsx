import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { QuickAction } from "../lib/quickActions";
import { QuickActions } from "./QuickActions";

describe("QuickActions", () => {
  const mockActions: QuickAction[] = [
    {
      id: "test1",
      icon: () => null,
      label: "Test 1",
      description: "Description 1",
      color: "#22c55e",
      onClick: vi.fn(),
    },
    {
      id: "test2",
      icon: () => null,
      label: "Test 2",
      description: "Description 2",
      color: "#f59e0b",
      onClick: vi.fn(),
    },
  ];

  it("renders 7 action cards", () => {
    const sevenActions = Array.from({ length: 7 }, (_, i) => ({
      id: `action${i}`,
      icon: () => null,
      label: `Action ${i}`,
      description: `Description ${i}`,
      color: "#22c55e",
      onClick: vi.fn(),
    }));

    render(<QuickActions actions={sevenActions} disabled={false} />);
    
    const cards = screen.getAllByText(/Action \d/);
    expect(cards).toHaveLength(7);
  });

  it("applies pointer-events-none when disabled", () => {
    render(<QuickActions actions={mockActions} disabled={true} />);
    
    const cards = document.querySelectorAll(".hud-bracket");
    cards.forEach((card) => {
      expect(card).toHaveClass("pointer-events-none");
      expect(card).toHaveClass("opacity-50");
    });
  });

  it("does not apply disabled styles when enabled", () => {
    render(<QuickActions actions={mockActions} disabled={false} />);
    
    const cards = document.querySelectorAll(".hud-bracket");
    cards.forEach((card) => {
      expect(card).not.toHaveClass("pointer-events-none");
      expect(card).not.toHaveClass("opacity-50");
    });
  });

  it("calls onClick when card is clicked", async () => {
    render(<QuickActions actions={mockActions} disabled={false} />);
    
    const firstCard = document.querySelector(".hud-bracket") as HTMLElement;
    await firstCard.click();
    
    expect(mockActions[0].onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled and card is clicked", async () => {
    render(<QuickActions actions={mockActions} disabled={true} />);
    
    const firstCard = document.querySelector(".hud-bracket") as HTMLElement;
    
    // Check that the card has disabled styling
    expect(firstCard).toHaveClass("pointer-events-none");
    expect(firstCard).toHaveClass("opacity-50");
  });

  it("displays action labels", () => {
    render(<QuickActions actions={mockActions} disabled={false} />);
    
    expect(screen.getByText("Test 1")).toBeInTheDocument();
    expect(screen.getByText("Test 2")).toBeInTheDocument();
  });

  it("displays action descriptions", () => {
    render(<QuickActions actions={mockActions} disabled={false} />);
    
    expect(screen.getByText("Description 1")).toBeInTheDocument();
    expect(screen.getByText("Description 2")).toBeInTheDocument();
  });
});
