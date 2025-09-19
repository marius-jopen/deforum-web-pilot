/**
 * Playback logic for recorded camera movements
 */

import * as THREE from 'three';
import { Recorder } from './recorder';

export class Playback {
  private recorder: Recorder;
  private isPlaying = false;
  private isPaused = false;
  private currentFrame = 0;
  private accumulator = 0;
  private fixedDelta = 1 / 30; // Will be updated when targetFPS changes

  constructor(recorder: Recorder, targetFPS = 30) {
    this.recorder = recorder;
    this.setTargetFPS(targetFPS);
  }

  setTargetFPS(fps: number): void {
    this.fixedDelta = 1 / fps;
  }

  startPlayback(): void {
    if (this.recorder.getTotalFrames() === 0) {
      console.warn('No recorded data to play back');
      return;
    }

    this.isPlaying = true;
    this.isPaused = false;
    this.currentFrame = 0;
    this.accumulator = 0;
  }

  stopPlayback(): void {
    this.isPlaying = false;
    this.isPaused = false;
    this.currentFrame = 0;
  }

  pausePlayback(): void {
    this.isPaused = true;
  }

  resumePlayback(): void {
    this.isPaused = false;
  }

  isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }

  isCurrentlyPaused(): boolean {
    return this.isPaused;
  }

  getCurrentFrame(): number {
    return this.currentFrame;
  }

  getTotalFrames(): number {
    return this.recorder.getTotalFrames();
  }

  /**
   * Update playback state
   * Should be called every frame during playback
   */
  update(deltaTime: number): boolean {
    if (!this.isPlaying || this.isPaused) return false;

    this.accumulator += deltaTime;

    while (this.accumulator >= this.fixedDelta) {
      this.accumulator -= this.fixedDelta;
      
      if (!this.updateFrame()) {
        this.stopPlayback();
        return false;
      }
    }

    return true;
  }

  private updateFrame(): boolean {
    const totalFrames = this.recorder.getTotalFrames();
    
    if (this.currentFrame >= totalFrames) {
      return false; // End of playback
    }

    // Get camera state from recorder
    const cameraState = this.recorder.getCameraStateAtFrame(this.currentFrame);
    
    if (!cameraState) {
      return false;
    }

    // Apply camera state (this will be handled by the main app)
    this.currentFrame++;
    return true;
  }

  /**
   * Get the camera state for the current frame
   */
  getCurrentCameraState(): {
    position: THREE.Vector3;
    rotation: THREE.Euler;
    fov: number;
  } | null {
    if (!this.isPlaying || this.currentFrame >= this.recorder.getTotalFrames()) {
      return null;
    }

    return this.recorder.getCameraStateAtFrame(this.currentFrame - 1);
  }

  /**
   * Seek to a specific frame
   */
  seekToFrame(frame: number): void {
    const totalFrames = this.recorder.getTotalFrames();
    this.currentFrame = Math.max(0, Math.min(frame, totalFrames - 1));
  }

  /**
   * Get playback progress as a percentage (0-1)
   */
  getProgress(): number {
    const totalFrames = this.recorder.getTotalFrames();
    if (totalFrames === 0) return 0;
    return this.currentFrame / totalFrames;
  }

  /**
   * Check if playback has reached the end
   */
  isAtEnd(): boolean {
    return this.currentFrame >= this.recorder.getTotalFrames();
  }

  /**
   * Reset playback to beginning
   */
  reset(): void {
    this.currentFrame = 0;
    this.accumulator = 0;
  }
}
