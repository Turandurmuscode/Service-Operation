import { fireEvent, render, screen } from '@testing-library/react';
import CRMDealsPage from './CRMDealsPage';

const DEALS_KEY = 'sod_crm_deals';
const QUOTES_KEY = 'sod_quotations';
const REMINDERS_KEY = 'sod_crm_followup_reminders';

function setDeals(deals) {
  localStorage.setItem(DEALS_KEY, JSON.stringify(deals));
}

describe('CRMDealsPage', () => {
  const clients = [
    { id: 1, name: 'Acme Ltd' },
    { id: 2, name: 'Beta AS' },
  ];

  beforeEach(() => {
    localStorage.clear();
  });

  test('renders KPI cards from deal data', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    setDeals([
      {
        id: 'd-1',
        title: 'Server Bakim',
        clientId: 1,
        value: 10000,
        owner: 'Admin',
        nextAction: 'Musteri aramasi',
        followUpDate: yesterday,
        notes: '',
        stage: 'proposal',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'd-2',
        title: 'Bulut Gecis',
        clientId: 2,
        value: 8000,
        owner: 'Admin',
        nextAction: '',
        followUpDate: '',
        notes: '',
        stage: 'won',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'd-3',
        title: 'Donanim Yenileme',
        clientId: 2,
        value: 5000,
        owner: 'Admin',
        nextAction: '',
        followUpDate: '',
        notes: '',
        stage: 'lost',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);

    render(<CRMDealsPage clients={clients} currentUser={{ name: 'Admin' }} showToast={jest.fn()} />);

    expect(screen.getByText('Toplam Fırsat Tutarı')).toBeInTheDocument();
    expect(screen.getAllByText('10.000 TL').length).toBeGreaterThan(0);
    expect(screen.getByText('%50.0')).toBeInTheDocument();
    expect(screen.getByText('Geciken Takip')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  test('converts active deal to quotation', () => {
    const toast = jest.fn();
    const navigate = jest.fn();
    setDeals([
      {
        id: 'd-10',
        title: 'Yillik Destek Paketi',
        clientId: 1,
        value: 12000,
        owner: 'Admin',
        nextAction: 'Teklif gonderimi',
        followUpDate: '',
        notes: 'Oncelikli musteri',
        stage: 'proposal',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);

    render(
      <CRMDealsPage
        clients={clients}
        currentUser={{ name: 'Admin' }}
        showToast={toast}
        onNavigate={navigate}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /teklife dönüştür/i }));

    const quotations = JSON.parse(localStorage.getItem(QUOTES_KEY));
    const deals = JSON.parse(localStorage.getItem(DEALS_KEY));
    expect(Array.isArray(quotations)).toBe(true);
    expect(quotations[0].status).toBe('draft');
    expect(quotations[0].client).toBe('Acme Ltd');
    expect(quotations[0].items[0].unitPrice).toBe(12000);
    expect(deals[0].quoteId).toBe(quotations[0].id);

    fireEvent.click(screen.getByRole('button', { name: /teklifi aç/i }));
    expect(navigate).toHaveBeenCalledWith('quotations');
    expect(toast).toHaveBeenCalled();
  });

  test('creates reminder for follow-up action', () => {
    const toast = jest.fn();
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    setDeals([
      {
        id: 'd-20',
        title: 'Network Iyilestirme',
        clientId: 2,
        value: 7000,
        owner: 'Admin',
        nextAction: 'Demo',
        followUpDate: tomorrow,
        notes: '',
        stage: 'qualified',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);

    render(<CRMDealsPage clients={clients} currentUser={{ name: 'Admin' }} showToast={toast} />);

    fireEvent.click(screen.getByRole('button', { name: /hatırlat/i }));

    const reminders = JSON.parse(localStorage.getItem(REMINDERS_KEY));
    expect(Array.isArray(reminders)).toBe(true);
    expect(reminders[0].dealId).toBe('d-20');
    expect(reminders[0].status).toBe('pending');
    expect(toast).toHaveBeenCalled();
  });
});
