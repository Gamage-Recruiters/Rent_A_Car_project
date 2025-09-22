const Contact = require('../../Models/contactModel');
const { sendEmail, sendAdminNotification } = require('../../config/nodemailerConfig');

async function submitMessage(req, res) {
    try {
        const {firstName, lastName, emailAddress, phoneNumber, subject, message} = req.body;

        console.log('User from token:', req.user);

        const user = req.user;
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required. Please log in."
            });
        }

        if (!firstName || !emailAddress || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: "Please fill all the required fields (firstName, emailAddress, subject, message)."
            });
        }

        const validSubjects = ['Booking Inquiry', 'Customer Support', 'Become a Partner', 'Feedback', 'Other'];
        if (!validSubjects.includes(subject)) {
            return res.status(400).json({
                success: false,
                message: "Invalid subject. Must be one of: " + validSubjects.join(', ')
            });
        }

        const newMessage = await Contact.create({
            customer: req.user.id,
            firstName,
            lastName: lastName || '',
            emailAddress,
            phoneNumber: phoneNumber || '',
            subject,
            message
        });

        try {
            const customerEmailSent = await sendEmail(
                emailAddress, 
                `We've Received Your Message - CarRent LK`,
                firstName,
                subject,
                message,
                process.env.WEBSITE_LINK
            );
            
            if (customerEmailSent) {
                console.log(`Confirmation email sent to customer: ${emailAddress}`);
            } else {
                console.log('Failed to send confirmation email to customer');
            }
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
        }

        try {
            const fullName = lastName ? `${firstName} ${lastName}` : firstName;
            await sendAdminNotification(
                process.env.APP_EMAIL,
                fullName,
                subject,
                message,
                emailAddress,
                phoneNumber || null,
                process.env.WEBSITE_LINK
            );
            console.log('Notification email sent to admin successfully');
        } catch (adminEmailError) {
            console.error('Admin notification email failed:', adminEmailError);
        }

        const populatedMessage = await Contact.findById(newMessage._id)
            .populate('customer', 'firstName lastName email');

        return res.status(201).json({
            success: true,
            message: "Message submitted successfully.",
            data: populatedMessage
        });
    } catch (error) {
         console.error("Error submitting contact message:", error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: messages
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: error.message
        });
    }
};

async function getCustomerMessages(req, res) {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required. Please log in."
            });
        }
        const messages = await Contact.find({ customer: req.user.id })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: messages
        });
    } catch (error) {
        console.error("Error fetching customer messages:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: error.message
        });
    }
};

module.exports = { submitMessage, getCustomerMessages };