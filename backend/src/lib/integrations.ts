import nodemailer from "nodemailer";

type BookingPayload = {
  id: string;
  inviteeName: string;
  inviteeEmail: string;
  startTime: Date;
  endTime: Date;
  cancelToken: string;
  meetingUrl?: string | null;
  inviteeNotes?: string | null;
  eventType: {
    name: string;
    slug: string;
    durationMins: number;
    color: string;
  };
};

// Gmail SMTP transporter — works with any free Gmail account + App Password
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const hostEmail = process.env.HOST_EMAIL || smtpUser || "";

const transporter =
  smtpUser && smtpPass
    ? nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for 587 (STARTTLS)
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })
    : null;

  let hasLoggedMissingWebhookUrl = false;

export async function sendBookingEmails(booking: BookingPayload) {
  if (!transporter) {
    console.log("[Email] SMTP not configured. Skipping email for booking:", booking.id);
    return;
  }

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const cancelLink = `${frontendUrl}/cancel/${booking.cancelToken}`;

  const startFormatted = booking.startTime.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
  const endFormatted = booking.endTime.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });

  const meetSection = booking.meetingUrl
    ? `<tr>
        <td style="padding:8px 16px;color:#555;">📹 Google Meet</td>
        <td style="padding:8px 16px;"><a href="${booking.meetingUrl}" style="color:#1a73e8;font-weight:600;">${booking.meetingUrl}</a></td>
      </tr>`
    : "";

  const notesSection = booking.inviteeNotes
    ? `<tr>
        <td style="padding:8px 16px;color:#555;vertical-align:top;">📝 Notes</td>
        <td style="padding:8px 16px;color:#1a1a1a;">${booking.inviteeNotes}</td>
      </tr>`
    : "";

  const inviteeHtml = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px">
      <div style="text-align:center;margin-bottom:24px">
        <div style="display:inline-block;background:#e8f5e9;border-radius:50%;width:56px;height:56px;line-height:56px;font-size:28px">✅</div>
      </div>
      <h1 style="text-align:center;font-size:22px;color:#1a1a1a;margin-bottom:4px">Your meeting is confirmed</h1>
      <p style="text-align:center;color:#666;margin-bottom:24px">You're scheduled with Calendly Host</p>
      <table style="width:100%;border-collapse:collapse;background:#f8f9fa;border-radius:8px;overflow:hidden;margin-bottom:24px">
        <tr>
          <td style="padding:8px 16px;color:#555;">📅 Event</td>
          <td style="padding:8px 16px;font-weight:600;color:#1a1a1a">${booking.eventType.name}</td>
        </tr>
        <tr>
          <td style="padding:8px 16px;color:#555;">🕐 When</td>
          <td style="padding:8px 16px;color:#1a1a1a">${startFormatted} – ${endFormatted}</td>
        </tr>
        <tr>
          <td style="padding:8px 16px;color:#555;">⏱ Duration</td>
          <td style="padding:8px 16px;color:#1a1a1a">${booking.eventType.durationMins} minutes</td>
        </tr>
        ${notesSection}
        ${meetSection}
      </table>
      ${booking.meetingUrl ? `<div style="text-align:center;margin-bottom:16px"><a href="${booking.meetingUrl}" style="display:inline-block;background:#1a73e8;color:white;text-decoration:none;padding:12px 32px;border-radius:24px;font-weight:600;font-size:14px">Join Google Meet</a></div>` : ""}
      <div style="text-align:center">
        <a href="${cancelLink}" style="color:#e53935;font-size:13px">Cancel this booking</a>
      </div>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
      <p style="text-align:center;font-size:12px;color:#999">Sent from Calendly · Scheduling automation platform</p>
    </div>
  `;

  const hostHtml = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px">
      <h1 style="font-size:20px;color:#1a1a1a;margin-bottom:16px">📩 New Booking Received</h1>
      <table style="width:100%;border-collapse:collapse;background:#f8f9fa;border-radius:8px;overflow:hidden;margin-bottom:24px">
        <tr>
          <td style="padding:8px 16px;color:#555;">👤 Invitee</td>
          <td style="padding:8px 16px;font-weight:600;color:#1a1a1a">${booking.inviteeName} (${booking.inviteeEmail})</td>
        </tr>
        <tr>
          <td style="padding:8px 16px;color:#555;">📅 Event</td>
          <td style="padding:8px 16px;color:#1a1a1a">${booking.eventType.name}</td>
        </tr>
        <tr>
          <td style="padding:8px 16px;color:#555;">🕐 When</td>
          <td style="padding:8px 16px;color:#1a1a1a">${startFormatted} – ${endFormatted}</td>
        </tr>
        ${notesSection}
        ${meetSection}
      </table>
      ${booking.meetingUrl ? `<p>🔗 <a href="${booking.meetingUrl}" style="color:#1a73e8">Join Google Meet</a></p>` : ""}
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
      <p style="font-size:12px;color:#999">Sent from Calendly</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Calendly" <${smtpUser}>`,
      to: booking.inviteeEmail,
      subject: `✅ Booking confirmed: ${booking.eventType.name}`,
      html: inviteeHtml,
    });
    console.log(`[Email] Invitee email sent to ${booking.inviteeEmail}`);
  } catch (err) {
    console.error("[Email] Failed to send invitee email:", err);
  }

  if (hostEmail) {
    try {
      await transporter.sendMail({
        from: `"Calendly" <${smtpUser}>`,
        to: hostEmail,
        subject: `📩 New booking: ${booking.eventType.name} — ${booking.inviteeName}`,
        html: hostHtml,
      });
      console.log(`[Email] Host email sent to ${hostEmail}`);
    } catch (err) {
      console.error("[Email] Failed to send host email:", err);
    }
  }
}

export async function triggerBookingWebhook(payload: unknown) {
  const webhookUrl = process.env.WEBHOOK_URL;
  if (!webhookUrl) {
    if (!hasLoggedMissingWebhookUrl) {
      hasLoggedMissingWebhookUrl = true;
      console.log("[Webhook] WEBHOOK_URL not set. Skipping webhook delivery.");
    }
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      console.warn(`[Webhook] Delivery failed with status ${response.status}.`);
    }
  } catch (error) {
    // Webhook delivery should never block booking success.
    console.warn("[Webhook] Delivery failed:", error);
  }
}

export async function sendCancellationEmails(booking: BookingPayload) {
  if (!transporter) return;

  const startFormatted = booking.startTime.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });

  const inviteeHtml = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px">
      <h1 style="font-size:22px;color:#1a1a1a;margin-bottom:8px">Your meeting was cancelled</h1>
      <p style="color:#666;margin-bottom:18px">The following booking has been cancelled:</p>
      <p style="margin:0 0 8px 0"><strong>${booking.eventType.name}</strong></p>
      <p style="margin:0 0 18px 0;color:#444">${startFormatted}</p>
      <p style="font-size:12px;color:#999">Sent from Calendly</p>
    </div>
  `;

  const hostHtml = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px">
      <h1 style="font-size:22px;color:#1a1a1a;margin-bottom:8px">Booking cancelled</h1>
      <p style="margin:0 0 8px 0"><strong>${booking.eventType.name}</strong></p>
      <p style="margin:0 0 8px 0;color:#444">${startFormatted}</p>
      <p style="margin:0;color:#444">Invitee: ${booking.inviteeName} (${booking.inviteeEmail})</p>
      <p style="font-size:12px;color:#999;margin-top:18px">Sent from Calendly</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Calendly" <${smtpUser}>`,
      to: booking.inviteeEmail,
      subject: `Cancelled: ${booking.eventType.name}`,
      html: inviteeHtml,
    });
  } catch (err) {
    console.error("[Email] Failed to send invitee cancellation email:", err);
  }

  if (hostEmail) {
    try {
      await transporter.sendMail({
        from: `"Calendly" <${smtpUser}>`,
        to: hostEmail,
        subject: `Cancelled booking: ${booking.eventType.name}`,
        html: hostHtml,
      });
    } catch (err) {
      console.error("[Email] Failed to send host cancellation email:", err);
    }
  }
}
