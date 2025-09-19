/**
 * Export logic for generating Deforum schedule strings
 */

import { ChannelArrays, ExportOptions, DeforumSchedules } from '../types';

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
      includeEmptyFrames
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
    const fovMap = new Map<number, number>();

    // Process frames according to options
    for (let frame = frameStart; frame <= actualFrameEnd; frame += frameStep) {
      if (frame >= totalFrames) break;

      // Apply axis scaling to translations
      translationXMap.set(frame, channelArrays.translation_x[frame] * axisScaleX);
      translationYMap.set(frame, channelArrays.translation_y[frame] * axisScaleY);
      translationZMap.set(frame, channelArrays.translation_z[frame] * axisScaleZ);

      // Convert rotations from radians to degrees
      rotationXMap.set(frame, this.radiansToDegrees(channelArrays.rotation_3d_x[frame]));
      rotationYMap.set(frame, this.radiansToDegrees(channelArrays.rotation_3d_y[frame]));
      rotationZMap.set(frame, this.radiansToDegrees(channelArrays.rotation_3d_z[frame]));

      // FOV is already in degrees
      fovMap.set(frame, channelArrays.fov[frame]);
    }

    // Handle empty frames if requested
    if (includeEmptyFrames) {
      this.addEmptyFrames(translationXMap, frameStart, actualFrameEnd, frameStep);
      this.addEmptyFrames(translationYMap, frameStart, actualFrameEnd, frameStep);
      this.addEmptyFrames(translationZMap, frameStart, actualFrameEnd, frameStep);
      this.addEmptyFrames(rotationXMap, frameStart, actualFrameEnd, frameStep);
      this.addEmptyFrames(rotationYMap, frameStart, actualFrameEnd, frameStep);
      this.addEmptyFrames(rotationZMap, frameStart, actualFrameEnd, frameStep);
      this.addEmptyFrames(fovMap, frameStart, actualFrameEnd, frameStep);
    }

    // Build schedule strings
    return {
      translation_x: this.buildScheduleString(translationXMap),
      translation_y: this.buildScheduleString(translationYMap),
      translation_z: this.buildScheduleString(translationZMap),
      rotation_3d_x: this.buildScheduleString(rotationXMap),
      rotation_3d_y: this.buildScheduleString(rotationYMap),
      rotation_3d_z: this.buildScheduleString(rotationZMap),
      fov: this.buildScheduleString(fovMap)
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
      axisScaleX: 1.0,
      axisScaleY: 1.0,
      axisScaleZ: 1.0,
      includeEmptyFrames: true,
      preferAngleOverLens: true
    };
  }
}
