interface PromoBannerProps {
  text: string;
}

export function PromoBanner({ text }: PromoBannerProps) {
  return (
    <div className="w-full bg-gradient-to-r from-red-600 via-orange-500 to-red-600 py-3 px-4 text-center animate-gradient shadow-2xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      <p className="text-white font-black text-base md:text-lg tracking-wide drop-shadow-lg relative z-10 flex items-center justify-center gap-2">
        <span className="text-xl animate-bounce">🔥</span>
        {text}
        <span className="text-xl animate-bounce" style={{ animationDelay: '0.5s' }}>🔥</span>
      </p>
      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease-in-out infinite;
        }
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
