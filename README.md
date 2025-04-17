# SellerSender

## Descripción

**SellerSender** es una herramienta para vendedores de **MercadoLibre** que automatiza el envío de mensajes a compradores. Con esta aplicación, podés configurar plantillas personalizadas para enviar mensajes automáticamente después de que se realice una compra. El objetivo es ahorrar tiempo y facilitar la gestión de las ventas.

## Características

- **Creación de plantillas de mensajes**: Podés crear plantillas personalizadas que se enviarán automáticamente a los compradores después de cada compra.
- **Envío de varios mensajes**: Permite enviar múltiples mensajes automáticos, aprovechando los 350 caracteres por mensaje que permite MercadoLibre.
- **Asignación de plantillas a publicaciones**: Elegí qué mensaje enviar para cada producto, y reutilizá las plantillas en varias publicaciones (no se limita a una plantilla por producto).
- **Marcar productos como "Entregado"**: Después de enviar los mensajes automáticos, el producto se marcará automáticamente como "Entregado".

## Instalación

1. Cloná el repositorio:

   git clone https://github.com/tu-usuario/SellerSender.git

2. Instalá las dependencias:

   cd SellerSender
   npm install

3. Configurá las variables de entorno (archivo .env):

   API_KEY: Tu clave de API para MercadoLibre.
   URL_API: URL base de la API de MercadoLibre.

## Uso

   Crear una plantilla: Ingresá a la sección de plantillas y creá un nuevo mensaje.

   Asignar plantilla a publicación: Al crear o editar una publicación, seleccioná la plantilla de mensaje que querés usar.

   Enviar mensajes automáticamente: Cuando se realice una compra, los mensajes se enviarán de manera automática.

   Marcar como "Entregado": Una vez que se hayan enviado los mensajes, el producto se marcará automáticamente como entregado.

   Este sistema es de pago. Para poder usarlo contactarse a "santisv4@gmail.com"

## Contribuciones

   Si querés aportar al proyecto, hacé un fork del repositorio y abrí un pull request. Cualquier mejora o corrección es bienvenida.
