import config from '../config'
import nodemailer from 'nodemailer'
import SMTPTransport from 'nodemailer/lib/smtp-transport'

const transport = nodemailer.createTransport(
  new SMTPTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.password,
    },
  })
)

export const sendEmail = async (
  to: string,
  subject: string,
  body: string,
  htmlBody?: string
) => {
  const mailOptions: {
    from: string
    to: string
    subject: string
    text: string
    html?: string
  } = {
    from: `"Digital läsesal" ${config.smtp.user}`,
    to,
    subject,
    text: body,
    html: htmlBody || body,
  }

  await transport.sendMail(mailOptions)
}
