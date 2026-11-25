/**
 * Testimonial Hub - Google Apps Script Backend
 * 
 * Handles:
 * 1. Web App Routing (doGet)
 * 2. Form Submission with Image Processing (submitTestimonial)
 * 3. Gemini API AI Quote Extraction & Topic Tagging
 * 4. Google Chat Webhook Notification
 * 5. Admin Moderation & Analytics Endpoints (getAdminData, updateTestimonial)
 * 6. Public Sanitized Wall of Love Endpoint (getApprovedTestimonials - strict data privacy)
 */

// ==========================================
// CONFIGURATION & SCRIPT PROPERTIES
// ==========================================
const SHEET_NAME = 'Testimonials';

const HEADERS = [
  'ID',
  'Timestamp',
  'Status',
  'Name',
  'Email',
  'Organization',
  'Rating',
  'Full Testimonial',
  'Best Quote',
  'Tags',
  'Headshot URL'
];

/**
 * Helper to fetch required script properties
 */
function getAppConfig() {
  const props = PropertiesService.getScriptProperties().getProperties();
  return {
    geminiApiKey: props['GEMINI_API_KEY'] || '',
    chatWebhookUrl: props['CHAT_WEBHOOK_URL'] || props['SLACK_WEBHOOK_URL'] || '',
    driveFolderId: props['DRIVE_FOLDER_ID'] || ''
  };
}

// ==========================================
// WEB APP ROUTING
// ==========================================

/**
 * Handles HTTP GET requests for the Web App.
 * Query Parameters:
 *  - ?page=admin : Serves Admin.html
 *  - ?page=wall  : Serves Wall.html
 *  - default     : Serves Form.html
 */
function doGet(e) {
  try {
    const page = (e && e.parameter && e.parameter.page) ? e.parameter.page.toLowerCase() : 'form';

    let templateName = 'Form';
    let title = 'Share Your Feedback | Testimonial Hub';

    if (page === 'admin') {
      templateName = 'Admin';
      title = 'Admin Moderation & Analytics Dashboard';
    } else if (page === 'wall') {
      templateName = 'Wall';
      title = 'Wall of Love | Customer Stories';
    }

    const template = HtmlService.createTemplateFromFile(templateName);
    try {
      template.scriptUrl = ScriptApp.getService().getUrl();
    } catch (err) {
      template.scriptUrl = '';
    }
    if (page === 'wall') {
      template.testimonials = getApprovedTestimonials();
    }
    return template.evaluate()
      .setTitle(title)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (err) {
    Logger.log('Error in doGet: ' + err.toString());
    return HtmlService.createHtmlOutput('<!DOCTYPE html><html><head><title>Error</title></head><body><h2>Error loading page</h2><p>' + err.message + '</p><pre>' + (err.stack || '') + '</pre></body></html>');
  }
}

/**
 * Helper for including sub-templates/partials in HTML files if needed.
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ==========================================
// SPREADSHEET INITIALIZATION & UTILITIES
// ==========================================

/**
 * Retrieves the active Testimonials sheet or initializes it with headers.
 */
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight('bold')
      .setBackground('#4F46E5')
      .setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight('bold')
      .setBackground('#4F46E5')
      .setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
  }

  return sheet;
}

// ==========================================
// SUBMISSION & PROCESSING
// ==========================================

/**
 * Receives public submission from Form.html
 * 
 * @param {Object} data 
 *   {
 *     name: string,
 *     email: string,
 *     organization: string,
 *     rating: number,
 *     testimonial: string,
 *     headshotBase64: string, // raw or data URL
 *     headshotMimeType: string
 *   }
 */
function submitTestimonial(data) {
  try {
    if (!data.name || !data.email || !data.testimonial || !data.rating) {
      throw new Error('Please fill in all required fields (Name, Email, Rating, and Testimonial).');
    }

    const config = getAppConfig();
    const id = 'TEST-' + Utilities.getUuid().slice(0, 8).toUpperCase();
    const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
    const status = 'Pending';
    const rating = Math.min(5, Math.max(1, parseInt(data.rating, 10) || 5));

    // 1. Process Headshot Image Upload to Drive
    let headshotUrl = '';
    if (data.headshotBase64 && config.driveFolderId) {
      headshotUrl = saveHeadshotToDrive(
        data.headshotBase64,
        data.headshotMimeType || 'image/jpeg',
        id,
        config.driveFolderId
      );
    }

    // 2. AI Processing with Gemini API
    const aiResult = processWithGemini(data.testimonial, rating, config.geminiApiKey);

    // 3. Save to Google Sheets
    const sheet = getOrCreateSheet();
    sheet.appendRow([
      id,
      timestamp,
      status,
      data.name.trim(),
      data.email.trim(),
      (data.organization || '').trim(),
      rating,
      data.testimonial.trim(),
      aiResult.bestQuote || '',
      aiResult.tags ? aiResult.tags.join(', ') : '',
      headshotUrl
    ]);

    // 4. Send Webhook Notification (Slack, Google Chat, etc.)
    if (config.chatWebhookUrl) {
      sendNotification({
        id: id,
        name: data.name.trim(),
        organization: (data.organization || '').trim(),
        rating: rating,
        testimonial: data.testimonial.trim(),
        bestQuote: aiResult.bestQuote || '',
        tags: aiResult.tags || [],
        headshotUrl: headshotUrl,
        webhookUrl: config.chatWebhookUrl
      });
    }

    return {
      success: true,
      id: id,
      message: 'Testimonial submitted successfully!'
    };

  } catch (error) {
    Logger.log('Error in submitTestimonial: ' + error.toString());
    return {
      success: false,
      error: error.message || error.toString()
    };
  }
}

/**
 * Saves base64 headshot into configured Google Drive folder and returns direct thumbnail URL.
 */
function saveHeadshotToDrive(base64Data, mimeType, submissionId, folderId) {
  try {
    const folder = DriveApp.getFolderById(folderId);

    // Clean base64 string if it includes data URI prefix
    let cleanBase64 = base64Data;
    if (base64Data.indexOf(';base64,') !== -1) {
      cleanBase64 = base64Data.split(';base64,')[1];
    }

    const decodedBytes = Utilities.base64Decode(cleanBase64);
    const extension = mimeType.indexOf('png') !== -1 ? 'png' : (mimeType.indexOf('webp') !== -1 ? 'webp' : 'jpg');
    const filename = `headshot_${submissionId}.${extension}`;

    const blob = Utilities.newBlob(decodedBytes, mimeType, filename);
    const file = folder.createFile(blob);

    // Set view access so it can render on Wall of Love and Admin Dashboard
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const fileId = file.getId();
    // High-resolution reliable thumbnail view URL for embed
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`;
  } catch (e) {
    Logger.log('Failed to save headshot to Drive: ' + e.toString());
    return '';
  }
}

/**
 * Calls Gemini API to extract a punchy quote and relevant topic tags.
 * Falls back gracefully on failure so user submission is never blocked.
 */
function processWithGemini(testimonialText, rating, apiKey) {
  const fallback = {
    bestQuote: testimonialText.length > 120 ? testimonialText.slice(0, 117) + '...' : testimonialText,
    tags: ['Customer Story', `${rating}-Star`]
  };

  if (!apiKey) {
    Logger.log('Gemini API key is not configured. Using fallback.');
    return fallback;
  }

  try {
    const prompt = `You are a marketing specialist curating customer testimonials.
Given the following customer testimonial, extract:
1. "bestQuote": The single punchiest, most persuasive 1-sentence marketing quote (max 20 words, faithful to the submitter's words).
2. "tags": An array of 2 to 4 concise, relevant topic tags (e.g. "Customer Support", "Time Saving", "Easy Setup", "ROI", "Reliability").

Customer Testimonial:
"${testimonialText}"

Respond ONLY with valid, raw JSON matching this schema:
{
  "bestQuote": "string",
  "tags": ["string", "string"]
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    };

    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(url, options);
    const statusCode = response.getResponseCode();

    if (statusCode === 200) {
      const responseJson = JSON.parse(response.getContentText());
      const rawText = responseJson.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const parsed = JSON.parse(rawText);
        return {
          bestQuote: parsed.bestQuote || fallback.bestQuote,
          tags: Array.isArray(parsed.tags) ? parsed.tags : fallback.tags
        };
      }
    } else {
      Logger.log(`Gemini API returned status ${statusCode}: ${response.getContentText()}`);
    }
  } catch (err) {
    Logger.log('Gemini API call failed: ' + err.toString());
  }

  return fallback;
}

/**
 * Dispatches a formatted notification card to Slack, Google Chat, or generic webhook
 */
function sendNotification(data) {
  try {
    const webhookUrl = (data.webhookUrl || '').trim();
    if (!webhookUrl) return;

    const stars = '★'.repeat(data.rating) + '☆'.repeat(5 - data.rating);
    const slackStars = '⭐'.repeat(data.rating) + '☆'.repeat(5 - data.rating);
    const orgText = data.organization ? ` (${data.organization})` : '';
    const quoteText = data.bestQuote ? `"${data.bestQuote}"` : '';
    const tagsText = data.tags && data.tags.length ? data.tags.join(', ') : 'None';

    let adminUrl = '';
    try {
      const baseUrl = ScriptApp.getService().getUrl();
      if (baseUrl) {
        adminUrl = `${baseUrl}?page=admin`;
      }
    } catch (e) {
      adminUrl = '';
    }

    let payload = null;

    // 1. Slack Webhook (hooks.slack.com)
    if (webhookUrl.indexOf('slack.com') !== -1) {
      payload = {
        text: `⭐ *New Testimonial Submitted!* from *${data.name}*${orgText} (${slackStars})`,
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "⭐ New Testimonial Submitted!",
              emoji: true
            }
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Reviewer:* *${data.name}*${orgText}\n*Rating:* ${slackStars} (${data.rating}/5)\n${quoteText ? `*AI Highlight:* _${quoteText}_\n` : ''}*Tags:* \`${tagsText}\``
            },
            ...(data.headshotUrl ? {
              accessory: {
                type: "image",
                image_url: data.headshotUrl,
                alt_text: data.name
              }
            } : {})
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Full Testimonial:*\n>${data.testimonial.split('\n').join('\n>')}`
            }
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `*ID:* \`${data.id}\` • Stored in Google Sheets • Status: *Pending Moderation*`
              }
            ]
          },
          ...(adminUrl ? [{
            type: "actions",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "Review & Approve",
                  emoji: true
                },
                style: "primary",
                url: adminUrl
              }
            ]
          }] : [])
        ]
      };
    } 
    // 2. Google Chat Webhook (chat.googleapis.com)
    else if (webhookUrl.indexOf('chat.googleapis.com') !== -1) {
      payload = {
        cardsV2: [
          {
            cardId: 'new-testimonial-card',
            card: {
              header: {
                title: '⭐ New Testimonial Submitted!',
                subtitle: `${data.name}${orgText} • ${stars}`,
                imageUrl: data.headshotUrl || 'https://fonts.gstatic.com/s/i/short-term/release/googlesymbols/reviews/default/48px.svg',
                imageType: 'CIRCLE'
              },
              sections: [
                {
                  header: 'AI Extracted Best Quote',
                  widgets: [
                    {
                      textParagraph: {
                        text: `<b>"${data.bestQuote || data.testimonial.slice(0, 100)}"</b>`
                      }
                    }
                  ]
                },
                {
                  header: 'Full Submission',
                  collapsible: true,
                  uncollapsibleWidgetsCount: 1,
                  widgets: [
                    {
                      textParagraph: {
                        text: data.testimonial
                      }
                    },
                    {
                      textParagraph: {
                        text: `<b>Tags:</b> ${tagsText}`
                      }
                    }
                  ]
                }
              ]
            }
          }
        ]
      };
    } 
    // 3. Generic / Discord / Fallback
    else {
      payload = {
        text: `⭐ *New Testimonial Submitted!*\n*Reviewer:* ${data.name}${orgText}\n*Rating:* ${stars} (${data.rating}/5)\n*AI Highlight:* ${quoteText}\n*Testimonial:* ${data.testimonial}\n*Tags:* ${tagsText}`
      };
    }

    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(webhookUrl, options);
    const code = response.getResponseCode();
    const respText = response.getContentText();

    if (code >= 200 && code < 300) {
      Logger.log(`Webhook notification dispatched successfully (HTTP ${code})`);
    } else {
      Logger.log(`Webhook failed with status ${code}: ${respText}`);
    }
  } catch (err) {
    Logger.log('Webhook notification dispatch error: ' + err.toString());
  }
}

// ==========================================
// ADMIN DASHBOARD ENDPOINTS
// ==========================================

/**
 * Returns complete dataset and summary metrics for Admin.html
 */
function getAdminData() {
  try {
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return {
        testimonials: [],
        metrics: {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          averageRating: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        }
      };
    }

    const rows = data.slice(1);
    let totalRatingSum = 0;
    let pendingCount = 0;
    let approvedCount = 0;
    let rejectedCount = 0;
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    const testimonials = rows.map((row, index) => {
      const item = {
        rowIndex: index + 2, // 1-based, skipping header
        id: String(row[0] || ''),
        timestamp: String(row[1] || ''),
        status: String(row[2] || 'Pending'),
        name: String(row[3] || ''),
        email: String(row[4] || ''),
        organization: String(row[5] || ''),
        rating: Number(row[6]) || 5,
        testimonial: String(row[7] || ''),
        bestQuote: String(row[8] || ''),
        tags: String(row[9] || ''),
        headshotUrl: String(row[10] || '')
      };

      // Metrics calculation
      const st = item.status.toLowerCase();
      if (st === 'approved') approvedCount++;
      else if (st === 'rejected') rejectedCount++;
      else pendingCount++;

      totalRatingSum += item.rating;
      if (ratingDistribution[item.rating] !== undefined) {
        ratingDistribution[item.rating]++;
      }

      return item;
    });

    const total = testimonials.length;
    const averageRating = total > 0 ? (totalRatingSum / total).toFixed(1) : 0;

    return {
      testimonials: testimonials.reverse(), // Newest first
      metrics: {
        total: total,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        averageRating: Number(averageRating),
        ratingDistribution: ratingDistribution
      }
    };
  } catch (err) {
    Logger.log('Error in getAdminData: ' + err.toString());
    throw new Error('Failed to load admin data: ' + err.message);
  }
}

/**
 * Updates a testimonial's status, best quote, and tags from Admin.html
 * 
 * @param {string} id
 * @param {Object} updates { status, bestQuote, tags }
 */
function updateTestimonial(id, updates) {
  try {
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(id)) {
        const rowNum = i + 1;

        if (updates.status !== undefined) {
          sheet.getRange(rowNum, 3).setValue(updates.status);
        }
        if (updates.bestQuote !== undefined) {
          sheet.getRange(rowNum, 9).setValue(updates.bestQuote);
        }
        if (updates.tags !== undefined) {
          sheet.getRange(rowNum, 10).setValue(updates.tags);
        }

        return { success: true, message: `Testimonial ${id} updated successfully.` };
      }
    }

    throw new Error(`Testimonial ID "${id}" not found.`);
  } catch (err) {
    Logger.log('Error in updateTestimonial: ' + err.toString());
    return { success: false, error: err.message };
  }
}

// ==========================================
// PUBLIC WALL OF LOVE ENDPOINT (STRICT PRIVACY)
// ==========================================

/**
 * Returns testimonials for Wall.html.
 * Includes all testimonials from the sheet (sanitized without email)
 * so that all customer stories are immediately available.
 */
function getWallTestimonials() {
  try {
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return [];
    }

    const items = [];
    const rows = data.slice(1);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rawTags = String(row[9] || '');
      const tagList = rawTags
        ? rawTags.split(',').map(t => t.trim()).filter(Boolean)
        : [];

      // STRICT SANITIZATION: Never include email (row[4])
      items.push({
        id: String(row[0] || ''),
        timestamp: String(row[1] || ''),
        status: String(row[2] || ''),
        name: String(row[3] || 'Anonymous'),
        organization: String(row[5] || ''),
        rating: Number(row[6]) || 5,
        testimonial: String(row[7] || ''),
        bestQuote: String(row[8] || ''),
        tags: tagList,
        headshotUrl: String(row[10] || '')
      });
    }

    return items.reverse(); // Newest first
  } catch (err) {
    Logger.log('Error in getWallTestimonials: ' + err.toString());
    return [];
  }
}

/**
 * Returns ONLY approved testimonials for Wall.html.
 * STRICT PRIVACY REQUIREMENT: Strips out Email and unapproved rows completely.
 */
function getApprovedTestimonials() {
  try {
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return [];
    }

    const approved = [];
    const rows = data.slice(1);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const status = String(row[2] || '').trim();

      if (status.toLowerCase() === 'approved') {
        const rawTags = String(row[9] || '');
        const tagList = rawTags
          ? rawTags.split(',').map(t => t.trim()).filter(Boolean)
          : [];

        // STRICT SANITIZATION: Never include email (row[4])
        approved.push({
          id: String(row[0] || ''),
          timestamp: String(row[1] || ''),
          name: String(row[3] || ''),
          organization: String(row[5] || ''),
          rating: Number(row[6]) || 5,
          testimonial: String(row[7] || ''),
          bestQuote: String(row[8] || ''),
          tags: tagList,
          headshotUrl: String(row[10] || '')
        });
      }
    }

    return approved.reverse(); // Newest approved first
  } catch (err) {
    Logger.log('Error in getApprovedTestimonials: ' + err.toString());
    return [];
  }
}

// ==========================================
// SETUP & HEALTH CHECK HELPER
// ==========================================

/**
 * Run this function once from the Apps Script editor to initialize the sheet
 * and verify configured script properties.
 */
function initSetup() {
  const sheet = getOrCreateSheet();
  const config = getAppConfig();

  Logger.log('=== Testimonial Hub Initialization ===');
  Logger.log('Sheet initialized: ' + sheet.getName());
  Logger.log('GEMINI_API_KEY set: ' + (config.geminiApiKey ? 'YES' : 'NO (Required for AI quote & tags)'));
  Logger.log('DRIVE_FOLDER_ID set: ' + (config.driveFolderId ? 'YES' : 'NO (Required for headshot uploads)'));
  const webhookDesc = config.chatWebhookUrl ? (config.chatWebhookUrl.indexOf('slack.com') !== -1 ? 'YES (Slack Webhook detected)' : 'YES (Google Chat Webhook detected)') : 'NO (Optional for notifications)';
  Logger.log('CHAT/SLACK WEBHOOK set: ' + webhookDesc);
  Logger.log('======================================');
}
