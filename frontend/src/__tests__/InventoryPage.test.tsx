import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { TestRouter } from "../test-utils/router";
import InventoryPage from "../pages/InventoryPage";

const mockApi = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
}));

vi.mock("../services/api", () => ({
  default: mockApi,
  authAPI: {},
  userAPI: {},
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, email: 'admin@example.com', full_name: 'Admin', is_admin: true, is_active: true },
    login: vi.fn(), logout: vi.fn(), isAuthenticated: true,
  }),
  AuthProvider: ({ children }: any) => children,
}));

describe("InventoryPage", () => {
  beforeEach(() => {
    mockApi.get.mockReset();
    mockApi.post.mockReset();
    mockApi.delete.mockReset();
    mockApi.get.mockResolvedValue({ data: [] });
  });

  it("loads resources", async () => {
    render(
      <TestRouter>
        <InventoryPage />
      </TestRouter>
    );

    await waitFor(() => {
      expect(mockApi.get).toHaveBeenCalledWith("/api/agents");
    });
  });
});
