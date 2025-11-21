import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import EventsPage from "../pages/EventsPage";

vi.mock("../services/api", () => {
  const mockGet = vi.fn();
  return {
    default: { get: mockGet },
    authAPI: {},
    userAPI: {},
  };
});

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, email: 'test@example.com', full_name: 'Test', is_admin: false, is_active: true },
    login: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: true,
  }),
  AuthProvider: ({ children }: any) => children,
}));

describe("EventsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });
  });

  it("renders heading", async () => {
    render(
      <BrowserRouter>
        <EventsPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Change Events/i)).toBeInTheDocument();
  });
});
