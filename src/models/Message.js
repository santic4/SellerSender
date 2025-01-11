import { Schema, model } from 'mongoose'

const messageSchema = new Schema({
  userId: { type: String, required: true },
  publicationId: { type: String, required: true },
  content: { type: String, required: true },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

export const Message = model('Message', messageSchema);