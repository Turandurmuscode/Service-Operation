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
          <div className="skeleton skeleton-text"></div>
          <div className="skeleton skeleton-text short"></div>
          <div className="skeleton skeleton-text"></div>
        </div>
      ))}
    </div>
  );
}

function WidgetSkeleton() {
  return (
    <div className="skeleton-widget">
      <div className="skeleton skeleton-circle"></div>
      <div>
        <div className="skeleton skeleton-text short"></div>
        <div className="skeleton skeleton-text"></div>
      </div>
    </div>
  );
}

function StatSkeleton() {
  return (
    <div className="skeleton-stat">
      <div className="skeleton skeleton-text short"></div>
      <div className="skeleton skeleton-number"></div>
    </div>
  );
}

export default SkeletonLoader;