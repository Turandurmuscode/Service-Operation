import { render, screen } from '@testing-library/react';
import App from './App';

test('renders loading screen on initial mount', () => {
  render(<App />);
  expect(screen.getByText(/panel yükleniyor/i)).toBeInTheDocument();
});
