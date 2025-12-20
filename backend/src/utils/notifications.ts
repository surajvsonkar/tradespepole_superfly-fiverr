import twilio from 'twilio';
import nodemailer from 'nodemailer';

// Initialize Twilio
const twilioClient = twilio(
	process.env.TWILIO_ACCOUNT_SID,
	process.env.TWILIO_AUTH_TOKEN
);
const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER;

// Helper to send SMS
export const sendSMS = async (to: string, message: string) => {
	if (!TWILIO_PHONE || !process.env.TWILIO_ACCOUNT_SID) {
		console.log('📱 Twilio not configured. SMS would be:', { to, message });
		return;
	}

	try {
		await twilioClient.messages.create({
			body: message,
			from: TWILIO_PHONE,
			to
		});
		console.log(`✅ SMS sent to ${to}`);
	} catch (error) {
		console.error('❌ Failed to send SMS:', error);
	}
};

// Helper to send email
export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
	if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
		console.log('\n📧 Email would be sent:');
		console.log('To:', to);
		console.log('Subject:', subject);
		console.log('Content:', text);
		return;
	}

	try {
		const transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: process.env.SMTP_EMAIL,
				pass: process.env.SMTP_PASSWORD
			}
		});

		await transporter.sendMail({
			from: process.env.SMTP_EMAIL,
			to,
			subject,
			text,
			html
		});
		console.log(`✅ Email sent to ${to}`);
	} catch (error) {
		console.error('❌ Failed to send email:', error);
	}
};
