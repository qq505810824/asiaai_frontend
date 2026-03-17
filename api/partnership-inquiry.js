const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, message: 'Method Not Allowed' });
    return;
  }

  try {
    const {
      organization_name,
      contact_person,
      email,
      phone,
      organization_type,
      region,
      partnership_focus,
      message,
      consent,
      submitted_at,
      page_url
    } = req.body || {};

    if (!organization_name || !contact_person || !email || !message) {
      res.status(400).json({ ok: false, message: 'Missing required fields' });
      return;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_ADDRESS,
      port: Number(process.env.SMTP_PORT || 465),
      secure: Number(process.env.SMTP_PORT || 465) === 465,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD
      }
    });

    const mailFrom = process.env.MAILER_FROM || process.env.SMTP_USERNAME;
    const mailTo = process.env.MAILER_TO || mailFrom;

    const html = `
      <h2>New AAIA Partnership Inquiry</h2>
      <p><strong>Organization:</strong> ${organization_name}</p>
      <p><strong>Contact Person:</strong> ${contact_person}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || '-'}</p>
      <p><strong>Organization Type:</strong> ${organization_type || '-'}</p>
      <p><strong>Region:</strong> ${region || '-'}</p>
      <p><strong>Partnership Focus:</strong> ${partnership_focus || '-'}</p>
      <p><strong>Consent:</strong> ${consent ? 'Yes' : 'No'}</p>
      <p><strong>Submitted At:</strong> ${submitted_at || '-'}</p>
      <p><strong>Page URL:</strong> ${page_url || '-'}</p>
      <p><strong>Message:</strong></p>
      <p>${(message || '').replace(/\n/g, '<br>')}</p>
    `;

    await transporter.sendMail({
      from: mailFrom,
      to: mailTo,
      subject: `AAIA Partnership Inquiry from ${organization_name}`,
      html
    });

    res.status(200).json({ ok: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('partnership-inquiry error', error);
    res.status(500).json({ ok: false, message: 'Internal Server Error' });
  }
};

