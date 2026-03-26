import { fireEvent, render, screen, within } from '@testing-library/react';
import KumesCalculatorPage from './KumesCalculatorPage';

const MATERIALS_KEY = 'sod_kumes_materials';

describe('KumesCalculatorPage', () => {
  const clickCalculateAction = () => {
    const heading = screen.getByRole('heading', { level: 3, name: /boyut/i });
    const dimsCard = heading.closest('.km-dims-card');
    const button = within(dimsCard).getByRole('button', { name: /hesapla/i });
    fireEvent.click(button);
  };

  beforeEach(() => {
    localStorage.clear();
  });

  test('shows validation errors when required fields are missing', () => {
    localStorage.setItem(
      MATERIALS_KEY,
      JSON.stringify([
        {
          id: 'm1',
          name: 'Panel',
          unit: 'm²',
          unitPrice: 10,
          formula: 'floor_area',
          interval: 1,
          multiplier: 1,
        },
      ])
    );

    render(<KumesCalculatorPage darkMode={false} />);

    clickCalculateAction();

    expect(screen.getByRole('alert')).toHaveTextContent(/zorunludur/i);
  });

  test('calculates and renders result table with valid inputs', () => {
    localStorage.setItem(
      MATERIALS_KEY,
      JSON.stringify([
        {
          id: 'm1',
          name: 'Panel',
          unit: 'm²',
          unitPrice: 10,
          formula: 'floor_area',
          interval: 1,
          multiplier: 1,
        },
      ])
    );

    render(<KumesCalculatorPage darkMode={false} />);

    fireEvent.change(screen.getByPlaceholderText('110'), { target: { value: '10' } });
    fireEvent.change(screen.getByPlaceholderText('16'), { target: { value: '5' } });
    fireEvent.change(screen.getByPlaceholderText('3.5'), { target: { value: '3' } });

    clickCalculateAction();

    expect(screen.getByText(/hesaplama sonucu/i)).toBeInTheDocument();
    expect(screen.getByText('Panel')).toBeInTheDocument();
    expect(screen.getByText(/genel toplam/i)).toBeInTheDocument();
  });
});
