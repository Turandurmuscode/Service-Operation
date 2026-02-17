import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

// Chart.js modüllerini kaydet
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Charts({ clients, incidents }) {
  // Müşteri başına arıza sayısı hesapla
  const getIncidentsPerClient = () => {
    const clientIncidentCount = {};
    
    clients.forEach(client => {
      const count = incidents.filter(inc => inc.clientId === client.id).length;
      clientIncidentCount[client.name] = count;
    });
    
    return clientIncidentCount;
  };

  // Son 7 günün günlük arıza sayılarını hesapla
  const getDailyIncidents = () => {
    const dailyCount = {};
    
    // Son 7 günü oluştur
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('tr-TR', { 
        month: 'short', 
        day: 'numeric' 
      });
      dailyCount[dateStr] = 0;
    }
    
    // Her incident'i günlere dağıt
    incidents.forEach(inc => {
      const incDate = new Date(inc.startTime);
      const dateStr = incDate.toLocaleDateString('tr-TR', { 
        month: 'short', 
        day: 'numeric' 
      });
      
      if (dailyCount.hasOwnProperty(dateStr)) {
        dailyCount[dateStr]++;
      }
    });
    
    return dailyCount;
  };

  const clientData = getIncidentsPerClient();
  const dailyData = getDailyIncidents();

  // Bar Chart verisi - Müşteri başına arıza
  const barChartData = {
    labels: Object.keys(clientData),
    datasets: [
      {
        label: 'Arıza Sayısı',
        data: Object.values(clientData),
        backgroundColor: 'rgba(102, 126, 234, 0.8)',
        borderColor: 'rgba(102, 126, 234, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Line Chart verisi - Günlük trend
  const lineChartData = {
    labels: Object.keys(dailyData),
    datasets: [
      {
        label: 'Günlük Arızalar',
        data: Object.values(dailyData),
        fill: true,
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        borderColor: 'rgba(76, 175, 80, 1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  return (
    <div className="card">
      <h2>Analiz Grafikleri</h2>
      
      {incidents.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
          Grafik göstermek için önce arıza kaydı oluşturun.
        </p>
      ) : (
        <>
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '16px', color: '#666' }}>
              Müşteri Bazında Arıza Dağılımı
            </h3>
            <div style={{ height: '250px' }}>
              <Bar data={barChartData} options={chartOptions} />
            </div>
          </div>
          
          <div>
            <h3 style={{ fontSize: '16px', marginBottom: '16px', color: '#666' }}>
              Son 7 Günlük Arıza Trendi
            </h3>
            <div style={{ height: '250px' }}>
              <Line data={lineChartData} options={chartOptions} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Charts;