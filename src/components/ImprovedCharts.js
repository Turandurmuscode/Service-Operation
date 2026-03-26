import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import Icon from './Icon';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function ImprovedCharts({ clients, incidents }) {
  // Müşteri başına arıza sayısı
  const getIncidentsPerClient = () => {
    const clientIncidentCount = {};
    
    clients.forEach(client => {
      const count = incidents.filter(inc => inc.clientId === client.id).length;
      clientIncidentCount[client.name] = count;
    });
    
    return clientIncidentCount;
  };

  // Son 7 günün arızaları
  const getDailyIncidents = () => {
    const dailyCount = {};
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('tr-TR', { 
        month: 'short', 
        day: 'numeric' 
      });
      dailyCount[dateStr] = 0;
    }
    
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

  // Öncelik dağılımı
  const getPriorityDistribution = () => {
    const distribution = {
      'Düşük': incidents.filter(inc => inc.priority === 'low').length,
      'Orta': incidents.filter(inc => inc.priority === 'medium').length,
      'Kritik': incidents.filter(inc => inc.priority === 'critical').length
    };
    return distribution;
  };

  // Kategori dağılımı
  const getCategoryDistribution = () => {
    const distribution = {
      'Yazılım': incidents.filter(inc => inc.category === 'software').length,
      'Donanım': incidents.filter(inc => inc.category === 'hardware').length,
      'Network': incidents.filter(inc => inc.category === 'network').length,
      'Diğer': incidents.filter(inc => inc.category === 'other').length
    };
    return distribution;
  };

  const clientData = getIncidentsPerClient();
  const dailyData = getDailyIncidents();
  const priorityData = getPriorityDistribution();
  const categoryData = getCategoryDistribution();

  // Bar Chart - Gradient
  const barChartData = {
    labels: Object.keys(clientData),
    datasets: [{
      label: 'Arıza Sayısı',
      data: Object.values(clientData),
      backgroundColor: 'rgba(34, 94, 168, 0.72)',
      borderColor: 'rgba(34, 94, 168, 1)',
      borderWidth: 2,
      borderRadius: 8,
      hoverBackgroundColor: 'rgba(26, 78, 149, 0.92)',
    }]
  };

  // Area Chart
  const areaChartData = {
    labels: Object.keys(dailyData),
    datasets: [{
      label: 'Günlük Arızalar',
      data: Object.values(dailyData),
      fill: true,
      backgroundColor: 'rgba(34, 94, 168, 0.16)',
      borderColor: 'rgba(34, 94, 168, 1)',
      borderWidth: 3,
      tension: 0.4,
      pointBackgroundColor: 'rgba(34, 94, 168, 1)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
    }]
  };

  // Doughnut Chart - Öncelik
  const doughnutChartData = {
    labels: Object.keys(priorityData),
    datasets: [{
      data: Object.values(priorityData),
      backgroundColor: [
        'rgba(21, 128, 61, 0.78)',
        'rgba(180, 83, 9, 0.75)',
        'rgba(185, 28, 28, 0.76)',
      ],
      borderColor: [
        'rgba(21, 128, 61, 1)',
        'rgba(180, 83, 9, 1)',
        'rgba(185, 28, 28, 1)',
      ],
      borderWidth: 2,
      hoverOffset: 10
    }]
  };

  // Doughnut Chart - Kategori
  const categoryChartData = {
    labels: Object.keys(categoryData),
    datasets: [{
      data: Object.values(categoryData),
      backgroundColor: [
        'rgba(30, 64, 175, 0.78)',
        'rgba(22, 78, 99, 0.74)',
        'rgba(55, 65, 81, 0.74)',
        'rgba(107, 114, 128, 0.74)',
      ],
      borderColor: [
        'rgba(30, 64, 175, 1)',
        'rgba(22, 78, 99, 1)',
        'rgba(55, 65, 81, 1)',
        'rgba(107, 114, 128, 1)',
      ],
      borderWidth: 2,
      hoverOffset: 10
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: 15,
          font: {
            size: 12,
            weight: '600'
          },
          color: 'rgba(255, 255, 255, 0.8)'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        displayColors: true,
        boxPadding: 6
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: 'rgba(255, 255, 255, 0.6)',
          font: {
            size: 11
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false
        }
      },
      x: {
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)',
          font: {
            size: 11
          }
        },
        grid: {
          display: false
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12,
            weight: '600'
          },
          color: 'rgba(255, 255, 255, 0.8)',
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        }
      }
    },
    cutout: '65%'
  };

  if (incidents.length === 0) {
    return (
      <div className="card">
        <h2><Icon name="chart" size={16} /> Analiz Grafikleri</h2>
        <p style={{ textAlign: 'center', color: '#94a3b8', padding: '40px', fontSize: '14px' }}>
          Grafik göstermek için önce arıza kaydı oluşturun.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="card">
        <h2><Icon name="user" size={16} /> Müşteri Bazlı Dağılım</h2>
        <div style={{ height: '280px', marginTop: '16px' }}>
          <Bar data={barChartData} options={chartOptions} />
        </div>
      </div>

      <div className="card">
        <h2><Icon name="chart" size={16} /> Günlük Trend</h2>
        <div style={{ height: '280px', marginTop: '16px' }}>
          <Line data={areaChartData} options={chartOptions} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        <div className="card">
          <h2><Icon name="alert" size={16} /> Öncelik Dağılımı</h2>
          <div style={{ height: '260px', marginTop: '16px' }}>
            <Doughnut data={doughnutChartData} options={doughnutOptions} />
          </div>
        </div>

        <div className="card">
          <h2><Icon name="grid" size={16} /> Kategori Dağılımı</h2>
          <div style={{ height: '260px', marginTop: '16px' }}>
            <Doughnut data={categoryChartData} options={doughnutOptions} />
          </div>
        </div>
      </div>
    </>
  );
}

export default ImprovedCharts;