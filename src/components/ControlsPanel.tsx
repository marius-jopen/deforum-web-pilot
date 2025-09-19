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
  onStartRecording: () => void;
  onStopRecording: () => void;
  onStartPlayback: () => void;
  onStopPlayback: () => void;
  onResetCamera: () => void;
  onSetTargetFPS: (fps: number) => void;
  onSetMouseSensitivity: (sensitivity: number) => void;
  onSetMoveSpeed: (unitsPerSecond: number) => void;
  onSetCameraParams: (params: { fov?: number; near?: number; far?: number }) => void;
  onApplySmoothing: (options: SmoothingOptions) => void;
  onRevertSmoothing: () => void;
  onExportSchedules: (options: ExportOptions) => Promise<{schedules: DeforumSchedules, json: string, pretty: string}>;
}

export function ControlsPanel({
  isRecording,
  isPlaying,
  totalFrames,
  onStartRecording,
  onStopRecording,
  onStartPlayback,
  onStopPlayback,
  onResetCamera,
  onSetTargetFPS,
  onSetMouseSensitivity,
  onSetMoveSpeed,
  onApplySmoothing,
  onRevertSmoothing,
  onExportSchedules
}: ControlsPanelProps) {
  const [targetFPS, setTargetFPS] = useState(20);
  const [speedSlider, setSpeedSlider] = useState(1.0);
  const [mouseSensitivity, setMouseSensitivity] = useState(0.0001);
  const [simpleSmoothing, setSimpleSmoothing] = useState(0);
  const [smoothingOptions] = useState<SmoothingOptions>({
    method: 'average',
    windowSize: 5,
    iterations: 1,
    nonDestructive: true
  });
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    frameStart: 0,
    frameEnd: Math.max(0, totalFrames - 1),
    frameStep: 1,
    axisScaleX: 1.0,  // Scaling to match reference file (0.1-7 range)
    axisScaleY: 1.0,  // Scaling to match reference file (0.1-7 range)
    axisScaleZ: 1.0,  // Scaling to match reference file (0.1-7 range)
    includeEmptyFrames: true,
    preferAngleOverLens: true,
    cadence: 4,
    masterScaleTranslate: 10,
    masterScaleRotate: 1.5
  });
  const [exportedSchedules, setExportedSchedules] = useState<DeforumSchedules | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  // Removed unused fov state
  const [appliedFlash, setAppliedFlash] = useState(false);
  const [revertedFlash, setRevertedFlash] = useState(false);
  const applyTimerRef = useRef<number | null>(null);
  const revertTimerRef = useRef<number | null>(null);


  const handleTargetFPSChange = (fps: number) => {
    setTargetFPS(fps);
    onSetTargetFPS(fps);
  };

  // Removed unused handler

  const handleExportOptionsChange = (key: keyof ExportOptions, value: any) => {
    setExportOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleApplySmoothing = (opts?: SmoothingOptions) => {
    const toApply = opts ?? smoothingOptions;
    onApplySmoothing(toApply);
    setAppliedFlash(true);
    if (applyTimerRef.current) {
      window.clearTimeout(applyTimerRef.current);
    }
    applyTimerRef.current = window.setTimeout(() => setAppliedFlash(false), 1000);
  };

  const handleRevertSmoothing = () => {
    onRevertSmoothing();
    setRevertedFlash(true);
    if (revertTimerRef.current) {
      window.clearTimeout(revertTimerRef.current);
    }
    revertTimerRef.current = window.setTimeout(() => setRevertedFlash(false), 1000);
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
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
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

  // Live smoothing: 0 = revert; >0 applies stronger average
  useEffect(() => {
    if (totalFrames <= 0) return;
    if (simpleSmoothing <= 0) {
      onRevertSmoothing();
      return;
    }
    const windowSize = Math.max(1, Math.round(1 + (simpleSmoothing / 100) * 49));
    const iterations = Math.max(1, Math.round(1 + (simpleSmoothing / 100) * 9));
    const newOptions: SmoothingOptions = {
      method: 'average',
      windowSize,
      iterations,
      nonDestructive: true
    };
    onApplySmoothing(newOptions);
  }, [simpleSmoothing, totalFrames, onApplySmoothing, onRevertSmoothing]);

  useEffect(() => {
    return () => {
      if (applyTimerRef.current) window.clearTimeout(applyTimerRef.current);
      if (revertTimerRef.current) window.clearTimeout(revertTimerRef.current);
    };
  }, []);

  // No standalone input style needed

  const buttonStyle: React.CSSProperties = {
    padding: '8px 12px',
    margin: '2px',
    border: 'none',
    borderRadius: '999px',
    backgroundColor: '#ffffff',
    color: '#000000',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'background-color 0.15s, color 0.15s'
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: '16px',
    padding: '12px',
    border: 'none',
    borderRadius: '12px',
    backgroundColor: '#efd7fd'
  };

  const pastelRed = '#ffb3b3';
  const pastelGreen = '#b6e3b6';

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
        background: '#f4e1ff',
        padding: '16px',
        borderRadius: '16px',
        border: 'none',
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#000000'
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
              backgroundColor: isRecording ? pastelRed : buttonStyle.backgroundColor,
              flex: 1
            }}
            onClick={isRecording ? onStopRecording : onStartRecording}
            onMouseOver={(e) => { if (!isRecording) { e.currentTarget.style.backgroundColor = '#000000'; e.currentTarget.style.color = '#ffffff'; } }}
            onMouseOut={(e) => { if (!isRecording) { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.color = '#000000'; } }}
            disabled={isPlaying}
          >
            {isRecording ? 'Stop' : 'Record'}
          </button>
          
          <button
            style={{
              ...buttonStyle,
              backgroundColor: isPlaying ? pastelGreen : buttonStyle.backgroundColor,
              flex: 1
            }}
            onClick={isPlaying ? onStopPlayback : onStartPlayback}
            onMouseOver={(e) => { if (!isPlaying) { e.currentTarget.style.backgroundColor = '#000000'; e.currentTarget.style.color = '#ffffff'; } }}
            onMouseOut={(e) => { if (!isPlaying) { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.color = '#000000'; } }}
            disabled={isRecording || totalFrames === 0}
          >
            {isPlaying ? 'Stop' : 'Play'}
          </button>
        </div>

        <button
          style={{ ...buttonStyle, width: '100%', marginBottom: '8px' }}
          onClick={onResetCamera}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#000000'; e.currentTarget.style.color = '#ffffff'; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.color = '#000000'; }}
        >
          Reset Camera
        </button>

        <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>
            Sampler FPS: {targetFPS}
          </label>
          <input
            type="range"
            min={1}
            max={120}
            step={1}
            value={targetFPS}
            onChange={(e) => handleTargetFPSChange(Number(e.target.value))}
            style={{ width: '100%', margin: '6px 0 0 0' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>
            Speed: {speedSlider.toFixed(1)}
          </label>
          <input
            type="range"
            min="0.05"
            max="10"
            step="0.05"
            value={speedSlider}
            onChange={(e) => {
              const newSpeed = Number(e.target.value);
              setSpeedSlider(newSpeed);
              onSetMoveSpeed(newSpeed);
            }}
            style={{
              width: '100%',
              margin: '4px 0'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px' }}>
            Mouse Sensitivity: {(mouseSensitivity * 1000).toFixed(1)}
          </label>
          <input
            type="range"
            min="0.00001"
            max="0.005"
            step="0.00001"
            value={mouseSensitivity}
            onChange={(e) => {
              const newSensitivity = Number(e.target.value);
              setMouseSensitivity(newSensitivity);
              onSetMouseSensitivity(newSensitivity);
            }}
            style={{
              width: '100%',
              margin: '4px 0'
            }}
          />
        </div>

        {/* FOV control removed per request */}
      </div>

      {/* Post Controls */}
      <div style={sectionStyle}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Post</h3>
        
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

        <div style={{ marginTop: '8px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>
            Translate Scale: {exportOptions.masterScaleTranslate ?? 0}
          </label>
          <input
            type="range"
            min={-20}
            max={20}
            step={0.01}
            value={exportOptions.masterScaleTranslate ?? 0}
            onChange={(e) => handleExportOptionsChange('masterScaleTranslate', Number(e.target.value))}
            style={{ width: '100%', margin: '4px 0' }}
          />
        </div>

        <div style={{ marginTop: '8px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>
            Rotation Scale: {exportOptions.masterScaleRotate ?? 0}
          </label>
          <input
            type="range"
            min={-10}
            max={10}
            step={0.01}
            value={exportOptions.masterScaleRotate ?? 0}
            onChange={(e) => handleExportOptionsChange('masterScaleRotate', Number(e.target.value))}
            style={{ width: '100%', margin: '4px 0' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            style={{
              ...buttonStyle,
              flex: 1,
              backgroundColor: appliedFlash ? pastelGreen : buttonStyle.backgroundColor
            }}
            onClick={() => {
              // Convert percentage to window size (0-100% = 1-50 window size, much stronger at 100%)
              const windowSize = Math.max(1, Math.round(1 + (simpleSmoothing / 100) * 49));
              const iterations = Math.max(1, Math.round(1 + (simpleSmoothing / 100) * 9));
              
              const newOptions: SmoothingOptions = {
                method: 'average',
                windowSize,
                iterations,
                nonDestructive: true
              };
              
              handleApplySmoothing(newOptions);
            }}
            onMouseOver={(e) => { if (!appliedFlash) { e.currentTarget.style.backgroundColor = '#000000'; e.currentTarget.style.color = '#ffffff'; } }}
            onMouseOut={(e) => { if (!appliedFlash) { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.color = '#000000'; } }}
            disabled={false}
          >
            {appliedFlash ? '✅ Applied' : 'Apply'}
          </button>
          
          <button
            style={{
              ...buttonStyle,
              flex: 1,
              backgroundColor: revertedFlash ? pastelGreen : buttonStyle.backgroundColor
            }}
            onClick={handleRevertSmoothing}
            onMouseOver={(e) => { if (!revertedFlash) { e.currentTarget.style.backgroundColor = '#000000'; e.currentTarget.style.color = '#ffffff'; } }}
            onMouseOut={(e) => { if (!revertedFlash) { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.color = '#000000'; } }}
            disabled={false}
          >
            {revertedFlash ? '✅ Reverted' : 'Revert'}
          </button>
        </div>
      </div>

      {/* Export Controls (cadence removed) */}
      <div style={sectionStyle}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Export</h3>
        <button
          style={{ ...buttonStyle, width: '100%', marginBottom: '8px' }}
          onClick={handleExportSchedules}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#000000'; e.currentTarget.style.color = '#ffffff'; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.color = '#000000'; }}
          disabled={false}
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
