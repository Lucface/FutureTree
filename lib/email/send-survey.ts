import { resend, EMAIL_FROM, APP_URL, isEmailConfigured } from './index';
import { getSurveyTemplate } from './templates';

export interface SendSurveyResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Minimal survey type needed for sending emails
export interface SurveyEmailData {
  id: string;
  surveyType: string;
  recipientEmail: string | null;
}

/**
 * Send a survey email to the recipient
 */
export async function sendSurveyEmail(
  survey: SurveyEmailData
): Promise<SendSurveyResult> {
  // Check if email is configured
  if (!isEmailConfigured() || !resend) {
    console.warn('[EMAIL] Resend not configured, skipping email send');
    return {
      success: false,
      error: 'Email service not configured (RESEND_API_KEY missing)',
    };
  }

  // Validate recipient
  if (!survey.recipientEmail) {
    return { success: false, error: 'No recipient email provided' };
  }

  // Get template based on survey type
  const template = getSurveyTemplate(survey.surveyType);
  const surveyUrl = `${APP_URL}/pathmap/surveys/${survey.id}`;

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: survey.recipientEmail,
      subject: template.subject,
      html: template.html(surveyUrl),
    });

    if (error) {
      console.error('[EMAIL] Send failed:', error);
      return { success: false, error: error.message };
    }

    console.log(`[EMAIL] Survey sent successfully: ${data?.id}`);
    return { success: true, messageId: data?.id };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[EMAIL] Exception during send:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Send a test email to verify configuration
 */
export async function sendTestEmail(
  to: string
): Promise<SendSurveyResult> {
  if (!isEmailConfigured() || !resend) {
    return {
      success: false,
      error: 'Email service not configured (RESEND_API_KEY missing)',
    };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: 'PathMap Email Test',
      html: `
        <h1>Email Configuration Test</h1>
        <p>If you're reading this, your PathMap email configuration is working correctly!</p>
        <p>Sent from: ${EMAIL_FROM}</p>
        <p>App URL: ${APP_URL}</p>
      `,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
