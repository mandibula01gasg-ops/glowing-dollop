import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import QRCode from "qrcode";

// Initialize Mercado Pago
let mercadopago: MercadoPagoConfig | null = null;
let paymentClient: Payment | null = null;

if (process.env.MERCADO_PAGO_ACCESS_TOKEN) {
  mercadopago = new MercadoPagoConfig({
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
  });
  paymentClient = new Payment(mercadopago);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // GET /api/products - List all products
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error: any) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Error fetching products" });
    }
  });

  // POST /api/orders - Create new order
  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = req.body;

      // Create order
      const order = await storage.createOrder({
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        customerEmail: orderData.customerEmail,
        deliveryAddress: orderData.deliveryAddress,
        deliveryCep: orderData.deliveryCep,
        deliveryCity: orderData.deliveryCity,
        deliveryState: orderData.deliveryState,
        deliveryComplement: orderData.deliveryComplement,
        items: orderData.items,
        totalAmount: orderData.totalAmount,
        paymentMethod: orderData.paymentMethod,
        status: "pending",
      });

      // Handle payment based on method
      if (orderData.paymentMethod === "pix") {
        // Create PIX payment with Mercado Pago
        if (paymentClient) {
          try {
            const paymentData = {
              transaction_amount: parseFloat(orderData.totalAmount),
              description: `Pedido #${order.id}`,
              payment_method_id: "pix",
              payer: {
                email: orderData.customerEmail || "customer@example.com",
                first_name: orderData.customerName.split(" ")[0] || "Cliente",
                last_name: orderData.customerName.split(" ").slice(1).join(" ") || "",
              },
            };

            const payment = await paymentClient.create({ body: paymentData });

            // Generate QR Code
            let qrCodeBase64 = "";
            if (payment.point_of_interaction?.transaction_data?.qr_code) {
              qrCodeBase64 = await QRCode.toDataURL(
                payment.point_of_interaction.transaction_data.qr_code
              );
              // Remove the data:image/png;base64, prefix
              qrCodeBase64 = qrCodeBase64.replace(/^data:image\/png;base64,/, "");
            }

            // Create transaction record
            await storage.createTransaction({
              orderId: order.id,
              paymentMethod: "pix",
              amount: orderData.totalAmount,
              status: "pending",
              mercadoPagoId: payment.id?.toString(),
              pixQrCode: payment.point_of_interaction?.transaction_data?.qr_code,
              pixQrCodeBase64: qrCodeBase64,
              pixCopyPaste: payment.point_of_interaction?.transaction_data?.qr_code, // This is the text code, not base64
              metadata: payment,
            });

            res.json({
              orderId: order.id,
              paymentMethod: "pix",
              pixQrCode: payment.point_of_interaction?.transaction_data?.qr_code,
              pixQrCodeBase64: qrCodeBase64,
              pixCopyPaste: payment.point_of_interaction?.transaction_data?.qr_code, // Text code for copy/paste
            });
          } catch (mpError: any) {
            console.error("Mercado Pago Error:", mpError);
            
            // Fallback: Create transaction without Mercado Pago
            const mockPixCode = `00020126580014br.gov.bcb.pix0136${order.id}520400005303986540${parseFloat(orderData.totalAmount).toFixed(2)}5802BR5913Acai Prime6009SAO PAULO62070503***6304`;
            
            let qrCodeBase64 = "";
            try {
              const qrCodeDataUrl = await QRCode.toDataURL(mockPixCode);
              qrCodeBase64 = qrCodeDataUrl.replace(/^data:image\/png;base64,/, "");
            } catch (qrError) {
              console.error("QR Code generation error:", qrError);
            }

            await storage.createTransaction({
              orderId: order.id,
              paymentMethod: "pix",
              amount: orderData.totalAmount,
              status: "pending",
              pixQrCode: mockPixCode,
              pixQrCodeBase64: qrCodeBase64,
              pixCopyPaste: mockPixCode,
              metadata: { error: "Mercado Pago not configured, using mock data" },
            });

            res.json({
              orderId: order.id,
              paymentMethod: "pix",
              pixQrCode: mockPixCode,
              pixQrCodeBase64: qrCodeBase64,
              pixCopyPaste: mockPixCode,
            });
          }
        } else {
          // No Mercado Pago configured - create mock PIX payment
          const mockPixCode = `00020126580014br.gov.bcb.pix0136${order.id}520400005303986540${parseFloat(orderData.totalAmount).toFixed(2)}5802BR5913Acai Prime6009SAO PAULO62070503***6304`;
          
          let qrCodeBase64 = "";
          try {
            const qrCodeDataUrl = await QRCode.toDataURL(mockPixCode);
            qrCodeBase64 = qrCodeDataUrl.replace(/^data:image\/png;base64,/, "");
          } catch (qrError) {
            console.error("QR Code generation error:", qrError);
          }

          await storage.createTransaction({
            orderId: order.id,
            paymentMethod: "pix",
            amount: orderData.totalAmount,
            status: "pending",
            pixQrCode: mockPixCode,
            pixQrCodeBase64: qrCodeBase64,
            pixCopyPaste: mockPixCode,
            metadata: { note: "Mercado Pago not configured" },
          });

          res.json({
            orderId: order.id,
            paymentMethod: "pix",
            pixQrCode: mockPixCode,
            pixQrCodeBase64: qrCodeBase64,
            pixCopyPaste: mockPixCode,
          });
        }
      } else if (orderData.paymentMethod === "credit_card") {
        // IMPORTANT: For PCI-DSS compliance, card data should NEVER be stored on the server
        // In production, use Mercado Pago's frontend SDK for tokenization
        // This implementation stores only non-sensitive metadata
        
        await storage.createTransaction({
          orderId: order.id,
          paymentMethod: "credit_card",
          amount: orderData.totalAmount,
          status: "pending",
          // DO NOT store cardData - security risk
          metadata: { 
            note: "Credit card payment - requires Mercado Pago frontend tokenization for production",
            timestamp: new Date().toISOString(),
            // Store only last 4 digits if needed for reference
            cardLast4: orderData.cardData?.cardNumber?.slice(-4) || "****",
          },
        });

        res.json({
          orderId: order.id,
          paymentMethod: "credit_card",
          status: "pending",
          message: "Dados recebidos. Em produção, use tokenização do Mercado Pago no frontend.",
        });
      } else {
        res.status(400).json({ message: "Invalid payment method" });
      }
    } catch (error: any) {
      console.error("Error creating order:", error);
      res.status(500).json({ 
        message: "Error creating order",
        error: error.message 
      });
    }
  });

  // GET /api/orders/:id - Get order by ID
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const transaction = await storage.getTransactionByOrderId(order.id);

      res.json({
        ...order,
        orderNumber: order.id.substring(0, 8).toUpperCase(),
        pixQrCodeBase64: transaction?.pixQrCodeBase64,
        pixCopyPaste: transaction?.pixCopyPaste,
      });
    } catch (error: any) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Error fetching order" });
    }
  });

  // Seed initial products if database is empty
  app.post("/api/seed-products", async (req, res) => {
    try {
      const existingProducts = await storage.getAllProducts();
      if (existingProducts.length > 0) {
        return res.json({ message: "Products already exist" });
      }

      const productsToSeed = [
        {
          name: "Açaí 300ml",
          description: "Açaí cremoso com granola e banana",
          price: "12.90",
          size: "300ml",
          image: "/assets/generated_images/Small_açaí_bowl_product_e5ef7191.png",
        },
        {
          name: "Açaí 500ml",
          description: "Açaí tradicional com frutas e complementos",
          price: "18.90",
          size: "500ml",
          image: "/assets/generated_images/Large_açaí_bowl_product_185591f7.png",
        },
        {
          name: "Combo Quero+ Açaí",
          description: "2 açaís de 300ml - Economize!",
          price: "22.90",
          size: "2x 300ml",
          image: "/assets/generated_images/Açaí_combo_product_image_5986e6cc.png",
        },
      ];

      for (const product of productsToSeed) {
        await storage.createProduct(product);
      }

      res.json({ message: "Products seeded successfully" });
    } catch (error: any) {
      console.error("Error seeding products:", error);
      res.status(500).json({ message: "Error seeding products" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
