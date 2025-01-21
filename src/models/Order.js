import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  itemId: { type: String },
  title: { type: String },
  quantity: { type: Number },
  unitPrice: { type: Number },
  totalAmount: { type: Number },
});

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  buyerId: { type: String, required: true },
  packId: { type: String, required: true },
  items: [OrderItemSchema],
  totalAmount: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model('Order', OrderSchema);

export default Order;