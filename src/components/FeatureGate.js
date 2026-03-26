import React from 'react';

export default function FeatureGate({ canAccessFeature, featureKey, fallback = null, children }) {
  const allowed = typeof canAccessFeature === 'function' ? canAccessFeature(featureKey) : false;
  if (!allowed) return fallback;
  return <>{children}</>;
}
