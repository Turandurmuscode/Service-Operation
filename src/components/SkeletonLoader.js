import React from 'react';
import './SkeletonLoader.css';

function SkeletonLoader({ type = 'card', count = 1 }) {
  const renderSkeleton = () => {
    switch(type) {
      case 'card':
        return <CardSkeleton />;
      case 'table':
        return <TableSkeleton />;
      case 'widget':
        return <WidgetSkeleton />;
      case 'stat':
        return <StatSkeleton />;
      case 'chart':
        return <ChartSkeleton />;
      case 'list':
        return <ListSkeleton />;
      case 'profile':
        return <ProfileSkeleton />;
      default:
        return <CardSkeleton />;
    }
  };

  return (
    <>
      {Array(count).fill(0).map((_, index) => (
        <div key={index}>
          {renderSkeleton()}
        </div>
      ))}
    </>
  );
}

function CardSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-title"></div>
      <div className="skeleton skeleton-text"></div>
      <div className="skeleton skeleton-text short"></div>
      <div className="skeleton skeleton-button"></div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="skeleton-table">
      {Array(5).fill(0).map((_, i) => (
        <div key={i} className="skeleton-table-row">
          <div className="skeleton skeleton-circle sm"></div>
          <div className="skeleton skeleton-text" style={{ flex: 2 }}></div>
          <div className="skeleton skeleton-text short"></div>
          <div className="skeleton skeleton-text" style={{ flex: 1 }}></div>
        </div>
      ))}
    </div>
  );
}

function WidgetSkeleton() {
  return (
    <div className="skeleton-widget">
      <div className="skeleton skeleton-circle"></div>
      <div style={{ flex: 1 }}>
        <div className="skeleton skeleton-text short"></div>
        <div className="skeleton skeleton-text" style={{ marginTop: 6 }}></div>
      </div>
    </div>
  );
}

function StatSkeleton() {
  return (
    <div className="skeleton-card" style={{ gap: 8 }}>
      <div className="skeleton skeleton-text short"></div>
      <div className="skeleton skeleton-number"></div>
      <div className="skeleton skeleton-text" style={{ width: '70%', height: 8, marginTop: 4 }}></div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="skeleton-chart">
      {Array(7).fill(0).map((_, i) => (
        <div key={i} className="skeleton-bar"></div>
      ))}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="skeleton-card">
      {Array(4).fill(0).map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
          <div className="skeleton skeleton-circle sm"></div>
          <div style={{ flex: 1 }}>
            <div className="skeleton skeleton-text" style={{ width: '80%', marginBottom: 4 }}></div>
            <div className="skeleton skeleton-text short" style={{ height: 8 }}></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="skeleton-card" style={{ alignItems: 'center', textAlign: 'center' }}>
      <div className="skeleton skeleton-circle lg skeleton-pulse"></div>
      <div className="skeleton skeleton-title" style={{ width: '40%', margin: '8px auto 0' }}></div>
      <div className="skeleton skeleton-text short" style={{ margin: '0 auto' }}></div>
      <div style={{ display: 'flex', gap: 8, marginTop: 8, width: '100%' }}>
        <div className="skeleton skeleton-button" style={{ flex: 1 }}></div>
        <div className="skeleton skeleton-button" style={{ flex: 1 }}></div>
      </div>
    </div>
  );
}

export default SkeletonLoader;