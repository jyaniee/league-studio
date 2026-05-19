# Riot API 정리

## 1. 우리 프로젝트에서 Riot API를 보는 이유

LeagueStudio는 LoL 경기 정보를 OBS 오버레이에 표시하는 프로젝트.

따라서 Riot API는 다음 목적을 위해 검토.

* 실시간 경기 정보 확인
* 챔피언/아이템/스펠 이미지 표시
* 경기 종료 후 결과 데이터 확인
* 선수/소환사 정보 조회

---

## 2. 우선순위 높은 API

### 1) Live Client Data API

우리 프로젝트에서 가장 중요.

현재 실행 중인 LoL 클라이언트의 게임 정보를 로컬에서 가져오는 API.

#### 용도

* 현재 게임 시간
* 블루팀/레드팀 정보
* 챔피언 정보
* 킬/데스/어시스트
* CS
* 아이템
* 스펠
* 룬
* 이벤트 정보

#### 특징

* API Key 필요 없음
* 게임이 실행 중인 PC에서만 사용 가능
* 로컬 주소로 접근
* OBS 오버레이와 연동하기 좋음

#### 예상 활용

* 인게임 오버레이
* 스코어보드
* 선수 KDA
* 아이템 표시
* 오브젝트 처치 이벤트 표시

---

### 2) Data Dragon

챔피언, 아이템, 스펠, 룬 등의 정적 데이터를 가져오는 API.

#### 용도

* 챔피언 이름
* 챔피언 이미지
* 아이템 이미지
* 스펠 이미지
* 룬 이미지
* 버전별 게임 데이터

#### 필요한 이유

Live Client API에서 championId, itemId 같은 값만 받을 경우
Data Dragon을 이용해 실제 이미지와 이름으로 변환함.

#### 예상 활용

* 챔피언 초상화 표시
* 아이템 아이콘 표시
* 소환사 주문 아이콘 표시
* UI 리소스 구성

---

## 3. 선택적으로 사용할 API

### 1) Match-V5

경기 종료 후 매치 기록을 조회하는 API.

#### 용도

* 경기 결과
* 팀별 승패
* 플레이어별 최종 KDA
* 딜량
* 골드
* 아이템
* 오브젝트 기록
* 타임라인 데이터

#### 예상 활용

* 포스트 게임 화면
* 경기 결과 화면
* MVP/통계 화면

---

### 2) Spectator-V5

현재 진행 중인 게임 정보를 조회하는 API.

#### 용도

* 특정 소환사가 현재 게임 중인지 확인
* 참가자 정보 확인
* 밴 정보 확인
* 게임 모드 확인

#### 주의

공식 대회 옵저버 화면처럼 실시간 세부 데이터를 제공하지 않음.

→ 화면 구성 핵심 API가 아니라 보조용 API에 가까움.

---

### 3) Account-V1 / Summoner-V4

유저 계정 정보를 조회하는 API.

#### 용도

* Riot ID → PUUID 조회
* 소환사 정보 조회
* 프로필 아이콘 조회

#### 예상 활용

* 선수 정보 관리
* 소환사 기반 검색
* Match API 사용 전 PUUID 확보

---

## 4. 우리 프로젝트 기준 API 우선순위

1. Live Client Data API
2. Data Dragon
3. Match-V5
4. Spectator-V5
5. Account-V1 / Summoner-V4

---

## 5. Tournament API 정리

`tournament-v5`, `tournament-stub-v5`는 오버레이 화면 구성과 직접적인 관련이 적음.

#### 특징

* 커스텀 게임 로비 생성
* 토너먼트 코드 생성
* 플레이어 입장 제어

#### 결론

* 오버레이 UI용 API 아님
* 실시간 경기 데이터용 API 아님
* 토너먼트 운영용 API

---

## 6. 현재 결론

현재 프로젝트에서 먼저 집중해야 할 부분:

* Live Client Data API로 게임 데이터 가져오기
* Data Dragon으로 이미지/이름 매핑
* 서버에서 WebSocket으로 데이터 전달
* overlay에서 화면 렌더링

---

## 7. 전체 데이터 흐름

LoL 클라이언트
↓
Live Client Data API
↓
server
↓
WebSocket
↓
overlay
↓
OBS Browser Source

---

## 8. 다음 단계

* Live Client API 엔드포인트 정리
* 실제 응답 JSON 구조 분석
* 필요한 데이터만 추출하는 로직 설계
* shared-types에 타입 정의
* overlay UI에 연결
