# Medicare — Hospital Appointment Booking

## Run on macOS
1. Extract the ZIP.
2. Open Terminal in this folder (the one containing `package.json`).
3. Run `npm install`, then `npm run dev`.
4. Open the localhost URL shown by Vite.

If `vite: command not found` appears, run `npm install` in the project root.

## Demo login
Enter any valid email and a password of at least six characters. This uses a demo token and is not production authentication.

## Included
- All listed React Router routes and nested patient dashboard routes.
- React hooks, custom `useDoctors` / `useAppointments`, Context API.
- Zustand persisted global appointment selection store with devtools middleware.
- Doctor search, specialty, fee, rating and availability filters.
- Booking flow, controlled form validation, date/time slots, review, confirmation, history, rescheduling and cancellation.
- Axios REST GET/POST/PATCH/DELETE/login service functions, Bearer token interceptor and local-storage fallback.
- Responsive Medicare-style UI, loading and empty states, protected routes and error boundary.

## Backend note
By default this is a coursework demo that stores appointments in browser local storage. To use a real API, set `VITE_API_BASE_URL` in a `.env` file and connect a backend implementing `/doctors`, `/doctors/:id/availability`, `/appointments`, and `/auth/login`. Demo login is not production-grade security and should not be used with real patient data.


## Experiment 5 — Testing (Jest + React Testing Library)

Install dependencies and run:

```bash
npm install
npm test
```

Sample tests cover doctor cards, search input, empty/loading states, time-slot selection, appointment cancellation, and cancelled appointment controls. Add more tests for specialty filters and API failure cases as your backend is connected.

## Experiment 6 — Optimization, PWA, accessibility and security

- Doctor detail, booking, login, appointments and patient routes are loaded with `React.lazy` and `Suspense` for route-level code splitting.
- Doctor images use lazy loading and asynchronous decoding.
- `public/manifest.webmanifest` and `public/sw.js` provide basic installability and static-asset caching. The service worker registers only in production; test with `npm run build` then `npm run preview`.
- Search and time-slot controls expose accessible labels/pressed state.
- Continue validating every field on the server, use HTTPS, keep secrets on the server, and prefer secure `HttpOnly`, `Secure`, `SameSite` cookies for production authentication. Do not store real access tokens or sensitive patient data in localStorage. This frontend demo cannot make an insecure backend secure by itself.

## Notes

The included PWA is a basic starter. Offline booking and sensitive API responses are intentionally not cached. The Jest setup uses Babel so JSX components can be tested separately from Vite's build.
