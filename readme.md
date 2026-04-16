# 📺 Video Library Dashboard

## Live https://deev.up.railway.app/

### ⚡ Professional Event-Driven Full-Stack System
A high-performance video management platform utilizing a **tRPC** backend with **Prisma/SQLite**, a **Redux Saga** event-driven frontend, and **Server-Sent Events** (SSE) for real-time synchronization.

---

## 🚀 Key Technical Features

### 🛠️ High-Performance Backend (tRPC + Prisma)
* **Write-Optimized View Counter:** Implements an in-memory **View Counter Buffer** that batches increments and flushes to the SQLite database every 5 seconds. This prevents I/O bottlenecks and database thrashing during high traffic.
* **Complex Querying:** Supports cursor-based pagination, full-text search, and relational tag filtering.
* **Relational Integrity:** Utilizes Prisma's `connectOrCreate` to manage a many-to-many relationship between Videos and Tags efficiently.
* **Type-Safe Subscriptions:** Real-time updates for `onVideoAdded` and `onViewUpdated` via tRPC subscriptions powered by an internal `EventEmitter`.

### 🧠 Observability-Driven Frontend (Redux Saga)
* **Event-Driven Architecture:** Uses a strict Action-naming convention (`[ui]`, `[routing]`, `[effects]`) to provide a clear audit trail of system state changes.
* **Centralized Side Effects:** Sagas manage complex async flows, including tRPC subscriptions, pagination logic, and debounced search inputs.
* **Declarative Routing:** Navigation is treated as a first-class citizen in the Redux state, allowing the UI to react to URL changes via a specialized routing saga.

---

## 🛠️ Tech Stack
* **Frontend:** Vite, React, Redux (Saga), Tailwind CSS, Headless UI, Media-Chrome.
* **Backend:** Node.js (TSX), tRPC, Prisma, SQLite, Zod.
* **DevOps/QA:** Railway.com, Playwright E2E.

---

## 🏁 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Backend Setup
```bash
cd apps/api
npm run db:migrate   # Initialize SQLite schema
npm run db:seed      # Seed with provided dataset
npm run dev          # Start tRPC server
```

### 3. Frontend Setup
```bash
cd apps/web
npm run dev          # Start Vite SPA
```

---

## 🏗️ Deep Dive: State & Logic

### View Counter Buffering
To ensure the SQLite database remains performant, view increments are not written immediately. Instead, they are accumulated in memory and flushed in batches, reducing the write load from $N$ to 1 per interval.

### Redux Action Schema
The application uses a categorized action system to ensure the "entire user journey" is observable:
* **`[ui]`**: User intents (clicks, typing, selections).
* **`[routing]`**: Navigation and history state changes.
* **`[effects]`**: Results from the tRPC layer (success/failure) and real-time subscription events.

---

## 🧪 Testing
The project includes **Playwright E2E tests** to validate critical user flows. By testing the integration between the tRPC procedures and the live SQLite database, we ensure that the core "Happy Path" (listing, filtering, and creating videos) is functional in a production-like environment.

---

## 🤖 AI Usage & Reflection

### Tools Used
* **Claude Code:** Primary architectural partner and code generator.

### Integration Workflow
I treat AI as a mid-level collaborator. My workflow has shifted toward **heavy upfront planning and detailed prompting**. 

1.  **Seed-Driven Generation:** By feeding the provided `videos.json` seed data into Claude alongside my planned feature set, I was able to generate the initial **Zod schemas and tRPC routers** almost instantly. This dramatically reduced the time spent on manual "plumbing."
2.  **Architectural Debates:** I used a "Challenge-Response" loop with Claude to weigh trade-offs between WebSockets, SSE, and Redis. I personally landed on the **In-Memory View Buffer** after reviewing the options presented by Claude as a pragmatic, scalable alternative for this challenge.
3.  **Complex State:** AI handled the scaffolding for the complex TypeScript interfaces of the Redux `AppState`, ensuring total synchronization between the backend procedures and frontend state. I set out and maintained standards to the event-driven architecure style. 
4. **Manual contributions** sometimes Claude gets in the way and I jump in do it myself "oldschool".

### Reflections
The use of AI has radically reduced the "manual labor" of development. By automating the boilerplate of the data layer, I was able to focus on the high-level orchestration of the event-driven system and the observability patterns. This project demonstrates how AI, when steered by a human focused on architecture and trade-off analysis, produces a more robust system than traditional manual coding. It makes me a better product engineer.

---

## 🔮 Future Improvements
* **Redis Integration:** Swap the in-memory `viewBuffer` for a Redis `INCR` implementation to support multi-node scaling.
* **PostgreSQL Migration:** Move to a relational cloud database on Railway for production-grade persistence.
* **Sentry/Datadog Integration:** Forward the `[ui]` and `[effects]` action streams to an external observability platform for real-time monitoring and session replay.