const express = require('express');
const Eureka = require('eureka-js-client').Eureka;
const mysql = require('mysql2/promise');
const nodemailer = require('nodemailer');
const amqp = require('amqplib');

const app = express();
const PORT = process.env.PORT || 8088;

app.use(express.json());

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'learnivo',
  port: process.env.DB_PORT || 3306
};

// Email transporter (Gmail SMTP)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'hazem.ankoud10@gmail.com',
    pass: process.env.SMTP_PASS || 'rgfr titf wzud ruzg'
  }
});

// ── Bad Words Filter ────────────────────────────────────────────────────────
const badWords = [
  'idiot', 'stupid', 'dumb', 'hate', 'terrible', 'awful', 'shut up', 'useless', 
  'garbage', 'trash', 'damn', 'hell', 'crap', 'fuck', 'shit', 'asshole', 'bitch',
  'dick', 'piss', 'bastard', 'slut', 'whore', 'moron'
];

function containsBadWords(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return badWords.some(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(lower);
  });
}

// ── AI Summarization (Extractive) ───────────────────────────────────────────
function extractSummary(text) {
  if (!text || text.length < 50) return text;
  // Simple heuristic: get the first full sentence that has a meaningful length
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  for (let s of sentences) {
    if (s.trim().split(' ').length > 4) {
      return s.trim();
    }
  }
  return text.substring(0, 100) + '...';
}

// ── AI Similarity Checker (Jaccard Index) ──────────────────────────────────
function calculateSimilarity(str1, str2) {
  const set1 = new Set((str1 || '').toLowerCase().match(/\w+/g) || []);
  const set2 = new Set((str2 || '').toLowerCase().match(/\w+/g) || []);
  if (set1.size === 0 || set2.size === 0) return 0;
  let intersection = 0;
  for (let word of set1) {
    if (set2.has(word)) intersection++;
  }
  return intersection / (set1.size + set2.size - intersection);
}

// ── AI Advanced Functions ──────────────────────────────────────────────────

function predictCategory(text) {
  const lower = (text || '').toLowerCase();
  if (lower.includes('password') || lower.includes('login') || lower.includes('account') || lower.includes('sign in')) return 'Account';
  if (lower.includes('payment') || lower.includes('billing') || lower.includes('refund') || lower.includes('price') || lower.includes('invoice')) return 'Billing';
  if (lower.includes('bug') || lower.includes('error') || lower.includes('crash') || lower.includes('slow') || lower.includes('not working')) return 'Technical';
  if (lower.includes('course') || lower.includes('lesson') || lower.includes('content') || lower.includes('quiz')) return 'Content';
  return 'General';
}

function generateDraftResponse(analysis, category, subject) {
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const subjectSnippet = (subject || 'your issue').substring(0, 60);

  // Category-specific action lines
  const categoryActions = {
    Technical: [
      'Our engineering team will investigate the root cause and deploy a fix.',
      'We are escalating this to our technical support specialists for immediate diagnosis.',
      'A senior developer has been assigned to troubleshoot this problem.',
      'We will reproduce the issue in our test environment and provide a patch.'
    ],
    Billing: [
      'Our finance department will review your account and process any necessary adjustments.',
      'We are verifying your payment records and will issue a correction if needed.',
      'A billing specialist will contact you within 24 hours to resolve this.',
      'We will audit the transaction history and ensure your account is properly updated.'
    ],
    Account: [
      'Our security team will verify your identity and restore access promptly.',
      'We are reviewing your account settings to resolve the access issue.',
      'An account specialist has been assigned to assist you directly.',
      'We will perform a full security check and reset any compromised credentials.'
    ],
    Content: [
      'Our content review team will evaluate the material and make necessary corrections.',
      'We are forwarding this to the course instructor for immediate review.',
      'A curriculum specialist will assess the issue and update the content.',
      'We will verify the course material accuracy and publish corrections if needed.'
    ],
    General: [
      'Our support team will review your request and provide a detailed response.',
      'We have assigned a dedicated agent to look into this matter.',
      'Your request has been queued for review by our experienced support staff.',
      'We are carefully evaluating your concern to provide the best resolution.'
    ]
  };

  // Greeting variations by sentiment
  const greetings = {
    NEGATIVE: [
      `Dear Student, I sincerely apologize for the inconvenience regarding "${subjectSnippet}".`,
      `Dear Student, I understand your frustration with "${subjectSnippet}" and I want to assure you we take this seriously.`,
      `Dear Student, I'm truly sorry you're experiencing this issue with "${subjectSnippet}".`,
      `Dear Student, we deeply regret the trouble you've encountered concerning "${subjectSnippet}".`
    ],
    NEUTRAL: [
      `Hello! Thank you for reaching out about "${subjectSnippet}".`,
      `Hi there! We appreciate you contacting us regarding "${subjectSnippet}".`,
      `Dear Student, thank you for bringing "${subjectSnippet}" to our attention.`,
      `Hello! We've received your claim about "${subjectSnippet}" and want to help.`
    ],
    POSITIVE: [
      `Hello! Thank you so much for your thoughtful feedback on "${subjectSnippet}".`,
      `Hi! We really appreciate you taking the time to share your thoughts about "${subjectSnippet}".`,
      `Dear Student, we're grateful for your constructive input regarding "${subjectSnippet}".`,
      `Hello! It's great to hear from you about "${subjectSnippet}" — thank you for reaching out.`
    ]
  };

  // Urgency/priority lines
  const urgencyLines = {
    CRITICAL: [
      'This has been flagged as CRITICAL and our on-call team is already mobilized.',
      'Given the critical nature, this is our top priority and we aim to resolve it within 4 hours.',
      'This critical issue has triggered our emergency response protocol.'
    ],
    HIGH: [
      'This has been marked as high priority and will be addressed within 24 hours.',
      'Our team has fast-tracked this request for expedited resolution.',
      'Given the urgency, we have escalated this to our senior support team.'
    ],
    MEDIUM: [
      'We expect to have an update for you within 48 hours.',
      'Our team will prioritize this alongside current high-impact items.',
      'You should receive a detailed response within 1-2 business days.'
    ],
    LOW: [
      'Our team will review this and respond within 2-3 business days.',
      'We will address this in our regular support queue and keep you updated.',
      'You can expect a follow-up from us within 72 hours.'
    ]
  };

  // Closing lines
  const closings = [
    'If you have any additional details to share, please don\'t hesitate to update this claim.',
    'We\'ll keep you informed of every step in the resolution process.',
    'Thank you for your patience — we\'re committed to resolving this for you.',
    'Please feel free to reply if you have further questions or concerns.',
    'Rest assured, your satisfaction is our priority and we will follow up promptly.'
  ];

  const sentiment = analysis.sentiment || 'NEUTRAL';
  const priority = analysis.priority || 'LOW';
  const cat = categoryActions[category] ? category : 'General';

  const greeting = pick(greetings[sentiment] || greetings.NEUTRAL);
  const action = pick(categoryActions[cat]);
  const urgency = pick(urgencyLines[priority] || urgencyLines.LOW);
  const closing = pick(closings);

  return `${greeting} ${action} ${urgency} ${closing}`;
}

// Update analyzeSentiment to include drafting
function analyzeSentiment(text) {
  const lower = text.toLowerCase();
  
  const urgentWords = ['urgent', 'immediately', 'asap', 'critical', 'emergency', 'broken', 'crash', 'fail', 'error', 'bug', 'down', 'blocked', 'stuck', 'cannot access', 'lost data', 'security'];
  const negativeWords = ['angry', 'frustrated', 'disappointed', 'unacceptable', 'ridiculous', 'annoying', 'pathetic', 'disgusting'];
  const positiveWords = ['please', 'thank', 'appreciate', 'kind', 'help', 'request', 'would like', 'hoping', 'could you', 'suggestion', 'improve', 'consider'];
  
  let urgencyScore = 0;
  let sentimentScore = 0;
  
  urgentWords.forEach(w => { if (lower.includes(w)) urgencyScore += 2; });
  negativeWords.forEach(w => { if (lower.includes(w)) sentimentScore -= 1; });
  positiveWords.forEach(w => { if (lower.includes(w)) sentimentScore += 1; });
  
  const exclamations = (text.match(/!/g) || []).length;
  const capsRatio = (text.replace(/[^A-Z]/g, '').length) / Math.max(text.length, 1);
  urgencyScore += Math.min(exclamations, 3);
  if (capsRatio > 0.4) urgencyScore += 2;
  
  let priority = 'LOW';
  if (urgencyScore >= 6) priority = 'CRITICAL';
  else if (urgencyScore >= 4) priority = 'HIGH';
  else if (urgencyScore >= 2) priority = 'MEDIUM';
  
  let sentiment = 'NEUTRAL';
  if (sentimentScore <= -2) sentiment = 'NEGATIVE';
  else if (sentimentScore >= 2) sentiment = 'POSITIVE';
  
  // Category prediction
  const predictedCat = predictCategory(text);

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  
  // Randomized strategy pools
  const strategies = {
    CRITICAL: [
      '🚨 CRITICAL issue. Immediate attention required — SLA: 4 hours.',
      '🚨 Emergency-level claim detected. Mobilize on-call support immediately.',
      '🚨 Critical severity. This must be resolved before any other pending claims.'
    ],
    HIGH: [
      'High-priority issue. Prioritize resolution within 24 hours.',
      'Elevated urgency detected. Assign a senior agent and fast-track.',
      'This claim requires immediate escalation to the relevant team lead.'
    ],
    NEGATIVE_HIGH: [
      'The student is frustrated AND the issue is urgent. Handle with empathy + speed.',
      'Negative sentiment combined with high urgency — personal outreach recommended.',
      'Student dissatisfaction detected on a high-priority matter. Prioritize carefully.'
    ],
    NEGATIVE: [
      'The student seems frustrated. A personal, empathetic response is recommended.',
      'Negative sentiment detected. Start with an apology and acknowledge their concern.',
      'The tone suggests dissatisfaction. Show understanding before providing solutions.',
      'Student frustration detected — consider calling or sending a personalized email.'
    ],
    POSITIVE: [
      'Positive and constructive tone. A friendly, helpful response will work well.',
      'The student is being polite and patient — match their tone with a warm reply.',
      'Constructive feedback received. Acknowledge their input and provide a clear timeline.'
    ],
    NEUTRAL: [
      'Standard request. Review the details and respond with a clear resolution plan.',
      'Routine claim — assign to the appropriate service team for processing.',
      'Normal priority inquiry. Provide a structured response with next steps.',
      'Standard support request. Gather any missing details and proceed with resolution.'
    ]
  };

  // Pick strategy based on combined factors
  let strategyKey = 'NEUTRAL';
  if (priority === 'CRITICAL') strategyKey = 'CRITICAL';
  else if (priority === 'HIGH' && sentiment === 'NEGATIVE') strategyKey = 'NEGATIVE_HIGH';
  else if (priority === 'HIGH') strategyKey = 'HIGH';
  else if (sentiment === 'NEGATIVE') strategyKey = 'NEGATIVE';
  else if (sentiment === 'POSITIVE') strategyKey = 'POSITIVE';
  
  const strategy = pick(strategies[strategyKey]);

  // Dynamic tips based on content keywords
  const tips = [];
  if (lower.includes('refund') || lower.includes('money')) tips.push('💡 Tip: Check refund policy before responding.');
  if (lower.includes('password') || lower.includes('locked')) tips.push('💡 Tip: Verify identity before resetting credentials.');
  if (lower.includes('deadline') || lower.includes('exam')) tips.push('💡 Tip: Time-sensitive academic issue — act quickly.');
  if (lower.includes('certificate') || lower.includes('diploma')) tips.push('💡 Tip: May require coordination with the certifications team.');
  if (lower.includes('not working') || lower.includes('broken')) tips.push('💡 Tip: Request browser/device info for debugging.');
  const tipLine = tips.length > 0 ? '\n\n' + tips.join('\n') : '';
  
  // AI Draft — pass text so the response is personalized with the claim subject
  const draft = generateDraftResponse({ priority, sentiment }, predictedCat, text.split(' ').slice(0, 8).join(' '));
  
  const summary = extractSummary(text);
  const suggestion = `🎯 Summary: "${summary}"\n\n🤖 AI Strategy: ${strategy}${tipLine}\n\n📝 AI Draft Response: "${draft}"`;
  
  return { priority, sentiment, urgencyScore, sentimentScore, suggestedResponse: suggestion, predictedCat, ai_draft: draft };
}

// ── SLA Configuration ───────────────────────────────────────────────────────
const SLA_CONFIG = {
  LOW:      { maxHours: 72, warnHours: 48, escalateHours: 60 },
  MEDIUM:   { maxHours: 48, warnHours: 24, escalateHours: 36 },
  HIGH:     { maxHours: 24, warnHours: 12, escalateHours: 18 },
  CRITICAL: { maxHours: 4,  warnHours: 2,  escalateHours: 3  }
};

function calculateSLADeadline(priority, fromDate = new Date()) {
  const config = SLA_CONFIG[priority] || SLA_CONFIG.LOW;
  return new Date(fromDate.getTime() + config.maxHours * 60 * 60 * 1000);
}

// ── State Machine ───────────────────────────────────────────────────────────
const VALID_TRANSITIONS = {
  CREATED:     ['IN_PROGRESS', 'REJECTED'],
  IN_PROGRESS: ['RESOLVED', 'REJECTED'],
  RESOLVED:    ['CLOSED', 'IN_PROGRESS'],  // IN_PROGRESS = reopen
  CLOSED:      [],                          // terminal
  REJECTED:    []                           // terminal
};

function validateTransition(fromStatus, toStatus) {
  const allowed = VALID_TRANSITIONS[fromStatus] || [];
  return allowed.includes(toStatus);
}

function getStatusLabel(status) {
  const labels = {
    CREATED: '📋 Created', IN_PROGRESS: '⚙️ In Progress', RESOLVED: '✅ Resolved',
    CLOSED: '🔒 Closed', REJECTED: '❌ Rejected'
  };
  return labels[status] || status;
}

// ── Auto-Assignment ─────────────────────────────────────────────────────────
const AGENT_ASSIGNMENTS = {
  Technical: 'tech-support@learnivo.com',
  Billing:   'billing@learnivo.com',
  Account:   'account@learnivo.com',
  Content:   'support@learnivo.com',
  General:   'support@learnivo.com',
  Other:     'support@learnivo.com'
};

function assignAgent(category) {
  return AGENT_ASSIGNMENTS[category] || AGENT_ASSIGNMENTS.General;
}

// Initialize DB and create table if not exists
async function initDb() {
  try {
    const connection = await mysql.createConnection(dbConfig);

    // ── Drop old table if enum is incompatible, then re-create ──
    // We use ALTER TABLE to migrate safely
    await connection.query(`
      CREATE TABLE IF NOT EXISTS claims (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_name VARCHAR(255) NOT NULL,
        student_email VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100) DEFAULT 'General',
        status VARCHAR(20) DEFAULT 'CREATED',
        priority VARCHAR(20) DEFAULT 'LOW',
        sentiment VARCHAR(50) DEFAULT 'NEUTRAL',
        ai_suggestion TEXT,
        admin_response TEXT,
        assigned_to VARCHAR(255) DEFAULT NULL,
        sla_deadline TIMESTAMP NULL,
        escalated BOOLEAN DEFAULT FALSE,
        escalation_count INT DEFAULT 0,
        resolved_at TIMESTAMP NULL,
        closed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Migrate columns for existing tables
    const newCols = [
      ['assigned_to', 'VARCHAR(255) DEFAULT NULL'],
      ['sla_deadline', 'TIMESTAMP NULL'],
      ['escalated', 'BOOLEAN DEFAULT FALSE'],
      ['escalation_count', 'INT DEFAULT 0'],
      ['resolved_at', 'TIMESTAMP NULL'],
      ['closed_at', 'TIMESTAMP NULL']
    ];
    for (const [col, def] of newCols) {
      try { await connection.query(`ALTER TABLE claims ADD COLUMN ${col} ${def}`); }
      catch (e) { /* column already exists */ }
    }

    // Migrate status column from ENUM to VARCHAR for flexibility
    try { await connection.query(`ALTER TABLE claims MODIFY COLUMN status VARCHAR(20) DEFAULT 'CREATED'`); } catch(e) {}
    try { await connection.query(`ALTER TABLE claims MODIFY COLUMN priority VARCHAR(20) DEFAULT 'LOW'`); } catch(e) {}

    // Migrate old statuses to new workflow
    try {
      await connection.query(`UPDATE claims SET status = 'CREATED' WHERE status = 'PENDING'`);
      await connection.query(`UPDATE claims SET status = 'CLOSED' WHERE status = 'ACCEPTED'`);
      await connection.query(`UPDATE claims SET status = 'REJECTED' WHERE status = 'DECLINED'`);
    } catch(e) {}

    // ── Notifications table ──────────────────────────────────────────────────
    await connection.query(`
      CREATE TABLE IF NOT EXISTS claim_notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        target_role ENUM('AGENT', 'USER') NOT NULL,
        target_email VARCHAR(255),
        claim_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Migrate notification type column
    try { await connection.query(`ALTER TABLE claim_notifications MODIFY COLUMN type VARCHAR(50) NOT NULL`); } catch(e) {}
    
    console.log('Database initialized for claims-service');
    return connection;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return null;
  }
}

let db = null;
if (require.main === module) {
  initDb().then(conn => db = conn);
}

// ── SSE Client Registries ────────────────────────────────────────────────────
// Agent (admin) clients listening for new claims
const agentSSEClients = new Set();
// User clients: Map<email, Set<Response>>
const userSSEClients = new Map();

function sendSSEToAgents(data) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const client of agentSSEClients) {
    client.write(payload);
  }
}

function sendSSEToUser(email, data) {
  const clients = userSSEClients.get(email);
  if (clients) {
    const payload = `data: ${JSON.stringify(data)}\n\n`;
    for (const client of clients) {
      client.write(payload);
    }
  }
}

// ── RabbitMQ Initialization ──────────────────────────────────────────────────
let channel = null;
async function initRabbitMQ() {
  try {
    const conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
    channel = await conn.createChannel();
    await channel.assertExchange('claims.exchange', 'topic', { durable: true });

    // ── Agent notifications queue (new claims) ──
    await channel.assertQueue('claims.notifications.agent', { durable: true });
    await channel.bindQueue('claims.notifications.agent', 'claims.exchange', 'claim.created');

    // ── User notifications queue (status changes) ──
    await channel.assertQueue('claims.notifications.user', { durable: true });
    await channel.bindQueue('claims.notifications.user', 'claims.exchange', 'claim.status.changed');

    // ── Consumer: push to agent SSE clients ──
    channel.consume('claims.notifications.agent', async (msg) => {
      if (msg) {
        try {
          const data = JSON.parse(msg.content.toString());
          const notification = {
            type: 'CLAIM_CREATED',
            claimId: data.claimId,
            title: '📋 New Claim Received',
            message: `${data.studentName} submitted: "${data.subject}" (Priority: ${data.priority || 'N/A'})`,
            priority: data.priority || 'LOW',
            timestamp: new Date().toISOString()
          };

          // Persist notification
          if (db) {
            try {
              await db.query(
                'INSERT INTO claim_notifications (type, target_role, target_email, claim_id, title, message) VALUES (?, ?, ?, ?, ?, ?)',
                ['CLAIM_CREATED', 'AGENT', null, data.claimId, notification.title, notification.message]
              );
            } catch (e) { console.error('Failed to persist agent notification:', e.message); }
          }

          // Push to all connected agent SSE clients
          sendSSEToAgents(notification);
          console.log('🔔 Agent notification pushed for claim #' + data.claimId);
        } catch (e) { console.error('Agent consumer error:', e.message); }
        channel.ack(msg);
      }
    });

    // ── Consumer: push to user SSE clients ──
    channel.consume('claims.notifications.user', async (msg) => {
      if (msg) {
        try {
          const data = JSON.parse(msg.content.toString());
          const statusEmoji = data.newStatus === 'ACCEPTED' ? '✅' : '❌';
          const notification = {
            type: 'STATUS_CHANGED',
            claimId: data.claimId,
            title: `${statusEmoji} Claim ${data.newStatus}`,
            message: `Your claim "${data.subject}" has been ${data.newStatus.toLowerCase()}${data.adminResponse ? '. Response: ' + data.adminResponse : ''}`,
            newStatus: data.newStatus,
            timestamp: new Date().toISOString()
          };

          // Persist notification
          if (db) {
            try {
              await db.query(
                'INSERT INTO claim_notifications (type, target_role, target_email, claim_id, title, message) VALUES (?, ?, ?, ?, ?, ?)',
                ['STATUS_CHANGED', 'USER', data.studentEmail, data.claimId, notification.title, notification.message]
              );
            } catch (e) { console.error('Failed to persist user notification:', e.message); }
          }

          // Push to the specific user
          sendSSEToUser(data.studentEmail, notification);
          console.log('🔔 User notification pushed to ' + data.studentEmail + ' for claim #' + data.claimId);
        } catch (e) { console.error('User consumer error:', e.message); }
        channel.ack(msg);
      }
    });

    console.log('✅ Connected to RabbitMQ — queues & consumers ready');
  } catch (err) {
    console.error('Failed to connect to RabbitMQ:', err.message);
    // Retry after 5 seconds
    setTimeout(initRabbitMQ, 5000);
  }
}
if (require.main === module) {
  initRabbitMQ();
}

// ── Send email notification ────────────────────────────────────────────────
async function sendEmailNotification(to, subject, html) {
  try {
    await transporter.sendMail({
      from: '"Learnivo Platform" <hazem.ankoud10@gmail.com>',
      to,
      subject,
      html
    });
    console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error('Email send error:', err.message);
  }
}

function buildStatusEmail(claim, newStatus, adminResponse) {
  const statusColor = newStatus === 'ACCEPTED' ? '#10b981' : '#ef4444';
  const statusIcon = newStatus === 'ACCEPTED' ? '✅' : '❌';
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #0f172a, #1e293b); padding: 32px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 24px; letter-spacing: 2px;">LEARNIVO</h1>
        <p style="color: #94a3b8; margin: 8px 0 0;">Learning Platform</p>
      </div>
      <div style="padding: 32px;">
        <h2 style="color: #1e293b; margin: 0 0 16px;">Claim Update ${statusIcon}</h2>
        <p style="color: #475569;">Hello <strong>${claim.student_name}</strong>,</p>
        <p style="color: #475569;">Your claim regarding <strong>"${claim.subject}"</strong> has been reviewed by the admin.</p>
        <div style="background: #fff; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid ${statusColor};">
          <p style="margin: 0 0 8px;"><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: 700;">${newStatus}</span></p>
          ${adminResponse ? `<p style="margin: 0;"><strong>Admin Response:</strong> ${adminResponse}</p>` : ''}
        </div>
        <p style="color: #94a3b8; font-size: 13px; margin-top: 24px;">This is an automated notification from Learnivo. Please do not reply to this email.</p>
      </div>
    </div>
  `;
}

function buildNewClaimEmail(claim, analysis) {
  const priorityColor = analysis.priority === 'HIGH' ? '#ef4444' : analysis.priority === 'MEDIUM' ? '#f59e0b' : '#10b981';
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #0f172a, #1e293b); padding: 32px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 24px; letter-spacing: 2px;">LEARNIVO</h1>
        <p style="color: #94a3b8; margin: 8px 0 0;">New Claim Received</p>
      </div>
      <div style="padding: 32px;">
        <h2 style="color: #1e293b; margin: 0 0 16px;">📋 New Claim Submitted</h2>
        <div style="background: #fff; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid ${priorityColor};">
          <p><strong>From:</strong> ${claim.student_name} (${claim.student_email})</p>
          <p><strong>Subject:</strong> ${claim.subject}</p>
          <p><strong>Category:</strong> ${claim.category || 'General'}</p>
          <p><strong>AI Priority:</strong> <span style="color: ${priorityColor}; font-weight: 700;">${analysis.priority}</span></p>
          <p><strong>Sentiment:</strong> ${analysis.sentiment}</p>
          <p><strong>Description:</strong> ${claim.description}</p>
        </div>
        <div style="background: #eff6ff; border-radius: 12px; padding: 16px; margin: 16px 0;">
          <p style="color: #1e40af; font-weight: 600; margin: 0 0 8px;">🤖 AI Suggestion:</p>
          <p style="white-space: pre-line; color: #1e40af; margin: 0;">${analysis.suggestedResponse}</p>
        </div>
      </div>
    </div>
  `;
}

// ── Routes ──────────────────────────────────────────────────────────────────

app.get('/api/claims/health', (req, res) => {
  res.json({ status: 'UP' });
});

// Helper for Pagination & Search
async function fetchClaims(req, res, db, baseQuery, countQuery, queryParams) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    let filterSql = '';
    let filterArgs = [];
    
    if (search) {
      filterSql = ' AND (subject LIKE ? OR description LIKE ? OR student_name LIKE ?)';
      filterArgs = [`%${search}%`, `%${search}%`, `%${search}%`];
    }
    
    // Combine basequery with search filter
    baseQuery = baseQuery.replace('WHERE 1=1', `WHERE 1=1 ${filterSql}`);
    countQuery = countQuery.replace('WHERE 1=1', `WHERE 1=1 ${filterSql}`);
    
    // Get Total Count
    const [countRows] = await db.query(countQuery, [...queryParams, ...filterArgs]);
    const total = countRows[0].count;
    
    // Get Paginated Data
    const fullQuery = `${baseQuery} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    const [rows] = await db.query(fullQuery, [...queryParams, ...filterArgs, limit, offset]);

    res.json({
      data: rows,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get all claims (with search & pagination)
app.get('/api/claims', async (req, res) => {
  if (!db) { try { db = await initDb(); } catch(e) {} }
  if (!db) return res.status(500).json({ error: 'Database not connected' });
  
  const baseQuery = 'SELECT * FROM claims WHERE 1=1';
  const countQuery = 'SELECT COUNT(*) as count FROM claims WHERE 1=1';
  await fetchClaims(req, res, db, baseQuery, countQuery, []);
});

// Get claims by student email (with search & pagination)
app.get('/api/claims/student/:email', async (req, res) => {
  if (!db) { try { db = await initDb(); } catch(e) {} }
  if (!db) return res.status(500).json({ error: 'Database not connected' });
  
  const email = req.params.email;
  const baseQuery = 'SELECT * FROM claims WHERE 1=1 AND student_email = ?';
  const countQuery = 'SELECT COUNT(*) as count FROM claims WHERE 1=1 AND student_email = ?';
  await fetchClaims(req, res, db, baseQuery, countQuery, [email]);
});

// Create a new claim
app.post('/api/claims', async (req, res) => {
  if (!db) { try { db = await initDb(); } catch(e) {} }
  if (!db) return res.status(500).json({ error: 'Database not connected' });
  
  const { student_name, student_email, subject, description, category } = req.body;
  if (!student_name || !student_email || !subject || !description) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // 1. Run AI analysis
  const combinedText = `${subject} ${description}`;
  const analysis = analyzeSentiment(combinedText);
  let status = 'CREATED';
  let admin_response = null;
  
  // 1a. Auto-Categorization
  const finalCategory = (category === 'General' || !category) ? analysis.predictedCat : category;

  // 1b. Auto-Assignment
  const assigned_to = assignAgent(finalCategory);

  // 1c. SLA Deadline
  const sla_deadline = calculateSLADeadline(analysis.priority);

  // 2. Bad Words Filter Engine
  if (containsBadWords(combinedText)) {
    status = 'REJECTED';
    analysis.priority = 'LOW';
    analysis.sentiment = 'NEGATIVE';
    admin_response = 'Your claim violated our community guidelines and inappropriate language policies. It has been automatically rejected.';
    analysis.suggestedResponse = '🛑 Auto-Rejected: Profanity or abusive language detected in the claim.';
  } else {
    // 3. Similar Claim Detection (Duplicate Check)
    try {
      const [recentClaims] = await db.query('SELECT id, subject, description FROM claims WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)');
      let maxSimilarity = 0;
      let duplicateId = null;

      for (let rc of recentClaims) {
        const sim = calculateSimilarity(combinedText, `${rc.subject} ${rc.description}`);
        if (sim > maxSimilarity) {
          maxSimilarity = sim;
          duplicateId = rc.id;
        }
      }

      if (maxSimilarity > 0.45) {
        analysis.suggestedResponse += `\n\n⚠️ Potential Duplicate Alert! High similarity to previous claim #${duplicateId}. Check if this is a widespread issue.`;
      }
    } catch (err) {
      console.warn('Similarity check warning:', err.message);
    }
  }

  try {
    const [result] = await db.query(
      'INSERT INTO claims (student_name, student_email, subject, description, category, status, priority, sentiment, ai_suggestion, admin_response, assigned_to, sla_deadline) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [student_name, student_email, subject, description, finalCategory, status, analysis.priority, analysis.sentiment, analysis.suggestedResponse, admin_response, assigned_to, sla_deadline]
    );
    
    const claim = { id: result.insertId, student_name, student_email, subject, description, category: finalCategory, status, admin_response, assigned_to, sla_deadline: sla_deadline.toISOString(), ...analysis };
    
    // Email admin about new claim if it's CREATED
    if (status === 'CREATED') {
      sendEmailNotification(
        assigned_to,
        `[Learnivo] New Claim: ${subject} (Priority: ${analysis.priority})`,
        buildNewClaimEmail(claim, analysis)
      );
    } else {
      // It was auto-rejected, email student
      sendEmailNotification(
        claim.student_email,
        `[Learnivo] Claim Auto-Rejected: "${claim.subject}"`,
        buildStatusEmail(claim, status, admin_response)
      );
    }
    
    res.status(201).json(claim);
    
    // Publish Claim Created Event to RabbitMQ
    if (channel) {
      try {
        const msg = JSON.stringify({
          claimId: claim.id,
          studentName: claim.student_name,
          studentEmail: claim.student_email,
          subject: claim.subject,
          priority: analysis.priority,
          category: finalCategory,
          sentiment: analysis.sentiment,
          assignedTo: assigned_to,
          slaDeadline: sla_deadline.toISOString()
        });
        channel.publish('claims.exchange', 'claim.created', Buffer.from(msg));
        console.log('📤 Published claim.created event to RabbitMQ for claim #' + claim.id);
      } catch (err) {
        console.error('RabbitMQ publish error:', err.message);
      }
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update claim status (admin action) — State Machine enforced
app.put('/api/claims/:id/status', async (req, res) => {
  if (!db) { try { db = await initDb(); } catch(e) {} }
  if (!db) return res.status(500).json({ error: 'Database not connected' });
  
  const { id } = req.params;
  const { status, admin_response } = req.body;
  
  const ALL_STATUSES = ['CREATED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'];
  if (!ALL_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${ALL_STATUSES.join(', ')}` });
  }
  
  try {
    const [existing] = await db.query('SELECT * FROM claims WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Claim not found' });
    
    const claim = existing[0];
    
    // Validate state transition
    if (!validateTransition(claim.status, status)) {
      return res.status(400).json({
        error: `Invalid transition: ${claim.status} → ${status}`,
        allowed: VALID_TRANSITIONS[claim.status] || [],
        current: claim.status
      });
    }
    
    // Build dynamic update
    let updateFields = 'status = ?, admin_response = ?';
    let updateParams = [status, admin_response || claim.admin_response];

    if (status === 'RESOLVED') {
      updateFields += ', resolved_at = NOW()';
    } else if (status === 'CLOSED') {
      updateFields += ', closed_at = NOW()';
    } else if (status === 'IN_PROGRESS' && claim.status === 'RESOLVED') {
      // Reopen: clear resolved_at
      updateFields += ', resolved_at = NULL';
    }

    await db.query(`UPDATE claims SET ${updateFields} WHERE id = ?`, [...updateParams, id]);
    
    // Notify student of status change
    const statusLabel = getStatusLabel(status);
    sendEmailNotification(
      claim.student_email,
      `[Learnivo] Your claim "${claim.subject}" — ${statusLabel}`,
      buildStatusEmail(claim, status, admin_response)
    );

    // Publish claim.status.changed event to RabbitMQ
    if (channel) {
      try {
        const msg = JSON.stringify({
          claimId: parseInt(id),
          studentEmail: claim.student_email,
          studentName: claim.student_name,
          subject: claim.subject,
          newStatus: status,
          previousStatus: claim.status,
          adminResponse: admin_response || ''
        });
        channel.publish('claims.exchange', 'claim.status.changed', Buffer.from(msg));
        console.log('📤 Published claim.status.changed event for claim #' + id + ': ' + claim.status + ' → ' + status);
      } catch (err) {
        console.error('RabbitMQ publish error:', err.message);
      }
    }
    
    res.json({ id: parseInt(id), status, previousStatus: claim.status, admin_response, transition: `${claim.status} → ${status}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reassign claim to a different agent
app.put('/api/claims/:id/assign', async (req, res) => {
  if (!db) { try { db = await initDb(); } catch(e) {} }
  if (!db) return res.status(500).json({ error: 'Database not connected' });

  const { assigned_to } = req.body;
  if (!assigned_to) return res.status(400).json({ error: 'assigned_to is required' });

  try {
    const [existing] = await db.query('SELECT * FROM claims WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Claim not found' });

    await db.query('UPDATE claims SET assigned_to = ? WHERE id = ?', [assigned_to, req.params.id]);

    // Publish assignment event
    if (channel) {
      try {
        const msg = JSON.stringify({ claimId: parseInt(req.params.id), assignedTo: assigned_to, subject: existing[0].subject });
        channel.publish('claims.exchange', 'claim.assigned', Buffer.from(msg));
      } catch (e) {}
    }

    res.json({ id: parseInt(req.params.id), assigned_to });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a claim
app.delete('/api/claims/:id', async (req, res) => {
  if (!db) { try { db = await initDb(); } catch(e) {} }
  if (!db) return res.status(500).json({ error: 'Database not connected' });
  
  try {
    const [result] = await db.query('DELETE FROM claims WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Claim not found' });
    res.json({ message: 'Claim deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get claim stats — 5 states + SLA metrics
app.get('/api/claims/stats', async (req, res) => {
  if (!db) { try { db = await initDb(); } catch(e) {} }
  if (!db) return res.status(500).json({ error: 'Database not connected' });
  
  try {
    const [total] = await db.query('SELECT COUNT(*) as count FROM claims');
    const [created] = await db.query("SELECT COUNT(*) as count FROM claims WHERE status='CREATED'");
    const [inProgress] = await db.query("SELECT COUNT(*) as count FROM claims WHERE status='IN_PROGRESS'");
    const [resolved] = await db.query("SELECT COUNT(*) as count FROM claims WHERE status='RESOLVED'");
    const [closed] = await db.query("SELECT COUNT(*) as count FROM claims WHERE status='CLOSED'");
    const [rejected] = await db.query("SELECT COUNT(*) as count FROM claims WHERE status='REJECTED'");
    const [critical] = await db.query("SELECT COUNT(*) as count FROM claims WHERE priority='CRITICAL'");
    const [escalated] = await db.query("SELECT COUNT(*) as count FROM claims WHERE escalated=TRUE");
    const [slaBreached] = await db.query("SELECT COUNT(*) as count FROM claims WHERE sla_deadline < NOW() AND status NOT IN ('CLOSED', 'REJECTED')");
    res.json({
      total: total[0].count,
      created: created[0].count,
      inProgress: inProgress[0].count,
      resolved: resolved[0].count,
      closed: closed[0].count,
      rejected: rejected[0].count,
      critical: critical[0].count,
      escalated: escalated[0].count,
      slaBreached: slaBreached[0].count
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── SSE Endpoints ────────────────────────────────────────────────────────────

// SSE stream for agents (admins) — receive new claim notifications
app.get('/api/claims/notifications/agent/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'X-Accel-Buffering': 'no'
  });

  // Send initial heartbeat
  res.write('data: {"type":"CONNECTED","message":"Agent notification stream connected"}\n\n');

  agentSSEClients.add(res);
  console.log(`🔗 Agent SSE client connected (total: ${agentSSEClients.size})`);

  // Heartbeat every 30s to keep connection alive
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 30000);

  req.on('close', () => {
    clearInterval(heartbeat);
    agentSSEClients.delete(res);
    console.log(`🔌 Agent SSE client disconnected (total: ${agentSSEClients.size})`);
  });
});

// SSE stream for users (students) — receive status change notifications
app.get('/api/claims/notifications/user/stream', (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).json({ error: 'Email query parameter required' });

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'X-Accel-Buffering': 'no'
  });

  res.write(`data: {"type":"CONNECTED","message":"User notification stream connected for ${email}"}\n\n`);

  if (!userSSEClients.has(email)) {
    userSSEClients.set(email, new Set());
  }
  userSSEClients.get(email).add(res);
  console.log(`🔗 User SSE client connected for ${email}`);

  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 30000);

  req.on('close', () => {
    clearInterval(heartbeat);
    const clients = userSSEClients.get(email);
    if (clients) {
      clients.delete(res);
      if (clients.size === 0) userSSEClients.delete(email);
    }
    console.log(`🔌 User SSE client disconnected for ${email}`);
  });
});

// GET persisted notifications for agent
app.get('/api/claims/notifications/agent', async (req, res) => {
  if (!db) { try { db = await initDb(); } catch(e) {} }
  if (!db) return res.status(500).json({ error: 'Database not connected' });

  try {
    const [rows] = await db.query(
      'SELECT * FROM claim_notifications WHERE target_role = ? ORDER BY created_at DESC LIMIT 50',
      ['AGENT']
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET persisted notifications for a specific user
app.get('/api/claims/notifications/user', async (req, res) => {
  if (!db) { try { db = await initDb(); } catch(e) {} }
  if (!db) return res.status(500).json({ error: 'Database not connected' });

  const email = req.query.email;
  if (!email) return res.status(400).json({ error: 'Email query parameter required' });

  try {
    const [rows] = await db.query(
      'SELECT * FROM claim_notifications WHERE target_role = ? AND target_email = ? ORDER BY created_at DESC LIMIT 50',
      ['USER', email]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark notification as read
app.put('/api/claims/notifications/:id/read', async (req, res) => {
  if (!db) { try { db = await initDb(); } catch(e) {} }
  if (!db) return res.status(500).json({ error: 'Database not connected' });

  try {
    await db.query('UPDATE claim_notifications SET is_read = TRUE WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark all notifications as read for agent or user
app.put('/api/claims/notifications/read-all', async (req, res) => {
  if (!db) { try { db = await initDb(); } catch(e) {} }
  if (!db) return res.status(500).json({ error: 'Database not connected' });

  const { role, email } = req.body;
  try {
    if (role === 'AGENT') {
      await db.query('UPDATE claim_notifications SET is_read = TRUE WHERE target_role = ?', ['AGENT']);
    } else if (role === 'USER' && email) {
      await db.query('UPDATE claim_notifications SET is_read = TRUE WHERE target_role = ? AND target_email = ?', ['USER', email]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── SLA Checker Engine (Escalation) ──────────────────────────────────────────
const PRIORITY_ESCALATION = { LOW: 'MEDIUM', MEDIUM: 'HIGH', HIGH: 'CRITICAL', CRITICAL: 'CRITICAL' };

async function runSLAChecker() {
  if (!db) return;
  try {
    // Find active claims (CREATED or IN_PROGRESS) that haven't been escalated yet
    const [activeClaims] = await db.query(
      "SELECT * FROM claims WHERE status IN ('CREATED', 'IN_PROGRESS') AND sla_deadline IS NOT NULL"
    );

    const now = new Date();

    for (const claim of activeClaims) {
      const slaConfig = SLA_CONFIG[claim.priority] || SLA_CONFIG.LOW;
      const createdAt = new Date(claim.created_at);
      const hoursElapsed = (now - createdAt) / (1000 * 60 * 60);

      // Check auto-escalation threshold
      if (hoursElapsed >= slaConfig.escalateHours && !claim.escalated) {
        const newPriority = PRIORITY_ESCALATION[claim.priority] || claim.priority;
        const newSLADeadline = calculateSLADeadline(newPriority, createdAt);

        await db.query(
          'UPDATE claims SET priority = ?, escalated = TRUE, escalation_count = escalation_count + 1, sla_deadline = ? WHERE id = ?',
          [newPriority, newSLADeadline, claim.id]
        );

        console.log(`⚡ Auto-escalated claim #${claim.id}: ${claim.priority} → ${newPriority}`);

        // Persist & push escalation notification to agents
        const notification = {
          type: 'CLAIM_ESCALATED',
          claimId: claim.id,
          title: `⚡ Claim Escalated: ${claim.priority} → ${newPriority}`,
          message: `Claim #${claim.id} "${claim.subject}" exceeded SLA threshold (${slaConfig.escalateHours}h). Priority auto-escalated.`,
          priority: newPriority,
          timestamp: now.toISOString()
        };

        if (db) {
          try {
            await db.query(
              'INSERT INTO claim_notifications (type, target_role, target_email, claim_id, title, message) VALUES (?, ?, ?, ?, ?, ?)',
              ['CLAIM_ESCALATED', 'AGENT', null, claim.id, notification.title, notification.message]
            );
          } catch (e) {}
        }

        sendSSEToAgents(notification);

        // Also notify the student
        sendSSEToUser(claim.student_email, {
          type: 'CLAIM_ESCALATED',
          claimId: claim.id,
          title: '⚡ Claim Priority Upgraded',
          message: `Your claim "${claim.subject}" has been automatically escalated due to processing time.`,
          timestamp: now.toISOString()
        });

        // Publish to RabbitMQ
        if (channel) {
          try {
            const msg = JSON.stringify({
              claimId: claim.id, studentEmail: claim.student_email,
              subject: claim.subject, oldPriority: claim.priority,
              newPriority, reason: 'SLA threshold exceeded'
            });
            channel.publish('claims.exchange', 'claim.escalated', Buffer.from(msg));
          } catch (e) {}
        }
      }
      // Check SLA warning (50% of escalation threshold remaining)
      else if (hoursElapsed >= slaConfig.warnHours && !claim.escalated) {
        const remaining = Math.max(0, slaConfig.maxHours - hoursElapsed).toFixed(1);
        // Only warn once every 6 hours (check updated_at)
        const lastUpdate = new Date(claim.updated_at);
        if ((now - lastUpdate) > 6 * 60 * 60 * 1000) {
          const warnNotif = {
            type: 'SLA_WARNING',
            claimId: claim.id,
            title: `⏰ SLA Warning: Claim #${claim.id}`,
            message: `Only ${remaining}h remaining for "${claim.subject}" (${claim.priority} priority). Please take action.`,
            timestamp: now.toISOString()
          };
          sendSSEToAgents(warnNotif);
          // Touch updated_at to avoid spamming
          await db.query('UPDATE claims SET updated_at = NOW() WHERE id = ?', [claim.id]);
        }
      }
    }
  } catch (err) {
    console.error('SLA Checker error:', err.message);
  }
}

// Only start server/timers when run directly (not when imported for testing)
if (require.main === module) {
  // Run SLA checker every 60 seconds
  setInterval(runSLAChecker, 60 * 1000);
  console.log('⏰ SLA Checker Engine started (runs every 60s)');

  app.listen(PORT, () => {
    console.log(`Claims service is running on port ${PORT}`);
    
    const eurekaHost = process.env.EUREKA_HOST || 'localhost';
    const eurekaPort = parseInt(process.env.EUREKA_PORT) || 8761;
    const ipAddr = process.env.IP_ADDRESS || '127.0.0.1';
    const instanceId = `claims-service:${PORT}`;

    setTimeout(() => {
      const client = new Eureka({
        instance: {
          app: 'CLAIMS-SERVICE',
          instanceId: instanceId,
          hostName: ipAddr,
          ipAddr: ipAddr,
          statusPageUrl: `http://${ipAddr}:${PORT}/api/claims/health`,
          healthCheckUrl: `http://${ipAddr}:${PORT}/api/claims/health`,
          port: { $: PORT, '@enabled': 'true' },
          vipAddress: 'claims-service',
          dataCenterInfo: {
            '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
            name: 'MyOwn',
          },
        },
        eureka: {
          host: eurekaHost,
          port: eurekaPort,
          servicePath: '/eureka/apps/',
          maxRetries: 20,
          requestRetryDelay: 5000,
        },
      });

      client.start(error => {
        console.log(error || 'Complete Eureka registration');
      });
    }, 15000);
  });
}

// ── Exports for unit testing ─────────────────────────────────────────────────
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    containsBadWords, extractSummary, calculateSimilarity,
    predictCategory, generateDraftResponse, analyzeSentiment,
    calculateSLADeadline, validateTransition, assignAgent,
    SLA_CONFIG, VALID_TRANSITIONS, AGENT_ASSIGNMENTS
  };
}
