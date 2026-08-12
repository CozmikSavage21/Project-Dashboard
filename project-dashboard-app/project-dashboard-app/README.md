# Project Dashboard

A simple project-tracking dashboard for civil/pipeline engineering work.
Built with React + Vite. Data is saved in the browser (localStorage), so
it's ready to use with no backend or login required.

## Run it locally

```bash
npm install
npm run dev
```

Then open the URL shown in the terminal (usually `http://localhost:5173`).

## Deploy to Vercel

You have two easy options — pick whichever is more comfortable.

### Option A — Vercel website, no command line (recommended)

1. Put this folder in a GitHub repository:
   - Go to https://github.com/new, create a new repository (e.g. `project-dashboard`).
   - Upload these files to it (GitHub's "Add file → Upload files" works fine for this).
2. Go to https://vercel.com and sign up / log in (you can sign in with your GitHub account).
3. Click **Add New → Project**, then **Import** the GitHub repository you just created.
4. Vercel will auto-detect it as a Vite project. Leave the defaults as they are and click **Deploy**.
5. After a minute you'll get a live link like `project-dashboard.vercel.app` — that's the website.

Every time you push a change to the GitHub repo, Vercel will automatically redeploy the site.

### Option B — Vercel CLI

```bash
npm install -g vercel
vercel login
vercel        # first deploy — follow the prompts
vercel --prod # subsequent production deploys
```

## Notes on the data

- Project data is stored in the browser's local storage, under the key `projects`.
- This means the data lives on whichever device/browser is used to view the site —
  it is **not** shared between different computers or browsers automatically.
- If you later want the same data to show up on your dad's phone and laptop, the
  next step would be adding a small shared backend (e.g. a database) — this
  version intentionally keeps things simple and local, per the original brief.

## Project structure

```
project-dashboard-app/
├── index.html          Page shell, loads fonts
├── package.json        Dependencies and scripts
├── vite.config.js       Build config
├── vercel.json          Vercel deployment config
└── src/
    ├── main.jsx         React entry point
    ├── index.css        Global base styles
    └── App.jsx          The dashboard itself (components, sample data, logic)
```

`App.jsx` is organised into clear sections (config, sample data, helpers,
small UI components, the modal, then the main dashboard) so new features —
task lists, document uploads, a real backend — can be added without a rewrite.
