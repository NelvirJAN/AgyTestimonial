# Testimonial Hub - System Context & Operational Architecture

> **Document Version:** 1.4.0  
> **Last Updated:** November 24, 2026, 18:45  
> **Status:** Production-Ready & Verified / Pushed to Google Apps Script & GitHub  
> **Repository:** `https://github.com/NelvirJAN/AgyTestimonial.git` (`main`)  
> **Latest Git Commit:** `029aa15` (*"Adopt Ben Collins server-rendered architecture and matching layout for Wall of Love"*)  
> **Apps Script Deployment:** `AKfycbzL0t0NZ6rChidIEx8DDqF_yq8BJx_G9HlM3IG_kmU_0w4EKSq5soZ1Vbu7s_fvx6N5` (**Version 12 / `@12`**)  
> **Apps Script ID:** `19wXYaiigS78Ce6b5xVLyGf4Dm-9PL0V3yGvaCM8K6Zroc9fDpUZGWg66`

---

## 1. Executive Summary & Purpose

**Testimonial Hub** is a self-contained, automated social proof collection, moderation, and delivery web application built entirely within Google Workspace technologies (**Google Apps Script**, **Google Sheets**, **Google Drive**), augmented with **Google Gemini AI** and **Slack / Google Chat** notifications.

### Core Problems Solved:
1. **Manual Collection Friction:** Eliminates back-and-forth emails requesting customer reviews, headshots, and permissions.
2. **Heavy Payload & Storage Bloat:** Avoids large image upload bloat and Google Apps Script execution timeout limits by compressing headshots client-side via HTML5 `<canvas>` before transmission.
3. **Manual Quote Extraction:** Leverages the Gemini API to automatically distill long user feedback into punchy, 1-sentence marketing highlights and categorize praise into dynamic topic tags.
4. **Data Privacy Risk:** Protects customer data by strictly ensuring submitter email addresses are accessible only in the protected admin dashboard and completely omitted from public Wall of Love endpoints and client-rendered HTML.
5. **Instant Team Alerts (Slack & Google Chat):** Real-time webhooks dispatch rich Slack Block Kit notifications featuring reviewer headshot avatars, star ratings, and Gemini quote highlights directly to team channels.
6. **Frictionless Moderation & Display:** Empowers the workspace owner to approve or edit AI quotes in one click and immediately stream updates to responsive, embeddable Wall of Love galleries.
7. **Session & Architecture Continuity:** Enforces persistent session context tracking via [`CONTEXT.md`](file:///c:/AntiGravity/AgyTestimonials/CONTEXT.md) and the dedicated [`save-progress`](file:///c:/AntiGravity/AgyTestimonials/.agents/skills/save-progress/SKILL.md) skill.
8. **Safe Two-Tier Deployment:** Guarantees deployment safety via [`push-all`](file:///c:/AntiGravity/AgyTestimonials/.agents/skills/push-all/SKILL.md), halting on Apps Script errors before any Git changes are committed.

---

## 2. Current Application State & Live Endpoints

The complete end-to-end user pipeline has been verified in live production with HTTP 200 OK responses:

| Interface | Live Web App Endpoint | Production Status | Description |
| :--- | :--- | :---: | :--- |
| **Public Submission Form** | [Form URL](https://script.google.com/macros/s/AKfycbzL0t0NZ6rChidIEx8DDqF_yq8BJx_G9HlM3IG_kmU_0w4EKSq5soZ1Vbu7s_fvx6N5/exec?page=form) | `200 OK` | Public intake form with canvas image compression, 5-star rating, and live aside preview. |
| **Admin Dashboard** | [Admin URL](https://script.google.com/macros/s/AKfycbzL0t0NZ6rChidIEx8DDqF_yq8BJx_G9HlM3IG_kmU_0w4EKSq5soZ1Vbu7s_fvx6N5/exec?page=admin) | `200 OK` | Workspace dashboard for moderation, quote editing, and Chart.js analytics. |
| **Wall of Love Gallery** | [Wall URL](https://script.google.com/macros/s/AKfycbzL0t0NZ6rChidIEx8DDqF_yq8BJx_G9HlM3IG_kmU_0w4EKSq5soZ1Vbu7s_fvx6N5/exec?page=wall) | `200 OK` | Responsive 3-column card grid with dynamic topic filtering and strict email privacy. |

### Project Inventory

| File | Type | Lines / Size | Primary Responsibility |
| :--- | :--- | :--- | :--- |
| [`Code.js`](file:///c:/AntiGravity/AgyTestimonials/Code.js) | Backend (Apps Script) | ~640 lines | Web App routing (`doGet`), submission pipeline, Drive file saving, Gemini 1.5 Flash AI integration, dual Slack Block Kit / Google Chat webhook dispatcher, Admin APIs, and sanitized public endpoints. |
| [`Form.html`](file:///c:/AntiGravity/AgyTestimonials/Form.html) | Frontend (Client Form) | ~530 lines | Mobile-responsive public submission form matching the Google Stitch design. Includes live aside preview, canvas image compression, top-level navigation, and confirmation screen. |
| [`Admin.html`](file:///c:/AntiGravity/AgyTestimonials/Admin.html) | Frontend (Admin App) | ~600 lines | Moderation & analytics dashboard matching Stitch design. Features Chart.js rating breakdown, AI topic progress bars, and inline quote/tag editing. |
| [`Wall.html`](file:///c:/AntiGravity/AgyTestimonials/Wall.html) | Frontend (Public Gallery) | ~440 lines | Embeddable 3-column responsive gallery matching Stitch design. Dynamic topic tag filtering, aggregate rating banner, and iframe embed code generator. |
| [`appsscript.json`](file:///c:/AntiGravity/AgyTestimonials/appsscript.json) | Config | Manifest | Google Apps Script project manifest configured with `"webapp": { "executeAs": "USER_DEPLOYING", "access": "ANYONE_ANONYMOUS" }`. |
| [`.clasp.json`](file:///c:/AntiGravity/AgyTestimonials/.clasp.json) | Config | Tooling | Google Clasp configuration pointing to remote script project `19wXYaiigS78Ce6b5xVLyGf4Dm-9PL0V3yGvaCM8K6Zroc9fDpUZGWg66`. |
| [`.claspignore`](file:///c:/AntiGravity/AgyTestimonials/.claspignore) | Config | Tooling | Whitelists only deployable Apps Script files (`appsscript.json`, `Code.js`, `*.html`). |
| [`README.md`](file:///c:/AntiGravity/AgyTestimonials/README.md) | Docs | ~180 lines | Comprehensive non-technical setup guide covering Drive, Gemini API, Slack/Google Chat, and deployment steps. |
| [`Spec.md`](file:///c:/AntiGravity/AgyTestimonials/Spec.md) | Docs | 58 lines | Original business logic and architectural constraints reference specification. |
| [`.agents/skills/save-progress/SKILL.md`](file:///c:/AntiGravity/AgyTestimonials/.agents/skills/save-progress/SKILL.md) | Agent Customization | ~70 lines | Standard Antigravity agent discovery route for `/saveProgress`. Instructs agents to review session history and update `CONTEXT.md`. |
| [`skills/SKILL.md`](file:///c:/AntiGravity/AgyTestimonials/skills/SKILL.md) | Agent Customization | ~70 lines | Root discovery route mirror for the `/saveProgress` skill. |
| [`.agents/skills/push-all/SKILL.md`](file:///c:/AntiGravity/AgyTestimonials/.agents/skills/push-all/SKILL.md) | Agent Customization | ~80 lines | Standard Antigravity agent discovery route for `/pushAll`. Executes sequential deployment to Apps Script (via Clasp) and Git/GitHub with a strict circuit breaker. |

---

## 3. End-to-End System Architecture & Data Flow

```
                                  [ Client Browser ]
                                          |
                +-------------------------+-------------------------+
                |                         |                         |
          (Submitter)                  (Admin)               (Public Visitor)
        Form.html /exec           Admin.html ?page=admin    Wall.html ?page=wall
                |                         |                         |
  [HTML5 Canvas Compress]                 |                         |
  - Resized to 400x400 JPEG               |                         |
  - Under ~50KB base64                    |                         |
                |                         |                         |
    google.script.run.            google.script.run.        google.script.run.
    submitTestimonial(...)        getAdminData()            getApprovedTestimonials()
                |                 updateTestimonial(...)            |
                v                         v                         v
  +-----------------------------------------------------------------------------+
  |                     Google Apps Script Backend (Code.js)                    |
  +-----------------------------------------------------------------------------+
         |                     |                     |                    |
         v                     v                     v                    v
  [ Google Drive ]      [ Gemini 1.5 Flash ]   [ Google Sheets ]   [ Slack / Chat ]
  - Saves file blob     - Structured JSON      - "Testimonials"    - Rich Block Kit
  - View permissions    - 1-sentence quote     - Row appended      - Avatar thumbnail
  - Direct display URL  - Topic tags           - Status: Pending   - Stars & AI quote
```

### URL Routing & Top-Level Navigation
- In `Code.js`, `doGet(e)` injects `template.scriptUrl = ScriptApp.getService().getUrl();` into templates.
- `<base target="_top">` is set in `<head>` of all HTML files so navigation between pages (`?page=form`, `?page=admin`, `?page=wall`) happens seamlessly in the main browser window without getting trapped in Google's iframe sandbox.

---

## 4. Notifications & Webhook Architecture

In [`Code.js`](file:///c:/AntiGravity/AgyTestimonials/Code.js), `sendNotification()` automatically detects the webhook destination from `CHAT_WEBHOOK_URL` (or `SLACK_WEBHOOK_URL`):

1. **Slack Webhooks (`hooks.slack.com`):**
   - Transmits a Slack Block Kit payload with header, reviewer name, rating, AI quote highlight, headshot thumbnail accessory, full testimonial blockquote, and context ID footer.
2. **Google Chat Webhooks (`chat.googleapis.com`):**
   - Transmits Google Chat `cardsV2` payload with circle avatar, quote widgets, and collapsible full submission.
3. **Generic / Discord Fallbacks:**
   - Transmits standard markdown text payload.

---

## 5. Data Models, Schemas & Secrets

### Google Sheets Database Schema (`Testimonials` Tab)

| Col | Field Name | Data Type | Example Value | Description |
| :---: | :--- | :--- | :--- | :--- |
| **A** | `ID` | String | `TEST-FBC80C91` | Unique submission identifier. |
| **B** | `Timestamp` | String | `2026-11-24 10:57:00` | Formatted local submission timestamp. |
| **C** | `Status` | String | `Pending` / `Approved` / `Rejected` | Moderation lifecycle state. |
| **D** | `Name` | String | `Elena Rostova` | Submitter's full name. |
| **E** | `Email` | String | `elena@studio.design` | Submitter's email (**Strictly Private**). |
| **F** | `Organization` | String | `Lead Designer, Acme` | Optional organization & title. |
| **G** | `Rating` | Number | `5` | Integer star rating (1 through 5). |
| **H** | `Full Testimonial` | String | `"Testimonial Hub transformed..."` | Complete raw testimonial copy. |
| **I** | `Best Quote` | String | `"Conversions jumped 38%..."` | Gemini-extracted 1-sentence highlight. |
| **J** | `Tags` | String | `Customer Story, 4-Star` | Comma-delimited topic keywords. |
| **K** | `Headshot URL` | String | `https://drive.google.com/thumbnail?...` | Direct high-res Drive display link. |

### Environment Variables & Script Properties
Configured under **Apps Script Project Settings > Script Properties**:

```javascript
PropertiesService.getScriptProperties()
```

| Key | Sensitivity | Required | Purpose |
| :--- | :--- | :---: | :--- |
| `GEMINI_API_KEY` | Secret | **Yes** | Authenticates calls to Google AI Studio for Gemini 1.5 Flash structured quote/tag generation. |
| `DRIVE_FOLDER_ID` | Internal ID | **Yes** | Target Google Drive folder where base64 headshots are decoded, saved, and given public link permissions. |
| `CHAT_WEBHOOK_URL` | Secret URL | Optional | Webhook URL for Slack (`hooks.slack.com`) or Google Chat (`chat.googleapis.com`) to post real-time submission notifications. |

---

## 6. Security, Privacy & Safety Rails

1. **Email Privacy Isolation:**
   - Submitter emails are recorded in Google Sheets exclusively for identity verification.
   - The public endpoint `getApprovedTestimonials()` explicitly strips the `Email` column from the returned JSON payload.
2. **AI Failure Resiliency:**
   - `processWithGemini()` is wrapped in a try/catch block with fallback logic. If the API hits a quota or fails, the submission continues uninterrupted with safe fallback quotes and tags.
3. **Payload Quota Protection:**
   - Raw multi-megabyte photos from mobile phones are resized client-side in the browser via `<canvas>` before being posted to Apps Script.
4. **XSS Protection:**
   - All dynamic strings rendered in the DOM are sanitized via `escapeHtml()`.
5. **Secret Isolation:**
   - Secrets are stored exclusively in server-side `PropertiesService`, preventing accidental exposure in client-facing HTML or repository code.
6. **Platform Boundary Management:**
   - Google Apps Script Cloud IDE rejects `.md` files via the Apps Script API (only `.js`, `.gs`, `.html`, and `appsscript.json` are permitted). All markdown documentation is maintained in Git version control.
7. **Server-Side Pre-Rendering for Public Web Apps (Ben Collins Pattern):**
   - For public read-only views like the Wall of Love, avoid client-side asynchronous fetch loops (`google.script.run`) with loading spinners, which can get trapped by iframe lifecycle events and browser storage restrictions.
   - Instead, pre-render the data directly on the server using native Apps Script scriptlets (`<? for (let item of items) { ?>`). The browser receives fully formed HTML with cards, counts, and tags on first paint with zero lag. All filtering and quote toggles execute locally in client-side CSS/DOM in real-time.

---

## 7. Deployment & Operations

### Initializing the System:
1. Open the Apps Script editor.
2. Select **`initSetup`** from the function list and click **Run**.
3. The function checks properties, creates the `Testimonials` sheet tab if missing, formats header styling, and logs status to the console.

### Deploying the Web App:
- Handled automatically via `/pushAll` or Clasp:
  ```bash
  clasp push -f
  clasp deploy -i AKfycbzL0t0NZ6rChidIEx8DDqF_yq8BJx_G9HlM3IG_kmU_0w4EKSq5soZ1Vbu7s_fvx6N5 -d "Release Description"
  ```
