import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ItemsPage from '../pages/ItemsPage';
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

describe('ItemsPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('access_token', 'mock-token');
  });

  it('loads and displays items list', async () => {
    const mockItems = [
      {
        id: 1,
        title: 'Test Item',
        description: 'Test description',
        status: 'active',
        owner_id: 1,
        created_at: '2025-01-01T00:00:00',
        updated_at: '2025-01-01T00:00:00'
      }
    ];

    mockedAxios.get.mockResolvedValueOnce({ data: mockItems });

    render(
      <BrowserRouter>
        <ItemsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Item')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });
  });

  it('creates a new item', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [] });
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        id: 1,
        title: 'New Item',
        description: 'New description',
        status: 'active',
        owner_id: 1
      }
    });

    render(
      <BrowserRouter>
        <ItemsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/my items/i)).toBeInTheDocument();
    });

    const createButton = screen.getByRole('button', { name: /create new item/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      const titleInput = screen.getByPlaceholderText(/item title/i);
      fireEvent.change(titleInput, { target: { value: 'New Item' } });
      
      const descInput = screen.getByPlaceholderText(/item description/i);
      fireEvent.change(descInput, { target: { value: 'New description' } });
    });

    const submitButton = screen.getByRole('button', { name: /create/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/items',
        expect.objectContaining({
          title: 'New Item',
          description: 'New description'
        }),
        expect.any(Object)
      );
    });
  });

  it('updates an existing item', async () => {
    const mockItems = [
      {
        id: 1,
        title: 'Test Item',
        description: 'Test description',
        status: 'active',
        owner_id: 1,
        created_at: '2025-01-01T00:00:00',
        updated_at: '2025-01-01T00:00:00'
      }
    ];

    mockedAxios.get.mockResolvedValueOnce({ data: mockItems });
    mockedAxios.put.mockResolvedValueOnce({
      data: { ...mockItems[0], title: 'Updated Item' }
    });

    render(
      <BrowserRouter>
        <ItemsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    await waitFor(() => {
      const titleInput = screen.getByDisplayValue('Test Item');
      fireEvent.change(titleInput, { target: { value: 'Updated Item' } });
    });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith(
        '/api/items/1',
        expect.objectContaining({ title: 'Updated Item' }),
        expect.any(Object)
      );
    });
  });

  it('deletes an item', async () => {
    const mockItems = [
      {
        id: 1,
        title: 'Test Item',
        description: 'Test description',
        status: 'active',
        owner_id: 1,
        created_at: '2025-01-01T00:00:00',
        updated_at: '2025-01-01T00:00:00'
      }
    ];

    mockedAxios.get.mockResolvedValueOnce({ data: mockItems });
    mockedAxios.delete.mockResolvedValueOnce({ data: { message: 'Item deleted' } });

    render(
      <BrowserRouter>
        <ItemsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    // Confirm deletion
    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      fireEvent.click(confirmButton);
    });

    await waitFor(() => {
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        '/api/items/1',
        expect.any(Object)
      );
    });
  });

  it('displays empty state when no items exist', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [] });

    render(
      <BrowserRouter>
        <ItemsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/no items yet/i)).toBeInTheDocument();
    });
  });
});
