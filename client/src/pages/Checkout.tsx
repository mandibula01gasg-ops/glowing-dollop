import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CreditCard, QrCode, CheckCircle2 } from "lucide-react";

const checkoutSchema = z.object({
  customerName: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  customerPhone: z.string().min(10, "Telefone inválido"),
  customerEmail: z.string().email("Email inválido").optional().or(z.literal("")),
  deliveryCep: z.string().min(8, "CEP inválido"),
  deliveryAddress: z.string().min(5, "Endereço inválido"),
  deliveryCity: z.string().min(2, "Cidade inválida"),
  deliveryState: z.string().length(2, "UF deve ter 2 caracteres"),
  deliveryComplement: z.string().optional(),
  cardNumber: z.string().optional(),
  cardName: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvv: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "credit_card" | null>(null);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      deliveryCep: "",
      deliveryAddress: "",
      deliveryCity: "",
      deliveryState: "",
      deliveryComplement: "",
      cardNumber: "",
      cardName: "",
      cardExpiry: "",
      cardCvv: "",
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: CheckoutFormData) => {
      if (!paymentMethod) {
        throw new Error("Selecione uma forma de pagamento");
      }

      const cartItems = JSON.parse(localStorage.getItem("cart") || "[]");
      const totalAmount = cartItems.reduce(
        (sum: number, item: any) => sum + parseFloat(item.price) * item.quantity,
        0
      );

      const orderData = {
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail || undefined,
        deliveryAddress: data.deliveryAddress,
        deliveryCep: data.deliveryCep,
        deliveryCity: data.deliveryCity,
        deliveryState: data.deliveryState,
        deliveryComplement: data.deliveryComplement || undefined,
        items: cartItems,
        totalAmount: totalAmount.toString(),
        paymentMethod,
        status: "pending",
      };

      if (paymentMethod === "credit_card") {
        // In production, use Mercado Pago SDK to tokenize card data
        // For now, send minimal data for demonstration
        (orderData as any).cardData = {
          cardNumber: data.cardNumber, // In production, send only token
          cardName: data.cardName,
          cardExpiry: data.cardExpiry,
          cardCvv: data.cardCvv,
        };
      }

      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.removeItem("cart");
      setLocation(`/confirmation/${data.orderId}`);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao processar pedido",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CheckoutFormData) => {
    createOrderMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header cartItemsCount={0} onCartClick={() => {}} />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-8">Finalizar Pedido</h1>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Dados de Entrega */}
                <Card>
                  <CardHeader>
                    <CardTitle>Dados de Entrega</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Seu nome" {...field} data-testid="input-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="customerPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone</FormLabel>
                            <FormControl>
                              <Input placeholder="(11) 99999-9999" {...field} data-testid="input-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="customerEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email (Opcional)</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="seu@email.com" {...field} data-testid="input-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="deliveryCep"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP</FormLabel>
                          <FormControl>
                            <Input placeholder="00000-000" {...field} data-testid="input-cep" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="deliveryAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Endereço</FormLabel>
                          <FormControl>
                            <Input placeholder="Rua, número" {...field} data-testid="input-address" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="deliveryCity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cidade</FormLabel>
                            <FormControl>
                              <Input placeholder="São Paulo" {...field} data-testid="input-city" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="deliveryState"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>UF</FormLabel>
                            <FormControl>
                              <Input placeholder="SP" maxLength={2} {...field} data-testid="input-state" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="deliveryComplement"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Complemento (Opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Apto, bloco, etc" {...field} data-testid="input-complement" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Forma de Pagamento */}
                <Card>
                  <CardHeader>
                    <CardTitle>Forma de Pagamento</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card
                        className={`cursor-pointer hover-elevate transition-all ${
                          paymentMethod === "pix"
                            ? "border-primary border-2"
                            : "border"
                        }`}
                        onClick={() => setPaymentMethod("pix")}
                        data-testid="card-payment-pix"
                      >
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center text-center gap-3">
                            <QrCode className="h-12 w-12 text-primary" />
                            <div>
                              <h3 className="font-semibold text-lg">PIX</h3>
                              <p className="text-sm text-muted-foreground">
                                Pagamento instantâneo
                              </p>
                            </div>
                            {paymentMethod === "pix" && (
                              <CheckCircle2 className="h-6 w-6 text-primary" />
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      <Card
                        className={`cursor-pointer hover-elevate transition-all ${
                          paymentMethod === "credit_card"
                            ? "border-primary border-2"
                            : "border"
                        }`}
                        onClick={() => setPaymentMethod("credit_card")}
                        data-testid="card-payment-credit"
                      >
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center text-center gap-3">
                            <CreditCard className="h-12 w-12 text-primary" />
                            <div>
                              <h3 className="font-semibold text-lg">Cartão de Crédito</h3>
                              <p className="text-sm text-muted-foreground">
                                Preencha os dados
                              </p>
                            </div>
                            {paymentMethod === "credit_card" && (
                              <CheckCircle2 className="h-6 w-6 text-primary" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {paymentMethod === "credit_card" && (
                      <div className="space-y-4 pt-4">
                        <Separator />
                        <h3 className="font-semibold">Dados do Cartão</h3>
                        
                        <FormField
                          control={form.control}
                          name="cardNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Número do Cartão</FormLabel>
                              <FormControl>
                                <Input placeholder="0000 0000 0000 0000" {...field} data-testid="input-card-number" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="cardName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome no Cartão</FormLabel>
                              <FormControl>
                                <Input placeholder="Como está no cartão" {...field} data-testid="input-card-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="cardExpiry"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Validade</FormLabel>
                                <FormControl>
                                  <Input placeholder="MM/AA" {...field} data-testid="input-card-expiry" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="cardCvv"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>CVV</FormLabel>
                                <FormControl>
                                  <Input placeholder="123" maxLength={4} {...field} data-testid="input-card-cvv" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full rounded-full text-lg font-semibold"
                  disabled={!paymentMethod || createOrderMutation.isPending}
                  data-testid="button-confirm-order"
                >
                  {createOrderMutation.isPending ? "Processando..." : "Confirmar Pedido"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
