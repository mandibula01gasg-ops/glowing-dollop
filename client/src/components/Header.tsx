import { ShoppingCart, Instagram, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  cartItemsCount: number;
  onCartClick: () => void;
}

export function Header({ cartItemsCount, onCartClick }: HeaderProps) {
  return (
    <>
      {/* Header decorativo com padrão repetido de açaí */}
      <div className="w-full h-20 bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 overflow-hidden relative shadow-lg">
        <div className="absolute inset-0 flex items-center gap-8 animate-scroll">
          {[...Array(20)].map((_, i) => (
            <span key={i} className="text-5xl shrink-0 drop-shadow-lg">🍇</span>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
      </div>

      {/* Header principal */}
      <header className="sticky top-0 z-50 w-full bg-gradient-to-br from-white to-purple-50 shadow-xl backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-3 w-14 h-14 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                <span className="text-3xl">🍇</span>
              </div>
              <div>
                <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-purple-900">Açaí Prime</h1>
                <div className="flex items-center gap-2 text-xs text-purple-600">
                  <Instagram className="h-3.5 w-3.5" />
                  <Info className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onCartClick}
              className="relative bg-gradient-to-br from-purple-100 to-purple-200 hover:from-purple-200 hover:to-purple-300 rounded-2xl shadow-lg transform hover:scale-105 transition-all"
              data-testid="button-cart"
            >
              <ShoppingCart className="h-5 w-5 text-purple-700" />
              {cartItemsCount > 0 && (
                <Badge
                  variant="default"
                  className="absolute -right-2 -top-2 h-6 min-w-6 rounded-full px-1.5 text-xs bg-gradient-to-br from-red-500 to-red-600 border-2 border-white shadow-lg animate-bounce-gentle"
                  data-testid="badge-cart-count"
                >
                  {cartItemsCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes bounce-gentle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
        .animate-bounce-gentle {
          animation: bounce-gentle 1s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
