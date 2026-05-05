import React, { useEffect, useState } from 'react';

export default function Toast({ message, type = 'info', onClose, duration = 3000 }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', advance: '🎉' };
  const colors = {
    info: 'var(--border-accent)',
    success: 'rgba(61,255,160,0.3)',
    warning: 'rgba(255,181,71,0.3)',
    advance: 'rgba(155,109,255,0.4)',
  };

  return (
    <div
      className="toast"
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s',
        borderColor: colors[type] || 'var(--border-accent)',
      }}
    >
      <span style={{ fontSize: 20 }}>{icons[type] || 'ℹ️'}</span>
      <span>{message}</span>
    </div>
  );
}
