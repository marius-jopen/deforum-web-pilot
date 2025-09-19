/**
 * Modal for displaying and copying Deforum schedule values
 */

import { DeforumSchedules } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  schedules: DeforumSchedules | null;
  onClose: () => void;
  onCopyValue: (value: string) => void;
}

export function ExportModal({ isOpen, schedules, onClose, onCopyValue }: ExportModalProps) {
  if (!isOpen || !schedules) return null;

  const scheduleEntries = [
    { key: 'Translation X', value: schedules.translation_x },
    { key: 'Translation Y', value: schedules.translation_y },
    { key: 'Translation Z', value: schedules.translation_z },
    { key: 'Rotation 3D X', value: schedules.rotation_3d_x },
    { key: 'Rotation 3D Y', value: schedules.rotation_3d_y },
    { key: 'Rotation 3D Z', value: schedules.rotation_3d_z },
    { key: 'FOV', value: schedules.fov }
  ];

  const handleCopyValue = (value: string) => {
    onCopyValue(value);
  };

  const handleCopyAll = () => {
    const allValues = scheduleEntries
      .map(entry => `${entry.key}: ${entry.value}`)
      .join('\n');
    onCopyValue(allValues);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#1a1a1a',
          border: '2px solid #444',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '80vh',
          overflowY: 'auto',
          fontFamily: 'monospace',
          color: '#fff'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#fff' }}>
            Deforum Schedules
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px 8px'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={handleCopyAll}
            style={{
              background: '#333',
              border: '1px solid #555',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              marginBottom: '16px'
            }}
          >
            📋 Copy All Values
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {scheduleEntries.map((entry, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '12px 16px',
              backgroundColor: '#2a2a2a',
              borderRadius: '8px',
              border: '1px solid #444'
            }}>
              <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                {entry.key}
              </span>
              <button
                onClick={() => handleCopyValue(entry.value)}
                style={{
                  background: '#444',
                  border: '1px solid #666',
                  color: '#fff',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#555'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#444'}
              >
                🔄 Copy
              </button>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '20px', fontSize: '12px', color: '#888', textAlign: 'center' }}>
          Click any copy button to copy the schedule value to clipboard
        </div>
      </div>
    </div>
  );
}
