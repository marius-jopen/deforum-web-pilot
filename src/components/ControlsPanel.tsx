/**
 * Main controls panel with all UI controls
 */

import { useState, useRef, useEffect } from 'react';
import { SmoothingOptions, ExportOptions, DeforumSchedules } from '../types';
import { ExportModal } from './ExportModal';

interface ControlsPanelProps {
  isRecording: boolean;
  isPlaying: boolean;
  totalFrames: number;
  currentFrame: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onStartPlayback: () => void;
  onStopPlayback: () => void;
  onResetCamera: () => void;
  onSetTargetFPS: (fps: number) => void;
  onApplySmoothing: (options: SmoothingOptions) => void;
  onRevertSmoothing: () => void;
  onExportSchedules: (options: ExportOptions) => Promise<{schedules: DeforumSchedules, json: string, pretty: string}>;
  onCopyJSON: (json: string) => void;
  onDownloadJSON: (json: string) => void;
  onDownloadSchedules: (schedules: string) => void;
}

export function ControlsPanel({
  isRecording,
  isPlaying,
  totalFrames,
  currentFrame,
  onStartRecording,
  onStopRecording,
  onStartPlayback,
  onStopPlayback,
  onResetCamera,
  onSetTargetFPS,
  onApplySmoothing,
  onRevertSmoothing,
  onExportSchedules,
  onCopyJSON,
  onDownloadJSON,
  onDownloadSchedules
}: ControlsPanelProps) {
  const [targetFPS, setTargetFPS] = useState(30);
  const [speedSlider, setSpeedSlider] = useState(1.0);
  const [simpleSmoothing, setSimpleSmoothing] = useState(0);
  const [smoothingOptions, setSmoothingOptions] = useState<SmoothingOptions>({
    method: 'average',
    windowSize: 5,
    iterations: 1,
    nonDestructive: true
  });
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    frameStart: 0,
    frameEnd: Math.max(0, totalFrames - 1),
    frameStep: 1,
    axisScaleX: 1.0,
    axisScaleY: 1.0,
    axisScaleZ: 1.0,
    includeEmptyFrames: true,
    preferAngleOverLens: true
  });
  const [exportedSchedules, setExportedSchedules] = useState<DeforumSchedules | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);


  const handleTargetFPSChange = (fps: number) => {
    setTargetFPS(fps);
    onSetTargetFPS(fps);
  };

  const handleSmoothingChange = (key: keyof SmoothingOptions, value: any) => {
    setSmoothingOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleExportOptionsChange = (key: keyof ExportOptions, value: any) => {
    setExportOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleApplySmoothing = () => {
    onApplySmoothing(smoothingOptions);
  };

  const handleRevertSmoothing = () => {
    onRevertSmoothing();
  };

  const handleExportSchedules = async () => {
    try {
      const result = await onExportSchedules(exportOptions);
      setExportedSchedules(result.schedules);
      setShowExportModal(true);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please check the console for details.');
    }
  };

  const handleCopyValue = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      alert('Value copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      alert('Failed to copy to clipboard');
    }
  };


  // Update frame end when total frames change
  useEffect(() => {
    if (totalFrames > 0) {
      setExportOptions(prev => ({
        ...prev,
        frameEnd: Math.max(0, totalFrames - 1)
      }));
    }
  }, [totalFrames]);

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '4px 8px',
    margin: '2px 0',
    border: '1px solid #444',
    borderRadius: '4px',
    backgroundColor: '#222',
    color: '#fff',
    fontSize: '12px'
  };

  const buttonStyle: React.CSSProperties = {
    padding: '8px 12px',
    margin: '2px',
    border: '1px solid #444',
    borderRadius: '4px',
    backgroundColor: '#333',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '12px'
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: '16px',
    padding: '12px',
    border: '1px solid #444',
    borderRadius: '6px',
    backgroundColor: 'rgba(0, 0, 0, 0.3)'
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        width: '320px',
        maxHeight: 'calc(100vh - 40px)',
        overflowY: 'auto',
        zIndex: 1000,
        background: 'rgba(0, 0, 0, 0.9)',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#ffffff'
      }}
    >
      <h2 style={{ margin: '0 0 16px 0', fontSize: '16px', textAlign: 'center' }}>
        Deforum Web Pilot
      </h2>

      {/* Session Controls */}
      <div style={sectionStyle}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Session</h3>
        
        <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
          <button
            style={{
              ...buttonStyle,
              backgroundColor: isRecording ? '#ff4444' : '#333',
              flex: 1
            }}
            onClick={isRecording ? onStopRecording : onStartRecording}
            disabled={isPlaying}
          >
            {isRecording ? 'Stop' : 'Record'}
          </button>
          
          <button
            style={{
              ...buttonStyle,
              backgroundColor: isPlaying ? '#ff4444' : '#333',
              flex: 1
            }}
            onClick={isPlaying ? onStopPlayback : onStartPlayback}
            disabled={isRecording || totalFrames === 0}
          >
            {isPlaying ? 'Stop' : 'Play'}
          </button>
        </div>

        <button
          style={{ ...buttonStyle, width: '100%', marginBottom: '8px' }}
          onClick={onResetCamera}
        >
          Reset Camera
        </button>

        <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>
            Sampler FPS:
          </label>
          <input
            type="number"
            value={targetFPS}
            onChange={(e) => handleTargetFPSChange(Number(e.target.value))}
            min="1"
            max="120"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>
            Speed: {speedSlider.toFixed(1)}
          </label>
          <input
            type="range"
            min="0.1"
            max="10"
            step="0.1"
            value={speedSlider}
            onChange={(e) => {
              const newSpeed = Number(e.target.value);
              setSpeedSlider(newSpeed);
              // Update pilot speed
              if (pilotRef.current) {
                pilotRef.current.setSpeed(newSpeed);
              }
            }}
            style={{
              width: '100%',
              margin: '4px 0'
            }}
          />
        </div>
      </div>

      {/* Post-smoothing Controls */}
      <div style={sectionStyle}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Post-smoothing</h3>
        
        <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>
            Smoothing: {simpleSmoothing}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={simpleSmoothing}
            onChange={(e) => setSimpleSmoothing(Number(e.target.value))}
            style={{
              width: '100%',
              margin: '4px 0'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            style={{ ...buttonStyle, flex: 1 }}
            onClick={() => {
              // Convert percentage to window size (0-100% = 1-20 window size)
              const windowSize = Math.max(1, Math.round(1 + (simpleSmoothing / 100) * 19));
              const iterations = Math.max(1, Math.round(1 + (simpleSmoothing / 100) * 4));
              
              const newOptions: SmoothingOptions = {
                method: 'average',
                windowSize,
                iterations,
                nonDestructive: true
              };
              
              handleApplySmoothing(newOptions);
            }}
            disabled={totalFrames === 0}
          >
            Apply
          </button>
          
          <button
            style={{ ...buttonStyle, flex: 1 }}
            onClick={handleRevertSmoothing}
            disabled={totalFrames === 0}
          >
            Revert
          </button>
        </div>
      </div>

      {/* Export Controls */}
      <div style={sectionStyle}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Export</h3>
        

        <button
          style={{ ...buttonStyle, width: '100%', marginBottom: '8px' }}
          onClick={handleExportSchedules}
          disabled={totalFrames === 0}
        >
          Export Schedules
        </button>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        schedules={exportedSchedules}
        onClose={() => setShowExportModal(false)}
        onCopyValue={handleCopyValue}
      />
    </div>
  );
}
