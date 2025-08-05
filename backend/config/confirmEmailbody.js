// this is needed to be change according to our project

function setEmailBody(clientName, clientSubject, clientMessage, websiteLink) {
  return `
    <div style="max-width: 600px; margin: auto; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6; color: #333; border: 1px solid #ddd; border-radius: 10px; background-color: #ffffff;">
      
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://i.ibb.co/4Y3y6Km/rotaract-logo.png" alt="Rotaract Logo" width="80" height="80" style="margin-bottom: 10px;" />
        <h2 style="color: #d21f3c; margin: 0;">Rotaract Club of Saegis Campus</h2>
        <p style="font-size: 14px; color: #666;">Together We Learn, Lead, and Serve</p>
      </div>

      <p><strong>Hi ${clientName},</strong></p>

      <p>Thank you for reaching out to us via our blog site! We truly value your interest and will respond to your message as soon as possible.</p>

      <div style="background-color: #f5f5f5; padding: 15px 20px; border-left: 4px solid #d21f3c; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Subject:</strong> ${clientSubject}</p>
        <p style="margin: 5px 0 0 0;"><strong>Message:</strong></p>
        <p style="margin: 5px 0 0 0;">${clientMessage}</p>
      </div>

      <p style="text-align: center; margin-top: 30px;">
        <strong>Rotaract Club of Saegis Campus</strong><br>
        <a href="${websiteLink}" style="color: #d21f3c; text-decoration: none;">${websiteLink}</a>
      </p>

      <p style="font-size: 12px; color: #999; text-align: center; margin-top: 10px;">
        This is an automated message from our website. If you didn’t submit a contact request, please ignore this email.
      </p>
    </div>
  `;
}

module.exports = setEmailBody;
