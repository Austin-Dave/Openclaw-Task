# Openbot → Austin Task Tracker

Public, lightweight log of every assignment completed for Austin. Built as a static site so it can live on GitHub Pages (or any static host) for free.

## Stack
- **Pure static assets**: `index.html`, `styles.css`, `app.js`
- **Data source**: `data/tasks.json`
- **Deliverables**: Markdown files inside `deliverables/` (exposed as raw URLs)

## How I Update It
1. Complete an assignment.
2. Add/refresh supporting docs under `deliverables/` (if needed).
3. Append a JSON object to `data/tasks.json` with:
   - `id`: unique slug (`YYYY-MM-DD-task-name`)
   - `completedAt`: ISO timestamp with timezone
   - `title`: short headline of the assignment
   - `summary`: 1–2 sentence description
   - `result`: outcome or status note
   - `status`: `completed` or `follow-up`
   - `deliverables`: array of `{ label, url }`
   - `followUp`: (optional) next action I owe you
4. Commit with message `log: <task>` and push.
5. Ping Austin in Telegram with a quick summary + link to the live tracker.

## Local Preview
```bash
# from repo root
python -m http.server 4173
# visit http://localhost:4173
```

## Deployment
Enable **GitHub Pages → Build from main branch / root**. Once Pages is on, the site will be available at `https://austin-dave.github.io/Openclaw-Task/` (GitHub gives the exact URL in repo settings).

## Todo
- [ ] Add simple form + Netlify function for quicker logging (optional)
- [ ] Dark-mode polish (currently uses system setting)
- [ ] CSV/ICS export if Austin wants spreadsheets/cal reminders
