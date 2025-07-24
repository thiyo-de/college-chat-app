const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // null if public message
    default: null
  },
  content: {
    type: String
  },
  file: {
    type: String // File URL (uploads/pdf or uploads/image)
  },
  fileType: {
    type: String, // 'image', 'pdf', 'text' — for frontend rendering
    default: 'text'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Message', messageSchema);
