# Deforum Web Pilot

A web-based camera pilot for creating Deforum animation schedules. Fly through a 3D world, record camera movements, apply smoothing, and export Deforum-compatible schedule strings.

## Features

- **First-person camera controls** with WASD movement and mouse look
- **Real-time recording** of camera transforms at fixed timesteps
- **Smoothing algorithms** to smooth out recorded camera paths
- **Playback system** to review recorded movements
- **Deforum export** with exact schedule string format
- **3D environment** with sky, floor, and reference objects

## Controls

### Movement
- **W/A/S/D**: Move forward/left/backward/right
- **Q/E**: Move up/down
- **Right Mouse + Drag**: Look around
- **1/2/3**: Set speed (slow/medium/fast)
- **Space**: Toggle pause
- **R**: Reset camera to origin
- **Escape**: Release mouse lock

### Recording & Playback
- **Record**: Start recording camera movements
- **Stop**: Stop recording
- **Play**: Playback recorded movements
- **Stop Playback**: Stop playback

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open http://localhost:3000 in your browser

## Usage

1. **Record**: Click "Record" and fly around using WASD and mouse
2. **Stop**: Click "Stop" when done recording
3. **Smooth** (optional): Apply smoothing to reduce jitter
4. **Play**: Click "Play" to review your path
5. **Export**: Configure export options and click "Export Schedules"
6. **Copy/Download**: Use the generated JSON or text format

## Export Format

The app generates Deforum schedule strings in the exact format required:

```json
{
  "translation_x": "0:(0),1:(0.1),2:(0.2)",
  "translation_y": "0:(0),1:(0.05),2:(0.1)",
  "translation_z": "0:(0),1:(-0.1),2:(-0.2)",
  "rotation_3d_x": "0:(0),1:(1.2),2:(2.4)",
  "rotation_3d_y": "0:(0),1:(0.6),2:(1.2)",
  "rotation_3d_z": "0:(0),1:(0),2:(0)",
  "fov": "0:(70),1:(70),2:(70)"
}
```

## Technical Details

- **Framework**: React 18 + TypeScript + Vite
- **3D Engine**: Three.js with React Three Fiber
- **Recording**: Fixed timestep sampling (default 30 FPS)
- **Smoothing**: Centered moving average algorithm
- **Export**: Radians to degrees conversion, axis scaling support

## Project Structure

```
src/
├── components/          # React UI components
│   ├── HUD.tsx         # Heads-up display
│   └── ControlsPanel.tsx # Main control panel
├── logic/              # Core business logic
│   ├── recorder.ts     # Recording and smoothing
│   ├── pilot.ts        # Camera controls
│   ├── playback.ts     # Playback system
│   └── export.ts       # Deforum export
├── three/              # Three.js scene
│   └── Scene.tsx       # 3D scene setup
├── types.ts            # TypeScript definitions
├── App.tsx             # Main app component
└── main.tsx            # Entry point
```

## Development

- **Build**: `npm run build`
- **Preview**: `npm run preview`
- **Type checking**: `npm run build` (includes TypeScript compilation)

## License

MIT License - feel free to use and modify as needed.
