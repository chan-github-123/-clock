// Main Application

// Clock Module
const Clock = {
  elements: {
    hour1: null,
    hour2: null,
    min1: null,
    min2: null,
    sec1: null,
    sec2: null,
    date: null,
    ampm: null
  },

  lastValues: {
    hour1: '', hour2: '',
    min1: '', min2: '',
    sec1: '', sec2: ''
  },

  init() {
    // Get elements
    this.elements.hour1 = document.getElementById('hour1');
    this.elements.hour2 = document.getElementById('hour2');
    this.elements.min1 = document.getElementById('min1');
    this.elements.min2 = document.getElementById('min2');
    this.elements.sec1 = document.getElementById('sec1');
    this.elements.sec2 = document.getElementById('sec2');
    this.elements.date = document.getElementById('date');
    this.elements.ampm = document.getElementById('ampm');

    // Start clock
    this.update();
    setInterval(() => this.update(), 1000);

    // Listen for settings changes
    window.addEventListener('settingsChanged', (e) => {
      if (e.detail.key === 'timeFormat') {
        this.update();
      }
    });
  },

  update() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // Handle 12/24 hour format
    const is24h = Settings.get('timeFormat') === '24h';
    let ampm = '';

    if (!is24h) {
      ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
    }

    // Format digits
    const h1 = Math.floor(hours / 10).toString();
    const h2 = (hours % 10).toString();
    const m1 = Math.floor(minutes / 10).toString();
    const m2 = (minutes % 10).toString();
    const s1 = Math.floor(seconds / 10).toString();
    const s2 = (seconds % 10).toString();

    // Update with flip animation
    this.flipDigit('hour1', h1);
    this.flipDigit('hour2', h2);
    this.flipDigit('min1', m1);
    this.flipDigit('min2', m2);
    this.flipDigit('sec1', s1);
    this.flipDigit('sec2', s2);

    // Update AM/PM
    if (this.elements.ampm) {
      this.elements.ampm.textContent = ampm;
    }

    // Update date
    this.updateDate(now);
  },

  flipDigit(id, value) {
    const element = this.elements[id];
    if (!element) return;

    // Only flip if value changed
    if (this.lastValues[id] === value) return;
    this.lastValues[id] = value;

    // Update the displayed value
    const front = element.querySelector('.flip-card-front span');
    const back = element.querySelector('.flip-card-back span');

    if (front) front.textContent = value;
    if (back) back.textContent = value;

    // Trigger flip animation
    element.classList.remove('flip');
    void element.offsetWidth; // Force reflow
    element.classList.add('flip');
  },

  updateDate(date) {
    if (!this.elements.date) return;
    this.elements.date.textContent = i18n.formatDate(date);
  }
};

// Pomodoro Module
const Pomodoro = {
  elements: {
    time: null,
    timeInput: null,
    mode: null,
    modeInput: null,
    progress: null,
    circle: null,
    container: null,
    startBtn: null,
    pauseBtn: null,
    resetBtn: null,
    timeUp: null,
    timeDown: null
  },

  state: {
    isRunning: false,
    isPaused: false,
    isWorkMode: true,
    timeLeft: 0,
    totalTime: 0,
    isEditing: false,
    isEditingMode: false
  },

  interval: null,
  circumference: 2 * Math.PI * 45, // 2πr where r=45

  init() {
    // Get elements
    this.elements.time = document.getElementById('pomodoroTime');
    this.elements.timeInput = document.getElementById('pomodoroTimeInput');
    this.elements.mode = document.getElementById('pomodoroMode');
    this.elements.modeInput = document.getElementById('pomodoroModeInput');
    this.elements.progress = document.getElementById('pomodoroProgress');
    this.elements.circle = document.querySelector('.pomodoro-circle');
    this.elements.container = document.querySelector('.pomodoro');
    this.elements.startBtn = document.getElementById('startBtn');
    this.elements.pauseBtn = document.getElementById('pauseBtn');
    this.elements.resetBtn = document.getElementById('resetBtn');
    this.elements.timeUp = document.getElementById('timeUp');
    this.elements.timeDown = document.getElementById('timeDown');

    // Bind control buttons
    this.elements.startBtn?.addEventListener('click', () => this.start());
    this.elements.pauseBtn?.addEventListener('click', () => this.pause());
    this.elements.resetBtn?.addEventListener('click', () => this.reset());

    // Bind time adjustment buttons
    this.elements.timeUp?.addEventListener('click', () => this.adjustTime(1));
    this.elements.timeDown?.addEventListener('click', () => this.adjustTime(-1));

    // Click on time to edit directly
    this.elements.time?.addEventListener('click', () => this.startEditing());

    // Time input handlers
    this.elements.timeInput?.addEventListener('blur', () => this.finishEditing());
    this.elements.timeInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.finishEditing();
      if (e.key === 'Escape') this.cancelEditing();
    });

    // Click on mode to edit label
    this.elements.mode?.addEventListener('click', () => this.startEditingMode());

    // Mode input handlers
    this.elements.modeInput?.addEventListener('blur', () => this.finishEditingMode());
    this.elements.modeInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.finishEditingMode();
      if (e.key === 'Escape') this.cancelEditingMode();
    });

    // Listen for settings changes
    window.addEventListener('settingsChanged', (e) => {
      if ((e.detail.key === 'workTime' || e.detail.key === 'breakTime') && !this.state.isRunning) {
        this.reset();
      }
    });

    // Initialize display
    this.reset();
  },

  // Adjust time by minutes
  adjustTime(delta) {
    if (this.state.isRunning) return;

    const currentMinutes = Math.ceil(this.state.timeLeft / 60);
    const newMinutes = Math.min(120, Math.max(1, currentMinutes + delta));

    this.state.timeLeft = newMinutes * 60;
    this.state.totalTime = newMinutes * 60;

    // Update settings
    if (this.state.isWorkMode) {
      Settings.update('workTime', newMinutes);
    } else {
      Settings.update('breakTime', newMinutes);
    }

    this.updateDisplay();
    this.updateProgress(0);
  },

  // Start editing mode
  startEditing() {
    if (this.state.isRunning) return;

    this.state.isEditing = true;
    const currentMinutes = Math.ceil(this.state.timeLeft / 60);

    this.elements.time.style.display = 'none';
    this.elements.timeInput.style.display = 'block';
    this.elements.timeInput.value = currentMinutes;
    this.elements.timeInput.focus();
    this.elements.timeInput.select();
  },

  // Finish editing
  finishEditing() {
    if (!this.state.isEditing) return;

    const value = parseInt(this.elements.timeInput.value) || 1;
    const newMinutes = Math.min(120, Math.max(1, value));

    this.state.timeLeft = newMinutes * 60;
    this.state.totalTime = newMinutes * 60;

    // Update settings
    if (this.state.isWorkMode) {
      Settings.update('workTime', newMinutes);
    } else {
      Settings.update('breakTime', newMinutes);
    }

    this.state.isEditing = false;
    this.elements.time.style.display = 'block';
    this.elements.timeInput.style.display = 'none';

    this.updateDisplay();
    this.updateProgress(0);
  },

  // Cancel editing
  cancelEditing() {
    this.state.isEditing = false;
    this.elements.time.style.display = 'block';
    this.elements.timeInput.style.display = 'none';
  },

  // Start editing mode label
  startEditingMode() {
    this.state.isEditingMode = true;
    const currentLabel = this.state.isWorkMode
      ? Settings.get('workLabel')
      : Settings.get('breakLabel');

    this.elements.mode.style.display = 'none';
    this.elements.modeInput.style.display = 'block';
    this.elements.modeInput.value = currentLabel;
    this.elements.modeInput.focus();
    this.elements.modeInput.select();
  },

  // Finish editing mode label
  finishEditingMode() {
    if (!this.state.isEditingMode) return;

    const value = this.elements.modeInput.value.trim() || (this.state.isWorkMode ? i18n.t('work') : i18n.t('break'));

    // Update settings
    if (this.state.isWorkMode) {
      Settings.update('workLabel', value);
    } else {
      Settings.update('breakLabel', value);
    }

    this.state.isEditingMode = false;
    this.elements.mode.style.display = 'block';
    this.elements.modeInput.style.display = 'none';

    this.updateMode();
  },

  // Cancel editing mode label
  cancelEditingMode() {
    this.state.isEditingMode = false;
    this.elements.mode.style.display = 'block';
    this.elements.modeInput.style.display = 'none';
  },

  start() {
    if (this.state.isRunning && !this.state.isPaused) return;

    if (!this.state.isRunning) {
      // Fresh start - use current timeLeft if set, otherwise use settings
      if (this.state.timeLeft <= 0) {
        const minutes = this.state.isWorkMode
          ? Settings.get('workTime')
          : Settings.get('breakTime');
        this.state.totalTime = minutes * 60;
        this.state.timeLeft = this.state.totalTime;
      }
    }

    this.state.isRunning = true;
    this.state.isPaused = false;

    // Add running class to disable time adjustment
    this.elements.circle?.classList.add('running');
    this.elements.container?.classList.add('running');

    // Update buttons
    this.elements.startBtn.disabled = true;
    this.elements.pauseBtn.disabled = false;

    // Start interval
    this.interval = setInterval(() => this.tick(), 1000);
  },

  pause() {
    if (!this.state.isRunning || this.state.isPaused) return;

    this.state.isPaused = true;
    clearInterval(this.interval);

    // Update buttons
    this.elements.startBtn.disabled = false;
    this.elements.startBtn.textContent = i18n.t('continue');
    this.elements.pauseBtn.disabled = true;
  },

  reset() {
    clearInterval(this.interval);

    this.state.isRunning = false;
    this.state.isPaused = false;
    this.state.isWorkMode = true;

    const minutes = Settings.get('workTime');
    this.state.totalTime = minutes * 60;
    this.state.timeLeft = this.state.totalTime;

    // Remove running class to enable time adjustment
    this.elements.circle?.classList.remove('running');
    this.elements.container?.classList.remove('running');

    // Update UI
    this.updateDisplay();
    this.updateProgress(0);
    this.updateMode();

    // Update buttons
    this.elements.startBtn.disabled = false;
    this.elements.startBtn.textContent = i18n.t('start');
    this.elements.pauseBtn.disabled = true;
  },

  tick() {
    this.state.timeLeft--;

    if (this.state.timeLeft <= 0) {
      this.complete();
      return;
    }

    this.updateDisplay();
    this.updateProgress((this.state.totalTime - this.state.timeLeft) / this.state.totalTime);
  },

  complete() {
    clearInterval(this.interval);

    // Play alarm
    Audio.playAlarm();

    // Switch mode
    this.state.isWorkMode = !this.state.isWorkMode;
    this.state.isRunning = false;

    // Remove running class
    this.elements.circle?.classList.remove('running');
    this.elements.container?.classList.remove('running');

    // Set up next session
    const minutes = this.state.isWorkMode
      ? Settings.get('workTime')
      : Settings.get('breakTime');
    this.state.totalTime = minutes * 60;
    this.state.timeLeft = this.state.totalTime;

    // Update UI
    this.updateDisplay();
    this.updateProgress(0);
    this.updateMode();

    // Update buttons
    this.elements.startBtn.disabled = false;
    this.elements.startBtn.textContent = i18n.t('start');
    this.elements.pauseBtn.disabled = true;
  },

  updateDisplay() {
    if (!this.elements.time) return;

    const minutes = Math.floor(this.state.timeLeft / 60);
    const seconds = this.state.timeLeft % 60;

    this.elements.time.textContent =
      `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  },

  updateProgress(progress) {
    if (!this.elements.progress) return;

    // SVG progress goes from full to empty (clockwise from top)
    const offset = this.circumference * progress;
    this.elements.progress.style.strokeDashoffset = offset;
  },

  updateMode() {
    if (!this.elements.mode || !this.elements.circle) return;

    if (this.state.isWorkMode) {
      this.elements.mode.textContent = Settings.get('workLabel') || i18n.t('work');
      this.elements.circle.classList.remove('break');
      this.elements.container?.classList.remove('break');
    } else {
      this.elements.mode.textContent = Settings.get('breakLabel') || i18n.t('break');
      this.elements.circle.classList.add('break');
      this.elements.container?.classList.add('break');
    }
  }
};

// Clock Zoom Module - 시계 클릭하면 모핑 애니메이션으로 크게 보기
const ClockZoom = {
  overlay: null,
  content: null,
  digit1: null,
  digit2: null,
  label: null,
  currentType: null,
  currentIds: null,
  updateInterval: null,
  sourceRect: null,

  labels: {
    hour: { ko: '시', en: 'HOUR' },
    minute: { ko: '분', en: 'MIN' },
    second: { ko: '초', en: 'SEC' }
  },

  init() {
    this.overlay = document.getElementById('clockZoomOverlay');
    this.content = document.getElementById('clockZoomContent');
    this.digit1 = document.getElementById('zoomDigit1');
    this.digit2 = document.getElementById('zoomDigit2');
    this.label = document.getElementById('clockZoomLabel');

    // Add click handlers to flip groups
    document.querySelectorAll('.flip-group').forEach(group => {
      group.addEventListener('click', (e) => {
        e.stopPropagation();
        const type = group.dataset.type;
        const ids = group.dataset.ids.split(',');
        const rect = group.getBoundingClientRect();
        this.show(type, ids, rect);
      });
    });

    // Close on overlay click
    this.overlay?.addEventListener('click', () => this.hide());

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.overlay?.classList.contains('active')) {
        this.hide();
      }
    });
  },

  show(type, ids, rect) {
    this.currentType = type;
    this.currentIds = ids;
    this.sourceRect = rect;

    // Get current values
    this.updateDigits(ids);

    // Update label
    const locale = i18n.currentLocale;
    this.label.textContent = this.labels[type][locale] || this.labels[type]['en'];

    // Position content at source element position
    this.content.style.left = `${rect.left}px`;
    this.content.style.top = `${rect.top}px`;
    this.content.classList.remove('morphing');

    // Show overlay
    this.overlay?.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Trigger morphing animation after a frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Calculate center position
        const finalWidth = window.innerWidth <= 480 ? 186 : 248; // 2 cards + gap
        const finalHeight = window.innerWidth <= 480 ? 135 : 180;

        const centerX = (window.innerWidth - finalWidth) / 2;
        const centerY = (window.innerHeight - finalHeight) / 2;

        this.content.style.left = `${centerX}px`;
        this.content.style.top = `${centerY}px`;
        this.content.classList.add('morphing');
      });
    });

    // Start updating digits
    this.updateInterval = setInterval(() => {
      this.updateDigits(ids);
    }, 100);
  },

  updateDigits(ids) {
    const el1 = document.getElementById(ids[0]);
    const el2 = document.getElementById(ids[1]);

    if (el1 && el2) {
      const val1 = el1.querySelector('.flip-card-front span')?.textContent || '0';
      const val2 = el2.querySelector('.flip-card-front span')?.textContent || '0';

      if (this.digit1) this.digit1.textContent = val1;
      if (this.digit2) this.digit2.textContent = val2;
    }
  },

  hide() {
    // Reverse morphing - go back to source position
    if (this.sourceRect && this.content) {
      this.content.style.left = `${this.sourceRect.left}px`;
      this.content.style.top = `${this.sourceRect.top}px`;
      this.content.classList.remove('morphing');
    }

    this.overlay?.classList.remove('active');
    document.body.style.overflow = '';

    // Stop updating
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
};

// Slider Module - 슬라이드 전환
const Slider = {
  wrapper: null,
  dots: null,
  currentSlide: 0,
  startX: 0,
  isDragging: false,

  init() {
    this.wrapper = document.getElementById('sliderWrapper');
    this.dots = document.querySelectorAll('.slider-dot');

    // Dot navigation
    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => this.goToSlide(index));
    });

    // Touch/swipe support
    this.wrapper?.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
    this.wrapper?.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: true });
    this.wrapper?.addEventListener('touchend', () => this.handleTouchEnd());

    // Mouse drag support
    this.wrapper?.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.wrapper?.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.wrapper?.addEventListener('mouseup', () => this.handleMouseUp());
    this.wrapper?.addEventListener('mouseleave', () => this.handleMouseUp());

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.prev();
      if (e.key === 'ArrowRight') this.next();
    });
  },

  goToSlide(index) {
    this.currentSlide = index;
    this.wrapper.style.transform = `translateX(-${index * 100}vw)`;

    // Update dots
    this.dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  },

  next() {
    if (this.currentSlide < 1) {
      this.goToSlide(this.currentSlide + 1);
    }
  },

  prev() {
    if (this.currentSlide > 0) {
      this.goToSlide(this.currentSlide - 1);
    }
  },

  handleTouchStart(e) {
    this.startX = e.touches[0].clientX;
    this.isDragging = true;
  },

  handleTouchMove(e) {
    if (!this.isDragging) return;
    const diff = this.startX - e.touches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) this.next();
      else this.prev();
      this.isDragging = false;
    }
  },

  handleTouchEnd() {
    this.isDragging = false;
  },

  handleMouseDown(e) {
    this.startX = e.clientX;
    this.isDragging = true;
    this.wrapper.style.cursor = 'grabbing';
  },

  handleMouseMove(e) {
    if (!this.isDragging) return;
    const diff = this.startX - e.clientX;
    if (Math.abs(diff) > 100) {
      if (diff > 0) this.next();
      else this.prev();
      this.isDragging = false;
    }
  },

  handleMouseUp() {
    this.isDragging = false;
    if (this.wrapper) this.wrapper.style.cursor = '';
  }
};

// Initialize everything on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  Clock.init();
  Pomodoro.init();
  ClockZoom.init();
  Slider.init();

  // Listen for locale changes
  window.addEventListener('localeChanged', () => {
    Clock.update();
    Pomodoro.updateMode();
    // Update button texts if not running
    if (!Pomodoro.state.isRunning) {
      document.getElementById('startBtn').textContent = i18n.t('start');
    }
    document.getElementById('pauseBtn').textContent = i18n.t('pause');
    document.getElementById('resetBtn').textContent = i18n.t('reset');
  });
});

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registered'))
      .catch(err => console.log('SW registration failed:', err));
  });
}
