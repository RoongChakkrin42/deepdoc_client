# DeepDoc Client

The web front end for [DeepDoc](https://github.com/RoongChakkrin42/deepdoc) — a Next.js app where students submit project reports for AI grading and reviewers read the results.

Next.js 15 · TypeScript · MUI 7 · Redux Toolkit · redux-persist

> 🇹🇭 [สรุปภาษาไทยอยู่ท้ายไฟล์](#สรุปภาษาไทย)

---

## Pages

| Route | Auth | Purpose |
| --- | --- | --- |
| `/submit` | public | Upload a project report and its evidence PDFs |
| `/results` | reviewer | Ranked results per year, with per-dimension scores and the source PDFs |
| `/` | — | Redirects to `/submit` |

---

## Two things worth looking at

### The submission form builds itself

`/submit` renders nothing hardcoded. On mount it fetches `GET /submissions/form-schema` and generates a section per rubric dimension and an upload field per criterion, using the multipart field names the server tells it to use:

```tsx
{schema.dimensions.map((dimension) => (
  <Card key={dimension.index}>
    <Typography>มิติที่ {dimension.index}: {dimension.title}</Typography>
    {dimension.criteria.map((criterion) => (
      <FileUploadField
        key={criterion.field}
        label={`${criterion.code} ${criterion.title}`}
        helperText={`หลักฐานที่ต้องแสดง: ${criterion.evidenceRequirement}`}
        files={files[criterion.field] ?? []}
        onChange={(next) => setFilesFor(criterion.field, next)}
      />
    ))}
  </Card>
))}
```

Adding a criterion on the backend adds a field here with no change to this repo. Previously the same field names were duplicated between the form, the server's controller and its multer config — and had already drifted out of sync.

### Grading is asynchronous, so the UI says so

An analysis takes tens of seconds, so `POST /submissions` returns `202` immediately and the reviewer page polls — but only while something is actually in flight, and it stops as soon as everything has settled:

```tsx
const inFlight = submissions.some(
  (item) => item.status === 'pending' || item.status === 'processing',
);
if (!inFlight) return;

pollTimer.current = setTimeout(() => void load(year, false), POLL_INTERVAL_MS);
```

Every submission carries a status chip, failures show their reason, and a failed analysis can be re-run from the table without re-uploading anything.

---

## Getting started

```bash
npm install
cp .env.example .env.local     # point it at your API
npm run dev                    # http://localhost:3000
```

The API from [`deepdoc_server`](https://github.com/RoongChakkrin42/deepdoc) must be running, and this app's origin must be listed in its `CORS_ORIGINS`.

| Variable | Default | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_BACKENDURL` | `http://localhost:8000` | Base URL of the API, called from the browser |

### Scripts

```bash
npm run dev      # dev server
npm run build    # production build (also type-checks)
npm start        # serve the build
npm run lint     # eslint
npm run lint:fix
```

---

## Structure

```
src/
  pages/         _app, index (redirect), submit, results
  components/    Layout, LoginDialog, submit/, results/
  lib/
    api.ts       axios instance, auth interceptors, typed endpoints
    types.ts     mirrors the server's response payloads
  store/         Redux Toolkit + redux-persist
  theme.ts       MUI theme
```

**`lib/api.ts`** is the only place that talks to the network. It attaches the bearer token, and on a `401` it spends the refresh token once, replays the request, and clears the session if that fails too — concurrent 401s share a single refresh:

```ts
refreshing = refreshing ?? refreshTokens();
const tokens = await refreshing;
```

**`store/`** persists the session to `localStorage` through `redux-persist`, behind a `PersistGate` so the login dialog does not flash for an already-authenticated reviewer. `redux-persist` was a dependency before but was never wired up, so every refresh logged the reviewer out.

---

## Notes

- Session tokens live in `localStorage`, which is readable by any script on the origin. httpOnly cookies would be the stricter choice; this keeps the demo's auth flow readable in one file.
- The reviewer pages gate on the presence of a token, not on a role — the API is what actually enforces access.
- `npm audit` reports three high advisories in `sharp`, pulled in transitively by `next`. They are **not reachable here** — `sharp` only runs behind `next/image`, which this app does not use. Clearing them requires Next 16, a breaking major; revisit at the next framework upgrade.

---

## สรุปภาษาไทย

**DeepDoc Client** คือหน้าเว็บของระบบ DeepDoc เขียนด้วย Next.js 15 + TypeScript + MUI

**หน้าจอ**

| เส้นทาง | สิทธิ์ | ใช้ทำอะไร |
| --- | --- | --- |
| `/submit` | ใครก็ได้ | ส่งเอกสารโครงการพร้อมไฟล์หลักฐาน |
| `/results` | ผู้ตรวจ | ดูผลการประเมินรายปี เรียงตามคะแนน พร้อมเปิดไฟล์ต้นฉบับ |

**จุดเด่น**

- **ฟอร์มสร้างตัวเองจาก API** — ดึงเกณฑ์จาก `GET /submissions/form-schema` แล้วสร้างช่องอัปโหลดตามเกณฑ์ เพิ่มเกณฑ์ที่ backend แล้วหน้านี้ขึ้นเองโดยไม่ต้องแก้โค้ด
- **แสดงสถานะการประเมินตามจริง** — มี chip บอกสถานะทุกแถว ถ้า AI ประเมินไม่สำเร็จจะบอกเหตุผล และกดสั่งประเมินใหม่ได้เลย ไม่ต้องอัปโหลดซ้ำ
- **poll เฉพาะตอนที่ยังมีงานค้าง** และหยุดเองเมื่อทุกงานเสร็จ
- **จำ session ได้** ผ่าน redux-persist (ของเดิมมี dependency แต่ไม่ได้ต่อ รีเฟรชทีไรก็หลุด login)

**สิ่งที่แก้จากเวอร์ชันแรก**

- แปลงเป็น TypeScript ทั้งหมด
- ลบหน้า `analyze.js` ที่ตายแล้ว (ยิงไป endpoint ที่ไม่มีอยู่)
- **ลบ username/password ของ admin ที่ hardcode ไว้ใน `loginDialog.js`** ⚠️ รหัสนั้นขึ้น GitHub ไปแล้ว ควรเปลี่ยนรหัสจริงด้วย ไม่ใช่แค่ลบโค้ด
- เปิดใช้ validation ของฟอร์ม (ของเดิมเขียนไว้แต่ comment ทิ้ง ทำให้ส่งฟอร์มเปล่าได้)
- รวมการเรียก API ไว้ที่ `lib/api.ts` ที่เดียว พร้อม refresh token อัตโนมัติ

**เริ่มใช้งาน**

```bash
npm install
cp .env.example .env.local     # ชี้ไปที่ API
npm run dev
```
