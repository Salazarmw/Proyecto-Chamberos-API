const nodemailer = require("nodemailer");

// Verificar variables de entorno requeridas
const requiredEnvVars = [
  "MAILTRAP_HOST",
  "MAILTRAP_PORT",
  "MAILTRAP_USERNAME",
  "MAILTRAP_PASSWORD",
  "FRONTEND_URL",
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(
      `Error: ${envVar} no está definida en las variables de entorno`
    );
    process.exit(1);
  }
}

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: parseInt(process.env.MAILTRAP_PORT),
  auth: {
    user: process.env.MAILTRAP_USERNAME,
    pass: process.env.MAILTRAP_PASSWORD,
  },
  debug: true, // Habilitar modo debug
  logger: true, // Habilitar logging
});

// Verificar la conexión al iniciar
transporter.verify(function (error, success) {
  if (error) {
    console.error("Error al verificar la conexión con Mailtrap:", error);
  } else {
    console.log("Servidor listo para enviar emails");
  }
});

const sendVerificationEmail = async (email, verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

  try {
    console.log("Intentando enviar email a:", email);
    console.log("Configuración del transporter:", {
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      user: process.env.MAILTRAP_USERNAME,
    });

    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM_ADDRESS || "noreply@chamberos.com",
      to: email,
      subject: "Verifica tu cuenta de Chamberos",
      html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Verifica tu cuenta de Chamberos</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; border-spacing: 0; background-color: #f3f4f6;">
                <tr>
                  <td style="padding: 20px 0; text-align: center;">
                    <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                      <tr>
                        <td style="padding: 40px 20px; text-align: center;">
                          <div style="margin-bottom: 30px;">
                            <img src="https://raw.githubusercontent.com/shadcn/ui/main/apps/www/public/avatars/01.png" alt="Chamberos Logo" style="width: 80px; height: 80px; border-radius: 50%;">
                          </div>
                          
                          <h1 style="color: #1f2937; font-size: 24px; font-weight: 600; margin: 0 0 20px 0;">¡Bienvenido a Chamberos!</h1>
                          
                          <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin: 0 0 30px 0;">
                            Gracias por registrarte. Para comenzar a usar tu cuenta, por favor verifica tu dirección de correo electrónico haciendo clic en el botón de abajo.
                          </p>
                          
                          <div style="margin: 30px 0;">
                            <a href="${verificationUrl}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500; font-size: 16px;">
                              Verificar cuenta
                            </a>
                          </div>
                          
                          <p style="color: #6b7280; font-size: 14px; margin: 0 0 20px 0;">
                            Este enlace expirará en 24 horas.
                          </p>
                          
                          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                          
                          <p style="color: #6b7280; font-size: 12px; margin: 0;">
                            Si no solicitaste esta verificación, puedes ignorar este correo de forma segura.
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                    <table role="presentation" style="max-width: 600px; margin: 20px auto 0;">
                      <tr>
                        <td style="text-align: center; padding: 20px;">
                          <p style="color: #6b7280; font-size: 12px; margin: 0;">
                            © ${new Date().getFullYear()} Chamberos. Todos los derechos reservados.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `,
    });

    console.log("Email enviado exitosamente:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error detallado al enviar email:", error);
    throw new Error(`Error al enviar email: ${error.message}`);
  }
};

module.exports = {
  sendVerificationEmail,
};
