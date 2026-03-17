require('dotenv').config();

const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();

const PORT = Number(process.env.PORT || 3000);
const STATIC_ROOT = path.resolve(__dirname);
const PARTNERSHIP_RECIPIENT = process.env.PARTNERSHIP_INQUIRY_TO || 'bobby@mjsseya.org';

const SMTP_HOST = process.env.SMTP_ADDRESS || '';
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USERNAME || '';
const SMTP_PASS = process.env.SMTP_PASSWORD || '';
const SMTP_AUTH_METHOD = String(process.env.SMTP_AUTHENTICATION || 'plain').toUpperCase();
const SMTP_DOMAIN = process.env.SMTP_DOMAIN || '';
const SMTP_STARTTLS_AUTO = String(process.env.SMTP_ENABLE_STARTTLS_AUTO || 'true').toLowerCase() !== 'false';
const MAILER_FROM = process.env.MAILER_FROM || SMTP_USER;

function trimField(value) {
  return String(value || '').trim();
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeInquiryPayload(payload) {
  return {
    organization_name: trimField(payload.organization_name),
    contact_person: trimField(payload.contact_person),
    email: trimField(payload.email),
    phone: trimField(payload.phone),
    organization_type: trimField(payload.organization_type),
    region: trimField(payload.region),
    partnership_focus: trimField(payload.partnership_focus),
    message: trimField(payload.message),
    consent: Boolean(payload.consent),
    submitted_at: trimField(payload.submitted_at) || new Date().toISOString(),
    page_url: trimField(payload.page_url)
  };
}

function validateInquiry(payload) {
  const requiredFields = [
    'organization_name',
    'contact_person',
    'email',
    'phone',
    'organization_type',
    'region',
    'partnership_focus',
    'message'
  ];

  for (const field of requiredFields) {
    if (!payload[field]) {
      return `Missing required field: ${field}`;
    }
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(payload.email)) {
    return 'Invalid email format.';
  }

  if (!payload.consent) {
    return 'Consent confirmation is required.';
  }

  return null;
}

function createTransporter() {
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error('SMTP configuration is incomplete. Please check .env values.');
  }

  const transportOptions = {
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    },
    authMethod: SMTP_AUTH_METHOD
  };

  if (SMTP_DOMAIN) {
    transportOptions.tls = { servername: SMTP_DOMAIN };
  }

  if (!SMTP_STARTTLS_AUTO && SMTP_PORT !== 465) {
    transportOptions.ignoreTLS = true;
  }

  return nodemailer.createTransport(transportOptions);
}

const transporter = createTransporter();

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(express.static(STATIC_ROOT, { extensions: ['html'] }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'aaia-site-mailer' });
});

app.post('/api/partnership-inquiry', async (req, res) => {
  try {
    const payload = normalizeInquiryPayload(req.body || {});
    const validationError = validateInquiry(payload);

    if (validationError) {
      res.status(400).json({ ok: false, message: validationError });
      return;
    }

    const subject = `[AAIA Partnership Inquiry] ${payload.organization_name}`;
    const textBody = [
      'New partnership inquiry received from the AAIA website.',
      '',
      `Organization Name: ${payload.organization_name}`,
      `Contact Person: ${payload.contact_person}`,
      `Email: ${payload.email}`,
      `Phone: ${payload.phone}`,
      `Organization Type: ${payload.organization_type}`,
      `Country / Region: ${payload.region}`,
      `Partnership Focus: ${payload.partnership_focus}`,
      '',
      'Message:',
      payload.message,
      '',
      `Submitted At: ${payload.submitted_at}`,
      `Source Page: ${payload.page_url || 'N/A'}`
    ].join('\n');

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; color: #0f2a4f; line-height: 1.6;">
        <h2 style="margin-bottom: 12px;">New AAIA Partnership Inquiry</h2>
        <table cellpadding="6" cellspacing="0" style="border-collapse: collapse; width: 100%; max-width: 760px;">
          <tr><td style="font-weight: 700;">Organization Name</td><td>${escapeHtml(payload.organization_name)}</td></tr>
          <tr><td style="font-weight: 700;">Contact Person</td><td>${escapeHtml(payload.contact_person)}</td></tr>
          <tr><td style="font-weight: 700;">Email</td><td>${escapeHtml(payload.email)}</td></tr>
          <tr><td style="font-weight: 700;">Phone</td><td>${escapeHtml(payload.phone)}</td></tr>
          <tr><td style="font-weight: 700;">Organization Type</td><td>${escapeHtml(payload.organization_type)}</td></tr>
          <tr><td style="font-weight: 700;">Country / Region</td><td>${escapeHtml(payload.region)}</td></tr>
          <tr><td style="font-weight: 700;">Partnership Focus</td><td>${escapeHtml(payload.partnership_focus)}</td></tr>
          <tr><td style="font-weight: 700;">Submitted At</td><td>${escapeHtml(payload.submitted_at)}</td></tr>
          <tr><td style="font-weight: 700;">Source Page</td><td>${escapeHtml(payload.page_url || 'N/A')}</td></tr>
        </table>
        <h3 style="margin-top: 16px; margin-bottom: 8px;">Message</h3>
        <p style="white-space: pre-wrap; margin: 0;">${escapeHtml(payload.message)}</p>
      </div>
    `;

    await transporter.sendMail({
      from: MAILER_FROM,
      to: PARTNERSHIP_RECIPIENT,
      replyTo: payload.email,
      subject,
      text: textBody,
      html: htmlBody
    });

    res.status(200).json({
      ok: true,
      message: 'Inquiry sent successfully.'
    });
  } catch (error) {
    console.error('Partnership inquiry send failed:', error.message);
    res.status(500).json({
      ok: false,
      message: 'Unable to send inquiry at the moment. Please try again later.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`AAIA site server running on http://localhost:${PORT}`);
});
