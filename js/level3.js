/* ==========================================================================
   LEVEL 3: SURVIVE CRISIS & EARTH RETURN (SURVIVE, PREPARE, RETURN)
   ========================================================================== */

class Level3 {
  constructor(gameManager) {
    this.game = gameManager;
    this.phase = 'survive'; // survive, prepare, return, debrief

    // Circuit puzzle state
    this.circuitNodes = [
      { id: 0, label: 'PWR', x: 60, y: 190, connected: true, type: 'source' },
      { id: 1, label: 'NODE A', x: 200, y: 90, connected: false, type: 'node' },
      { id: 2, label: 'NODE B', x: 200, y: 290, connected: false, type: 'node' },
      { id: 3, label: 'NODE C', x: 380, y: 190, connected: false, type: 'node' },
      { id: 4, label: 'O2 GEN', x: 500, y: 190, connected: false, type: 'target' }
    ];
    this.selectedNode = null;
    this.connections = [];

    // Fuel prepare state
    this.fuelState = {
      waterUsed: 50,
      he3Used: 20,
      massTotal: 4200, // kg
      ready: false
    };

    // Reentry sim state
    this.reentry = {
      running: false,
      altitude: 120, // km
      temp: 200, // C
      angle: 6.5, // degrees
      chuteDeployed: false,
      success: false
    };
  }

  init() {
    this.updateStepper();
    this.renderSurvivePhase();
  }

  updateStepper() {
    this.game.setActiveStep(6); // Step 7: SURVIVE
  }

  renderSurvivePhase() {
    this.phase = 'survive';
    soundManager.playAlarm();

    const container = document.getElementById('viewport-content');
    container.innerHTML = `
      <div class="level-container fade-in">
        <div class="level-header">
          <div>
            <h2>LEVEL 3 // CRISIS SURVIVAL & EARTH RETURN</h2>
            <div class="level-subtitle">PHASE 1: SURVIVE - MICROMETEORITE IMPACT CIRCUIT REPAIR</div>
          </div>
          <span class="badge-tag" style="background: rgba(255,42,109,0.3); color: var(--danger); border-color: var(--danger);">CRITICAL ALERT: LIFE SUPPORT FAILURE</span>
        </div>

        <p style="font-size: 0.95rem; color: #ffb7c5;">
          <strong>EMERGENCY:</strong> A high-velocity micrometeorite swarm breached sector 4 and severed the main life support circuit line! 
          Click and link the glowing circuit nodes from <strong>PWR</strong> to <strong>O2 GEN</strong> to restore life support power!
        </p>

        <div class="circuit-game-container">
          <canvas id="circuit-canvas" width="580" height="380"></canvas>

          <div style="background: rgba(0,0,0,0.5); padding: 16px; border-radius: 8px; border: 1px solid rgba(255,42,109,0.4); display: flex; flex-direction: column; gap: 14px;">
            <h4 style="color: var(--danger); font-family: var(--font-heading);">CIRCUIT STATUS</h4>
            <div style="font-size: 0.9rem; color: #e2f1ff;">
              Connections Made: <span id="conn-count" style="font-weight: bold; color: var(--primary);">0</span> / 3
            </div>
            <div style="font-size: 0.85rem; color: var(--text-dim);">
              Instruction: Click PWR, then Node A or B, then Node C, then O2 GEN to create a continuous circuit loop.
            </div>
            <button class="btn-secondary" onclick="level3.resetCircuit()">RESET CIRCUIT NODES ↺</button>
            <button id="circuit-verify-btn" class="btn-primary btn-disabled" onclick="level3.verifyCircuit()">VERIFY & POWER UP O2 ➔</button>
          </div>
        </div>
      </div>
    `;

    eli.speak(
      "MAYDAY! Micrometeorites travel at 20 km/s! The main life support relay is blown. Link the circuit nodes from PWR to O2 GEN right now to restore oxygen generation!",
      null
    );

    eli.showScienceTip(
      "MICROMETEORITES & HULL SHIELDING",
      "Micrometeorites are tiny specks of space dust traveling at hypervelocity (up to 70 km/s). Space stations use Multi-layer Whipple Shields (layers of aluminum & Kevlar) to absorb crater impacts!"
    );

    this.initCircuitCanvas();
  }

  initCircuitCanvas() {
    this.connections = [];
    this.selectedNode = null;
    this.circuitNodes.forEach((n, i) => n.connected = (i === 0));

    const canvas = document.getElementById('circuit-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    canvas.onclick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      this.circuitNodes.forEach(node => {
        const dist = Math.hypot(clickX - node.x, clickY - node.y);
        if (dist < 28) {
          this.handleNodeClick(node);
        }
      });
      this.drawCircuitFrame(ctx, canvas);
    };

    this.drawCircuitFrame(ctx, canvas);
  }

  handleNodeClick(node) {
    soundManager.playClick();
    if (this.selectedNode === null) {
      if (node.connected || node.id === 0) {
        this.selectedNode = node;
      } else {
        alert("Start connecting from the powered PWR node first!");
      }
    } else {
      if (this.selectedNode.id !== node.id) {
        // Create connection line
        this.connections.push({ from: this.selectedNode, to: node });
        node.connected = true;
        soundManager.playSpark();

        this.selectedNode = node;
        document.getElementById('conn-count').innerText = this.connections.length;

        if (node.id === 4 && this.connections.length >= 3) {
          soundManager.playSuccess();
          const btn = document.getElementById('circuit-verify-btn');
          if (btn) {
            btn.classList.remove('btn-disabled');
            btn.style.boxShadow = '0 0 15px #00ff9d';
          }
        }
      }
    }
  }

  resetCircuit() {
    soundManager.playClick();
    this.connections = [];
    this.selectedNode = null;
    this.circuitNodes.forEach((n, i) => n.connected = (i === 0));
    document.getElementById('conn-count').innerText = '0';
    const canvas = document.getElementById('circuit-canvas');
    if (canvas) this.drawCircuitFrame(canvas.getContext('2d'), canvas);
  }

  drawCircuitFrame(ctx, canvas) {
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#0a0d17';
    ctx.fillRect(0, 0, w, h);

    // Draw background grid lines
    ctx.strokeStyle = 'rgba(255, 42, 109, 0.1)';
    for (let x = 0; x < w; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // Draw active connection lines
    this.connections.forEach(conn => {
      ctx.strokeStyle = '#00ff9d';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#00ff9d';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(conn.from.x, conn.from.y);
      ctx.lineTo(conn.to.x, conn.to.y);
      ctx.stroke();
      ctx.shadowBlur = 0;
    });

    // Draw Nodes
    this.circuitNodes.forEach(node => {
      const isSelected = this.selectedNode && this.selectedNode.id === node.id;
      ctx.fillStyle = node.connected ? '#00ff9d' : isSelected ? '#ffb700' : '#1a243a';
      ctx.strokeStyle = node.connected ? '#fff' : '#00f0ff';
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.arc(node.x, node.y, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = node.connected ? '#000' : '#fff';
      ctx.font = '11px Orbitron';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, node.x, node.y);
    });
  }

  verifyCircuit() {
    soundManager.playSuccess();
    this.game.addScore(300);
    this.startPreparePhase();
  }

  startPreparePhase() {
    this.phase = 'prepare';
    this.game.setActiveStep(7); // Step 8: PREPARE

    const container = document.getElementById('viewport-content');
    container.innerHTML = `
      <div class="level-container fade-in">
        <div class="level-header">
          <div>
            <h2>LEVEL 3 // RETURN VEHICLE FUEL SYNTHESIS</h2>
            <div class="level-subtitle">PHASE 2: PREPARE FOR DEPARTURE TO EARTH</div>
          </div>
          <span class="badge-tag">TARGET CRAFT MASS: &lt; 4,500 KG</span>
        </div>

        <p style="font-size: 0.95rem; color: #b0c4de;">
          Before lunar ascent, synthesize return propellant using collected Water Ice ($H_2O \rightarrow H_2 + O_2$) and Helium-3 isotopes. Balance total craft payload mass!
        </p>

        <div style="background: rgba(0,0,0,0.5); padding: 18px; border-radius: 8px; border: 1px solid rgba(0,240,255,0.3); display: flex; flex-direction: column; gap: 16px;">
          <div class="input-group">
            <label class="input-label">WATER ICE FOR HYDROGEN PROPELLANT (<span id="water-use-val">50</span> L)</label>
            <input type="range" class="sci-slider" min="20" max="100" value="50" oninput="level3.updateFuelMass('water', this.value)">
          </div>

          <div class="input-group">
            <label class="input-label">HELIUM-3 ISOTOPE SUPER-FUEL BOOST (<span id="he3-use-val">20</span> kg)</label>
            <input type="range" class="sci-slider" min="10" max="50" value="20" oninput="level3.updateFuelMass('he3', this.value)">
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(20,32,56,0.8); padding: 14px; border-radius: 6px;">
            <div>
              <div style="font-size: 0.85rem; color: var(--text-muted);">CALCULATED TOTAL SPACECRAFT MASS</div>
              <div style="font-family: var(--font-heading); font-size: 1.4rem; color: var(--primary);" id="total-mass-val">4200 kg</div>
            </div>
            <div id="mass-status-tag" style="font-family: var(--font-heading); color: var(--success);">✔ OPTIMAL LAUNCH MASS WINDOW</div>
          </div>

          <button class="btn-primary" onclick="level3.startReturnPhase()">INITIATE LUNAR ASCENT & EARTH RETURN 🚀</button>
        </div>
      </div>
    `;

    eli.speak(
      "Excellent circuit repair, Cadet! Now synthesize fuel for Earth departure. Keep spacecraft mass under 4,500 kg so our retro-thrusters have enough delta-v for atmospheric re-entry!",
      null
    );

    eli.showScienceTip(
      "PROPELLANT SYNTHESIS (ISRU)",
      "In-Situ Resource Utilization (ISRU) allows astronauts to produce rocket fuel directly on the Moon by splitting water ice into liquid hydrogen ($LH_2$) fuel and liquid oxygen ($LOX$) oxidizer."
    );
  }

  updateFuelMass(type, val) {
    if (type === 'water') {
      this.fuelState.waterUsed = parseInt(val);
      document.getElementById('water-use-val').innerText = val;
    } else {
      this.fuelState.he3Used = parseInt(val);
      document.getElementById('he3-use-val').innerText = val;
    }

    const totalMass = 3200 + (this.fuelState.waterUsed * 12) + (this.fuelState.he3Used * 20);
    this.fuelState.massTotal = totalMass;

    const massEl = document.getElementById('total-mass-val');
    const tagEl = document.getElementById('mass-status-tag');

    if (massEl) massEl.innerText = `${totalMass} kg`;

    if (totalMass > 4500) {
      tagEl.innerHTML = `<span style="color: var(--danger);">⚠ OVERWEIGHT! Reduce fuel load below 4,500 kg!</span>`;
    } else {
      tagEl.innerHTML = `<span style="color: var(--success);">✔ OPTIMAL LAUNCH MASS WINDOW</span>`;
    }
  }

  startReturnPhase() {
    if (this.fuelState.massTotal > 4500) {
      soundManager.playAlarm();
      alert("Spacecraft overweight! Reduce propellant load below 4,500 kg.");
      return;
    }

    this.phase = 'return';
    this.game.setActiveStep(8); // Step 9: RETURN

    const container = document.getElementById('viewport-content');
    container.innerHTML = `
      <div class="level-container fade-in">
        <div class="level-header">
          <div>
            <h2>LEVEL 3 // EARTH RE-ENTRY INTERFACE SIMULATOR</h2>
            <div class="level-subtitle">PHASE 3: ATMOSPHERIC DROP & PARACHUTE DEPLOYMENT</div>
          </div>
          <span class="badge-tag">RE-ENTRY CORRIDOR: 5.5° - 7.5°</span>
        </div>

        <div class="reentry-container">
          <canvas id="reentry-canvas" width="600" height="380"></canvas>

          <div class="launch-controls">
            <div class="gauge-box">
              <div class="gauge-label">ALTITUDE</div>
              <div class="gauge-val" id="reentry-alt-val">120.0 km</div>
            </div>
            <div class="gauge-box">
              <div class="gauge-label">HEAT SHIELD TEMP</div>
              <div class="gauge-val" id="reentry-temp-val" style="color: var(--warning);">200 °C</div>
            </div>

            <div class="input-group">
              <label class="input-label">ENTRY ANGLE (<span id="reentry-angle-val">6.5</span>°)</label>
              <input type="range" class="sci-slider" min="4.0" max="9.0" step="0.1" value="6.5" oninput="level3.updateReentryAngle(this.value)">
            </div>

            <button id="chute-btn" class="btn-warning btn-disabled" style="padding: 10px; font-size: 0.85rem;" onclick="level3.deployChute()">DEPLOY PARACHUTES 🪂</button>
            <button id="reentry-start-btn" class="btn-primary" onclick="level3.launchReentry()">START ATMOSPHERIC ENTRY 🔥</button>
          </div>
        </div>
      </div>
    `;

    eli.speak(
      "THIS IS IT, CADET! Entering Earth's upper atmosphere at 11 km/s! Adjust entry angle to stay inside the <strong>5.5° to 7.5° corridor</strong>. When altitude drops below 10 km, click <strong>DEPLOY PARACHUTES</strong> for ocean splashdown!",
      null
    );

    eli.showScienceTip(
      "ATMOSPHERIC RE-ENTRY HEAT & CORRIDOR",
      "Friction between air molecules and the fast-moving spacecraft creates plasma temperatures over 1,500°C. Ablative heat shields burn away to protect astronauts!"
    );

    this.initReentryCanvas();
  }

  initReentryCanvas() {
    this.reentry = {
      running: false,
      altitude: 120,
      temp: 200,
      angle: 6.5,
      chuteDeployed: false,
      success: false
    };

    const canvas = document.getElementById('reentry-canvas');
    if (!canvas) return;
    this.drawReentryFrame(canvas.getContext('2d'), canvas);
  }

  updateReentryAngle(val) {
    this.reentry.angle = parseFloat(val);
    document.getElementById('reentry-angle-val').innerText = val;
  }

  launchReentry() {
    if (this.reentry.running) return;
    soundManager.playLaunchRoar(3.0);
    this.reentry.running = true;

    const startBtn = document.getElementById('reentry-start-btn');
    if (startBtn) startBtn.innerText = "RE-ENTRY IN PROGRESS...";

    const canvas = document.getElementById('reentry-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const loop = () => {
      if (!this.reentry.running) return;

      // Update altitude & heat
      this.reentry.altitude = Math.max(0, this.reentry.altitude - 1.2);
      
      // Heat formula based on angle
      const heatMult = this.reentry.angle / 6.5;
      this.reentry.temp = Math.min(2200, Math.round(this.reentry.temp + 25 * heatMult));

      // Enable parachute button
      const chuteBtn = document.getElementById('chute-btn');
      if (chuteBtn && this.reentry.altitude <= 15 && !this.reentry.chuteDeployed) {
        chuteBtn.classList.remove('btn-disabled');
        chuteBtn.style.boxShadow = '0 0 15px #00ff9d';
      }

      document.getElementById('reentry-alt-val').innerText = `${this.reentry.altitude.toFixed(1)} km`;
      document.getElementById('reentry-temp-val').innerText = `${this.reentry.temp} °C`;

      this.drawReentryFrame(ctx, canvas);

      // Check failure angle
      if (this.reentry.angle > 7.5 && this.reentry.temp > 1800) {
        this.reentry.running = false;
        soundManager.playAlarm();
        alert("Re-entry Overheat Failure! Entry angle was too steep (>7.5°). Heat shield compromised.");
        this.startReturnPhase();
        return;
      }

      if (this.reentry.angle < 5.5 && this.reentry.altitude < 60) {
        this.reentry.running = false;
        soundManager.playAlarm();
        alert("Re-entry Angle Too Shallow (<5.5°)! Spacecraft skipped off Earth's atmosphere into space.");
        this.startReturnPhase();
        return;
      }

      // Check touchdown
      if (this.reentry.altitude <= 0) {
        this.reentry.running = false;
        if (this.reentry.chuteDeployed) {
          soundManager.playSuccess();
          this.game.addScore(500);
          this.showCertificate();
        } else {
          soundManager.playAlarm();
          alert("Impact Crash! Parachutes were not deployed before splashdown.");
          this.startReturnPhase();
        }
        return;
      }

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }

  deployChute() {
    if (this.reentry.chuteDeployed) return;
    soundManager.playClick();
    soundManager.playSuccess();
    this.reentry.chuteDeployed = true;

    const btn = document.getElementById('chute-btn');
    if (btn) {
      btn.innerText = "PARACHUTES DEPLOYED 🪂";
      btn.classList.add('btn-disabled');
    }
  }

  drawReentryFrame(ctx, canvas) {
    const w = canvas.width;
    const h = canvas.height;

    // Atmospheric gradient
    const altRatio = this.reentry.altitude / 120;
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#020308');
    grad.addColorStop(0.7, '#142540');
    grad.addColorStop(1, '#00a8ff');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    const posY = h - (altRatio * (h - 80)) - 40;

    // Heat glow plasma trails
    if (this.reentry.running && this.reentry.temp > 500) {
      ctx.fillStyle = 'rgba(255, 60, 0, 0.6)';
      ctx.beginPath();
      ctx.arc(w / 2, posY + 10, 30, 0, Math.PI);
      ctx.fill();
    }

    // Spacecraft capsule
    ctx.fillStyle = '#d0e0f0';
    ctx.beginPath();
    ctx.moveTo(w / 2 - 16, posY + 10);
    ctx.lineTo(w / 2 + 16, posY + 10);
    ctx.lineTo(w / 2, posY - 20);
    ctx.closePath();
    ctx.fill();

    // Heat shield bottom
    ctx.fillStyle = '#333';
    ctx.fillRect(w / 2 - 18, posY + 10, 36, 6);

    // Parachute if deployed
    if (this.reentry.chuteDeployed) {
      ctx.fillStyle = '#ff7700';
      ctx.beginPath();
      ctx.arc(w / 2, posY - 50, 35, Math.PI, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w / 2 - 30, posY - 50);
      ctx.lineTo(w / 2, posY - 20);
      ctx.moveTo(w / 2 + 30, posY - 50);
      ctx.lineTo(w / 2, posY - 20);
      ctx.stroke();
    }
  }

  showCertificate() {
    this.phase = 'debrief';
    this.game.setActiveStep(8);

    const container = document.getElementById('viewport-content');
    container.innerHTML = `
      <div class="level-container fade-in">
        <div class="cert-card">
          <div class="cert-header">ARTEMIS EXPEDITION DIPLOMA</div>
          <div style="font-size: 0.9rem; color: var(--primary-glow); letter-spacing: 1px;">NATIONAL SPACE CADET ACADEMY CERTIFICATION</div>
          
          <div class="cert-name">${this.game.state.cadetName.toUpperCase()}</div>
          
          <p style="font-size: 0.95rem; color: #d1e3ff; line-height: 1.6;">
            Has successfully trained on Earth, piloted trans-lunar flight, established and operated the Artemis-9 Lunar Outpost, 
            survived solar radiation & micrometeorite crises, and safely returned to Earth with invaluable scientific discoveries!
          </p>

          <div class="badge-grid">
            <div class="badge-item">
              <span style="font-size: 1.5rem;">🏅</span>
              <div>
                <div>RANK AWARDED</div>
                <div style="color: var(--primary);">MASTER LUNAR PIONEER</div>
              </div>
            </div>

            <div class="badge-item">
              <span style="font-size: 1.5rem;">⭐</span>
              <div>
                <div>TOTAL SCORE</div>
                <div style="color: var(--success);">${this.game.state.score} PTS</div>
              </div>
            </div>
          </div>

          <div style="display: flex; justify-content: center; gap: 16px; margin-top: 20px;">
            <button class="btn-primary" onclick="window.print()">PRINT / SAVE CERTIFICATE 🖨️</button>
            <button class="btn-secondary" onclick="location.reload()">REPLAY EXPEDITION ↺</button>
          </div>
        </div>
      </div>
    `;

    eli.speak(
      `CONGRATULATIONS, COMMANDER ${this.game.state.cadetName.toUpperCase()}! You have completed the Artemis-9 Space Survival Mission! Earth welcomes you home as a hero of space science!`,
      null
    );

    eli.showScienceTip(
      "FUTURE OF HUMAN SPACEFLIGHT",
      "The skills you practiced today—resource recycling, orbital mechanics, radiation protection, and emergency risk management—are the real foundation of future human missions to Mars and deep space!"
    );
  }
}
