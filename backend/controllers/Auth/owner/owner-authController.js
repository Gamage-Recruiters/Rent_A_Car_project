const Owner = require("../../../Models/ownerModel");
const { hashPassword, checkPassword } = require("../../../utils/bcryptUtil");

const {
  createToken,
  createRefreshToken,
  verifyRefreshToken,
} = require("../../../utils/jwtUtil");

// Direct Registration For Owner
// Direct Registration For Owner
async function registerOwner(req, res) {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    // --- 1. Basic Field Presence Check ---
    if (!email || !password || !firstName) {
      return res.status(400).json({ 
        message: "Email, Password and FirstName Fields are Required" 
      });
    }

    // --- 2. Phone Number Validation (Fixes T003) ---
    // Enforces exactly 10 numeric digits as required by QA 
    const phoneRegex = /^\d{10}$/;
    if (!phone || !phoneRegex.test(phone)) {
      return res.status(400).json({ 
        message: "Please enter a valid 10-digit phone number" 
      });
    }

    // --- 3. Password Length Validation (Fixes T005) ---
    // Enforces minimum 6 characters for security compliance 
    if (password.length < 6) {
      return res.status(400).json({ 
        message: "Password must be at least 6 characters" 
      });
    }

    // Check owner already exists with this email
    const isOwnerExsist = await Owner.findOne({ email });
    if (isOwnerExsist) {
      return res.status(409).json({ message: "Owner Email Already Exists" });
    }

    // Hash Password
    const hashedPassword = await hashPassword(password);

    // Add new owner to the database
    const newOwner = await Owner.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
    });

    if (newOwner) {
      const payload = {
        id: newOwner._id.toString(),
        email: newOwner.email,
        userRole: "owner",
      };

      const accessToken = createToken(payload);
      const refreshToken = createRefreshToken(payload);

      if (!accessToken || !refreshToken) {
        return res.status(500).json({ message: "Token Not Generated" });
      }

      // Store refresh token in db
      await Owner.findByIdAndUpdate(newOwner._id, { refreshToken });

      // Set cookies
      const accessCookieName = process.env.OWNER_COOKIE_NAME;
      const refreshCookieName = process.env.OWNER_REFRESH_COOKIE_NAME;

      res.cookie(accessCookieName, accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 1000 * 60 * 15, // 15 minutes
      });

      res.cookie(refreshCookieName, refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      });

      return res.status(200).json({
        message: "Owner Registration Successful",
        accessToken,
        refreshToken,
        owner: {
          id: newOwner._id,
          email: newOwner.email,
          firstName: newOwner.firstName,
          lastName: newOwner.lastName,
          phone: newOwner.phone,
        },
      });
    }
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Owner's Email Already Exists" });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Invalid Email format" });
    }

    return res.status(500).json({ message: "Server Error", error: error.message });
  }
}

async function loginOwner(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and Password are required" });
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

    // If you don’t want approval system, remove this check
    if (existOwner.isApproved === false) {
      return res.status(403).json({
        message: "Your account is pending approval by an administrator",
      });
    }

    const payload = {
      id: existOwner._id.toString(),
      email: existOwner.email,
      userRole: "owner",
    };

    const accessToken = createToken(payload);
    const refreshToken = createRefreshToken(payload);

    // Save refresh token in DB
    await Owner.findByIdAndUpdate(existOwner._id, { refreshToken });

    // Set cookies
    const accessCookieName = process.env.OWNER_COOKIE_NAME || "owner_access";
    const refreshCookieName = process.env.OWNER_REFRESH_COOKIE_NAME || "owner_refresh";

    res.cookie(accessCookieName, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 1000 * 60 * 15, // 15 minutes
    });

    res.cookie(refreshCookieName, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    return res.status(200).json({
      message: "Owner Login Successful",
      userRole: "owner",
      userId: existOwner._id.toString(),
      firstName: existOwner.firstName,
      lastName: existOwner.lastName,
      email: existOwner.email,
      phone: existOwner.phone,
      token: accessToken,
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
}


async function logoutOwner(req, res) {
  try {
    const refreshToken = req.cookies[process.env.OWNER_REFRESH_COOKIE_NAME];

    // Remove refresh token from database
    if (refreshToken) {
      await Owner.findOneAndUpdate({ refreshToken }, { refreshToken: null });
    }

    // Clear cookies both refresh and access
    res.clearCookie(process.env.OWNER_COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    res.clearCookie(process.env.OWNER_REFRESH_COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
}

module.exports = { registerOwner, loginOwner, logoutOwner };
