import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.HOST_EMAIL,
    pass: process.env.HOST_PASS,
  },
});

export const sendEmail = async (to, subject, html) => {
  try {
    const send = await transporter.sendMail({
      from: `"TutorConnect" <${process.env.HOST_EMAIL}>`,
      to: to,
      subject: subject,
      html: html,
    });
    return send;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};
