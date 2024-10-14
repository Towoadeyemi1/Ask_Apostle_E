import nodemailer from 'nodemailer'

export async function sendVerificationEmail(email: string, token: string) {
  const transporter = nodemailer.createTransport({
    // Configure your email service here
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/verify?token=${token}`

  await transporter.sendMail({
    from: '"Ask Apostle E" <noreply@askapostlee.com>',
    to: email,
    subject: "Verify your email for Ask Apostle E",
    text: `Please click on this link to verify your email: ${verificationLink}`,
    html: `<p>Please click on this link to verify your email: <a href="${verificationLink}">${verificationLink}</a></p>`,
  })
}