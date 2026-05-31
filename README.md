# BrewStack

A centralised platform for Singapore's specialty coffee ecosystem. BrewStack aggregates bean offerings from local roasters into a single, daily updated catalogue, helping consumers discover new coffees and giving smaller roasters more visibility.

Currently implemented features:
- Web scraping for the following roasters
  - Homeground
  - Nylon
  - Tiong Hoe
- Central catalog page

---
## Milestone 1 Links
Project Log: 
https://docs.google.com/spreadsheets/d/1qJc9qv75R07gXsJ0Ww4iWmQ5QGgNuagz5SHjS-Yqv0I/edit?usp=sharing (Edward)
https://docs.google.com/spreadsheets/d/1qHIqNYRqPW31MKFUCNnQBzMJVBWoW9A8Fr6RVuZsFc8/edit?usp=sharing (Jun Hong)

Project Poster:
https://drive.google.com/file/d/1yBWuvF-9wY4bjRKdIhyNAg4dVmzP1YyW/view?usp=sharing

Project Video:
https://drive.google.com/file/d/1-EOzyGoWDlaDIFwZOm83wMpufqB47dG-/view?usp=sharing

---
## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript (Vite) |
| Backend | Express.js + TypeScript |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma |
| Scraping | Playwright |
| Scheduling | node-cron |
| Styling | CSS |

---

## Project Structure

```
BrewStack/
├── client/                  # React frontend
│   └── src/
│       ├── pages/
│       │   ├── Home.tsx
│       │   ├── Catalog.tsx
│       │   └── BeanDetail.tsx
│       ├── components/
│       └── types/
├── src/                     # Express backend
│   ├── db/
│   │   ├── client.ts        # Prisma client singleton
│   │   └── upsert.ts        # Bean + roaster upsert logic
│   ├── routes/              # Express API routes
│   └── scraper/
│       ├── scrapers/
│       │   ├── BaseScraper.ts
│       │   ├── HomegroundScraper.ts
│       │   ├── NylonScraper.ts
│       │   └── TiongHoeScraper.ts
│       ├── types/
│       ├── utils/
│       │   ├── browser.ts
│       │   ├── parse.ts
│       │   └── normalise.ts
│       └── scheduler.ts     # Cron job (nightly, 2 AM SGT)
├── prisma/
│   └── schema.prisma
└── index.ts                 # Express entry point
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- A Supabase project (for the PostgreSQL database)

### Installation

```bash
# Clone the repo
git clone https://github.com/edwardheww/BrewStack.git
cd BrewStack

# Install backend dependencies
npm install

# Install Playwright browser
npx playwright install chromium

# Install frontend dependencies
cd client && npm install && cd ..
```

### Environment Variables

Create a `.env` file at the project root:

```
DATABASE_URL=your_supabase_connection_string
PORT=3000
```

### Database Setup

```bash
npx prisma migrate dev
```

### Running the App

```bash
# Terminal 1 — backend
npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

The frontend runs at `http://localhost:5173` and the backend at `http://localhost:3000`.
As of now, only `http://localhost:5173/catalog` has content. 

---

## Scraper

The scraper runs nightly at 2 AM SGT, pulling bean listings from supported roasters and upserting them into the database.

**Supported Roasters:**
- Homeground Coffee Roasters
- Nylon Coffee Roasters
- Tiong Hoe Specialty Coffee

### Adding a New Roaster

1. Duplicate any existing scraper in `src/scraper/scrapers/`
2. Update the `Roaster` config (name, website, catalog URL)
3. Inspect the roaster's site in DevTools and update the CSS selectors
4. Register the new scraper in `src/scraper/scheduler.ts`

---

## API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/beans` | Returns all beans with roaster info |
| GET | `/roasters` | Returns all roasters |

---

## Made By

- Edward Hew
- Lim Jun Hong
