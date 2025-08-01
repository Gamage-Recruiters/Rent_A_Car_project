const User = require('../../../Models/userModel');
const { hashPassword, checkPassword } = require('../../../utils/bcryptUtil');

const { createToken } = require('../../../Utils/jwtUtil');


//Note: this is for to understand and make neccessory changes in this


// Signup   Direct Regiter
async function addUser(req, res) {


    try {
        const { email, password, firstName, lastName } = req.body;

        // check if all fields are not empty
        if (!email || !password || !firstName) {
            return res.status(400).json({ message: 'All Fields Required' });
        }


        // check user already exsist with this email first
        const isUserExsist = await User.findOne({ email });
        if (isUserExsist) {
            return res.status(409).json({ message: "User Email Already Exsist" });
        }

        //Hash Password
        const hashedPassword = await hashPassword(password);

        //Add new user to the database
        const newUser = await User.create({ email, password: hashedPassword, firstName, lastName });
        if (newUser) {

            const payload = {
                id: newUser._id.toString(),
                email: newUser.email,
                userRole: newUser.userRole

            }

            const token = createToken(payload);


            if (!token) {
                return res.status(500).json({ message: 'Token Not Generated' });

            }

            // sending success Response
            return res.status(200).cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Strict', maxAge: 1000 * 60 * 60 * 24 * 5 }).json({ message: "User Registration Successfull" });


        }

    } catch (error) {

        if (error.code === 11000) {
            console.warn("Duplicate slipped through:", email);
            return res.status(409).json({ message: "User Email Already Exsist" });
        }

        // Email Validation
        if (error.name === "ValidationError") {

            return res.status(400).json({ message: "Invalid Email format" });
        }

        // Other Errors
        return res.status(500).json({ message: 'Server Error', error: error.message });
    }

}


async function loginUser(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email or Password cannot be empty" });
    }

    try {
        const existUser = await User.findOne({ email });

        if (!existUser) {
            return res.status(400).json({ message: "Invalid Email" });
        }

        const isPassMatch = await checkPassword(password, existUser.password);

        if (!isPassMatch) {
            return res.status(400).json({ message: "Invalid Password" });
        }

        const payload = {
            id: existUser._id.toString(),
            email: existUser.email,
            userRole: existUser.userRole,
        };

        const token = createToken(payload);

        // Choose cookie name based on role
        const cookieName = (existUser.userRole === 'admin' || existUser.userRole === 'super admin')
            ? 'adminToken'
            : 'token';

        res.cookie(cookieName, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 1000 * 60 * 60 * 24 * 5, // 5 days
        });

        return res.status(200).json({ message: "Login Successful", userRole: existUser.userRole });

    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({ message: "Invalid Email format" });
        }
        return res.status(500).json({ message: 'Server Error', error: error.message });
    }
}

async function logoutUser(req, res) {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict'
    });

    return res.status(200).json({ message: 'Logout successful' });
}


async function findOrCreateGoogleUser(profile) {
    try {
        const existingUser = await User.findOne({
            $or: [
                { googleId: profile.id },
                { email: profile.emails?.[0]?.value }
            ]
        });

        if (existingUser) {
            return existingUser;
        }

        const newUser = await User.create({
            googleId: profile.id,
            firstName: profile.name.givenName || '',
            lastName: profile.name.familyName || '',
            email: profile.emails?.[0]?.value || '',
            photo: profile.photos[0]?.value || ''
        });

        return newUser;

    } catch (error) {
        throw error;
    }
}

async function googleLoginUser(req, res) {

    try {


        const payload = {

            id: req.user._id.toString(),

            googleId: req.user.googleId,

            email: req.user.email,

            userRole: req.user.userRole
        }

        const token = createToken(payload);

        res.status(200)
            .cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict', maxAge: 1000 * 60 * 60 * 24 * 5     // 5 days 
            })

        return res.redirect(process.env.CLIENT_URL);


    
    } catch (error) {

        // Email Validation
        if (error.name === "ValidationError") {

            return res.status(400).json({ message: "Invalid Email format" });
        }
        // Other Errors
        return res.status(500).json({ message: 'Server Error', error: error.message });
    }

}



module.exports = { addUser, loginUser, logoutUser, findOrCreateGoogleUser, googleLoginUser }