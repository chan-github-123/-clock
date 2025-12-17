// Settings Management
const Settings = {
  defaults: {
    timeFormat: '24h',
    workTime: 25,
    breakTime: 5,
    soundEnabled: true,
    workLabel: '',
    breakLabel: '',
    language: 'ko'
  },

  current: null,

  load() {
    try {
      const saved = localStorage.getItem('clockSettings');
      this.current = saved ? { ...this.defaults, ...JSON.parse(saved) } : { ...this.defaults };
    } catch (e) {
      this.current = { ...this.defaults };
    }
    this.applyToUI();
    return this.current;
  },

  save() {
    try {
      localStorage.setItem('clockSettings', JSON.stringify(this.current));
    } catch (e) {
      console.warn('설정 저장 실패:', e);
    }
  },

  applyToUI() {
    // Time format radio
    const formatRadios = document.querySelectorAll('input[name="timeFormat"]');
    formatRadios.forEach(radio => {
      radio.checked = radio.value === this.current.timeFormat;
    });

    // Work/Break time inputs
    const workTimeInput = document.getElementById('workTime');
    const breakTimeInput = document.getElementById('breakTime');
    if (workTimeInput) workTimeInput.value = this.current.workTime;
    if (breakTimeInput) breakTimeInput.value = this.current.breakTime;

    // Sound toggle
    const soundToggle = document.getElementById('soundToggle');
    if (soundToggle) soundToggle.checked = this.current.soundEnabled;

    // Format toggle button
    const formatToggle = document.getElementById('formatToggle');
    if (formatToggle) formatToggle.textContent = this.current.timeFormat === '24h' ? '24h' : '12h';

    // Language select
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) languageSelect.value = this.current.language;

    // Initialize i18n
    if (typeof i18n !== 'undefined') {
      i18n.init(this.current.language);
      i18n.updateUI();
    }
  },

  update(key, value) {
    this.current[key] = value;
    this.save();

    // Dispatch event for other modules
    window.dispatchEvent(new CustomEvent('settingsChanged', {
      detail: { key, value, settings: this.current }
    }));
  },

  get(key) {
    return this.current ? this.current[key] : this.defaults[key];
  }
};

// Modal Management
const Modal = {
  overlay: null,

  init() {
    this.overlay = document.getElementById('modalOverlay');

    // Open button
    document.getElementById('settingsBtn')?.addEventListener('click', () => this.open());

    // Close button
    document.getElementById('modalClose')?.addEventListener('click', () => this.close());

    // Click outside to close
    this.overlay?.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.overlay?.classList.contains('active')) {
        this.close();
      }
    });

    // Setting change handlers
    this.bindInputs();
  },

  bindInputs() {
    // Time format radios
    document.querySelectorAll('input[name="timeFormat"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        Settings.update('timeFormat', e.target.value);
        document.getElementById('formatToggle').textContent = e.target.value === '24h' ? '24h' : '12h';
      });
    });

    // Work time
    document.getElementById('workTime')?.addEventListener('change', (e) => {
      const value = Math.min(120, Math.max(1, parseInt(e.target.value) || 25));
      e.target.value = value;
      Settings.update('workTime', value);
    });

    // Break time
    document.getElementById('breakTime')?.addEventListener('change', (e) => {
      const value = Math.min(60, Math.max(1, parseInt(e.target.value) || 5));
      e.target.value = value;
      Settings.update('breakTime', value);
    });

    // Sound toggle
    document.getElementById('soundToggle')?.addEventListener('change', (e) => {
      Settings.update('soundEnabled', e.target.checked);
    });

    // Language select
    document.getElementById('languageSelect')?.addEventListener('change', (e) => {
      Settings.update('language', e.target.value);
      i18n.setLocale(e.target.value);
    });
  },

  open() {
    this.overlay?.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  close() {
    this.overlay?.classList.remove('active');
    document.body.style.overflow = '';
  }
};

// Quick format toggle
document.getElementById('formatToggle')?.addEventListener('click', () => {
  const newFormat = Settings.get('timeFormat') === '24h' ? '12h' : '24h';
  Settings.update('timeFormat', newFormat);
  document.getElementById('formatToggle').textContent = newFormat === '24h' ? '24h' : '12h';

  // Update radio buttons
  document.querySelectorAll('input[name="timeFormat"]').forEach(radio => {
    radio.checked = radio.value === newFormat;
  });
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  Settings.load();
  Modal.init();
});
