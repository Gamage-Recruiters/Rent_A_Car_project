const Customer = require('../../Models/customerModel');
const { sendNewsletterWelcomeEmail, sendNewsletterUnsubscribeEmail } = require('../../config/nodemailerConfig');

// Subscribe to newsletter (authenticated users)
async function subscribeNewsletter(req, res) {
    try {
        const customer = await Customer.findById(req.user.id);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        if (customer.isNewsletterSubscribed) {
            return res.status(400).json({
                success: false,
                message: 'You are already subscribed to our newsletter'
            });
        }

        // Update subscription status
        const updatedCustomer = await Customer.findByIdAndUpdate(
            req.user.id,
            {
                isNewsletterSubscribed: true,
                newsletterSubscribedAt: new Date(),
                newsletterUnsubscribedAt: null
            },
            { new: true }
        ).select('-password -refreshToken -resetPasswordToken');

        // Send welcome email
        const emailSent = await sendNewsletterWelcomeEmail(
            customer.email,
            customer.firstName,
            process.env.CLIENT_URL
        );

        res.status(200).json({
            success: true,
            message: 'Successfully subscribed to newsletter',
            data: {
                email: updatedCustomer.email,
                isNewsletterSubscribed: updatedCustomer.isNewsletterSubscribed,
                subscribedAt: updatedCustomer.newsletterSubscribedAt
            },
            emailSent: emailSent
        });

    } catch (error) {
        console.error('Newsletter subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
}

// Unsubscribe from newsletter (authenticated users)
async function unsubscribeNewsletter(req, res) {
    try {
        const customer = await Customer.findById(req.user.id);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        if (!customer.isNewsletterSubscribed) {
            return res.status(400).json({
                success: false,
                message: 'You are not subscribed to our newsletter'
            });
        }

        // Update subscription status
        const updatedCustomer = await Customer.findByIdAndUpdate(
            req.user.id,
            {
                isNewsletterSubscribed: false,
                newsletterUnsubscribedAt: new Date()
            },
            { new: true }
        ).select('-password -refreshToken -resetPasswordToken');

        // Send unsubscribe confirmation email
        const emailSent = await sendNewsletterUnsubscribeEmail(
            customer.email,
            customer.firstName,
            process.env.CLIENT_URL
        );

        res.status(200).json({
            success: true,
            message: 'Successfully unsubscribed from newsletter',
            data: {
                email: updatedCustomer.email,
                isNewsletterSubscribed: updatedCustomer.isNewsletterSubscribed,
                unsubscribedAt: updatedCustomer.newsletterUnsubscribedAt
            },
            emailSent: emailSent
        });

    } catch (error) {
        console.error('Newsletter unsubscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
}

// Get newsletter subscription status
async function getNewsletterStatus(req, res) {
    try {
        const customer = await Customer.findById(req.user.id).select('email isNewsletterSubscribed newsletterSubscribedAt newsletterUnsubscribedAt');
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                email: customer.email,
                isNewsletterSubscribed: customer.isNewsletterSubscribed,
                subscribedAt: customer.newsletterSubscribedAt,
                unsubscribedAt: customer.newsletterUnsubscribedAt
            }
        });

    } catch (error) {
        console.error('Get newsletter status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
}


module.exports = {
    subscribeNewsletter,
    unsubscribeNewsletter,
    getNewsletterStatus,
};