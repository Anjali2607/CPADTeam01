const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, resetCode) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.resetCode = resetCode;
    this.from = `<${process.env.EMAIL_FROM}>`;
  }

  newTransporter() {
    // if (process.env.NODE_ENV === 'production') {
    //   //sendGrid
    //   return nodemailer.createTransport({
    //     service: 'SendGrid',
    //     auth: {
    //       user: process.env.SENDGRID_USERNAME,
    //       pass: process.env.SENDGRID_PASSWORD,
    //     },
    //   });
    // }
    // In order to send an email we need to order the 3 steps
    // 1) Create a transpoter
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  //send the actually email
  async send(template, subject, login) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        resetCode: this.resetCode,
        email: this.to,
        tempCode: this.resetCode,
        subject,
      }
    );

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
      //html :
    };

    // 3) Create a transport and send email
    await this.newTransporter().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Carzoo !');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    );
  }

  async sendAlert() {
    await this.send('alert', 'Document expiry alert');
  }
};
