const express = require('express');
const ContactMessage = require('../models/ContactMessage');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, topic, message } = req.body;

    if (!name || !email || !topic || !message) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const doc = await ContactMessage.create({ name, email, topic, message });
    return res.status(201).json({ id: doc._id, status: 'received' });
  } catch (error) {
    return res.status(500).json({ error: 'Unable to save contact message.' });
  }
});

module.exports = router;
