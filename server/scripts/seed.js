const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const User = require('../models/User');
const Tag = require('../models/Tag');
const Post = require('../models/Post');
const { slugify } = require('../utils/slugify');

const TAG_NAMES = [
  'javascript',
  'react',
  'nodejs',
  'mongodb',
  'express',
  'python',
  'docker',
  'web-development',
  'career',
];

const users = [
  {
    name: 'Ada Lovelace',
    email: 'ada@devhash.dev',
    password: 'password123',
    bio: 'Notes from shipping APIs, databases, and developer tools. I write about the boring parts that make products reliable.',
    avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=Ada%20Lovelace',
  },
  {
    name: 'Grace Hopper',
    email: 'grace@devhash.dev',
    password: 'password123',
    bio: 'Frontend engineer who cares about accessible UI, readable CSS, and React patterns that survive a year in production.',
    avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=Grace%20Hopper',
  },
  {
    name: 'Linus Park',
    email: 'linus@devhash.dev',
    password: 'password123',
    bio: 'Backend developer focused on Node.js, Docker, and keeping MongoDB queries honest.',
    avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=Linus%20Park',
  },
];

const articleBodies = {
  rest: `REST APIs look simple until you have to version them, validate input, and return errors that clients can actually use.

This article walks through a practical Express setup that stays readable as the app grows.

## Start with a clear response shape

Clients should not guess whether a request worked. Keep success and error payloads consistent:

\`\`\`js
res.status(201).json({
  success: true,
  data: post,
});
\`\`\`

Errors should include a message and a matching HTTP status:

\`\`\`js
res.status(400).json({
  success: false,
  message: "Title is required",
});
\`\`\`

## Validate before you persist

Never assume the body is complete. Check required fields, trim strings, and reject unknown status values.

## Separate routes from controllers

Routes should describe HTTP. Controllers should talk to Mongoose. Middleware should handle auth and errors. That split is what keeps a capstone project maintainable.

> If a route handler is longer than a page, it is doing too many jobs.

The rest of the work is ownership checks, unique slugs, and never leaking password hashes.
`,
  react: `A public feed should feel fast even when the API is slow. The trick is not clever caching — it is honest UI states.

## Four states, every list

1. Loading
2. Success with data
3. Success with no data
4. Error

If you skip empty and error states, the page looks broken instead of empty.

## Keep search local and debounced

Search belongs in the URL or in local state. Debounce the request so typing "react" does not fire five queries:

\`\`\`js
useEffect(() => {
  const id = setTimeout(() => {
    fetchPosts(query);
  }, 350);

  return () => clearTimeout(id);
}, [query]);
\`\`\`

## Cards, not tables, for reading

A post card needs a title, excerpt, author, date, and tags. Cover images are optional. The card should still look complete without one.

React Router keeps this a single-page app. The server still owns which posts are published.
`,
  mongodb: `Mongoose models are not just schemas. They are the contract between your API and your data.

## Relationships that match the product

- One user has many posts
- One post belongs to one user
- Posts and tags are many-to-many

Populate author and tags on read. Store ObjectIds on write.

## Drafts are a query problem

Public feeds must always include \`status: "published"\`. Drafts exist only for the owner.

\`\`\`js
Post.find({ status: "published" }).sort({ createdAt: -1 });
\`\`\`

If you forget that filter, unpublished writing leaks into the homepage.

## Unique slugs

Generate a slug from the title, then append \`-2\`, \`-3\`, and so on when a collision exists. Do this on the server. The client should never invent uniqueness.
`,
  docker: `You do not need a complicated compose file to get a Node API running the same way on every machine.

A small Dockerfile is enough for a first deploy:

\`\`\`dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
\`\`\`

Keep secrets out of the image. Pass \`MONGODB_URI\` and \`JWT_SECRET\` at runtime.

## What Docker is really buying you

- The same Node version everywhere
- Fewer "works on my laptop" bugs
- A predictable start command for Render or Railway

Local development can still use \`npm run dev\` with nodemon. Docker is for the shape of production, not for replacing Vite.
`,
  career: `The posts that help other developers are usually the ones that admit what went wrong.

Write about:

- The bug that only showed up after login
- The query that scanned the whole collection
- The UI state you forgot until a teammate found an empty feed

A tutorial that only shows the happy path is a screenshot, not a lesson.

## Keep the stack honest

If the assignment is MERN, use MongoDB. Do not hide data in \`localStorage\`. Auth belongs on the server. Ownership checks belong on every write.

That is the difference between a demo and a product you could actually ship.
`,
  python: `Python still shows up next to Node in a lot of teams: scripts, data jobs, and small CLIs that feed a JavaScript frontend.

Keep the boundary clean. The React app talks to HTTP. It does not import a Python module.

A tiny example of a JSON endpoint:

\`\`\`python
from flask import Flask, jsonify

app = Flask(__name__)

@app.get("/health")
def health():
    return jsonify({"success": True, "data": {"status": "ok"}})
\`\`\`

If you are comparing ecosystems, notice the same ideas: validate input, return status codes, never put secrets in the repo.

DevHash stays on Express for the product API. Python is here as a tag and a reminder that good HTTP looks similar everywhere.
`,
};

const posts = [
  {
    authorEmail: 'ada@devhash.dev',
    title: 'Building REST APIs with Express',
    tags: ['nodejs', 'express', 'web-development'],
    status: 'published',
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1400&q=80',
    content: articleBodies.rest,
  },
  {
    authorEmail: 'ada@devhash.dev',
    title: 'Modeling posts and tags in MongoDB',
    tags: ['mongodb', 'nodejs'],
    status: 'published',
    coverImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1400&q=80',
    content: articleBodies.mongodb,
  },
  {
    authorEmail: 'ada@devhash.dev',
    title: 'Notes on draft vs published workflows',
    tags: ['nodejs', 'career'],
    status: 'draft',
    coverImage: '',
    content:
      'This draft is only visible to Ada. Public feeds must never include it.\n\n## Checklist\n\n- Ownership on PUT/DELETE\n- Status filter on GET /api/posts\n- JWT on /api/posts/mine\n',
  },
  {
    authorEmail: 'grace@devhash.dev',
    title: 'Designing a public feed in React',
    tags: ['react', 'javascript', 'web-development'],
    status: 'published',
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1400&q=80',
    content: articleBodies.react,
  },
  {
    authorEmail: 'grace@devhash.dev',
    title: 'Accessible forms for login and settings',
    tags: ['react', 'javascript', 'career'],
    status: 'published',
    coverImage: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=1400&q=80',
    content: `Forms fail quietly when labels are missing and errors appear after submit with no focus change.

## Always pair inputs with labels

\`\`\`jsx
<label htmlFor="email">Email</label>
<input id="email" type="email" autoComplete="email" />
\`\`\`

## Validation belongs on both sides

The client can catch empty fields. The server must still reject them. JWT login should return 401 for bad credentials, not 200 with a vague message.

## Settings is just another form

Name, bio, and avatar URL are profile fields. Never send a password unless the user is changing it. DevHash keeps password updates out of the settings page for the MVP.
`,
  },
  {
    authorEmail: 'grace@devhash.dev',
    title: 'Markdown preview ideas for later',
    tags: ['react'],
    status: 'draft',
    coverImage: '',
    content: 'Split pane on desktop, stacked preview on mobile. Highlight fenced blocks with react-syntax-highlighter.\n',
  },
  {
    authorEmail: 'linus@devhash.dev',
    title: 'A practical Docker workflow for Node APIs',
    tags: ['docker', 'nodejs', 'express'],
    status: 'published',
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1400&q=80',
    content: articleBodies.docker,
  },
  {
    authorEmail: 'linus@devhash.dev',
    title: 'Writing developer articles people finish',
    tags: ['career', 'web-development'],
    status: 'published',
    coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80',
    content: articleBodies.career,
  },
  {
    authorEmail: 'linus@devhash.dev',
    title: 'When Python still belongs next to a MERN app',
    tags: ['python', 'career'],
    status: 'published',
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1400&q=80',
    content: articleBodies.python,
  },
];

const excerptFromContent = (content) =>
  String(content)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_`~\-\[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 250);

const seed = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is required');
  }

  await mongoose.connect(uri);
  console.log('Connected. Clearing existing DevHash data...');

  await Promise.all([User.deleteMany({}), Tag.deleteMany({}), Post.deleteMany({})]);

  const createdUsers = await User.create(users);
  const userByEmail = Object.fromEntries(createdUsers.map((user) => [user.email, user]));

  const createdTags = await Tag.create(
    TAG_NAMES.map((name) => ({
      name,
      slug: slugify(name),
    }))
  );
  const tagByName = Object.fromEntries(createdTags.map((tag) => [tag.name, tag]));

  await Post.create(
    posts.map((post) => ({
      title: post.title,
      slug: slugify(post.title),
      content: post.content,
      excerpt: excerptFromContent(post.content),
      coverImage: post.coverImage,
      status: post.status,
      author: userByEmail[post.authorEmail]._id,
      tags: post.tags.map((name) => tagByName[name]._id),
    }))
  );

  console.log('Seed complete.');
  console.log('Demo logins (password for all: password123)');
  users.forEach((user) => console.log(`  ${user.email}`));

  await mongoose.disconnect();
};

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
