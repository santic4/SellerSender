import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  itemId: { type: String, required: true },
  title: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
});

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  buyerId: { type: String, required: true },
  packId: { type: String, required: true },
  items: [OrderItemSchema],
  status: { type: String, required: true },
  paymentStatus: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model('Order', OrderSchema);

export default Order;