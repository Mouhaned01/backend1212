var express = require('express');
var router = express.Router();
const Contact = require('../models/Contact.model'); // Uses your existing Contact model

// POST: Save contact message from customer form
router.post('/', async (req, res, next) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and message' });
    }

    const newContact = new Contact({ name, email, message });
    await newContact.save();

    res.status(201).json({ success: true, message: 'Message sent successfully to the admin!' });
  } catch (error) {
    next(error);
  }
});

// GET: Fetch all messages for the Admin Dashboard (supports /api/messages or /api/contact depending on mount)
router.get('/', async (req, res, next) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
});

// DELETE: Allow admin to delete a specific message
router.delete('/:id', async (req, res, next) => {
  try {
    const deletedMessage = await Contact.findByIdAndDelete(req.params.id);
    if (!deletedMessage) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    res.status(200).json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;