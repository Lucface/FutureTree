export interface SurveyTemplate {
  subject: string;
  html: (surveyUrl: string) => string;
}

const baseStyles = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
  .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
  .header h1 { margin: 0 0 8px 0; font-size: 24px; }
  .header p { margin: 0; opacity: 0.9; }
  .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
  .content p { margin: 0 0 16px 0; }
  .button { display: inline-block; background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
  .button:hover { background: #5a67d8; }
  .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; padding: 20px; }
  .footer a { color: #667eea; text-decoration: none; }
`;

export const templates: Record<string, SurveyTemplate> = {
  '30day': {
    subject: 'Quick check-in: Have you started your strategic path?',
    html: (surveyUrl: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="header">
    <h1>30-Day Check-in</h1>
    <p>How's your strategic journey going?</p>
  </div>
  <div class="content">
    <p>Hi there,</p>
    <p>It's been 30 days since you explored your strategic path with PathMap. We'd love to hear how things are going!</p>
    <p>This quick 2-minute survey helps us improve our recommendations for you and others.</p>
    <center>
      <a href="${surveyUrl}" class="button">Complete Survey &rarr;</a>
    </center>
    <p style="font-size: 14px; color: #6b7280;">If the button doesn't work, copy and paste this link: ${surveyUrl}</p>
  </div>
  <div class="footer">
    <p>PathMap by FutureTree &bull; Helping businesses grow strategically</p>
    <p><a href="${surveyUrl.replace('/surveys/', '/unsubscribe/')}">Unsubscribe from survey emails</a></p>
  </div>
</body>
</html>
    `,
  },
  '60day': {
    subject: 'Progress update: How far along are you?',
    html: (surveyUrl: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="header">
    <h1>60-Day Progress</h1>
    <p>We'd love to hear about your progress</p>
  </div>
  <div class="content">
    <p>Hi there,</p>
    <p>It's been 60 days since you started your strategic path. How's the implementation going?</p>
    <p>Your feedback helps us refine our success metrics and better help future businesses.</p>
    <center>
      <a href="${surveyUrl}" class="button">Share Your Progress &rarr;</a>
    </center>
    <p style="font-size: 14px; color: #6b7280;">If the button doesn't work, copy and paste this link: ${surveyUrl}</p>
  </div>
  <div class="footer">
    <p>PathMap by FutureTree &bull; Helping businesses grow strategically</p>
    <p><a href="${surveyUrl.replace('/surveys/', '/unsubscribe/')}">Unsubscribe from survey emails</a></p>
  </div>
</body>
</html>
    `,
  },
  '90day': {
    subject: 'Outcome survey: What results did you achieve?',
    html: (surveyUrl: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="header">
    <h1>90-Day Outcome</h1>
    <p>Time to reflect on your journey</p>
  </div>
  <div class="content">
    <p>Hi there,</p>
    <p>It's been 90 days! We're excited to hear about your results.</p>
    <p>Your outcome data directly improves our success predictions for others on similar paths. This is where the real learning happens!</p>
    <center>
      <a href="${surveyUrl}" class="button">Share Your Outcome &rarr;</a>
    </center>
    <p style="font-size: 14px; color: #6b7280;">If the button doesn't work, copy and paste this link: ${surveyUrl}</p>
  </div>
  <div class="footer">
    <p>PathMap by FutureTree &bull; Helping businesses grow strategically</p>
    <p><a href="${surveyUrl.replace('/surveys/', '/unsubscribe/')}">Unsubscribe from survey emails</a></p>
  </div>
</body>
</html>
    `,
  },
};

export function getSurveyTemplate(surveyType: string): SurveyTemplate {
  return templates[surveyType] || templates['30day'];
}
