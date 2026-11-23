# Testimonial Hub 🌟

A complete, self-contained **Testimonial Collection & Social Proof System** built with **Google Apps Script**, **Google Sheets**, **Google Drive**, the **Gemini API**, and styled to match the Google Stitch **"Testimonial Hub Design Suite"** specification.

---

## Architecture Overview

```
                      +---------------------------------------+
                      |       Google Apps Script Web App      |
                      |                 doGet(e)              |
                      +-------------------+-------------------+
                                          |
             +----------------------------+----------------------------+
             |                            |                            |
      (default / none)             (?page=admin)                  (?page=wall)
             v                            v                            v
    [ Form.html UI ]              [ Admin.html UI ]            [ Wall.html UI ]
  - Interactive 5-star rating   - 4 Real-time KPI cards      - Approved-only grid
  - Client-side Canvas resize   - Chart.js rating breakdown  - Dynamic topic pills
  - Real-time aside preview     - Gemini topic analysis      - Strict email stripping
  - Instant submission banner   - Edit quotes & tags         - One-click embed code
             |                  - One-click approve/reject             |
             |                            |                            |
             +----------------------------+----------------------------+
                                          |
                                  [ Code.js Backend ]
                                          |
           +--------------------+---------+---------+--------------------+
           |                    |                   |                    |
           v                    v                   v                    v
    [ Google Drive ]     [ Gemini 1.5 API ]  [ Google Sheets ]    [ Google Chat ]
   Headshot storage &   1-sentence quote &   "Testimonials" tab   Real-time rich
   public display URLs  natural topic tags   Database of record   card alerts
```

---

## File Structure

| File | Purpose |
| :--- | :--- |
| [`Code.js`](file:///c:/AntiGravity/AgyTestimonials/Code.js) | Backend routing (`doGet`), Drive upload, Gemini AI integration, Google Chat webhooks, admin & public data APIs. |
| [`Form.html`](file:///c:/AntiGravity/AgyTestimonials/Form.html) | Mobile-responsive public submission form with client-side canvas image compression (max 400×400px), star rating, and confirmation screen. |
| [`Admin.html`](file:///c:/AntiGravity/AgyTestimonials/Admin.html) | Moderation dashboard featuring Chart.js analytics, AI topic theme bars, inline quote/tag editor, and moderation queue (`Pending`, `Approved`, `Rejected`). |
| [`Wall.html`](file:///c:/AntiGravity/AgyTestimonials/Wall.html) | Embeddable 3-column Wall of Love gallery with dynamic topic tag filtering, responsive design, and strict email privacy. |
| [`Spec.md`](file:///c:/AntiGravity/AgyTestimonials/Spec.md) | Business logic and functional specification document. |

---

## Step-by-Step Setup Guide

### 1. Create a Dedicated Google Drive Folder
1. Go to [Google Drive](https://drive.google.com).
2. Create a new folder (e.g., `Testimonial Headshots`).
3. Open the folder and copy its **Folder ID** from the browser URL:
   ```
   https://drive.google.com/drive/folders/1aBcDeFgHiJkLmNoPqRsTuVwXyZ
                                          ^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                                (This is the ID)
   ```

### 2. Obtain Your Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Click **Get API key** and create/copy your key.

### 3. (Optional) Set Up Google Chat Webhook
1. In Google Chat, go to the space where you want notifications.
2. Click the space name > **Apps & Integrations** > **Webhooks**.
3. Create a new incoming webhook named `Testimonial Bot` and copy its URL.

### 4. Configure Google Apps Script Properties
1. In your Google Sheet, open the script editor: **Extensions** > **Apps Script**.
2. Copy the contents of [`Code.js`](file:///c:/AntiGravity/AgyTestimonials/Code.js), [`Form.html`](file:///c:/AntiGravity/AgyTestimonials/Form.html), [`Admin.html`](file:///c:/AntiGravity/AgyTestimonials/Admin.html), and [`Wall.html`](file:///c:/AntiGravity/AgyTestimonials/Wall.html) into your Apps Script project.
3. In the left sidebar of the Apps Script editor, click the gear icon (**Project Settings**).
4. Scroll down to **Script Properties** and click **Edit script properties**.
5. Add the following three key-value pairs:

| Property Name | Value | Required? |
| :--- | :--- | :--- |
| `DRIVE_FOLDER_ID` | Your Google Drive Folder ID from Step 1 | **Yes** (stores uploaded headshots) |
| `GEMINI_API_KEY` | Your Google AI Studio API Key from Step 2 | **Yes** (for AI quote & topic tagging) |
| `CHAT_WEBHOOK_URL` | Your Google Chat incoming webhook URL from Step 3 | Optional (for instant submission alerts) |

6. Click **Save script properties**.

### 5. Initialize the Spreadsheet
1. In the Apps Script code editor, select the function **`initSetup`** from the function dropdown at the top.
2. Click **Run**.
3. Accept the authorization permissions prompt.
4. Check the **Execution log**—it will verify that the `Testimonials` sheet and headers are generated and report your property configuration status:
   ```
   === Testimonial Hub Initialization ===
   Sheet initialized: Testimonials
   GEMINI_API_KEY set: YES
   DRIVE_FOLDER_ID set: YES
   CHAT_WEBHOOK_URL set: YES
   ======================================
   ```

---

## Deployment as a Web App

1. In the top-right corner of the Apps Script editor, click **Deploy** > **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Fill in the deployment details:
   - **Description:** `Testimonial Hub v1.0`
   - **Execute as:** `Me (your email address)` *(critical so submissions can access Drive and Sheets without user login)*
   - **Who has access:** `Anyone` *(allows customers to submit testimonials without needing Google accounts)*
4. Click **Deploy**.
5. Copy the generated **Web App URL** (e.g., `https://script.google.com/macros/s/.../exec`).

---

## Web App Routing & Endpoints

Append the `page` query parameter to your Web App URL:

| Destination | URL Parameter | Description |
| :--- | :--- | :--- |
| **Public Submission Form** | `https://script.google.com/.../exec` *(default)* | Clean, branded submission interface for customers. |
| **Admin Moderation Dashboard** | `https://script.google.com/.../exec?page=admin` | Workspace dashboard for moderation, quote editing, and analytics. |
| **Embeddable Wall of Love** | `https://script.google.com/.../exec?page=wall` | Public customer story gallery with topic filter pills. |

---

## Embedding the Wall of Love

You can embed the Wall of Love on any website (Webflow, WordPress, Notion, Shopify, custom HTML) using an iframe:

```html
<iframe 
  src="https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?page=wall" 
  width="100%" 
  height="850" 
  frameborder="0" 
  style="border: 0; border-radius: 16px; overflow: hidden; width: 100%; min-height: 850px;" 
  allowtransparency="true">
</iframe>
```

> **Tip:** You can also click the **`</> Copy Embed Code`** button at the bottom dock of the live Wall of Love page to copy this snippet automatically with your active URL.

---

## Built-In Safety Rails & Privacy Guarantees

- **Strict Data Privacy:** Submitter email addresses are **never** returned by `getApprovedTestimonials()` or passed to `Wall.html`. Emails are exclusively viewable in the protected Admin moderation table.
- **Client-Side Image Resizing:** Photos are pre-compressed using HTML5 `<canvas>` (max 400×400px JPEG, ~50KB) before transmission, completely preventing Apps Script payload quota errors.
- **AI Non-Blocking Fallback:** If the Gemini API hits a quota or is unavailable, the submission continues uninterrupted with safe fallback quotes and tags, flagging the row for manual review without erroring out on the submitter.
- **XSS Sanitization:** All user inputs are escaped via `escapeHtml()` prior to DOM rendering.
- **Secret Isolation:** API keys and webhook URLs are stored exclusively in `PropertiesService` and never exposed in client HTML or script templates.
