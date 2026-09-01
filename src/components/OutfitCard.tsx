import React from 'react';
import { Heart, Sparkles, ShoppingBag, ArrowRight, ExternalLink, Share2, Tag } from 'lucide-react';
import { OutfitSet, AffiliateConfig } from '../types';
import { buildAffiliateUrl, formatMXN } from '../utils/affiliate';

interface OutfitCardProps {
  outfit: OutfitSet;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onSelectOutfit: (outfit: OutfitSet) => void;
  onQuickBuy: (outfit: OutfitSet) => void;
  affiliateConfig: AffiliateConfig;
}

export const OutfitCard: React.FC<OutfitCardProps> = ({
  outfit,
  isSaved,
  onToggleSave,
  onSelectOutfit,
  onQuickBuy,
  affiliateConfig,
}) => {
  // Calculate total estimated commission for the entire outfit
  const totalCommission = outfit.items.reduce((sum, item) => {
    const rate = item.commissionRatePct || affiliateConfig.defaultCommissionRate || 8.0;
    return sum + (item.price * rate) / 100;
  }, 0);

  return (
    <div className="group bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-sm hover:shadow-xl hover:border-rose-400/60 transition-all duration-300 flex flex-col">
      {/* Cover Image Container */}
      <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden cursor-pointer" onClick={() => onSelectOutfit(outfit)}>
        <img
          src={outfit.coverImage || outfit.items[0]?.imageUrl}
          alt={outfit.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Badges Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-900/80 backdrop-blur-md text-white border border-stone-700/50 shadow-sm pointer-events-auto">
              {outfit.aesthetic}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/90 text-white shadow-sm pointer-events-auto">
              {outfit.occasion}
            </span>
            {outfit.isAIGenerated && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-600/90 text-white flex items-center gap-1 shadow-sm pointer-events-auto">
                <Sparkles className="w-3 h-3" /> IA Match
              </span>
            )}
          </div>

          {/* Heart Save Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(outfit.id);
            }}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform active:scale-90 pointer-events-auto shadow-md ${
              isSaved
                ? 'bg-rose-500 text-white'
                : 'bg-white/90 backdrop-blur-md text-stone-700 hover:text-rose-600 hover:bg-white'
            }`}
            title={isSaved ? 'Guardado en favoritos' : 'Guardar look'}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Bottom Price & Items Count Pill */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="bg-stone-900/85 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md">
            <span className="text-stone-300">{outfit.items.length} prendas</span>
            <span className="text-stone-400">•</span>
            <span className="text-amber-300 font-mono font-bold">{formatMXN(outfit.totalPrice)}</span>
          </div>

          <div className="bg-emerald-900/85 backdrop-blur-md text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-xl text-[11px] font-mono font-semibold shadow-md" title="Comisión estimada de afiliado si compran el conjunto">
            +{formatMXN(totalCommission)}
          </div>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Color Palette Dots */}
          <div className="flex items-center gap-1.5 mb-2.5">
            <span className="text-[11px] text-stone-400 uppercase font-bold tracking-wider mr-1">Paleta:</span>
            {outfit.colorPalette.slice(0, 4).map((c, i) => (
              <div
                key={i}
                className="w-4 h-4 rounded-full border border-stone-300/80 shadow-xs"
                style={{ backgroundColor: c.hex }}
                title={`${c.name} (${c.hex})`}
              />
            ))}
          </div>

          {/* Title */}
          <h3
            onClick={() => onSelectOutfit(outfit)}
            className="font-['Playfair_Display',serif] font-bold text-lg text-stone-900 hover:text-amber-700 transition-colors cursor-pointer line-clamp-1 mb-1.5"
          >
            {outfit.title}
          </h3>

          {/* Short Description */}
          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-4">
            {outfit.description}
          </p>

          {/* Item Thumbnails Grid */}
          <div className="bg-stone-50/80 rounded-xl p-2.5 border border-stone-200/70 mb-4">
            <div className="flex items-center justify-between text-[11px] text-stone-500 font-semibold mb-2 px-1">
              <span>Prendas del clon</span>
              <span className="text-rose-700 font-medium">SHEIN México</span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5">
              {outfit.items.map((item) => (
                <div
                  key={item.id}
                  className="relative aspect-square rounded-lg overflow-hidden border border-stone-200 bg-white group/item"
                  title={`${item.name} (${item.store}) - ${formatMXN(item.price)}`}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover/item:scale-110 transition-transform"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center text-[10px] text-white font-bold p-1 text-center leading-tight">
                    {formatMXN(item.price)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-stone-100 flex items-center gap-2">
          <button
            onClick={() => onSelectOutfit(outfit)}
            className="flex-1 py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            Ver Detalle <ArrowRight className="w-3.5 h-3.5 text-stone-500" />
          </button>

          <button
            onClick={() => onQuickBuy(outfit)}
            className="flex-1 py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-rose-600 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-rose-300" />
            Comprar en SHEIN
          </button>
        </div>
      </div>
    </div>
  );
};
