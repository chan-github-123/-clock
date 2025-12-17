// Embed Clock - URL Parameter Handler
(function() {
  // Parse URL parameters
  const params = new URLSearchParams(window.location.search);

  const config = {
    theme: params.get('theme') || '0',      // 0: light, 1: dark
    ampm: params.get('ampm') || '0',        // 0: 24h, 1: 12h
    showdate: params.get('showdate') || '1', // 0: hide, 1: show
    showseconds: params.get('showseconds') || '1', // 0: hide, 1: show
    size: params.get('size') || 'medium'    // small, medium, large
  };

  // Apply theme
  if (config.theme === '1') {
    document.body.classList.add('dark');
  }

  // Apply size
  if (config.size !== 'medium') {
    document.body.classList.add(config.size);
  }

  // DOM elements
  const dateEl = document.getElementById('date');
  const ampmEl = document.getElementById('ampm');
  const secondsColon = document.querySelector('.seconds-colon');
  const secondsGroup = document.querySelector('.seconds-group');

  // Hide date if needed
  if (config.showdate === '0') {
    dateEl.classList.add('hidden');
  }

  // Hide seconds if needed
  if (config.showseconds === '0') {
    secondsColon.classList.add('hidden');
    secondsGroup.classList.add('hidden');
  }

  // Hide ampm if 24h format
  if (config.ampm === '0') {
    ampmEl.classList.add('hidden');
  }

  // Previous values for flip animation
  let prevValues = {
    hour1: '', hour2: '',
    min1: '', min2: '',
    sec1: '', sec2: ''
  };

  // Update digit with flip animation
  function updateDigit(id, value) {
    const card = document.getElementById(id);
    if (!card) return;

    const front = card.querySelector('.flip-card-front span');
    const back = card.querySelector('.flip-card-back span');

    if (prevValues[id] !== value) {
      back.textContent = value;
      card.classList.add('flip');

      setTimeout(() => {
        front.textContent = value;
        card.classList.remove('flip');
      }, 300);

      prevValues[id] = value;
    }
  }

  // Format date
  function formatDate(date) {
    const lang = navigator.language.startsWith('ko') ? 'ko' : 'en';
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    return date.toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US', options);
  }

  // Update clock
  function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // Update date
    if (config.showdate === '1') {
      dateEl.textContent = formatDate(now);
    }

    // Handle 12h format
    if (config.ampm === '1') {
      const isPM = hours >= 12;
      ampmEl.textContent = isPM ? 'PM' : 'AM';
      hours = hours % 12 || 12;
    }

    // Format time strings
    const h = String(hours).padStart(2, '0');
    const m = String(minutes).padStart(2, '0');
    const s = String(seconds).padStart(2, '0');

    // Update digits
    updateDigit('hour1', h[0]);
    updateDigit('hour2', h[1]);
    updateDigit('min1', m[0]);
    updateDigit('min2', m[1]);

    if (config.showseconds === '1') {
      updateDigit('sec1', s[0]);
      updateDigit('sec2', s[1]);
    }
  }

  // Initialize
  function init() {
    // Set initial values without animation
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    if (config.ampm === '1') {
      hours = hours % 12 || 12;
    }

    const h = String(hours).padStart(2, '0');
    const m = String(minutes).padStart(2, '0');
    const s = String(seconds).padStart(2, '0');

    ['hour1', 'hour2', 'min1', 'min2', 'sec1', 'sec2'].forEach(id => {
      const card = document.getElementById(id);
      if (card) {
        const front = card.querySelector('.flip-card-front span');
        let value;
        if (id === 'hour1') value = h[0];
        else if (id === 'hour2') value = h[1];
        else if (id === 'min1') value = m[0];
        else if (id === 'min2') value = m[1];
        else if (id === 'sec1') value = s[0];
        else if (id === 'sec2') value = s[1];

        front.textContent = value;
        prevValues[id] = value;
      }
    });

    // Update date
    if (config.showdate === '1') {
      dateEl.textContent = formatDate(now);
    }

    // Update AM/PM
    if (config.ampm === '1') {
      const isPM = now.getHours() >= 12;
      ampmEl.textContent = isPM ? 'PM' : 'AM';
    }

    // Start clock
    updateClock();
    setInterval(updateClock, 1000);
  }

  // Start when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
