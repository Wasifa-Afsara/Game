/* ==========================================================================
   LEVEL 1: EARTH ACADEMY & ARTEMIS LAUNCH PREP (TRAIN & TRAVEL)
   ========================================================================== */

class Level1 {
  constructor(gameManager) {
    this.game = gameManager;
    this.phase = 'setup'; // setup, matrix, launch, travel
    this.selectedPatch = 'Artemis';
    
    // Matrix puzzle state
    this.powerAlloc = { cockpit: 30, hydro: 30, lifesupport: 40 };

    // Launch sim state
    this.launchState = {
      running: false,
      altitude: 0, // km
      velocity: 0, // km/s
      fuel: 100, // %
      throttle: 50, // %
      staged: false,
      success: false,
      timer: null
    };

    // Travel sim state
    this.travelState = {
      angle: 5,
      duration: 3,
      locked: false
    };
  }

  init() {
    this.renderSetup();
    this.updateStepper();
  }

  updateStepper() {
    this.game.setActiveStep(0); // Step 1: TRAIN
  }

  renderSetup() {
    const container = document.getElementById('viewport-content');
    container.innerHTML = `
      <div class="level-container fade-in">
        <div class="level-header">
          <div>
            <h2>LEVEL 1 // CADET ACADEMY & LAUNCH PREP</h2>
            <div class="level-subtitle">PHASE 1: TRAIN - CADET CERTIFICATION</div>
          </div>
          <span class="badge-tag">EARTH BASE</span>
        </div>

        <div class="cadet-setup-grid">
          <div>
            <div class="input-group">
              <label class="input-label">CADET CALLSIGN / NAME</label>
              <input type="text" id="cadet-name-input" class="sci-input" value="${this.game.state.cadetName || 'Cadet Nova'}" placeholder="Enter name...">
            </div>

            <div class="input-group">
              <label class="input-label">SELECT MISSION INSIGNIA PATCH</label>
              <div class="patch-selector">
                <div class="patch-option ${this.selectedPatch === 'Artemis' ? 'selected' : ''}" onclick="level1.selectPatch('Artemis')">
                  <div class="patch-icon">🚀</div>
                  <div class="patch-name">Artemis Pioneer</div>
                </div>
                <div class="patch-option ${this.selectedPatch === 'Apollo' ? 'selected' : ''}" onclick="level1.selectPatch('Apollo')">
                  <div class="patch-icon">🛰️</div>
                  <div class="patch-name">Lunar Tech</div>
                </div>
                <div class="patch-option ${this.selectedPatch === 'Orion' ? 'selected' : ''}" onclick="level1.selectPatch('Orion')">
                  <div class="patch-icon">⭐</div>
                  <div class="patch-name">Orion Command</div>
                </div>
              </div>
            </div>
          </div>

          <div style="background: rgba(0,0,0,0.4); padding: 16px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
            <h4 style="color: var(--primary); font-family: var(--font-heading); margin-bottom: 10px;">MISSION OVERVIEW</h4>
            <p style="font-size: 0.9rem; color: #d1e3ff; line-height: 1.6;">
              Welcome, Cadet! You have been selected for Artemis-9 Lunar Expedition. Your mission:
              <br><br>
              1. <strong>TRAIN:</strong> Master Life Support & Launch Mechanics.<br>
              2. <strong>TRAVEL:</strong> Pilot trans-lunar flight to the Moon.<br>
              3. <strong>ESTABLISH & SURVIVE:</strong> Build a lunar base, extract resources, handle crises, and return safely.
            </p>
          </div>
        </div>

        <div style="margin-top: auto; display: flex; justify-content: flex-end;">
          <button class="btn-primary" onclick="level1.startMatrixTraining()">PROCEED TO TRAIN SIMULATOR ➔</button>
        </div>
      </div>
    `;

    eli.speak(
      "Greetings, Cadet! I am <strong>ELI</strong> (Exo-Life & Lunar Intelligence). First, confirm your callsign and mission patch. Then we begin your survival strategy training!",
      null
    );

    eli.showScienceTip(
      "ARTEMIS PROGRAM",
      "NASA's Artemis program aims to land astronauts on the Moon to establish sustainable exploration and prepare for future human missions to Mars."
    );
  }

  selectPatch(patchName) {
    this.selectedPatch = patchName;
    soundManager.playClick();
    document.querySelectorAll('.patch-option').forEach(el => el.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
  }

  startMatrixTraining() {
    const input = document.getElementById('cadet-name-input');
    if (input && input.value.trim()) {
      this.game.state.cadetName = input.value.trim();
    }
    soundManager.playClick();
    this.phase = 'matrix';

    const container = document.getElementById('viewport-content');
    container.innerHTML = `
      <div class="level-container fade-in">
        <div class="level-header">
          <div>
            <h2>LEVEL 1 // LIFE SUPPORT MATRIX</h2>
            <div class="level-subtitle">PHASE 1: TRAIN - POWER ALLOCATION PUZZLE</div>
          </div>
          <span class="badge-tag">POWER GRID: <span id="total-power-val">100</span> / 100 kW</span>
        </div>

        <p style="font-size: 0.9rem; color: #b0c4de;">
          <strong>Challenge:</strong> Balance 100 kW total generator power across all 3 ship sectors. 
          Each sector needs at least 25 kW to function, and Life Support needs 40 kW for 100% stability. Do not exceed 100 kW total!
        </p>

        <div class="matrix-grid">
          <div class="matrix-card">
            <div class="matrix-card-title">
              <span>COCKPIT & AVIONICS</span>
              <span id="cockpit-kw">${this.powerAlloc.cockpit} kW</span>
            </div>
            <input type="range" class="sci-slider" min="10" max="60" value="${this.powerAlloc.cockpit}" oninput="level1.updateMatrix('cockpit', this.value)">
            <div class="progress-bar-bg">
              <div id="cockpit-bar" class="progress-bar-fill" style="width: ${this.powerAlloc.cockpit * 1.6}%;"></div>
            </div>
            <span style="font-size: 0.8rem; color: var(--text-dim);">Flight Control Stability</span>
          </div>

          <div class="matrix-card">
            <div class="matrix-card-title">
              <span>HYDROPONICS & WATER</span>
              <span id="hydro-kw">${this.powerAlloc.hydro} kW</span>
            </div>
            <input type="range" class="sci-slider" min="10" max="60" value="${this.powerAlloc.hydro}" oninput="level1.updateMatrix('hydro', this.value)">
            <div class="progress-bar-bg">
              <div id="hydro-bar" class="progress-bar-fill" style="width: ${this.powerAlloc.hydro * 1.6}%;"></div>
            </div>
            <span style="font-size: 0.8rem; color: var(--text-dim);">Recycling Efficiency</span>
          </div>

          <div class="matrix-card">
            <div class="matrix-card-title">
              <span>LIFE SUPPORT (O2 & PRESSURE)</span>
              <span id="lifesupport-kw">${this.powerAlloc.lifesupport} kW</span>
            </div>
            <input type="range" class="sci-slider" min="10" max="60" value="${this.powerAlloc.lifesupport}" oninput="level1.updateMatrix('lifesupport', this.value)">
            <div class="progress-bar-bg">
              <div id="lifesupport-bar" class="progress-bar-fill" style="width: ${this.powerAlloc.lifesupport * 1.6}%;"></div>
            </div>
            <span style="font-size: 0.8rem; color: var(--text-dim);">Crew Oxygen Supply</span>
          </div>
        </div>

        <div id="matrix-status-msg" style="padding: 10px; border-radius: 6px; background: rgba(0,0,0,0.4); text-align: center; font-family: var(--font-heading); color: var(--primary);">
          STATUS: SYSTEM READY FOR SIMULATION TEST
        </div>

        <div style="margin-top: auto; display: flex; justify-content: space-between; align-items: center;">
          <button class="btn-secondary" onclick="level1.renderSetup()">⯇ BACK</button>
          <button id="matrix-submit-btn" class="btn-primary" onclick="level1.verifyMatrix()">VALIDATE LIFE SUPPORT MATRIX ➔</button>
        </div>
      </div>
    `;

    eli.speak(
      `Cadet ${this.game.state.cadetName}, in space, energy is life! Adjust the sliders so <strong>Life Support gets 40 kW</strong>, and Cockpit and Hydroponics get at least 25 kW each without blowing the generator load (100 kW max)!`,
      null
    );

    eli.showScienceTip(
      "LIFE SUPPORT IN SPACE",
      "Spacecraft use Electrolysis to split water into Oxygen ($2H_2O \\rightarrow 2H_2 + O_2$) and Sabatier reactors to remove Carbon Dioxide. This requires constant power!"
    );
  }

  updateMatrix(sector, val) {
    this.powerAlloc[sector] = parseInt(val);
    document.getElementById(`${sector}-kw`).innerText = `${val} kW`;
    document.getElementById(`${sector}-bar`).style.width = `${val * 1.6}%`;

    const total = this.powerAlloc.cockpit + this.powerAlloc.hydro + this.powerAlloc.lifesupport;
    const totalEl = document.getElementById('total-power-val');
    const msgEl = document.getElementById('matrix-status-msg');

    if (totalEl) totalEl.innerText = total;

    if (total > 100) {
      msgEl.innerHTML = `<span style="color: var(--danger);">⚠ OVERLOAD WARNING! Total power ${total} kW exceeds generator limit 100 kW!</span>`;
    } else if (this.powerAlloc.lifesupport < 40) {
      msgEl.innerHTML = `<span style="color: var(--warning);">⚠ WARNING: Life Support requires at least 40 kW for safe O2 generation!</span>`;
    } else if (this.powerAlloc.cockpit < 25 || this.powerAlloc.hydro < 25) {
      msgEl.innerHTML = `<span style="color: var(--warning);">⚠ WARNING: Subsystem power too low! Minimum 25 kW required per sector.</span>`;
    } else {
      msgEl.innerHTML = `<span style="color: var(--success);">✔ OPTIMAL POWER MATRIX BALANCE ACHIEVED (${total}/100 kW)!</span>`;
    }
  }

  verifyMatrix() {
    const total = this.powerAlloc.cockpit + this.powerAlloc.hydro + this.powerAlloc.lifesupport;
    if (total > 100) {
      soundManager.playAlarm();
      alert("Generator Overloaded! Reduce total power load to 100 kW or below.");
      return;
    }
    if (this.powerAlloc.lifesupport < 40 || this.powerAlloc.cockpit < 25 || this.powerAlloc.hydro < 25) {
      soundManager.playAlarm();
      alert("System imbalance! Ensure Life Support receives at least 40 kW and other sectors get 25 kW.");
      return;
    }

    soundManager.playSuccess();
    this.game.addScore(150);
    this.startLaunchSimulator();
  }

  startLaunchSimulator() {
    this.phase = 'launch';
    this.game.setActiveStep(1); // Step 2: TRAVEL

    const container = document.getElementById('viewport-content');
    container.innerHTML = `
      <div class="level-container fade-in">
        <div class="level-header">
          <div>
            <h2>LEVEL 1 // ARTEMIS LAUNCH SIMULATOR</h2>
            <div class="level-subtitle">PHASE 2: LAUNCH & ORBITAL ASCENT</div>
          </div>
          <span class="badge-tag">TARGET ALTITUDE: 100 KM</span>
        </div>

        <div class="launch-sim-container">
          <canvas id="launch-canvas" width="600" height="380"></canvas>

          <div class="launch-controls">
            <div class="gauge-box">
              <div class="gauge-label">ALTITUDE</div>
              <div class="gauge-val" id="launch-alt-val">0.0 km</div>
            </div>
            <div class="gauge-box">
              <div class="gauge-label">VELOCITY (GREEN WINDOW: 6.0-9.0 km/s)</div>
              <div class="gauge-val" id="launch-vel-val">0.0 km/s</div>
            </div>
            <div class="gauge-box">
              <div class="gauge-label">STAGE 1 FUEL</div>
              <div class="gauge-val" id="launch-fuel-val">100%</div>
            </div>

            <div class="input-group">
              <label class="input-label">ENGINE THROTTLE</label>
              <input type="range" id="throttle-slider" class="sci-slider" min="10" max="100" value="60" oninput="level1.setThrottle(this.value)">
            </div>

            <button id="stage-btn" class="btn-warning btn-disabled" style="padding: 10px; font-size: 0.85rem;" onclick="level1.triggerStage()">RELEASE STAGE 1</button>
            <button id="launch-start-btn" class="btn-primary" onclick="level1.launchRocket()">IGNITE ENGINES 🚀</button>
          </div>
        </div>
      </div>
    `;

    eli.speak(
      "Time for real launch simulation! Push throttle up to enter orbit. Watch out for <strong>Max Q</strong> (maximum dynamic pressure). When fuel hits under 30% at ~60km altitude, click <strong>RELEASE STAGE 1</strong> to gain velocity boost!",
      null
    );

    eli.showScienceTip(
      "ROCKET STAGING & ESCAPE VELOCITY",
      "Staging discards empty fuel tanks to reduce rocket mass. To break free from Earth's gravitational pull into space, rockets must reach Orbital Velocity (~7.8 km/s)."
    );

    this.initLaunchCanvas();
  }

  initLaunchCanvas() {
    const canvas = document.getElementById('launch-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Reset state
    this.launchState = {
      running: false,
      altitude: 0,
      velocity: 0,
      fuel: 100,
      throttle: 60,
      staged: false,
      success: false
    };

    this.drawLaunchFrame(ctx, canvas);
  }

  setThrottle(val) {
    this.launchState.throttle = parseInt(val);
  }

  launchRocket() {
    if (this.launchState.running) return;
    soundManager.playLaunchRoar(3.0);
    this.launchState.running = true;

    const launchBtn = document.getElementById('launch-start-btn');
    if (launchBtn) launchBtn.innerText = "LAUNCH IN PROGRESS...";

    const canvas = document.getElementById('launch-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const loop = () => {
      if (!this.launchState.running) return;

      // Physics update tick
      const throttleFactor = this.launchState.throttle / 100;
      
      if (this.launchState.fuel > 0) {
        this.launchState.fuel = Math.max(0, this.launchState.fuel - 0.25 * throttleFactor);
        this.launchState.velocity += (0.08 * throttleFactor);
      } else if (!this.launchState.staged) {
        // Drag slows down if stage not ejected
        this.launchState.velocity = Math.max(0, this.launchState.velocity - 0.05);
      } else {
        // Stage 2 boost
        this.launchState.velocity += 0.05;
      }

      this.launchState.altitude += (this.launchState.velocity * 0.15);

      // Enable stage button condition
      const stageBtn = document.getElementById('stage-btn');
      if (stageBtn && this.launchState.fuel <= 40 && !this.launchState.staged) {
        stageBtn.classList.remove('btn-disabled');
        stageBtn.style.boxShadow = '0 0 15px #ffb700';
      }

      // Update HUD
      document.getElementById('launch-alt-val').innerText = `${this.launchState.altitude.toFixed(1)} km`;
      document.getElementById('launch-vel-val').innerText = `${this.launchState.velocity.toFixed(1)} km/s`;
      document.getElementById('launch-fuel-val').innerText = `${Math.round(this.launchState.fuel)}%`;

      this.drawLaunchFrame(ctx, canvas);

      // Check orbit success
      if (this.launchState.altitude >= 100) {
        this.launchState.running = false;
        if (this.launchState.velocity >= 6.0 && this.launchState.velocity <= 10.0) {
          soundManager.playSuccess();
          this.game.addScore(250);
          eli.speak("EXCELLENT LAUNCH! Stable Earth Orbit achieved. Trans-Lunar Injection vector loaded!", () => {
            setTimeout(() => this.startTravelPhase(), 1500);
          });
        } else {
          soundManager.playAlarm();
          alert("Launch Trajectory Failure! Velocity was not within safe orbital velocity window (6-10 km/s). Retrying simulation...");
          this.startLaunchSimulator();
        }
        return;
      }

      if (this.launchState.fuel <= 0 && !this.launchState.staged && this.launchState.velocity < 2.0) {
        this.launchState.running = false;
        soundManager.playAlarm();
        alert("Rocket ran out of fuel before reaching orbit! Remember to release Stage 1 to shed mass!");
        this.startLaunchSimulator();
        return;
      }

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }

  triggerStage() {
    if (this.launchState.staged) return;
    soundManager.playClick();
    this.launchState.staged = true;
    this.launchState.velocity += 2.2; // Delta-V boost from staging!

    const stageBtn = document.getElementById('stage-btn');
    if (stageBtn) {
      stageBtn.innerText = "STAGE 1 DISCARDED ✔";
      stageBtn.classList.add('btn-disabled');
      stageBtn.style.boxShadow = 'none';
    }
  }

  drawLaunchFrame(ctx, canvas) {
    const w = canvas.width;
    const h = canvas.height;

    // Sky gradient shifting from blue to space black
    const altRatio = Math.min(1, this.launchState.altitude / 100);
    const grad = ctx.createLinearGradient(0, h, 0, 0);
    
    // Sky color blend
    const r = Math.round(30 * (1 - altRatio));
    const g = Math.round(100 * (1 - altRatio));
    const b = Math.round(200 * (1 - altRatio));
    grad.addColorStop(0, `rgb(${r},${g},${b})`);
    grad.addColorStop(1, '#02040a');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Draw Stars in high altitude
    if (altRatio > 0.3) {
      ctx.fillStyle = `rgba(255, 255, 255, ${altRatio * 0.8})`;
      for (let i = 0; i < 40; i++) {
        const sx = (i * 37) % w;
        const sy = (i * 19) % (h * 0.7);
        ctx.fillRect(sx, sy, 2, 2);
      }
    }

    // Rocket position Y
    const rocketY = h - 60 - (altRatio * (h - 120));

    // Rocket flame
    if (this.launchState.running && this.launchState.fuel > 0) {
      ctx.fillStyle = '#ff7700';
      ctx.beginPath();
      ctx.moveTo(w / 2 - 8, rocketY + 24);
      ctx.lineTo(w / 2 + 8, rocketY + 24);
      ctx.lineTo(w / 2, rocketY + 44 + Math.random() * 10);
      ctx.closePath();
      ctx.fill();
    }

    // Rocket Body
    ctx.fillStyle = '#e2f1ff';
    ctx.fillRect(w / 2 - 10, rocketY - 20, 20, 44);

    // Cone tip
    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.moveTo(w / 2 - 10, rocketY - 20);
    ctx.lineTo(w / 2 + 10, rocketY - 20);
    ctx.lineTo(w / 2, rocketY - 36);
    ctx.closePath();
    ctx.fill();

    // Stage line if not staged
    if (!this.launchState.staged) {
      ctx.strokeStyle = '#ffb700';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(w / 2 - 12, rocketY + 10);
      ctx.lineTo(w / 2 + 12, rocketY + 10);
      ctx.stroke();
    }
  }

  startTravelPhase() {
    this.phase = 'travel';

    const container = document.getElementById('viewport-content');
    container.innerHTML = `
      <div class="level-container fade-in">
        <div class="level-header">
          <div>
            <h2>LEVEL 1 // TRANS-LUNAR INJECTION (TLI)</h2>
            <div class="level-subtitle">PHASE 3: TRAVEL TO THE MOON (384,400 KM)</div>
          </div>
          <span class="badge-tag">DEEP SPACE TRANSIT</span>
        </div>

        <div style="background: rgba(0,0,0,0.5); padding: 16px; border-radius: 8px; border: 1px solid rgba(0,240,255,0.3); display: flex; flex-direction: column; gap: 14px;">
          <h4 style="color: var(--primary); font-family: var(--font-heading);">MID-COURSE TRAJECTORY CORRECTION</h4>
          <p style="font-size: 0.9rem; color: #cce5ff;">
            To achieve Lunar Orbit Insertion (LOI), align the thruster insertion angle slider to <strong>7.5°</strong> and click <strong>FIRE TLI BURN</strong>.
          </p>

          <div class="input-group">
            <label class="input-label">INSERTION ANGLE (<span id="angle-val">5.0</span>°)</label>
            <input type="range" class="sci-slider" min="1.0" max="15.0" step="0.5" value="5.0" oninput="level1.updateTravelAngle(this.value)">
          </div>

          <div id="travel-status" style="padding: 12px; background: rgba(0,0,0,0.6); border-radius: 6px; font-family: var(--font-heading); color: var(--warning); text-align: center;">
            TRAJECTORY OFF-TARGET. ADJUST ANGLE TO 7.5°
          </div>

          <button id="tli-burn-btn" class="btn-primary" style="margin-top: 10px;" onclick="level1.executeTLIBurn()">EXECUTE TRANS-LUNAR BURN 🔥</button>
        </div>
      </div>
    `;

    eli.speak(
      "We are coasting towards the Moon! Spacecraft trajectory requires high precision. Set the angle to 7.5° so the Moon's gravity catches us gracefully into orbit!",
      null
    );
  }

  updateTravelAngle(val) {
    this.travelState.angle = parseFloat(val);
    document.getElementById('angle-val').innerText = val;
    const statusEl = document.getElementById('travel-status');

    if (Math.abs(this.travelState.angle - 7.5) < 0.2) {
      statusEl.innerHTML = `<span style="color: var(--success);">✔ PERFECT LUNAR INJECTION TRAJECTORY LOCKED!</span>`;
    } else {
      statusEl.innerHTML = `<span style="color: var(--warning);">TRAJECTORY OFF-TARGET (${val}°). ALIGN TO 7.5°</span>`;
    }
  }

  executeTLIBurn() {
    if (Math.abs(this.travelState.angle - 7.5) >= 0.2) {
      soundManager.playAlarm();
      alert("Trajectory Misaligned! Please adjust angle slider to 7.5° before executing burn.");
      return;
    }

    soundManager.playLaunchRoar(2.0);
    soundManager.playSuccess();
    this.game.addScore(200);

    const btn = document.getElementById('tli-burn-btn');
    if (btn) btn.innerText = "TRANS-LUNAR BURN SUCCESSFUL! ARRIVING AT MOON...";

    setTimeout(() => {
      this.game.nextLevel(); // Advances to Level 2 (Lunar Base & Exploration)
    }, 2000);
  }
}
