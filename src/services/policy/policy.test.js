import { FEATURE_POLICIES, filterAccessibleFeatures, getRoleFeatures, hasFeatureAccess } from './policy';

describe('policy service', () => {
  test('hasFeatureAccess returns expected permissions', () => {
    expect(hasFeatureAccess('admin', 'users.manage')).toBe(true);
    expect(hasFeatureAccess('manager', 'users.manage')).toBe(false);
    expect(hasFeatureAccess('technician', 'finance.viewCosts')).toBe(false);
  });

  test('getRoleFeatures returns all features for a role', () => {
    const managerFeatures = getRoleFeatures('manager');
    expect(managerFeatures).toContain('finance.viewCosts');
    expect(managerFeatures).toContain('reports.export');
    expect(managerFeatures).not.toContain('users.manage');
  });

  test('filterAccessibleFeatures filters feature list by role', () => {
    const sample = Object.keys(FEATURE_POLICIES);
    const techAllowed = filterAccessibleFeatures('technician', sample);

    expect(techAllowed).toContain('incidents.resolve');
    expect(techAllowed).toContain('documents.download');
    expect(techAllowed).not.toContain('finance.editPricing');
  });
});
