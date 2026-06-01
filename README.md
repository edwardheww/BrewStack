# BrewStack

A centralised platform for Singapore's specialty coffee ecosystem. BrewStack aggregates bean offerings from local roasters into a single, daily updated catalogue, helping consumers discover new coffees and giving smaller roasters more visibility.

**Currently implemented features:**
- Web scraping for Homeground, Nylon, and Tiong Hoe
- Central catalog page with live scraped data

---

## Milestone 1 Links

Project Log: https://docs.google.com/spreadsheets/d/1qJc9qv75R07gXsJ0Ww4iWmQ5QGgNuagz5SHjS-Yqv0I/edit?usp=sharing

Project Poster: https://drive.google.com/file/d/1z_YSlxhBxBeHbIyGiQYEOPobfASUg1s2/view?usp=sharing

Project Video: https://drive.google.com/file/d/1-EOzyGoWDlaDIFwZOm83wMpufqB47dG-/view?usp=sharing

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

The frontend runs at `http://localhost:5173` and the backend at `http://localhost:3000`. As of Milestone 1, only `http://localhost:5173/catalog` has content.

---

## How It Works

### Scraper

The scraper is built around an abstract `BaseScraper` class. Every roaster-specific scraper extends it and implements a single `scrape()` method. The base class handles the shared logic: launching a Playwright browser, navigating to the roaster's catalog page, wrapping the scrape in error handling, and returning a structured `ScrapeResult`.

Each roaster scraper works in two passes:

1. **Catalog pass** — visits the roaster's bean listing page and collects all product URLs (or handles, for Shopify stores)
2. **Detail pass** — visits each product page individually and extracts fields like name, varietal, processing method, roast level, tasting notes, and image URL

Field extraction varies per roaster since each site has a different HTML structure. Selectors are tuned per scraper using browser DevTools.

All scrapers are registered in `scheduler.ts`. A nightly cron job at 2 AM SGT runs them sequentially with a short random delay between each roaster to avoid triggering bot detection. After scraping, results are passed to `upsertScrapedBeans()`.

**Supported roasters:**
- Homeground Coffee Roasters
- Nylon Coffee Roasters
- Tiong Hoe Specialty Coffee

### Database

Two Prisma models are used:

**Roaster** — stores the roaster's name and website. Uniquely identified by name.

**Bean** — stores all scraped bean data. Uniquely identified by URL, so re-running the scraper updates existing records rather than creating duplicates. Optional fields (varietal, roast level, tasting notes, etc.) account for roasters that don't publish all metadata. Each bean has a foreign key back to its roaster.

On each scrape run, the database is cleared for that roaster before upserting fresh data. This ensures beans that have been removed from a roaster's site don't persist in the catalogue.

### API

The Express backend exposes two REST endpoints:

- `GET /beans` — returns all beans, each with its nested roaster object included
- `GET /roasters` — returns all roasters

### Frontend Catalog

The catalog page fetches from `GET /beans` on load using `useEffect`, storing the response in React state. Beans with missing tasting notes are filtered out client-side before rendering. Each bean is displayed as a card showing the name, roaster, tasting notes, roast level, processing method, and price.

### Adding a New Roaster

1. Duplicate any existing scraper in `src/scraper/scrapers/`
2. Update the `Roaster` config (name, website, catalog URL)
3. Inspect the roaster's site in DevTools and update the CSS selectors
4. Register the new scraper in `src/scraper/scheduler.ts`

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/beans` | Returns all beans with roaster info |
| GET | `/roasters` | Returns all roasters |

---

## Made By

- Edward Hew
- Lim Jun Hong
