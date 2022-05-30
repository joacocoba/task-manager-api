const sgMail = require("@sendgrid/mail");
const { SENDGRID_API_KEY } = process.env;
const emailSender = "jcaubarrere1@gmail.com";

sgMail.setApiKey(SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: emailSender,
    from: emailSender,
    subject: "Welcome to our App",
    text: `Welcome ${name} to our services :)`,
  });
};

const sendCancelationEmail = (email, name) => {
  sgMail.send({
    to: emailSender,
    from: emailSender,
    subject: "Did you decide to leave us?",
    text: `We can't belive that you decide to leave us behind ${name}. We reserve you email address: ${email} for if you decide to come back :)`,
  });
};

module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail,
};
