# Customer QR Login — **Vercel 전용 + Supabase** (로컬에서 포트 불필요)

로컬 PC에서 5432/6543 포트를 사용할 수 없어도 됩니다.  
DB 스키마/시드는 **Supabase SQL Editor**에서 실행하고, 애플리케이션은 **Vercel 서버리스**에서만 DB에 접속합니다.

## 1) Supabase SQL Editor로 스키마/시드 적용
- `supabase/01_schema_and_seed.sql` 파일 내용을 **Supabase → SQL Editor**에 붙여넣고 실행

## 2) Vercel 환경변수 설정 (로컬 접속 없이 동작)
Vercel 프로젝트에 아래 2개를 추가하세요.

```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOURPROJECT.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require
APP_SECRET=임의로_길고_랜덤한_문자열
```

> 서버리스에서는 **pooled(6543)** 를 반드시 사용합니다.

## 3) 배포
- GitHub에 푸시 → Vercel에서 가져오기
- `vercel.json` 덕분에 `npm run vercel-build` (Prisma generate → Next build) 수행

## 4) 동작 확인
- 배포 주소에서 `/api/dbcheck` 확인 → `{ status: "ok" }` 이면 정상
- 로그인 페이지에서 SQL로 넣어둔 사용자(예: 홍길동/1234)로 로그인

## 5) 로컬 개발 (선택)
로컬에서는 DB에 접속이 불가하므로 API 호출은 실패할 수 있습니다.  
UI만 개발하려면 mock을 쓰거나 환경변수를 비워둔 채 화면만 띄우세요.

## 주의
- 시드 SQL의 비밀번호 해시는 예시입니다. 실제 운영에선 앱에서 가입/비밀번호 변경 기능을 사용하거나, 별도 스크립트로 안전하게 해시를 생성하세요.
