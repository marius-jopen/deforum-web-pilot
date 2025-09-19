/**
 * First-person camera pilot controls
 */

import * as THREE from 'three';
import { CameraControls, SpeedLevel } from '../types';

export class Pilot {
  private camera: THREE.PerspectiveCamera;
  private controls: CameraControls;
  private speed: number = 0;
  private speedLevels: Record<SpeedLevel, number> = {
    1: 1.0,   // Slow
    2: 3.0,   // Medium
    3: 6.0    // Fast
  };
  private currentSpeedLevel: SpeedLevel = 1;
  private isPaused = false;
  private isPointerLocked = false;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.controls = {
      moveForward: false,
      moveBackward: false,
      moveLeft: false,
      moveRight: false,
      moveUp: false,
      moveDown: false,
      mouseLook: false,
      mouseX: 0,
      mouseY: 0,
      sensitivity: 0.002
    };

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Keyboard controls
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));
    
    // Mouse controls
    document.addEventListener('mousedown', this.handleMouseDown.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('wheel', this.handleWheel.bind(this));
    
    // Pointer lock events
    document.addEventListener('pointerlockchange', this.handlePointerLockChange.bind(this));
    document.addEventListener('pointerlockerror', this.handlePointerLockError.bind(this));
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (this.isPaused) return;

    switch (event.code) {
      case 'KeyW':
        this.controls.moveForward = true;
        break;
      case 'KeyS':
        this.controls.moveBackward = true;
        break;
      case 'KeyA':
        this.controls.moveLeft = true;
        break;
      case 'KeyD':
        this.controls.moveRight = true;
        break;
      case 'KeyQ':
        this.controls.moveUp = true;
        break;
      case 'KeyE':
        this.controls.moveDown = true;
        break;
      case 'KeyR':
        this.resetCamera();
        break;
      case 'Escape':
        this.releasePointerLock();
        break;
      case 'Digit1':
        this.setSpeedLevel(1);
        break;
      case 'Digit2':
        this.setSpeedLevel(2);
        break;
      case 'Digit3':
        this.setSpeedLevel(3);
        break;
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    switch (event.code) {
      case 'KeyW':
        this.controls.moveForward = false;
        break;
      case 'KeyS':
        this.controls.moveBackward = false;
        break;
      case 'KeyA':
        this.controls.moveLeft = false;
        break;
      case 'KeyD':
        this.controls.moveRight = false;
        break;
      case 'KeyQ':
        this.controls.moveUp = false;
        break;
      case 'KeyE':
        this.controls.moveDown = false;
        break;
    }
  }

  private handleMouseDown(event: MouseEvent): void {
    if (event.button === 0) { // Left mouse button
      event.preventDefault();
      this.controls.mouseLook = true;
      this.requestPointerLock();
    }
  }

  private handleMouseUp(event: MouseEvent): void {
    if (event.button === 0) { // Left mouse button
      this.controls.mouseLook = false;
      this.releasePointerLock();
    }
  }

  private handleMouseMove(event: MouseEvent): void {
    // Only respond to mouse movement when left mouse button is held (FPS style)
    if (this.controls.mouseLook) {
      const deltaX = event.movementX;
      const deltaY = event.movementY;
      
      // Horizontal rotation (yaw)
      this.controls.mouseX += deltaX * this.controls.sensitivity;
      
      // Vertical rotation (pitch) - inverted for natural FPS feel
      this.controls.mouseY -= deltaY * this.controls.sensitivity;
      
      // Clamp vertical rotation to prevent over-rotation
      this.controls.mouseY = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.controls.mouseY));
    }
  }

  private handleWheel(event: WheelEvent): void {
    event.preventDefault();
    
    // Scroll wheel changes speed
    const speedChange = event.deltaY > 0 ? -0.5 : 0.5;
    const newSpeed = Math.max(0.5, Math.min(20, this.speed + speedChange));
    
    // Update speed level based on new speed
    if (newSpeed <= 2.5) {
      this.currentSpeedLevel = 1;
    } else if (newSpeed <= 7.5) {
      this.currentSpeedLevel = 2;
    } else {
      this.currentSpeedLevel = 3;
    }
    
    this.speed = newSpeed;
  }

  private handlePointerLockChange(): void {
    this.isPointerLocked = document.pointerLockElement === document.body;
    // Don't override mouseLook state - let it be controlled by mouse button
  }

  private handlePointerLockError(): void {
    console.warn('Pointer lock failed');
    this.isPointerLocked = false;
    this.controls.mouseLook = false;
  }

  private requestPointerLock(): void {
    document.body.requestPointerLock();
  }

  private releasePointerLock(): void {
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }

  setSpeedLevel(level: SpeedLevel): void {
    this.currentSpeedLevel = level;
    this.speed = this.speedLevels[level];
  }

  getSpeedLevel(): SpeedLevel {
    return this.currentSpeedLevel;
  }

  getSpeed(): number {
    return this.speed;
  }

  togglePause(): void {
    this.isPaused = !this.isPaused;
  }

  isCurrentlyPaused(): boolean {
    return this.isPaused;
  }

  resetCamera(): void {
    this.camera.position.set(0, 100, 0);
    this.camera.rotation.set(0, 0, 0);
    this.controls.mouseX = 0;
    this.controls.mouseY = 0;
  }

  /**
   * Update camera position and rotation based on controls
   * Should be called every frame
   */
  update(deltaTime: number): void {
    if (this.isPaused) return;

    const moveSpeed = this.speed * deltaTime;
    const direction = new THREE.Vector3();
    const right = new THREE.Vector3();
    const up = new THREE.Vector3();

    // Get camera direction vectors
    this.camera.getWorldDirection(direction);
    right.crossVectors(direction, this.camera.up).normalize();
    up.set(0, 1, 0);

    // Apply movement
    if (this.controls.moveForward) {
      this.camera.position.addScaledVector(direction, moveSpeed);
    }
    if (this.controls.moveBackward) {
      this.camera.position.addScaledVector(direction, -moveSpeed);
    }
    if (this.controls.moveLeft) {
      this.camera.position.addScaledVector(right, -moveSpeed);
    }
    if (this.controls.moveRight) {
      this.camera.position.addScaledVector(right, moveSpeed);
    }
    if (this.controls.moveUp) {
      this.camera.position.addScaledVector(up, moveSpeed);
    }
    if (this.controls.moveDown) {
      this.camera.position.addScaledVector(up, -moveSpeed);
    }

    // Apply mouse look rotation (FPS style - no roll/tilt)
    this.camera.rotation.set(
      this.controls.mouseY,   // pitch (X rotation) - vertical look
      this.controls.mouseX,   // yaw (Y rotation) - horizontal look
      0,                      // roll (Z rotation) - always 0 for no tilt
      'YXZ'                   // Use YXZ order for proper FPS rotation
    );
  }

  /**
   * Set camera position and rotation (for playback)
   */
  setCameraState(position: THREE.Vector3, rotation: THREE.Euler, fov: number): void {
    this.camera.position.copy(position);
    this.camera.rotation.copy(rotation);
    this.camera.fov = fov;
    this.camera.updateProjectionMatrix();
  }

  /**
   * Get current camera state
   */
  getCameraState(): {
    position: THREE.Vector3;
    rotation: THREE.Euler;
    fov: number;
  } {
    return {
      position: this.camera.position.clone(),
      rotation: this.camera.rotation.clone(),
      fov: this.camera.fov
    };
  }

  /**
   * Clean up event listeners
   */
  dispose(): void {
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    document.removeEventListener('keyup', this.handleKeyUp.bind(this));
    document.removeEventListener('mousedown', this.handleMouseDown.bind(this));
    document.removeEventListener('mouseup', this.handleMouseUp.bind(this));
    document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    document.removeEventListener('wheel', this.handleWheel.bind(this));
    document.removeEventListener('pointerlockchange', this.handlePointerLockChange.bind(this));
    document.removeEventListener('pointerlockerror', this.handlePointerLockError.bind(this));
  }
}
