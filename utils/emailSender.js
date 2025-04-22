const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: process.env.MAILTRAP_PORT,
  auth: {
    user: process.env.MAILTRAP_USERNAME,
    pass: process.env.MAILTRAP_PASSWORD,
  },
});

const sendVerificationEmail = async (email, verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: process.env.MAIL_FROM_ADDRESS || "noreply@chamberos.com",
    to: email,
    subject: "Verifica tu cuenta de Chamberos",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h1 style="color: #4f46e5; text-align: center;">Bienvenido a Chamberos</h1>
        <p style="color: #374151; font-size: 16px; line-height: 1.5;">Por favor, verifica tu cuenta haciendo clic en el siguiente enlace:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verificar cuenta</a>
        </div>
        <p style="color: #6b7280; font-size: 14px; text-align: center;">Este enlace expirará en 24 horas.</p>
        <p style="color: #6b7280; font-size: 12px; text-align: center; margin-top: 30px;">Si no solicitaste esta verificación, puedes ignorar este correo.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
};
