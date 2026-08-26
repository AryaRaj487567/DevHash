# DevHash

DevHash is a developer-first blogging and publishing platform built with the MERN stack. Writers can register, draft Markdown articles, add technology tags, preview code with syntax highlighting, and publish to a public feed. Visitors can browse, search, and read published posts without an account.

This is an original project inspired by technical blogging products. It does not copy Hashnode branding, logos, or visual design.

## Features

- Register, log in, and persist JWT sessions across refresh
- Public feed of published posts only
- Title search with debounce
- Tag browsing and tag counts
- Markdown editor with live preview
- Fenced code blocks with syntax highlighting
- Draft and published workflows
- Owner-only edit and delete (enforced on the server)
- Delete confirmation modal
- Author profiles and self-service settings
- Dashboard with totals, drafts, and published posts
- Light and dark theme
- Loading, empty, and error states on API-driven pages

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, Vite, React Router, Axios, react-markdown, react-syntax-highlighter |
| Backend | Node.js, Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |

There is no SSR. React talks to MongoDB only through the Express REST API.

## Architecture

```
Browser (Vite + React)
        |
        |  HTTPS / JSON  +  Authorization: Bearer <token>
        v
Express REST API  (/api/auth, /api/posts, /api/tags, /api/users)
        |
        v
MongoDB (User, Post, Tag)
```

Authorization is never trusted from the client. Protected writes check the JWT and post ownership on the server. Drafts are excluded from public list and public article endpoints unless the requester is the owner.

## Folder structure

```
DevHash/
├── README.md
├── .gitignore
├── server/
│   ├── config/db.js
│   ├── models/User.js, Post.js, Tag.js
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   ├── scripts/seed.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── client/
    ├── src/
    │   ├── api/axios.js
    │   ├── context/AuthContext.jsx
    │   ├── components/
    │   └── pages/
    ├── package.json
    └── .env.example
```

## Database models

**User:** name, email (unique, lowercase), password (bcrypt hash, never returned), bio (max 200), avatarUrl, timestamps.

**Post:** title, slug (unique), content, excerpt (max 250), coverImage, status (`draft` | `published`), author → User, tags → [Tag], timestamps.

**Tag:** name (unique, lowercase), slug (unique), timestamps.

Relationships: one user has many posts; one post belongs to one user; posts and tags are many-to-many.

## MongoDB setup

Local:

```bash
mongod
```

Create a database named `devhash` (Mongoose will create it on first write).

Atlas: create a cluster, add a database user, allow your IP, then copy the connection string into `server/.env` as `MONGODB_URI`.

## Environment variables

Copy the example files. Do not commit real secrets.

**server/.env**

```
MONGODB_URI=mongodb://127.0.0.1:27017/devhash
JWT_SECRET=replace_with_a_long_random_secret
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**client/.env**

```
VITE_API_URL=http://localhost:5000/api
```

`CLIENT_URL` may be a comma-separated list of allowed CORS origins in production.

## Installation and local run

Requires Node.js 18+ and MongoDB.

### Backend

```bash
cd server
npm install
copy .env.example .env
npm run seed
npm run dev
```

On macOS/Linux use `cp .env.example .env` instead of `copy`.

API: `http://localhost:5000/api/health`

### Frontend

```bash
cd client
npm install
copy .env.example .env
npm run dev
```

App: `http://localhost:5173`

Production frontend build:

```bash
cd client
npm run build
npm run preview
```

## Seed data

`npm run seed` from `server/` wipes the collections and inserts demo users, tags, published articles, and a few drafts.

| Email | Password |
| --- | --- |
| ada@devhash.dev | password123 |
| grace@devhash.dev | password123 |
| linus@devhash.dev | password123 |

Passwords are hashed with bcrypt before they are stored. Drafts belong to those users and never appear on the public feed.

## API endpoints

Success:

```json
{ "success": true, "data": {} }
```

Error:

```json
{ "success": false, "message": "Post not found" }
```

Protected routes need:

```
Authorization: Bearer <token>
```

### Auth

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | No | Create user, return JWT |
| POST | `/api/auth/login` | No | Login, return JWT |
| GET | `/api/auth/me` | Yes | Current user (no password) |

Register body: `{ "name", "email", "password" }`  
Login body: `{ "email", "password" }`

### Posts

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/posts` | No | Published posts, newest first. `?search=` title match, `?tag=` name or slug |
| GET | `/api/posts/mine` | Yes | Current user's drafts and published posts |
| GET | `/api/posts/:slug` | Optional | Published post, or draft if owner |
| POST | `/api/posts` | Yes | Create. Body: title, content, tags[], coverImage, status |
| PUT | `/api/posts/:id` | Yes, owner | Update title, content, tags, coverImage, status |
| DELETE | `/api/posts/:id` | Yes, owner | Delete |

### Tags

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/tags` | No | Tags with published post counts |
| GET | `/api/tags/:slug/posts` | No | Published posts for a tag |

Tags are created automatically when a post is saved with new tag names. Slugs are generated from the names.

### Users

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/users/:id` | No | Public profile + published posts |
| PUT | `/api/users/me` | Yes | Update own name, bio, avatarUrl |

## Frontend routes

| Path | Access |
| --- | --- |
| `/` | Public feed |
| `/post/:slug` | Article |
| `/tag/:slug` | Tag archive |
| `/login`, `/register` | Auth forms |
| `/dashboard` | Protected |
| `/editor/new` | Protected create |
| `/editor/:slug` | Protected owner edit |
| `/profile/:id` | Public author |
| `/settings` | Protected profile edit |

## Testing with Postman or Thunder Client

1. `POST /api/auth/register` then `POST /api/auth/login`. Copy `data.token`.
2. Invalid login with a wrong password should return `401`.
3. `GET /api/posts/mine` without a token should return `401`.
4. `POST /api/posts` with Bearer token to create a draft.
5. `GET /api/posts` should not include that draft.
6. `PUT /api/posts/:id` as the owner should succeed.
7. Repeat the PUT/DELETE with another user's token; expect `403`.
8. Publish via `status: "published"` and confirm the post appears in the feed and search (`?search=express`).
9. `GET /api/posts?tag=mongodb` and `GET /api/tags`.
10. `GET /api/users/:id` and `PUT /api/users/me`.

## Deployment

**Database:** MongoDB Atlas. Set `MONGODB_URI` on the host.

**Backend (Render / Railway):**

- Root directory: `server`
- Build: `npm install`
- Start: `npm start`
- Env: `MONGODB_URI`, `JWT_SECRET`, `PORT`, `CLIENT_URL` (your frontend origin)

**Frontend (Vercel / Netlify):**

- Root directory: `client`
- Build: `npm run build`
- Publish: `dist`
- Env: `VITE_API_URL=https://your-api-host/api`

SPA rewrites are included (`client/vercel.json` and `client/public/_redirects`). No localhost URLs are hard-coded for production; they come from environment variables.

## Security notes

- Passwords are hashed with bcryptjs and excluded from API responses (`select: false`)
- JWT is stored in `localStorage` on the client and sent as a Bearer token
- CORS origin is configured from `CLIENT_URL`
- Ownership is checked on update and delete
- Input is validated for required fields, status enum, bio length, and unique emails/slugs
- `.env` files are gitignored; only `.env.example` is committed

## License

MIT — use this as a capstone or learning project.
