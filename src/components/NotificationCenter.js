import React, { useState, useEffect } from 'react';
import './NotificationCenter.css';

const CRM_REMINDER_KEY = 'sod_crm_followup_reminders';

function readReminders() {
  try {
    return JSON.parse(localStorage.getItem(CRM_REMINDER_KEY)) || [];
  } catch {
    return [];
  }
}

function NotificationCenter({ incidents, clients, onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const generateNotifications = () => {
      const notifs = [];
      const now = new Date();

      // Kritik arızalar için bildirim
      incidents.forEach(inc => {
        if (inc.status !== 'resolved' && inc.priority === 'critical') {
          const client = clients.find(c => c.id === inc.clientId);
          notifs.push({
            id: `critical-${inc.id}`,
            type: 'critical',
            title: 'Kritik Arıza!',
            message: `${client?.name || 'Müşteri'} - ${inc.description.substring(0, 50)}...`,
            timestamp: inc.startTime,
            read: false,
            icon: ''
          });
        }

        // SLA yaklaşıyor uyarısı
        if (inc.status !== 'resolved' && inc.slaDeadline) {
          const startTime = new Date(inc.startTime);
          const elapsedMinutes = Math.floor((now - startTime) / 1000 / 60);
          const remainingMinutes = inc.slaDeadline - elapsedMinutes;

          if (remainingMinutes <= 30 && remainingMinutes > 0) {
            const client = clients.find(c => c.id === inc.clientId);
            notifs.push({
              id: `sla-${inc.id}`,
              type: 'warning',
              title: 'SLA Yaklaşıyor!',
              message: `${client?.name || 'Müşteri'} - ${remainingMinutes} dakika kaldı`,
              timestamp: new Date().toISOString(),
              read: false,
              icon: ''
            });
          }
        }
      });

      // Yeni arızalar (son 1 saat)
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      incidents.forEach(inc => {
        const incTime = new Date(inc.startTime);
        if (incTime > oneHourAgo) {
          const client = clients.find(c => c.id === inc.clientId);
          notifs.push({
            id: `new-${inc.id}`,
            type: 'info',
            title: 'Yeni Arıza Kaydı',
            message: `${client?.name || 'Müşteri'} - ${inc.description.substring(0, 50)}...`,
            timestamp: inc.startTime,
            read: false,
            icon: ''
          });
        }
      });

      // CRM follow-up hatirlatmalari
      const today = now.toISOString().split('T')[0];
      readReminders()
        .filter((r) => r.status === 'pending' && r.followUpDate)
        .forEach((r) => {
          const isOverdue = r.followUpDate < today;
          notifs.push({
            id: `crm-followup-${r.id}`,
            type: isOverdue ? 'warning' : 'info',
            title: isOverdue ? 'Geciken CRM Takibi' : 'CRM Takibi Yaklaşıyor',
            message: `${r.title} - ${new Date(r.followUpDate).toLocaleDateString('tr-TR')}`,
            timestamp: r.createdAt || new Date().toISOString(),
            read: false,
            icon: isOverdue ? '' : '',
            actionTarget: 'crmdeals',
          });
        });

      // En yeniler üstte
      notifs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      const latest = notifs.slice(0, 10);
      setNotifications((prev) => {
        const previousReadMap = new Map(prev.map((n) => [n.id, n.read]));
        const merged = latest.map((n) => ({
          ...n,
          read: previousReadMap.get(n.id) || false,
        }));
        setUnreadCount(merged.filter((n) => !n.read).length);
        return merged;
      });
    };

    generateNotifications();
    const interval = setInterval(generateNotifications, 30000); // Her 30 saniyede güncelle

    return () => clearInterval(interval);
  }, [incidents, clients]);

  const markAsRead = (id, actionTarget) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    if (actionTarget) {
      onNavigate?.(actionTarget);
      setIsOpen(false);
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / 1000 / 60);
    
    if (diffMinutes < 1) return 'Az önce';
    if (diffMinutes < 60) return `${diffMinutes} dakika önce`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} saat önce`;
    return date.toLocaleDateString('tr-TR');
  };

  return (
    <div className="notification-center">
      <button 
        className="notification-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="notification-overlay" onClick={() => setIsOpen(false)} />
          <div className="notification-panel">
            <div className="notification-header">
              <h3>Bildirimler</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="mark-all-btn">
                    Tümünü Okundu
                  </button>
                )}
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="notification-close-btn"
                  title="Kapat"
                >
                  
                </button>
              </div>
            </div>

            <div className="notification-list">
              {notifications.length === 0 ? (
                <div className="notification-empty">
                  <span style={{ fontSize: '48px' }}></span>
                  <p>Henüz bildirim yok</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <div 
                    key={notif.id}
                    className={`notification-item ${notif.read ? 'read' : 'unread'} ${notif.type}`}
                    onClick={() => markAsRead(notif.id, notif.actionTarget)}
                  >
                    <div className="notification-icon">{notif.icon}</div>
                    <div className="notification-content">
                      <div className="notification-title">{notif.title}</div>
                      <div className="notification-body">{notif.message}</div>
                      <div className="notification-time">{formatTime(notif.timestamp)}</div>
                    </div>
                    {!notif.read && <div className="notification-dot"></div>}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default NotificationCenter;