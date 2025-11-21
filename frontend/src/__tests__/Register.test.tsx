import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TestRouter } from '../test-utils/router';
import RegisterPage from '../pages/RegisterPage';

const mockRegister = vi.fn();
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
    register: mockRegister,
    login: vi.fn(),
    logout: vi.fn(),
    user: null,
    isAuthenticated: false,
  }),
  AuthProvider: ({ children }: any) => children,
}));

describe('RegisterPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRegister.mockReset();
    mockNavigate.mockReset();
  });

  it('renders registration form', () => {
    render(
      <TestRouter>
        <RegisterPage />
      </TestRouter>
    );

    expect(screen.getByPlaceholderText(/john doe/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your@email.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('displays error on duplicate email', async () => {
    mockRegister.mockRejectedValueOnce({
      response: { data: { detail: 'Email already registered' } }
    });

    render(
      <TestRouter>
        <RegisterPage />
      </TestRouter>
    );

    const nameInput = screen.getByPlaceholderText(/john doe/i);
    const emailInput = screen.getByPlaceholderText(/your@email.com/i);
    const passwordInput = screen.getByPlaceholderText(/enter password/i);
    const confirmInput = screen.getByPlaceholderText(/confirm password/i);
    const registerButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'StrongPass123' } });
    fireEvent.change(confirmInput, { target: { value: 'StrongPass123' } });
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(screen.getByText(/email already registered/i)).toBeInTheDocument();
    });
  });

  it('successfully registers and redirects to dashboard', async () => {
    mockRegister.mockResolvedValueOnce(undefined);

    render(
      <TestRouter>
        <RegisterPage />
      </TestRouter>
    );

    const nameInput = screen.getByPlaceholderText(/john doe/i);
    const emailInput = screen.getByPlaceholderText(/your@email.com/i);
    const passwordInput = screen.getByPlaceholderText(/enter password/i);
    const confirmInput = screen.getByPlaceholderText(/confirm password/i);
    const registerButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(nameInput, { target: { value: 'New User' } });
    fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'StrongPass123' } });
    fireEvent.change(confirmInput, { target: { value: 'StrongPass123' } });
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('newuser@example.com', 'New User', 'StrongPass123');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('validates password strength', async () => {
    render(
      <TestRouter>
        <RegisterPage />
      </TestRouter>
    );

    const nameInput = screen.getByPlaceholderText(/john doe/i);
    const emailInput = screen.getByPlaceholderText(/your@email.com/i);
    const passwordInput = screen.getByPlaceholderText(/enter password/i);
    const confirmInput = screen.getByPlaceholderText(/confirm password/i);

    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'weak' } });
    fireEvent.change(confirmInput, { target: { value: 'weak' } });

    const registerButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });

    // Should not make API call with weak password
    expect(mockRegister).not.toHaveBeenCalled();
  });
});
