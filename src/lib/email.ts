import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM || "noreply@civicplatform.com";
const APP_NAME = "CivicResolve";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    const data = await resend.emails.send({
      from: `${APP_NAME} <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error };
  }
}

/** Notify user that their complaint was submitted */
export async function sendComplaintSubmittedEmail(
  email: string,
  complaintTitle: string,
  complaintId: string
) {
  return sendEmail({
    to: email,
    subject: `Complaint Submitted: ${complaintTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0;">${APP_NAME}</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 12px 12px;">
          <h2 style="color: #1f2937;">Complaint Submitted Successfully</h2>
          <p style="color: #4b5563;">Your complaint "<strong>${complaintTitle}</strong>" has been received and is being reviewed.</p>
          <p style="color: #4b5563;">Complaint ID: <code>${complaintId}</code></p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/complaints/${complaintId}" 
             style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">
            Track Your Complaint
          </a>
          <p style="color: #9ca3af; font-size: 14px; margin-top: 24px;">
            You will receive updates as your complaint progresses.
          </p>
        </div>
      </div>
    `,
  });
}

/** Notify authority/NGO about an assigned complaint */
export async function sendAssignmentEmail(
  email: string,
  authorityName: string,
  complaintTitle: string,
  complaintId: string,
  category: string
) {
  return sendEmail({
    to: email,
    subject: `New Assignment: ${complaintTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0;">${APP_NAME}</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 12px 12px;">
          <h2 style="color: #1f2937;">New Complaint Assigned</h2>
          <p style="color: #4b5563;">Hello ${authorityName},</p>
          <p style="color: #4b5563;">A new complaint has been assigned to your organization:</p>
          <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>Title:</strong> ${complaintTitle}</p>
            <p style="margin: 4px 0;"><strong>Category:</strong> ${category}</p>
          </div>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/authority" 
             style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">
            View Assignment
          </a>
        </div>
      </div>
    `,
  });
}

/** Notify user about status change */
export async function sendStatusUpdateEmail(
  email: string,
  complaintTitle: string,
  complaintId: string,
  newStatus: string
) {
  return sendEmail({
    to: email,
    subject: `Status Update: ${complaintTitle} — ${newStatus}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0;">${APP_NAME}</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 12px 12px;">
          <h2 style="color: #1f2937;">Complaint Status Updated</h2>
          <p style="color: #4b5563;">Your complaint "<strong>${complaintTitle}</strong>" has been updated to:</p>
          <div style="display: inline-block; background: #dbeafe; color: #1e40af; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 12px 0;">
            ${newStatus}
          </div>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/complaints/${complaintId}" 
             style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">
            View Details
          </a>
        </div>
      </div>
    `,
  });
}

/** Notify about donation received */
export async function sendDonationReceivedEmail(
  email: string,
  complaintTitle: string,
  amount: string
) {
  return sendEmail({
    to: email,
    subject: `Donation Received for: ${complaintTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0;">${APP_NAME}</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 12px 12px;">
          <h2 style="color: #1f2937;">Donation Received!</h2>
          <p style="color: #4b5563;">A donation of <strong>${amount}</strong> has been received for "<strong>${complaintTitle}</strong>".</p>
          <p style="color: #4b5563;">Thank you for your generous contribution to improving our community!</p>
        </div>
      </div>
    `,
  });
}

/** Send verification code for registration */
export async function sendVerificationEmail(email: string, code: string) {
  return sendEmail({
    to: email,
    subject: `Your ${APP_NAME} Verification Code`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0;">${APP_NAME}</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 12px 12px;">
          <h2 style="color: #1f2937;">Verify Your Account</h2>
          <p style="color: #4b5563;">Thank you for registering. Please use the verification code below to complete your registration:</p>
          <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 24px 0; text-align: center;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #4f46e5;">${code}</span>
          </div>
          <p style="color: #6b7280; font-size: 14px;">This code will expire in 10 minutes.</p>
        </div>
      </div>
    `,
  });
}
