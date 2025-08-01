const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId: {
        type: String,
        sparse: true,
        unique: true,
    },
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
    photo: {
        type: String,
        default: null
    },

    image: {
        public_id: {
            type: String,
            default: null,
        },
        url: {
            type: String,
            default: null,
        }
    },

    userRole: {
        type: String,
        enum: [
            'customer',
            'owner',
            'super admin',
        ],

        default: 'customer'
    },
    createdAt: { type: Date, default: Date.now }

},
    {
        timestamps: true,
    }
);

const User = mongoose.model('user', userSchema);
module.exports = User;