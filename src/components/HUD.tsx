/**
 * Heads-up display showing speed and recording status
 */

import { SpeedLevel } from '../types';

interface HUDProps {
  isRecording: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  speedLevel: SpeedLevel;
  currentFrame: number;
  totalFrames: number;
  speed: number;
  targetFPS: number;
}

export function HUD({
  isRecording,
  isPlaying,
  isPaused,
  speedLevel,
  currentFrame,
  totalFrames,
  speed,
  targetFPS
}: HUDProps) {
  const getStatusText = () => {
    if (isPlaying) {
      return 'PLAYING';
    }
    if (isRecording) {
      return 'RECORDING';
    }
    return 'READY';
  };

  const getStatusColor = () => {
    if (isRecording) return '#ff4444';
    if (isPlaying) return '#44ff44';
    return '#ffffff';
  };

  const getSpeedText = () => {
    const speedNames = { 1: 'SLOW', 2: 'MEDIUM', 3: 'FAST' };
    return `${speedNames[speedLevel]} (${speed.toFixed(1)})`;
  };

  const getTimeText = () => {
    if (totalFrames === 0) return '0.00s';
    const timeInSeconds = currentFrame / targetFPS;
    return `${timeInSeconds.toFixed(2)}s`;
  };

  const getTotalTimeText = () => {
    if (totalFrames === 0) return '0.00s';
    const totalTimeInSeconds = totalFrames / targetFPS;
    return `${totalTimeInSeconds.toFixed(2)}s`;
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '12px 16px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#ffffff',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        minWidth: '200px'
      }}
    >
      <div style={{ marginBottom: '8px' }}>
        <div style={{ color: getStatusColor(), fontWeight: 'bold' }}>
          {getStatusText()}
        </div>
      </div>
      
      <div style={{ marginBottom: '4px' }}>
        Speed: {getSpeedText()}
      </div>
      
      <div style={{ marginBottom: '4px' }}>
        Frame: {currentFrame} / {totalFrames}
      </div>
      
      <div style={{ marginBottom: '4px' }}>
        Time: {getTimeText()} / {getTotalTimeText()}
      </div>
      
      {isPlaying && (
        <div style={{ marginBottom: '4px' }}>
          Progress: {totalFrames > 0 ? Math.round((currentFrame / totalFrames) * 100) : 0}%
        </div>
      )}
      
      <div style={{ marginBottom: '4px', fontSize: '12px', color: '#cccccc' }}>
        FPS: {targetFPS}
      </div>
      
      <div style={{ fontSize: '12px', color: '#cccccc', marginTop: '8px' }}>
        Controls:
        <br />• WASD: Move
        <br />• Q/E: Up/Down
        <br />• Left Mouse: Look around
        <br />• Scroll Wheel: Speed up/down
        <br />• 1/2/3: Speed levels
        <br />• R: Reset
      </div>
    </div>
  );
}
