const Customer = require('../../Models/customerModel');
const Contact = require('../../Models/contactModel');
const mongoose = require('mongoose');

// Get all customers
const getAllCustomers = async (req, res) => {
    try {
        const customers = await Customer.find();
        res.status(200).json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customers', error: error.message });
    }
};

// Count all customers
const countCustomers = async (req, res) => {
    try {
        const total = await Customer.countDocuments();
        res.status(200).json({ total });
    } catch (error) {
        res.status(500).json({ message: 'Error counting customers', error: error.message });
    }
};

// Get all contact inquiries
const getAllInquiries = async (req, res) => {
    try {
        const inquiries = await Contact.find()
            .populate('customer', 'firstName lastName email phoneNumber')
            .sort({ createdAt: -1 });
        res.status(200).json(inquiries);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching inquiries', error: error.message });
    }
};
// Get inquiry details by ID
const getInquiryById = async (req, res) => {
    try {
        const inquiry = await Contact.findById(req.params.id)
            .populate('customer', 'firstName lastName email phoneNumber');
        
        if (!inquiry) {
            return res.status(404).json({ message: 'Inquiry not found' });
        }
        
        res.status(200).json(inquiry);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching inquiry details', error: error.message });
    }
};
// Count all inquiries
const countInquiries = async (req, res) => {
    try {
        const total = await Contact.countDocuments();
        res.status(200).json({ total });
    } catch (error) {
        res.status(500).json({ message: 'Error counting inquiries', error: error.message });
    }
};
// Post a reply to an inquiry
const replyToInquiry = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Reply message is required" });
    }

    const inquiry = await Contact.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ message: "Inquiry not found" });
    }

    const reply = {
      message,
      admin: {
        _id: req.user?._id || null,   // depends on your auth middleware
        name: req.user?.name || "Super Admin",
        email: req.user?.email || ""
      }
    };

    inquiry.replies.push(reply);
    await inquiry.save();

    res.status(201).json({ message: "Reply added successfully", reply });
  } catch (error) {
    res.status(500).json({ message: "Error replying to inquiry", error: error.message });
  }
};

const deleteInquiry = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid inquiry ID" });
    }

    const inquiry = await Contact.findById(id);
    if (!inquiry) {
      return res.status(404).json({ message: "Inquiry not found" });
    }

    await Contact.deleteOne({ _id: id });

    res.status(200).json({ message: "Inquiry deleted successfully" });
  } catch (error) {
    console.error("Delete inquiry error:", error);
    res.status(500).json({ message: "Error deleting inquiry", error: error.message });
  }
};




module.exports = { getAllCustomers, countCustomers, getAllInquiries, getInquiryById, countInquiries, replyToInquiry , deleteInquiry};