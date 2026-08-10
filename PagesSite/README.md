> ## 🔒 INTERNAL USE ONLY — AppMod for Z Squad
> **The internal IBM site URL is strictly internal to the AppMod squad and must never be shared externally.**
> You are welcome to screenshare a live demo of the use cases to showcase what we have built, but do not share or distribute the actual URL with anyone outside the squad.

---

# IBM Bob Premium Package for Z — Workshop Lab Guide Site

A React + Vite lab guide site styled with IBM Carbon-inspired branding. Hosts eight hands-on labs for IBM Bob Premium Package for Z, designed to be deployed to GitHub Pages for client-facing workshops.

**Live site:** [https://zappmod.github.io/GlobeLife/](https://zappmod.github.io/GlobeLife/)

---

## ⚠️ Important Rules for Use

This site contains **sensitive IBM content** that is actively evolving — new use cases and labs are added regularly as the product grows. Please follow these rules to protect our material:

- **Share the client-facing site link only during the event itself.** Do not distribute it too far in advance or leave it up indefinitely.
- **Delete the client-facing repo and site within 3 days after the workshop ends.** This limits content exposure and ensures participants always see the most current content at the next event.
- **Use a unique username and password for every client deployment.** Never reuse credentials across different clients or events.
- **Share login credentials privately and only with attendees.** Treat them the same way you would any IBM confidential resource — do not post them publicly or in open channels.
- **Do not screenshot or redistribute lab content outside the event context.** The labs are living use cases that must be tested each time, as the product and underlying models are constantly evolving.

---

## Labs

| # | Title | Description | Duration | Difficulty |
|---|-------|-------------|----------|------------|
| 1 | 🚀 Getting Started | Set up Bob, scan your workspace, initialize Agent.md, and generate a Data Dictionary. | 20 min | Beginner |
| 2 | 📐 Technical Design Document | Generate a comprehensive technical design document from your COBOL codebase with Mermaid diagrams. | 10–15 min | Beginner |
| 3 | 🗺️ Application Discovery & Understanding | Explore call graphs, DB2 access graphs, flow charts, complexity reports, and variable data flow across the GENAPP application. | 30 min | Beginner |
| 4 | 🔍 Impact Analysis | Analyze the ripple effects of a field change across your entire mainframe application landscape. | 30 min | Beginner |
| 5 | 🔧 Refactoring & Service Extraction | Identify business rules in monolithic COBOL programs, check dependencies, and extract business services for modernization. | 60 min | Intermediate |
| 6 | ⚙️ Spec-Driven Code Generation | Use a program specification to generate a complete CICS COBOL program and verify it against requirements. | 45 min | Intermediate |
| 7 | 🖥️ UI Modernization | Transform CICS green screen applications into modern web interfaces with REST APIs. | 45 min | Intermediate |
| 8 | ☕ COBOL to Java Modernization | Analyze a CICS/DB2 COBOL policy update program and convert it to a modern Java 21 Spring Boot service with a REST API and JUnit 5 test suite. | 30–45 min | Intermediate |

---

## Default Credentials (Internal)

- **Username:** `workshop`
- **Password:** `BobPremiumZ2025!`

---

## 🚀 Setting Up a Client-Facing Workshop Site

### Step 1 — Create a GitHub Organization (one-time setup)

Create a personal GitHub organization to house all your client workshop repos. This keeps them off your personal account, groups them together so you can find them easily, and makes it simple to go back and delete them after each event.

1. Go to [github.com/organizations/new](https://github.com/organizations/new).
2. Name it something memorable, e.g. **`AppModZ-CE4S`** (or your own preferred name).
3. Set visibility to **Public**.

> You only need to do this once. Every client repo you create goes inside this org so they're all in one place.

---

### Step 2 — Create a repo for the client inside your org

1. Go to [github.com/new](https://github.com/new) and select your org as the owner.
2. Name it something like `workshop-<clientname>` (e.g. `workshop-acme`).
3. Set it to **Private** and leave it empty (no README, no .gitignore).
4. Note the full URL — e.g. `https://github.com/AppModZ-CE4S/workshop-acme`

---

### Step 3 — Generate the client site using the Build form

1. Log in to the site linked above.
2. Navigate to **Build a Client Facing Site** from the hub.
3. Fill in:
   - **GitHub Repo URL** — the URL from Step 2
   - **Username / Password** — unique credentials for this client
   - **Client Name** — appears in the site hero heading
   - **Labs to Include** — select the labs relevant to this engagement
4. Click **Generate & Download Zip**.

The zip will download automatically and contains the complete deployable site plus a `README.md` with step-by-step instructions.

---

### Step 4 — Deploy using Bob

After downloading the zip, follow the instructions printed on screen (also inside the zip's `README.md`):

1. Unzip the folder and place it somewhere on your machine.
2. Open a **new instance of Bob** → **Open Folder** → select the unzipped folder.
3. In **Agent mode**, paste:

```
Please push this to my git repo located here: https://github.com/<your-org>/<your-repo> — push all files to the main branch, then tell me any manual steps I need to take to make the site live on GitHub Pages.
```

Bob will initialise git, commit all files, push to GitHub, and walk you through the rest.

---

### Step 5 — Enable GitHub Pages (manual step)

After Bob pushes the code:

1. Go to your repo on GitHub → **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **Deploy from a branch**.
3. Set branch to `main` and folder to `/ (root)`.
4. Click **Save**.

Your site will be live in ~1 minute at `https://<your-org>.github.io/<your-repo>/`.

---

### ⏱️ Step 6 — Delete the repo within 3 days of the event

> **This step is mandatory.**

The client-facing site contains IBM lab content that must not remain publicly accessible after the event.

**Within 3 days of the workshop ending:**

1. Go to your repo on GitHub → **Settings** → scroll to the bottom → **Delete this repository**.
2. Confirm deletion.

If you need to re-run the event or share content again, simply generate a fresh zip from the Build form.

---

## Local Development

```bash
cd PagesSite
npm install
npm run dev
```

Open [http://localhost:5173/GlobeLife/](http://localhost:5173/GlobeLife/)

> **Note:** If you have re-pathed this for a different repo, update the URL to match the `base` in `vite.config.js`.

---

## Adding or Updating Lab Content

Lab content is served as static markdown from `public/lab-instructions/`. To add or update labs:

1. Edit or add `.md` files in `public/lab-instructions/`
2. Update `public/lab-instructions/index.json` with the new lab entry
3. Add any new images to `public/lab-instructions/images/`
4. Run `npm run build` from the `PagesSite/` directory
5. Commit and push both `main` and the `dist/` (`gh-pages`) branch

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite 5 |
| Routing | react-router-dom v6 |
| Markdown | react-markdown + remark-gfm + rehype-raw |
| Diagrams | mermaid.js |
| Styling | Tailwind CSS + IBM Plex Sans/Mono |
| Deploy | Static `gh-pages` branch (built locally, pushed via Bob or manually) |
