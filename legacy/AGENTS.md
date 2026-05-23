# Project Instructions

- For Feishu/Lark messaging or document-delivery requests from this user, first read `C:\Users\hansh\.codex\memories\feishu.md` for the user's Feishu identity and local `feishu-cli` send commands.
- When the user updates data through or for the webpage, persist those data changes in this repository's source files instead of leaving them only in browser `localStorage`; journey saves must write to `data/journeys.json` through the local `node server.js` API so GitHub Pages can render from the committed JSON.
- Treat the secondary card edit page and the add journey page as one synchronized experience: whenever fields, layout, table behavior, labels, or styling change in the secondary card editor, apply the same relevant change to the add journey editor as well.
