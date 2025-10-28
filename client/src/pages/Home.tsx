import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { PromoBanner } from "@/components/PromoBanner";
import { PromoTimer } from "@/components/PromoTimer";
import { ProductCard } from "@/components/ProductCard";
import { Cart, type CartItem } from "@/components/Cart";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import type { Product } from "@shared/schema";

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.image,
          size: product.size,
        },
      ];
    });

    toast({
      title: "✅ Adicionado!",
      description: `${product.name} está no carrinho.`,
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
    toast({
      title: "Item removido",
      description: "O item foi removido do carrinho.",
    });
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    setLocation("/checkout");
  };

  const cartItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header cartItemsCount={cartItemsCount} onCartClick={() => setCartOpen(true)} />
      
      <PromoBanner text="🔥 Promoção de primeiro pedido ativa!" />
      
      <main className="flex-1">
        <section id="products" className="py-4">
          <div className="container mx-auto px-3">
            <div className="max-w-4xl mx-auto">
              {/* Seção de Combos com Promoção */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3 px-1">
                  Combos Burgão
                </h2>
                
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {products?.slice(0, 2).map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                        hasPromo={true}
                        promoText="60 HOJE TERÇOS"
                      />
                    ))}
                  </div>
                )}
                
                {/* Timer de Promoção */}
                <div className="mt-4">
                  <PromoTimer />
                </div>
              </div>

              {/* Seção de Produtos Individuais */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3 px-1">
                  Lanches Individuais
                </h2>
                
                {isLoading ? (
                  <div className="grid grid-cols-1 gap-4">
                    {[1].map((i) => (
                      <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {products?.slice(2).map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                        hasPromo={false}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Seção de Avaliações */}
              <div className="bg-gradient-to-br from-purple-50 to-white rounded-3xl p-6 border-2 border-purple-200 mb-6 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-center flex-1">
                    <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-800 mb-2">4,8</div>
                    <div className="flex items-center justify-center gap-1 my-2">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-2xl drop-shadow-lg">⭐</span>
                      ))}
                    </div>
                    <div className="text-sm font-bold text-gray-700">130 avaliações • últimos 90 dias</div>
                    <div className="text-sm text-gray-600 mt-1">1.007 avaliações no total</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <Cart
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
      />
    </div>
  );
}
