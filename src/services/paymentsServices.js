import Order from "../models/Order.js";

export const saveOrderServices = async (result) => {
    try{
        const order = new Order({
            orderId: result.orderId,
            buyerId: result.buyerId,
            packId: result.packId,
            items: result.items,
            status: 'pending',  
            paymentStatus: 'pending',  
            totalAmount: result.items.reduce((total, item) => total + item.totalAmount, 0), 
        });
        
        await order.save();
      
        return order;
    } catch (error) {
      console.error('Error al guardar la orden:', error.message);
      throw error;
    }
}
