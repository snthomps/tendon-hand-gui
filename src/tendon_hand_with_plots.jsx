import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Power, Zap, Activity, TrendingUp, BarChart3, Trash2 } from 'lucide-react';

// Hand visualization component - defined outside main component to prevent remounting
const HandVisualization = React.memo(({ joints, servos }) => {
  const canvasRef = useRef(null);
  const offscreenCanvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const jointsRef = useRef(joints);
  const servosRef = useRef(servos);

  // Keep refs updated with latest data
  useEffect(() => {
    jointsRef.current = joints;
    servosRef.current = servos;
  }, [joints, servos]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create offscreen canvas for double-buffering
    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
      offscreenCanvasRef.current.width = canvas.width;
      offscreenCanvasRef.current.height = canvas.height;
    }

    const drawFrame = () => {
      const currentJoints = jointsRef.current;
      const currentServos = servosRef.current;

      const offscreen = offscreenCanvasRef.current;
      const ctx = offscreen.getContext("2d");
      ctx.clearRect(0, 0, offscreen.width, offscreen.height);

      // Background
      ctx.fillStyle = '#f9fafb';
      ctx.fillRect(0, 0, offscreen.width, offscreen.height);

      // ----- Palm (fixed) -----
      const palmX = 150;
      const palmY = 250;
      const palmWidth = 100;
      const palmHeight = 120;
      ctx.fillStyle = "#4a5568";
      ctx.fillRect(palmX, palmY, palmWidth, palmHeight);
      ctx.strokeStyle = "#2d3748";
      ctx.lineWidth = 2;
      ctx.strokeRect(palmX, palmY, palmWidth, palmHeight);

      // Helper: draw a joint marker at current origin
      const drawJoint = (color, r = 4) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();
      };

      // Helper: draw a segment that extends UP (negative Y) from the current joint
      const drawSegmentUp = (w, len, fill) => {
        ctx.fillStyle = fill;
        ctx.fillRect(-w / 2, -len, w, len);
        ctx.translate(0, -len);
      };

      const top = palmY;
      const left = palmX;
      const right = palmX + palmWidth;

      const fingers = [
        {
          name: "thumb",
          attachX: left - 2,
          attachY: palmY + 70,
          joints: currentJoints.thumb,
          baseAngle: -60,
        },
        {
          name: "index",
          attachX: left + palmWidth * 0.22,
          attachY: top + 2,
          joints: currentJoints.index,
          baseAngle: -10,
        },
        {
          name: "middle",
          attachX: left + palmWidth * 0.50,
          attachY: top + 0,
          joints: currentJoints.middle,
          baseAngle: 0,
        },
        {
          name: "ring",
          attachX: left + palmWidth * 0.74,
          attachY: top + 2,
          joints: currentJoints.ring,
          baseAngle: 10,
        },
        {
          name: "pinky",
          attachX: right - 4,
          attachY: top + 8,
          joints: currentJoints.pinky,
          baseAngle: 18,
        },
      ];

      fingers.forEach((finger, idx) => {
        ctx.save();
        const servoColor = currentServos?.[idx]?.color || "#63b3ed";
        ctx.translate(finger.attachX, finger.attachY);
        ctx.rotate((finger.baseAngle * Math.PI) / 180);
        drawJoint(servoColor, 5);

        const isThumb = finger.name === "thumb";
        const segmentLengths = isThumb ? [40, 32] : [35, 28, 22];

        const mcp = finger.joints?.mcp ?? 0;
        const pip = finger.joints?.pip ?? 0;
        const ip = finger.joints?.ip ?? 0;
        const dip = finger.joints?.dip ?? 0;

        // Proximal phalanx
        ctx.rotate((mcp * Math.PI) / 180);
        drawSegmentUp(10, segmentLengths[0], "#718096");
        drawJoint(servoColor, 4);

        // Middle phalanx (PIP or IP for thumb)
        const midAngle = isThumb ? ip : pip;
        ctx.rotate((midAngle * Math.PI) / 180);
        drawSegmentUp(8, segmentLengths[1], "#a0aec0");
        drawJoint(servoColor, 4);

        // Distal phalanx (only for non-thumb)
        if (!isThumb) {
          ctx.rotate((dip * Math.PI) / 180);
          drawSegmentUp(6, segmentLengths[2], "#cbd5e0");
        }

        // Fingertip marker
        drawJoint(servoColor, 3);

        ctx.restore();
      });

      // Draw label
      ctx.fillStyle = "#4a5568";
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Palm (Fixed)", palmX + palmWidth / 2, palmY + palmHeight + 20);
      ctx.font = "10px Arial";
      ctx.fillText(
        "Servos in forearm - Tendons pull fingers to flex",
        palmX + palmWidth / 2,
        palmY + palmHeight + 35
      );

      // Copy offscreen canvas to visible canvas
      const visibleCtx = canvas.getContext('2d');
      visibleCtx.drawImage(offscreen, 0, 0);

      // Continue animation loop
      animationFrameRef.current = requestAnimationFrame(drawFrame);
    };

    // Start animation loop
    animationFrameRef.current = requestAnimationFrame(drawFrame);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return <canvas ref={canvasRef} width={400} height={450} className="border border-gray-300 rounded bg-gray-50" />;
});

const TendonDrivenHandGUI = () => {
  // Navigation state
  const [activePage, setActivePage] = useState('control');
  const [selectedFinger, setSelectedFinger] = useState(0);

  // File input ref
  const fileInputRef = useRef(null);

  // Gesture state
  const [gestures, setGestures] = useState(null);
  const [currentGestureName, setCurrentGestureName] = useState("");
  
  // Servo state (PWM values 500-2500 microseconds)
  const [servos, setServos] = useState([
    { id: 0, name: 'Thumb Flexor', pwm: 1500, angle: 90, enabled: true, color: '#ef4444' },
    { id: 1, name: 'Index Flexor', pwm: 1500, angle: 90, enabled: true, color: '#f59e0b' },
    { id: 2, name: 'Middle Flexor', pwm: 1500, angle: 90, enabled: true, color: '#10b981' },
    { id: 3, name: 'Ring Flexor', pwm: 1500, angle: 90, enabled: true, color: '#3b82f6' },
    { id: 4, name: 'Pinky Flexor', pwm: 1500, angle: 90, enabled: true, color: '#8b5cf6' },
  ]);

  // Time series data for plotting
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [maxDataPoints] = useState(100);

  // System state
  const [systemEnabled, setSystemEnabled] = useState(true);
  const [warnings, setWarnings] = useState([]);
  const [servoLoadTime, setServoLoadTime] = useState({});

  // Constants for mapping
  const PWM_MIN = 500;
  const PWM_MAX = 2500;
  const PWM_CENTER = 1500;
  const SERVO_ANGLE_MIN = 0;
  const SERVO_ANGLE_MAX = 180;
  const TENDON_PULLEY_RADIUS = 10; // mm
  const STALL_THRESHOLD_MS = 2000;

  // Joint configuration for each finger
  const jointConfig = {
    thumb: { mcp: 0, ip: 0, limits: { mcp: [0, 90], ip: [0, 80] } },
    index: { mcp: 0, pip: 0, dip: 0, limits: { mcp: [0, 90], pip: [0, 100], dip: [0, 90] } },
    middle: { mcp: 0, pip: 0, dip: 0, limits: { mcp: [0, 90], pip: [0, 100], dip: [0, 90] } },
    ring: { mcp: 0, pip: 0, dip: 0, limits: { mcp: [0, 90], pip: [0, 100], dip: [0, 90] } },
    pinky: { mcp: 0, pip: 0, dip: 0, limits: { mcp: [0, 90], pip: [0, 100], dip: [0, 90] } },
  };

  const [joints, setJoints] = useState(jointConfig);

  // PWM to Servo Angle mapping (linear for simplicity)
  const pwmToAngle = (pwm) => {
    return ((pwm - PWM_MIN) / (PWM_MAX - PWM_MIN)) * (SERVO_ANGLE_MAX - SERVO_ANGLE_MIN);
  };

  // Servo Angle to Tendon Length Change
  const angleToTendonDelta = (angle) => {
    const angleRad = (angle - 90) * (Math.PI / 180);
    return TENDON_PULLEY_RADIUS * angleRad;
  };

  // Tendon Length to Joint Angles (underactuated coupling)
  const tendonToJoints = (tendonDelta, fingerType) => {
    // Max tendon displacement with 10mm pulley and 90° servo rotation = π/2 * 10 ≈ 15.7mm
    // Normalize to 0-1 range for full flexion at max tendon pull
    const flexionRatio = Math.abs(tendonDelta) / 16;
    
    if (fingerType === 'thumb') {
      return {
        mcp: Math.max(0, Math.min(90, flexionRatio * 90)),
        ip: Math.max(0, Math.min(80, flexionRatio * 80)),
      };
    } else {
      // Underactuated coupling: PIP activates first, then DIP, then MCP
      const mcpAngle = Math.max(0, Math.min(90, (flexionRatio - 0.6) * 225));
      const pipAngle = Math.max(0, Math.min(100, flexionRatio * 100));
      const dipAngle = Math.max(0, Math.min(90, (flexionRatio - 0.25) * 120));
      
      return { mcp: mcpAngle, pip: pipAngle, dip: dipAngle };
    }
  };

  // Handle gestures file upload
  const gesturesFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        setGestures(json);
        
        // Auto-select the first gesture found in the file
        const firstGesture = Object.keys(json)[0];
        if (firstGesture) {
          applyGesture(firstGesture, json);
        }
      } catch (err) {
        setWarnings(prev => [...prev, "Failed to parse JSON file. Check format."]);
      }
    };
    reader.readAsText(file);
  };

  // Apply a gesture data to the servos
  const applyGesture = (name, data = gestures) => {
    if (name == "New") {
      createNewGesture(prompt("Enter name for new gesture:"), prompt("Enter description for new gesture:"));
      return;
    }
    if (!data || !data[name]) return;
    
    const poseData = data[name].angles;
    const fingerMap = { "TH": 0, "IN": 1, "MI": 2, "RI": 3, "PI": 4 };

    setCurrentGestureName(name);
    setServos((prev) =>
      prev.map((s) => {
        const shorthand = Object.keys(fingerMap).find(key => fingerMap[key] === s.id);
        const newAngle = poseData[shorthand];
        if(newAngle > 180 || newAngle < 0) {
          console.warn(`Invalid angle ${newAngle} for servo ${s.id}`);
          return s;
        }

        if (newAngle !== undefined) {
          // Map angle back to PWM: (Angle / 180 * 2000) + 500
          const calculatedPwm = (newAngle / 180) * 2000 + 500;
          return { ...s, angle: newAngle, pwm: Math.round(calculatedPwm) };
        }
        return s;
      })
    );
  };

  const createNewGesture = (name, desc) => {
    if (!name || !desc) 
      return;

    gestures[name] = { 
      description: desc,
      angles: { "TH": 90, "IN": 90, "MI": 90, "RI": 90, "PI": 90 },
      palm_displacement: []
    };

    applyGesture(name);
  };

  // Save current gesture to local data
  const saveGesture = (name, data = gestures) => {
    if (!data || !data[name]) return;
    
    const poseData = {};
    const fingerMap = { "TH": 0, "IN": 1, "MI": 2, "RI": 3, "PI": 4 };
    servos.forEach((s) => {
      const shorthand = Object.keys(fingerMap).find(key => fingerMap[key] === s.id);
      poseData[shorthand] = s.angle;
    });

    gestures[name] = { angles: poseData };
  };

  const exportGestures = (data = gestures) => {
    if (!data) return;

    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "gestures.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const deleteGesture = (name, data = gestures) => {
    if (!data || !data[name]) return;

    delete data[name];
    applyGesture(Object.keys(data)[0] || "New", data);
  }

  // Update joints based on servo positions
  useEffect(() => {
    if (!systemEnabled) return;

    const newJoints = { ...joints };
    const fingerMap = ['thumb', 'index', 'middle', 'ring', 'pinky'];

    servos.forEach((servo, idx) => {
      const tendonDelta = angleToTendonDelta(servo.angle);
      const fingerJoints = tendonToJoints(tendonDelta, fingerMap[idx]);
      newJoints[fingerMap[idx]] = { ...newJoints[fingerMap[idx]], ...fingerJoints };
    });

    setJoints(newJoints);
  }, [servos, systemEnabled]);

  // Collect time series data
  useEffect(() => {
    const interval = setInterval(() => {
      const timestamp = Date.now();
      const dataPoint = {
        time: timestamp,
        servos: servos.map(s => ({
          id: s.id,
          pwm: s.pwm,
          angle: s.angle,
          tendonDelta: angleToTendonDelta(s.angle)
        })),
        joints: { ...joints }
      };

      setTimeSeriesData(prev => {
        const newData = [...prev, dataPoint];
        if (newData.length > maxDataPoints) {
          return newData.slice(-maxDataPoints);
        }
        return newData;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [servos, joints, angleToTendonDelta, maxDataPoints]);

  // Safety monitoring
  useEffect(() => {
    const newWarnings = [];
    const currentTime = Date.now();

    servos.forEach((servo) => {
      if (servo.pwm <= PWM_MIN + 50) {
        newWarnings.push(`${servo.name}: PWM near minimum limit`);
      }
      if (servo.pwm >= PWM_MAX - 50) {
        newWarnings.push(`${servo.name}: PWM near maximum limit`);
      }

      if (servo.pwm < PWM_MIN + 100 || servo.pwm > PWM_MAX - 100) {
        const loadTime = servoLoadTime[servo.id] || currentTime;
        if (currentTime - loadTime > STALL_THRESHOLD_MS) {
          newWarnings.push(`${servo.name}: High load duration - stall risk!`);
        }
      } else {
        setServoLoadTime((prev) => ({ ...prev, [servo.id]: currentTime }));
      }
    });

    Object.entries(joints).forEach(([finger, jointAngles]) => {
      Object.entries(jointAngles).forEach(([joint, angle]) => {
        if (joint === 'limits') return;
        const limits = jointAngles.limits[joint];
        if (limits && (angle < limits[0] - 5 || angle > limits[1] + 5)) {
          newWarnings.push(`${finger} ${joint.toUpperCase()}: Over-travel detected`);
        }
      });
    });

    setWarnings(newWarnings);
  }, [servos, joints]);

  // Servo control handler
  const handleServoChange = (servoId, newPwm) => {
    if (!systemEnabled) return;
    
    setServos((prev) =>
      prev.map((servo) =>
        servo.id === servoId
          ? { ...servo, pwm: newPwm, angle: pwmToAngle(newPwm) }
          : servo
      )
    );
  };

  // Emergency stop
  const emergencyStop = () => {
    setSystemEnabled(false);
    setServos((prev) =>
      prev.map((servo) => ({ ...servo, pwm: PWM_CENTER, angle: 90 }))
    );
  };

  // Reset to neutral
  const resetNeutral = () => {
    setServos((prev) =>
      prev.map((servo) => ({ ...servo, pwm: PWM_CENTER, angle: 90 }))
    );
    setServoLoadTime({});
  };

  // Clear data
  const clearData = () => {
    setTimeSeriesData([]);
  };

  // Time Series Plot Component - with continuous animation loop
  const TimeSeriesPlot = ({ title, dataKey, ylabel, colors }) => {
    const canvasRef = useRef(null);
    const offscreenCanvasRef = useRef(null);
    const animationFrameRef = useRef(null);
    const dataRef = useRef(timeSeriesData);
    const servosRef = useRef(servos);

    // Keep refs updated with latest data
    useEffect(() => {
      dataRef.current = timeSeriesData;
      servosRef.current = servos;
    }, [timeSeriesData, servos]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Create offscreen canvas for double-buffering
      if (!offscreenCanvasRef.current) {
        offscreenCanvasRef.current = document.createElement('canvas');
        offscreenCanvasRef.current.width = canvas.width;
        offscreenCanvasRef.current.height = canvas.height;
      }

      const drawFrame = () => {
        const currentData = dataRef.current;
        const currentServos = servosRef.current;
        
        if (currentData.length === 0) {
          animationFrameRef.current = requestAnimationFrame(drawFrame);
          return;
        }

        const offscreen = offscreenCanvasRef.current;
        const ctx = offscreen.getContext('2d');
        const width = offscreen.width;
        const height = offscreen.height;
        const padding = { top: 30, right: 20, bottom: 40, left: 60 };
        const plotWidth = width - padding.left - padding.right;
        const plotHeight = height - padding.top - padding.bottom;

        // Draw to offscreen canvas
        ctx.clearRect(0, 0, width, height);

        // Background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // Plot area
        ctx.fillStyle = '#f9fafb';
        ctx.fillRect(padding.left, padding.top, plotWidth, plotHeight);

        // Title
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(title, width / 2, 20);

        // Get data range
        let minVal = Infinity, maxVal = -Infinity;
        currentData.forEach(point => {
          point.servos.forEach(servo => {
            const val = servo[dataKey];
            minVal = Math.min(minVal, val);
            maxVal = Math.max(maxVal, val);
          });
        });

        // Add padding to range
        const range = maxVal - minVal || 1;
        minVal -= range * 0.1;
        maxVal += range * 0.1;

        // Draw grid
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
          const y = padding.top + (plotHeight * i / 5);
          ctx.beginPath();
          ctx.moveTo(padding.left, y);
          ctx.lineTo(padding.left + plotWidth, y);
          ctx.stroke();

          // Y-axis labels
          const val = maxVal - (range * i / 5);
          ctx.fillStyle = '#6b7280';
          ctx.font = '11px Arial';
          ctx.textAlign = 'right';
          ctx.fillText(val.toFixed(1), padding.left - 5, y + 4);
        }

        // Y-axis label
        ctx.save();
        ctx.translate(15, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = '#374151';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(ylabel, 0, 0);
        ctx.restore();

        // X-axis label
        ctx.fillStyle = '#374151';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Time (samples)', width / 2, height - 10);

        // Plot lines for each servo
        currentServos.forEach((servo, servoIdx) => {
          ctx.strokeStyle = colors ? colors[servoIdx] : servo.color;
          ctx.lineWidth = 2;
          ctx.beginPath();

          currentData.forEach((point, idx) => {
            const servoData = point.servos[servoIdx];
            if (!servoData) return;
            const x = padding.left + (plotWidth * idx / (currentData.length - 1 || 1));
            const y = padding.top + plotHeight - ((servoData[dataKey] - minVal) / (maxVal - minVal) * plotHeight);

            if (idx === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          });

          ctx.stroke();
        });

        // Legend
        const legendX = padding.left + 10;
        let legendY = padding.top + 10;
        currentServos.forEach((servo, idx) => {
          ctx.fillStyle = colors ? colors[idx] : servo.color;
          ctx.fillRect(legendX, legendY, 15, 3);
          ctx.fillStyle = '#374151';
          ctx.font = '10px Arial';
          ctx.textAlign = 'left';
          ctx.fillText(servo.name.split(' ')[0], legendX + 20, legendY + 3);
          legendY += 15;
        });

        // Copy offscreen canvas to visible canvas in one operation
        const visibleCtx = canvas.getContext('2d');
        visibleCtx.drawImage(offscreen, 0, 0);

        // Continue animation loop
        animationFrameRef.current = requestAnimationFrame(drawFrame);
      };

      // Start animation loop
      animationFrameRef.current = requestAnimationFrame(drawFrame);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, [dataKey, title, ylabel, colors]);

    return <canvas ref={canvasRef} width={600} height={300} className="border border-gray-300 rounded" />;
  };

  // Mapping Curve Plot - memoized to prevent unnecessary redraws
  const MappingPlot = React.memo(({ title, xLabel, yLabel, dataPoints, xRange, yRange, currentX, currentY, color }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;
      const padding = { top: 30, right: 20, bottom: 50, left: 70 };
      const plotWidth = width - padding.left - padding.right;
      const plotHeight = height - padding.top - padding.bottom;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Plot area
      ctx.fillStyle = '#f9fafb';
      ctx.fillRect(padding.left, padding.top, plotWidth, plotHeight);

      // Title
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(title, width / 2, 20);

      // Grid
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 5; i++) {
        const y = padding.top + (plotHeight * i / 5);
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + plotWidth, y);
        ctx.stroke();

        const x = padding.left + (plotWidth * i / 5);
        ctx.beginPath();
        ctx.moveTo(x, padding.top);
        ctx.lineTo(x, padding.top + plotHeight);
        ctx.stroke();
      }

      // Axes labels
      ctx.fillStyle = '#6b7280';
      ctx.font = '11px Arial';
      for (let i = 0; i <= 5; i++) {
        const y = padding.top + (plotHeight * i / 5);
        const val = yRange[1] - ((yRange[1] - yRange[0]) * i / 5);
        ctx.textAlign = 'right';
        ctx.fillText(val.toFixed(0), padding.left - 5, y + 4);

        const x = padding.left + (plotWidth * i / 5);
        const xVal = xRange[0] + ((xRange[1] - xRange[0]) * i / 5);
        ctx.textAlign = 'center';
        ctx.fillText(xVal.toFixed(0), x, padding.top + plotHeight + 20);
      }

      // Axis labels
      ctx.save();
      ctx.translate(20, height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = '#374151';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(yLabel, 0, 0);
      ctx.restore();

      ctx.fillStyle = '#374151';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(xLabel, width / 2, height - 10);

      // Plot curve
      ctx.strokeStyle = color || '#3b82f6';
      ctx.lineWidth = 3;
      ctx.beginPath();

      dataPoints.forEach((point, idx) => {
        const x = padding.left + ((point.x - xRange[0]) / (xRange[1] - xRange[0]) * plotWidth);
        const y = padding.top + plotHeight - ((point.y - yRange[0]) / (yRange[1] - yRange[0]) * plotHeight);

        if (idx === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // Current position marker
      if (currentX !== undefined && currentY !== undefined) {
        const x = padding.left + ((currentX - xRange[0]) / (xRange[1] - xRange[0]) * plotWidth);
        const y = padding.top + plotHeight - ((currentY - yRange[0]) / (yRange[1] - yRange[0]) * plotHeight);
        
        // Draw marker
        ctx.fillStyle = color || '#ef4444';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw outline
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.stroke();
      }

    }, [title, xLabel, yLabel, dataPoints, xRange, yRange, currentX, currentY, color]);

    return <canvas ref={canvasRef} width={500} height={350} className="border border-gray-300 rounded" />;
  });

  // Tendon to Joint Coupling Plot - memoized to prevent unnecessary redraws
  const TendonToJointPlot = React.memo(({ data, fingerType, color }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;
      const padding = { top: 40, right: 100, bottom: 50, left: 70 };
      const plotWidth = width - padding.left - padding.right;
      const plotHeight = height - padding.top - padding.bottom;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#f9fafb';
      ctx.fillRect(padding.left, padding.top, plotWidth, plotHeight);

      // Title
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      const jointCount = fingerType === 'thumb' ? 'Two' : 'Three';
      ctx.fillText(`Single Tendon → ${jointCount} Joint Angles`, width / 2, 25);

      // Grid
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 5; i++) {
        const y = padding.top + (plotHeight * i / 5);
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + plotWidth, y);
        ctx.stroke();
      }

      // Axes
      ctx.fillStyle = '#6b7280';
      ctx.font = '11px Arial';
      for (let i = 0; i <= 5; i++) {
        const y = padding.top + (plotHeight * i / 5);
        const val = 100 - (100 * i / 5);
        ctx.textAlign = 'right';
        ctx.fillText(val.toFixed(0) + '°', padding.left - 5, y + 4);
      }

      ctx.save();
      ctx.translate(20, height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = '#374151';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Joint Angle (degrees)', 0, 0);
      ctx.restore();

      ctx.fillStyle = '#374151';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Tendon Displacement (mm)', width / 2, height - 10);

      // Define joints based on finger type
      const plotJoints = fingerType === 'thumb' 
        ? [
            { key: 'mcp', color: '#8b5cf6', label: 'MCP' },
            { key: 'ip', color: '#3b82f6', label: 'IP' }
          ]
        : [
            { key: 'mcp', color: '#8b5cf6', label: 'MCP' },
            { key: 'pip', color: '#3b82f6', label: 'PIP' },
            { key: 'dip', color: '#10b981', label: 'DIP' }
          ];

      // Plot curves
      plotJoints.forEach(joint => {
        ctx.strokeStyle = joint.color;
        ctx.lineWidth = 3;
        ctx.beginPath();

        data.forEach((point, idx) => {
          const x = padding.left + ((point.delta + 20) / 40 * plotWidth);
          const y = padding.top + plotHeight - (point[joint.key] / 100 * plotHeight);

          if (idx === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });

        ctx.stroke();
      });

      // Legend
      const legendX = width - padding.right + 10;
      let legendY = padding.top + 20;
      plotJoints.forEach(joint => {
        ctx.fillStyle = joint.color;
        ctx.fillRect(legendX, legendY, 30, 4);
        ctx.fillStyle = '#374151';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(joint.label, legendX + 35, legendY + 4);
        legendY += 20;
      });

      // X-axis labels
      ctx.fillStyle = '#6b7280';
      ctx.font = '11px Arial';
      ctx.textAlign = 'center';
      for (let i = 0; i <= 4; i++) {
        const x = padding.left + (plotWidth * i / 4);
        const val = -20 + (40 * i / 4);
        ctx.fillText(val.toFixed(0), x, padding.top + plotHeight + 20);
      }

    }, [data, fingerType, color]);

    return <canvas ref={canvasRef} width={900} height={400} className="border border-gray-300 rounded mx-auto" />;
  });

  // Control Page - inline JSX to prevent component remounting
  const controlPageContent = (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Actuator Control</h2>
        {servos.map((servo) => (
          <div key={servo.id} className="mb-6 pb-4 border-b border-gray-200 last:border-b-0">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-gray-700">{servo.name}</span>
              <span className={`text-xs px-2 py-1 rounded ${
                servo.pwm < PWM_MIN + 100 || servo.pwm > PWM_MAX - 100
                  ? 'bg-red-100 text-red-700'
                  : 'bg-green-100 text-green-700'
              }`}>
                {servo.enabled ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="mb-2">
              <label className="text-xs text-gray-600">PWM (μs)</label>
              <input
                type="range"
                min={PWM_MIN}
                max={PWM_MAX}
                value={servo.pwm}
                onChange={(e) => handleServoChange(servo.id, parseInt(e.target.value))}
                disabled={!systemEnabled}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>{PWM_MIN}</span>
                <span className="font-bold text-gray-700">{servo.pwm}</span>
                <span>{PWM_MAX}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-gray-500">Servo Angle</div>
                <div className="font-bold text-gray-800">{servo.angle.toFixed(1)}°</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-gray-500">Tendon Δ</div>
                <div className="font-bold text-gray-800">
                  {angleToTendonDelta(servo.angle).toFixed(1)} mm
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Hand Pose Visualization</h2>
        <div className="flex justify-center">
          <HandVisualization joints={joints} servos={servos} />
        </div>
        {gestures && (
          <div className="flex items-center gap-2 bg-blue-50 p-1 rounded border border-blue-200">
            <span className="text-xs font-bold text-blue-700 ml-2">GESTURE:</span>
            <select 
              value={currentGestureName}
              onChange={(e) => applyGesture(e.target.value)}
              className="bg-white border border-gray-300 text-gray-700 text-sm rounded focus:ring-blue-500 focus:border-blue-500 p-1"
            >
              {Object.keys(gestures).map((key) => (
                <option key={key} value={key}>{key}</option>
              ))}
              <option key="New" value="New">New</option>
            </select>
            <button
              onClick={() => saveGesture(currentGestureName)}
              className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600">
              Save Gesture
            </button>
            <button
              onClick={() => exportGestures()}
              className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600">
              Export Gestures
            </button>
            <button
              onClick={() => {
                deleteGesture(currentGestureName);
              }}
              className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600">
              <Trash2 size={16} />
            </button>
          </div>
        )}
        <div onClick={() => fileInputRef.current?.click()} className="m-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 flex items-center gap-2 cursor-pointer transition-colors">
          <Activity size={16} />
          {gestures ? "Change File" : "Upload Gestures"}
          <input 
            type="file" 
            accept=".json" 
            ref={fileInputRef}
            onChange={gesturesFileUpload} 
            className="hidden" 
          />
          </div>
        <div className="mt-4 text-xs text-gray-600 text-center">
          <p>Color-coded joints show attachment points and articulations</p>
          <p>Fingers remain anchored to palm - servos pull tendons from forearm</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 overflow-y-auto">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Joint Angles & Limits</h2>
        
        {Object.entries(joints).map(([finger, jointData]) => (
          <div key={finger} className="mb-4 pb-3 border-b border-gray-200">
            <h3 className="font-semibold text-gray-700 capitalize mb-2">{finger}</h3>
            <div className="space-y-1">
              {Object.entries(jointData).map(([joint, angle]) => {
                if (joint === 'limits') return null;
                const limits = jointData.limits[joint];
                const inRange = limits && angle >= limits[0] && angle <= limits[1];
                
                return (
                  <div key={joint} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 uppercase">{joint}:</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-mono ${inRange ? 'text-gray-800' : 'text-red-600 font-bold'}`}>
                        {angle.toFixed(1)}°
                      </span>
                      {limits && (
                        <span className="text-xs text-gray-400">
                          [{limits[0]}° - {limits[1]}°]
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="mt-6 pt-4 border-t border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-3">Underactuated Coupling</h3>
          <div className="text-xs text-gray-600 space-y-2">
            <p>• Single tendon controls multiple joints per finger</p>
            <p>• PIP joints typically flex first (high compliance)</p>
            <p>• DIP follows with partial coupling (~0.7×)</p>
            <p>• MCP engages last when resistance increases</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Time Series Page - inline JSX to prevent component remounting
  const timeSeriesPageContent = (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <div className="bg-white rounded-lg shadow-md p-4">
        <TimeSeriesPlot 
          title="PWM Commands Over Time"
          dataKey="pwm"
          ylabel="PWM (μs)"
        />
        <p className="text-xs text-gray-600 mt-2 text-center">
          Real-time monitoring of servo PWM commands. Observe command patterns and transitions.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <TimeSeriesPlot 
          title="Servo Angles Over Time"
          dataKey="angle"
          ylabel="Angle (degrees)"
        />
        <p className="text-xs text-gray-600 mt-2 text-center">
          Servo angular position derived from PWM. Shows mechanical response to electrical commands.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <TimeSeriesPlot 
          title="Tendon Displacement Over Time"
          dataKey="tendonDelta"
          ylabel="Displacement (mm)"
        />
        <p className="text-xs text-gray-600 mt-2 text-center">
          Tendon length change calculated from servo angle via pulley geometry (Δ = r × θ).
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-700">Data Collection</h3>
          <button
            onClick={clearData}
            className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
          >
            Clear Data
          </button>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Data Points:</span>
            <span className="font-mono">{timeSeriesData.length} / {maxDataPoints}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Sample Rate:</span>
            <span className="font-mono">10 Hz</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Time Window:</span>
            <span className="font-mono">~{(maxDataPoints / 10).toFixed(0)}s</span>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded">
          <p className="text-xs text-gray-700">
            <strong>Insight:</strong> Time series data reveals dynamic behavior, transient responses, 
            and settling times. Look for coupling patterns across fingers and identify natural 
            frequencies in the mechanical system.
          </p>
        </div>
      </div>
    </div>
  );

  // Mapping Analysis Page - memoized to prevent re-renders from time series updates
  const fingerTypes = ['thumb', 'index', 'middle', 'ring', 'pinky'];
  
  const mappingPageContent = React.useMemo(() => {
    // Generate mapping data
    const pwmToAngleData = [];
    for (let pwm = PWM_MIN; pwm <= PWM_MAX; pwm += 20) {
      pwmToAngleData.push({ x: pwm, y: pwmToAngle(pwm) });
    }

    const angleToTendonData = [];
    for (let angle = 0; angle <= 180; angle += 2) {
      angleToTendonData.push({ x: angle, y: angleToTendonDelta(angle) });
    }

    // Generate data for each finger type
    const allFingerData = fingerTypes.map(type => {
      const data = [];
      for (let delta = -20; delta <= 20; delta += 0.5) {
        const jointAngles = tendonToJoints(delta, type);
        data.push({ 
          delta, 
          mcp: jointAngles.mcp, 
          pip: jointAngles.pip || jointAngles.ip,
          dip: jointAngles.dip || 0,
          ip: jointAngles.ip || 0
        });
      }
      return data;
    });

    // Get current finger data
    const currentServo = servos[selectedFinger];
    const currentFingerType = fingerTypes[selectedFinger];

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Select Finger:</h3>
              <div className="flex gap-2">
                {servos.map((servo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedFinger(idx)}
                    className={`px-3 py-1 rounded text-sm ${
                      selectedFinger === idx
                        ? 'text-white font-semibold'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    style={selectedFinger === idx ? { backgroundColor: servo.color } : {}}
                  >
                    {servo.name.split(' ')[0]}
                  </button>
                ))}
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Selected: <span className="font-bold" style={{ color: currentServo.color }}>{currentServo.name}</span>
              </div>
            </div>
            
            <div style={{ display: selectedFinger === 0 ? 'block' : 'none' }}>
              <MappingPlot 
                title={`PWM → Servo Angle (Thumb)`}
                xLabel="PWM Command (μs)"
                yLabel="Servo Angle (degrees)"
                dataPoints={pwmToAngleData}
                xRange={[PWM_MIN, PWM_MAX]}
                yRange={[0, 180]}
                currentX={servos[0].pwm}
                currentY={servos[0].angle}
                color={servos[0].color}
              />
            </div>
            <div style={{ display: selectedFinger === 1 ? 'block' : 'none' }}>
              <MappingPlot 
                title={`PWM → Servo Angle (Index)`}
                xLabel="PWM Command (μs)"
                yLabel="Servo Angle (degrees)"
                dataPoints={pwmToAngleData}
                xRange={[PWM_MIN, PWM_MAX]}
                yRange={[0, 180]}
                currentX={servos[1].pwm}
                currentY={servos[1].angle}
                color={servos[1].color}
              />
            </div>
            <div style={{ display: selectedFinger === 2 ? 'block' : 'none' }}>
              <MappingPlot 
                title={`PWM → Servo Angle (Middle)`}
                xLabel="PWM Command (μs)"
                yLabel="Servo Angle (degrees)"
                dataPoints={pwmToAngleData}
                xRange={[PWM_MIN, PWM_MAX]}
                yRange={[0, 180]}
                currentX={servos[2].pwm}
                currentY={servos[2].angle}
                color={servos[2].color}
              />
            </div>
            <div style={{ display: selectedFinger === 3 ? 'block' : 'none' }}>
              <MappingPlot 
                title={`PWM → Servo Angle (Ring)`}
                xLabel="PWM Command (μs)"
                yLabel="Servo Angle (degrees)"
                dataPoints={pwmToAngleData}
                xRange={[PWM_MIN, PWM_MAX]}
                yRange={[0, 180]}
                currentX={servos[3].pwm}
                currentY={servos[3].angle}
                color={servos[3].color}
              />
            </div>
            <div style={{ display: selectedFinger === 4 ? 'block' : 'none' }}>
              <MappingPlot 
                title={`PWM → Servo Angle (Pinky)`}
                xLabel="PWM Command (μs)"
                yLabel="Servo Angle (degrees)"
                dataPoints={pwmToAngleData}
                xRange={[PWM_MIN, PWM_MAX]}
                yRange={[0, 180]}
                currentX={servos[4].pwm}
                currentY={servos[4].angle}
                color={servos[4].color}
              />
            </div>
            
            <div className="mt-3 p-3 bg-gray-50 rounded">
              <p className="text-xs text-gray-700">
                <strong>Linear Transfer Function:</strong> PWM duty cycle directly controls servo position.
                Current position: <span className="font-mono font-bold">{currentServo.pwm}μs → {currentServo.angle.toFixed(1)}°</span>
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Current: {currentServo.name}</h3>
            </div>
            
            <div style={{ display: selectedFinger === 0 ? 'block' : 'none' }}>
              <MappingPlot 
                title={`Servo Angle → Tendon Δ (Thumb)`}
                xLabel="Servo Angle (degrees)"
                yLabel="Tendon Displacement (mm)"
                dataPoints={angleToTendonData}
                xRange={[0, 180]}
                yRange={[-20, 20]}
                currentX={servos[0].angle}
                currentY={angleToTendonDelta(servos[0].angle)}
                color={servos[0].color}
              />
            </div>
            <div style={{ display: selectedFinger === 1 ? 'block' : 'none' }}>
              <MappingPlot 
                title={`Servo Angle → Tendon Δ (Index)`}
                xLabel="Servo Angle (degrees)"
                yLabel="Tendon Displacement (mm)"
                dataPoints={angleToTendonData}
                xRange={[0, 180]}
                yRange={[-20, 20]}
                currentX={servos[1].angle}
                currentY={angleToTendonDelta(servos[1].angle)}
                color={servos[1].color}
              />
            </div>
            <div style={{ display: selectedFinger === 2 ? 'block' : 'none' }}>
              <MappingPlot 
                title={`Servo Angle → Tendon Δ (Middle)`}
                xLabel="Servo Angle (degrees)"
                yLabel="Tendon Displacement (mm)"
                dataPoints={angleToTendonData}
                xRange={[0, 180]}
                yRange={[-20, 20]}
                currentX={servos[2].angle}
                currentY={angleToTendonDelta(servos[2].angle)}
                color={servos[2].color}
              />
            </div>
            <div style={{ display: selectedFinger === 3 ? 'block' : 'none' }}>
              <MappingPlot 
                title={`Servo Angle → Tendon Δ (Ring)`}
                xLabel="Servo Angle (degrees)"
                yLabel="Tendon Displacement (mm)"
                dataPoints={angleToTendonData}
                xRange={[0, 180]}
                yRange={[-20, 20]}
                currentX={servos[3].angle}
                currentY={angleToTendonDelta(servos[3].angle)}
                color={servos[3].color}
              />
            </div>
            <div style={{ display: selectedFinger === 4 ? 'block' : 'none' }}>
              <MappingPlot 
                title={`Servo Angle → Tendon Δ (Pinky)`}
                xLabel="Servo Angle (degrees)"
                yLabel="Tendon Displacement (mm)"
                dataPoints={angleToTendonData}
                xRange={[0, 180]}
                yRange={[-20, 20]}
                currentX={servos[4].angle}
                currentY={angleToTendonDelta(servos[4].angle)}
                color={servos[4].color}
              />
            </div>
            
            <div className="mt-3 p-3 bg-gray-50 rounded">
              <p className="text-xs text-gray-700">
                <strong>Geometric Transformation:</strong> Arc length s = r×θ (r={TENDON_PULLEY_RADIUS}mm).
                Current: <span className="font-mono font-bold">{currentServo.angle.toFixed(1)}° → {angleToTendonDelta(currentServo.angle).toFixed(2)}mm</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">Tendon → Joint Coupling (Underactuated)</h2>
            <div className="flex gap-2">
              {servos.map((servo, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedFinger(idx)}
                  className={`px-3 py-1 rounded text-sm ${
                    selectedFinger === idx
                      ? 'text-white font-semibold'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={selectedFinger === idx ? { backgroundColor: servo.color } : {}}
                >
                  {servo.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
          
          <div style={{ display: selectedFinger === 0 ? 'block' : 'none' }}>
            <TendonToJointPlot 
              data={allFingerData[0]} 
              fingerType="thumb"
              color={servos[0].color}
            />
          </div>
          <div style={{ display: selectedFinger === 1 ? 'block' : 'none' }}>
            <TendonToJointPlot 
              data={allFingerData[1]} 
              fingerType="index"
              color={servos[1].color}
            />
          </div>
          <div style={{ display: selectedFinger === 2 ? 'block' : 'none' }}>
            <TendonToJointPlot 
              data={allFingerData[2]} 
              fingerType="middle"
              color={servos[2].color}
            />
          </div>
          <div style={{ display: selectedFinger === 3 ? 'block' : 'none' }}>
            <TendonToJointPlot 
              data={allFingerData[3]} 
              fingerType="ring"
              color={servos[3].color}
            />
          </div>
          <div style={{ display: selectedFinger === 4 ? 'block' : 'none' }}>
            <TendonToJointPlot 
              data={allFingerData[4]} 
              fingerType="pinky"
              color={servos[4].color}
            />
          </div>
          
          <div className="mt-3 p-3 bg-blue-50 rounded">
            <p className="text-sm text-gray-700 mb-2">
              <strong>Underactuated Coupling for {currentServo.name}:</strong>
            </p>
            {currentFingerType === 'thumb' ? (
              <ul className="text-xs text-gray-700 space-y-1 ml-4">
                <li>• <strong>MCP (purple)</strong>: Primary joint, flexes proportionally</li>
                <li>• <strong>IP (blue)</strong>: Interphalangeal joint, coupled at ~0.89× ratio</li>
                <li>• Thumb has only 2 joints (no DIP)</li>
                <li>• Simpler coupling but still underactuated</li>
              </ul>
            ) : (
              <ul className="text-xs text-gray-700 space-y-1 ml-4">
                <li>• <strong className="text-blue-600">PIP (blue)</strong>: Activates first—highest compliance</li>
                <li>• <strong className="text-green-600">DIP (green)</strong>: Follows with ~0.7× coupling ratio</li>
                <li>• <strong className="text-purple-600">MCP (purple)</strong>: Engages last—only after PIP/DIP approach limits</li>
                <li>• Single tendon creates sequential, adaptive grasping motion</li>
              </ul>
            )}
          </div>
        </div>

        {/* Comparison Grid */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-bold text-gray-800 mb-4">All Fingers Comparison</h2>
          <div className="grid grid-cols-5 gap-3">
            {servos.map((servo, idx) => (
              <div key={idx} className="border rounded p-3" style={{ borderColor: servo.color, borderWidth: 2 }}>
                <h3 className="font-semibold text-sm mb-2" style={{ color: servo.color }}>
                  {servo.name.split(' ')[0]}
                </h3>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">PWM:</span>
                    <span className="font-mono font-bold">{servo.pwm}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Angle:</span>
                    <span className="font-mono">{servo.angle.toFixed(1)}°</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tendon:</span>
                    <span className="font-mono">{angleToTendonDelta(servo.angle).toFixed(1)}mm</span>
                  </div>
                  <div className="border-t pt-1 mt-1">
                    {fingerTypes[idx] === 'thumb' ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">MCP:</span>
                          <span className="font-mono">{joints[fingerTypes[idx]].mcp.toFixed(0)}°</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">IP:</span>
                          <span className="font-mono">{joints[fingerTypes[idx]].ip.toFixed(0)}°</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">MCP:</span>
                          <span className="font-mono">{joints[fingerTypes[idx]].mcp.toFixed(0)}°</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">PIP:</span>
                          <span className="font-mono">{joints[fingerTypes[idx]].pip.toFixed(0)}°</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">DIP:</span>
                          <span className="font-mono">{joints[fingerTypes[idx]].dip.toFixed(0)}°</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }, [selectedFinger, servos, joints]);



  return (
    <div className="w-full min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Tendon-Driven Robotic Hand</h1>
              <p className="text-sm text-gray-600">Phase 1: First-Principles System Understanding & Analysis</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={resetNeutral}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
                disabled={!systemEnabled}
              >
                <Activity size={16} />
                Reset
              </button>
              <button
                onClick={() => setSystemEnabled(!systemEnabled)}
                className={`px-4 py-2 rounded flex items-center gap-2 ${
                  systemEnabled ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 hover:bg-gray-500'
                } text-white`}
              >
                <Power size={16} />
                {systemEnabled ? 'Enabled' : 'Disabled'}
              </button>
              <button
                onClick={emergencyStop}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2 font-bold"
              >
                <Zap size={16} />
                E-STOP
              </button>
            </div>
          </div>
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded">
            <div className="flex items-start">
              <AlertTriangle className="text-yellow-400 mr-2" size={20} />
              <div className="flex-1">
                <h3 className="text-sm font-bold text-yellow-800 mb-1">System Warnings</h3>
                {warnings.map((warning, idx) => (
                  <p key={idx} className="text-sm text-yellow-700">• {warning}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-4 p-1 flex gap-1">
          <button
            onClick={() => setActivePage('control')}
            className={`flex-1 py-2 px-4 rounded flex items-center justify-center gap-2 ${
              activePage === 'control' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Activity size={16} />
            Control & Visualization
          </button>
          <button
            onClick={() => setActivePage('timeseries')}
            className={`flex-1 py-2 px-4 rounded flex items-center justify-center gap-2 ${
              activePage === 'timeseries' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <TrendingUp size={16} />
            Time Series Data
          </button>
          <button
            onClick={() => setActivePage('mapping')}
            className={`flex-1 py-2 px-4 rounded flex items-center justify-center gap-2 ${
              activePage === 'mapping' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BarChart3 size={16} />
            Mapping Analysis
          </button>
        </div>

        {/* Page Content */}
        {activePage === 'control' && controlPageContent}
        {activePage === 'timeseries' && timeSeriesPageContent}
        {activePage === 'mapping' && mappingPageContent}
      </div>
    </div>
  );
};

export default TendonDrivenHandGUI;
