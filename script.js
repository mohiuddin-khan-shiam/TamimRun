/**
 * ============================================================================
 * TAMIM RUN: Shoe Escape! (তামিম ও জুতোর তাড়া)
 * Complete 2D Arcade Web Game Engine
 * ============================================================================
 */

(function () {
  'use strict';

  // --- AUDIO SYNTHESIZER (Pure Web Audio API - Zero External Dependencies) ---
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.muted = false;
      this.bgmPlaying = false;
      this.bgmTimer = null;
      this.bgmStep = 0;
      this.init();
    }

    init() {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }

    resume() {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggleMute() {
      this.muted = !this.muted;
      if (this.muted) {
        this.stopBGM();
      } else {
        this.startBGM();
      }
      return this.muted;
    }

    // Helper to generate quick synth tones with envelopes
    playTone(freq, type, duration, startVol = 0.25, endVol = 0.001, slideFreq = null) {
      if (this.muted || !this.ctx) return;
      this.resume();
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;

        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);
        if (slideFreq) {
          osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideFreq), now + duration);
        }

        gain.gain.setValueAtTime(startVol, now);
        gain.gain.exponentialRampToValueAtTime(endVol, now + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + duration);
      } catch (e) {
        // Audio error silently ignored
      }
    }

    playJump() {
      // Springy comic boing
      this.playTone(160, 'triangle', 0.2, 0.3, 0.01, 460);
    }

    playSlide() {
      // Friction swoosh
      if (this.muted || !this.ctx) return;
      this.resume();
      try {
        const bufferSize = this.ctx.sampleRate * 0.18;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 800;
        filter.Q.value = 2;

        const gain = this.ctx.createGain();
        gain.gain.value = 0.22;

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start();
      } catch (e) {}
    }

    playShoeThrow() {
      // High-speed comic spin/whistle
      this.playTone(700, 'sine', 0.22, 0.25, 0.01, 1400);
    }

    playHit() {
      // Comic slap / heavy punch
      this.playTone(280, 'sawtooth', 0.2, 0.4, 0.01, 40);
      this.playTone(120, 'square', 0.25, 0.45, 0.01, 30);
    }

    playCoin() {
      // Crisp ding
      this.playTone(987.77, 'sine', 0.08, 0.2, 0.01); // B5
      setTimeout(() => {
        this.playTone(1318.51, 'sine', 0.12, 0.25, 0.01); // E6
      }, 70);
    }

    playPowerup() {
      // Biryani fanfare
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playTone(freq, 'triangle', 0.15, 0.3, 0.01);
        }, idx * 75);
      });
    }

    playShieldDeflect() {
      // Metallic clang
      this.playTone(880, 'square', 0.12, 0.3, 0.01, 220);
      this.playTone(1760, 'sine', 0.2, 0.35, 0.01, 440);
    }

    playSpeedBoost() {
      // 5G Turbo sweep
      this.playTone(300, 'sawtooth', 0.35, 0.3, 0.01, 1200);
    }

    playCatMeow() {
      // Cute comic meow!
      this.playTone(550, 'sine', 0.25, 0.25, 0.01, 880);
      setTimeout(() => {
        this.playTone(880, 'sine', 0.2, 0.2, 0.01, 620);
      }, 150);
    }

    playGameOver() {
      // Sad comic trombone descent
      const notes = [370, 349, 330, 260];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playTone(freq, 'sawtooth', 0.3, 0.35, 0.01, freq * 0.92);
        }, idx * 240);
      });
    }

    startBGM() {
      if (this.muted || this.bgmPlaying || !this.ctx) return;
      this.resume();
      this.bgmPlaying = true;
      this.bgmStep = 0;

      // Upbeat Bengali arcade folk-pop bassline & melody
      // Scale: D-Bhairavi / folk minor: D, F, G, A, Bb, C, D
      const bassNotes = [146.83, 146.83, 174.61, 146.83, 196.00, 174.61, 130.81, 146.83];
      const melodyNotes = [
        293.66, 349.23, 392.00, 440.00, 392.00, 349.23, 329.63, 293.66,
        349.23, 392.00, 440.00, 523.25, 440.00, 392.00, 349.23, 293.66
      ];

      const tempoInterval = 140; // ~107 BPM 16th note groove

      this.bgmTimer = setInterval(() => {
        if (!this.bgmPlaying || this.muted) return;
        const bNote = bassNotes[this.bgmStep % bassNotes.length];
        const mNote = melodyNotes[this.bgmStep % melodyNotes.length];

        // Soft bouncy bass
        this.playTone(bNote, 'triangle', 0.1, 0.12, 0.01);

        // Chiptune lead every 2 steps
        if (this.bgmStep % 2 === 0) {
          this.playTone(mNote, 'square', 0.09, 0.06, 0.01);
        }

        // Percussive hi-hat click
        if (this.bgmStep % 2 === 1) {
          this.playTone(1800, 'sine', 0.03, 0.04, 0.001);
        }

        this.bgmStep = (this.bgmStep + 1) % 32;
      }, tempoInterval);
    }

    stopBGM() {
      this.bgmPlaying = false;
      if (this.bgmTimer) {
        clearInterval(this.bgmTimer);
        this.bgmTimer = null;
      }
    }
  }

  // --- FLOATING COMIC TEXT & PARTICLES ---
  class Particle {
    constructor(x, y, vx, vy, color, radius, life, shape = 'circle') {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.color = color;
      this.radius = radius;
      this.maxLife = life;
      this.life = life;
      this.shape = shape;
      this.angle = Math.random() * Math.PI * 2;
      this.vAngle = (Math.random() - 0.5) * 0.2;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.2; // slight gravity
      this.angle += this.vAngle;
      this.life--;
    }

    draw(ctx) {
      const alpha = Math.max(0, this.life / this.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.fillStyle = this.color;

      if (this.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.shape === 'star') {
        this.drawStar(ctx, 0, 0, 4, this.radius, this.radius * 0.4);
      } else if (this.shape === 'rect') {
        ctx.fillRect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);
      }
      ctx.restore();
    }

    drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
      ctx.fill();
    }
  }

  class ComicText {
    constructor(text, x, y, color = '#ffde59', stroke = '#000', fontSize = 24) {
      this.text = text;
      this.x = x;
      this.y = y;
      this.vy = -2.2;
      this.color = color;
      this.stroke = stroke;
      this.fontSize = fontSize;
      this.life = 50;
      this.maxLife = 50;
      this.scale = 0.5;
    }

    update() {
      this.y += this.vy;
      this.vy *= 0.94;
      this.life--;
      if (this.scale < 1.1) {
        this.scale += 0.08;
      }
    }

    draw(ctx) {
      const alpha = Math.max(0, this.life / this.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(this.x, this.y);
      ctx.scale(this.scale, this.scale);

      ctx.font = `bold ${this.fontSize}px 'Hind Siliguri', 'Fredoka', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.lineWidth = 5;
      ctx.strokeStyle = this.stroke;
      ctx.strokeText(this.text, 0, 0);

      ctx.fillStyle = this.color;
      ctx.fillText(this.text, 0, 0);

      ctx.restore();
    }
  }

  // --- AMMU SPEECH QUOTES (Bengali Comic Humor) ---
  const AMMU_QUOTES = [
    "পড়ালেখা বাদ দিয়ে গেম খেলোস?!",
    "আজকে তোর একদিন কি আমার একদিন!",
    "দাঁড়া তুই! বাপে আসুক!",
    "সব দোষ ওই মোবাইলের!",
    "ভাত খাবি না? বাতাস খা!",
    "জুতো ছুড়ে মারলে আর রক্ষা নাই!",
    "বিসিএস দিয়ে তো আমার উদ্ধার করবি!",
    "তোর ফেসবুকে আগুন লাগামু আমি!",
    "সারাদিন টিকটক আর রিলস দেখা!",
    "পায়ের স্যান্ডেলটা আজকে তোর পিঠে ভাঙমু!"
  ];

  // --- GAME OVER ROAST QUOTES ---
  const ROAST_QUOTES = [
    "আম্মুর জুতোর নিশানা ১০০% নির্ভুল! আপনি মাত্র {dist} মিটার পালাতে পেরেছেন!",
    "পড়ালেখা না করে গেম খেলার শাস্তি সাথে সাথে কার্যকর! আম্মু উইনস!",
    "বিসিএস ক্যাডার না হওয়া পর্যন্ত আম্মু থামবে না! রেজাল্ট: জুতোর বাড়ি!",
    "ওয়াইফাই এর তার আম্মু কেটে দিয়েছে! এখন পড়তে বসেন!",
    "কাচ্চি বিরিয়ানি খেয়ে শক্তি বাড়িয়েও আম্মুর উড়ন্ত জুতো থেকে বাঁচতে পারলেন না!",
    "ফেসবুক মেম দেখে লাভ নেই, এবার গিয়ে ঘরের বাসন মাজেন!"
  ];

  // ============================================================================
  // MAIN GAME CLASS
  // ============================================================================
  class TamimGame {
    constructor() {
      this.canvas = document.getElementById('gameCanvas');
      this.ctx = this.canvas.getContext('2d');
      this.sound = new SoundEngine();

      // Logical Resolution
      this.width = 960;
      this.height = 540;
      this.groundY = 410;

      // State Management
      this.state = 'START'; // 'START' | 'PLAYING' | 'PAUSED' | 'GAMEOVER'
      this.score = 0;
      this.distance = 0;
      this.coins = 0;
      this.lives = 3;
      this.maxLives = 3;
      this.highScore = parseInt(localStorage.getItem('tamim_high_score') || '0', 10);

      // Speed & Level Progression
      this.baseSpeed = 7.0;
      this.currentSpeed = this.baseSpeed;
      this.maxSpeed = 16.0;
      this.speedBoostTimer = 0;

      // Shield System
      this.shieldTimer = 0;
      this.shieldInventory = 1; // 1 free shield on start

      // Ammu Proximity System
      this.ammuProximity = 0.75; // 1.0 = safe distance (far), 0.0 = caught
      this.ammuQuote = "";
      this.ammuQuoteTimer = 0;
      this.shoeThrowCooldown = 180;
      this.shoeWindupTimer = 0;

      // Screen Shake
      this.shakeAmount = 0;

      // Entities
      this.tamim = null;
      this.ammu = null;
      this.obstacles = [];
      this.collectibles = [];
      this.particles = [];
      this.comicTexts = [];

      // Selected Skin
      this.selectedSkin = 'lungi'; // 'lungi' | 'school' | 'gamer'

      // Parallax Offsets
      this.bgOffsetFar = 0;
      this.bgOffsetMid = 0;
      this.bgOffsetNear = 0;
      this.bgOffsetFloor = 0;
      this.zone = 1; // 1: Bedroom/Living, 2: Kitchen, 3: Balcony, 4: Street

      // UI Elements
      this.initDOMElements();
      this.initEvents();
      this.resetGame();

      // Animation Loop
      this.lastTime = performance.now();
      requestAnimationFrame(this.gameLoop.bind(this));
    }

    initDOMElements() {
      // Screens
      this.startScreen = document.getElementById('start-screen');
      this.pauseScreen = document.getElementById('pause-screen');
      this.gameOverScreen = document.getElementById('game-over-screen');
      this.hud = document.getElementById('hud');

      // HUD Fields
      this.distanceVal = document.getElementById('distance-val');
      this.coinVal = document.getElementById('coin-val');
      this.ammuDistanceText = document.getElementById('ammu-distance-text');
      this.ammuBarFill = document.getElementById('ammu-bar-fill');
      this.ammuAvatarPin = document.getElementById('ammu-avatar-pin');
      this.hpIcons = [
        document.getElementById('hp-1'),
        document.getElementById('hp-2'),
        document.getElementById('hp-3')
      ];

      // Buffs
      this.buffShield = document.getElementById('buff-shield');
      this.shieldTimerFill = document.getElementById('shield-timer-fill');
      this.buffWifi = document.getElementById('buff-wifi');
      this.wifiTimerFill = document.getElementById('wifi-timer-fill');
      this.shieldCountBadge = document.getElementById('shield-count-badge');

      // Buttons
      this.btnStart = document.getElementById('btn-start');
      this.btnPause = document.getElementById('btn-pause');
      this.btnResume = document.getElementById('btn-resume');
      this.btnRestartPause = document.getElementById('btn-restart-pause');
      this.btnRestart = document.getElementById('btn-restart');
      this.btnShare = document.getElementById('btn-share');
      this.btnSoundToggle = document.getElementById('btn-sound-toggle');

      // Mobile Touch Buttons
      this.touchJump = document.getElementById('touch-jump');
      this.touchSlide = document.getElementById('touch-slide');
      this.touchShield = document.getElementById('touch-shield');

      // Game Over stats
      this.finalDistance = document.getElementById('final-distance');
      this.finalCoins = document.getElementById('final-coins');
      this.gameoverHighScore = document.getElementById('gameover-high-score');
      this.startHighScore = document.getElementById('start-high-score');
      this.roastText = document.getElementById('roast-text');
      this.newRecordBadge = document.getElementById('new-record-badge');
      this.toast = document.getElementById('toast');

      // Set initial high score display
      if (this.startHighScore) this.startHighScore.textContent = this.highScore;
    }

    initEvents() {
      // Start Game Button
      this.btnStart.addEventListener('click', () => {
        this.sound.resume();
        this.sound.startBGM();
        this.startGame();
      });

      // Pause Buttons
      this.btnPause.addEventListener('click', () => this.togglePause());
      this.btnResume.addEventListener('click', () => this.togglePause());
      this.btnRestartPause.addEventListener('click', () => {
        this.togglePause();
        this.startGame();
      });

      // Game Over Replay
      this.btnRestart.addEventListener('click', () => {
        this.sound.resume();
        this.sound.startBGM();
        this.startGame();
      });

      // Share Button
      this.btnShare.addEventListener('click', () => this.shareScore());

      // Sound Toggle
      this.btnSoundToggle.addEventListener('click', () => {
        const isMuted = this.sound.toggleMute();
        this.btnSoundToggle.textContent = isMuted ? '🔇' : '🔊';
        this.showToast(isMuted ? 'শব্দ বন্ধ করা হয়েছে' : 'শব্দ চালু হয়েছে!');
      });

      // Skin Selector
      const skinCards = document.querySelectorAll('.skin-card');
      skinCards.forEach(card => {
        card.addEventListener('click', (e) => {
          skinCards.forEach(c => c.classList.remove('active'));
          const current = e.currentTarget;
          current.classList.add('active');
          this.selectedSkin = current.getAttribute('data-skin');
          if (this.tamim) this.tamim.skin = this.selectedSkin;
          this.sound.playCoin();
        });
      });

      // Desktop Keyboard Events
      window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
          e.preventDefault();
          if (this.state === 'START') {
            this.btnStart.click();
          } else if (this.state === 'GAMEOVER') {
            this.btnRestart.click();
          } else if (this.state === 'PLAYING') {
            this.actionJump();
          }
        } else if (e.code === 'ArrowDown' || e.code === 'KeyC' || e.code === 'KeyZ') {
          e.preventDefault();
          if (this.state === 'PLAYING') {
            this.actionSlide();
          }
        } else if (e.code === 'KeyS' || e.code === 'KeyE' || e.code === 'KeyX' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
          e.preventDefault();
          if (this.state === 'PLAYING') {
            this.actionShield();
          }
        } else if (e.code === 'KeyP' || e.code === 'Escape') {
          e.preventDefault();
          if (this.state === 'PLAYING' || this.state === 'PAUSED') {
            this.togglePause();
          }
        }
      });

      // Touch Controls (Mobile buttons)
      const bindTouch = (btn, action) => {
        if (!btn) return;
        const trigger = (e) => {
          e.preventDefault();
          this.sound.resume();
          action();
        };
        btn.addEventListener('touchstart', trigger, { passive: false });
        btn.addEventListener('mousedown', trigger);
      };

      bindTouch(this.touchJump, () => this.actionJump());
      bindTouch(this.touchSlide, () => this.actionSlide());
      bindTouch(this.touchShield, () => this.actionShield());

      // Canvas Touch Swipe Gestures
      let touchStartY = null;
      let touchStartX = null;
      this.canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) {
          touchStartY = e.touches[0].clientY;
          touchStartX = e.touches[0].clientX;
        }
      }, { passive: true });

      this.canvas.addEventListener('touchend', (e) => {
        if (touchStartY === null || this.state !== 'PLAYING') return;
        const touchEndY = e.changedTouches[0].clientY;
        const touchEndX = e.changedTouches[0].clientX;
        const diffY = touchEndY - touchStartY;
        const diffX = touchEndX - touchStartX;

        if (Math.abs(diffY) > 30 && Math.abs(diffY) > Math.abs(diffX)) {
          if (diffY < 0) {
            this.actionJump(); // Swiped UP
          } else {
            this.actionSlide(); // Swiped DOWN
          }
        }
        touchStartY = null;
        touchStartX = null;
      }, { passive: true });
    }

    actionJump() {
      if (this.tamim && this.tamim.canJump()) {
        this.tamim.jump();
        this.sound.playJump();
        this.createJumpParticles(this.tamim.x + 30, this.tamim.y + 60);
      }
    }

    actionSlide() {
      if (this.tamim && this.tamim.canSlide()) {
        this.tamim.slide();
        this.sound.playSlide();
        this.createSlideParticles(this.tamim.x, this.tamim.y + 50);
      }
    }

    actionShield() {
      if (this.shieldInventory > 0 && this.shieldTimer <= 0) {
        this.shieldInventory--;
        this.shieldTimer = 300; // 5 seconds at 60 FPS
        this.sound.playShieldDeflect();
        this.addComicText("ভাতের ঢাকনা শিল্ড অন!", this.tamim.x + 40, this.tamim.y - 30, '#00f2fe');
        this.updateHUDShield();
      } else if (this.shieldTimer > 0) {
        this.addComicText("শিল্ড ইতিমধ্যে চালু আছে!", this.tamim.x + 40, this.tamim.y - 30, '#ffde59');
      } else {
        this.addComicText("আর শিল্ড নেই! বিরিয়ানি বা ঢাকনা কুড়াও!", this.tamim.x + 40, this.tamim.y - 30, '#ff4d6d');
      }
    }

    togglePause() {
      if (this.state === 'PLAYING') {
        this.state = 'PAUSED';
        this.pauseScreen.classList.remove('hidden');
      } else if (this.state === 'PAUSED') {
        this.state = 'PLAYING';
        this.pauseScreen.classList.add('hidden');
        this.lastTime = performance.now();
      }
    }

    startGame() {
      this.resetGame();
      this.state = 'PLAYING';
      this.startScreen.classList.add('hidden');
      this.pauseScreen.classList.add('hidden');
      this.gameOverScreen.classList.add('hidden');
      this.hud.classList.remove('hidden');
      this.addComicText("ভাগোওওও! আম্মু আসছে!", 480, 200, '#ffde59', '#000', 32);
    }

    resetGame() {
      this.score = 0;
      this.distance = 0;
      this.coins = 0;
      this.lives = this.maxLives;
      this.currentSpeed = this.baseSpeed;
      this.speedBoostTimer = 0;
      this.shieldTimer = 0;
      this.shieldInventory = 1;
      this.ammuProximity = 0.75; // Comfortable distance
      this.shoeThrowCooldown = 140;
      this.shoeWindupTimer = 0;
      this.shakeAmount = 0;
      this.zone = 1;
      this.lastMilestone = 0;

      this.obstacles = [];
      this.collectibles = [];
      this.particles = [];
      this.comicTexts = [];

      // Create Protagonist
      this.tamim = {
        x: 270,
        y: this.groundY - 70,
        w: 52,
        h: 70,
        vy: 0,
        isGrounded: true,
        isSliding: false,
        slideTime: 0,
        skin: this.selectedSkin,
        hitCooldown: 0,
        runFrame: 0,
        canJump: function () {
          return this.isGrounded && !this.isSliding;
        },
        jump: function () {
          this.vy = -16.0;
          this.isGrounded = false;
        },
        canSlide: function () {
          return this.isGrounded && !this.isSliding;
        },
        slide: function () {
          this.isSliding = true;
          this.slideTime = 32; // ~0.55s
          this.h = 36;
          this.y += 34;
        }
      };

      // Create Antagonist (Mom - Hasina)
      this.ammu = {
        x: 60,
        y: this.groundY - 74,
        w: 60,
        h: 74,
        runFrame: 0,
        armAngle: 0,
        isThrowing: false
      };

      this.updateHUD();
      this.updateHUDLives();
      this.updateHUDShield();
    }

    // ============================================================================
    // MAIN UPDATE LOOP
    // ============================================================================
    update() {
      if (this.state !== 'PLAYING') return;

      // Handle Distance & Speed Scaling
      this.distance += Math.round(this.currentSpeed * 0.1);
      this.score = this.distance * 2 + this.coins * 15;

      // Milestone Celebrations (Every 250 meters)
      const currentMilestone = Math.floor(this.distance / 250) * 250;
      if (currentMilestone > 0 && currentMilestone > this.lastMilestone) {
        this.lastMilestone = currentMilestone;
        this.sound.playPowerup();
        this.addComicText(`${currentMilestone} মিটার পার! শাবাশ তামিম! 🎉`, 480, 160, '#ffde59', '#000', 28);
        this.createConfetti();
      }

      // Dynamic Zone Progression
      if (this.distance < 400) {
        this.zone = 1; // Living Room & Bedroom
      } else if (this.distance < 850) {
        this.zone = 2; // Dining Room & Kitchen
      } else if (this.distance < 1400) {
        this.zone = 3; // Balcony & Rooftop
      } else {
        this.zone = 4; // Dhaka Street & Alleyway
      }

      // Speed boost handling (Wi-Fi router power-up)
      if (this.speedBoostTimer > 0) {
        this.speedBoostTimer--;
        this.currentSpeed = this.baseSpeed * 1.6;
        this.ammuProximity = Math.min(1.0, this.ammuProximity + 0.003); // Ammu falls behind!
        if (Math.random() < 0.4) {
          this.createSpeedLine();
        }
      } else {
        // Natural speed progression based on distance
        this.currentSpeed = Math.min(this.maxSpeed, this.baseSpeed + (this.distance / 250));
      }

      // Parallax Background Offsets
      this.bgOffsetFar = (this.bgOffsetFar + this.currentSpeed * 0.15) % this.width;
      this.bgOffsetMid = (this.bgOffsetMid + this.currentSpeed * 0.5) % this.width;
      this.bgOffsetNear = (this.bgOffsetNear + this.currentSpeed * 0.85) % this.width;
      this.bgOffsetFloor = (this.bgOffsetFloor + this.currentSpeed) % this.width;

      // Update Shield Timer
      if (this.shieldTimer > 0) {
        this.shieldTimer--;
        this.updateHUDShield();
      }

      // Screen Shake Decay
      if (this.shakeAmount > 0) {
        this.shakeAmount *= 0.88;
        if (this.shakeAmount < 0.2) this.shakeAmount = 0;
      }

      // Update Protagonist: Tamim
      this.updateTamim();

      // Update Antagonist: Mom (Hasina)
      this.updateAmmu();

      // Spawn & Update Obstacles and Collectibles
      this.updateObstacles();
      this.updateCollectibles();

      // Particles & Floating Comic Texts
      this.updateParticles();
      this.updateComicTexts();

      // Update HUD values
      this.updateHUD();

      // Check Game Over by Ammu proximity
      if (this.ammuProximity <= 0.05) {
        this.triggerGameOver("আম্মু ধরে ফেলেছে! জুতোর বাড়ি অবধারিত!");
      }
    }

    updateTamim() {
      const t = this.tamim;

      // Horizontal position adjusts based on Ammu proximity
      t.x = 180 + this.ammuProximity * 120;

      // Vertical Physics
      if (!t.isGrounded) {
        t.vy += 0.82; // gravity
        t.y += t.vy;

        if (t.y >= this.groundY - t.h) {
          t.y = this.groundY - t.h;
          t.vy = 0;
          t.isGrounded = true;
          this.createLandParticles(t.x + t.w / 2, this.groundY);
        }
      }

      // Slide countdown
      if (t.isSliding) {
        t.slideTime--;
        if (Math.random() < 0.6) {
          this.createSlideParticles(t.x, t.y + t.h);
        }
        if (t.slideTime <= 0) {
          t.isSliding = false;
          t.h = 70;
          t.y -= 34;
        }
      }

      // Running animation cycle
      t.runFrame = (t.runFrame + this.currentSpeed * 0.05) % 8;

      // Hit cooldown (immunity flashing)
      if (t.hitCooldown > 0) {
        t.hitCooldown--;
      }

      // Natural recovery of proximity when running clean
      if (this.ammuProximity < 0.85 && t.hitCooldown === 0) {
        this.ammuProximity = Math.min(0.85, this.ammuProximity + 0.00035);
      }
    }

    updateAmmu() {
      const a = this.ammu;
      a.runFrame = (a.runFrame + this.currentSpeed * 0.055) % 8;

      // Position anchored relative to Tamim and proximity meter
      a.x = Math.max(20, this.tamim.x - (100 + (1 - this.ammuProximity) * 80));

      // Comic quote bubble logic
      if (this.ammuQuoteTimer > 0) {
        this.ammuQuoteTimer--;
      } else if (Math.random() < 0.006) {
        this.ammuQuote = AMMU_QUOTES[Math.floor(Math.random() * AMMU_QUOTES.length)];
        this.ammuQuoteTimer = 160;
      }

      // Slipper Launch Cooldown & Windup
      if (this.shoeWindupTimer > 0) {
        this.shoeWindupTimer--;
        a.isThrowing = true;
        a.armAngle = (Math.PI / 3) * Math.sin(this.shoeWindupTimer * 0.2);

        if (this.shoeWindupTimer === 1) {
          this.throwSlipper();
          a.isThrowing = false;
        }
      } else {
        this.shoeThrowCooldown--;
        if (this.shoeThrowCooldown <= 0) {
          this.shoeWindupTimer = 22; // Start windup!
          this.shoeThrowCooldown = Math.max(90, 180 - Math.floor(this.distance / 120));
        }
      }
    }

    throwSlipper() {
      this.sound.playShoeThrow();
      const isHighSlipper = Math.random() < 0.42; // Must duck/slide!
      const isTurbo = this.distance > 500 && Math.random() < 0.25;

      const slipperY = isHighSlipper
        ? this.groundY - 58 // High flying slipper -> duck under!
        : this.groundY - 26; // Low flying slipper -> jump over!

      this.obstacles.push({
        type: 'slipper',
        variant: isTurbo ? 'turbo' : (isHighSlipper ? 'high' : 'low'),
        x: this.ammu.x + 50,
        y: slipperY,
        w: 38,
        h: 22,
        vx: this.currentSpeed + (isTurbo ? 6.5 : 4.0),
        angle: 0,
        spinSpeed: 0.25,
        passed: false
      });

      this.addComicText(isHighSlipper ? "নিচে নামো! (SLIDE!)" : "লাফ দাও! (JUMP!)", this.tamim.x + 20, 180, '#ff3366', '#fff', 20);
    }

    // ============================================================================
    // OBSTACLES & SPAWN LOGIC
    // ============================================================================
    updateObstacles() {
      // Spawn Ground Obstacles periodically
      if (Math.random() < 0.015 && this.canSpawnObstacle()) {
        const types = ['wet_bucket', 'sleeping_cat', 'book_stack', 'banana_peel'];
        const chosen = types[Math.floor(Math.random() * types.length)];
        let w = 40, h = 35;
        if (chosen === 'sleeping_cat') { w = 44; h = 26; }
        if (chosen === 'wet_bucket') { w = 38; h = 38; }
        if (chosen === 'book_stack') { w = 36; h = 42; }
        if (chosen === 'banana_peel') { w = 30; h = 18; }

        this.obstacles.push({
          type: 'ground',
          variant: chosen,
          x: this.width + 50,
          y: this.groundY - h,
          w: w,
          h: h,
          vx: this.currentSpeed,
          interacted: false
        });
      }

      // Update Obstacles position & Collisions
      for (let i = this.obstacles.length - 1; i >= 0; i--) {
        const obs = this.obstacles[i];
        obs.x -= (obs.vx || this.currentSpeed);

        if (obs.type === 'slipper') {
          obs.angle += obs.spinSpeed;
          // Particle trail for slippers
          if (Math.random() < 0.4) {
            this.particles.push(new Particle(
              obs.x + obs.w / 2, obs.y + obs.h / 2,
              -2, (Math.random() - 0.5) * 1.5,
              obs.variant === 'turbo' ? '#ff3366' : '#ffde59',
              3, 14, 'star'
            ));
          }
        }

        // Check Collision with Tamim
        if (this.checkCollision(this.tamim, obs)) {
          this.handleObstacleHit(obs, i);
        }

        // Clean up out of bounds
        if (obs.x < -80) {
          this.obstacles.splice(i, 1);
        }
      }
    }

    canSpawnObstacle() {
      if (this.obstacles.length === 0) return true;
      const lastObs = this.obstacles[this.obstacles.length - 1];
      return (this.width + 50) - lastObs.x > 260;
    }

    checkCollision(t, obs) {
      // Hitbox padding for forgiving arcade feel
      const padX = 8;
      const padY = 6;
      return (
        t.x + padX < obs.x + obs.w - padX &&
        t.x + t.w - padX > obs.x + padX &&
        t.y + padY < obs.y + obs.h - padY &&
        t.y + t.h - padY > obs.y + padY
      );
    }

    handleObstacleHit(obs, index) {
      // If Tamim is currently invincible from a previous hit
      if (this.tamim.hitCooldown > 0) return;

      // Special case: Sleeping cat can be safely jumped over!
      if (obs.variant === 'sleeping_cat' && this.tamim.y + this.tamim.h <= obs.y + 12) {
        if (!obs.interacted) {
          obs.interacted = true;
          this.sound.playCatMeow();
          this.addComicText("মিউ! 🐱❤️", obs.x, obs.y - 20, '#ff914d');
        }
        return;
      }

      // If Shield is active, DEFLECT the obstacle!
      if (this.shieldTimer > 0) {
        this.sound.playShieldDeflect();
        this.createHitSparks(obs.x, obs.y);
        this.addComicText("ঢাকনায় ধাক্কা! রক্ষা! 🛡️", this.tamim.x + 30, this.tamim.y - 20, '#00f2fe');
        this.obstacles.splice(index, 1);
        return;
      }

      // Tamim takes damage!
      this.sound.playHit();
      this.shakeScreen(12);
      this.createHitSparks(this.tamim.x + 25, this.tamim.y + 25);
      this.tamim.hitCooldown = 65; // ~1s immunity flash

      // Knockback on proximity meter
      this.ammuProximity = Math.max(0, this.ammuProximity - 0.28);
      this.lives--;
      this.updateHUDLives();

      const hurtQuotes = ["ইশশশ!", "আম্মু সরি!", "ধুম!", "আউচ!", "বাঁচাওওও!"];
      this.addComicText(hurtQuotes[Math.floor(Math.random() * hurtQuotes.length)], this.tamim.x + 30, this.tamim.y - 25, '#ff3366', '#fff', 26);

      // Remove the hit obstacle
      this.obstacles.splice(index, 1);

      if (this.lives <= 0) {
        this.triggerGameOver("আম্মুর জুতোর আঘাতে তামিম ধরাশায়ী!");
      }
    }

    // ============================================================================
    // COLLECTIBLES & POWER-UPS
    // ============================================================================
    updateCollectibles() {
      // Spawn collectibles
      if (Math.random() < 0.016 && this.canSpawnCollectible()) {
        const rand = Math.random();
        let itemType = 'coin';
        if (rand < 0.12) {
          itemType = 'biryani'; // Health recover
        } else if (rand < 0.24) {
          itemType = 'wifi'; // Speed Boost
        } else if (rand < 0.35) {
          itemType = 'handi'; // Shield
        }

        // Float in arc or ground level
        const isAir = Math.random() < 0.5;
        const itemY = isAir ? this.groundY - 110 : this.groundY - 45;

        this.collectibles.push({
          type: itemType,
          x: this.width + 30,
          y: itemY,
          w: 32,
          h: 32,
          floatOffset: Math.random() * Math.PI * 2
        });
      }

      // Update Collectibles position & Check Pickup
      for (let i = this.collectibles.length - 1; i >= 0; i--) {
        const item = this.collectibles[i];
        item.x -= this.currentSpeed;
        item.floatOffset += 0.08;
        const drawY = item.y + Math.sin(item.floatOffset) * 6;

        // Pickup collision
        if (
          this.tamim.x < item.x + item.w &&
          this.tamim.x + this.tamim.w > item.x &&
          this.tamim.y < drawY + item.h &&
          this.tamim.y + this.tamim.h > drawY
        ) {
          this.handlePickup(item);
          this.collectibles.splice(i, 1);
          continue;
        }

        if (item.x < -50) {
          this.collectibles.splice(i, 1);
        }
      }
    }

    canSpawnCollectible() {
      if (this.collectibles.length === 0) return true;
      const last = this.collectibles[this.collectibles.length - 1];
      return (this.width + 30) - last.x > 180;
    }

    handlePickup(item) {
      if (item.type === 'coin') {
        this.coins++;
        this.sound.playCoin();
        this.addComicText("+১০ 🪙", item.x, item.y, '#ffde59', '#000', 18);
        this.createCoinSparkles(item.x, item.y);
      } else if (item.type === 'biryani') {
        this.sound.playPowerup();
        if (this.lives < this.maxLives) {
          this.lives++;
          this.updateHUDLives();
        }
        this.ammuProximity = Math.min(1.0, this.ammuProximity + 0.15); // Ammu slips back
        this.addComicText("কাচ্চি বিরিয়ানির শক্তি! +১ জীবন 🍛", item.x, item.y - 20, '#00f2fe', '#000', 22);
        this.createBuffParticles(item.x, item.y, '#ff914d');
      } else if (item.type === 'wifi') {
        this.sound.playSpeedBoost();
        this.speedBoostTimer = 240; // 4 seconds of super speed
        this.addComicText("৫জি ওয়াইফাই স্পিড বুস্ট! ⚡", item.x, item.y - 20, '#ffde59', '#000', 24);
        this.createBuffParticles(item.x, item.y, '#00f2fe');
      } else if (item.type === 'handi') {
        this.sound.playShieldDeflect();
        this.shieldInventory = Math.min(3, this.shieldInventory + 1);
        this.updateHUDShield();
        this.addComicText("ভাতের ঢাকনা সংগৃহীত! [S চাপুন] 🛡️", item.x, item.y - 20, '#ffde59', '#000', 22);
        this.createBuffParticles(item.x, item.y, '#ffde59');
      }
    }

    // ============================================================================
    // VISUAL PARTICLES & SCREEN SHAKE
    // ============================================================================
    shakeScreen(intensity) {
      this.shakeAmount = intensity;
    }

    createJumpParticles(x, y) {
      for (let i = 0; i < 6; i++) {
        this.particles.push(new Particle(
          x + (Math.random() - 0.5) * 20, y,
          (Math.random() - 0.5) * 3, -Math.random() * 2,
          'rgba(255, 255, 255, 0.6)', 3 + Math.random() * 3, 18
        ));
      }
    }

    createSlideParticles(x, y) {
      for (let i = 0; i < 4; i++) {
        this.particles.push(new Particle(
          x, y,
          -3 - Math.random() * 3, -Math.random() * 1.5,
          Math.random() < 0.5 ? '#ffde59' : '#ff914d', 2 + Math.random() * 3, 14, 'star'
        ));
      }
    }

    createLandParticles(x, y) {
      for (let i = 0; i < 8; i++) {
        this.particles.push(new Particle(
          x + (Math.random() - 0.5) * 30, y,
          (Math.random() - 0.5) * 4, -Math.random() * 2,
          '#bcaaa4', 3 + Math.random() * 2, 20
        ));
      }
    }

    createHitSparks(x, y) {
      for (let i = 0; i < 16; i++) {
        this.particles.push(new Particle(
          x, y,
          (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8,
          Math.random() < 0.5 ? '#ff3366' : '#ffde59', 3 + Math.random() * 3, 22, 'star'
        ));
      }
    }

    createCoinSparkles(x, y) {
      for (let i = 0; i < 8; i++) {
        this.particles.push(new Particle(
          x + 16, y + 16,
          (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5,
          '#ffde59', 2 + Math.random() * 3, 20, 'star'
        ));
      }
    }

    createBuffParticles(x, y, color) {
      for (let i = 0; i < 14; i++) {
        this.particles.push(new Particle(
          x + 16, y + 16,
          (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6,
          color, 3 + Math.random() * 3, 25, 'circle'
        ));
      }
    }

    createConfetti() {
      const colors = ['#ff3366', '#ffde59', '#00f2fe', '#05c46b', '#ff914d', '#a278ff'];
      for (let i = 0; i < 40; i++) {
        this.particles.push(new Particle(
          200 + Math.random() * 560,
          80 + Math.random() * 100,
          (Math.random() - 0.5) * 8,
          -Math.random() * 5,
          colors[Math.floor(Math.random() * colors.length)],
          4 + Math.random() * 3,
          55,
          Math.random() < 0.5 ? 'star' : 'rect'
        ));
      }
    }

    createSpeedLine() {
      this.particles.push({
        x: this.width + 10,
        y: Math.random() * (this.groundY - 60),
        len: 80 + Math.random() * 120,
        speed: this.currentSpeed * 2.2,
        life: 25,
        maxLife: 25,
        update: function () {
          this.x -= this.speed;
          this.life--;
        },
        draw: function (ctx) {
          ctx.save();
          ctx.strokeStyle = 'rgba(255, 222, 89, 0.4)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(this.x + this.len, this.y);
          ctx.stroke();
          ctx.restore();
        }
      });
    }

    addComicText(text, x, y, color = '#ffde59', stroke = '#000', size = 22) {
      this.comicTexts.push(new ComicText(text, x, y, color, stroke, size));
    }

    updateParticles() {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.update();
        if (p.life <= 0) {
          this.particles.splice(i, 1);
        }
      }
    }

    updateComicTexts() {
      for (let i = this.comicTexts.length - 1; i >= 0; i--) {
        const ct = this.comicTexts[i];
        ct.update();
        if (ct.life <= 0) {
          this.comicTexts.splice(i, 1);
        }
      }
    }

    // ============================================================================
    // CANVAS RENDERING ENGINE (Pure Procedural Vector Graphics)
    // ============================================================================
    render() {
      const ctx = this.ctx;

      // Reset transforms and apply screen shake
      ctx.save();
      ctx.clearRect(0, 0, this.width, this.height);

      if (this.shakeAmount > 0) {
        const sx = (Math.random() - 0.5) * this.shakeAmount * 1.5;
        const sy = (Math.random() - 0.5) * this.shakeAmount * 1.5;
        ctx.translate(sx, sy);
      }

      // 1. Draw Parallax Backgrounds (Sky, Horizon, Room Walls)
      this.renderBackground(ctx);

      // 2. Draw Floor & Baseboards
      this.renderFloor(ctx);

      // 3. Draw Collectibles
      this.renderCollectibles(ctx);

      // 4. Draw Obstacles & Flying Slippers
      this.renderObstacles(ctx);

      // 5. Draw Antagonist: Mom (Hasina)
      this.renderAmmu(ctx);

      // 6. Draw Protagonist: Tamim
      this.renderTamim(ctx);

      // 7. Draw Visual FX Particles & Speed Lines
      this.renderParticles(ctx);

      // 8. Draw Floating Comic Texts
      this.renderComicTexts(ctx);

      ctx.restore();
    }

    // Parallax Environment Renderer
    renderBackground(ctx) {
      // Sky gradient according to zone
      let skyGrad = ctx.createLinearGradient(0, 0, 0, this.groundY);
      if (this.zone === 1) {
        // Living Room: Cozy lavender-violet wallpaper
        skyGrad.addColorStop(0, '#2d1454');
        skyGrad.addColorStop(1, '#441d7d');
      } else if (this.zone === 2) {
        // Kitchen: Warm terracotta / mustard tones
        skyGrad.addColorStop(0, '#59203b');
        skyGrad.addColorStop(1, '#823150');
      } else if (this.zone === 3) {
        // Balcony & Roof: Golden hour sunset sky over Dhaka
        skyGrad.addColorStop(0, '#ff4757');
        skyGrad.addColorStop(0.6, '#ffa502');
        skyGrad.addColorStop(1, '#ffc048');
      } else {
        // Street: Night city glow
        skyGrad.addColorStop(0, '#100624');
        skyGrad.addColorStop(0.7, '#241247');
        skyGrad.addColorStop(1, '#3b1c6e');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, this.width, this.groundY);

      // Distant Details (Layer 1 - Far Horizon)
      if (this.zone === 3 || this.zone === 4) {
        // Dhaka city skyline silhouette (water tanks, rooftops, minarets)
        ctx.fillStyle = 'rgba(20, 6, 40, 0.45)';
        for (let i = 0; i < 8; i++) {
          const bx = ((i * 140) - this.bgOffsetFar * 0.5) % (this.width + 140);
          const bw = 100 + (i % 3) * 30;
          const bh = 140 + (i % 4) * 40;
          ctx.fillRect(bx, this.groundY - bh, bw, bh);
          // Rooftop water tank cylinder
          ctx.beginPath();
          ctx.arc(bx + 25, this.groundY - bh - 10, 10, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Midground Details (Layer 2 - Wall posters, furniture, windows)
      if (this.zone === 1) {
        this.renderLivingRoomDetails(ctx);
      } else if (this.zone === 2) {
        this.renderKitchenDetails(ctx);
      } else if (this.zone === 3) {
        this.renderBalconyDetails(ctx);
      } else {
        this.renderStreetDetails(ctx);
      }
    }

    renderLivingRoomDetails(ctx) {
      // Wall molding / wainscoting
      ctx.strokeStyle = '#5c2d9e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, this.groundY - 140);
      ctx.lineTo(this.width, this.groundY - 140);
      ctx.stroke();

      // Comic Wall Posters
      const posters = [
        { text: "KEEP CALM & বিসিএস দে!", color: '#ffde59', bg: '#d63031' },
        { text: "নো ফেসবুকিং! ❌📱", color: '#fff', bg: '#0984e3' },
        { text: "WiFi: 12345678 📶", color: '#00f2fe', bg: '#2d3436' },
        { text: "আম্মুর আদেশ চূড়ান্ত! 🥿", color: '#ffde59', bg: '#6c5ce7' }
      ];

      posters.forEach((p, idx) => {
        const px = ((idx * 260 + 80) - this.bgOffsetMid) % (this.width + 260);
        const py = 120 + (idx % 2) * 30;

        // Poster frame
        ctx.fillStyle = '#ffde59';
        ctx.fillRect(px - 4, py - 4, 128, 78);
        ctx.fillStyle = p.bg;
        ctx.fillRect(px, py, 120, 70);

        // Text
        ctx.fillStyle = p.color;
        ctx.font = "bold 11px 'Hind Siliguri', sans-serif";
        ctx.textAlign = 'center';
        ctx.fillText(p.text, px + 60, py + 40);
      });

      // Hanging wall clock
      const clockX = (450 - this.bgOffsetMid * 0.8) % this.width;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(clockX, 85, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#2d1454';
      ctx.stroke();
      // Clock hands pointing to late study time (11:05)
      ctx.beginPath();
      ctx.moveTo(clockX, 85);
      ctx.lineTo(clockX - 10, 80);
      ctx.moveTo(clockX, 85);
      ctx.lineTo(clockX + 4, 70);
      ctx.stroke();
    }

    renderKitchenDetails(ctx) {
      // Kitchen Shelves with Spice Jars
      const shelfY = this.groundY - 170;
      ctx.fillStyle = '#4a152d';
      ctx.fillRect(0, shelfY, this.width, 10);

      const jars = ["হলুদ", "মরিচ", "জিরা", "দারুচিনি", "লবণ"];
      jars.forEach((jar, idx) => {
        const jx = ((idx * 160 + 60) - this.bgOffsetMid) % (this.width + 160);
        ctx.fillStyle = '#ffde59';
        ctx.fillRect(jx, shelfY - 32, 24, 32);
        ctx.fillStyle = '#2d1454';
        ctx.font = "9px 'Hind Siliguri'";
        ctx.textAlign = 'center';
        ctx.fillText(jar, jx + 12, shelfY - 12);
      });

      // Hanging frying pan (কড়াই)
      const panX = (500 - this.bgOffsetMid) % this.width;
      ctx.fillStyle = '#1e0c36';
      ctx.beginPath();
      ctx.arc(panX, shelfY + 40, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(panX - 4, shelfY + 10, 8, 15);
    }

    renderBalconyDetails(ctx) {
      // Balcony Grill Railing
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      for (let x = 0; x < this.width + 40; x += 30) {
        const rx = (x - this.bgOffsetNear) % (this.width + 40);
        ctx.beginPath();
        ctx.moveTo(rx, this.groundY - 80);
        ctx.lineTo(rx, this.groundY);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(0, this.groundY - 80);
      ctx.lineTo(this.width, this.groundY - 80);
      ctx.stroke();

      // Clothesline with hanging lungis & sarees blowing in wind!
      const lineY = 110;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, lineY);
      ctx.lineTo(this.width, lineY);
      ctx.stroke();

      const clothes = [
        { name: "লুঙ্গি", color: '#05c46b' },
        { name: "শাড়ি", color: '#ff3366' },
        { name: "শার্ট", color: '#00f2fe' }
      ];
      clothes.forEach((c, idx) => {
        const cx = ((idx * 280 + 100) - this.bgOffsetMid) % (this.width + 280);
        ctx.fillStyle = c.color;
        ctx.beginPath();
        ctx.moveTo(cx, lineY);
        ctx.lineTo(cx + 45, lineY);
        ctx.lineTo(cx + 40 + Math.sin(this.distance * 0.1) * 8, lineY + 60);
        ctx.lineTo(cx - 5 + Math.sin(this.distance * 0.1) * 8, lineY + 60);
        ctx.closePath();
        ctx.fill();
      });
    }

    renderStreetDetails(ctx) {
      // Rickshaw hood silhouette in background
      const rX = (300 - this.bgOffsetMid) % this.width;
      ctx.fillStyle = '#05c46b';
      ctx.beginPath();
      ctx.arc(rX, this.groundY - 45, 30, Math.PI, 0);
      ctx.fill();

      // Tea Stall Neon Banner ("রং চা ৫ টাকা")
      const teaX = (650 - this.bgOffsetMid) % this.width;
      ctx.fillStyle = '#ffde59';
      ctx.fillRect(teaX, 100, 140, 50);
      ctx.fillStyle = '#120726';
      ctx.font = "bold 13px 'Hind Siliguri'";
      ctx.textAlign = 'center';
      ctx.fillText("মামা স্পেশাল চা ৫৳ ☕", teaX + 70, 130);
    }

    // Floor & Ground Renderer
    renderFloor(ctx) {
      const fy = this.groundY;
      const fh = this.height - fy;

      // Floor Baseboard
      ctx.fillStyle = '#120726';
      ctx.fillRect(0, fy - 6, this.width, 6);

      // Floor gradient
      const floorGrad = ctx.createLinearGradient(0, fy, 0, this.height);
      if (this.zone === 1) {
        // Living room tiled parquet
        floorGrad.addColorStop(0, '#3e236e');
        floorGrad.addColorStop(1, '#200f3c');
      } else if (this.zone === 2) {
        // Kitchen checkered pattern
        floorGrad.addColorStop(0, '#532b40');
        floorGrad.addColorStop(1, '#2d1421');
      } else {
        // Balcony mosaic / Street asphalt
        floorGrad.addColorStop(0, '#2f3542');
        floorGrad.addColorStop(1, '#1e222a');
      }
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, fy, this.width, fh);

      // Floor Planks / Tiles lines moving with ground speed
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 2;
      for (let x = 0; x < this.width + 60; x += 60) {
        const lx = (x - this.bgOffsetFloor) % (this.width + 60);
        ctx.beginPath();
        ctx.moveTo(lx, fy);
        ctx.lineTo(lx - 20, this.height);
        ctx.stroke();
      }

      // Colorful runner rug in Living room
      if (this.zone === 1) {
        ctx.fillStyle = '#c0392b';
        ctx.fillRect(0, fy + 12, this.width, 24);
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(0, fy + 16, this.width, 4);
        ctx.fillRect(0, fy + 28, this.width, 4);
      }
    }

    // Collectibles Renderer
    renderCollectibles(ctx) {
      this.collectibles.forEach(item => {
        const drawY = item.y + Math.sin(item.floatOffset) * 6;
        ctx.save();
        ctx.translate(item.x + item.w / 2, drawY + item.h / 2);

        if (item.type === 'coin') {
          // Shiny Gold Taka Coin
          ctx.fillStyle = '#ffde59';
          ctx.beginPath();
          ctx.arc(0, 0, 15, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#b8860b';
          ctx.lineWidth = 3;
          ctx.stroke();

          // Bengali Taka Symbol ৳
          ctx.fillStyle = '#5c3a00';
          ctx.font = "bold 14px 'Hind Siliguri', sans-serif";
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText("৳", 0, 1);
        } else if (item.type === 'biryani') {
          // Hot Biryani Box with Steaming aroma
          ctx.fillStyle = '#ff914d';
          ctx.fillRect(-16, -10, 32, 22);
          // Lid
          ctx.fillStyle = '#ffde59';
          ctx.fillRect(-18, -15, 36, 7);
          // Steam lines
          ctx.strokeStyle = 'rgba(255,255,255,0.7)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-6, -18);
          ctx.quadraticCurveTo(-10, -25, -5, -30);
          ctx.moveTo(6, -18);
          ctx.quadraticCurveTo(10, -25, 5, -30);
          ctx.stroke();
          // Icon emoji
          ctx.font = "14px sans-serif";
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText("🍗", 0, 1);
        } else if (item.type === 'wifi') {
          // 5G Wi-Fi Router
          ctx.fillStyle = '#1e0c36';
          ctx.fillRect(-16, -8, 32, 18);
          // Antennae
          ctx.strokeStyle = '#00f2fe';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(-10, -8); ctx.lineTo(-15, -22);
          ctx.moveTo(10, -8); ctx.lineTo(15, -22);
          ctx.stroke();
          // Flashing Signal LED
          ctx.fillStyle = Math.sin(this.distance * 0.2) > 0 ? '#00f2fe' : '#05c46b';
          ctx.beginPath();
          ctx.arc(0, 1, 4, 0, Math.PI * 2);
          ctx.fill();
        } else if (item.type === 'handi') {
          // Bhaater Handi Lid (Golden Rice Pot Lid Shield)
          ctx.fillStyle = '#f1c40f';
          ctx.beginPath();
          ctx.arc(0, 0, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#d35400';
          ctx.lineWidth = 3;
          ctx.stroke();
          // Handle knob
          ctx.fillStyle = '#8e44ad';
          ctx.beginPath();
          ctx.arc(0, 0, 6, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });
    }

    // Obstacles Renderer
    renderObstacles(ctx) {
      this.obstacles.forEach(obs => {
        ctx.save();

        if (obs.type === 'slipper') {
          // Flying Slipper (জুতো) with Comic Rotation
          ctx.translate(obs.x + obs.w / 2, obs.y + obs.h / 2);
          ctx.rotate(obs.angle);

          // Slipper Sole (Curve)
          ctx.fillStyle = obs.variant === 'turbo' ? '#ff3366' : '#c0392b';
          ctx.beginPath();
          ctx.ellipse(0, 0, 20, 10, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#120726';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Slipper V-Strap (ফিতা)
          ctx.fillStyle = '#ffde59';
          ctx.beginPath();
          ctx.moveTo(-10, -2);
          ctx.lineTo(4, -8);
          ctx.lineTo(8, -2);
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#ffde59';
          ctx.stroke();

          // Motion wind lines behind slipper
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-25, -6); ctx.lineTo(-40, -6);
          ctx.moveTo(-22, 6); ctx.lineTo(-35, 6);
          ctx.stroke();

        } else if (obs.type === 'ground') {
          if (obs.variant === 'sleeping_cat') {
            // Cute sleeping orange tabby cat
            ctx.translate(obs.x + obs.w / 2, obs.y + obs.h / 2);
            // Cat Body
            ctx.fillStyle = '#e67e22';
            ctx.beginPath();
            ctx.ellipse(0, 4, 18, 12, 0, 0, Math.PI * 2);
            ctx.fill();
            // Cat Head
            ctx.beginPath();
            ctx.arc(-12, 0, 10, 0, Math.PI * 2);
            ctx.fill();
            // Ears
            ctx.beginPath();
            ctx.moveTo(-16, -6); ctx.lineTo(-18, -14); ctx.lineTo(-10, -9);
            ctx.fill();
            // Closed eyes & Whiskers
            ctx.strokeStyle = '#2c3e50';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(-14, 0, 3, 0, Math.PI); // smiling closed eye
            ctx.stroke();
            // Floating 'Zzz'
            ctx.fillStyle = '#00f2fe';
            ctx.font = "bold 11px sans-serif";
            ctx.fillText("zZ", 8, -8);

          } else if (obs.variant === 'wet_bucket') {
            // Water bucket & wet floor puddle
            ctx.fillStyle = 'rgba(0, 242, 254, 0.5)';
            ctx.beginPath();
            ctx.ellipse(obs.x + 20, obs.y + 35, 26, 6, 0, 0, Math.PI * 2);
            ctx.fill();

            // Metal Bucket
            ctx.fillStyle = '#7f8c8d';
            ctx.beginPath();
            ctx.moveTo(obs.x + 8, obs.y + 10);
            ctx.lineTo(obs.x + 32, obs.y + 10);
            ctx.lineTo(obs.x + 28, obs.y + 35);
            ctx.lineTo(obs.x + 12, obs.y + 35);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#2c3e50';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Mop handle leaning
            ctx.strokeStyle = '#d35400';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(obs.x + 18, obs.y + 20);
            ctx.lineTo(obs.x + 38, obs.y - 15);
            ctx.stroke();

          } else if (obs.variant === 'book_stack') {
            // Heavy stack of study books
            const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12'];
            for (let b = 0; b < 4; b++) {
              ctx.fillStyle = colors[b];
              ctx.fillRect(obs.x + 2, obs.y + b * 9, 32, 8);
              ctx.fillStyle = '#fff';
              ctx.fillRect(obs.x + 5, obs.y + b * 9 + 2, 24, 4);
            }

          } else if (obs.variant === 'banana_peel') {
            // Yellow banana peel
            ctx.fillStyle = '#f1c40f';
            ctx.beginPath();
            ctx.ellipse(obs.x + 15, obs.y + 10, 14, 6, -0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#7f8c8d';
            ctx.fillRect(obs.x + 12, obs.y + 3, 4, 4);
          }
        }

        ctx.restore();
      });
    }

    // Antagonist Renderer: Mom (Hasina)
    renderAmmu(ctx) {
      const a = this.ammu;
      ctx.save();
      ctx.translate(a.x, a.y);

      // Running cycle leg swings
      const legPhase = a.runFrame;
      const legL = Math.sin(legPhase) * 16;
      const legR = -legL;

      // Saree Legs (Darker red)
      ctx.strokeStyle = '#99153a';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(20, 52); ctx.lineTo(20 + legL, 70);
      ctx.moveTo(35, 52); ctx.lineTo(35 + legR, 70);
      ctx.stroke();

      // Saree Skirt & Body (Fierce Red & Golden Border Saree)
      ctx.fillStyle = '#c9184a';
      ctx.beginPath();
      ctx.moveTo(15, 28);
      ctx.lineTo(45, 28);
      ctx.lineTo(48, 56);
      ctx.lineTo(12, 56);
      ctx.closePath();
      ctx.fill();

      // Golden Zari Saree Border
      ctx.strokeStyle = '#ffde59';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(12, 55); ctx.lineTo(48, 55);
      ctx.stroke();

      // Flowing Saree Pallu (আঁচল) fluttering fiercely behind her in the wind
      ctx.fillStyle = '#ff4d6d';
      ctx.beginPath();
      ctx.moveTo(18, 30);
      const palluWave = Math.sin(this.distance * 0.25) * 8;
      ctx.quadraticCurveTo(-15, 24 + palluWave, -35, 36 + palluWave);
      ctx.lineTo(-30, 48 + palluWave);
      ctx.quadraticCurveTo(-10, 38 + palluWave, 20, 42);
      ctx.closePath();
      ctx.fill();

      // Head & Face
      ctx.fillStyle = '#ffdfba'; // Skin tone
      ctx.beginPath();
      ctx.arc(32, 16, 13, 0, Math.PI * 2);
      ctx.fill();

      // Hair Bun
      ctx.fillStyle = '#1e0c36';
      ctx.beginPath();
      ctx.arc(20, 12, 9, 0, Math.PI * 2);
      ctx.fill();

      // Angry Red Bindi on Forehead
      ctx.fillStyle = '#c9184a';
      ctx.beginPath();
      ctx.arc(36, 13, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Fierce Angry Eyes & Eyebrows
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(38, 17, 2, 0, Math.PI * 2);
      ctx.fill();
      // Angry slanted eyebrow
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(34, 13); ctx.lineTo(41, 16);
      ctx.stroke();

      // Throwing Arm with Slipper raised high!
      ctx.save();
      ctx.translate(35, 28);
      const throwRot = a.isThrowing ? a.armAngle : Math.sin(a.runFrame) * 0.4;
      ctx.rotate(throwRot);
      ctx.strokeStyle = '#ffdfba';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(15, -16);
      ctx.stroke();

      // Slipper held in Mom's hand ready to launch
      ctx.fillStyle = '#ffde59';
      ctx.fillRect(10, -26, 18, 9);
      ctx.fillStyle = '#c0392b';
      ctx.fillRect(10, -22, 18, 4);
      ctx.restore();

      // Anger Steam Puffs popping from ears
      if (Math.random() < 0.3) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(14, 6, 4 + Math.random() * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Ammu's Comic Speech Bubble
      if (this.ammuQuote && this.ammuQuoteTimer > 0) {
        this.renderAmmuSpeechBubble(ctx, a);
      }

      ctx.restore();
    }

    renderAmmuSpeechBubble(ctx, ammu) {
      ctx.save();
      ctx.font = "bold 13px 'Hind Siliguri', sans-serif";
      const textWidth = ctx.measureText(this.ammuQuote).width;
      const bw = textWidth + 24;
      const bh = 34;
      const bx = -bw / 2 + 30;
      const by = -55;

      // Bubble Background
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#120726';
      ctx.lineWidth = 3;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(bx, by, bw, bh, 10);
      } else {
        // Fallback for older browsers
        ctx.rect(bx, by, bw, bh);
      }
      ctx.fill();
      ctx.stroke();

      // Tail pointing to Ammu's mouth
      ctx.beginPath();
      ctx.moveTo(bx + bw / 2, by + bh);
      ctx.lineTo(bx + bw / 2 - 6, by + bh + 10);
      ctx.lineTo(bx + bw / 2 + 10, by + bh);
      ctx.closePath();
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.stroke();

      // Text inside bubble
      ctx.fillStyle = '#c9184a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.ammuQuote, bx + bw / 2, by + bh / 2);

      ctx.restore();
    }

    // Protagonist Renderer: Tamim
    renderTamim(ctx) {
      const t = this.tamim;
      ctx.save();
      ctx.translate(t.x, t.y);

      // Immunity flash when hurt
      if (t.hitCooldown > 0 && Math.floor(t.hitCooldown / 4) % 2 === 0) {
        ctx.globalAlpha = 0.4;
      }

      // 1. Invincible Golden Shield Aura (when active)
      if (this.shieldTimer > 0) {
        ctx.save();
        const pulse = Math.sin(this.shieldTimer * 0.15) * 3;
        ctx.strokeStyle = '#00f2fe';
        ctx.lineWidth = 3;
        ctx.fillStyle = 'rgba(0, 242, 254, 0.18)';
        ctx.beginPath();
        ctx.ellipse(t.w / 2, t.h / 2, t.w / 2 + 14 + pulse, t.h / 2 + 12 + pulse, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      if (t.isSliding) {
        // --- Tamim Sliding Animation Frame ---
        // Sliding horizontal body
        ctx.fillStyle = t.skin === 'lungi' ? '#05c46b' : (t.skin === 'school' ? '#3498db' : '#8e44ad');
        ctx.fillRect(4, 14, 46, 18);

        // Head sliding back
        ctx.fillStyle = '#ffdfba';
        ctx.beginPath();
        ctx.arc(8, 12, 11, 0, Math.PI * 2);
        ctx.fill();

        // Panicked face looking backward
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(5, 11, 2.5, 0, Math.PI * 2); // terrified open eye
        ctx.fill();

        // Hair
        ctx.fillStyle = '#1e0c36';
        ctx.beginPath();
        ctx.arc(10, 6, 8, 0, Math.PI);
        ctx.fill();

      } else {
        // --- Tamim Standing / Running / Jumping Animation ---
        const legPhase = t.runFrame;
        const legL = t.isGrounded ? Math.sin(legPhase) * 16 : 10;
        const legR = t.isGrounded ? -legL : -12;

        // Legs (Outfit dependent)
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';

        if (t.skin === 'lungi') {
          // Lungi Skirt (Traditional green/white check pattern)
          ctx.fillStyle = '#05c46b';
          ctx.beginPath();
          ctx.moveTo(14, 34); ctx.lineTo(38, 34);
          ctx.lineTo(40 + legR * 0.4, 58); ctx.lineTo(12 + legL * 0.4, 58);
          ctx.closePath();
          ctx.fill();

          // Bare feet / Sandal
          ctx.strokeStyle = '#ffdfba';
          ctx.beginPath();
          ctx.moveTo(18, 58); ctx.lineTo(18 + legL, 70);
          ctx.moveTo(34, 58); ctx.lineTo(34 + legR, 70);
          ctx.stroke();

        } else if (t.skin === 'school') {
          // Blue School Pants
          ctx.strokeStyle = '#2980b9';
          ctx.beginPath();
          ctx.moveTo(18, 40); ctx.lineTo(18 + legL, 70);
          ctx.moveTo(34, 40); ctx.lineTo(34 + legR, 70);
          ctx.stroke();

        } else {
          // Gamer Black Joggers with Neon Stripe
          ctx.strokeStyle = '#1e0c36';
          ctx.beginPath();
          ctx.moveTo(18, 40); ctx.lineTo(18 + legL, 70);
          ctx.moveTo(34, 40); ctx.lineTo(34 + legR, 70);
          ctx.stroke();
        }

        // Torso / Shirt
        ctx.fillStyle = t.skin === 'lungi' ? '#ffde59' : (t.skin === 'school' ? '#ffffff' : '#ff3366');
        ctx.fillRect(14, 18, 24, 20);

        // Backpack (School skin)
        if (t.skin === 'school') {
          ctx.fillStyle = '#e67e22';
          ctx.fillRect(8, 20, 8, 16);
        }

        // Head
        ctx.fillStyle = '#ffdfba'; // Skin tone
        ctx.beginPath();
        ctx.arc(26, 12, 11, 0, Math.PI * 2);
        ctx.fill();

        // Messy Hair / Gamer Headset
        ctx.fillStyle = '#1e0c36';
        ctx.beginPath();
        ctx.arc(26, 6, 10, 0, Math.PI);
        ctx.fill();

        if (t.skin === 'gamer') {
          // RGB Headset
          ctx.strokeStyle = '#00f2fe';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(26, 10, 12, Math.PI, 0);
          ctx.stroke();
          ctx.fillStyle = '#00f2fe';
          ctx.fillRect(13, 8, 4, 8);
          ctx.fillRect(35, 8, 4, 8);
        }

        // Eyes: Wide panicked eyes looking back at Ammu!
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(21, 11, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(19.5, 11, 1.8, 0, Math.PI * 2); // Pupil looking back to left
        ctx.fill();

        // Gasping open mouth
        ctx.fillStyle = '#c0392b';
        ctx.beginPath();
        ctx.ellipse(26, 17, 3, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Flying Sweat Drops when sprinting!
        if (Math.random() < 0.45) {
          ctx.fillStyle = '#00f2fe';
          ctx.beginPath();
          ctx.arc(12, 6, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Arms swinging
        const armPhase = t.isGrounded ? -Math.sin(legPhase) * 12 : -8;
        ctx.strokeStyle = '#ffdfba';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(26, 22); ctx.lineTo(26 + armPhase, 32);
        ctx.stroke();
      }

      // Comic dizzy stars spinning around head when hurt
      if (t.hitCooldown > 0) {
        ctx.save();
        ctx.font = "14px sans-serif";
        const starRot = Date.now() * 0.012;
        const sx1 = 26 + Math.cos(starRot) * 18;
        const sy1 = 2 + Math.sin(starRot) * 8;
        const sx2 = 26 + Math.cos(starRot + Math.PI) * 18;
        const sy2 = 2 + Math.sin(starRot + Math.PI) * 8;
        ctx.fillText("💫", sx1 - 7, sy1);
        ctx.fillText("✨", sx2 - 7, sy2);
        ctx.restore();
      }

      ctx.restore();
    }

    // Particles & FX Renderer
    renderParticles(ctx) {
      this.particles.forEach(p => p.draw(ctx));
    }

    // Comic Floating Texts Renderer
    renderComicTexts(ctx) {
      this.comicTexts.forEach(ct => ct.draw(ctx));
    }

    // ============================================================================
    // HUD & STATE SYNCHRONIZATION
    // ============================================================================
    updateHUD() {
      if (this.distanceVal) this.distanceVal.textContent = this.distance;
      if (this.coinVal) this.coinVal.textContent = this.coins;

      // Update Ammu Proximity Meter
      if (this.ammuBarFill) {
        const pct = Math.max(0, Math.min(100, Math.round(this.ammuProximity * 100)));
        this.ammuBarFill.style.width = `${pct}%`;
        if (this.ammuAvatarPin) {
          this.ammuAvatarPin.style.left = `${100 - pct}%`;
        }

        if (this.ammuDistanceText) {
          if (pct > 65) {
            this.ammuDistanceText.textContent = "নিরাপদ দূরত্বে আছো";
            this.ammuDistanceText.className = "status-safe";
          } else if (pct > 30) {
            this.ammuDistanceText.textContent = "আম্মু কাছাকাছি আসছে!";
            this.ammuDistanceText.className = "status-caution";
          } else {
            this.ammuDistanceText.textContent = "সাবধান! জুতো ছোড়ার রেঞ্জে!";
            this.ammuDistanceText.className = "status-warning";
          }
        }
      }

      // Update Wi-Fi Buff Indicator
      if (this.buffWifi && this.wifiTimerFill) {
        if (this.speedBoostTimer > 0) {
          this.buffWifi.classList.remove('hidden');
          const pct = (this.speedBoostTimer / 240) * 100;
          this.wifiTimerFill.style.width = `${pct}%`;
        } else {
          this.buffWifi.classList.add('hidden');
        }
      }
    }

    updateHUDLives() {
      for (let i = 0; i < this.maxLives; i++) {
        if (this.hpIcons[i]) {
          if (i < this.lives) {
            this.hpIcons[i].classList.remove('lost');
          } else {
            this.hpIcons[i].classList.add('lost');
          }
        }
      }
    }

    updateHUDShield() {
      if (this.shieldCountBadge) {
        this.shieldCountBadge.textContent = this.shieldInventory;
      }
      if (this.buffShield && this.shieldTimerFill) {
        if (this.shieldTimer > 0) {
          this.buffShield.classList.remove('hidden');
          const pct = (this.shieldTimer / 300) * 100;
          this.shieldTimerFill.style.width = `${pct}%`;
        } else {
          this.buffShield.classList.add('hidden');
        }
      }
    }

    triggerGameOver(customReason = "") {
      this.state = 'GAMEOVER';
      this.sound.stopBGM();
      this.sound.playGameOver();
      this.hud.classList.add('hidden');
      this.gameOverScreen.classList.remove('hidden');

      // Check High Score
      const isNewRecord = this.distance > this.highScore;
      if (isNewRecord) {
        this.highScore = this.distance;
        localStorage.setItem('tamim_high_score', this.highScore.toString());
        if (this.newRecordBadge) this.newRecordBadge.classList.remove('hidden');
      } else {
        if (this.newRecordBadge) this.newRecordBadge.classList.add('hidden');
      }

      if (this.finalDistance) this.finalDistance.textContent = this.distance;
      if (this.finalCoins) this.finalCoins.textContent = this.coins;
      if (this.gameoverHighScore) this.gameoverHighScore.textContent = this.highScore;
      if (this.startHighScore) this.startHighScore.textContent = this.highScore;

      // Pick humorous roast quote
      if (this.roastText) {
        const rawQuote = ROAST_QUOTES[Math.floor(Math.random() * ROAST_QUOTES.length)];
        this.roastText.textContent = rawQuote.replace('{dist}', this.distance.toString());
      }
    }

    shareScore() {
      const shareMsg = `🏃‍♂️ আমি "TAMIM RUN" গেমে আম্মুর উড়ন্ত জুতো ফাঁকি দিয়ে ${this.distance} মিটার পালিয়েছি! 🥿💥\nতোমার আম্মুর জুতো ফাঁকি দেওয়ার সাহস আছে তো? এখনই খেলো!`;

      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareMsg).then(() => {
          this.showToast("স্কোর কপি হয়েছে! ফেসবুকে পোস্ট করো!");
        }).catch(() => {
          this.showToast("কপি করা যায়নি, ম্যানুয়ালি শেয়ার করুন!");
        });
      } else {
        this.showToast("লিংক শেয়ারের জন্য প্রস্তুত!");
      }
    }

    showToast(msg) {
      if (!this.toast) return;
      this.toast.textContent = msg;
      this.toast.classList.remove('hidden');
      setTimeout(() => {
        this.toast.classList.add('hidden');
      }, 2600);
    }

    // ============================================================================
    // MAIN RAF ANIMATION LOOP
    // ============================================================================
    gameLoop(timestamp) {
      this.update();
      this.render();
      requestAnimationFrame(this.gameLoop.bind(this));
    }
  }

  // --- Start Game on DOM Ready ---
  window.addEventListener('DOMContentLoaded', () => {
    window.game = new TamimGame();
  });
})();
