/**
 * Main App component that orchestrates all functionality
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { Scene } from './three/Scene';
import { HUD } from './components/HUD';
import { ControlsPanel } from './components/ControlsPanel';
import { Recorder } from './logic/recorder';
import { Pilot } from './logic/pilot';
import { Playback } from './logic/playback';
import { Exporter } from './logic/export';
import { SpeedLevel, SmoothingOptions, ExportOptions } from './types';
import * as THREE from 'three';

export function App() {
  // State
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);
  const [speedLevel, setSpeedLevel] = useState<SpeedLevel>(1);
  const [speed, setSpeed] = useState(1.0);
  const [targetFPS, setTargetFPS] = useState(30);

  // Refs for logic classes
  const recorderRef = useRef<Recorder | null>(null);
  const pilotRef = useRef<Pilot | null>(null);
  const playbackRef = useRef<Playback | null>(null);
  const exporterRef = useRef<Exporter | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Initialize logic classes
  useEffect(() => {
    recorderRef.current = new Recorder(30);
    exporterRef.current = new Exporter();
  }, []);

  // Initialize pilot when camera is ready
  const handleCameraReady = useCallback((camera: THREE.PerspectiveCamera) => {
    cameraRef.current = camera;
    pilotRef.current = new Pilot(camera);
    pilotRef.current.setSpeedLevel(1);
    setSpeed(pilotRef.current.getSpeed());
    
    if (recorderRef.current) {
      playbackRef.current = new Playback(recorderRef.current, 30);
    }
  }, []);

  // Main update loop
  const handleFrame = useCallback((camera: THREE.PerspectiveCamera, deltaTime: number) => {
    if (!recorderRef.current || !pilotRef.current) return;

    // Update pilot controls
    pilotRef.current.update(deltaTime);
    
    // Update speed display
    setSpeed(pilotRef.current.getSpeed());
    setSpeedLevel(pilotRef.current.getSpeedLevel());

    // Update recorder
    recorderRef.current.update(camera, deltaTime);
    
    // Update playback
    if (isPlaying && playbackRef.current) {
      const playbackUpdated = playbackRef.current.update(deltaTime);
      if (!playbackUpdated) {
        // Playback ended
        setIsPlaying(false);
        setCurrentFrame(0);
      } else {
        setCurrentFrame(playbackRef.current.getCurrentFrame());
        
        // Apply camera state from playback
        const cameraState = playbackRef.current.getCurrentCameraState();
        if (cameraState) {
          pilotRef.current.setCameraState(
            cameraState.position,
            cameraState.rotation,
            cameraState.fov
          );
        }
      }
    }

    // Update frame counts
    setTotalFrames(recorderRef.current.getTotalFrames());
  }, [isPlaying]);

  // Recording controls
  const handleStartRecording = useCallback(() => {
    if (recorderRef.current && !isPlaying) {
      recorderRef.current.startRecording();
      setIsRecording(true);
      setCurrentFrame(0);
    }
  }, [isPlaying]);

  const handleStopRecording = useCallback(() => {
    if (recorderRef.current) {
      recorderRef.current.stopRecording();
      setIsRecording(false);
      setTotalFrames(recorderRef.current.getTotalFrames());
    }
  }, []);

  // Playback controls
  const handleStartPlayback = useCallback(() => {
    if (playbackRef.current && !isRecording && totalFrames > 0) {
      playbackRef.current.startPlayback();
      setIsPlaying(true);
      setCurrentFrame(0);
    }
  }, [isRecording, totalFrames]);

  const handleStopPlayback = useCallback(() => {
    if (playbackRef.current) {
      playbackRef.current.stopPlayback();
      setIsPlaying(false);
      setCurrentFrame(0);
    }
  }, []);

  // Camera controls
  const handleResetCamera = useCallback(() => {
    if (pilotRef.current) {
      pilotRef.current.resetCamera();
    }
  }, []);

  // FPS controls
  const handleSetTargetFPS = useCallback((fps: number) => {
    setTargetFPS(fps);
    if (recorderRef.current && playbackRef.current) {
      recorderRef.current.setTargetFPS(fps);
      playbackRef.current.setTargetFPS(fps);
    }
  }, []);

  // Smoothing controls
  const handleApplySmoothing = useCallback((options: SmoothingOptions) => {
    if (recorderRef.current) {
      recorderRef.current.applySmoothing(options);
    }
  }, []);

  const handleRevertSmoothing = useCallback(() => {
    if (recorderRef.current) {
      recorderRef.current.revertSmoothing();
    }
  }, []);

  // Export controls
  const handleExportSchedules = useCallback(async (options: ExportOptions) => {
    if (recorderRef.current && exporterRef.current) {
      const channelArrays = recorderRef.current.getChannelArrays();
      if (channelArrays) {
        const schedules = exporterRef.current.generateSchedules(channelArrays, options);
        const json = exporterRef.current.generateJSON(schedules);
        const pretty = exporterRef.current.generatePrettySchedules(schedules);
        
        return { schedules, json, pretty };
      } else {
        throw new Error('No recorded data available for export');
      }
    } else {
      throw new Error('Recorder or exporter not initialized');
    }
  }, []);

  const handleCopyJSON = useCallback(async (json: string) => {
    if (exporterRef.current) {
      const success = await exporterRef.current.copyToClipboard(json);
      if (success) {
        alert('JSON copied to clipboard!');
      } else {
        alert('Failed to copy to clipboard');
      }
    }
  }, []);

  const handleDownloadJSON = useCallback((json: string) => {
    if (exporterRef.current) {
      exporterRef.current.downloadAsFile(json, 'deforum-schedules.json');
    }
  }, []);

  const handleDownloadSchedules = useCallback((schedules: string) => {
    if (exporterRef.current) {
      exporterRef.current.downloadAsFile(schedules, 'deforum-schedules.txt');
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pilotRef.current) {
        pilotRef.current.dispose();
      }
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* 3D Scene */}
      <Scene onCameraReady={handleCameraReady} onFrame={handleFrame} />
      
      {/* HUD */}
      <HUD
        isRecording={isRecording}
        isPlaying={isPlaying}
        isPaused={false}
        speedLevel={speedLevel}
        currentFrame={currentFrame}
        totalFrames={totalFrames}
        speed={speed}
        targetFPS={targetFPS}
      />
      
      {/* Controls Panel */}
      <ControlsPanel
        isRecording={isRecording}
        isPlaying={isPlaying}
        totalFrames={totalFrames}
        currentFrame={currentFrame}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
        onStartPlayback={handleStartPlayback}
        onStopPlayback={handleStopPlayback}
        onResetCamera={handleResetCamera}
        onSetTargetFPS={handleSetTargetFPS}
        onApplySmoothing={handleApplySmoothing}
        onRevertSmoothing={handleRevertSmoothing}
        onExportSchedules={handleExportSchedules}
        onCopyJSON={handleCopyJSON}
        onDownloadJSON={handleDownloadJSON}
        onDownloadSchedules={handleDownloadSchedules}
      />
    </div>
  );
}
