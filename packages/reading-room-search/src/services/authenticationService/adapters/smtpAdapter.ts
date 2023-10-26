import config from '../../../common/config'
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

export const sendEmail = async (to: string, subject: string, body: string) => {
  await transport.sendMail({
    from: `"Digital läsesal" ${config.smtp.user}`,
    to,
    subject,
    text: body,
  })
}
