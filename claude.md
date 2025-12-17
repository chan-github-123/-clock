# Clock - 프로젝트 컨텍스트

## 프로젝트 개요
오프라인에서도 동작하는 미니멀 인터넷 시계 + 뽀모도로 타이머 PWA

## 주요 기능
- 플립 시계 (CSS 3D 애니메이션)
- 12시간/24시간 형식 선택
- 한국어 날짜 표시
- 뽀모도로 타이머 (커스텀 시간 설정)
- 알림음 켜기/끄기
- PWA 오프라인 지원

## 파일 구조
```
/home/cc00001/project/clock/
├── index.html      # 메인 HTML
├── style.css       # 스타일시트
├── app.js          # 메인 로직
├── settings.js     # 설정 관리 (localStorage)
├── audio.js        # 알림음 (Web Audio API)
├── manifest.json   # PWA 매니페스트
├── sw.js           # Service Worker
├── claude.md       # 이 파일
├── skill.md        # 기술 가이드
└── icons/          # PWA 아이콘
```

## 디자인
- 배경: #F5F5F0 (아이보리)
- 플립 카드: #1A1A1A (다크)
- 뽀모도로: #E63946 (빨강)

## 현재 상태
- [x] 프로젝트 초기화
- [x] 플립 시계 구현 (CSS 3D flip animation)
- [x] 뽀모도로 타이머 구현 (SVG 원형 진행바)
- [x] 설정 기능 구현 (localStorage)
- [x] PWA 설정 (Service Worker, manifest)

## 실행 방법
```bash
cd /home/cc00001/project/clock
python3 -m http.server 8080
```

## 설정 옵션
- 시간 형식: 12시간/24시간 선택
- 뽀모도로 작업 시간: 1-120분
- 뽀모도로 휴식 시간: 1-60분
- 알림음: 켜기/끄기

## 브라우저 지원
- Chrome, Edge, Firefox, Safari (최신 버전)
- PWA 설치 지원
