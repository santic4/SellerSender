import { Schema, model } from 'mongoose';

const productSchema = new Schema({
  id: { type: String, required: true, unique: true }, // ID del producto de Mercado Libre
  title: { type: String }, // Opcional: Nombre del producto si lo necesitas
  site_id: { type: String }, // Opcional: ID del sitio si aplica
  templates: [
    {
      templateId: { type: Schema.Types.ObjectId, ref: "Template" },
      name: { type: String },
    },
  ], // Almacenar IDs y nombres de las plantillas asociadas
});

export const Product = model('Product', productSchema);