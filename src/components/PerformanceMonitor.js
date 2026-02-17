import React, { useState, useEffect } from 'react';
import './PerformanceMonitor.css';

function PerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderCount: 0,
    memoryUsage: 0,
    fps: 60
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Sayfa yükleme süresi
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    
    // Memory kullanımı (sadece Chrome'da çalışır)
    const updateMemory = () => {
      if (performance.memory) {
        const used = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
        setMetrics(prev => ({ ...prev, memoryUsage: used, loadTime: loadTime }));
      }
    };

    // FPS hesaplama
    let fps = 0;
    let lastTime = performance.now();
    let frames = 0;

    const measureFPS = () => {
      frames++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        fps = Math.round((frames * 1000) / (currentTime - lastTime));
        setMetrics(prev => ({ ...prev, fps }));
        frames = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };

    updateMemory();
    measureFPS();
    
    const interval = setInterval(updateMemory, 2000);
    return () => clearInterval(interval);
  }, []);

  // Render sayısını artır
  useEffect(() => {
    setMetrics(prev => ({ ...prev, renderCount: prev.renderCount + 1 }));
  });

  const getPerformanceLevel = () => {
    if (metrics.fps >= 55) return { text: 'Mükemmel', color: '#10b981' };
    if (metrics.fps >= 45) return { text: 'İyi', color: '#f59e0b' };
    return { text: 'Yavaş', color: '#ef4444' };
  };

  const performanceLevel = getPerformanceLevel();

  return (
    <div className="performance-monitor">
      <button 
        className="performance-trigger"
        onClick={() => setIsOpen(!isOpen)}
        title="Performans İstatistikleri"
      >
        <span className="performance-indicator" style={{ background: performanceLevel.color }}></span>
        <span className="performance-fps">{metrics.fps}</span>
      </button>

      {isOpen && (
        <div className="performance-panel">
          <div className="performance-header">
            <h3>⚡ Performans</h3>
            <button onClick={() => setIsOpen(false)} className="performance-close">✕</button>
          </div>

          <div className="performance-metrics">
            <div className="performance-metric">
              <span className="metric-icon">🚀</span>
              <div className="metric-content">
                <div className="metric-label">Yükleme Süresi</div>
                <div className="metric-value">{(metrics.loadTime / 1000).toFixed(2)}s</div>
              </div>
            </div>

            <div className="performance-metric">
              <span className="metric-icon">🎯</span>
              <div className="metric-content">
                <div className="metric-label">FPS</div>
                <div className="metric-value" style={{ color: performanceLevel.color }}>
                  {metrics.fps} <span className="metric-status">{performanceLevel.text}</span>
                </div>
              </div>
            </div>

            <div className="performance-metric">
              <span className="metric-icon">💾</span>
              <div className="metric-content">
                <div className="metric-label">Bellek Kullanımı</div>
                <div className="metric-value">{metrics.memoryUsage} MB</div>
              </div>
            </div>

            <div className="performance-metric">
              <span className="metric-icon">🔄</span>
              <div className="metric-content">
                <div className="metric-label">Render Sayısı</div>
                <div className="metric-value">{metrics.renderCount}</div>
              </div>
            </div>
          </div>

          <div className="performance-tips">
            <div className="performance-tip">
              💡 {metrics.fps < 45 ? 'Performansı artırmak için bazı özellikleri kapatmayı deneyin' : 
                   'Sistem sorunsuz çalışıyor'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PerformanceMonitor;