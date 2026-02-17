import React from 'react';
import ImprovedCharts from '../components/ImprovedCharts';
import DateRangeFilter from '../components/DateRangeFilter';

function AnalyticsPage({ clients, incidents }) {
  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>📈 Detaylı Analiz</h1>
          <p>Grafik ve raporlar ile verilerinizi analiz edin</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '16px' }}>
        <h2>📅 Tarih Aralığı</h2>
        <DateRangeFilter onFilterChange={(date) => console.log(date)} />
      </div>

      <ImprovedCharts clients={clients} incidents={incidents} />
    </div>
  );
}

export default AnalyticsPage;