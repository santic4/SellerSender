import { Schema, model } from 'mongoose'

const productSchema = new Schema({
  title: String,
  site_id: String,
  templates: [{ type: Schema.Types.ObjectId, ref: "Template" }],
});

export const Product = model('Product', productSchema);