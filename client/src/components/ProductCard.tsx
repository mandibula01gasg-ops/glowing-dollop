import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Flame } from "lucide-react";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  hasPromo?: boolean;
  promoText?: string;
}

export function ProductCard({ product, onAddToCart, hasPromo = false, promoText = "60 HOJE TERÇOS" }: ProductCardProps) {
  const originalPrice = parseFloat(product.price);
  const discountedPrice = hasPromo ? originalPrice * 0.75 : originalPrice;
  const rating = 4.8;
  
  return (
    <Card className="group overflow-hidden rounded-3xl border-2 border-purple-200 hover:border-purple-400 transition-all hover:shadow-2xl hover:-translate-y-1 bg-gradient-to-br from-white to-purple-50/30 shadow-lg" data-testid={`card-product-${product.id}`}>
      <CardContent className="p-0">
        {/* Badge de promoção */}
        {hasPromo && (
          <div className="absolute top-3 left-3 z-10">
            <Badge className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-1.5 text-xs font-black rounded-full animate-wiggle shadow-2xl flex items-center gap-1.5 border-2 border-white">
              <Flame className="h-4 w-4 animate-pulse" />
              {promoText}
            </Badge>
          </div>
        )}
        
        <div className="aspect-square overflow-hidden bg-gradient-to-br from-purple-100 to-white relative rounded-t-3xl">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        
        <div className="p-5 space-y-3">
          <h3 className="text-lg font-black text-gray-900 leading-tight" data-testid={`text-product-name-${product.id}`}>
            {product.name}
          </h3>
          
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
          
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} />
            ))}
            <span className="text-sm text-gray-700 ml-2 font-bold">{rating}</span>
          </div>
          
          <div className="pt-2 space-y-3">
            {hasPromo && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400 line-through">
                  R$ {originalPrice.toFixed(2).replace('.', ',')}
                </span>
                <Badge className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  -25%
                </Badge>
              </div>
            )}
            
            <div className="flex items-baseline gap-1">
              <span className="text-sm text-gray-600">por apenas</span>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-3 border-2 border-green-200">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600" data-testid={`text-price-${product.id}`}>
                  R$ {discountedPrice.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
            
            {hasPromo && (
              <div className="flex items-center justify-center gap-2 text-sm bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl py-2 px-3 border border-orange-200">
                <Flame className="h-4 w-4 text-orange-500 animate-pulse" />
                <span className="text-orange-700 font-black">
                  Oferta Especial!
                </span>
              </div>
            )}
            
            <Button
              size="lg"
              onClick={() => onAddToCart(product)}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-black rounded-2xl py-6 mt-3 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              data-testid={`button-add-${product.id}`}
            >
              🛒 Adicionar ao Carrinho
            </Button>
          </div>
        </div>
      </CardContent>
      
      <style>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg) scale(1); }
          50% { transform: rotate(3deg) scale(1.05); }
        }
        .animate-wiggle {
          animation: wiggle 0.6s ease-in-out infinite;
        }
      `}</style>
    </Card>
  );
}
