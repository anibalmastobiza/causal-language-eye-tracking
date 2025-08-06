/**
   * Eye Tracking Utilities for Causal Language Evolution Study
   * Shared functions for WebGazer.js integration
   */

  class EyeTrackingUtils {
      constructor() {
          this.isInitialized = false;
          this.gazeData = [];
          this.calibrationData = null;
          this.listeners = {};
      }

      /**
       * Initialize WebGazer with default settings
       */
      async init(options = {}) {
          try {
              const defaultOptions = {
                  regression: 'ridge',
                  tracker: 'clmtrackr',
                  showVideo: true,
                  showPredictions: false,
                  ...options
              };

              await webgazer
                  .setRegression(defaultOptions.regression)
                  .setTracker(defaultOptions.tracker)
                  .showVideoPreview(defaultOptions.showVideo)
                  .showPredictionPoints(defaultOptions.showPredictions)
                  .setGazeListener((data, elapsedTime) => {
                      if (data == null) return;

                      const gazePoint = {
                          x: data.x,
                          y: data.y,
                          timestamp: Date.now(),
                          elapsedTime: elapsedTime,
                          page: window.location.pathname
                      };

                      this.gazeData.push(gazePoint);

                      // Trigger custom listeners
                      this.triggerEvent('gaze', gazePoint);
                  })
                  .begin();

              this.isInitialized = true;
              this.triggerEvent('initialized');

              return true;
          } catch (error) {
              console.error('Eye tracking initialization failed:', error);
              this.triggerEvent('error', error);
              return false;
          }
      }

      /**
       * Add event listener
       */
      on(event, callback) {
          if (!this.listeners[event]) {
              this.listeners[event] = [];
          }
          this.listeners[event].push(callback);
      }

      /**
       * Trigger event
       */
      triggerEvent(event, data = null) {
          if (this.listeners[event]) {
              this.listeners[event].forEach(callback => callback(data));
          }
      }

      /**
       * Perform calibration sequence
       */
      async calibrate(positions = null) {
          if (!this.isInitialized) {
              throw new Error('Eye tracking not initialized');
          }

          const defaultPositions = [
              {x: 10, y: 10}, {x: 50, y: 10}, {x: 90, y: 10},
              {x: 10, y: 50}, {x: 50, y: 50}, {x: 90, y: 50},
              {x: 10, y: 90}, {x: 50, y: 90}, {x: 90, y: 90}
          ];

          const calibrationPositions = positions || defaultPositions;

          // Clear existing calibration data
          webgazer.clearData();

          this.calibrationData = {
              positions: calibrationPositions,
              timestamp: Date.now(),
              completed: false
          };

          this.triggerEvent('calibrationStarted', this.calibrationData);

          return new Promise((resolve) => {
              let currentPoint = 0;

              const collectPoint = (x, y) => {
                  return new Promise((pointResolve) => {
                      let samples = 0;
                      const maxSamples = 5;

                      const collectSample = () => {
                          samples++;
                          webgazer.recordScreenPosition(x, y);

                          if (samples < maxSamples) {
                              setTimeout(collectSample, 100);
                          } else {
                              pointResolve();
                          }
                      };

                      collectSample();
                  });
              };

              const processNextPoint = async () => {
                  if (currentPoint >= calibrationPositions.length) {
                      this.calibrationData.completed = true;
                      this.triggerEvent('calibrationCompleted',
  this.calibrationData);
                      resolve(this.calibrationData);
                      return;
                  }

                  const pos = calibrationPositions[currentPoint];
                  this.triggerEvent('calibrationPoint', { index:
  currentPoint, position: pos });

                  // Convert percentage to pixel coordinates
                  const x = (pos.x / 100) * window.innerWidth;
                  const y = (pos.y / 100) * window.innerHeight;

                  await collectPoint(x, y);
                  currentPoint++;

                  setTimeout(processNextPoint, 500);
              };

              processNextPoint();
          });
      }

      /**
       * Check if gaze is within a specific element
       */
      isGazeOnElement(gazeX, gazeY, element) {
          const rect = element.getBoundingClientRect();
          return gazeX >= rect.left &&
                 gazeX <= rect.right &&
                 gazeY >= rect.top &&
                 gazeY <= rect.bottom;
      }

      /**
       * NEW: Calculate Total Dwell Time on Areas of Interest (AOIs)
       */
      calculateDwellTimeOnAOIs(gazeData) {
          const aoiElements = document.querySelectorAll('.aoi');
          const dwellTimes = {};

          aoiElements.forEach(el => {
              // Use innerText and add a unique identifier if there are duplicate words
              const key = `${el.innerText.trim()}_${Math.random().toString(36).substr(2, 5)}`;
              dwellTimes[key] = 0;
          });
          
          if (gazeData.length < 2) {
              return dwellTimes;
          }

          for (let i = 0; i < gazeData.length - 1; i++) {
              const currentGaze = gazeData[i];
              const nextGaze = gazeData[i+1];
              
              aoiElements.forEach(el => {
                  if (this.isGazeOnElement(currentGaze.x, currentGaze.y, el)) {
                      const key = Object.keys(dwellTimes).find(k => k.startsWith(el.innerText.trim()));
                      if(key) {
                           // Ensure elapsedTime is a number before calculating difference
                           const duration = (typeof nextGaze.time === 'number' && typeof currentGaze.time === 'number') 
                                            ? nextGaze.time - currentGaze.time
                                            : 0;
                           if (duration > 0 && duration < 500) { // Add a threshold to avoid large gaps
                              dwellTimes[key] += duration;
                           }
                      }
                  }
              });
          }
          
          return dwellTimes;
      }

      /**
       * Get gaze data for a specific time range
       */
      getGazeDataInRange(startTime, endTime) {
          return this.gazeData.filter(point =>
              point.timestamp >= startTime && point.timestamp <= endTime
          );
      }

      /**
       * Calculate gaze statistics for an element
       */
      calculateGazeStats(element, timeRange = null) {
          let relevantGazeData = this.gazeData;

          if (timeRange) {
              relevantGazeData = this.getGazeDataInRange(timeRange.start,
  timeRange.end);
          }

          const gazeOnElement = relevantGazeData.filter(point =>
              this.isGazeOnElement(point.x, point.y, element)
          );

          return {
              totalGazePoints: relevantGazeData.length,
              gazePointsOnElement: gazeOnElement.length,
              gazePercentage: relevantGazeData.length > 0 ?
                  (gazeOnElement.length / relevantGazeData.length) * 100 :
  0,
              firstGaze: gazeOnElement.length > 0 ?
  gazeOnElement[0].timestamp : null,
              lastGaze: gazeOnElement.length > 0 ?
  gazeOnElement[gazeOnElement.length - 1].timestamp : null,
              totalDwellTime: gazeOnElement.length > 0 ?
                  gazeOnElement[gazeOnElement.length - 1].timestamp -
  gazeOnElement[0].timestamp : 0
          };
      }

      /**
       * Export gaze data
       */
      exportGazeData() {
          return {
              gazeData: this.gazeData,
              calibrationData: this.calibrationData,
              metadata: {
                  userAgent: navigator.userAgent,
                  screenResolution: `${screen.width}x${screen.height}`,
                  viewportSize:
  `${window.innerWidth}x${window.innerHeight}`,
                  exportTime: Date.now()
              }
          };
      }

      /**
       * Clear all gaze data
       */
      clearData() {
          this.gazeData = [];
          if (this.isInitialized) {
              webgazer.clearData();
          }
      }

      /**
       * Stop eye tracking
       */
      stop() {
          if (this.isInitialized && webgazer.isReady()) {
              webgazer.end();
              this.isInitialized = false;
              this.triggerEvent('stopped');
          }
      }

      /**
       * Pause eye tracking
       */
      pause() {
          if (this.isInitialized) {
              webgazer.pause();
              this.triggerEvent('paused');
          }
      }

      /**
       * Resume eye tracking
       */
      resume() {
          if (this.isInitialized) {
              webgazer.resume();
              this.triggerEvent('resumed');
          }
      }

      /**
       * Check if calibration exists and is valid
       */
      isCalibrated() {
          return this.calibrationData &&
                 this.calibrationData.completed &&
                 sessionStorage.getItem('eyeTrackingCalibrated') ===
  'true';
      }

      /**
       * Save calibration state
       */
      saveCalibrationState() {
          if (this.calibrationData && this.calibrationData.completed) {
              sessionStorage.setItem('eyeTrackingCalibrated', 'true');
              sessionStorage.setItem('calibrationTimestamp',
  this.calibrationData.timestamp.toString());
              sessionStorage.setItem('calibrationData',
  JSON.stringify(this.calibrationData));
          }
      }

      /**
       * Load calibration state
       */
      loadCalibrationState() {
          const calibrated =
  sessionStorage.getItem('eyeTrackingCalibrated') === 'true';
          const timestamp = sessionStorage.getItem('calibrationTimestamp');
          const data = sessionStorage.getItem('calibrationData');

          if (calibrated && timestamp && data) {
              this.calibrationData = JSON.parse(data);
              return true;
          }

          return false;
      }
  }

  // Create global instance
  window.eyeTracker = new EyeTrackingUtils();

  // Utility functions for backward compatibility
  window.initializeEyeTracking = (options) =>
  window.eyeTracker.init(options);
  window.startCalibration = () => window.eyeTracker.calibrate();
  window.isGazeOn = (x, y, element) => window.eyeTracker.isGazeOnElement(x,
   y, element);
  window.getGazeStats = (element, timeRange) =>
  window.eyeTracker.calculateGazeStats(element, timeRange);
  window.exportEyeTrackingData = () => window.eyeTracker.exportGazeData();
