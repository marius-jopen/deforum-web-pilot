/**
 * Recording and smoothing logic for camera data
 */

import { Sample, ChannelArrays, SmoothingOptions } from '../types';
import * as THREE from 'three';

export class Recorder {
  private samples: Sample[] = [];
  private channelArrays: ChannelArrays | null = null;
  private originalChannelArrays: ChannelArrays | null = null;
  private isRecording = false;
  private currentFrame = 0;
  private accumulator = 0;
  private fixedDelta = 1 / 30; // Will be updated when targetFPS changes

  constructor(targetFPS = 30) {
    this.setTargetFPS(targetFPS);
  }

  setTargetFPS(fps: number): void {
    this.fixedDelta = 1 / fps;
  }

  startRecording(): void {
    this.samples = [];
    this.channelArrays = null;
    this.originalChannelArrays = null;
    this.isRecording = true;
    this.currentFrame = 0;
    this.accumulator = 0;
  }

  stopRecording(): void {
    this.isRecording = false;
    this.buildChannelArrays();
  }

  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  getSamples(): Sample[] {
    return [...this.samples];
  }

  getChannelArrays(): ChannelArrays | null {
    return this.channelArrays ? { ...this.channelArrays } : null;
  }

  getOriginalChannelArrays(): ChannelArrays | null {
    return this.originalChannelArrays ? { ...this.originalChannelArrays } : null;
  }

  getCurrentFrame(): number {
    return this.currentFrame;
  }

  getTotalFrames(): number {
    return this.samples.length;
  }

  /**
   * Update the recorder with current camera state
   * Should be called every frame during recording
   */
  update(camera: THREE.PerspectiveCamera, deltaTime: number): void {
    if (!this.isRecording) return;

    this.accumulator += deltaTime;

    while (this.accumulator >= this.fixedDelta) {
      this.accumulator -= this.fixedDelta;
      this.recordSample(camera);
    }
  }

  private recordSample(camera: THREE.PerspectiveCamera): void {
    const timeSeconds = this.currentFrame * this.fixedDelta;
    
    const sample: Sample = {
      frame: this.currentFrame,
      timeSeconds,
      px: camera.position.x,
      py: camera.position.y,
      pz: camera.position.z,
      rx: camera.rotation.x,
      ry: camera.rotation.y,
      rz: camera.rotation.z,
      fov: camera.fov
    };

    this.samples.push(sample);
    this.currentFrame++;
  }

  private buildChannelArrays(): void {
    if (this.samples.length === 0) return;

    const arrays: ChannelArrays = {
      translation_x: [],
      translation_y: [],
      translation_z: [],
      rotation_3d_x: [],
      rotation_3d_y: [],
      rotation_3d_z: [],
      fov: []
    };

    for (const sample of this.samples) {
      arrays.translation_x.push(sample.px);
      arrays.translation_y.push(sample.py);
      arrays.translation_z.push(sample.pz);
      arrays.rotation_3d_x.push(sample.rx);
      arrays.rotation_3d_y.push(sample.ry);
      arrays.rotation_3d_z.push(sample.rz);
      arrays.fov.push(sample.fov);
    }

    this.channelArrays = arrays;
    this.originalChannelArrays = this.nonDestructiveCopy(arrays);
  }

  private nonDestructiveCopy(arrays: ChannelArrays): ChannelArrays {
    return {
      translation_x: [...arrays.translation_x],
      translation_y: [...arrays.translation_y],
      translation_z: [...arrays.translation_z],
      rotation_3d_x: [...arrays.rotation_3d_x],
      rotation_3d_y: [...arrays.rotation_3d_y],
      rotation_3d_z: [...arrays.rotation_3d_z],
      fov: [...arrays.fov]
    };
  }

  /**
   * Apply smoothing to the recorded data
   */
  applySmoothing(options: SmoothingOptions): void {
    if (!this.channelArrays) return;

    // Store original if non-destructive
    if (options.nonDestructive && !this.originalChannelArrays) {
      this.originalChannelArrays = this.nonDestructiveCopy(this.channelArrays);
    }

    // Apply smoothing for each iteration
    for (let i = 0; i < options.iterations; i++) {
      this.smoothChannelArrays(options.windowSize);
    }
  }

  private smoothChannelArrays(windowSize: number): void {
    if (!this.channelArrays) return;

    const channels: (keyof ChannelArrays)[] = [
      'translation_x', 'translation_y', 'translation_z',
      'rotation_3d_x', 'rotation_3d_y', 'rotation_3d_z', 'fov'
    ];

    for (const channel of channels) {
      this.channelArrays[channel] = this.applyMovingAverage(
        this.channelArrays[channel],
        windowSize
      );
    }
  }

  private applyMovingAverage(data: number[], windowSize: number): number[] {
    if (windowSize <= 1) return [...data];
    
    const result: number[] = [];
    const halfWindow = Math.floor(windowSize / 2);

    for (let i = 0; i < data.length; i++) {
      let sum = 0;
      let count = 0;

      // Calculate centered moving average
      for (let j = Math.max(0, i - halfWindow); j <= Math.min(data.length - 1, i + halfWindow); j++) {
        sum += data[j];
        count++;
      }

      result.push(sum / count);
    }

    return result;
  }

  /**
   * Revert to original data before smoothing
   */
  revertSmoothing(): void {
    if (this.originalChannelArrays) {
      this.channelArrays = this.nonDestructiveCopy(this.originalChannelArrays);
    }
  }

  /**
   * Clear all recorded data
   */
  clear(): void {
    this.samples = [];
    this.channelArrays = null;
    this.originalChannelArrays = null;
    this.isRecording = false;
    this.currentFrame = 0;
  }

  /**
   * Get a sample at a specific frame for playback
   */
  getSampleAtFrame(frame: number): Sample | null {
    if (frame < 0 || frame >= this.samples.length) return null;
    return this.samples[frame];
  }

  /**
   * Get camera state from channel arrays at a specific frame
   */
  getCameraStateAtFrame(frame: number): {
    position: THREE.Vector3;
    rotation: THREE.Euler;
    fov: number;
  } | null {
    if (!this.channelArrays || frame < 0 || frame >= this.channelArrays.translation_x.length) {
      return null;
    }

    return {
      position: new THREE.Vector3(
        this.channelArrays.translation_x[frame],
        this.channelArrays.translation_y[frame],
        this.channelArrays.translation_z[frame]
      ),
      rotation: new THREE.Euler(
        this.channelArrays.rotation_3d_x[frame],
        this.channelArrays.rotation_3d_y[frame],
        this.channelArrays.rotation_3d_z[frame],
        'XYZ'
      ),
      fov: this.channelArrays.fov[frame]
    };
  }
}
