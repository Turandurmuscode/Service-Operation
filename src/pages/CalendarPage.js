import React, { useState } from 'react';
import './CalendarPage.css';
import Icon from '../components/Icon';

function CalendarPage({ incidents, clients }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getIncidentsForDay = (day) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    return incidents.filter(inc => {
      const incDate = new Date(inc.startTime);
      return incDate.getDate() === day &&
             incDate.getMonth() === month &&
             incDate.getFullYear() === year;
    });
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1));
  };

  const today = new Date();
  const isToday = (day) => {
    return day === today.getDate() && 
           month === today.getMonth() && 
           year === today.getFullYear();
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1><Icon name="calendar" size={20} style={{ marginRight: 8 }} /> Arıza Takvimi</h1>
          <p>Arızaları takvim görünümünde takip et</p>
        </div>
      </div>

      <div className="card">
        <div className="calendar-header">
          <button onClick={previousMonth} className="calendar-nav-btn">←</button>
          <h2>{monthNames[month]} {year}</h2>
          <button onClick={nextMonth} className="calendar-nav-btn">→</button>
        </div>

        <div className="calendar-grid">
          {dayNames.map(day => (
            <div key={day} className="calendar-day-name">{day}</div>
          ))}

          {Array(startingDayOfWeek).fill(null).map((_, index) => (
            <div key={`empty-${index}`} className="calendar-day empty"></div>
          ))}

          {Array(daysInMonth).fill(null).map((_, index) => {
            const day = index + 1;
            const dayIncidents = getIncidentsForDay(day);
            const criticalCount = dayIncidents.filter(inc => inc.priority === 'critical').length;
            
            return (
              <div 
                key={day} 
                className={`calendar-day ${isToday(day) ? 'today' : ''} ${dayIncidents.length > 0 ? 'has-incidents' : ''}`}
              >
                <div className="calendar-day-number">{day}</div>
                {dayIncidents.length > 0 && (
                  <div className="calendar-day-incidents">
                    <div className="incident-dots">
                      {dayIncidents.slice(0, 3).map((inc, idx) => (
                        <div 
                          key={idx}
                          className="incident-dot"
                          style={{ 
                            background: inc.priority === 'critical' ? '#ef4444' : 
                                       inc.priority === 'medium' ? '#f59e0b' : '#10b981'
                          }}
                          title={inc.description}
                        />
                      ))}
                      {dayIncidents.length > 3 && (
                        <span className="incident-more">+{dayIncidents.length - 3}</span>
                      )}
                    </div>
                    {criticalCount > 0 && (
                      <div className="critical-badge"><span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><span style={{ width: 10, height: 10, borderRadius: 10, background: '#ef4444', display: 'inline-block' }}></span> {criticalCount}</span></div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-dot" style={{ background: '#ef4444' }}></div>
          <span>Kritik</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: '#f59e0b' }}></div>
          <span>Orta</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: '#10b981' }}></div>
          <span>Düşük</span>
        </div>
      </div>
    </div>
  );
}

export default CalendarPage;