const mongoose = require('mongoose');

const ownerSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/.+@.+\..+/, "Invalid email format"]
    },

    password: {
        type: String,
    },

    firstName: {
        type: String,
        required: true
    },

    lastName: {
        type: String,
        default: ''
    },

    image: {
        type: String,
        default: null
    },

    isApproved: {
        type: Boolean,
        default: false,
        description: "Indicates whether the owner is approved by super admin"
    },

    refreshToken: {
        type: String,
        default: null
    },

    createdAt: {
        type: Date, 
        default: Date.now 
    }
},
    {
        timestamps: true,
    }
);

const Owner = mongoose.model('owner', ownerSchema);
module.exports = Owner;