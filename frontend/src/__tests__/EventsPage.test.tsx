import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { TestRouter } from "../test-utils/router";
import EventsPage from "../pages/EventsPage";

const mockApi = vi.hoisted(() => ({
  get: vi.fn(),
}));

vi.mock("../services/api", () => ({
  default: mockApi,
  authAPI: {},
  userAPI: {},
}));

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
    mockApi.get.mockReset();
    mockApi.get.mockResolvedValue({ data: [] });
  });

  it("renders heading", async () => {
    render(
      <TestRouter>
        <EventsPage />
      </TestRouter>
    );

    expect(screen.getByText(/Change Events/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(mockApi.get).toHaveBeenCalledWith(
        "/api/events",
        expect.objectContaining({ params: expect.any(Object) })
      );
      expect(mockApi.get).toHaveBeenCalledWith("/api/agents");
      expect(mockApi.get).toHaveBeenCalledWith("/api/tools");
      expect(mockApi.get).toHaveBeenCalledWith("/api/tags");
    });
  });
});
