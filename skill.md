# Clock - 기술 스택 및 구현 가이드

## 기술 스택
- **순수 HTML5/CSS3/ES6+** (외부 라이브러리 없음)
- **PWA** (Progressive Web App)
- **Service Worker** (오프라인 캐싱)
- **Web Audio API** (알림음)
- **localStorage** (설정 저장)

## 핵심 구현 패턴

### 플립 시계 애니메이션
```css
/* 3D 플립 효과 */
.flip-card {
  perspective: 300px;
  transform-style: preserve-3d;
}
.flip-card.flip .top {
  transform: rotateX(-90deg);
}
```

### 뽀모도로 SVG 원형 진행바
```html
<svg viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="45"
          stroke-dasharray="283"
          stroke-dashoffset="0"/>
</svg>
```
- `stroke-dashoffset` 값을 조절하여 진행률 표시

### 설정 저장 (localStorage)
```javascript
const settings = {
  timeFormat: '24h', // '12h' | '24h'
  workTime: 25,      // 분
  breakTime: 5,      // 분
  soundEnabled: true
};
localStorage.setItem('clockSettings', JSON.stringify(settings));
```

### Web Audio API 알림음
```javascript
const ctx = new AudioContext();
const osc = ctx.createOscillator();
osc.frequency.value = 800; // Hz
osc.connect(ctx.destination);
osc.start();
```

### Service Worker 캐싱
```javascript
const CACHE_NAME = 'clock-v1';
const FILES = ['/', '/index.html', '/style.css', '/app.js'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(FILES)));
});
```

## 주요 함수

### app.js
- `updateClock()` - 매초 시계 업데이트
- `flipDigit(el, value)` - 플립 애니메이션 트리거
- `startPomodoro()` - 타이머 시작
- `pausePomodoro()` - 타이머 일시정지
- `resetPomodoro()` - 타이머 리셋

### settings.js
- `loadSettings()` - localStorage에서 설정 로드
- `saveSettings()` - 설정 저장
- `openSettingsModal()` - 설정 모달 열기

### audio.js
- `playAlarm()` - 알림음 재생
- `stopAlarm()` - 알림음 중지
