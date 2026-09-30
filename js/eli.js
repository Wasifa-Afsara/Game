/* ==========================================================================
   ELI MISSION CONTROL AI & DIALOGUE SYSTEM
   ========================================================================== */

class EliManager {
  constructor() {
    this.dialogContainer = null;
    this.typingTimer = null;
    this.isTyping = false;
    this.currentText = '';
  }

  init() {
    this.dialogContainer = document.getElementById('eli-dialog-text');
  }

  speak(text, onComplete = null, options = null) {
    if (!this.dialogContainer) this.init();
    if (!this.dialogContainer) return;

    if (this.typingTimer) {
      clearInterval(this.typingTimer);
    }

    this.isTyping = true;
    this.dialogContainer.innerHTML = '';
    let i = 0;

    // Process text HTML formatting if present
    const formattedText = text;

    this.typingTimer = setInterval(() => {
      if (i < formattedText.length) {
        // Handle HTML tags quickly
        if (formattedText[i] === '<') {
          const closingIndex = formattedText.indexOf('>', i);
          if (closingIndex !== -1) {
            this.dialogContainer.innerHTML += formattedText.substring(i, closingIndex + 1);
            i = closingIndex + 1;
            return;
          }
        }

        this.dialogContainer.innerHTML += formattedText[i];
        if (i % 3 === 0) {
          soundManager.playEliBlip();
        }
        i++;
      } else {
        clearInterval(this.typingTimer);
        this.isTyping = false;

        if (options && Array.isArray(options)) {
          this.renderOptions(options);
        }

        if (onComplete) onComplete();
      }
    }, 25);
  }

  renderOptions(options) {
    const optsContainer = document.getElementById('eli-options-container');
    if (!optsContainer) return;
    optsContainer.innerHTML = '';

    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'btn-secondary';
      btn.style.width = '100%';
      btn.style.marginTop = '6px';
      btn.style.textAlign = 'left';
      btn.innerText = opt.label;
      btn.onclick = () => {
        soundManager.playClick();
        optsContainer.innerHTML = '';
        if (opt.action) opt.action();
      };
      optsContainer.appendChild(btn);
    });
  }

  showScienceTip(title, text) {
    const logHeader = document.getElementById('science-log-title');
    const logContent = document.getElementById('science-log-body');
    if (logHeader && logContent) {
      logHeader.innerText = `[DATA LOG] ${title}`;
      logContent.innerHTML = text;
    }
  }
}

const eli = new EliManager();
