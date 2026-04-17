import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";
import { LandingPage } from "../pages/LandingPage";

vi.mock("../api/albion", () => ({
  fetchGoldPrices: vi.fn().mockResolvedValue({
    current: { price: 123456, timestamp: "2026-01-01T00:00:00Z" },
    previous: { price: 123000, timestamp: "2025-12-31T23:55:00Z" },
    variation: 456,
    all: [],
    region: "europe",
  }),
  fetchAlbionPrices: vi.fn().mockResolvedValue({
    items: {},
    all_data: [],
  }),
}));

function renderLandingPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("LandingPage", () => {
  it("renderiza o titulo principal", () => {
    renderLandingPage();

    expect(screen.getByText(/domine a economia de/i)).toBeInTheDocument();
  });

  it("renderiza o botao de cadastro", () => {
    renderLandingPage();

    const button = screen.getByRole("link", { name: /come[çc]ar agora/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("href", "/signup");
  });

  it("renderiza as 3 features da landing page", () => {
    renderLandingPage();

    expect(screen.getByText("Monitoramento inteligente")).toBeInTheDocument();
    expect(screen.getByText("Filtros profissionais")).toBeInTheDocument();
    expect(screen.getByText("Login seguro")).toBeInTheDocument();
  });
});
