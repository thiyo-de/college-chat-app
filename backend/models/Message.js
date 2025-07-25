const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null // null if public room chat
    },
    content: {
      type: String,
      trim: true
    },
    file: {
      type: String // URL or filename for image/pdf
    },
    fileType: {
      type: String,
      enum: ['text', 'image', 'pdf', 'video', 'audio'],
      default: 'text'
    },
    isPublic: {
      type: Boolean,
      default: false
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatRoom',
      default: null // Only if it's a room-based message
    }
  },
  {
    timestamps: true // adds createdAt & updatedAt
  }
);

module.exports = mongoose.model('Message', messageSchema);
