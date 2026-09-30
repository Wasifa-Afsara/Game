/* ==========================================================================
   LEVEL 2: ARTEMIS LUNAR OUTPOST (ESTABLISH, EXPLORE, MANAGE, DECIDE)
   ========================================================================== */

class Level2 {
  constructor(gameManager) {
    this.game = gameManager;
    this.phase = 'establish'; // establish, manage, explore, decide

    // Resource economy state
    this.resources = {
      oxygen: 100, // %
      water: 100,  // L
      power: 100,  // kW
      food: 100,   // %
      regolith: 0, // kg
      ice: 0,      // kg
      science: 0,  // pts
      morale: 100  // %
    };

    // Rover exploration state
    this.rover = {
      x: 0,
      y: 0,
      samplesCollected: 0,
      totalSamplesNeeded: 4,
      gridSize: 8,
      visited: [],
      items: []
    };

    this.currentEvent = null;
  }

  init() {
    this.updateStepper();
    this.renderEstablishPhase();
  }

  updateStepper() {
    this.game.setActiveStep(2); // Step 3: ESTABLISH
  }

  renderEstablishPhase() {
    this.phase = 'establish';
    const container = document.getElementById('viewport-content');
    container.innerHTML = `
      <div class="level-container fade-in">
        <div class="level-header">
          <div>
            <h2>LEVEL 2 // LUNAR BASE OUTPOST "ARTEMIS-9"</h2>
            <div class="level-subtitle">PHASE 1: ESTABLISH OUTPOST & LIFE SUPPORT PIPELINE</div>
          </div>
          <span class="badge-tag">LOCATION: SOUTH POLE (SHACKLETON CRATER)</span>
        </div>

        <p style="font-size: 0.95rem; color: #b0c4de;">
          You have touched down at the Lunar South Pole! This region features permanently shadowed craters with rich water ice reserves. Select module upgrades to deploy.
        </p>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin: 16px 0;">
          <div style="background: var(--bg-card); border: 1px solid var(--primary-glow); padding: 16px; border-radius: 8px;">
            <h4 style="color: var(--primary); font-family: var(--font-heading); margin-bottom: 8px;">1. HYDROLAB GREENHOUSE</h4>
            <p style="font-size: 0.85rem; color: #c0d8f0; margin-bottom: 12px;">Recycles $CO_2$ into $O_2$ using micro-algae while growing fresh hydroponic food.</p>
            <button class="btn-secondary" style="width: 100%;" onclick="level2.deployModule('hydro')">DEPLOY GREENHOUSE ✔</button>
          </div>

          <div style="background: var(--bg-card); border: 1px solid var(--primary-glow); padding: 16px; border-radius: 8px;">
            <h4 style="color: var(--primary); font-family: var(--font-heading); margin-bottom: 8px;">2. SOLAR ARRAY & BATTERY</h4>
            <p style="font-size: 0.85rem; color: #c0d8f0; margin-bottom: 12px;">Captures continuous sunlight on the Rim of Shackleton Crater for base power.</p>
            <button class="btn-secondary" style="width: 100%;" onclick="level2.deployModule('solar')">DEPLOY SOLAR ARRAY ✔</button>
          </div>

          <div style="background: var(--bg-card); border: 1px solid var(--primary-glow); padding: 16px; border-radius: 8px;">
            <h4 style="color: var(--primary); font-family: var(--font-heading); margin-bottom: 8px;">3. ICE MELT REFINERY</h4>
            <p style="font-size: 0.85rem; color: #c0d8f0; margin-bottom: 12px;">Extracts water ice from crater regolith for drinking water & rocket fuel propellant.</p>
            <button class="btn-secondary" style="width: 100%;" onclick="level2.deployModule('ice')">DEPLOY REFINERY ✔</button>
          </div>

          <div style="background: var(--bg-card); border: 1px solid var(--primary-glow); padding: 16px; border-radius: 8px;">
            <h4 style="color: var(--primary); font-family: var(--font-heading); margin-bottom: 8px;">4. RADIATION VAULT</h4>
            <p style="font-size: 0.85rem; color: #c0d8f0; margin-bottom: 12px;">Heavy regolith shielding protecting astronauts against cosmic radiation flares.</p>
            <button class="btn-secondary" style="width: 100%;" onclick="level2.deployModule('vault')">DEPLOY VAULT ✔</button>
          </div>
        </div>

        <div style="margin-top: auto; display: flex; justify-content: flex-end;">
          <button class="btn-primary" onclick="level2.startManagePhase()">OPEN OUTPOST MANAGEMENT HUD ➔</button>
        </div>
      </div>
    `;

    eli.speak(
      "Welcome to the Moon! The South Pole is rich in water ice inside shadowed craters. Deploy your base modules so we can establish life support and begin surface exploration!",
      null
    );

    eli.showScienceTip(
      "WHY THE LUNAR SOUTH POLE?",
      "The Moon's South Pole has deep craters whose floors haven't seen sunlight in billions of years, locking trapped water ice ($H_2O$) that can be converted into drinking water, oxygen, and hydrogen rocket fuel!"
    );
  }

  deployModule(type) {
    soundManager.playClick();
    soundManager.playSuccess();
    this.game.addScore(100);

    const labels = {
      hydro: 'GREENHOUSE DEPLOYED',
      solar: 'SOLAR ARRAY DEPLOYED',
      ice: 'ICE REFINERY DEPLOYED',
      vault: 'RADIATION VAULT DEPLOYED'
    };

    alert(`Module ${labels[type]}! Outpost efficiency increased.`);
  }

  startManagePhase() {
    this.phase = 'manage';
    this.game.setActiveStep(3); // Step 4: EXPLORE / MANAGE

    const container = document.getElementById('viewport-content');
    container.innerHTML = `
      <div class="level-container fade-in">
        <div class="level-header">
          <div>
            <h2>LEVEL 2 // OUTPOST OPERATIONS & ROVER EXPLORATION</h2>
            <div class="level-subtitle">PHASE 2: MANAGE & EXPLORE LUNAR SURFACE</div>
          </div>
          <span class="badge-tag">SAMPLES COLLECTED: <span id="sample-count-hud">0</span> / 4</span>
        </div>

        <div class="outpost-dashboard">
          <div class="resource-bar-grid">
            <h4 style="font-family: var(--font-heading); color: var(--primary); font-size: 0.85rem;">LIFE SUPPORT STATUS</h4>
            
            <div class="resource-meter">
              <div class="meter-header">
                <span class="meter-name">OXYGEN (O2)</span>
                <span class="meter-val" id="res-o2">100%</span>
              </div>
              <div class="progress-bar-bg"><div id="bar-o2" class="progress-bar-fill" style="width: 100%;"></div></div>
            </div>

            <div class="resource-meter">
              <div class="meter-header">
                <span class="meter-name">WATER (H2O)</span>
                <span class="meter-val" id="res-water">100 L</span>
              </div>
              <div class="progress-bar-bg"><div id="bar-water" class="progress-bar-fill" style="width: 100%;"></div></div>
            </div>

            <div class="resource-meter">
              <div class="meter-header">
                <span class="meter-name">POWER (kW)</span>
                <span class="meter-val" id="res-power">100 kW</span>
              </div>
              <div class="progress-bar-bg"><div id="bar-power" class="progress-bar-fill" style="width: 100%;"></div></div>
            </div>

            <div class="resource-meter">
              <div class="meter-header">
                <span class="meter-name">CREW MORALE</span>
                <span class="meter-val" id="res-morale">100%</span>
              </div>
              <div class="progress-bar-bg"><div id="bar-morale" class="progress-bar-fill" style="width: 100%;"></div></div>
            </div>

            <div style="margin-top: 10px; font-size: 0.8rem; color: var(--text-dim);">
              Click <strong>SIMULATE DAY TICK</strong> to process life support & gain science data!
            </div>
            <button class="btn-secondary" onclick="level2.tickDay()">NEXT OUTPOST DAY ⯈</button>
          </div>

          <div class="rover-view-container">
            <h4 style="font-family: var(--font-heading); color: var(--primary);">ROVER SURFACE MAP (USE WASD / ARROWS / DPAD)</h4>
            <canvas id="rover-canvas" width="500" height="320"></canvas>

            <div class="rover-controls-bar">
              <div class="dpad-container">
                <div></div>
                <button class="dpad-btn" onclick="level2.moveRover(0, -1)">▲</button>
                <div></div>
                <button class="dpad-btn" onclick="level2.moveRover(-1, 0)">◄</button>
                <div class="dpad-btn" style="font-size: 0.6rem; color: var(--primary);">NAV</div>
                <button class="dpad-btn" onclick="level2.moveRover(1, 0)">►</button>
                <div></div>
                <button class="dpad-btn" onclick="level2.moveRover(0, 1)">▼</button>
                <div></div>
              </div>

              <div style="display: flex; gap: 10px;">
                <button class="btn-secondary" onclick="level2.scanArea()">RADAR SCAN 📡</button>
                <button id="proceed-decide-btn" class="btn-primary btn-disabled" onclick="level2.triggerDecisionEvent()">SURPRISE CRISIS EVENT ⚡</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    eli.speak(
      "Drive your Lunar Rover to explore the grid map! Look for 💧 Water Ice in shadowed craters and 🪨 Regolith Ore samples. Collect 4 samples to complete exploration!",
      null
    );

    this.initRoverGrid();
    this.bindKeyboardControls();
  }

  initRoverGrid() {
    this.rover.x = 0;
    this.rover.y = 0;
    this.rover.visited = Array(8).fill(null).map(() => Array(8).fill(false));
    this.rover.visited[0][0] = true;

    // Random items on grid
    this.rover.items = [
      { x: 2, y: 1, type: 'ice', label: '💧 Shadowed Water Ice', collected: false },
      { x: 5, y: 3, type: 'regolith', label: '🪨 Titanium Regolith', collected: false },
      { x: 1, y: 6, type: 'probe', label: '🛰️ Survey Satellite Debris', collected: false },
      { x: 6, y: 6, type: 'he3', label: '⚛ Helium-3 Isotope Deposit', collected: false }
    ];

    const canvas = document.getElementById('rover-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    this.drawRoverMap(ctx, canvas);
  }

  bindKeyboardControls() {
    window.onkeydown = (e) => {
      if (this.phase !== 'manage') return;
      if (['ArrowUp', 'KeyW'].includes(e.code)) this.moveRover(0, -1);
      if (['ArrowDown', 'KeyS'].includes(e.code)) this.moveRover(0, 1);
      if (['ArrowLeft', 'KeyA'].includes(e.code)) this.moveRover(-1, 0);
      if (['ArrowRight', 'KeyD'].includes(e.code)) this.moveRover(1, 0);
    };
  }

  moveRover(dx, dy) {
    const newX = Math.max(0, Math.min(7, this.rover.x + dx));
    const newY = Math.max(0, Math.min(7, this.rover.y + dy));

    if (newX === this.rover.x && newY === this.rover.y) return;

    this.rover.x = newX;
    this.rover.y = newY;
    this.rover.visited[newY][newX] = true;

    soundManager.playClick();

    // Check item collection
    this.rover.items.forEach(item => {
      if (item.x === newX && item.y === newY && !item.collected) {
        item.collected = true;
        this.rover.samplesCollected++;
        soundManager.playSuccess();
        this.game.addScore(200);

        document.getElementById('sample-count-hud').innerText = this.rover.samplesCollected;
        alert(`Discovered & Sampled: ${item.label}! (+200 Science Points)`);

        if (this.rover.samplesCollected >= 4) {
          const btn = document.getElementById('proceed-decide-btn');
          if (btn) {
            btn.classList.remove('btn-disabled');
            btn.style.boxShadow = '0 0 15px #00ff9d';
          }
          eli.speak("FANTASTIC WORK! All 4 lunar resource samples collected! Outpost exploration goals achieved!", null);
        }
      }
    });

    const canvas = document.getElementById('rover-canvas');
    if (canvas) {
      this.drawRoverMap(canvas.getContext('2d'), canvas);
    }
  }

  scanArea() {
    soundManager.playScanPing();
    alert("Radar Scan Active! Uncollected resource positions revealed on grid radar.");
    // Reveal all items on map
    this.rover.items.forEach(item => {
      if (!item.collected) {
        this.rover.visited[item.y][item.x] = true;
      }
    });
    const canvas = document.getElementById('rover-canvas');
    if (canvas) {
      this.drawRoverMap(canvas.getContext('2d'), canvas);
    }
  }

  drawRoverMap(ctx, canvas) {
    const w = canvas.width;
    const h = canvas.height;
    const cellSize = h / 8;

    // Dark lunar dust background
    ctx.fillStyle = '#0f1118';
    ctx.fillRect(0, 0, w, h);

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const px = x * cellSize + 20;
        const py = y * cellSize;

        if (this.rover.visited[y][x]) {
          // Explored crater grid
          ctx.fillStyle = (x + y) % 2 === 0 ? '#181f33' : '#141a2b';
          ctx.fillRect(px, py, cellSize, cellSize);

          // Grid lines
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
          ctx.strokeRect(px, py, cellSize, cellSize);

          // Draw item if present
          const item = this.rover.items.find(i => i.x === x && i.y === y);
          if (item) {
            ctx.font = '20px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(item.collected ? '✅' : item.type === 'ice' ? '💧' : item.type === 'regolith' ? '🪨' : item.type === 'probe' ? '🛰️' : '⚛', px + cellSize / 2, py + cellSize / 2);
          }
        } else {
          // Fog of war
          ctx.fillStyle = '#06070a';
          ctx.fillRect(px, py, cellSize, cellSize);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
          ctx.strokeRect(px, py, cellSize, cellSize);
        }
      }
    }

    // Draw Outpost Base at 0,0
    ctx.fillStyle = '#00f0ff';
    ctx.font = '16px Orbitron';
    ctx.fillText('🏛️ BASE', 20 + cellSize / 2, cellSize / 2);

    // Draw Rover
    const rx = this.rover.x * cellSize + 20 + cellSize / 2;
    const ry = this.rover.y * cellSize + cellSize / 2;

    ctx.fillStyle = '#00ff9d';
    ctx.beginPath();
    ctx.arc(rx, ry, cellSize * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#000';
    ctx.font = '12px Orbitron';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏎️', rx, ry);
  }

  tickDay() {
    soundManager.playClick();
    this.resources.oxygen = Math.max(0, this.resources.oxygen - 5);
    this.resources.water = Math.max(0, this.resources.water - 8);
    this.resources.power = Math.max(0, this.resources.power - 6);
    this.resources.morale = Math.max(0, this.resources.morale - 2);

    document.getElementById('res-o2').innerText = `${this.resources.oxygen}%`;
    document.getElementById('res-water').innerText = `${this.resources.water} L`;
    document.getElementById('res-power').innerText = `${this.resources.power} kW`;
    document.getElementById('res-morale').innerText = `${this.resources.morale}%`;

    document.getElementById('bar-o2').style.width = `${this.resources.oxygen}%`;
    document.getElementById('bar-water').style.width = `${this.resources.water}%`;
    document.getElementById('bar-power').style.width = `${this.resources.power}%`;
    document.getElementById('bar-morale').style.width = `${this.resources.morale}%`;

    this.game.addScore(50);
  }

  triggerDecisionEvent() {
    this.phase = 'decide';
    this.game.setActiveStep(5); // Step 6: DECIDE

    soundManager.playAlarm();

    const container = document.getElementById('viewport-content');
    container.innerHTML = `
      <div class="level-container fade-in">
        <div class="level-header">
          <div>
            <h2>LEVEL 2 // EMERGENCY DECISION EVENT</h2>
            <div class="level-subtitle">PHASE 4: DECIDE & SURVIVE SOLAR STORM WARNING</div>
          </div>
          <span class="badge-tag" style="background: rgba(255,42,109,0.2); color: var(--danger); border-color: var(--danger);">HIGH PRIORITY ALERT</span>
        </div>

        <div class="event-card">
          <div class="event-title">⚡ UNPREDICTED SOLAR CORONAL MASS EJECTION (CME)</div>
          <p class="event-desc">
            Deep space monitors detect an incoming high-energy solar radiation storm heading directly toward Shackleton Crater! 
            Harmful gamma radiation will hit the outpost in 15 minutes. How do you respond, Cadet?
          </p>

          <div class="event-choices">
            <button class="choice-btn" onclick="level2.handleChoice(1)">
              <strong>OPTION A: Shelter Crew in Underground Lava Tube Vault</strong><br>
              <span style="font-size: 0.8rem; color: #a0c0e0;">Safe: Guarantees 100% crew health & morale, but consumes 20 L emergency water for radiation shielding.</span>
            </button>

            <button class="choice-btn" onclick="level2.handleChoice(2)">
              <strong>OPTION B: Overclock Solar Array to Charge Backup Capacitors</strong><br>
              <span style="font-size: 0.8rem; color: #a0c0e0;">Risky: Stores +150 kW power for Level 3 fuel synthesis, but causes minor hull radiation stress.</span>
            </button>
          </div>
        </div>
      </div>
    `;

    eli.speak(
      "ALERT, CADET! Solar flares release streams of charged protons that can penetrate thin lunar walls! Make a wise command decision for your outpost and crew!",
      null
    );

    eli.showScienceTip(
      "SOLAR RADIATION & SPACE WEATHER",
      "Because the Moon has no thick atmosphere or magnetic field like Earth, astronauts on the surface are exposed to Cosmic Rays and Solar Particle Events (SPEs)."
    );
  }

  handleChoice(optionNum) {
    soundManager.playClick();
    soundManager.playSuccess();

    if (optionNum === 1) {
      this.game.addScore(250);
      alert("Option A Selected: Crew safely sheltered in underground lava tube vault! Zero health loss.");
    } else {
      this.game.addScore(300);
      this.resources.power += 150;
      alert("Option B Selected: Solar panels overclocked! Gained +150 kW power reserves for Level 3 rocket fuel synthesis!");
    }

    this.game.nextLevel(); // Advances to Level 3 (Survive & Return)
  }
}
