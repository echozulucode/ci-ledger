import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProfilePage from '../pages/ProfilePage';
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

describe('ProfilePage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('access_token', 'mock-token');
  });

  it('loads and displays user profile', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      full_name: 'Test User',
      is_admin: false,
      is_active: true
    };

    mockedAxios.get.mockResolvedValueOnce({ data: mockUser });

    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });

  it('updates profile information', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      full_name: 'Test User',
      is_admin: false,
      is_active: true
    };

    mockedAxios.get.mockResolvedValueOnce({ data: mockUser });
    mockedAxios.put.mockResolvedValueOnce({
      data: { ...mockUser, full_name: 'Updated Name' }
    });

    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    });

    const nameInput = screen.getByDisplayValue('Test User');
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith(
        '/api/users/me',
        expect.objectContaining({ full_name: 'Updated Name' }),
        expect.any(Object)
      );
    });
  });

  it('changes password successfully', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      full_name: 'Test User',
      is_admin: false,
      is_active: true
    };

    mockedAxios.get.mockResolvedValueOnce({ data: mockUser });
    mockedAxios.post.mockResolvedValueOnce({ data: { message: 'Password changed' } });

    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    const currentPasswordInput = screen.getByPlaceholderText(/current password/i);
    const newPasswordInput = screen.getByPlaceholderText(/new password/i);
    const changePasswordButton = screen.getByRole('button', { name: /change password/i });

    fireEvent.change(currentPasswordInput, { target: { value: 'oldpass123' } });
    fireEvent.change(newPasswordInput, { target: { value: 'NewPass123!' } });
    fireEvent.click(changePasswordButton);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/users/me/change-password',
        expect.objectContaining({
          current_password: 'oldpass123',
          new_password: 'NewPass123!'
        }),
        expect.any(Object)
      );
    });
  });

  it('handles profile load error', async () => {
    mockedAxios.get.mockRejectedValueOnce({
      response: { status: 401 }
    });

    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});
