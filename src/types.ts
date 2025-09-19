/**
 * Core data structures for the Deforum Web Pilot
 */

export interface Sample {
  frame: number;
  timeSeconds: number;
  px: number;
  py: number;
  pz: number;
  rx: number;
  ry: number;
  rz: number;
  fov: number;
}

export interface ChannelArrays {
  translation_x: number[];
  translation_y: number[];
  translation_z: number[];
  rotation_3d_x: number[];
  rotation_3d_y: number[];
  rotation_3d_z: number[];
  fov: number[];
}

export interface SmoothingOptions {
  method: 'average';
  windowSize: number;
  iterations: number;
  nonDestructive: boolean;
}

export interface ExportOptions {
  frameStart: number;
  frameEnd: number;
  frameStep: number;
  axisScaleX: number;
  axisScaleY: number;
  axisScaleZ: number;
  includeEmptyFrames: boolean;
  preferAngleOverLens: boolean;
}

export interface DeforumSchedules {
  translation_x: string;
  translation_y: string;
  translation_z: string;
  rotation_3d_x: string;
  rotation_3d_y: string;
  rotation_3d_z: string;
  fov: string;
}

export interface PilotState {
  isRecording: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  currentSpeed: number;
  currentFrame: number;
  totalFrames: number;
  samples: Sample[];
  channelArrays: ChannelArrays | null;
  originalChannelArrays: ChannelArrays | null;
  smoothingOptions: SmoothingOptions;
  exportOptions: ExportOptions;
}

export type SpeedLevel = 1 | 2 | 3;

export interface CameraControls {
  moveForward: boolean;
  moveBackward: boolean;
  moveLeft: boolean;
  moveRight: boolean;
  moveUp: boolean;
  moveDown: boolean;
  mouseLook: boolean;
  mouseX: number;
  mouseY: number;
  sensitivity: number;
}
