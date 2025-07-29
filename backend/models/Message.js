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
      default: null // filled only for private 1-1
    },
    content: {
      type: String,
      trim: true
    },
    file: {
      type: String // Cloudinary file URL
    },
    fileType: {
      type: String, // ✅ now accepts any string (no enum)
      default: 'text'
    },
    isPublic: {
      type: Boolean,
      default: false // true if it's a public group message
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatRoom',
      default: null // used if message belongs to a custom room
    }
  },
  {
    timestamps: true // auto adds createdAt, updatedAt
  }
);

module.exports = mongoose.model('Message', messageSchema);