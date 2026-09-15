import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';

let transporterInstance = null;

const getTransporter = async () => {
  if (transporterInstance) {
    return transporterInstance;
  }

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const port = Number(process.env.SMTP_PORT) || 587;

    transporterInstance = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS.replace(/\s+/g, ''),
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    return transporterInstance;
  }

  try {
    const testAccount = await nodemailer.createTestAccount();
    transporterInstance = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('[EMAIL NOTICE] Using Ethereal sandbox environment.');
  } catch (e) {
    console.log('[EMAIL NOTICE] Could not initialize Ethereal test transporter.');
  }

  return transporterInstance;
};

export const sendOtpEmail = async (email, otpCode) => {
  try {
    const transporter = await getTransporter();

    if (!transporter) {
      throw new Error('No mail transporter available.');
    }

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || `"EventSphere Security" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'EventSphere Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="color: #1488A6; text-align: center;">EventSphere Security Verification</h2>
          <p style="color: #374151; font-size: 16px;">Hello,</p>
          <p style="color: #374151; font-size: 16px;">Your One-Time Password (OTP) for authenticating into EventSphere is:</p>
          <div style="background-color: #f0fdfa; border: 2px dashed #1488A6; text-align: center; padding: 15px; margin: 20px 0; border-radius: 8px;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0d9488;">${otpCode}</span>
          </div>
          <p style="color: #6b7280; font-size: 14px;"><strong>Note:</strong> This code is valid strictly for 1 minute (60 seconds).</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">&copy; 2026 EventSphere Inc. All rights reserved.</p>
        </div>
      `,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`\n==================================================`);
    console.log(`[EMAIL DISPATCH] OTP sent to ${email}`);
    console.log(`Response: ${info.response || 'Message delivered'}`);
    if (previewUrl) {
      console.log(`📬 View Delivered Email in Web Browser (Ethereal): ${previewUrl}`);
    }
    console.log(`==================================================\n`);
    return true;
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send OTP email to ${email}:`, error.message);

    console.log(`\n==================================================`);
    console.log(`[FALLBACK LOCAL CONSOLE OTP DISPATCH]`);
    console.log(`To: ${email}`);
    console.log(`OTP Verification Code: ${otpCode}`);
    console.log(`==================================================\n`);
    return false;
  }
};

export const sendPasswordResetEmail = async (email, resetToken, resetUrl) => {
  try {
    const transporter = await getTransporter();

    if (!transporter) {
      throw new Error('No mail transporter available.');
    }

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || `"EventSphere Security" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'EventSphere Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="color: #1488A6; text-align: center;">Reset Your Password</h2>
          <p style="color: #374151; font-size: 16px;">Hello,</p>
          <p style="color: #374151; font-size: 16px;">We received a request to reset your EventSphere account password. Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${resetUrl}" style="background-color: #1488A6; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">Or copy and paste this link in your browser:</p>
          <p style="color: #1488A6; font-size: 12px; word-break: break-all;">${resetUrl}</p>
          <p style="color: #6b7280; font-size: 14px;">This link will expire in 15 minutes.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">&copy; 2026 EventSphere Inc. All rights reserved.</p>
        </div>
      `,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`\n==================================================`);
    console.log(`[EMAIL DISPATCH] Password Reset sent to ${email}`);
    if (previewUrl) {
      console.log(`📬 View Delivered Email in Web Browser (Ethereal): ${previewUrl}`);
    }
    console.log(`==================================================\n`);
    return true;
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send reset email to ${email}:`, error.message);
    return false;
  }
};