import transporter from '@/email'

export class EmailUtils {
	static async sendEmail(to, subject, html, attachments = []) {
		const email = {
			from: process.env.SMTP_MAIL_SENDER,
			to,
			subject,
			html,
			attachments,
		}
		return await transporter.sendMail(email)
	}
}
