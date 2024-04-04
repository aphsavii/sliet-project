import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const sendMail = (to, subject, text) => {
  const mailOptions = {
    from: "avinash@apnafoundation.live",
    to,
    subject,
    text,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.dir(error);
        resolve(false);
      } else {
        console.log("Email sent: " + info.response);
        resolve(true);
      }
    });
  });
};

export { sendMail };