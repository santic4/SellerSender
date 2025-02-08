import Order from "../models/Order.js";

export const saveOrderServices = async (result) => {
    try{
        const order = new Order({
            orderId: result.orderId,
            buyerId: result.buyerId,
            packId: result.packId,
            items: result.items,
        });
        
        await order.save();
      
        return order;
    } catch (error) {
      console.error('Error al guardar la orden:', error.message);
      throw error;
    }
}

export const checkExistingOrder = async (result) => {
    try {
        
        const orderId = result.orderId;

        if (!orderId) {
            throw new Error('No se encontró un ID de orden válido.');
        }

        const existingOrder = await Order.findOne({ orderId });

        if (existingOrder) {
            console.log(`Orden ${orderId} ya existe en la base de datos.`);
            return true; 
        }

        return false; 
    } catch (error) {
        console.error('Error al verificar la orden:', error.message);
        throw error; 
    }
};

