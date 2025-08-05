# Causal Language Evolution Study - Eye Tracking Implementation

  ## Overview

  This implementation extends the original causal language study with eye
  tracking capabilities using WebGazer.js. The study now monitors
  participants' gaze patterns while they read and evaluate philosophical
  abstracts with different causal language structures.

  ## New Structure

  ### Multi-Page Survey Flow

  1. **index.html** - Demographics collection and study introduction
  2. **calibration.html** - Eye tracking calibration system
  3. **abstract1.html** - First abstract pair evaluation with eye tracking
  4. **abstract2.html** - Second abstract pair evaluation with eye tracking
  5. **results.html** - Final questions and data compilation

  ### Eye Tracking Integration

  - **Library**: WebGazer.js (https://webgazer.cs.brown.edu/)
  - **Tracking Method**: Camera-based eye tracking through web browser
  - **Calibration**: 9-point calibration system
  - **Data Collection**: Real-time gaze coordinates, timestamps, and
  reading patterns

  ## Features

  ### Enhanced Data Collection

  - **Gaze Tracking**: X/Y coordinates of eye gaze at 30+ Hz
  - **Reading Patterns**: Time spent on each abstract
  - **Visual Attention**: Heat maps of where participants look
  - **Interaction Data**: Click patterns and form completion times

  ### Real-Time Feedback

  - **Gaze Visualization**: Optional red dot showing current gaze position
  - **Reading Timer**: Displays current reading time
  - **Progress Indicators**: Shows study completion progress
  - **Calibration Quality**: Feedback on eye tracking accuracy

  ### Data Storage

  All data is stored in browser sessionStorage and compiled at the end:

  ```javascript
  {
    sessionId: "session_abc123",
    demographics: { age, gender, education, philosophy_familiarity },
    abstract1Responses: { clarity_a, clarity_b, causal_a, causal_b,
  confidence_a, confidence_b },
    abstract2Responses: { clarity_a, clarity_b, causal_a, causal_b,
  confidence_a, confidence_b },
    finalQuestions: { general_persuasive, general_stronger,
  eye_tracking_comfort },
    eyeTrackingData: {
      abstract1: [{ x, y, timestamp, elapsedTime, page }],
      abstract2: [{ x, y, timestamp, elapsedTime, page }],
      calibrationData: { positions, timestamp, completed }
    },
    metadata: { userAgent, screenResolution, viewportSize, completionTime }
  }

  Usage Instructions

  For Participants

  1. Camera Setup: Ensure good lighting and clear view of face
  2. Positioning: Sit comfortably ~60cm from screen
  3. Calibration: Follow the calibration dots carefully
  4. Reading: Read naturally while eye tracking is active
  5. Completion: Review data summary before final submission

  For Researchers

  1. Data Export: Complete survey data exported as JSON
  2. Analysis Ready: Gaze coordinates linked to abstract text regions
  3. Quality Metrics: Calibration quality and data completeness indicators
  4. Metadata: Device and session information for analysis

  Browser Compatibility

  Supported Browsers

  - Chrome 60+ (recommended)
  - Firefox 55+
  - Safari 11+
  - Edge 79+

  Requirements

  - WebRTC support
  - Camera permissions
  - JavaScript enabled
  - Stable internet connection for WebGazer.js CDN

  File Structure

  causal-language-evolution-study/
  ├── index.html              # Main landing page with demographics
  ├── calibration.html        # Eye tracking calibration
  ├── abstract1.html          # First abstract pair evaluation
  ├── abstract2.html          # Second abstract pair evaluation
  ├── results.html            # Final questions and data compilation
  ├── js/
  │   └── eye-tracking-utils.js # Shared eye tracking utilities
  ├── index.htm               # Original single-page survey (preserved)
  ├── src/                    # Analysis scripts (preserved)
  ├── README.md              # Original documentation
  └── README_EYETRACKING.md  # This documentation

  Development Notes

  WebGazer.js Integration

  - Regression Model: Ridge regression for gaze prediction
  - Face Tracking: CLM tracker for face detection
  - Calibration: Manual calibration with visual feedback
  - Performance: ~60 FPS tracking with modern hardware

  Data Quality Considerations

  - Calibration Accuracy: Multiple samples per calibration point
  - Head Movement: Instructions to minimize movement
  - Lighting Conditions: Requirements for optimal tracking
  - Individual Differences: Calibration accounts for eye characteristics

  Troubleshooting

  Common Issues

  1. Camera Access Denied: Check browser permissions
  2. Poor Calibration: Ensure good lighting and stable position
  3. Tracking Drift: Recalibrate if gaze accuracy decreases
  4. Performance Issues: Close other applications using camera
  5. Data Loss: Ensure stable internet connection

  ---

  ## 🚀 **Resumen de archivos a crear:**

  1. **index.html** - Página principal
  2. **calibration.html** - Calibración
  3. **abstract1.html** - Primer abstract
  4. **abstract2.html** - Segundo abstract
  5. **results.html** - Resultados finales
  6. **js/eye-tracking-utils.js** - Utilidades (crear carpeta `js` primero)
  7. **README_EYETRACKING.md** - Documentación
