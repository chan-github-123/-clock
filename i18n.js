// Internationalization Module
const i18n = {
  locales: {
    ko: {
      // Date
      days: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
      dateFormat: (y, m, d, day) => `${y}년 ${m}월 ${d}일 ${day}`,
      defaultTimeFormat: '24h',

      // Pomodoro
      work: '작업',
      break: '휴식',
      start: '시작',
      pause: '일시정지',
      reset: '리셋',
      continue: '계속',

      // Settings
      settings: '설정',
      timeFormat: '시간 형식',
      hour12: '12시간',
      hour24: '24시간',
      workTime: '작업 시간 (분)',
      breakTime: '휴식 시간 (분)',
      sound: '알림음',
      language: '언어',
      close: '닫기',
      openSettings: '설정 열기',
      guide: '사용 가이드',
      privacy: '개인정보처리방침',

      // Content
      contentTitle: '플립 시계 & 뽀모도로 타이머',
      contentDesc: '아름다운 플립 애니메이션 시계와 뽀모도로 기법을 활용한 집중력 향상 타이머입니다. 시간을 클릭하면 크게 볼 수 있고, 좌우로 스와이프하면 뽀모도로 타이머로 전환됩니다.',
      feature1: '실시간 플립 애니메이션',
      feature2: '뽀모도로 타이머 (25분 작업 / 5분 휴식)',
      feature3: '한국어 / English 지원',
      pomodoroTitle: '뽀모도로 기법이란?',
      pomodoroDesc: '뽀모도로 기법은 25분 집중 작업 후 5분 휴식을 반복하는 시간 관리 방법입니다. 이탈리아어로 "토마토"를 뜻하며, 토마토 모양 타이머에서 유래했습니다.',
      step1: '25분 동안 집중해서 작업하기',
      step2: '5분 동안 짧은 휴식 취하기',
      step3: '4회 반복 후 15-30분 긴 휴식'
    },
    en: {
      // Date
      days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      dateFormat: (y, m, d, day, months) => `${day}, ${months[m-1]} ${d}, ${y}`,
      defaultTimeFormat: '12h',

      // Pomodoro
      work: 'Work',
      break: 'Break',
      start: 'Start',
      pause: 'Pause',
      reset: 'Reset',
      continue: 'Continue',

      // Settings
      settings: 'Settings',
      timeFormat: 'Time Format',
      hour12: '12 Hour',
      hour24: '24 Hour',
      workTime: 'Work Time (min)',
      breakTime: 'Break Time (min)',
      sound: 'Sound',
      language: 'Language',
      close: 'Close',
      openSettings: 'Open Settings',
      guide: 'User Guide',
      privacy: 'Privacy Policy',

      // Content
      contentTitle: 'Flip Clock & Pomodoro Timer',
      contentDesc: 'A beautiful flip animation clock with Pomodoro timer for better focus and productivity. Click on the time to zoom in, swipe left/right to switch to Pomodoro timer.',
      feature1: 'Real-time flip animation',
      feature2: 'Pomodoro timer (25min work / 5min break)',
      feature3: 'Korean / English support',
      pomodoroTitle: 'What is Pomodoro Technique?',
      pomodoroDesc: 'The Pomodoro Technique is a time management method that uses 25-minute focused work sessions followed by 5-minute breaks. The name comes from the Italian word for "tomato", inspired by tomato-shaped kitchen timers.',
      step1: 'Focus on work for 25 minutes',
      step2: 'Take a short 5-minute break',
      step3: 'After 4 cycles, take a 15-30 min long break'
    }
  },

  currentLocale: 'ko',

  init(locale) {
    this.currentLocale = locale || 'ko';
  },

  t(key) {
    return this.locales[this.currentLocale]?.[key] || this.locales['ko'][key] || key;
  },

  formatDate(date) {
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const dayName = this.t('days')[date.getDay()];
    const months = this.locales[this.currentLocale].months;
    return this.locales[this.currentLocale].dateFormat(y, m, d, dayName, months);
  },

  getDefaultTimeFormat() {
    return this.locales[this.currentLocale]?.defaultTimeFormat || '24h';
  },

  setLocale(locale) {
    this.currentLocale = locale;

    // Update time format to match locale default
    const newTimeFormat = this.getDefaultTimeFormat();
    Settings.update('timeFormat', newTimeFormat);

    // Update UI elements for time format
    const formatToggle = document.getElementById('formatToggle');
    if (formatToggle) formatToggle.textContent = newTimeFormat;

    document.querySelectorAll('input[name="timeFormat"]').forEach(radio => {
      radio.checked = radio.value === newTimeFormat;
    });

    this.updateUI();
  },

  updateUI() {
    // Update HTML lang attribute
    document.documentElement.lang = this.currentLocale;

    // Update static texts
    const updates = {
      '#settingsBtn': { attr: 'aria-label', value: this.t('openSettings') },
      '.modal-header h2': { text: this.t('settings') },
      '#modalClose': { attr: 'aria-label', value: this.t('close') },
      'label[for="workTime"]': { text: this.t('workTime') },
      'label[for="breakTime"]': { text: this.t('breakTime') },
      'label[for="soundToggle"]': { text: this.t('sound') },
      'label[for="languageSelect"]': { text: this.t('language') }
    };

    // Time format labels
    const formatLabel = document.querySelector('.setting-item:first-child > label');
    if (formatLabel) formatLabel.textContent = this.t('timeFormat');

    const radio12 = document.querySelector('input[value="12h"]')?.parentElement;
    const radio24 = document.querySelector('input[value="24h"]')?.parentElement;
    if (radio12) radio12.lastChild.textContent = ' ' + this.t('hour12');
    if (radio24) radio24.lastChild.textContent = ' ' + this.t('hour24');

    // Labels
    document.querySelectorAll('.setting-item').forEach(item => {
      const label = item.querySelector('label:first-child');
      const input = item.querySelector('input, select');
      if (label && input) {
        const id = input.id;
        if (id === 'workTime') label.textContent = this.t('workTime');
        if (id === 'breakTime') label.textContent = this.t('breakTime');
        if (id === 'soundToggle') label.textContent = this.t('sound');
        if (id === 'languageSelect') label.textContent = this.t('language');
      }
    });

    // Modal header
    const modalHeader = document.querySelector('.modal-header h2');
    if (modalHeader) modalHeader.textContent = this.t('settings');

    // Buttons (only if not running)
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resetBtn = document.getElementById('resetBtn');

    if (startBtn && !startBtn.disabled) {
      startBtn.textContent = this.t('start');
    }
    if (pauseBtn) pauseBtn.textContent = this.t('pause');
    if (resetBtn) resetBtn.textContent = this.t('reset');

    // Footer links
    const guideLink = document.getElementById('guideLink');
    const privacyLink = document.getElementById('privacyLink');
    if (guideLink) guideLink.textContent = this.t('guide');
    if (privacyLink) privacyLink.textContent = this.t('privacy');

    // Content sections
    const contentTitle = document.getElementById('contentTitle');
    const contentDesc = document.getElementById('contentDesc');
    const feature1 = document.getElementById('feature1');
    const feature2 = document.getElementById('feature2');
    const feature3 = document.getElementById('feature3');
    const pomodoroTitle = document.getElementById('pomodoroTitle');
    const pomodoroDesc = document.getElementById('pomodoroDesc');
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');

    if (contentTitle) contentTitle.textContent = this.t('contentTitle');
    if (contentDesc) contentDesc.textContent = this.t('contentDesc');
    if (feature1) feature1.textContent = this.t('feature1');
    if (feature2) feature2.textContent = this.t('feature2');
    if (feature3) feature3.textContent = this.t('feature3');
    if (pomodoroTitle) pomodoroTitle.textContent = this.t('pomodoroTitle');
    if (pomodoroDesc) pomodoroDesc.textContent = this.t('pomodoroDesc');
    if (step1) step1.textContent = this.t('step1');
    if (step2) step2.textContent = this.t('step2');
    if (step3) step3.textContent = this.t('step3');

    // Dispatch event for other modules
    window.dispatchEvent(new CustomEvent('localeChanged', {
      detail: { locale: this.currentLocale }
    }));
  }
};
