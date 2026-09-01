import React from 'react';
import { Sparkles, ShoppingBag, Heart, Sliders, Shirt, DollarSign, ExternalLink, Flame } from 'lucide-react';
import { formatMXN } from '../utils/affiliate';

interface NavbarProps {
  activeTab: 'catalog' | 'ai-stylist' | 'match-piece' | 'saved' | 'affiliate-hub';
  setActiveTab: (tab: 'catalog' | 'ai-stylist' | 'match-piece' | 'saved' | 'affiliate-hub') => void;
  savedCount: number;
  totalClicks: number;
  totalEstimatedCommission: number;
  onOpenAIStylist: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
  totalClicks,
  totalEstimatedCommission,
  onOpenAIStylist,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#F9F6F0] text-stone-900 border-b border-stone-200 shadow-sm">
      {/* Top Affiliate Mini-Bar */}
      <div className="bg-stone-900 px-4 py-1.5 text-xs text-stone-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#8A9A5B] animate-pulse" />
          <span className="font-medium text-stone-200">Modo Afiliados & Dupes:</span>
          <span className="text-stone-400">Precios en Pesos Mexicanos (MXN) con comisiones directas de afiliados</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="text-stone-400">
            Clicks: <strong className="text-[#8A9A5B] font-semibold">{totalClicks}</strong>
          </span>
          <span className="text-stone-400">
            Comisión estimada: <strong className="text-[#8A9A5B] font-semibold">{formatMXN(totalEstimatedCommission)}</strong>
          </span>
          <button
            onClick={() => setActiveTab('affiliate-hub')}
            className="text-stone-300 hover:text-white underline text-[11px] flex items-center gap-1 cursor-pointer"
          >
            Configurar IDs <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand Logo */}
          <div
            onClick={() => setActiveTab('catalog')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-[#8A9A5B] text-white flex items-center justify-center font-bold shadow-md group-hover:scale-105 transition-transform">
              <Shirt className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-['Playfair_Display',serif] font-bold text-[22px] tracking-tight text-stone-900 group-hover:text-[#8A9A5B] transition-colors">
                  Clones y hallazgos de moda
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-[#8A9A5B]/20 text-[#6B7B45] px-2 py-0.5 rounded border border-[#8A9A5B]/30">
                  Dupes & IA
                </span>
              </div>
              <p className="text-[11px] text-stone-500 hidden sm:block">
                Encuentra clones de pasarela, hallazgos de temporada & looks completos
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              id="nav-tab-catalog"
              onClick={() => setActiveTab('catalog')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'catalog'
                  ? 'bg-stone-900 text-white shadow-inner'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-stone-500" />
              Explorar Looks
            </button>

            <button
              id="nav-tab-ai-stylist"
              onClick={onOpenAIStylist}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 text-[#6B7B45] hover:text-[#5A6A35] hover:bg-[#8A9A5B]/20 border border-[#8A9A5B]/30 bg-[#8A9A5B]/10`}
            >
              <Sparkles className="w-4 h-4 text-[#8A9A5B] animate-spin-slow" />
              Generar Conjunto con IA
            </button>

            <button
              id="nav-tab-match-piece"
              onClick={() => setActiveTab('match-piece')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'match-piece'
                  ? 'bg-stone-900 text-white shadow-inner'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              <Shirt className="w-4 h-4 text-stone-500" />
              Armar con mi Prenda
            </button>

            <button
              id="nav-tab-saved"
              onClick={() => setActiveTab('saved')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'saved'
                  ? 'bg-stone-900 text-white shadow-inner'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              <Heart className="w-4 h-4 text-rose-500" />
              Guardados
              {savedCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-rose-500/20 text-rose-600 text-xs font-bold rounded-full border border-rose-500/40">
                  {savedCount}
                </span>
              )}
            </button>

            <button
              id="nav-tab-affiliate-hub"
              onClick={() => setActiveTab('affiliate-hub')}
              style={{ paddingLeft: '11px', paddingRight: '6px', paddingTop: '2px' }}
              className={`ml-2 pb-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'affiliate-hub'
                  ? 'bg-[#8A9A5B] text-white shadow-md'
                  : 'bg-[#8A9A5B]/10 text-[#6B7B45] hover:bg-[#8A9A5B]/20 border border-[#8A9A5B]/30'
              }`}
            >
              <DollarSign className="w-4 h-4 text-[#8A9A5B]" />
              Panel de Afiliados
            </button>
          </nav>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenAIStylist}
              className="p-2 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40"
              title="Estilista IA"
            >
              <Sparkles className="w-5 h-5 text-amber-400" />
            </button>
            <button
              onClick={() => setActiveTab('affiliate-hub')}
              className="p-2 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/40"
              title="Panel de Afiliados"
            >
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className="p-2 rounded-lg bg-stone-800 text-stone-200 relative"
              title="Guardados"
            >
              <Heart className="w-5 h-5 text-rose-400" />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {savedCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-stone-800 text-xs">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`py-1 px-2 rounded font-medium ${
              activeTab === 'catalog' ? 'text-amber-400' : 'text-stone-400'
            }`}
          >
            Looks
          </button>
          <button
            onClick={() => setActiveTab('match-piece')}
            className={`py-1 px-2 rounded font-medium ${
              activeTab === 'match-piece' ? 'text-amber-400' : 'text-stone-400'
            }`}
          >
            Combinar Prenda
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`py-1 px-2 rounded font-medium ${
              activeTab === 'saved' ? 'text-amber-400' : 'text-stone-400'
            }`}
          >
            Favoritos ({savedCount})
          </button>
          <button
            onClick={() => setActiveTab('affiliate-hub')}
            className={`py-1 px-2 rounded font-medium ${
              activeTab === 'affiliate-hub' ? 'text-emerald-400' : 'text-stone-400'
            }`}
          >
            Afiliados
          </button>
        </div>
      </div>
    </header>
  );
};
