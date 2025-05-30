import FormData from "form-data";
import Mailgun from "mailgun.js";

const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  username: "api",
  key: import.meta.env.VITE_MAILGUN_API_KEY || "API_KEY",
});

const DOMAIN = import.meta.env.VITE_MAILGUN_DOMAIN || "sandbox5fcbcb573de9468881129f721d395c10.mailgun.org";

export const sendInvitationEmail = async (email: string, familyId: string) => {
  const registrationUrl = `${window.location.origin}/register?family=${familyId}`;
  
  try {
    const data = await mg.messages.create(DOMAIN, {
      from: `FinPal <postmaster@${DOMAIN}>`,
      to: [email],
      subject: "Join your family on FinPal",
      text: `You've been invited to join a family on FinPal. Click the link below to create your account and join:\n\n${registrationUrl}`,
      html: `
        <h2>You've been invited to join a family on FinPal</h2>
        <p>Click the button below to create your account and join your family:</p>
        <a href="${registrationUrl}" style="background-color: #6B46C1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Join Family</a>
        <p>Or copy and paste this link into your browser:</p>
        <p>${registrationUrl}</p>
      `
    });
    console.log('Email sent:', data);
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error('Failed to send invitation email');
  }
}; 