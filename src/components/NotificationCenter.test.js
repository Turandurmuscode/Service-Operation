import { fireEvent, render, screen } from '@testing-library/react';
import NotificationCenter from './NotificationCenter';

describe('NotificationCenter CRM follow-up integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('shows CRM follow-up notification item', () => {
    localStorage.setItem(
      'sod_crm_followup_reminders',
      JSON.stringify([
        {
          id: 'r-1',
          title: 'Yillik Sozlesme Takibi',
          owner: 'Admin',
          followUpDate: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
          status: 'pending',
        },
      ])
    );

    render(<NotificationCenter incidents={[]} clients={[]} onNavigate={jest.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: //i }));

    expect(screen.getByText(/crm takibi/i)).toBeInTheDocument();
    expect(screen.getByText(/Yillik Sozlesme Takibi/i)).toBeInTheDocument();
  });

  test('navigates to crm deals when follow-up notification clicked', () => {
    const onNavigate = jest.fn();
    localStorage.setItem(
      'sod_crm_followup_reminders',
      JSON.stringify([
        {
          id: 'r-2',
          title: 'Demo Planlama',
          owner: 'Admin',
          followUpDate: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
          status: 'pending',
        },
      ])
    );

    render(<NotificationCenter incidents={[]} clients={[]} onNavigate={onNavigate} />);

    fireEvent.click(screen.getByRole('button', { name: //i }));
    fireEvent.click(screen.getByText(/Demo Planlama/i));

    expect(onNavigate).toHaveBeenCalledWith('crmdeals');
  });
});
