# BrewStack

**Singapore's specialty coffee, in one place.**

BrewStack is a full-stack coffee discovery platform built for Singapore's specialty coffee scene. It aggregates live bean offerings from local roasters, normalises the information into one catalogue, and gives users multiple ways to discover what to drink next: browsing, filtering, map-based roaster discovery, a guided recommendation quiz, and saved beans for logged-in users.

The motivation behind BrewStack is simple: specialty coffee changes quickly. Roasters rotate beans, introduce limited drops, remove sold-out coffees, and publish tasting information in different formats across their own websites. For a newcomer, this makes discovery confusing. For a more experienced coffee drinker, it creates a lot of tab-switching. BrewStack centralises that information into one interface so users can compare beans across roasters without needing to visit every site manually.

Frontend: https://brew-stack.vercel.app
---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Problem Statement](#problem-statement)
3. [Core Features](#core-features)
4. [System Design](#system-design)
5. [Frontend Architecture](#frontend-architecture)
6. [Backend Architecture](#backend-architecture)
7. [Scraper Architecture](#scraper-architecture)
8. [Database Design](#database-design)
9. [Authentication and Saved Beans](#authentication-and-saved-beans)
10. [API Reference](#api-reference)
11. [Data Flow](#data-flow)
12. [Deployment Design](#deployment-design)
13. [Local Setup](#local-setup)
14. [Feature Specifications](#feature-specifications)
15. [Design Decisions](#design-decisions)
16. [Testing](#testing)
17. [Known Limitations](#known-limitations)
18. [Future Improvements](#future-improvements)
19. [Milestone 2 Progress Summary](#milestone-2-progress-summary)
20. [Post-Milestone 2 Improvements](#post-milestone-2-improvements)
21. [User Testing](#user-testing)
22. [Repository Structure](#repository-structure)
23. [Tech Stack](#tech-stack)
24. [Deployment Links](#deployment-links)
25. [Contributors](#contributors)

---

## Project Overview

BrewStack is a React, TypeScript, Express, PostgreSQL, Prisma, Supabase, and Playwright application. It has three main layers:

| Layer | Responsibility |
|---|---|
| Frontend | Presents the catalogue, roaster map, recommendation quiz, login page, and saved beans UI |
| Backend | Serves API routes, verifies authenticated requests, runs scheduled scrapers, and writes data to the database |
| Database | Stores roasters, beans, users, and saved-bean relationships |

The product currently focuses on Singapore-based specialty coffee roasters. The app tracks beans from multiple roasters and stores details such as:

- Bean name
- Roaster
- Price
- Product URL
- Product image
- Region or origin
- Roast level or recommended brew style
- Varietal
- Tasting notes
- Processing method
- Last updated time

The current implementation supports:

- HomeGround
- Nylon
- Tiong Hoe
- Alchemist
- The Community Coffee
- Kyuukei Coffee

The frontend lets users browse these beans through a catalogue, use filters, click through to the original roaster product page, explore roaster locations on a map, take a quiz to get one recommended bean, log in through Supabase Auth, and save beans for later.

---

## Problem Statement

Singapore has a strong and growing specialty coffee scene, but information about available beans is fragmented. Each roaster maintains its own website, product format, tasting note style, and update frequency. A coffee drinker who wants to compare options usually has to open many roaster sites one by one.

This creates several problems:

### 1. Coffee discovery is scattered

Coffee information lives across roaster websites, Instagram pages, newsletters, and cafe menus. A user cannot easily compare a Nylon coffee against a HomeGround coffee or Tiong Hoe coffee without visiting each roaster separately.

### 2. Drops rotate quickly

Many specialty beans are seasonal or limited. A bean that is available this week may disappear shortly after. Static lists become outdated quickly, so a useful catalogue needs to refresh frequently.

### 3. Coffee metadata is inconsistent

Different roasters describe coffee in different ways. One roaster may list varietal, process, and tasting notes in a structured table. Another may put them inside a paragraph. Another may use the recommended brew method instead of a strict roast level. BrewStack has to normalise these differences into one schema.

### 4. New drinkers need guidance

Someone who is new to specialty coffee may not know whether they prefer washed, natural, fruity, nutty, filter, espresso, light roast, or medium roast. A raw catalogue is useful, but a guided quiz makes discovery more approachable.

### 5. Returning users need memory

Users may find beans they want to revisit, compare, or buy later. Without accounts and saved beans, discovery ends once the browser session ends. BrewStack's saved beans feature gives users a simple personal list.

---


## Core Features

### 1. Bean Catalog

The Bean Catalog is the main browsing surface. It fetches bean data from the backend, stores it in React state, and renders each bean as a card.

Each card displays:

- Bean image
- Bean name
- Roaster name
- Price
- Region or origin
- Roast level or brew style
- Processing method
- Varietal
- Tasting note pills
- Save Bean button
- Updated recently indicator

The card itself links to the bean's original product page in a new browser tab. This keeps BrewStack focused on discovery while preserving the roaster's own checkout flow.

Catalogue filters currently include:

- Roaster
- Origin
- Roast level
- Process

The page also contains a sidebar with:

- Fresh Drops
- Popular Notes
- Roasters to Follow


### 2. Home Page

The Home page introduces BrewStack as a discovery platform. It gives users a clear entry point into the core workflows:

- Find my coffee
- Browse catalog
- Explore roasters
- View fresh drops

The landing page also explains why the product exists:

- Coffee information is scattered
- Coffee drops become outdated quickly
- Smaller roasters are easy to miss

The page fetches beans from the backend and shows the first few as "This Week's Fresh Drops". These cards link directly to roaster product pages.

### 3. Roaster Map

The Roasters page contains an interactive Leaflet map through `react-leaflet`.

Branch data is fetched from the `Outlet` table in Supabase via `GET /outlets` on page load. The markers are colour-coded by roaster with a legend below the map for easy reference. Clicking on a marker shows:

- Roaster name
- Branch name
- Address

Supported map roaster groups include:

- Homeground Coffee Roasters
- Nylon Coffee
- Tiong Hoe Specialty Coffee
- Alchemist Coffee
- The Community Coffee
- Kyuukei Coffee

The map also includes two location features:

**Postal code search** — the user enters a Singapore postal code, which is geocoded using the OneMap API. The map recenters on the returned coordinates and shows a location pin.

**Browser geolocation** — the user can click "Use my location" to allow the browser to provide their current coordinates directly. The map recenters without requiring a postal code.

After either location method, a radius slider appears. The user can set a search radius from 1 to 50 km. Only roaster branches within that radius are shown on the map, and a circle is drawn to indicate the search area.

### 4. Find My Coffee

Find My Coffee is a guided quiz that recommends one coffee based on user preferences.

The quiz asks five questions:

1. What do you usually brew?
2. What kind of flavours sound good to you?
3. How adventurous are you with trying new coffees?
4. What kind of cup do you prefer?
5. What are you looking for today?

The scoring function checks bean fields such as:

- Tasting notes
- Roast level
- Processing method
- Varietal
- Region

It then awards points based on matching keywords. For example:

- Fruity preferences match notes like berry, grape, plum, cherry, citrus, peach, apple, and pear
- Chocolatey preferences match chocolate, cacao, cocoa, mocha, and brownie
- Floral preferences match jasmine, lavender, rose, and bergamot
- Nutty preferences match almond, hazelnut, peanut, and walnut
- Adventurous preferences match natural, anaerobic, honey, fermented, macerated, or experimental coffees

The result page displays:

- Recommended bean image
- Roaster
- Bean name
- Tasting note pills
- Origin
- Process
- Varietal
- Brew style
- Price
- Reasons for the match
- View Details button
- Try Again button

This feature makes the catalogue more accessible to users who are not yet comfortable reading coffee metadata.

### 5. Login and Authentication

BrewStack uses Supabase Auth for user authentication.

The frontend creates a Supabase client using:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Login (`/login`) and signup (`/signup`) are separate pages. The login page allows users to sign in with email and password. The signup page allows users to create a new account.

The navbar listens for Supabase auth state changes. If a user is logged in, the navbar shows a Logout button. If no user is logged in, it shows a Login link.

Passwords are not stored directly in the BrewStack application database. Authentication is delegated to Supabase Auth.

### 6. Saved Beans

Saved Beans lets logged-in users store coffees they want to revisit or buy later, and annotate them with personal context.

The flow is:

1. User logs in with Supabase Auth
2. User clicks Save Bean on a catalog card
3. Frontend retrieves the Supabase access token
4. Frontend sends a `POST /me/saved-beans` request with the token and a snapshot of the bean's metadata
5. Backend verifies the token with Supabase
6. Backend upserts the user into the local `User` table
7. Backend creates a `SavedBean` row with the snapshot data
8. A "Saved!" confirmation appears on the card
9. User can view and manage saved beans on `/saved-beans`

Saved bean cards display core bean information along with additional user actions:

- View Coffee — opens the original roaster product page
- Unsave — removes the bean from the saved list
- Status — mark as "want to try", "tried already", or "don't like it"
- Notes — add a personal comment to the saved bean

Saved beans use a snapshot model. Bean metadata is stored at save time so the record persists and remains useful even if the live bean is later removed from the catalogue.

---

## System Design

BrewStack follows a three-layer web architecture:

1. React frontend hosted on Vercel
2. Express backend hosted on Railway
3. PostgreSQL database hosted through Supabase

Playwright scrapers run inside the backend service. The scraper writes normalised data to the database through Prisma. The frontend never scrapes sites directly; it only reads from the backend API.


![Architecture](docs/component-diagram.png)

### Main system responsibilities

| Component | Responsibility |
|---|---|
| React frontend | User interface, routing, catalogue filtering, quiz, saved beans display |
| Express backend | API routes, scraper execution, auth verification, database access |
| Prisma ORM | Type-safe database access and schema modelling |
| Supabase PostgreSQL | Persistent storage for roasters, beans, users, saved beans |
| Supabase Auth | Account creation, login, session tokens |
| Playwright | Browser automation for scraping roaster websites |
| node-cron | Schedules recurring scraper runs |
| Railway | Backend hosting |
| Vercel | Frontend hosting |
| Leaflet | Interactive map rendering |
| OneMap API | Postal-code geocoding for Singapore map search |

---

## Frontend Architecture

The frontend is located in:

```text
client/
```

It is a Vite React application written in TypeScript.

### Frontend routes

Routes are defined in `client/src/App.tsx`.

| Path | Page | Purpose |
|---|---|---|
| `/` | `Home.tsx` | Landing page and product introduction |
| `/catalog` | `Catalog.tsx` | Main bean catalogue |
| `/roasters` | `Roasters.tsx` | Interactive roaster map |
| `/find-my-coffee` | `FindMyCoffee.tsx` | Guided recommendation quiz |
| `/login` | `Login.tsx` | Login page |
| `/signup` | `Signup.tsx` | Signup page |
| `/saved-beans` | `SavedBeans.tsx` | User's saved coffees |

### Shared navigation

`NavBar.tsx` is used across pages. It provides consistent navigation between:

- Home
- Catalog
- Roasters
- Find My Coffee
- Saved Beans

It also displays login state through Supabase Auth. This means users can move between discovery, saving, and browsing without learning different page layouts.

### Data fetching

The frontend uses `fetch()` to call the backend API. The backend URL is read from:

```text
VITE_API_URL
```

The key endpoint used by most pages is:

```text
GET /beans
```

Catalog, Home, and Find My Coffee all depend on the bean catalogue.

### Catalogue state and filtering

`Catalog.tsx` stores all beans in local React state:

```text
beans
```

It also stores selected filters:

```text
roaster
origin
roastLevel
process
```

Filtering is handled via backend query parameters sent from the selected filter state. This keeps the frontend focused on state and rendering rather than filtering logic.

### Real-time update mechanism

The catalogue subscribes to the backend `/events` route using the browser's native `EventSource` API, which establishes a persistent Server-Sent Events (SSE) connection.

When the backend finishes a scraper run, it calls `notifyClients()`, which writes a `data: update` message to every active SSE connection. Connected frontend clients receive this message and immediately re-fetch `GET /beans`, updating the catalogue without requiring a page refresh.

A keepalive ping is sent every 15 seconds to prevent Railway's proxy from closing idle SSE connections due to inactivity timeouts. If the connection drops (for example, during a backend redeploy), `EventSource` automatically attempts to reconnect.

### UI design direction

The current UI uses a warm editorial coffee style:

- Off-white background
- Serif headings
- Thin borders
- Simple cards
- Small meta labels
- Soft badge pills
- Dark primary buttons

This visual style keeps the app closer to a coffee catalogue/editorial tool rather than a generic ecommerce dashboard.

---

## Backend Architecture

The backend is located in:

```text
src/
index.ts
```

The entry point is `index.ts`, which:

1. Creates the Express app
2. Enables JSON body parsing
3. Enables CORS for the frontend
4. Registers API routes
5. Registers the scraper cron job
6. Starts the server

### Backend responsibilities

The backend is responsible for:

- Serving bean and roaster data
- Serving outlet location data for the roaster map
- Running scraper jobs
- Writing scraped beans to the database
- Verifying Supabase Auth tokens
- Managing saved beans
- Notifying frontend clients after scrape updates

### Important backend files

| File | Purpose |
|---|---|
| `index.ts` | Express app setup and server entry |
| `src/routes/index.ts` | API routes |
| `src/db/client.ts` | Prisma client |
| `src/db/upsert.ts` | Roaster and bean upsert logic |
| `src/auth/supabase.ts` | Backend Supabase client |
| `src/auth/getUser.ts` | Reads and verifies Bearer tokens |
| `src/scraper/scheduler.ts` | Registers scheduled scraper runs |
| `src/scraper/scrapers/` | Roaster-specific scraper classes |

### Express route registration

All API routes are attached through:

```text
app.use(routes)
```

This keeps the server entry point small and places API logic in `src/routes/index.ts`.

---

## Scraper Architecture

BrewStack's scraper system is built around a shared base class and roaster-specific subclasses.

```text
src/scraper/scrapers/BaseScraper.ts
```

The base scraper defines:

- The roaster attached to a scraper
- The required `scrape()` method
- A `run()` wrapper that catches errors and returns a structured result
- A `toScraped()` method that converts internal `Bean` objects into plain scraped data
- `openCatalogPage()` for launching a Playwright Chromium browser

Each roaster scraper implements its own `scrape()` method because each roaster website has different HTML and data structures.

### Supported scrapers

| Scraper | Roaster | Notes |
|---|---|---|
| `HomegroundScraper.ts` | HomeGround | Uses product handles and Shopify `.js` endpoints |
| `NylonScraper.ts` | Nylon | Uses product pages and feature chart values |
| `TiongHoeScraper.ts` | Tiong Hoe | Uses Shopify product JSON and product page HTML parsing |
| `AlchemistScraper.ts` | Alchemist | Extracts card data and product detail fields |
| `CommunityCoffeeScraper.ts` | The Community Coffee | Uses Shopify product JSON and description field parsing |
| `KyuukeiScraper.ts` | Kyuukei Coffee | Uses Shopify product JSON and product page HTML parsing |

### Scraper output shape

Every scraper eventually returns data matching this shape:

```ts
type ScrapedBean = {
  roasterName: string;
  website: string;
  beanName: string;
  price?: number;
  url?: string;
  imageUrl?: string;
  region?: string;
  roastLevel?: string;
  varietal?: string;
  flavourNotes?: string;
  processingMethod?: string;
};
```

This shared output shape is important because the database upsert logic does not need to care which roaster produced the bean.

### Scheduled scraping

The scheduled scraper list is centralised in:

```text
src/scraper/scheduler.ts
```

The scheduler creates scraper instances for all currently supported roasters and runs them in sequence.

The scraper run flow is:

1. Clear existing bean data
2. Run each scraper
3. Log how many beans each scraper found
4. Upsert each scraper's beans into the database
5. Notify connected frontend clients through server-sent events

This design keeps the catalogue fresh while avoiding duplicate records.

### Manual scraper routes

The backend also contains manual scraper routes for development and testing:

- `POST /scrape/homeground`
- `POST /scrape/tionghoe`
- `POST /scrape/nylon`

These routes allow selected scrapers to be triggered manually without waiting for the scheduled job.

---

## Database Design

BrewStack uses PostgreSQL through Supabase, with Prisma as the ORM.

The Prisma schema is located at:

```text
prisma/schema.prisma
```

### Entity relationship

![Entity Relationship](docs/class-diagram.png)

### Current models

The database currently has five main application models:

1. `Roaster`
2. `Bean`
3. `User`
4. `SavedBean`
5. `Outlet`

### Roaster model

`Roaster` stores the roaster name and website.

```prisma
model Roaster {
  id      String   @id @default(cuid())
  name    String   @unique
  website String

  beans   Bean[]
  outlets Outlet[]
}
```

The roaster name is unique because it is used as the upsert key. If a scraper finds a bean from an existing roaster, Prisma updates the existing roaster instead of creating a duplicate.

### Bean model

`Bean` stores the scraped coffee product details.

```prisma
model Bean {
  id               String   @id @default(cuid())
  name             String
  price            Float?
  url              String?  @unique
  imageUrl         String?
  region           String?
  roastLevel       String?
  varietal         String?
  flavourNotes     String?
  processingMethod String?
  updatedAt        DateTime @updatedAt

  roasterId String
  roaster   Roaster @relation(fields: [roasterId], references: [id])

  savedBy SavedBean[]
}
```

The product URL is unique because it is the most stable identifier for a bean across scraper runs. Bean names can change slightly or repeat across roasters, but product URLs are more reliable.

Most fields are nullable because roasters do not publish data consistently. For example, one roaster may not include varietal, while another may not have a clear processing method. Optional fields prevent the scraper from failing when a field is absent.

### User model

`User` stores the application's local copy of an authenticated Supabase user.

```prisma
model User {
  id        String   @id
  email     String?  @unique
  createdAt DateTime @default(now())

  savedBeans SavedBean[]
}
```

The `id` comes from Supabase Auth. BrewStack does not store passwords in this table.

### SavedBean model

`SavedBean` links users to beans.

```prisma
model SavedBean {
  id                String   @id @default(cuid())
  userId            String
  beanId            String?
  createdAt         DateTime @default(now())

  status            String?  @default("want_to_try")
  notes             String?
  rating            Int?

  beanName          String
  roasterName       String?
  price             Float?
  url               String?
  imageUrl          String?
  region            String?
  roastLevel        String?
  varietal          String?
  flavourNotes      String?
  processingMethod  String?

  user User  @relation(fields: [userId], references: [id])
  bean Bean? @relation(fields: [beanId], references: [id], onDelete: SetNull)

  @@unique([userId, beanId])
}
```

The unique constraint on `[userId, beanId]` prevents a user from saving the same bean twice. `SavedBean` stores a snapshot of the bean's metadata at save time so the record remains useful even if the live bean is later removed from the catalogue. `beanId` is nullable — if a bean is deleted, the saved record is preserved with the snapshot fields intact and `beanId` set to null.

### Outlet model

`Outlet` stores the physical branch locations of supported roasters, used to populate the roaster map.

```prisma
model Outlet {
  id      String @id @default(cuid())
  name    String
  branch  String
  lat     Float
  long    Float
  address String
  colour  String

  roasterId String?
  roaster   Roaster? @relation(fields: [roasterId], references: [id])
}
```

Each outlet is linked to a roaster via the `roasterId` foreign key, and carries its own lat/lng coordinates, branch label, address, and display colour. The colour field drives the colour-coded markers on the roaster map. `roasterId` is nullable so outlets can exist without a matched roaster if needed.

---

## Authentication and Saved Beans

Authentication is handled by Supabase Auth.

### Frontend auth flow

The frontend creates a Supabase client in:

```text
client/src/lib/supabase.ts
```

It reads:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

The Login page calls:

- `supabase.auth.signInWithPassword()`

The Signup page calls:

- `supabase.auth.signUp()`

The navbar calls:

- `supabase.auth.getSession()`
- `supabase.auth.onAuthStateChange()`
- `supabase.auth.signOut()`

This lets the UI show login/logout state without requiring a custom session system.

### Backend auth verification

For protected routes, the frontend sends:

```text
Authorization: Bearer <supabase_access_token>
```

The backend verifies the token in:

```text
src/auth/getUser.ts
```

It uses Supabase Auth's `getUser()` method to confirm the token belongs to a real logged-in user.

### Saved bean creation flow

![Sequence: Saved Bean Creation Flow](docs/sequence-diagram.png)

### Saved beans retrieval flow

When the user visits `/saved-beans`, the frontend:

1. Gets the Supabase session
2. Sends the access token to `GET /me/saved-beans`
3. Backend verifies the user
4. Backend loads saved beans and nested roaster data
5. Frontend renders saved bean cards

If the user is not logged in, the page shows a message asking them to log in.

---

## API Reference

### Health check

```http
GET /health
```

Returns:

```json
{
  "ok": true
}
```

Purpose:

- Confirms that the backend service is running
- Useful for debugging deployment

### Get all beans

```http
GET /beans
```

Returns all beans with their roaster included.

Used by:

- Home page
- Catalog page
- Find My Coffee page

### Get all roasters

```http
GET /roasters
```

Returns all roasters with their beans included.

### Get all outlets

```http
GET /outlets
```

Returns all roaster branch locations. Used by the roaster map to render markers.


### Get saved beans

```http
GET /me/saved-beans
Authorization: Bearer <token>
```

Returns all beans saved by the authenticated user.

Requires:

- Supabase access token

### Save a bean

```http
POST /me/saved-beans
Authorization: Bearer <token>
Content-Type: application/json

{
  "beanId": "bean_id_here"
}
```

Creates a saved-bean relationship between the current user and a bean.

### Unsave a bean

```http
DELETE /me/saved-beans/:beanId
Authorization: Bearer <token>
```

Removes a bean from the current user's saved list.

### Manual scraper routes

```http
POST /scrape/homeground
POST /scrape/tionghoe
POST /scrape/nylon
```

These are development/testing routes for manually triggering selected scrapers.

---

## Data Flow

### Scraped bean ingestion

```mermaid
flowchart TD
    A["Roaster product pages"] --> B["Playwright scraper"]
    B --> C["Roaster-specific extraction logic"]
    C --> D["Shared ScrapedBean shape"]
    D --> E["upsertScrapedBeans()"]
    E --> F["Upsert Roaster"]
    F --> G["Upsert Bean by URL"]
    G --> H["Supabase PostgreSQL"]
    H --> I["GET /beans"]
    I --> J["React UI"]
```

### Catalogue browsing

```mermaid
flowchart TD
    A["User opens /catalog"] --> B["React useEffect fetches /beans"]
    B --> C["Express returns beans with roaster data"]
    C --> D["Catalog stores beans in state"]
    D --> E["User changes filters"]
    E --> F["Backend filtering (query params)"]
    F --> G["Bean cards render"]
    G --> H["User clicks card"]
    H --> I["Original roaster product page opens"]
```

### Recommendation flow

```mermaid
flowchart TD
    A["User opens Find My Coffee"] --> B["Frontend fetches beans"]
    B --> C["User answers quiz"]
    C --> D["Answers stored in local state"]
    D --> E["scoreBean evaluates each bean"]
    E --> F["recommendBean ranks beans"]
    F --> G["Top match displayed"]
    G --> H["User can view coffee or try again"]
```

---

## Deployment Design

BrewStack is designed for split deployment:

- Frontend on Vercel
- Backend on Railway
- Database and auth on Supabase

### Frontend deployment

The frontend is in:

```text
client/
```

Vercel serves the React app as a static frontend. The `client/vercel.json` file rewrites all routes to `index.html`, which is required for React Router paths like:

```text
/catalog
/roasters
/find-my-coffee
/saved-beans
/login
/signup
```

Without this rewrite, refreshing on a nested route may cause a 404.


### Production environment variables

Backend environment variables:

```text
DATABASE_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
PORT=
```

Frontend environment variables:

```text
VITE_API_URL=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

The frontend must point `VITE_API_URL` to the deployed Railway backend URL.

---

## Local Setup

### Prerequisites

- Node.js
- npm
- Supabase project
- PostgreSQL connection string from Supabase
- Chromium dependencies for Playwright

### Clone the repository

```bash
git clone https://github.com/edwardheww/BrewStack.git
cd BrewStack
```

### Install backend dependencies

```bash
npm install
```

### Install frontend dependencies

```bash
cd client
npm install
cd ..
```

### Root environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL="your_supabase_postgres_connection_string"
SUPABASE_URL="your_supabase_project_url"
SUPABASE_ANON_KEY="your_supabase_publishable_or_anon_key"
PORT=3000
```

### Frontend environment variables

Create a `.env` file inside `client/`:

```env
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL="your_supabase_project_url"
VITE_SUPABASE_ANON_KEY="your_supabase_publishable_or_anon_key"
```

### Generate Prisma client

```bash
npx prisma generate
```

### Run backend

```bash
npm run dev
```

Backend runs at:

```text
http://localhost:3000
```

### Run frontend

```bash
cd client
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

---

## Feature Specifications

This section documents the current product features in a more formal specification style.

### Feature 1: Bean Catalog

#### Goal

Allow users to browse all currently scraped coffees from supported Singapore roasters.

#### Target users

- New coffee drinkers comparing options
- Experienced drinkers looking for current drops
- Users who want to buy directly from roasters

#### Inputs

- Bean data from `GET /beans`
- User-selected filters

#### Outputs

- Filtered bean cards
- Product-page links
- Save Bean action

#### Current behaviour

The catalogue fetches all beans once on page load and stores them in React state. Filters are applied via backend query parameters. Text search allows users to find beans by name or tasting note. Each bean card opens the original roaster product URL in a new tab. Filter category headers are labelled (e.g. `--- Roaster ---`) so users can distinguish category names from filter values.

#### Data shown

- Name
- Roaster
- Price
- Origin
- Roast
- Process
- Varietal
- Tasting notes
- Image

#### Error handling

If the backend fetch fails, the error is logged in the browser console.

#### Future improvement

The catalogue can be improved with:

- Sort by price or freshness
- Better empty states
- Loading skeletons

### Feature 2: Find My Coffee

#### Goal

Recommend one coffee based on user preferences.

#### Target users

- Users who do not know how to interpret coffee metadata
- Users who want a quick suggestion instead of browsing many beans

#### Questions

The quiz asks about:

- Brew method
- Flavour preference
- Adventure level
- Cup profile
- Purchase intent

#### Scoring method

The system uses keyword matching. It combines bean text fields into one searchable string, then checks whether answer-specific keywords appear in the bean's metadata.

For example:

- Filter coffee adds points to beans with `filter` or `light`
- Espresso adds points to beans with `espresso`, `medium`, or `dark`
- Fruity adds points to beans with fruit-related tasting notes
- Adventurous adds points to natural, anaerobic, fermented, or experimental coffees

#### Output

The result page shows:

- Matched bean
- Why it matched
- Price
- Tasting notes
- Bean metadata
- View Details link
- Try Again button

#### Future improvement

The scoring can later be improved with weighted preferences, saved-bean history, and natural-language explanations.

### Feature 3: Roaster Map

#### Goal

Help users find specialty coffee roasters and branches around Singapore.

#### Current behaviour

The map uses Leaflet with Carto map tiles. Roasters are shown as colour-coded markers with a legend below the map. Clicking a marker shows the roaster name, branch, and address.

Users can locate themselves on the map in two ways:

- **Postal code search** — enter a Singapore postal code, geocoded via the OneMap API. The map recenters and shows a pin at the result.
- **Browser geolocation** — click "Use my location" to let the browser provide coordinates directly. Invalid postal codes show an inline error message rather than failing silently.

Once a location is set, a radius slider appears. The user can filter visible markers to only show branches within 1–50 km, with a circle drawn on the map to indicate the search area.

#### Data source

Roaster branch data is stored in the `Outlet` table in Supabase and fetched via `GET /outlets` on page load. This allows branch data to be updated without editing frontend code.

#### External dependency

Postal-code lookup uses:

```text
https://www.onemap.gov.sg/api/common/elastic/search
```

### Feature 4: Login and Signup

#### Goal

Allow users to create accounts and log in so personal features can persist.

#### Current behaviour

Login (`/login`) and signup (`/signup`) are separate pages. Users enter email and password. Supabase handles account creation and authentication.

#### Output

After login or signup, the user is redirected to the catalogue.

#### Navbar integration

The navbar reflects auth state:

- Logged out: Login link
- Logged in: Logout button

### Feature 5: Saved Beans

#### Goal

Allow logged-in users to save beans and manage their personal coffee list.

#### Current behaviour

From the catalogue, logged-in users can save a bean. A "Saved!" confirmation appears immediately after saving. If they are not logged in, the app redirects them to the login page.

The saved beans page fetches the user's saved beans from the backend and renders them as cards. Saved beans use a snapshot model — bean metadata is stored at save time, so the record persists even if the live bean is later removed from the catalogue.

#### Saved bean actions

- View Coffee — opens the original roaster product page
- Unsave — removes the bean from the saved list
- Status — mark as "want to try", "tried already", or "don't like it"
- Notes — add a personal comment to the saved bean

#### Backend protection

Saved bean routes require a Supabase Bearer token.

### Feature 6: Fresh Drops

#### Goal

Highlight recent or currently visible beans from the catalogue.

#### Current behaviour

The Home page and Catalog sidebar use the first few beans from the backend response as fresh drops.

#### Current limitation

Freshness is currently based on ordering rather than a dedicated drop date. The database has `updatedAt`, which could later power a more accurate "latest drops" sort.

---

## Design Decisions

### Why scrape instead of requiring manual input?

The product aims to stay updated as roasters rotate their offerings. Manual input would be too slow and error-prone. Scraping lets BrewStack refresh the catalogue automatically and remain useful even when roasters update often.

### Why keep direct roaster links?

BrewStack is a discovery layer, not a checkout platform. Direct links respect the roaster's existing store, payment flow, and inventory system. This also reduces scope and avoids ecommerce complexity.

### Why use Prisma?

Prisma provides a typed schema and a clean way to model relationships between roasters, beans, users, and saved beans. It also makes upsert logic straightforward.

### Why Supabase?

Supabase provides both PostgreSQL and Auth, which fits BrewStack's needs:

- Hosted database
- User authentication
- Access tokens for protected routes
- Works with Prisma

### Why use keyword-based recommendation?

For Milestone 2, keyword scoring is transparent and easy to debug. It allows the team to explain why a bean was selected. A more advanced model can be added later, but the current approach is predictable and aligned with the database fields.

---

## Testing

BrewStack was tested by the development team across three levels: unit, integration, and system testing. Unit testing was automated using Vitest; integration and system testing were carried out manually.

### Test organisation

Tests are organised by **level** (unit, integration, system) and, within each level, by **technique**:

- **White-box tests** exercise internal logic directly — for example, calling `scoreBean()` with a specific bean and quiz-answer set and checking the returned score, or calling `splitNotes()` with a known tasting-notes string and checking the resulting array. These require knowledge of how the function or module is implemented internally.
- **Black-box tests** exercise a feature purely through its external interface (API request, UI action) without reference to how it is implemented — for example, sending a `POST /me/saved-beans` request and checking the HTTP response, or entering a postal code on the Roaster Map and checking that the map recentres.
- **Positive test cases** confirm expected behaviour with valid input (a well-formed bean object, a logged-in user, a valid postal code).
- **Negative test cases** confirm the system fails safely or rejects invalid input (a missing required field, an unauthenticated request, a malformed postal code).
- **Boundary-value test cases** target the edges of a valid input range (e.g. the minimum and maximum values of the roaster-map radius slider, or a rating field at its allowed limits) where off-by-one errors are most likely to surface.

### Unit testing

Unit testing was carried out using automated tests written with Vitest, targeting the helper functions in `FindMyCoffee.ts` (`splitNotes`, `money`, `scoreBean`, `recommendBean`).

| ID | Description | Technique | Category | Expected Result |
|---|---|---|---|---|
| UT-01 | `splitNotes()` splits a tasting-notes string on commas and semicolons into an array of trimmed notes | White-box | Positive | `"Berry, Citrus; Floral"` returns `["Berry", "Citrus", "Floral"]` |
| UT-02 | `splitNotes()` returns only the first three notes when more are provided | White-box | Boundary-value | `"Berry, Citrus, Floral, Chocolate"` returns only `["Berry", "Citrus", "Floral"]` |
| UT-03 | `money()` formats a numeric price as a Singapore-dollar string | White-box | Positive | `money(22)` returns `"S$22.00"` |
| UT-04 | `money()` returns a fallback string when price is missing | White-box | Negative | `money(undefined)` returns `"N/A"` |
| UT-05 | `scoreBean()` scores a bean above zero when its metadata matches the user's quiz answers | White-box | Positive | A fruity filter coffee scored against `{ brew: "Filter coffee", flavour: "Fruity" }` returns a score `> 0` with at least one matching reason |
| UT-06 | `recommendBean()` ranks the best-matching coffee first among multiple candidates | White-box | Positive | Given a chocolate espresso bean and a fruity filter bean scored against a fruity/filter preference, the fruity filter bean is ranked first |

### Integration testing

Integration testing was carried out manually by testing interactions between the frontend, backend, database, authentication system, and scraper pipeline.

| ID | Description | Technique | Category | Expected Result |
|---|---|---|---|---|
| IT-01 | `GET /beans` returns bean records with their related `Roaster` included | Black-box | Positive | Response includes nested roaster object per bean |
| IT-02 | Save a new bean from the catalogue while logged in | Black-box | Positive | "Saved!" confirmation appears; bean is correctly added to `/saved-beans` |
| IT-03 | Attempt to save a bean from the catalogue while logged out | Black-box | Negative | User is redirected to `/login`; no `SavedBean` row is created |
| IT-04 | Attempt to save a bean from the catalogue that has already been saved | Black-box | Negative | "Saved!" message still appears, but the bean shows up only once on `/saved-beans` (no duplicate row) |
| IT-05 | Unsave a bean from `/saved-beans` that was previously saved | Black-box | Positive | Bean is removed from `/saved-beans`; corresponding `SavedBean` row is deleted |
| IT-06 | Scraper run inserts beans that are then immediately retrievable via `GET /beans` | Black-box | Positive | Newly scraped beans appear in the API response without a manual restart |
| IT-07 | Frontend catalogue receives an SSE `update` event after a scraper run completes | Black-box | Positive | `GET /beans` is automatically re-fetched and the catalogue re-renders without a page refresh |
| IT-08 | Roaster Map postal code search with a malformed postal code (e.g. letters instead of digits) | Black-box | Negative | Inline error shown; map does not recentre |
| IT-09 | Roaster Map radius slider at its minimum (1 km) and maximum (50 km) bounds | Black-box | Boundary-value | Only outlets within the selected radius are shown at each extreme; no outlets are incorrectly included or excluded at the boundary |

### System testing

System testing was carried out manually by the developers using the deployed BrewStack application as an end user, verifying that the main features worked together across the frontend, backend, database, and authentication services.

| ID | Description | Technique | Category | Expected Result |
|---|---|---|---|---|
| ST-01 | End-to-end: sign up, log in, browse catalogue, save a bean, view it on `/saved-beans` | Black-box | Positive | Bean appears in Saved Beans with correct snapshot data |
| ST-02 | End-to-end: complete the Find My Coffee quiz and follow through to the recommended bean's product page | Black-box | Positive | Recommended bean's "View Details" link opens the correct roaster product page |
| ST-03 | Attempt to access `/saved-beans` while logged out | Black-box | Negative | No saved beans are shown; page displays "Log in to view your saved beans." instead of redirecting |
| ST-04 | Use browser geolocation on the Roaster Map without first entering a postal code | Black-box | Positive | Map recentres on the browser-provided coordinates directly |

---

## Known Limitations

### 1. Roaster websites can change

Scrapers depend on roaster site structure. If a roaster changes class names, product JSON shape, or page layout, that scraper may need to be updated.

### 2. Data is not equally complete across roasters

Some roasters publish detailed metadata. Others provide fewer fields. BrewStack handles this by allowing nullable fields, but users may see `N/A` for missing values.

### 3. Map roaster locations require manual updates

Roaster branch locations are stored in the `Outlet` table in the database. Adding or updating a branch requires a manual database insert rather than being driven automatically by the scraper.

### 4. Recommendation logic is rule-based

Find My Coffee uses keyword scoring. It works for clear cases but may miss nuanced flavour relationships or personal preferences.

### 5. Saved beans may reference unavailable live beans

Saved beans use a snapshot model that preserves metadata even when the live bean is removed. However the link to the original product page may break if the roaster removes or moves that page.


---

## Future Improvements

### Better search and sorting

Add:

- Sort by price
- Sort by recently updated
- Sort by tasting note similarity

### More roasters

The base scraper pattern makes it possible to add more roasters by implementing new scraper classes.

Potential future roasters can be added by:

1. Creating a new scraper class
2. Returning the shared `ScrapedBean` shape
3. Registering it in `scheduler.ts`
4. Testing with manual or scheduled runs

### Better recommendation system

The quiz can become more personal by using:

- Saved beans
- User ratings
- Previously viewed beans
- Price preference
- Roast preference
- Process preference

### Availability and history

Instead of deleting unavailable beans completely, BrewStack could mark them as unavailable. This would allow:

- Historical saved beans
- Drop archive
- Restock tracking
- Trends over time

### Admin dashboard

An admin view could allow maintainers to:

- Trigger scrapers
- View scraper errors
- Inspect missing fields
- Disable broken beans
- Add roaster branch locations

### More user features

Potential future account features:

- Favourite roasters
- Recommendation history

---

## Milestone 2 Progress Summary

During Milestone 2, BrewStack moved from a basic data pipeline and catalogue into a fuller discovery product.

Completed work includes:

- Planned MS2 scope, feature structure, implementation priorities, and workload distribution
- Improved scraper pipeline reliability
- Fixed Tiong Hoe scraper extraction issues
- Implemented Alchemist scraper
- Implemented Community Coffee scraper
- Expanded supported roasters to five
- Refined backend deployment configuration
- Added scheduled scraper registration
- Added server-sent event refresh support
- Built Find My Coffee page, route, quiz logic, result UI, and scoring system
- Updated Find My Coffee design
- Built Home page route, hero, buttons, feature sections, fresh drops, and CTA
- Updated catalogue cards to open real roaster product pages
- Created a shared navigation bar across pages
- Built Roasters page with interactive map
- Added roaster branch markers and colour-coded legend
- Added postal-code search for map recentering
- Set up Supabase authentication
- Added login and signup UI
- Connected navbar to auth state
- Added saved beans database model
- Added saved beans backend routes
- Built Saved Beans frontend page
- Connected saved bean actions to authenticated backend requests

---

## Post-Milestone 2 Improvements

Between Milestone 2 and Milestone 3, BrewStack received a range of refinements across UX, data integrity, and platform coverage.

Completed work includes:

- Labelled filter category headers in the catalogue so users can distinguish category names from filter values
- Added error feedback for invalid postal codes and geolocation failures on the roaster map so features never fail silently
- Added visual confirmation feedback when a user saves a bean
- Migrated roaster branch locations from hardcoded frontend data into the `Outlet` database table, allowing updates without code changes
- Added browser geolocation as an alternative to postal code input on the roaster map
- Separated login and signup into distinct pages
- Added saved bean status options — "want to try", "tried already", "don't like it" — and a personal notes field for each saved bean
- Added backend query filtering support
- Added catalogue text search
- Added snapshot-based saved bean persistence so saved records survive bean removal from the live catalogue
- Added Kyuukei Coffee scraper and outlet entries

---

## User Testing

BrewStack was tested with 16 participants using a structured feedback form covering first impressions, browsing, filtering, the recommendation quiz, the roaster map, overall design, and likelihood to return.
Responses: https://docs.google.com/spreadsheets/d/1KFnod6p-h_dldhlQiI80Eu-zmRCtXT_JmDWBXdvHMkU/edit?usp=sharing

### Participant profile

Most respondents were aged 18–24, with one respondent each in the 25–34 and 55+ ranges. Coffee-drinking frequency ranged from a few times a month to multiple times a day.

### Average scores (out of 5)

| Question | Average |
|---|---|
| The app was easy to understand when I first opened it | 4.9 |
| I found it easy to browse and compare different coffee beans | 4.8 |
| The coffee information shown was useful for helping me decide what to try | 4.9 |
| The filters/search features helped me narrow down my choices effectively | 4.9 |
| The "Find My Coffee" recommendation feature felt helpful | 4.8 |
| The roaster map made it easier to discover coffee roasters or outlets | 4.8 |
| The overall design felt clean, pleasant, and suitable for a coffee discovery platform | 4.8 |
| I would use this app again when looking for specialty coffee | 4.9 |

### Selected feedback

> "I love the app! It's very helpful especially for a novice like me to find suitable coffee!"

> "Simple. Clear. Easy."

> "Keep up the good work."

Scores were consistently high across all measured dimensions, with no participant rating any question below 3. Feedback was uniformly positive, with no negative or critical comments submitted.

---

## Repository Structure

```text
BrewStack/
├── api/
│   └── index.ts
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── NavBar.tsx
│   │   │   └── RoasterMap.tsx
│   │   ├── lib/
│   │   │   └── supabase.ts
│   │   ├── pages/
│   │   │   ├── Catalog.tsx
│   │   │   ├── FindMyCoffee.tsx
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Roasters.tsx
│   │   │   ├── SavedBeans.tsx
│   │   │   └── Signup.tsx
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── package.json
│   └── vercel.json
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── src/
│   ├── auth/
│   │   ├── getUser.ts
│   │   └── supabase.ts
│   ├── db/
│   │   ├── client.ts
│   │   └── upsert.ts
│   ├── routes/
│   │   └── index.ts
│   └── scraper/
│       ├── scheduler.ts
│       ├── scrapers/
│       │   ├── AlchemistScraper.ts
│       │   ├── BaseScraper.ts
│       │   ├── CommunityCoffeeScraper.ts
│       │   ├── HomegroundScraper.ts
│       │   ├── KyuukeiScraper.ts
│       │   ├── NylonScraper.ts
│       │   └── TiongHoeScraper.ts
│       └── types/
│           └── index.ts
├── Dockerfile
├── index.ts
├── package.json
├── prisma.config.ts
└── README.md
```

---

## Tech Stack

| Area | Technology |
|---|---|
| Frontend framework | React |
| Frontend language | TypeScript |
| Frontend build tool | Vite |
| Routing | React Router |
| Map UI | Leaflet and React Leaflet |
| Backend framework | Express |
| Backend language | TypeScript |
| Database | PostgreSQL |
| Database host | Supabase |
| ORM | Prisma |
| Authentication | Supabase Auth |
| Scraping | Playwright |
| Scheduling | node-cron |
| Backend deployment | Railway |
| Frontend deployment | Vercel |
| Styling | CSS |

---

## Deployment Links

Frontend: https://brew-stack.vercel.app

---


## Contributors

- Lim Jun Hong
- Edward Hew

Repository:

```text
https://github.com/edwardheww/BrewStack
```

---

## Summary

BrewStack is a centralised discovery platform for Singapore specialty coffee. It combines automated scraping, a normalised bean database, a catalogue frontend, an interactive roaster map, a recommendation quiz, authentication, and saved beans.

The current implementation demonstrates a complete end-to-end product loop:

1. Scrapers collect roaster product data
2. Backend normalises and stores beans
3. Frontend displays current beans
4. Users discover beans through browsing, mapping, or recommendation
5. Users can save beans after logging in
6. Users can return later and open saved beans directly on the roaster's website

This makes BrewStack more than a static catalogue. It is a living discovery layer for local coffee, designed to help new drinkers start with less confusion and help seasoned drinkers keep up with rotating specialty drops.
