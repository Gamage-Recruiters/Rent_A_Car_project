const nodemailer = require("nodemailer");
const setConfirmEmailBody = require('./confirmEmailbody');
const setPasswordResetEmailBody = require('./resetPassEmailBody');
const { setNewsletterWelcomeEmailBody, setNewsletterUnsubscribeEmailBody } = require('./newsLetterEmailBody');
const setAdminNotificationEmailBody = require('./adminNotificationEmailBody');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.APP_EMAIL,
        pass: process.env.APP_PASSWORD
    },
});

async function sendEmail(to, subject, clientName, clientSubject, clientMassage, websiteLink) {
    try {
        const mailDetails = {
            from: process.env.APP_EMAIL,
            to: to,
            subject: subject,
            html: setConfirmEmailBody(clientName, clientSubject, clientMassage, websiteLink),
        };

        await transporter.sendMail(mailDetails);
        return true;
    } catch (error) {
        console.log("Failed to send email:", error);
        return false; 
    }
}

async function sendPasswordResetEmail(to, customerName, resetLink, websiteLink) {
    try {
        const mailDetails = {
            from: process.env.APP_EMAIL,
            to: to,
            subject: "Password Reset Request",
            html: setPasswordResetEmailBody(customerName, resetLink, websiteLink),
        };

        await transporter.sendMail(mailDetails);

        return true;

    } catch (error) {
        console.log("Failed to send email:", error);
    }
}

async function sendNewsletterWelcomeEmail(to, customerName, websiteLink) {
    try {
        const mailDetails = {
            from: process.env.APP_EMAIL,
            to: to,
            subject: "Welcome to CarRent LK Newsletter! 🚗",
            html: setNewsletterWelcomeEmailBody(customerName, websiteLink, to),
        };

        await transporter.sendMail(mailDetails);
        return true;
    } catch (error) {
        console.log("Failed to send newsletter welcome email:", error);
        return false;
    }
}

async function sendNewsletterUnsubscribeEmail(to, customerName, websiteLink) {
    try {
        const mailDetails = {
            from: process.env.APP_EMAIL,
            to: to,
            subject: "Goodbye from CarRent LK Newsletter! 😢",
            html: setNewsletterUnsubscribeEmailBody(customerName, websiteLink, to),
        };

        await transporter.sendMail(mailDetails);
        return true;
    } catch (error) {
        console.log("Failed to send newsletter unsubscribe email:", error);
        return false;
    }
}

async function sendAdminNotification(to, customerName, subject, message, customerEmail, customerPhone, websiteLink) {
    try {
        const mailDetails = {
            from: process.env.APP_EMAIL,
            to: to,
            subject: `New ${subject} Message from ${customerName}`,
            html: setAdminNotificationEmailBody(customerName, subject, message, customerEmail, customerPhone, websiteLink),
        };

        await transporter.sendMail(mailDetails);
        return true;
    } catch (error) {
        console.log("Failed to send admin notification email:", error);
        return false;
    }
}

module.exports = { sendEmail, sendPasswordResetEmail, sendNewsletterWelcomeEmail, sendNewsletterUnsubscribeEmail, sendAdminNotification };
