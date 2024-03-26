import nodemailer from 'nodemailer';

const sendMail = async (to, subject, text) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false, 
        auth: {
          user: process.env.SMTP_USER ,
          pass: process.env.SMTP_PASSWORD
        },
    });

    const mailOptions = {
        from: 'avinash@apnafoundation.live',
        to,
        subject,
        text
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

export {sendMail};