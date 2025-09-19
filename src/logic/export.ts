/**
 * Export logic for generating Deforum schedule strings
 */

import { ChannelArrays, ExportOptions, DeforumSchedules } from '../types';
import * as THREE from 'three';

export class Exporter {
  /**
   * Build a schedule string from frame-to-value mapping
   */
  private buildScheduleString(frameValueMap: Map<number, number>): string {
    const entries = Array.from(frameValueMap.entries())
      .sort((a, b) => a[0] - b[0]); // Sort by frame number

    return entries
      .map(([frame, value]) => `${frame}:(${value})`)
      .join(', ');
  }

  /**
   * Convert radians to degrees
   */
  private radiansToDegrees(radians: number): number {
    return radians * (180 / Math.PI);
  }

  /**
   * Generate Deforum schedules from channel arrays
   */
  generateSchedules(
    channelArrays: ChannelArrays,
    options: ExportOptions
  ): DeforumSchedules {
    const {
      frameStart,
      frameEnd,
      frameStep,
      axisScaleX,
      axisScaleY,
      axisScaleZ,
      includeEmptyFrames,
      cadence
    } = options;

    const totalFrames = channelArrays.translation_x.length;
    const actualFrameEnd = Math.min(frameEnd, totalFrames - 1);
    
    // Create frame-to-value maps for each channel
    const translationXMap = new Map<number, number>();
    const translationYMap = new Map<number, number>();
    const translationZMap = new Map<number, number>();
    const rotationXMap = new Map<number, number>();
    const rotationYMap = new Map<number, number>();
    const rotationZMap = new Map<number, number>();

    // Process frames according to options
    // Honor cadence by only exporting every Nth frame when cadence > 1
    const startFrameForCadence = cadence > 1
      ? Math.ceil(frameStart / cadence) * cadence
      : frameStart;

    // Accumulate camera-local translations for robustness regardless of yaw/pitch
    let initializedLocal = false;
    let prevKeyFrame = startFrameForCadence;
    let cumulativeLocal = new THREE.Vector3(0, 0, 0);

    for (let frame = startFrameForCadence; frame <= actualFrameEnd; frame += frameStep) {
      if (frame >= totalFrames) break;
      if (cadence > 1 && frame % cadence !== 0) continue;

      if (!initializedLocal) {
        // First keyed frame is baseline at 0 in camera-local space
        translationXMap.set(frame, 0);
        translationYMap.set(frame, 0);
        translationZMap.set(frame, 0);
        initializedLocal = true;
        prevKeyFrame = frame;
      } else {
        // World delta between current frame and previous keyed frame
        const worldDelta = new THREE.Vector3(
          channelArrays.translation_x[frame] - channelArrays.translation_x[prevKeyFrame],
          channelArrays.translation_y[frame] - channelArrays.translation_y[prevKeyFrame],
          channelArrays.translation_z[frame] - channelArrays.translation_z[prevKeyFrame]
        );

        // Transform world delta into previous camera's local frame using 'YXZ' Euler
        const prevEuler = new THREE.Euler(
          channelArrays.rotation_3d_x[prevKeyFrame],
          channelArrays.rotation_3d_y[prevKeyFrame],
          channelArrays.rotation_3d_z[prevKeyFrame],
          'YXZ'
        );
        const invRot = new THREE.Matrix4().makeRotationFromEuler(prevEuler).invert();
        const localDelta = worldDelta.clone().applyMatrix4(invRot);

        cumulativeLocal.add(localDelta);

        // Map camera-local axes to Deforum with agreed signs
        translationXMap.set(frame, cumulativeLocal.x * axisScaleX);      // Left/Right
        translationYMap.set(frame, -cumulativeLocal.y * axisScaleY);     // Up/Down (invert Y)
        translationZMap.set(frame, -cumulativeLocal.z * axisScaleZ);     // Forward/Back (invert Z)

        prevKeyFrame = frame;
      }

      // Convert rotations from radians to degrees and apply scaling to match reference
      // Three.js: X=pitch(mouseY), Y=yaw(mouseX), Z=roll(0)
      // Deforum: X=pitch, Y=yaw, Z=roll
      // Based on user feedback: trying direct mapping with inversions
      // Absolute rotations in degrees with scale and sign
      rotationXMap.set(frame, -this.radiansToDegrees(channelArrays.rotation_3d_x[frame]) * 0.1);  // Pitch (inverted)
      rotationYMap.set(frame, -this.radiansToDegrees(channelArrays.rotation_3d_y[frame]) * 0.1);  // Yaw (inverted)
      rotationZMap.set(frame, this.radiansToDegrees(channelArrays.rotation_3d_z[frame]) * 0.1);   // Roll
    }

    // Handle empty frames if requested
    // Only backfill missing frames when cadence == 1; otherwise it injects zeros between keyed frames
    if (includeEmptyFrames && cadence <= 1) {
      this.addEmptyFrames(translationXMap, frameStart, actualFrameEnd, frameStep);
      this.addEmptyFrames(translationYMap, frameStart, actualFrameEnd, frameStep);
      this.addEmptyFrames(translationZMap, frameStart, actualFrameEnd, frameStep);
      this.addEmptyFrames(rotationXMap, frameStart, actualFrameEnd, frameStep);
      this.addEmptyFrames(rotationYMap, frameStart, actualFrameEnd, frameStep);
      this.addEmptyFrames(rotationZMap, frameStart, actualFrameEnd, frameStep);
    }

    // Build schedule strings
    return {
      translation_x: this.buildScheduleString(translationXMap),
      translation_y: this.buildScheduleString(translationYMap),
      translation_z: this.buildScheduleString(translationZMap),
      rotation_3d_x: this.buildScheduleString(rotationXMap),
      rotation_3d_y: this.buildScheduleString(rotationYMap),
      rotation_3d_z: this.buildScheduleString(rotationZMap)
    };
  }

  /**
   * Add empty frames (0 values) for missing frame numbers
   */
  private addEmptyFrames(
    frameMap: Map<number, number>,
    frameStart: number,
    frameEnd: number,
    frameStep: number
  ): void {
    for (let frame = frameStart; frame <= frameEnd; frame += frameStep) {
      if (!frameMap.has(frame)) {
        frameMap.set(frame, 0);
      }
    }
  }

  /**
   * Generate JSON object with schedules
   */
  generateJSON(schedules: DeforumSchedules): string {
    return JSON.stringify(schedules, null, 2);
  }

  /**
   * Generate pretty-printed schedule strings for quick copy
   */
  generatePrettySchedules(schedules: DeforumSchedules): string {
    const lines: string[] = [];
    
    lines.push('Deforum Schedules:');
    lines.push('');
    
    for (const [key, value] of Object.entries(schedules)) {
      lines.push(`${key}:`);
      lines.push(`  "${value}"`);
      lines.push('');
    }
    
    return lines.join('\n');
  }

  /**
   * Copy text to clipboard
   */
  async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      return false;
    }
  }

  /**
   * Download text as a file
   */
  downloadAsFile(text: string, filename: string): void {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  /**
   * Validate export options
   */
  validateOptions(options: ExportOptions, totalFrames: number): string[] {
    const errors: string[] = [];

    if (options.frameStart < 0) {
      errors.push('Frame start must be non-negative');
    }

    if (options.frameEnd < options.frameStart) {
      errors.push('Frame end must be greater than or equal to frame start');
    }

    if (options.frameEnd >= totalFrames) {
      errors.push(`Frame end must be less than total frames (${totalFrames})`);
    }

    if (options.frameStep <= 0) {
      errors.push('Frame step must be positive');
    }

    if (options.axisScaleX <= 0) {
      errors.push('Axis scale X must be positive');
    }

    if (options.axisScaleY <= 0) {
      errors.push('Axis scale Y must be positive');
    }

    if (options.axisScaleZ <= 0) {
      errors.push('Axis scale Z must be positive');
    }

    return errors;
  }

  /**
   * Get default export options
   */
  getDefaultOptions(totalFrames: number): ExportOptions {
    return {
      frameStart: 0,
      frameEnd: Math.max(0, totalFrames - 1),
      frameStep: 1,
      axisScaleX: 1.0,  // Scaling to match reference file (0.1-7 range)
      axisScaleY: 1.0,  // Scaling to match reference file (0.1-7 range)
      axisScaleZ: 1.0,  // Scaling to match reference file (0.1-7 range)
      includeEmptyFrames: true,
      preferAngleOverLens: true,
      cadence: 4
    };
  }
}
