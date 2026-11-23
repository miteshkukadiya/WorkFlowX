# WorkFlowX — AI Handoff

Use this file instead of re-exploring the whole repo. **Do not recreate the project.** Reuse existing code. JavaScript/JSX only (no TypeScript). No hardcoded secrets.

**Current status:** Phase 1 (full audit) is done. **Wait for the user’s phase instruction before implementing.** No files were changed in Phase 1 except this handoff (added later at the user’s request).

---

## Product

MERN SaaS: multi-tenant workspaces, projects, tasks, Kanban, team, time tracking, notifications, reports, Razorpay subscriptions, platform admin, Redis, Socket.IO, Docker (not present yet).

| Layer | Stack |
|---|---|
| Frontend | `frontend/` — React 19, Vite, Tailwind 4, JSX, Axios, Socket.IO client, `@dnd-kit`, Recharts |
| Backend | `backend/` — Express 5, Mongoose, JWT, Razorpay, Socket.IO, Redis, Helmet, Zod, Pino |
| API | `/api/v1/...` |
| Tenant header | `X-Organization-Id` |

Root `package.json` is not a real monorepo (frontend-ish deps only). Run backend from `backend/`, frontend from `frontend/`.

---

## Architecture (do not duplicate)

**Backend layout**

- Entry: `backend/server.js` → `backend/src/app.js`
- Models: `backend/src/models/`
- Controllers/routes/middleware: `backend/src/controllers|routes|middleware/`
- Extra (already used): `backend/services/`, `backend/jobs/`, `backend/socket/socket.js`, `backend/validators/`
- Scripts: `backend/scripts/` (seed plans, platform admin, Razorpay plan link, org migrate)

**Frontend layout**

- Routes: `frontend/src/App.jsx`
- Pages: `frontend/src/pages/`
- API: `frontend/src/services/` (`api.js` base URL currently **hardcoded** `http://localhost:5000/api/v1`)
- State: `AuthContext`, `WorkspaceContext`, `SocketContext`, `NotificationContext`

**Tenancy model:** `Organization` (workspace) + `OrganizationMember` (roles: owner, admin, manager, member, guest) + `OrganizationInvitation`. Project/task data scoped by `organization` on `Project`. RBAC: `backend/src/config/permissions.js` + `authorizePermission`.

**User.role** (`admin`/`employee`) is separate from **workspace roles**. `authorize()` in `authMiddleware` is unused.

---

## Phase 1 audit — exists vs verified

Almost nothing is **runtime-verified**. Verified only:

- `backend/tests/permissions.test.js` — 6 unit tests pass (`npm test` in `backend/`)
- Node v22.22.3; ESM files load with `MODULE_TYPELESS_PACKAGE_JSON` warning (no `"type": "module"` in `backend/package.json`)

**Code exists (not proven in browser/API):** auth, workspaces, projects, tasks, Kanban, comments, attachments, activity, dashboard+Redis cache, notifications+sockets, time tracking, reports, settings, billing UI + Razorpay checkout/webhook/cancel, platform **admin API**.

**Partial**

- `requireTenant` missing on: time tracking, reports, notifications, saved views, user search
- `requireFeature` (plan features) **never used**; project/member limits **are** used
- Invites: token + URL in non-production response; **no email**
- Redis: fail-open on connect; health route does not check Redis
- Socket frontend depends on `user._id` but auth returns `id` — likely connects only after refresh
- Saved views: backend + `AllTasks.jsx` exist; **AllTasks is not routed** (sidebar `/tasks` → `Tasks.jsx`)
- Dual CORS (`app.use(cors())` then allowlist); dual error handlers (`errorHandler` then unused `errorMiddleware`)

**Missing**

- Platform admin **UI**
- Docker/Compose/CI/nginx
- Email, password reset, refresh tokens
- Backend `start`/`dev` scripts
- Frontend tests; API/E2E tests
- Frontend `VITE_API_URL` / `.env.example`
- Object storage (uploads are local disk)

---

## Bugs / security (fix in later phases, don’t ignore)

1. `connectDB` swallows errors; HTTP listens **before** Mongo is ready.
2. `JWT_EXPIRES_IN` used but not in env schema — missing value can mint non-expiring tokens.
3. Reports mix projects across workspaces; time routes not tenant-scoped.
4. `GET /users/search` enumerates any user by name/email.
5. JWT in `localStorage`; password min 6; `bcrypt` (auth) vs `bcryptjs` (settings).
6. Avatar upload debug `console.log`; SocketContext debug logs.
7. Production invitations omit URL and there is no mailer.
8. Mixed CJS leftovers: `User.js`, `authController.js`, `authRoutes.js`, `authMiddleware.js`, `ApiError.js`, `ApiResponse.js`, `asyncHandler.js`, `db.js`.

---

## Env & services

`backend/.env.example`: `NODE_ENV`, `PORT`, `MONGO_URI`, `JWT_SECRET`, `FRONTEND_URL`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`

Used but **not** in example: `JWT_EXPIRES_IN`, `RAZORPAY_WEBHOOK_SECRET`, `REDIS_URL` (default `redis://127.0.0.1:6379`), `PLATFORM_ADMIN_EMAIL` (seed script)

Zod in `backend/src/config/env.js`: `JWT_SECRET` min 32. Razorpay keys optional. `import "dotenv/config"` runs when app loads (before `server.js` `dotenv.config()`).

Services: MongoDB, Redis, Razorpay. No Docker files.

---

## Recommended implementation order (for later phases)

1. Foundation: `"type": "module"`, finish CJS→ESM, start script, listen after DB, env completeness, single CORS + single error handler.
2. Auth: token expiry, hashing consistency, socket `user.id`.
3. Tenant isolation on time/reports/notifications/saved views.
4. Wire `requireFeature`; keep existing limit checks.
5. Saved views routing or remove dead page; invitation delivery.
6. Verify Razorpay + webhook + scheduler with tests.
7. Platform admin UI on existing APIs.
8. Tests, then Docker/production.

---

## Rules for any later AI

1. Inspect existing files before editing. Small patches, no rewrites.
2. Do not create duplicate models/controllers/routes/services/components.
3. Maintain API contracts unless a change is required.
4. Fix root causes. Do not strip features to pass tests.
5. Do not claim done unless tested. After UI changes, verify in the browser if tools exist.
6. Work **only the current user-stated phase**.
7. End each phase with: changed files, tests run, remaining issues.

When the user says **Phase N**, implement only that phase, then stop.
