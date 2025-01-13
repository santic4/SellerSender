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
  ], // Almacenar IDs y nombres de las plantillas asociadas
});

export const Product = model('Product', productSchema);