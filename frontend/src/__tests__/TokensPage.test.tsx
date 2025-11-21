import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TokensPage from '../pages/TokensPage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
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

describe('TokensPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('access_token', 'mock-token');
    global.fetch = vi.fn();
    global.confirm = vi.fn(() => true);
  });

  it('loads and displays tokens list', async () => {
    const mockTokens = [
      {
        id: 1,
        name: 'Test Token',
        scopes: 'read,write',
        created_at: '2025-01-01T00:00:00',
        expires_at: '2025-12-31T23:59:59',
        last_used_at: null,
        is_active: true
      }
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTokens,
    });

    render(
      <BrowserRouter>
        <TokensPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Token')).toBeInTheDocument();
    });
  });

  it('shows create token modal', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(
      <BrowserRouter>
        <TokensPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const createButton = screen.getByRole('button', { name: /create new token/i });
      expect(createButton).toBeInTheDocument();
    });

    const createButton = screen.getByRole('button', { name: /create new token/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText(/create personal access token/i)).toBeInTheDocument();
    });
  });

  it('revokes a token when confirmed', async () => {
    const mockTokens = [
      {
        id: 1,
        name: 'Test Token',
        scopes: 'read',
        created_at: '2025-01-01T00:00:00',
        expires_at: null,
        last_used_at: null,
        is_active: true
      }
    ];

    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTokens,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    render(
      <BrowserRouter>
        <TokensPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Token')).toBeInTheDocument();
    });

    const revokeButton = screen.getByRole('button', { name: /revoke/i });
    fireEvent.click(revokeButton);

    await waitFor(() => {
      expect(global.confirm).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/users/me/tokens/1',
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  it('displays empty state when no tokens exist', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(
      <BrowserRouter>
        <TokensPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/no tokens yet/i)).toBeInTheDocument();
    });
  });
});
