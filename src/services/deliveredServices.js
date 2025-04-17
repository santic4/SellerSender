export async function deliveredService(resource, accessToken) {

    const orderId = resource.split('/').pop();

    if(!orderId){
      throw new Error('No existe el orderId.')
    }

    const url = `https://api.mercadolibre.com/orders/${orderId}/feedback`;
  
    const body = {
      fulfilled: true,
      rating: "positive"
    };
  
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(body)
      });
  
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error (${res.status}): ${errorText}`);
      }
  
      const data = await res.json();
      console.log("✅ Producto marcado como entregado:", data);
      return data;
    } catch (error) {
      console.error("❌ Error al marcar como entregado:", error.message);
      throw error;
    }
  }