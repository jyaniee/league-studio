# Windows 배포 가이드

League Studio의 Windows 배포본은 Node.js Single Executable Application(SEA)을 기반으로 생성합니다.

이 문서는 **개발자가 배포용 실행 파일과 ZIP 파일을 생성하기 위한 절차**를 설명합니다.

최종 사용자는 이 과정을 수행할 필요가 없으며, GitHub Releases에 등록된 배포본을 사용합니다.

---

## 요구 사항

Windows 환경에서 다음 도구가 필요합니다.

- Node.js 24
- pnpm
- 인터넷 연결

인터넷 연결은 패키징 과정에서 현재 사용 중인 Node.js 버전의 공식 라이선스 정보를 가져오는 데 사용됩니다.

의존성이 설치되어 있지 않다면 저장소 루트에서 먼저 실행합니다.

```cmd
pnpm install
```

---

## 배포본 생성

저장소 루트에서 다음 명령을 실행합니다.

```cmd
pnpm package:windows
```

패키징 스크립트는 다음 작업을 순서대로 수행합니다.

1. Overlay 최신 빌드
2. Server 및 production 의존성 번들링
3. Node.js SEA 데이터 생성
4. `LeagueStudioServer.exe` 생성
5. League Studio 아이콘 및 Windows 실행 파일 메타데이터 적용
6. 배포용 `.env` 및 `README.txt` 생성
7. Node.js 및 production 의존성의 오픈소스 라이선스 고지 생성
8. ZIP 배포본 생성

---

## 생성 결과

배포 결과물은 현재 Windows 사용자의 `Documents` 폴더에 생성됩니다.

```text
LeagueStudio-v<version>-win-<arch>/
├─ .env
├─ LeagueStudioServer.exe
├─ README.txt
└─ THIRD_PARTY_NOTICES.txt

LeagueStudio-v<version>-win-<arch>.zip
```

예:

```text
LeagueStudio-v0.1.0-win-x64/
LeagueStudio-v0.1.0-win-x64.zip
```

동일한 버전과 아키텍처의 기존 결과물이 존재하면 패키징 과정에서 제거한 뒤 새로 생성합니다.

애플리케이션 버전은 저장소 루트의 `package.json`에 정의된 `version` 값을 사용합니다.

---

## 배포 설정

배포본의 `.env`는 다음 파일을 기반으로 생성됩니다.

```text
apps/server/.env.distribution
```

개인 개발 환경에서 사용하는:

```text
apps/server/.env
```

와는 별도로 관리합니다.

배포용 기본 설정을 변경해야 하는 경우 `.env.distribution`을 수정합니다.

---

## 실행 파일

`LeagueStudioServer.exe`에는 다음 항목이 포함됩니다.

- Node.js 런타임
- League Studio Server 코드
- production 의존성
- 빌드된 Overlay 정적 리소스

따라서 최종 사용자의 PC에는 Node.js 또는 pnpm이 설치되어 있을 필요가 없습니다.

Windows 실행 파일에는 다음 정보도 적용됩니다.

- League Studio 아이콘
- 제품 이름
- 파일 설명
- 제품 버전
- 파일 버전
- Team X 정보

---

## 라이선스 고지

패키징 과정에서 다음 파일이 자동으로 생성됩니다.

```text
THIRD_PARTY_NOTICES.txt
```

이 파일에는 다음 항목이 포함됩니다.

- 패키징에 사용된 Node.js 버전의 공식 라이선스
- production 의존성의 라이선스 정보
- 각 패키지에서 확인 가능한 라이선스 원문

Node.js 공식 라이선스는 패키징 시점의 Node.js 버전을 기준으로 가져옵니다.

따라서 라이선스 고지 생성 과정에서는 인터넷 연결이 필요합니다.

---

## 배포 전 확인

GitHub Release에 업로드하기 전에 생성된 ZIP 파일을 별도 위치에 압축 해제하고 다음 항목을 확인합니다.

- `LeagueStudioServer.exe`가 정상 실행되는지
- League Studio 아이콘이 정상적으로 표시되는지
- Windows 파일 속성의 제품명 및 버전 정보가 정상인지
- Overlay가 정상적으로 표시되는지
- `.env` 설정이 정상적으로 적용되는지
- `README.txt`가 포함되어 있는지
- `THIRD_PARTY_NOTICES.txt`가 포함되어 있는지

기본 Overlay 주소:

```text
http://localhost:3000/
```

---

## GitHub Release

최종 사용자에게는 패키징 과정에서 생성된 ZIP 파일을 배포합니다.

```text
LeagueStudio-v<version>-win-<arch>.zip
```

GitHub Release에는 일반적으로 다음 내용을 포함합니다.

- 버전
- 주요 변경사항
- 알려진 문제
- Windows ZIP 배포본

개발자가 사용하는 `pnpm package:windows` 명령이나 Node.js 설치 과정은 최종 사용자에게 필요하지 않습니다.

---

## 개발 환경과의 구분

일반 개발에서는 기존 개발 명령을 사용합니다.

```cmd
pnpm dev:server
```

```cmd
pnpm dev:overlay
```

Windows 배포본 생성이 필요한 경우에만 다음 명령을 사용합니다.

```cmd
pnpm package:windows
```

`package:windows`는 개발 서버 실행 명령을 대체하지 않습니다.