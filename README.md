# 자소설 공고 기반 블로그 글 발행 시스템 (Next.js 버전)

## 프로젝트 개요
이 프로젝트는 **자소설 사이트(https://jasoseol.com/)**의 공고 데이터를 수집하고, **네이버 블로그**의 
메인 화면에서 공고 데이터를 수집하고, 조회수(`view_count`)와 지원자 이력 수(`resume_count`) 기준을 만족하는 공고를 자동으로 선별하여 **ChatGPT API**를 활용해 네이버 블로그에 비공개 글로 발행하는 시스템입니다.  
이 시스템은 Next.js를 활용하여 프론트엔드와 백엔드를 통합하여 구축됩니다.

---

## 주요 기능
1. **데이터 수집**:
   - Next.js API Routes를 통해 주기적으로 API로 자소설 사이트에서 공고 데이터를 수집.
2. **조건 필터링**:
   - `view_count`와 `resume_count`가 100 이상인 공고만 처리.
3. **중복 처리 방지**:
   - 데이터베이스에 저장된 기존 공고와 비교하여 중복 발행 방지.
4. **ChatGPT API 통합**:
   - 공고 데이터를 기반으로 블로그 글 생성.
5. **네이버 블로그 API 통합**:
   - 생성된 글을 네이버 블로그에 비공개로 발행.
6. **프론트엔드 인터페이스**:
   - 관리자가 공고 데이터를 확인하고 수동으로 블로그 글을 검토 및 관리.

---

## 기술 스택
### **프론트엔드 및 백엔드**
- **프레임워크**: Next.js (React 기반)
- **상태 관리**: React Context 또는 Zustand
- **데이터 Fetching**: Next.js API Routes
- **스타일링**: Tailwind CSS

### **데이터 관리**
- **DBMS**: MySQL (InnoDB)
- **ORM**: Prisma

### **외부 API**
- **OpenAI API**: ChatGPT를 활용해 블로그 글 생성.
- **네이버 블로그 API**: 블로그 글 발행.

### **배포 및 운영**
- **호스팅**: Vercel (프론트엔드 및 서버 API 호스팅)
- **로그 관리**: Winston 또는 Sentry

---

## 데이터베이스 설계
**테이블 이름**: `job_postings`

| 컬럼 이름       | 타입           | 설명                     |
|----------------|---------------|------------------------|
| `id`           | BIGINT        | 기본 키 (Auto Increment) |
| `job_id`       | VARCHAR(255)  | 공고 ID (중복 방지)       |
| `company_name` | VARCHAR(255)  | 회사 이름                |
| `view_count`   | INT           | 조회수                   |
| `resume_count` | INT           | 이력서 수                |
| `created_at`   | DATETIME      | 등록일                  |
| `updated_at`   | DATETIME      | 수정일                  |

---

## 주요 흐름
### 1. 데이터 수집
- **Next.js API Routes**를 사용하여 주기적으로 자소설 사이트에서 데이터를 수집:
  - HTTP 클라이언트(`axios`)와 HTML 파싱(`cheerio`)를 통해 데이터 추출.
  - 결과를 데이터베이스에 저장.

### 2. 조건 필터링 및 처리
- API 요청을 통해 `view_count`와 `resume_count` 조건(`≥ 100`)을 만족하는 공고만 반환.
- 조건을 만족하는 공고를 ChatGPT API를 통해 블로그 글로 작성.

### 3. 블로그 글 발행
- **네이버 블로그 API**를 사용해 작성된 글을 비공개로 발행.
- 발행된 공고 ID는 데이터베이스에 저장하여 중복 처리 방지.

---

## 설치 및 실행
### 1. 프로젝트 클론
```bash
git clone https://github.com/ymJung/job-posting-blog-project.git
cd job-posting-blog-project
```

### 2. 의존성 설치
```bash
npm install
# or
yarn install
```

### 3. 환경 변수 설정
`.env.local` 파일을 프로젝트 루트에 생성하고 다음 변수들을 설정:

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/job_posting_db"

# OpenAI API
OPENAI_API_KEY="your-openai-api-key"

# Naver Blog API
NAVER_CLIENT_ID="your-naver-client-id"
NAVER_CLIENT_SECRET="your-naver-client-secret"
NAVER_ACCESS_TOKEN="your-naver-access-token"
NAVER_BLOG_ID="your-naver-blog-id"
```

### 4. 데이터베이스 설정
```bash
# Prisma 마이그레이션 실행
npx prisma migrate dev
```

### 5. 개발 서버 실행
```bash
npm run dev
# or
yarn dev
```

서버가 시작되면 `http://localhost:3000`에서 접속 가능합니다.

---

## 개발 가이드

### API 엔드포인트

#### 1. 공고 데이터 수집
- **엔드포인트**: `/api/jobs/collect`
- **메서드**: POST
- **설명**: 자소설 사이트에서 새로운 공고 데이터를 수집

#### 2. 공고 목록 조회
- **엔드포인트**: `/api/jobs`
- **메서드**: GET
- **쿼리 파라미터**:
  - `page`: 페이지 번호 (기본값: 1)
  - `limit`: 페이지당 항목 수 (기본값: 10)

#### 3. 블로그 글 생성
- **엔드포인트**: `/api/blog/post`
- **메서드**: POST
- **요청 본문**:
  ```json
  {
    "jobId": "string",
    "isDraft": boolean
  }
  ```

### 컴포넌트 구조
```
src/
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Layout.tsx
│   ├── job/
│   │   ├── JobList.tsx
│   │   └── JobCard.tsx
│   └── blog/
│       ├── PostEditor.tsx
│       └── PostPreview.tsx
├── pages/
│   ├── api/
│   ├── jobs/
│   └── blog/
└── lib/
    ├── prisma.ts
    ├── openai.ts
    └── naver.ts
```

---

## 라이선스
MIT License

## 기여하기
1. 이 저장소를 포크합니다
2. 새로운 브랜치를 생성합니다
3. 변경사항을 커밋합니다
4. 브랜치에 푸시합니다
5. Pull Request를 생성합니다
