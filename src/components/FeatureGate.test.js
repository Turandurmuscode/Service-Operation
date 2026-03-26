import { render, screen } from '@testing-library/react';
import FeatureGate from './FeatureGate';

describe('FeatureGate', () => {
  test('renders children when access allowed', () => {
    render(
      <FeatureGate canAccessFeature={() => true} featureKey="finance.viewCosts">
        <span>Visible Content</span>
      </FeatureGate>
    );

    expect(screen.getByText('Visible Content')).toBeInTheDocument();
  });

  test('renders fallback when access denied', () => {
    render(
      <FeatureGate
        canAccessFeature={() => false}
        featureKey="finance.viewCosts"
        fallback={<span>Hidden</span>}
      >
        <span>Visible Content</span>
      </FeatureGate>
    );

    expect(screen.queryByText('Visible Content')).toBeNull();
    expect(screen.getByText('Hidden')).toBeInTheDocument();
  });
});
