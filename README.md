# DeepDoc Client

The web front end for [DeepDoc](https://github.com/RoongChakkrin42/deepdoc) — entrants submit a risk-management report for AI grading, reviewers read the results.

It serves the **Chula Risk Management Excellence (RMEx) Award** at Chulalongkorn University: a single report PDF is graded against 5 dimensions and 15 criteria, and this is where people upload it and read what came back.

**Stack:** Next.js 15 (pages router) · TypeScript · MUI 7 · Redux Toolkit · redux-persist · axios

> 🇹🇭 [สรุปภาษาไทยอยู่ท้ายไฟล์](#สรุปภาษาไทย)

---

## Pages

| Route | Auth | Purpose |
| --- | --- | --- |
| `/submit` | public | Upload one report PDF, with the rubric shown as a checklist |
| `/results` | reviewer | A year's results ranked, with per-criterion levels and the source PDF |
| `/` | — | Redirects to `/submit` |

---

## The problems it solves

### The form doesn't own the rubric

Criteria used to be duplicated between this form, the server's controller and its multer config — three copies that had already drifted apart. Now `/submit` fetches `GET /submissions/form-schema` on mount and renders everything from it. Editing `rubric.ts` on the backend changes this page with no commit here.

A submission is one document, so the page has exactly one upload field. But a lone file input tells a submitter nothing about what to write, so the rest of the page is the rubric itself — every criterion, its required evidence, and the concrete checks a grader has to be able to tick off — plus the award-tier thresholds:

```tsx
{schema.dimensions.map((dimension) => (
  <Accordion key={dimension.index}>
    <AccordionSummary>
      มิติที่ {dimension.index}: {dimension.title} <Chip label={`${dimension.weight}%`} />
    </AccordionSummary>
    <AccordionDetails>
      {dimension.criteria.map((criterion) => (
        <Box key={criterion.code}>
          <Typography>{criterion.code} {criterion.title}</Typography>
          <Typography variant="caption">
            หลักฐานที่ต้องแสดง: {criterion.evidenceRequirement}
          </Typography>
          {criterion.checks.map((check) => <li key={check}>{check}</li>)}
        </Box>
      ))}
    </AccordionDetails>
  </Accordion>
))}
```

### A score with no reasoning is not reviewable

The detail view shows each criterion's maturity level, the text the model **quoted out of the report** to justify it, and the rubric checks it could not find. The dimension row shows the arithmetic openly — `83.33/100 × 30% = 25` — and anything odd about the run, such as a level awarded with nothing quoted behind it, surfaces as a warning. A reviewer can disagree with a specific line rather than with a number.

### Grading is asynchronous, so the UI says so

An analysis takes tens of seconds and `POST /submissions` returns `202` immediately. `/results` polls — but only while something is actually in flight, and it stops as soon as everything has settled:

```tsx
const inFlight = submissions.some(
  (item) => item.status === 'pending' || item.status === 'processing',
);
if (!inFlight) return;
pollTimer.current = setTimeout(() => void load(year, false), POLL_INTERVAL_MS);
```

Every row carries a status chip, failures show their reason, and a failed analysis can be re-run from the table without re-uploading anything.

### Sessions used to die on refresh, and the login was fake

An admin username and password were hardcoded in the login dialog — they are gone, and the app now uses the API's real JWT flow. `redux-persist` was a dependency that had never been wired up, so every refresh logged the reviewer out; it now persists the session behind a `PersistGate`, so the login dialog does not flash for someone already authenticated.

`lib/api.ts` is the only module that touches the network. It attaches the bearer token, and on a `401` it spends the refresh token once, replays the request, and clears the session if that fails too. Concurrent 401s share a single in-flight refresh:

```ts
refreshing = refreshing ?? refreshTokens();
const tokens = await refreshing;
```

---

### Nobody outside the university has a report to upload

`/submit` grades one specific artefact: a Thai risk-management report written
against the RMEx criteria. Anyone who is not submitting for a Chula faculty has
nothing to put in the file field, which meant the public demo could not be tried
at all.

So `/submit` opens with three downloadable sample reports
(`SampleDownloads.tsx` → `public/samples/`). Their sources live in
`tools/sample-docs/` and are rendered to PDF by `tools/sample-docs/build.sh`;
they are written from scratch, and every faculty, order number, incident and
figure in them is invented. The real criteria documents the rubric was
transcribed from are **not** shipped here — they carry their authors' names and
a staff member's phone number, and they are the university's material, not ours.

The three differ in how complete their evidence is — full, partial, barely
started — so a visitor who grades all three sees the score and the award tier
move, and sees the per-criterion reasoning explain why, rather than getting one
number with nothing to compare it to.

---

## Getting started

```bash
npm install
cp .env.example .env.local     # point NEXT_PUBLIC_BACKENDURL at your API
npm run dev                    # http://localhost:3000
```

The API from [`deepdoc_server`](https://github.com/RoongChakkrin42/deepdoc) must be running, and this origin must appear in its `CORS_ORIGINS`. `/results` needs a reviewer account — create one with `npm run seed:reviewer` in the API repo.

```bash
npm run build    # production build (also type-checks)
npm run lint
```

### Two build outputs

`npm run build` produces a Node server traced into `.next/standalone`, which is
what the container image ships.

`NEXT_OUTPUT=export npm run build` instead writes plain files to `out/`. Every
page here is client-rendered — the `/` redirect happens in an effect rather than
in `getServerSideProps` — so there is nothing for a server to do at request
time, and a static host can serve the whole frontend. On a free tier that means
no container to spin down, and therefore no cold start in front of a visitor.
Export mode also turns on `trailingSlash`, so Next emits `submit/index.html`
rather than `submit.html` and `/submit` resolves on any host without a
host-specific rewrite rule.

Remember that `NEXT_PUBLIC_BACKENDURL` is fixed at build time either way. Served
same-origin behind an ingress it is `/api`; served from a static host it has to
be the API's absolute URL, and that URL must appear in the API's `CORS_ORIGINS`.

### Deployment

`next.config.ts` sets `output: 'standalone'`, so the image ships a traced
runtime rather than the whole dependency tree. GitHub Actions builds it on every
merge to `main` and pins the tag in
[**deepdoc-gitops**](https://github.com/RoongChakkrin42/deepdoc-gitops), where
ArgoCD rolls it out.

The one thing to know: **`NEXT_PUBLIC_BACKENDURL` is baked in at image build
time**, not read at runtime. The deployed image is built with `/api` and served
behind an ingress that routes `/api` to the API on the same origin — which is
what makes one image valid in every environment, and why the browser never makes
a cross-origin request.

```
src/
  pages/         _app, index (redirect), submit, results
  components/    Layout, LoginDialog, submit/, results/
  lib/           api.ts (network + auth), types.ts (mirrors server payloads)
  store/         Redux Toolkit + redux-persist
```

---

## Notes

- Session tokens live in `localStorage`, readable by any script on the origin. httpOnly cookies would be stricter; this keeps the auth flow readable in one file.
- The reviewer pages gate on the presence of a token, not a role — the API enforces access.
- `src/lib/types.ts` mirrors the server's payloads by hand. Update both together when a response shape changes.
- `npm audit` reports three high advisories in `sharp`, pulled in transitively by `next`. They are **not reachable here** — `sharp` only runs behind `next/image`, which this app does not use. Clearing them requires Next 16, a breaking major.

---

## สรุปภาษาไทย

**DeepDoc Client** คือหน้าเว็บของระบบ DeepDoc สำหรับรางวัล **Chula RMEx Award** ของจุฬาลงกรณ์มหาวิทยาลัย ผู้ส่งใช้อัปโหลดรายงานการบริหารความเสี่ยงเข้ามาให้ AI ตรวจ ส่วนผู้ตรวจใช้ดูผลที่ประเมินแล้ว

**เทคโนโลยี:** Next.js 15 (pages router) · TypeScript · MUI 7 · Redux Toolkit · redux-persist · axios

| หน้า | สิทธิ์ | ใช้ทำอะไร |
| --- | --- | --- |
| `/submit` | ใครก็ได้ | อัปโหลดรายงาน PDF ไฟล์เดียว พร้อมดู checklist เกณฑ์ทั้ง 15 ข้อ |
| `/results` | ผู้ตรวจ | ดูผลรายปี เรียงตามคะแนน พร้อมเปิดไฟล์ต้นฉบับ |

หน้า `/submit` มีปุ่มดาวน์โหลด **รายงานตัวอย่าง 3 ฉบับ** ให้คนที่ไม่มีเอกสารจริงเอาไปลองส่งได้ ทั้งสามฉบับเป็นเอกสารสมมติที่เขียนขึ้นใหม่ทั้งหมด (ต้นฉบับอยู่ใน `tools/sample-docs/`) และมีความครบถ้วนของหลักฐานต่างกัน เพื่อให้เห็นว่าคะแนนกับระดับรางวัลขยับจริง

### ปัญหาหลักที่แก้ และวิธีแก้

**1. เกณฑ์เคยถูกเขียนซ้ำหลายที่** — ชื่อ field และรายการเกณฑ์เคยอยู่ทั้งในฟอร์มนี้ ใน controller และใน multer config ของ server สามชุดที่ไม่ตรงกันแล้ว ตอนนี้หน้า `/submit` ดึงจาก `GET /submissions/form-schema` ตอนโหลด แก้ `rubric.ts` ที่ backend แล้วหน้านี้เปลี่ยนตามเองโดยไม่ต้องแก้โค้ดฝั่งนี้

**2. ช่องอัปโหลดช่องเดียวไม่บอกอะไรผู้ส่งเลย** — เนื่องจากผลงานคือเอกสารฉบับเดียว ฟอร์มจึงเหลือช่องอัปโหลดช่องเดียว แต่ที่เหลือของหน้าคือตัวเกณฑ์ทั้งหมด แสดงเป็น accordion รายมิติ พร้อมหลักฐานที่ต้องแสดง รายการที่ต้องตรวจให้ได้ และเกณฑ์ระดับรางวัล เพื่อให้ผู้ส่งเช็คก่อนอัปว่ารายงานครอบคลุมครบไหม

**3. คะแนนที่ไม่มีเหตุผลประกอบ ตรวจต่อไม่ได้** — หน้ารายละเอียดแสดงระดับที่ได้ของทุกเกณฑ์ **ข้อความจริงที่ AI ยกมาจากเอกสาร** และรายการที่หาไม่พบ พร้อมโชว์การคิดเลขแบบเปิดเผย เช่น `83.33/100 × 30% = 25` ถ้ามีอะไรผิดปกติในรอบนั้นจะขึ้นเป็นคำเตือน ผู้ตรวจจึงเถียงเป็นรายบรรทัดได้ ไม่ใช่เถียงกับตัวเลขลอย ๆ

**4. การตรวจใช้เวลานาน แต่ UI เคยเงียบ** — `POST /submissions` ตอบ `202` ทันที หน้า `/results` จึง poll ทุก 8 วินาที แต่ poll เฉพาะตอนที่ยังมีงานค้าง และหยุดเองเมื่อทุกงานเสร็จ ทุกแถวมี chip บอกสถานะ ถ้าประเมินไม่สำเร็จจะบอกเหตุผล และกดสั่งประเมินใหม่ได้เลยโดยไม่ต้องอัปโหลดซ้ำ

**5. login ปลอม และ session หลุดทุกครั้งที่รีเฟรช** — ของเดิม hardcode username/password ของ admin ไว้ในไฟล์ login (ลบออกแล้ว และรหัสนั้นขึ้น GitHub ไปแล้ว ควรเปลี่ยนรหัสจริงด้วย) ตอนนี้ใช้ JWT จริงจาก API ส่วน `redux-persist` เดิมมีเป็น dependency แต่ไม่ได้ต่อ ทำให้รีเฟรชทีไรก็หลุด login ตอนนี้ต่อแล้วผ่าน `PersistGate`

**6. การเรียก API กระจัดกระจาย** — รวมไว้ที่ `lib/api.ts` ที่เดียว แนบ token ให้อัตโนมัติ และเมื่อเจอ `401` จะใช้ refresh token ต่ออายุแล้วยิงซ้ำให้เอง ถ้ายังไม่ผ่านค่อยล้าง session โดยคำขอหลายอันที่เจอ 401 พร้อมกันจะใช้การ refresh ครั้งเดียวร่วมกัน

### เริ่มใช้งาน

```bash
npm install
cp .env.example .env.local     # ตั้ง NEXT_PUBLIC_BACKENDURL ให้ชี้ไปที่ API
npm run dev                    # http://localhost:3000
```

ต้องเปิด API จาก [`deepdoc_server`](https://github.com/RoongChakkrin42/deepdoc) ไว้ด้วย และต้องใส่ origin ของหน้านี้ใน `CORS_ORIGINS` ของฝั่ง API ส่วนหน้า `/results` ต้องมีบัญชีผู้ตรวจ สร้างได้ด้วย `npm run seed:reviewer` ใน repo ของ API

### ข้อควรรู้

- token เก็บใน `localStorage` ซึ่งสคริปต์ใด ๆ บน origin เดียวกันอ่านได้ ถ้าเข้มงวดกว่านี้ควรใช้ httpOnly cookie แต่แบบนี้อ่านโค้ด auth จบในไฟล์เดียว
- หน้าฝั่งผู้ตรวจเช็คแค่ว่ามี token ไหม ไม่ได้เช็ค role — ตัวที่บังคับสิทธิ์จริงคือ API
- `src/lib/types.ts` เขียนตามโครงสร้าง payload ของ server ด้วยมือ เวลาแก้ response shape ต้องแก้ทั้งสองฝั่งพร้อมกัน
