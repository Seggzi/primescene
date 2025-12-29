const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

// Gmail transporter using your App Password
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "olaiyaabdulqodir21@gmail.com",
    pass: "szfh kulm lqjm rphu", // Your 16-digit app password — keep this safe!
  },
});

// Welcome email when new user signs up
exports.sendWelcomeEmail = functions.auth.user().onCreate(async (user) => {
  const email = user.email;
  const displayName = user.displayName || "Movie Lover";

  if (!email) {
    console.log("No email found for user:", user.uid);
    return null;
  }

  const mailOptions = {
    from: '"PrimeScene" <olaiyaabdulqodir21@gmail.com>',
    to: email,
    subject: "Welcome to PrimeScene! 🎬🇳🇬",
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; background: #000; color: white; margin: 0; padding: 0;">
          <div style="max-width: 600px; margin: 20px auto; background: #111; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(229, 9, 20, 0.3);">
            <div style="background: linear-gradient(135deg, #e50914, #b20710); padding: 40px 20px; text-align: center;">
              <h1 style="font-size: 36px; margin: 0; color: white;">Welcome to PrimeScene!</h1>
            </div>
            <div style="padding: 40px 30px; text-align: center;">
              <p style="font-size: 20px; margin-bottom: 10px;">Hi <strong>${displayName}</strong>,</p>
              <p style="font-size: 18px; line-height: 1.6; color: #ccc;">
                Thank you for joining <strong>PrimeScene</strong> — the ultimate home of Nollywood and global entertainment!
              </p>
              <p style="font-size: 18px; color: #ccc; margin: 30px 0;">
                Dive into unlimited movies, series, and exclusive content in HD — all for free.
              </p>
              <a href="https://primescene.vercel.app" 
                 style="display: inline-block; background: #e50914; color: white; padding: 16px 36px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 18px; margin: 20px 0;">
                Start Watching Now 🎬
              </a>
              <p style="color: #888; margin-top: 40px; font-size: 14px;">
                Enjoy the show!<br>
                <strong>The PrimeScene Team 🇳🇬</strong>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Welcome email sent to:", email);
    return null;
  } catch (error) {
    console.error("❌ Error sending welcome email:", error);
    return null;
  }
});