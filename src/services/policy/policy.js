const FEATURE_POLICIES = {
  'finance.viewCosts': ['admin', 'manager'],
  'finance.editPricing': ['admin', 'manager'],
  'incidents.resolve': ['admin', 'manager', 'technician'],
  'users.manage': ['admin'],
  'reports.export': ['admin', 'manager'],
  'documents.download': ['admin', 'manager', 'technician'],
};

export function hasFeatureAccess(role, featureKey) {
  if (!role || !featureKey) return false;
  const allowedRoles = FEATURE_POLICIES[featureKey];
  if (!allowedRoles) return false;
  return allowedRoles.includes(role);
}

export function getRoleFeatures(role) {
  return Object.keys(FEATURE_POLICIES).filter((key) =>
    FEATURE_POLICIES[key].includes(role)
  );
}

export function filterAccessibleFeatures(role, featureKeys = []) {
  return featureKeys.filter((featureKey) => hasFeatureAccess(role, featureKey));
}

export { FEATURE_POLICIES };
