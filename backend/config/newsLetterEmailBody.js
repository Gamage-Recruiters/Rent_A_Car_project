function setNewsletterWelcomeEmailBody(customerName, websiteLink, recipientEmail) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; }
            .header { background: #007bff; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
            .button { background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Welcome to CarRent LK Newsletter!</h1>
        </div>
        <div class="content">
            <h2>Hello ${customerName}!</h2>
            <p>Thank you for subscribing to our newsletter! 🎉</p>
            <p>You'll now receive:</p>
            <ul>
                <li>🚗 Latest car rental deals and discounts</li>
                <li>📰 Industry news and updates</li>
                <li>💡 Travel tips and destination guides</li>
                <li>🎁 Exclusive offers for subscribers</li>
            </ul>
            <a href="${websiteLink}" class="button">Visit Our Website</a>
            <p>If you ever want to unsubscribe, you can do so from your profile settings or by clicking the unsubscribe link in any of our emails.</p>
            <p>Happy travels!<br>The CarRent LK Team</p>
        </div>
        <div class="footer">
            <p>CarRent LK - Your trusted car rental partner</p>
            <p>This email was sent to ${recipientEmail}</p>
        </div>
    </body>
    </html>
    `;
}

function setNewsletterUnsubscribeEmailBody(customerName, websiteLink, recipientEmail) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; }
            .header { background: #6c757d; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
            .button { background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Newsletter Unsubscribed</h1>
        </div>
        <div class="content">
            <h2>Goodbye ${customerName}!</h2>
            <p>You have successfully unsubscribed from our newsletter.</p>
            <p>We're sorry to see you go! 😢</p>
            <p>If you change your mind, you can always resubscribe by:</p>
            <ul>
                <li>Visiting our website and signing up again</li>
                <li>Updating your preferences in your account settings</li>
            </ul>
            <a href="${websiteLink}" class="button">Visit Our Website</a>
            <p>Thank you for being part of the CarRent LK community!</p>
            <p>Best regards,<br>The CarRent LK Team</p>
        </div>
        <div class="footer">
            <p>CarRent LK - Your trusted car rental partner</p>
            <p>This email was sent to ${recipientEmail}</p>
        </div>
    </body>
    </html>
    `;
}

module.exports = {
    setNewsletterWelcomeEmailBody,
    setNewsletterUnsubscribeEmailBody
};