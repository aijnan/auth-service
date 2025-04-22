import * as nodemailer from "nodemailer";

export type OTPType = "sign-in" | "email-verification" | "forget-password";

const expirationTime = 5;

function validateEnvVariables() {
  const requiredVars = [
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASSWORD',
    'MAIL_FROM'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`missing required env variables: ${missingVars.join(', ')}`);
  }
}

validateEnvVariables();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT!),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

const getSubject = (type: OTPType, otp: string): string => {
  return `Your Verification Code is [${otp}], Valid for ${expirationTime} Minutes`;
};

const generateHtmlTemplate = (type: OTPType, otp: string): string => {
  let chineseContent = "";
  let englishContent = "";
  
  switch (type) {
    case "sign-in":
      chineseContent = "请使用该验证码登录";
      englishContent = "Please use this code to complete your sign-in";
      break;
    case "email-verification":
      chineseContent = "请验证您的邮箱以完成注册";
      englishContent = "Please verify your email to complete registration";
      break;
    case "forget-password":
      chineseContent = "请使用该验证码重置您的密码";
      englishContent = "Please use this code to reset your password";
      break;
  }
  
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Code</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f4;">
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <tr>
        <td style="padding: 40px 30px;">
            <p style="font-size: 16px; color: #333333; margin-bottom: 20px;">
                您的验证码是：<br>
                Your verification code is:
            </p>
            <p style="font-size: 32px; font-weight: bold; color: #9B4F96; text-align: center; margin: 30px 0; padding: 10px; border: 2px solid #9B4F96; border-radius: 10px;">
                <strong>${otp}</strong>
            </p>
            <p style="font-size: 16px; color: #333333; margin-bottom: 10px;">
                ${chineseContent}<br>
                ${englishContent}
            </p>
            <p style="font-size: 16px; color: #333333; margin-bottom: 20px;">
                此验证码将在${expirationTime}分钟内有效。请勿将验证码分享给他人。<br>
                This code is valid for ${expirationTime} minutes. Please do not share it with anyone.
            </p>
            <p style="font-size: 16px; color: #333333; margin-bottom: 20px;">
                如果您没有请求此验证码，请忽略此邮件。<br>
                If you didn't request this code, please ignore this email.
            </p>
        </td>
    </tr>
    <tr>
        <td style="padding: 20px 30px; background-color: #f0e6ff; text-align: center; color: #9B4F96; font-size: 14px;">
            <p style="margin: 0;">
                此邮件由系统自动发送，请勿回复。<br>
                This is an automated message. Please do not reply.
            </p>
        </td>
    </tr>
</table>
</body>
</html>
  `;
};

export async function sendOTPEmail(email: string, otp: string, type: OTPType): Promise<void> {
  const subject = getSubject(type, otp);
  const htmlContent = generateHtmlTemplate(type, otp);
  
  const mailOptions = {
    from: process.env.MAIL_FROM,
    to: email,
    subject,
    text: `您的验证码是: ${otp}，有效期${expirationTime}分钟。\nYour verification code is: ${otp}, valid for ${expirationTime} minutes.`,
    html: htmlContent
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log(`send verification otp success: ${email}, type: ${type}`);
  } catch (error) {
    console.error("send verification otp error:", error);
    throw error;
  }
} 