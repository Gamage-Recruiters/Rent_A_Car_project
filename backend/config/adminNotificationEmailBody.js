function setAdminNotificationEmailBody(customerName, subject, message, customerEmail, customerPhone, websiteLink) {
  return `
    <div style="max-width: 600px; margin: auto; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6; color: #333; border: 1px solid #ddd; border-radius: 10px; background-color: #ffffff;">
      
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="display: inline-block; background: linear-gradient(135deg, #007bff, #0056b3); 
                    padding: 15px; border-radius: 50%; margin-bottom: 15px;">
          <svg width="50" height="50" fill="white" viewBox="0 0 24 24">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z"/>
          </svg>
        </div>
        <h2 style="color: #007bff; margin: 0; font-size: 28px; font-weight: bold;">CarRent LK</h2>
        <p style="font-size: 16px; color: #666; margin: 5px 0 0 0;">New Customer Inquiry Alert</p>
      </div>

      <div style="background: linear-gradient(135deg, #007bff, #0056b3); height: 3px; border-radius: 2px; margin: 20px 0;"></div>

      <div style="background-color: #f8f9fa; border-left: 4px solid #007bff; padding: 15px; margin-bottom: 20px;">
        <h3 style="margin-top: 0; color: #007bff;">⚠️ New Customer Message Received</h3>
        <p style="margin-bottom: 0;">A new customer has submitted a contact form message that requires attention.</p>
      </div>

      <div style="margin-bottom: 25px;">
        <h3 style="color: #007bff; border-bottom: 1px solid #dee2e6; padding-bottom: 8px;">👤 Customer Information</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; width: 30%;">Name:</td>
            <td style="padding: 8px 0;">${customerName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Email:</td>
            <td style="padding: 8px 0;">
              <a href="mailto:${customerEmail}" style="color: #007bff; text-decoration: none;">
                ${customerEmail}
              </a>
            </td>
          </tr>
          ${customerPhone ? `
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Phone:</td>
            <td style="padding: 8px 0;">
              <a href="tel:${customerPhone}" style="color: #007bff; text-decoration: none;">
                ${customerPhone}
              </a>
            </td>
          </tr>` : ''}
        </table>
      </div>

      <div style="margin-bottom: 25px;">
        <h3 style="color: #007bff; border-bottom: 1px solid #dee2e6; padding-bottom: 8px;">📝 Message Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; width: 30%;">Category:</td>
            <td style="padding: 8px 0;">
              <span style="background-color: #e3f2fd; color: #0d6efd; padding: 3px 8px; border-radius: 4px; font-size: 14px;">
                ${subject}
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Message:</td>
            <td style="padding: 8px 0;">
              <div style="background: white; padding: 15px; border-radius: 5px; border: 1px solid #dee2e6;">
                <p style="margin: 0; white-space: pre-line;">${message}</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Timestamp:</td>
            <td style="padding: 8px 0;">${new Date().toLocaleString()}</td>
          </tr>
        </table>
      </div>

      <div style="background-color: #fff8e6; border: 1px solid #ffe0b2; padding: 15px; border-radius: 5px; margin-bottom: 25px;">
        <h4 style="margin-top: 0; color: #f57c00;">⏱️ Response Guidelines</h4>
        <ul style="margin-bottom: 0; padding-left: 20px;">
          <li>Respond to all customer inquiries within 24 hours</li>
          <li>For urgent matters (vehicle issues, booking problems), respond within 4 hours</li>
          <li>Always use a professional and courteous tone</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${websiteLink}/admin/dashboard/messages" 
           style="display: inline-block; background: linear-gradient(135deg, #007bff, #0056b3); 
                  color: white; text-decoration: none; padding: 12px 25px; border-radius: 5px; 
                  font-weight: bold; font-size: 14px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          📊 Go to Admin Dashboard
        </a>
      </div>

      <div style="text-align: center; color: #6c757d; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
        <p style="margin-bottom: 10px;">This is an automated message from the CarRent LK system.</p>
        <p style="margin-bottom: 5px;">© ${new Date().getFullYear()} CarRent LK. All rights reserved.</p>
        <p style="margin-bottom: 0;">123 Galle Road, Colombo 03, Sri Lanka</p>
      </div>
    </div>
  `;
}

module.exports = setAdminNotificationEmailBody;