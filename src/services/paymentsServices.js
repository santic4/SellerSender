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

export const markOrderAsDelivered = async (orderId, accessToken) => {
  try {
    const url = `https://api.mercadolibre.com/orders/${orderId}/shipments`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        status: 'delivered',
        date_shipped: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error: ${response.status} - ${errorData.message}`);
    }

    const data = await response.json();
    console.log('Orden marcada como entregada:', data);
  } catch (error) {
    console.error('Error al marcar la orden como entregada:', error.message);
  }
};

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

