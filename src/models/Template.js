import { Schema, model } from 'mongoose'

const templateSchema = new Schema({
  name: { type: String, required: true },
  content: { type: String, required: true, maxLength: 350 },
  assignedPublications: [{ type: String }],
  attachments: [{ type: String , default: []}]
},{
  strict: 'throw',
  versionKey: false,
})

export const Template = model('Template', templateSchema);