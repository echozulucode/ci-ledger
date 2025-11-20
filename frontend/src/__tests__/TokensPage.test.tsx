import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TokensPage from '../pages/TokensPage';
import axios from 'axios';

vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('TokensPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('access_token', 'mock-token');
  });

  it('loads and displays tokens list', async () => {
    const mockTokens = [
      {
        id: 1,
        name: 'Test Token',
        scopes: ['read', 'write'],
        created_at: '2025-01-01T00:00:00',
        expires_at: '2025-12-31T23:59:59',
        is_active: true
      }
    ];

    mockedAxios.get.mockResolvedValueOnce({ data: mockTokens });

    render(
      <BrowserRouter>
        <TokensPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Token')).toBeInTheDocument();
    });
  });

  it('creates a new token', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [] });
    mockedAxios.post.mockResolvedValueOnce({
      data: { token: 'new-token-value', id: 1, name: 'New Token' }
    });

    render(
      <BrowserRouter>
        <TokensPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/personal access tokens/i)).toBeInTheDocument();
    });

    const createButton = screen.getByRole('button', { name: /create new token/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      const nameInput = screen.getByPlaceholderText(/token name/i);
      fireEvent.change(nameInput, { target: { value: 'New Token' } });
    });

    const submitButton = screen.getByRole('button', { name: /create token/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/users/me/tokens',
        expect.any(Object),
        expect.any(Object)
      );
    });
  });

  it('revokes a token', async () => {
    const mockTokens = [
      {
        id: 1,
        name: 'Test Token',
        scopes: ['read'],
        created_at: '2025-01-01T00:00:00',
        expires_at: null,
        is_active: true
      }
    ];

    mockedAxios.get.mockResolvedValueOnce({ data: mockTokens });
    mockedAxios.delete.mockResolvedValueOnce({ data: { message: 'Token revoked' } });

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

    // Confirm deletion
    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      fireEvent.click(confirmButton);
    });

    await waitFor(() => {
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        '/api/users/me/tokens/1',
        expect.any(Object)
      );
    });
  });

  it('displays empty state when no tokens exist', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [] });

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
