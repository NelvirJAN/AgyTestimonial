# Testimonial Hub - System Context & Operational Architecture

> **Document Version:** 1.0.0  
> **Last Updated:** November 2026  
> **Status:** Production-Ready / Pushed to Google Apps Script & GitHub  
> **Repository:** `https://github.com/NelvirJAN/AgyTestimonial.git` (`main`)  
> **Apps Script ID:** `19wXYaiigS78Ce6b5xVLyGf4Dm-9PL0V3yGvaCM8K6Zroc9fDpUZGWg66`

---

## 1. Executive Summary & Purpose

**Testimonial Hub** is a self-contained, automated social proof collection, moderation, and delivery web application built entirely within Google Workspace technologies (**Google Apps Script**, **Google Sheets**, **Google Drive**), augmented with **Google Gemini AI** and **Google Chat**.

### Core Problem Solved:
1. **Manual Collection Friction:** Eliminates back-and-forth emails requesting customer reviews, headshots, and permissions.
2. **Heavy Payload & Storage Bloat:** Avoids large image uploads bloat and Google Apps Script execution timeout limits by compressing headshots client-side via HTML5 `<canvas>` before transmission.
3. **Manual Quote Extraction:** Leverages the Gemini API to automatically distill long user feedback into punchy, 1-sentence marketing highlights and categorize praise into dynamic topic tags.
4. **Data Privacy Risk:** Protects customer data by strictly ensuring submitter email addresses are accessible only in the protected admin dashboard and completely omitted from public Wall of Love endpoints and client-rendered HTML.
5. **Frictionless Moderation & Display:** Empowers the workspace owner to approve or edit AI quotes in one click and immediately stream updates to responsive, embeddable Wall of Love galleries.

---

## 2. Current Application State

The project is fully built, tested, pushed to Google Apps Script via Clasp, and synchronized to the GitHub `main` branch.

### Project Inventory

| File | Type | Lines / Size | Primary Responsibility |
| :--- | :--- | :--- | :--- |
| [`Code.js`](file:///c:/AntiGravity/AgyTestimonials/Code.js) | Backend (Apps Script) | ~400 lines | Web App routing (`doGet`), submission pipeline, Drive file saving, Gemini 1.5 Flash AI integration, Google Chat webhooks, Admin APIs, and sanitized public endpoints. |
| [`Form.html`](file:///c:/AntiGravity/AgyTestimonials/Form.html) | Frontend (Client Form) | ~530 lines | Mobile-responsive public submission form matching the Google Stitch "Public Testimonial Submission Form" design. Includes live aside preview, canvas image compression, and confirmation screen. |
| [`Admin.html`](file:///c:/AntiGravity/AgyTestimonials/Admin.html) | Frontend (Admin App) | ~600 lines | Moderation & analytics dashboard matching Stitch "Admin Moderation & Analytics Dashboard". Features Chart.js rating breakdown, AI topic progress bars, and inline quote/tag editing. |
| [`Wall.html`](file:///c:/AntiGravity/AgyTestimonials/Wall.html) | Frontend (Public Gallery) | ~440 lines | Embeddable 3-column responsive gallery matching Stitch "Embeddable Wall of Love Gallery". Dynamic topic tag filtering, aggregate rating banner, and iframe embed code generator. |
| [`appsscript.json`](file:///c:/AntiGravity/AgyTestimonials/appsscript.json) | Config | Manifest | Google Apps Script project manifest (`runtimeVersion: V8`, `timeZone: Asia/Shanghai`, Stackdriver exception logging). |
| [`.clasp.json`](file:///c:/AntiGravity/AgyTestimonials/.clasp.json) | Config | Tooling | Google Clasp configuration pointing to remote script project `19wXYaiigS78Ce6b5xVLyGf4Dm-9PL0V3yGvaCM8K6Zroc9fDpUZGWg66`. |
| [`.claspignore`](file:///c:/AntiGravity/AgyTestimonials/.claspignore) | Config | Tooling | Whitelists only deployable Apps Script files (`appsscript.json`, `Code.js`, `*.html`). |
| [`README.md`](file:///c:/AntiGravity/AgyTestimonials/README.md) | Docs | ~180 lines | Comprehensive non-technical setup guide covering Drive, Gemini API, Google Chat, and deployment steps. |
| [`Spec.md`](file:///c:/AntiGravity/AgyTestimonials/Spec.md) | Docs | 58 lines | Original business logic and architectural constraints reference specification. |

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
  [ Google Drive ]      [ Gemini 1.5 Flash ]   [ Google Sheets ]   [ Google Chat ]
  - Saves file blob     - Structured JSON      - "Testimonials"    - Rich card alert
  - View permissions    - 1-sentence quote     - Row appended      - Stars, quote,
  - Direct display URL  - Topic tags           - Status: Pending     avatar thumbnail
```

### URL Routing Logic (`doGet`)
Incoming HTTP GET requests to the Web App are handled dynamically:
- `?page=admin` $\rightarrow$ Evaluates and serves [`Admin.html`](file:///c:/AntiGravity/AgyTestimonials/Admin.html)
- `?page=wall` $\rightarrow$ Evaluates and serves [`Wall.html`](file:///c:/AntiGravity/AgyTestimonials/Wall.html)
- Default / No parameter $\rightarrow$ Evaluates and serves [`Form.html`](file:///c:/AntiGravity/AgyTestimonials/Form.html)
- All views are rendered with `HtmlService.XFrameOptionsMode.ALLOWALL` to support embedding in iframes (Webflow, WordPress, Notion, custom sites).

---

## 4. Data Models, Schemas & Secrets

### Google Sheets Database Schema (`Testimonials` Tab)

| Col | Field Name | Data Type | Example Value | Description |
| :---: | :--- | :--- | :--- | :--- |
| **A** | `ID` | String | `TEST-9B3E1F8A` | Unique submission identifier. |
| **B** | `Timestamp` | String | `2026-11-23 17:30:00` | Formatted local submission timestamp. |
| **C** | `Status` | String | `Pending` / `Approved` / `Rejected` | Moderation lifecycle state. |
| **D** | `Name` | String | `Elena Rostova` | Submitter's full name. |
| **E** | `Email` | String | `elena@studio.design` | Submitter's email (**Strictly Private**). |
| **F** | `Organization` | String | `Lead Designer, Acme` | Optional organization & title. |
| **G** | `Rating` | Number | `5` | Integer star rating (1 through 5). |
| **H** | `Full Testimonial` | String | `"Testimonial Hub transformed..."` | Complete raw testimonial copy. |
| **I** | `Best Quote` | String | `"Conversions jumped 38%..."` | Gemini-extracted 1-sentence highlight. |
| **J** | `Tags` | String | `Conversion Rate, Wall Widget` | Comma-delimited topic keywords. |
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
| `CHAT_WEBHOOK_URL` | Secret URL | Optional | Webhook URL for Google Chat space to post real-time submission notifications. |

---

## 5. Component Deep Dive

### 1. Submission Form (`Form.html`)
- **Visual Design:** Faithfully implements the Google Stitch desktop & mobile layouts using Tailwind CSS, Inter, and Plus Jakarta Sans.
- **Client-Side Optimization:**
  - File picker + drag-and-drop circular avatar container.
  - HTML5 `<canvas>` center-crops and compresses image to max 400×400px JPEG (~40–60KB).
  - Eliminates transmission lag and prevents Apps Script 50MB payload limits.
- **Dynamic UX:**
  - Interactive 5-star selector with hover/click feedback.
  - Live character counter (0 / 600 characters).
  - Real-time aside preview updating name, organization, quote, and avatar on keystroke.
  - Form validation with animated loading states and celebratory Thank You view.

### 2. Admin Dashboard (`Admin.html`)
- **Key Metrics:** 4 real-time KPI cards reflecting sheet stats (Total, Average Rating, Pending, Live on Wall).
- **Analytics:**
  - Chart.js horizontal/vertical bar chart visualizing 1★ to 5★ distributions.
  - Dynamic topic theme progress bars derived from AI tags across submissions.
- **Moderation Queue:**
  - Tabbed interface (`Pending`, `Approved`, `Rejected`) with live count badges.
  - Multi-parameter search (name, email, company, quote, tags) and rating/sort filters.
  - In-place editing: Best quotes can be tweaked and saved directly to the Sheet.
  - Interactive tag management (add new tag via prompt, remove existing tag).
  - One-click status transitions (**Approve to Wall**, **Reject**, **Move to Pending**).
  - Floating toast notifications.

### 3. Embeddable Wall of Love (`Wall.html`)
- **Social Proof Hero:** Aggregate rating badge (e.g. `4.9/5 from 42 verified reviews`) and customer avatar cluster.
- **Dynamic Topic Filtering:** Automatically extracts all unique tags present across approved testimonials and generates interactive pill buttons ("All Reviews", "Time-Saving", "Google Sheets", etc.).
- **Card Grid:** Clean, responsive 3-column card grid highlighting the bold AI quote, star rating, verified customer badge, review copy, and author info.
- **Embed Dock:** Persistent bottom bar with a single-click **"Copy Embed Code"** button that copies a ready-to-use `<iframe>` snippet pointing to the active wall.

---

## 6. Security, Privacy & Safety Rails

1. **Email Privacy Isolation:**
   - Submitter emails are recorded in the Google Sheet for identity verification.
   - The public endpoint `getApprovedTestimonials()` explicitly excludes the `Email` column from the returned JSON payload.
   - `Wall.html` contains zero references or DOM elements for emails.
2. **AI Failure Resiliency:**
   - `processWithGemini()` is wrapped in a try/catch block with fallback logic.
   - If the API times out, rate limits, or fails, the submission **never blocks or errors** for the user; default quotes and tags are assigned, and the submission is marked for review.
3. **Payload Quota Protection:**
   - Raw multi-megabyte camera photos from mobile phones are resized client-side in the browser before being posted to Apps Script.
4. **XSS Protection:**
   - All dynamic strings rendered in the DOM are sanitized via `escapeHtml()`.
5. **Secret Isolation:**
   - Secrets are stored exclusively in server-side `PropertiesService`, preventing accidental exposure in client-facing HTML or repository code.

---

## 7. Deployment & Operations

### Initializing the System:
1. Open the Apps Script editor.
2. Select **`initSetup`** from the function list and click **Run**.
3. The function checks properties, creates the `Testimonials` sheet tab if missing, formats header styling, and logs status to the console.

### Deploying the Web App:
- **Click:** Deploy $\rightarrow$ New deployment $\rightarrow$ Web app.
- **Configuration:**
  - Execute as: `Me`
  - Who has access: `Anyone`
- **Endpoints Generated:**
  - Form: `https://script.google.com/macros/s/<DEPLOYMENT_ID>/exec`
  - Admin: `https://script.google.com/macros/s/<DEPLOYMENT_ID>/exec?page=admin`
  - Wall: `https://script.google.com/macros/s/<DEPLOYMENT_ID>/exec?page=wall`

---

## 8. Maintenance & Extension Opportunities

- **Custom Themes:** The Wall of Love iframe can accept additional URL parameters (e.g., `?page=wall&theme=dark` or `&accent=indigo`) to dynamically style the widget.
- **Video Testimonials:** Future enhancement can support Google Drive video uploads or Loom embed links.
- **Automated Digest:** A weekly time-driven Apps Script trigger (`ScriptApp.newTrigger`) could send an email summary of newly approved testimonials.
