### Role
You are an Expert Google Apps Script Developer and Full-Stack Workspace Architect. Write clean, well-commented, modular, production-ready code for Google Workspace.

### Goal
Build a 4-layer Testimonial Collection System (Submission Form, Admin Dashboard, Embeddable Wall of Love, and Google Chat Notification) powered by Google Sheets, Google Drive, and the Gemini API, styled to match the accompanying Google Stitch design specification.

### Context & Constraints
- **Target Architecture:** Standalone Google Apps Script Web App (`HtmlService`) paired with Google Sheets, Google Drive, the Gemini API, and a Google Chat Webhook.
- **UI & Design Alignment:** Implement the front-end interfaces (`Form.html`, `Admin.html`, `Wall.html`) using the layout, styling, and component structure defined in the accompanying Google Stitch design file.
- **Database & Storage:** Use Google Sheets as the primary database and a dedicated Google Drive folder for headshot storage.
- **AI Processing:** Integrate the Gemini API (`UrlFetchApp`) for natural language topic tagging and single-sentence quote extraction.
- **Strict Data Privacy:** Never expose submitter email addresses to the public Wall of Love endpoint or client-side public HTML.
- **Self-Contained:** Keep all backend logic within Google Apps Script using native Workspace services and `PropertiesService` for API keys and webhook URLs.

---

### The 6-Pillar Specification

**1. Context (The "Why")**
Remove the manual friction of collecting, curating, and displaying customer testimonials. By automating image optimization, AI topic tagging, and best-quote extraction, the business owner can approve social proof in one click and embed targeted, filterable testimonials on sales pages without exposing customer emails.

**2. Trigger & Routing (How It Starts)**
- **Submitter:** Opens the public Web App URL (`doGet()`) to access `Form.html` and submits a testimonial (`google.script.run` or `doPost()`).
- **System Automation:** Upon form submission, the backend automatically compresses/saves the headshot, calls the Gemini API, writes the row to Google Sheets, and triggers a Google Chat webhook notification.
- **Admin:** Opens the Web App URL with a query parameter (e.g., `?page=admin`) to load `Admin.html` for moderation, quote editing, and analytics.
- **Public Viewer:** Loads an embeddable iframe or Web App URL with a query parameter (e.g., `?page=wall`) to view `Wall.html` displaying only approved testimonials.

**3. Data & Logic (Step-by-Step Flow)**
1. **Intake (`Form.html`):** Collects `Name`, `Email`, `Organization` (optional), `Rating` (1–5), `Testimonial Text`, and `Headshot Image`.
2. **Client & Server Image Processing:** Before uploading, the form checks image file size and resizes/compresses the headshot via HTML5 `<canvas>` (e.g., max 400x400px, under 500KB). The backend decodes the Base64 image, saves it to a configured Google Drive folder, sets view permissions so the image renders on the Wall of Love, and retrieves a direct thumbnail/display URL.
3. **AI Processing (Gemini API):** Sends the raw testimonial text to the Gemini API (using an API key stored in `PropertiesService`) with a structured JSON prompt to:
   - Extract the single best, punchiest marketing quote (1 sentence).
   - Assign relevant topic tags (e.g., `"beginner-friendly"`, `"time-saving"`, `"Google Sheets"`, `"AI tools"`).
4. **Database Storage (Google Sheets):** Appends a new row to the `Testimonials` tab with columns:
   `[ID, Timestamp, Status ("Pending"), Name, Email, Organization, Rating, Full Testimonial, Best Quote, Tags, Headshot URL]`
5. **Notification (Google Chat):** Posts a formatted card or text message to a Google Chat space webhook (stored in `PropertiesService`) alerting the admin of the new submission, rating, and extracted quote.
6. **Admin Moderation (`Admin.html`):** Displays summary metrics (total submissions, average rating, status breakdown chart via Chart.js) and a moderation table where the admin can edit the `Best Quote` or `Tags` and toggle `Status` between `Pending`, `Approved`, and `Rejected`.
7. **Public Delivery (`Wall.html`):** Fetches only rows where `Status === "Approved"`, strips out the `Email` field entirely on the server side, and renders a filterable gallery with dynamic topic filter buttons at the top.

**4. Interface (The User Experience)**
- **Submission Form (`Form.html`):** Mobile-responsive form matching the Google Stitch design, featuring star-rating selection, client-side image preview/compression, and a clear confirmation screen upon submission.
- **Admin Dashboard (`Admin.html`):** Clean dashboard reading from the Sheet, displaying a submissions/ratings chart (Chart.js) and inline controls to approve, reject, or edit AI-generated quotes and tags.
- **Wall of Love (`Wall.html`):** Embeddable, responsive card grid displaying approved testimonials (toggleable or defaulted to Best Quote + Full Testimonial), Name, Headshot, Organization, and Star Rating, with interactive topic filter pills at the top.

**5. Safety Rails (What NOT to Do)**
- **Data Privacy:** NEVER include the `Email` column or unapproved (`Pending`/`Rejected`) rows in the payload returned to `Wall.html`.
- **AI Fallback:** If the Gemini API times out, hits a rate limit, or fails, do NOT block or crash the user's submission—save the testimonial with empty `Best Quote`/`Tags` fields and flag it for manual review.
- **Drive & Payload Limits:** Reject unsupported file types and resize images client-side before transmission so uploads never exceed Apps Script payload limits or bloat Google Drive.
- **XSS Security:** Escape/sanitize all user-submitted text inputs before rendering them in `Admin.html` and `Wall.html`.
- **Secret Management:** Never hardcode the Gemini API key or Google Chat Webhook URL in source files; read them exclusively from `PropertiesService.getScriptProperties()`.

**6. Output & Deployment Requirements**
Provide the complete, modular Google Apps Script codebase along with setup instructions:
- `Code.gs`: Backend routing (`doGet`), form submission handler, Drive upload/permission logic, Gemini API integration, Google Chat webhook sender, and server-side admin/public data getters.
- `Form.html`: Client-facing submission UI with client-side image resizing.
- `Admin.html`: Admin dashboard, Chart.js analytics, and moderation interface.
- `Wall.html`: Embeddable Wall of Love gallery with dynamic topic tag filtering.
- `README` / Setup Guide: Step-by-step instructions for a non-coder covering Google Sheet tab/header setup, Drive folder ID configuration, adding `GEMINI_API_KEY` and `CHAT_WEBHOOK_URL` to Script Properties, and deploying as a Web App (`Execute as: Me`, `Who has access: Anyone`).