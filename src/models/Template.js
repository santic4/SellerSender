import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  content: { type: String, required: true, maxLength: 350 },
  assignedPublications: [{ type: String }],
});

export default mongoose.model('Template', templateSchema);