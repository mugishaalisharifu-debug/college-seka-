import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly apiKey = process.env.BREVO_API_KEY;
  private readonly senderEmail = process.env.BREVO_SENDER_EMAIL 
  private readonly senderName = process.env.BREVO_SENDER_NAME || 'College Fondation Sina Gerard';

  async sendReplyEmail(toEmail: string, recipientName: string, subject: string, messageBody: string): Promise<boolean> {
    if (!this.apiKey) {
      throw new InternalServerErrorException('Brevo API key is not configured.');
    }

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': this.apiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: {
            name: this.senderName,
            email: this.senderEmail,
          },
          to: [
            {
              email: toEmail,
              name: recipientName,
            },
          ],
          subject: `Re: ${subject}`,
          htmlContent: `
            <div style="font-family: sans-serif; font-size: 14px; color: #333; line-height: 1.6;">
              <p>Dear <strong>${recipientName}</strong>,</p>
              <div style="white-space: pre-wrap; margin: 16px 0; background-color: #f9f9f9; padding: 16px; border-radius: 8px; border-left: 4px solid #047857;">
                ${messageBody.replace(/\n/g, '<br/>')}
              </div>
              <p style="color: #666; font-size: 12px; margin-top: 24px;">
                Best regards,<br/>
                <strong>${this.senderName}</strong>
              </p>
            </div>
          `,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to dispatch email via Brevo');
      }

      return true;
    } catch (error: any) {
      throw new InternalServerErrorException(`Brevo dispatch error: ${error.message}`);
    }
  }
}