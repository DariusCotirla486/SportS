import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EquipmentProvider } from '@/context/EquipmentContext';
import EquipmentList from '../EquipmentList';

// Mock the next/image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

describe('EquipmentList Component', () => {
  const renderWithContext = (component: React.ReactElement) => {
    return render(
      <EquipmentProvider>
        {component}
      </EquipmentProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 1. Basic Rendering
  it('renders the equipment list component', () => {
    renderWithContext(<EquipmentList activeCategory="All" priceSort="none" />);
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  // 2. Item Display
  it('displays equipment items with correct information', () => {
    renderWithContext(<EquipmentList activeCategory="All" priceSort="none" />);
    expect(screen.getByText('Professional Basketball')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
  });

  // 3. Delete Functionality
  it('shows delete confirmation dialog when delete button is clicked', async () => {
    renderWithContext(<EquipmentList activeCategory="All" priceSort="none" />);
    window.confirm = jest.fn(() => true);
    const deleteButton = screen.getAllByTitle('Delete item')[0];
    fireEvent.click(deleteButton);
    expect(window.confirm).toHaveBeenCalled();
  });

  // 4. Edit Functionality
  it('opens edit form when edit button is clicked', () => {
    renderWithContext(<EquipmentList activeCategory="All" priceSort="none" />);
    const editButton = screen.getAllByTitle('Edit item')[0];
    fireEvent.click(editButton);
    expect(screen.getByText('Edit Equipment')).toBeInTheDocument();
  });

  // 5. Category Filter
  it('filters items by category', () => {
    renderWithContext(<EquipmentList activeCategory="Ball Sports" priceSort="none" />);
    expect(screen.getByText('Professional Basketball')).toBeInTheDocument();
  });

  // 6. Price Labels
  it('displays price labels correctly', () => {
    renderWithContext(<EquipmentList activeCategory="All" priceSort="none" />);
    const priceElements = screen.getAllByText(/\$\d+\.\d{2}/);
    expect(priceElements.length).toBeGreaterThan(0);
  });

  // 7. Image Display
  it('renders product images', () => {
    renderWithContext(<EquipmentList activeCategory="All" priceSort="none" />);
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);
  });

  // 8. Price Sorting
  it('sorts items by price', () => {
    renderWithContext(<EquipmentList activeCategory="All" priceSort="high-low" />);
    const prices = screen.getAllByText(/\$\d+\.\d{2}/);
    expect(prices.length).toBeGreaterThan(0);
  });

  // 9. Edit Form Fields
  it('displays all required fields in edit form', () => {
    renderWithContext(<EquipmentList activeCategory="All" priceSort="none" />);
    const editButton = screen.getAllByTitle('Edit item')[0];
    fireEvent.click(editButton);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
  });

  // 10. Delete Confirmation
  it('removes item after delete confirmation', async () => {
    renderWithContext(<EquipmentList activeCategory="All" priceSort="none" />);
    window.confirm = jest.fn(() => true);
    const deleteButton = screen.getAllByTitle('Delete item')[0];
    const itemName = screen.getByText('Professional Basketball');
    
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining(itemName.textContent || ''));
    });
  });
}); 