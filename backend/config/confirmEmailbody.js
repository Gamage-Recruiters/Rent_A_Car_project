function setEmailBody(clientName, clientSubject, clientMessage, websiteLink) {
  return `
    <div style="max-width: 600px; margin: auto; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6; color: #333; border: 1px solid #ddd; border-radius: 10px; background-color: #ffffff;">
      
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="display: inline-block; background: linear-gradient(135deg, #007bff, #0056b3); 
                    padding: 15px; border-radius: 50%; margin-bottom: 15px;">
          <svg width="50" height="50" fill="white" viewBox="0 0 24 24">
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
          </svg>
        </div>
        <h2 style="color: #007bff; margin: 0; font-size: 28px; font-weight: bold;">CarRent LK</h2>
        <p style="font-size: 16px; color: #666; margin: 5px 0 0 0;">Your Trusted Car Rental Partner 🚗</p>
      </div>

      <div style="background: linear-gradient(135deg, #007bff, #0056b3); height: 3px; border-radius: 2px; margin: 20px 0;"></div>

      <p style="font-size: 18px; font-weight: bold; color: #333;">Hello ${clientName}! 👋</p>

      <p style="font-size: 16px; margin-bottom: 20px;">
        Thank you for contacting CarRent LK! We're excited to help you with your car rental needs. 
        Our team has received your message and will get back to you within 24 hours.
      </p>

      <div style="background: linear-gradient(135deg, #f8f9fa, #e9ecef); padding: 20px; 
                  border-left: 5px solid #007bff; border-radius: 8px; margin: 25px 0;">
        <h3 style="margin: 0 0 10px 0; color: #007bff; font-size: 18px;">📋 Your Message Details:</h3>
        <p style="margin: 5px 0; font-size: 16px;"><strong>Subject:</strong> ${clientSubject}</p>
        <div style="margin-top: 15px;">
          <p style="margin: 0 0 5px 0; font-weight: bold; color: #495057;">Message:</p>
          <div style="background: white; padding: 15px; border-radius: 5px; border: 1px solid #dee2e6;">
            <p style="margin: 0; font-size: 15px; line-height: 1.5;">${clientMessage}</p>
          </div>
        </div>
      </div>

      <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 25px 0;">
        <h3 style="margin: 0 0 15px 0; color: #1976d2; font-size: 16px;">🌟 Why Choose CarRent LK?</h3>
        <ul style="margin: 0; padding-left: 20px; color: #555;">
          <li style="margin-bottom: 8px;">✅ Wide selection of well-maintained vehicles</li>
          <li style="margin-bottom: 8px;">💰 Competitive pricing with no hidden fees</li>
          <li style="margin-bottom: 8px;">🛡️ Comprehensive insurance coverage</li>
          <li style="margin-bottom: 8px;">🕒 24/7 customer support</li>
          <li style="margin-bottom: 8px;">📍 Convenient pickup and drop-off locations</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${websiteLink}" style="display: inline-block; background: linear-gradient(135deg, #007bff, #0056b3); 
           color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; 
           font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);">
          🌐 Visit Our Website
        </a>
      </div>

      <div style="border-top: 2px solid #e9ecef; margin-top: 30px; padding-top: 20px;">
        <p style="text-align: center; margin: 15px 0; font-size: 16px; font-weight: bold; color: #007bff;">
          CarRent LK - Drive Your Dreams! 🚗💨
        </p>
        
        <div style="text-align: center; margin: 20px 0;">
          <p style="margin: 5px 0; color: #666; font-size: 14px;">
            📧 Email: support@carrentlk.com | 📱 Phone: +94 11 234 5678
          </p>
          <p style="margin: 5px 0; color: #666; font-size: 14px;">
            📍 Address: 123 Galle Road, Colombo 03, Sri Lanka
          </p>
          <a href="${websiteLink}" style="color: #007bff; text-decoration: none; font-weight: bold;">
            www.carrentlk.com
          </a>
        </div>

        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 20px;">
          <p style="font-size: 12px; color: #666; text-align: center; margin: 0; line-height: 1.4;">
            🔒 This email was sent from CarRent LK's automated system. If you didn't submit a contact request, 
            please ignore this email. For immediate assistance, please call us at +94 11 234 5678.
          </p>
        </div>

        <div style="text-align: center; margin-top: 20px;">
          <p style="font-size: 12px; color: #999; margin: 0;">
            Follow us on social media for the latest updates and offers!
          </p>
          <div style="margin-top: 10px;">
            <span style="color: #007bff; margin: 0 10px; font-size: 14px;">📘 Facebook</span>
            <span style="color: #007bff; margin: 0 10px; font-size: 14px;">📷 Instagram</span>
            <span style="color: #007bff; margin: 0 10px; font-size: 14px;">🐦 Twitter</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

module.exports = setEmailBody;