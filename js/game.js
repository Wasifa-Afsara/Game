/* ==========================================================================
   GAME ENGINE & CORE CONTROLLER
   ========================================================================== */

class GameManager {
  constructor() {
    this.state = {
      cadetName: 'Cadet Nova',
      score: 0,
      currentLevel: 1
    };

    this.level1 = null;
    this.level2 = null;
    this.level3 = null;
  }

  init() {
    console.log("Initializing Lunar Cadet Space Survival Game...");
    eli.init();
    this.initBackgroundCanvas();

    this.level1 = new Level1(this);
    this.level2 = new Level2(this);
    this.level3 = new Level3(this);

    this.startLevel(1);
  }

  addScore(pts) {
    this.state.score += pts;
    const scoreEl = document.getElementById('score-val');
    if (scoreEl) {
      scoreEl.innerText = this.state.score;
      scoreEl.style.textShadow = '0 0 10px #00ff9d';
      setTimeout(() => scoreEl.style.textShadow = 'none', 600);
    }
  }

  setActiveStep(stepIndex) {
    const steps = document.querySelectorAll('.step-item');
    const dividers = document.querySelectorAll('.step-divider');

    steps.forEach((el, idx) => {
      if (idx === stepIndex) {
        el.className = 'step-item active';
      } else if (idx < stepIndex) {
        el.className = 'step-item completed';
      } else {
        el.className = 'step-item';
      }
    });

    dividers.forEach((el, idx) => {
      if (idx < stepIndex) {
        el.className = 'step-divider active';
      } else {
        el.className = 'step-divider';
      }
    });
  }

  startLevel(lvlNum) {
    this.state.currentLevel = lvlNum;
    const badgeEl = document.getElementById('level-badge');
    if (badgeEl) badgeEl.innerText = `LEVEL ${lvlNum}`;

    if (lvlNum === 1) {
      this.level1.init();
    } else if (lvlNum === 2) {
      this.level2.init();
    } else if (lvlNum === 3) {
      this.level3.init();
    }
  }

  nextLevel() {
    if (this.state.currentLevel < 3) {
      this.startLevel(this.state.currentLevel + 1);
    }
  }

  toggleSound() {
    const muted = soundManager.toggleMute();
    const btn = document.getElementById('sound-toggle-btn');
    if (btn) {
      btn.innerText = muted ? '🔇' : '🔊';
    }
  }

  initBackgroundCanvas() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.onresize = resize;
    resize();

    // Create star particles
    const stars = Array(120).fill(null).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      alpha: Math.random(),
      speed: Math.random() * 0.02 + 0.005
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.forEach(star => {
        star.alpha += star.speed;
        if (star.alpha > 1 || star.alpha < 0) {
          star.speed = -star.speed;
        }

        ctx.fillStyle = `rgba(226, 241, 255, ${Math.abs(star.alpha)})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(render);
    };

    render();
  }
}

// Global game instance
let game = null;
window.onload = () => {
  game = new GameManager();
  game.init();
};
