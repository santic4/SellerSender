import { Schema, model } from 'mongoose';

const productSchema = new Schema({
  id: { type: String, required: true, unique: true }, 
  title: { type: String },
  site_id: { type: String }, 
  templates: [
    {
      templateId: { type: Schema.Types.ObjectId, ref: "Template" },
      name: { type: String },
    },
  ],
  variations: {
    type: [
      {
        id: { type: String, required: true },
        name: { type: String },
        templates: [
          {
            templateId: { type: Schema.Types.ObjectId, ref: "Template" },
            name: { type: String },
          },
        ],
      },
    ],
    default: [],
  },  
  secondMessages: [
    {
      templateId: { type: Schema.Types.ObjectId, ref: "Template" },
      name: { type: String },
    },
  ],
  secondMessageDelay: { type: Number, default: 36 },
});

export const Product = model('Product', productSchema);