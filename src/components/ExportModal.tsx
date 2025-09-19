/**
 * Modal for displaying and copying Deforum schedule values
 */

import { useState } from 'react';
import { DeforumSchedules } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  schedules: DeforumSchedules | null;
  onClose: () => void;
  onCopyValue: (value: string) => void;
  extraSchedules?: { fov: string; near: string; far: string };
}

export function ExportModal({ isOpen, schedules, onClose, onCopyValue, extraSchedules }: ExportModalProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  if (!isOpen || !schedules) return null;

  const scheduleEntries = [
    { key: 'Translation X', value: schedules.translation_x },
    { key: 'Translation Y', value: schedules.translation_y },
    { key: 'Translation Z', value: schedules.translation_z },
    { key: 'Rotation 3D X', value: schedules.rotation_3d_x },
    { key: 'Rotation 3D Y', value: schedules.rotation_3d_y },
    { key: 'Rotation 3D Z', value: schedules.rotation_3d_z },
    ...(extraSchedules ? [
      { key: 'FOV', value: extraSchedules.fov },
      { key: 'Near', value: extraSchedules.near },
      { key: 'Far', value: extraSchedules.far }
    ] : [])
  ];

  const handleCopyValue = (value: string, index: number) => {
    onCopyValue(value);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1000); // Reset after 1 second
  };

  const handleCopyAll = () => {
    const allValues = scheduleEntries
      .map(entry => `${entry.key}: ${entry.value}`)
      .join('\n');
    onCopyValue(allValues);
    setCopiedIndex(-1); // Special index for "copy all"
    setTimeout(() => setCopiedIndex(null), 1000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#f4e1ff',
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
          backgroundColor: '#f5f5f5',
          border: 'none',
          borderRadius: '20px',
          padding: '24px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '80vh',
          overflowY: 'auto',
          fontFamily: 'monospace',
          color: '#000000'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#000000' }}>
            Deforum Schedules
          </h2>
          <button
            onClick={onClose}
            style={{
              background: '#000000',
              border: 'none',
              color: '#ffffff',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '999px'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={handleCopyAll}
            style={{
              background: copiedIndex === -1 ? '#4CAF50' : '#000000',
              border: 'none',
              color: '#ffffff',
              padding: '8px 16px',
              borderRadius: '999px',
              cursor: 'pointer',
              fontSize: '14px',
              marginBottom: '16px',
              transition: 'background-color 0.2s'
            }}
          >
            {copiedIndex === -1 ? '✅ Copied!' : '📋 Copy All Values'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {scheduleEntries.map((entry, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '12px 16px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: 'none'
            }}>
              <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                {entry.key}
              </span>
              <button
                onClick={() => handleCopyValue(entry.value, index)}
                style={{
                  background: copiedIndex === index ? '#4CAF50' : '#000000',
                  border: 'none',
                  color: '#ffffff',
                  padding: '8px 16px',
                  borderRadius: '999px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = copiedIndex === index ? '#4CAF50' : '#111111'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = copiedIndex === index ? '#4CAF50' : '#000000'}
              >
                {copiedIndex === index ? '✅ Copied!' : '🔄 Copy'}
              </button>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '20px', fontSize: '12px', color: '#303030', textAlign: 'center' }}>
          Click any copy button to copy the schedule value to clipboard
        </div>
      </div>
    </div>
  );
}
