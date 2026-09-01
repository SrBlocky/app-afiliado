import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  ShoppingBag,
  Heart,
  Share2,
  Sparkles,
  Check,
  Tag,
  DollarSign,
  Info,
  Layers,
  Send,
  Loader2,
  Palette,
  Lightbulb,
} from 'lucide-react';
import { OutfitSet, ClothingItem, AffiliateConfig } from '../types';
import { buildAffiliateUrl, trackAffiliateClick, formatMXN } from '../utils/affiliate';

interface OutfitDetailModalProps {
  outfit: OutfitSet | null;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  affiliateConfig: AffiliateConfig;
  onItemClickTracked: () => void;
}

export const OutfitDetailModal: React.FC<OutfitDetailModalProps> = ({
  outfit,
  onClose,
  isSaved,
  onToggleSave,
  affiliateConfig,
  onItemClickTracked,
}) => {
  const [copiedShare, setCopiedShare] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [buyingAll, setBuyingAll] = useState(false);

  if (!outfit) return null;

  const handleBuyItem = (item: ClothingItem) => {
    const finalUrl = buildAffiliateUrl(item.buyUrl, item.store, item.name, affiliateConfig);
    trackAffiliateClick(item, outfit.id, outfit.title, finalUrl);
    onItemClickTracked();
    window.open(finalUrl, '_blank', 'noopener,noreferrer');
  };

  const handleBuyAllLook = () => {
    setBuyingAll(true);
    // Track clicks for each item
    outfit.items.forEach((item, index) => {
      const finalUrl = buildAffiliateUrl(item.buyUrl, item.store, item.name, affiliateConfig);
      trackAffiliateClick(item, outfit.id, outfit.title, finalUrl);
      // Open in new tab with slight stagger
      setTimeout(() => {
        window.open(finalUrl, '_blank', 'noopener,noreferrer');
      }, index * 200);
    });
    onItemClickTracked();
    setTimeout(() => setBuyingAll(false), 2000);
  };

  const handleShare = () => {
    const shareText = `¡Mira este clon de moda "${outfit.title}" en Clones y hallazgos de moda!`;
    const shareUrl = `${window.location.origin}/?outfit=${outfit.id}&utm_source=${affiliateConfig.customUtmSource}&utm_medium=share`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  const handleAskStylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;

    setLoadingAdvice(true);
    try {
      const res = await fetch('/api/ai/styling-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: customQuestion,
          currentOutfitTitle: `${outfit.title} (${outfit.occasion}, ${outfit.aesthetic})`,
        }),
      });
      const data = await res.json();
      if (data.advice) {
        setAiAdvice(data.advice);
      }
    } catch (err) {
      console.error('Error getting style advice:', err);
    } finally {
      setLoadingAdvice(false);
    }
  };

  const totalCommission = outfit.items.reduce((sum, item) => {
    const rate = item.commissionRatePct || affiliateConfig.defaultCommissionRate || 8.0;
    return sum + (item.price * rate) / 100;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-stone-900 text-white p-5 sm:px-8 sm:py-6 flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500 text-stone-950">
              {outfit.occasion}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-800 text-stone-300 border border-stone-700">
              {outfit.aesthetic}
            </span>
            <span className="text-xs text-stone-400 hidden sm:inline">• {outfit.season} ({outfit.gender})</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleSave(outfit.id)}
              className={`p-2 rounded-xl transition-colors ${
                isSaved ? 'bg-rose-500 text-white' : 'bg-stone-800 text-stone-300 hover:text-white'
              }`}
              title={isSaved ? 'Guardado' : 'Guardar look'}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-stone-800 text-stone-300 hover:text-white transition-colors relative"
              title="Compartir enlace"
            >
              {copiedShare ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-8 space-y-8">
          {/* Main Info Hero */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Visual Look Cover */}
            <div className="md:col-span-5 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shadow-sm relative group aspect-[3/4]">
              <img
                src={outfit.coverImage || outfit.items[0]?.imageUrl}
                alt={outfit.title}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
                <p className="text-xs font-mono text-amber-300 uppercase tracking-widest font-semibold mb-1">
                  Lookbook Coordinated Set
                </p>
                <h2 className="font-['Playfair_Display',serif] text-xl font-bold leading-tight">
                  {outfit.title}
                </h2>
              </div>
            </div>

            {/* Look Details & Buy All Box */}
            <div className="md:col-span-7 space-y-5">
              <div>
                <h1 className="font-['Playfair_Display',serif] text-2xl sm:text-3xl font-bold text-stone-900 mb-2">
                  {outfit.title}
                </h1>
                <p className="text-sm text-stone-600 leading-relaxed">
                  {outfit.description}
                </p>
              </div>

              {/* Color Harmony Palette */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80">
                <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 uppercase tracking-wider mb-2.5">
                  <Palette className="w-3.5 h-3.5 text-amber-600" />
                  Armonía Cromática del Conjunto
                </div>
                <div className="flex flex-wrap gap-2">
                  {outfit.colorPalette.map((color, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-stone-200 shadow-2xs"
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-stone-300 shrink-0"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-xs font-medium text-stone-800">{color.name}</span>
                      <span className="text-[10px] font-mono text-stone-400">{color.hex}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Buy Full Outfit Summary Box */}
              <div className="bg-stone-900 text-white p-5 rounded-2xl border border-stone-800 shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-xs text-stone-400 block">Total del Conjunto ({outfit.items.length} prendas):</span>
                    <span className="font-['Playfair_Display',serif] text-2xl font-bold text-amber-400 font-mono">
                      {formatMXN(outfit.totalPrice)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-emerald-400 font-mono block bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                      +{formatMXN(totalCommission)} comisión de afiliado
                    </span>
                    <span className="text-[10px] text-stone-400 mt-0.5 block">
                      Tasa aprox: ~8.5%
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleBuyAllLook}
                  disabled={buyingAll}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-75"
                >
                  <ShoppingBag className="w-4 h-4 text-stone-950" />
                  {buyingAll ? 'Abriendo tiendas con tus enlaces...' : 'Comprar Look Completo (Abrir Tiendas)'}
                </button>
                <p className="text-[11px] text-stone-400 text-center mt-2">
                  Abre las páginas de compra de cada prenda con tus tags de afiliado insertados automáticamente.
                </p>
              </div>
            </div>
          </div>

          {/* Clothing Items Breakdown (Prenda por Prenda) */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-['Playfair_Display',serif] text-xl font-bold text-stone-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-600" />
                Prendas Incluidas en el Conjunto
              </h3>
              <span className="text-xs text-stone-500 font-medium">
                {outfit.items.length} artículos seleccionados
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {outfit.items.map((item) => {
                const itemCommission = (item.price * (item.commissionRatePct || 8.0)) / 100;
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-stone-200 p-4 hover:border-amber-400/80 hover:shadow-md transition-all flex gap-4 items-center"
                  >
                    {/* Item Thumbnail */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details & Direct Buy */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-700 px-2 py-0.5 rounded border border-stone-200">
                          {item.store}
                        </span>
                        <span className="text-xs text-stone-500 truncate">{item.brand}</span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-stone-900 truncate mb-1" title={item.name}>
                        {item.name}
                      </h4>

                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-sm font-bold font-mono text-stone-900">
                          {formatMXN(item.price)}
                        </span>
                        {item.originalPrice && (
                          <span className="text-xs font-mono text-stone-400 line-through">
                            {formatMXN(item.originalPrice)}
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-emerald-700 font-semibold ml-auto">
                          +{formatMXN(itemCommission)} com.
                        </span>
                      </div>

                      {/* Promo Code Chip */}
                      {(item.promoCode || affiliateConfig.sheinPromoCode) && (
                        <div className="mb-2 flex items-center justify-between px-2 py-1 bg-rose-50 border border-rose-200/80 rounded-md text-[11px] text-rose-800">
                          <span className="flex items-center gap-1 font-semibold">
                            <Tag className="w-3 h-3 text-rose-600" /> Cupón: <code className="font-mono bg-white px-1 py-0.5 rounded border border-rose-300">{item.promoCode || affiliateConfig.sheinPromoCode}</code>
                          </span>
                          <span className="text-[10px] text-rose-600 font-bold">15% OFF</span>
                        </div>
                      )}

                      <button
                        onClick={() => handleBuyItem(item)}
                        className="w-full py-2 px-3 rounded-xl bg-stone-900 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        Comprar en {item.store} <ExternalLink className="w-3 h-3 text-rose-300" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Styling Tips */}
          <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200">
            <h3 className="font-['Playfair_Display',serif] text-lg font-bold text-stone-900 flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              Consejos de Estilismo & Protocolo
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-stone-700">
              {outfit.stylingTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-2 shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Ask AI Stylist about this Look */}
          <div className="bg-gradient-to-br from-amber-50 to-stone-100 rounded-2xl p-5 border border-amber-200/80">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <h4 className="font-bold text-stone-900 text-sm">
                ¿Dudas sobre cómo lucir este look? Pregunta al Estilista IA
              </h4>
            </div>
            <p className="text-xs text-stone-600 mb-3">
              Pregunta por peinados, joyas alternativas, adaptación para lluvia o combinaciones con prendas que ya tienes.
            </p>

            <form onSubmit={handleAskStylist} className="flex gap-2 mb-3">
              <input
                type="text"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="Ej: ¿Qué abrigo le pongo si hace frío? ¿Qué peinado combina mejor?..."
                className="flex-1 px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
              <button
                type="submit"
                disabled={loadingAdvice || !customQuestion.trim()}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                {loadingAdvice ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Consultar
              </button>
            </form>

            {aiAdvice && (
              <div className="bg-white p-3.5 rounded-xl border border-amber-300 text-xs text-stone-800 leading-relaxed animate-in fade-in">
                <strong className="text-amber-800 block mb-1">Respuesta del Estilista:</strong>
                {aiAdvice}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
