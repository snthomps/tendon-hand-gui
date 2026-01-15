# Tendon-Driven Robotic Hand Control & Analysis GUI

A comprehensive React-based tool for understanding, controlling, and analyzing tendon-driven robotic hand systems through first-principles exploration.

![Phase 1: System Understanding](https://img.shields.io/badge/Phase-1%20System%20Understanding-blue)
![React](https://img.shields.io/badge/React-18+-61dafb?logo=react)
![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)

**Developed by [GIRL IN SPACE CLUB](https://girlinspaceclub.com)**

---


## 🎯 Overview

This tool is designed for **Phase 1: First-Principles System Understanding** of tendon-driven robotic hands. It provides an interactive environment to explore the complete causal chain from electrical commands to mechanical motion.

### Key Features

- **Manual Servo Control**: Direct PWM command interface for each actuator
- **Real-time Visualization**: Live 2D hand pose rendering with proper kinematics
- **Complete Mapping Chain**: PWM → Servo Angle → Tendon Displacement → Joint Angles
- **Time Series Analysis**: Monitor system dynamics with 10Hz data collection
- **Per-Finger Analysis**: Individual mapping curves for each finger
- **Safety Monitoring**: PWM saturation, stall detection, and over-travel warnings
- **Underactuated Coupling**: Visualize how single tendons control multiple joints

## 🚀 Quick Start

### Prerequisites

- Node.js 14+ and npm
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Clone the repository
git clone https://github.com/snthomps/tendon-hand-gui.git
cd tendon-hand-gui

# Install dependencies
npm install

# Start development server
npm start
```

The application will open at `http://localhost:3000`

### Quick Run (No Installation)

You can also run this as a standalone React component. Simply copy `tendon_hand_with_plots.jsx` into your React project and import it:

```jsx
import TendonDrivenHandGUI from './tendon_hand_with_plots';

function App() {
  return <TendonDrivenHandGUI />;
}
```

## 📚 Features in Detail

### 1. Control & Visualization Page

**Manual Servo Control**
- 5 independent servo sliders (500-2500 μs PWM range)
- Real-time display of PWM, servo angle, and tendon displacement
- Active/inactive status indicators
- Safety warnings for limit conditions

**Hand Pose Visualization**
- Anatomically accurate finger rendering
- Fixed palm with attached fingers
- Color-coded joints per finger
- Real-time flexion response

**Joint Angle Monitoring**
- Complete joint state display (MCP, PIP, DIP, IP)
- Joint limit indicators and over-travel warnings

### 2. Time Series Data Page

**Dynamic Plots** (10 Hz sampling, 100-point rolling buffer)
- PWM Commands, Servo Angles, Tendon Displacement
- Color-coded per finger (5 simultaneous traces)
- Real-time updates

### 3. Mapping Analysis Page

**Per-Finger Selection**
- Interactive finger selector buttons
- Individual analysis per finger

**Static Transfer Functions**
- PWM → Servo Angle: Linear electrical-to-mechanical mapping
- Servo Angle → Tendon Displacement: Geometric pulley calculation
- Tendon → Joint Coupling: Underactuated behavior curves

## 🔬 System Understanding

### The Causal Chain

```
PWM Command (μs)
    ↓ [Linear Mapping]
Servo Angle (degrees)
    ↓ [Geometric: s = r×θ]
Tendon Displacement (mm)
    ↓ [Mechanical Coupling]
Joint Angles (degrees)
    ↓
Hand Pose
```

### Underactuated Coupling

**Regular Fingers:**
1. PIP activates first (0-100% flexion range)
2. DIP follows (starts at 25% tendon pull)
3. MCP engages last (starts at 60% tendon pull)

Result: Natural grasping motion from a single actuator per finger

## 🎓 Learning Outcomes

By using this tool, you will:

- ✅ Understand the complete actuation chain from PWM to motion
- ✅ Identify where motion is governed by geometry vs. software
- ✅ Recognize underactuated coupling behavior
- ✅ Establish safe operating bounds
- ✅ Develop intuition for tendon-driven system dynamics


## 📄 License

This work is licensed under [Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)](https://creativecommons.org/licenses/by-nc/4.0/).

**You are free to:**
- Share — copy and redistribute the material
- Adapt — remix, transform, and build upon the material

**Under the following terms:**
- **Attribution** — You must give appropriate credit to GIRL IN SPACE CLUB
- **NonCommercial** — You may not use the material for commercial purposes


## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Built with 🚀 by GIRL IN SPACE CLUB — inspiring the next generation (for robotics education and research)**

