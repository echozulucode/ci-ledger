import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from '../pages/Register';
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

describe('Register Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders registration form', () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText(/full name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('displays error on duplicate email', async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: { data: { detail: 'Email already registered' } }
    });

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    const nameInput = screen.getByPlaceholderText(/full name/i);
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/^password$/i);
    const registerButton = screen.getByRole('button', { name: /register/i });

    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'StrongPass123!' } });
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(screen.getByText(/email already registered/i)).toBeInTheDocument();
    });
  });

  it('successfully registers and redirects to login', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { id: 1, email: 'newuser@example.com', full_name: 'New User' }
    });

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    const nameInput = screen.getByPlaceholderText(/full name/i);
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/^password$/i);
    const registerButton = screen.getByRole('button', { name: /register/i });

    fireEvent.change(nameInput, { target: { value: 'New User' } });
    fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'StrongPass123!' } });
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('validates password strength', async () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    const passwordInput = screen.getByPlaceholderText(/^password$/i);
    fireEvent.change(passwordInput, { target: { value: 'weak' } });

    // Check if validation message appears (implementation-dependent)
    const registerButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(registerButton);

    // Should not make API call with weak password
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });
});
