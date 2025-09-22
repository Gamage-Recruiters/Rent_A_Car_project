const Owner = require('../../../Models/ownerModel');
const { hashPassword, checkPassword } = require('../../../utils/bcryptUtil');

const { createToken, createRefreshToken, verifyRefreshToken } = require('../../../utils/jwtUtil');

// Direct Registration For Owner
async function registerOwner(req, res) {
    try {
        const { email, password, firstName, lastName } = req.body;

        // Check if required fields are not empty
        if (!email || !password || !firstName) {
            return res.status(400).json({ message: 'Email, Passowrd and FirstName Fields are Required' });
        }

        // Check owner already exsist with this email first
        const isOwnerExsist = await Owner.findOne({ email });
        if (isOwnerExsist) {
            return res.status(409).json({ message: "Owner Email Already Exsist" });
        }

        // Hash Password
        const hashedPassword = await hashPassword(password);

        // Add new owner owner to the database
        const newOwner = await Owner.create({ 
            email, 
            password: hashedPassword, 
            firstName, 
            lastName,
        });

        if (newOwner) {
            const payload = {
                id: newOwner._id.toString(),
                email: newOwner.email,
                userRole: 'owner'
            }

            const accessToken = createToken(payload);
            const refreshToken = createRefreshToken(payload);

            if (!accessToken || !refreshToken) {
                return res.status(500).json({ message: 'Token Not Generated' });
            }

            // Store refresh token in db
            await Owner.findByIdAndUpdate(newOwner._id, { refreshToken });

            // Set cookies
            const accessCookieName = process.env.OWNER_COOKIE_NAME;
            const refreshCookieName = process.env.OWNER_REFRESH_COOKIE_NAME;

            res.cookie(accessCookieName, accessToken, {
                httpOnly: true, 
                secure: process.env.NODE_ENV === 'production', 
                sameSite: 'Strict', 
                maxAge: 1000 * 60 * 15 // 15 minutes
            });

            res.cookie(refreshCookieName, refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict',
                maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
            });

            return res.status(200).json({ message: "Owner Registration Successfull" });
        }
    } catch (error) {
        if (error.code === 11000) {
            console.warn("Duplicate slipped through:", email);
            return res.status(409).json({ message: "Owner's Email Already Exsist" });
        }

        // Email Validation
        if (error.name === "ValidationError") {
            return res.status(400).json({ message: "Invalid Email format" });
        }

        // Other Errors
        return res.status(500).json({ message: 'Server Error', error: error.message });
    }
}

async function loginOwner(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email or Password cannot be empty" });
    }

    try {
        const existOwner = await Owner.findOne({ email });

        if (!existOwner) {
            return res.status(400).json({ message: "Invalid Email" });
        }

        const isPassMatch = await checkPassword(password, existOwner.password);

        if (!isPassMatch) {
            return res.status(400).json({ message: "Invalid Password" });
        }

        if (!existOwner.isApproved) {
            return res.status(403).json({ 
                message: "Your account is pending approval by an administrator"
            });
        }

        const payload = {
            id: existOwner._id.toString(),
            email: existOwner.email,
            userRole: 'owner',
        };

        const accessToken = createToken(payload);
        const refreshToken = createRefreshToken(payload);

        // Store refresh token in database
        await Owner.findByIdAndUpdate(existOwner._id, { refreshToken });

        // Set cookies
        const accessCookieName = process.env.OWNER_COOKIE_NAME;
        const refreshCookieName = process.env.OWNER_REFRESH_COOKIE_NAME;

        res.cookie(accessCookieName, accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 1000 * 60 * 15, // 15 minutes
        });

        res.cookie(refreshCookieName, refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
        });

        return res.status(200).json({ message: "Owner Login Successful" });

    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({ message: "Invalid Email format" });
        }
        return res.status(500).json({ message: 'Server Error', error: error.message });
    }
}

async function logoutOwner(req, res) {
    try {
        const refreshToken = req.cookies[process.env.OWNER_REFRESH_COOKIE_NAME];

        // Remove refresh token from database
        if (refreshToken) {
            await Owner.findOneAndUpdate(
                { refreshToken },
                { refreshToken: null }
            );
        }

        // Clear cookies both refresh and access
        res.clearCookie(process.env.OWNER_COOKIE_NAME, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict'
        });

        res.clearCookie(process.env.OWNER_REFRESH_COOKIE_NAME, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict'
        });

        return res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        return res.status(500).json({ message: 'Server Error', error: error.message });
    }
}

module.exports = { registerOwner, loginOwner, logoutOwner }