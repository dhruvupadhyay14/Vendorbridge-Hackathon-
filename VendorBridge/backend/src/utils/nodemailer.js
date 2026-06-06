import transporter from '../config/nodemailer.js';

// Send email
export const sendEmail = async (to, subject, htmlContent, attachments = []) => {
  try {
    const mailOptions = {
      from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
      to,
      subject,
      html: htmlContent,
      attachments,
    };

    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Email templates
export const emailTemplates = {
  // Welcome email for new vendor
  vendorWelcome: (vendorName, approvalLink) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to VendorBridge, ${vendorName}!</h2>
        <p>Your vendor account has been created successfully.</p>
        <p>Our team is reviewing your information. You will receive an email once your account is approved.</p>
        <p>If you have any questions, please contact us at ${process.env.SMTP_FROM_EMAIL}</p>
        <br>
        <p>Best regards,<br>VendorBridge Team</p>
      </div>
    `;
  },

  // Vendor approval email
  vendorApproved: (vendorName, loginLink) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Your VendorBridge Account is Approved!</h2>
        <p>Hi ${vendorName},</p>
        <p>Congratulations! Your vendor account has been approved and is now active.</p>
        <p><a href="${loginLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Login to Your Account</a></p>
        <p>Best regards,<br>VendorBridge Team</p>
      </div>
    `;
  },

  // Vendor rejection email
  vendorRejected: (vendorName, reason) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>VendorBridge Registration Update</h2>
        <p>Hi ${vendorName},</p>
        <p>Thank you for your interest in partnering with us. Unfortunately, your vendor registration has been declined.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>You may reapply after addressing the concerns mentioned.</p>
        <p>Best regards,<br>VendorBridge Team</p>
      </div>
    `;
  },

  // Order confirmation email
  orderConfirmation: (orderNumber, vendorName, orderDetails) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Purchase Order Confirmation - ${orderNumber}</h2>
        <p>Hi ${vendorName},</p>
        <p>Your purchase order has been submitted successfully.</p>
        <h3>Order Details:</h3>
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <p>${orderDetails}</p>
        <p>We will notify you when your order is approved.</p>
        <p>Best regards,<br>VendorBridge Team</p>
      </div>
    `;
  },

  // Invoice notification email
  invoiceNotification: (invoiceNumber, totalAmount, dueDate) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Invoice Notification - ${invoiceNumber}</h2>
        <p>An invoice has been issued.</p>
        <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
        <p><strong>Total Amount:</strong> $${totalAmount}</p>
        <p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
        <p>Please process the payment by the due date.</p>
        <p>Best regards,<br>VendorBridge Team</p>
      </div>
    `;
  },

  // Password reset email
  passwordReset: (resetLink) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Click the link below to proceed:</p>
        <p><a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
        <p><strong>Note:</strong> This link expires in 24 hours.</p>
        <p>If you did not request this, please ignore this email.</p>
        <p>Best regards,<br>VendorBridge Team</p>
      </div>
    `;
  },
};

// Send common emails
export const sendWelcomeEmail = (vendorEmail, vendorName) => {
  return sendEmail(
    vendorEmail,
    'Welcome to VendorBridge',
    emailTemplates.vendorWelcome(vendorName, '')
  );
};

export const sendApprovalEmail = (vendorEmail, vendorName, loginLink) => {
  return sendEmail(
    vendorEmail,
    'Your VendorBridge Account is Approved',
    emailTemplates.vendorApproved(vendorName, loginLink)
  );
};

export const sendRejectionEmail = (vendorEmail, vendorName, reason) => {
  return sendEmail(
    vendorEmail,
    'Your VendorBridge Registration Status',
    emailTemplates.vendorRejected(vendorName, reason)
  );
};

export const sendOrderConfirmationEmail = (vendorEmail, orderNumber, vendorName, orderDetails) => {
  return sendEmail(
    vendorEmail,
    `Purchase Order Confirmation - ${orderNumber}`,
    emailTemplates.orderConfirmation(orderNumber, vendorName, orderDetails)
  );
};

export const sendInvoiceNotificationEmail = (vendorEmail, invoiceNumber, totalAmount, dueDate) => {
  return sendEmail(
    vendorEmail,
    `Invoice Notification - ${invoiceNumber}`,
    emailTemplates.invoiceNotification(invoiceNumber, totalAmount, dueDate)
  );
};

export const sendPasswordResetEmail = (userEmail, resetLink) => {
  return sendEmail(
    userEmail,
    'Password Reset Request',
    emailTemplates.passwordReset(resetLink)
  );
};
