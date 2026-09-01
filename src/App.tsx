import React, { useState, useEffect, useMemo } from 'react';
import { OutfitSet, FilterOptions, AffiliateConfig, AffiliateClickLog } from './types';
import { INITIAL_OUTFITS } from './data/mockOutfits';
import {
  getAffiliateConfig,
  getAffiliateClickLogs,
  getSavedOutfitIds,
  toggleSaveOutfit,
  buildAffiliateUrl,
  trackAffiliateClick,
} from './utils/affiliate';
import { Navbar } from './components/Navbar';
import { AffiliateDisclosureBar } from './components/AffiliateDisclosureBar';
import { FilterBar } from './components/FilterBar';
import { OutfitCard } from './components/OutfitCard';
import { OutfitDetailModal } from './components/OutfitDetailModal';
import { AIStylistModal } from './components/AIStylistModal';
import { PieceMatchmakerView } from './components/PieceMatchmakerView';
import { AffiliateDashboard } from './components/AffiliateDashboard';
import {
  Sparkles,
  ShoppingBag,
  Heart,
  TrendingUp,
  Shirt,
  DollarSign,
  Layers,
  ArrowRight,
  CheckCircle2,
  Sliders,
} from 'lucide-react';

export default function App() {
  const [outfits, setOutfits] = useState<OutfitSet[]>(INITIAL_OUTFITS);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [selectedOutfit, setSelectedOutfit] = useState<OutfitSet | null>(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'catalog' | 'ai-stylist' | 'match-piece' | 'saved' | 'affiliate-hub'
  >('catalog');

  const [affiliateConfig, setAffiliateConfig] = useState<AffiliateConfig>(getAffiliateConfig());
  const [clickLogs, setClickLogs] = useState<AffiliateClickLog[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    gender: 'Todos',
    occasion: 'Todas',
    aesthetic: 'Todas',
    season: 'Todas',
    maxPrice: 10000,
    sortBy: 'popular',
  });

  // Load initial local data
  useEffect(() => {
    setSavedIds(getSavedOutfitIds());
    setClickLogs(getAffiliateClickLogs());
    setAffiliateConfig(getAffiliateConfig());
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleSave = (id: string) => {
    const updated = toggleSaveOutfit(id);
    setSavedIds(updated);
    if (updated.includes(id)) {
      showToast('Conjunto guardado en tus favoritos ❤️');
    } else {
      showToast('Conjunto eliminado de favoritos');
    }
  };

  const handleOutfitGenerated = (newOutfit: OutfitSet) => {
    setOutfits((prev) => [newOutfit, ...prev]);
    setSelectedOutfit(newOutfit);
    showToast('¡Conjunto creado con éxito por el Estilista IA! ✨');
  };

  const handleAddMultipleOutfits = (newOutfits: OutfitSet[]) => {
    setOutfits((prev) => {
      const existingIds = new Set(prev.map((o) => o.id));
      const filtered = newOutfits.filter((o) => !existingIds.has(o.id));
      return [...filtered, ...prev];
    });
  };

  const handleItemClickTracked = () => {
    setClickLogs(getAffiliateClickLogs());
    showToast('Enlace de afiliado abierto y registrado con tu Tag 🛍️');
  };

  const handleQuickBuy = (outfit: OutfitSet) => {
    setSelectedOutfit(outfit);
  };

  // Filter and sort outfits
  const filteredOutfits = useMemo(() => {
    return outfits.filter((outfit) => {
      // Saved tab filter
      if (activeTab === 'saved' && !savedIds.includes(outfit.id)) {
        return false;
      }

      // Search Query
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const matchesTitle = outfit.title.toLowerCase().includes(q);
        const matchesDesc = outfit.description.toLowerCase().includes(q);
        const matchesTags = outfit.tags.some((t) => t.toLowerCase().includes(q));
        const matchesItems = outfit.items.some(
          (i) => i.name.toLowerCase().includes(q) || i.brand.toLowerCase().includes(q) || i.color.toLowerCase().includes(q)
        );
        if (!matchesTitle && !matchesDesc && !matchesTags && !matchesItems) {
          return false;
        }
      }

      // Gender
      if (filters.gender !== 'Todos' && outfit.gender !== filters.gender && outfit.gender !== 'Unisex') {
        return false;
      }

      // Occasion
      if (filters.occasion !== 'Todas' && outfit.occasion !== filters.occasion) {
        return false;
      }

      // Aesthetic
      if (filters.aesthetic !== 'Todas' && outfit.aesthetic !== filters.aesthetic) {
        return false;
      }

      // Season
      if (filters.season !== 'Todas' && outfit.season !== filters.season && outfit.season !== 'Todo el Año') {
        return false;
      }

      // Max Price
      if (outfit.totalPrice > filters.maxPrice) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'price-asc') return a.totalPrice - b.totalPrice;
      if (filters.sortBy === 'price-desc') return b.totalPrice - a.totalPrice;
      if (filters.sortBy === 'commission') {
        const commA = a.items.reduce((s, i) => s + (i.price * (i.commissionRatePct || 8)) / 100, 0);
        const commB = b.items.reduce((s, i) => s + (i.price * (i.commissionRatePct || 8)) / 100, 0);
        return commB - commA;
      }
      if (filters.sortBy === 'newest') return (b.createdAt || '').localeCompare(a.createdAt || '');
      return (b.likesCount || 0) - (a.likesCount || 0); // popular default
    });
  }, [outfits, savedIds, filters, activeTab]);

  const totalEstimatedCommission = clickLogs.reduce((s, l) => s + l.estimatedCommission, 0);

  return (
    <div className="min-h-screen bg-[#F9F6F0] text-stone-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-stone-700 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="w-4 h-4 text-[#8A9A5B] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={savedIds.length}
        totalClicks={clickLogs.length}
        totalEstimatedCommission={totalEstimatedCommission}
        onOpenAIStylist={() => setIsAIModalOpen(true)}
      />

      {/* Affiliate Transparency Top Bar */}
      <AffiliateDisclosureBar
        config={affiliateConfig}
        onOpenHub={() => setActiveTab('affiliate-hub')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* VIEW: Affiliate Monetization Hub */}
        {activeTab === 'affiliate-hub' && (
          <AffiliateDashboard
            config={affiliateConfig}
            onUpdateConfig={(cfg) => {
              setAffiliateConfig(cfg);
              showToast('Configuración de afiliados actualizada');
            }}
            clickLogs={clickLogs}
            onClearLogs={() => {
              setClickLogs([]);
              showToast('Historial de clicks limpiado');
            }}
          />
        )}

        {/* VIEW: Match Piece Feature */}
        {activeTab === 'match-piece' && (
          <PieceMatchmakerView
            onSelectOutfit={(outfit) => setSelectedOutfit(outfit)}
            onQuickBuy={handleQuickBuy}
            isSaved={(id) => savedIds.includes(id)}
            onToggleSave={handleToggleSave}
            affiliateConfig={affiliateConfig}
            onAddNewOutfits={handleAddMultipleOutfits}
          />
        )}

        {/* VIEW: Catalog & Saved Outfits */}
        {(activeTab === 'catalog' || activeTab === 'saved') && (
          <div className="space-y-8">
            {/* Catalog Hero Banner */}
            {activeTab === 'catalog' && (
              <div className="bg-[#8A9A5B] text-white rounded-3xl p-6 sm:p-10 border border-stone-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="max-w-xl z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-900/40 text-[#F9F6F0] text-xs font-semibold border border-stone-900/30 mb-3">
                    <Sparkles className="w-3.5 h-3.5" />
                    Catálogo de Clones de Lujo & Hallazgos de Moda
                  </div>
                  <h1 className="font-['Playfair_Display',serif] text-2xl sm:text-4xl font-bold mb-2 leading-tight">
                    Clones y hallazgos de moda listos para comprar
                  </h1>
                  <p className="text-[#F9F6F0] text-xs sm:text-sm leading-relaxed mb-4">
                    Descubre dupes exactos de prendas de alta costura, conjuntos coordinados en pesos mexicanos ($ MXN) y links de afiliados para comprar al mejor precio.
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setIsAIModalOpen(true)}
                      className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#8A9A5B]" />
                      Diseñar Look o Clon con IA
                    </button>
                    <button
                      onClick={() => setActiveTab('match-piece')}
                      className="px-4 py-2.5 bg-[#6B7B45] hover:bg-[#5A6A35] text-white text-xs font-semibold rounded-xl border border-stone-900/20 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Shirt className="w-3.5 h-3.5 text-stone-900" />
                      Armar con una prenda mía
                    </button>
                  </div>
                </div>

                <div className="hidden lg:grid grid-cols-2 gap-2 shrink-0 w-64 opacity-90">
                  <div className="rounded-xl overflow-hidden aspect-[3/4] shadow-md border border-stone-700">
                    <img
                      src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&auto=format&fit=crop&q=80"
                      alt="Look 1"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="rounded-xl overflow-hidden aspect-[3/4] shadow-md border border-stone-700 mt-4">
                    <img
                      src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&auto=format&fit=crop&q=80"
                      alt="Look 2"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Saved Outfits Hero */}
            {activeTab === 'saved' && (
              <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-xl flex items-center justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/30 mb-2">
                    <Heart className="w-3.5 h-3.5 fill-current" />
                    Tus Conjuntos Guardados
                  </div>
                  <h1 className="font-['Playfair_Display',serif] text-2xl sm:text-3xl font-bold mb-1">
                    Mi Guardarropa de Favoritos ({savedIds.length})
                  </h1>
                  <p className="text-stone-400 text-xs">
                    Tus looks seleccionados para comprar o inspirarte en cualquier momento
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('catalog')}
                  className="text-xs text-amber-400 hover:text-amber-300 underline"
                >
                  Explorar más looks
                </button>
              </div>
            )}

            {/* Filter Bar */}
            <FilterBar
              filters={filters}
              setFilters={setFilters}
              totalResults={filteredOutfits.length}
              onOpenAIStylist={() => setIsAIModalOpen(true)}
            />

            {/* Outfits Grid */}
            {filteredOutfits.length === 0 ? (
              <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-4">
                <ShoppingBag className="w-12 h-12 text-stone-400 mx-auto" />
                <h3 className="font-['Playfair_Display',serif] text-xl font-bold text-stone-800">
                  {activeTab === 'saved'
                    ? 'No tienes conjuntos guardados en favoritos todavía'
                    : 'No se encontraron conjuntos con estos filtros'}
                </h3>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  {activeTab === 'saved'
                    ? 'Explora el catálogo o genera un look con Inteligencia Artificial y guárdalo pulsando el icono del corazón.'
                    : 'Prueba a cambiar la ocasión, estética o ampliar el rango de presupuesto, o pídele al Estilista IA que cree uno a tu medida.'}
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={() => setIsAIModalOpen(true)}
                    className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    Crear Conjunto a Medida
                  </button>
                  {activeTab === 'saved' && (
                    <button
                      onClick={() => setActiveTab('catalog')}
                      className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Ver Catálogo
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {filteredOutfits.map((outfit) => (
                  <OutfitCard
                    key={outfit.id}
                    outfit={outfit}
                    isSaved={savedIds.includes(outfit.id)}
                    onToggleSave={handleToggleSave}
                    onSelectOutfit={(o) => setSelectedOutfit(o)}
                    onQuickBuy={handleQuickBuy}
                    affiliateConfig={affiliateConfig}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 border-t border-stone-800 text-xs mt-16 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shirt className="w-5 h-5 text-amber-500" />
              <span className="font-['Playfair_Display',serif] text-lg font-bold text-white">
                Clones y hallazgos de moda
              </span>
            </div>
            <p className="text-stone-400 leading-relaxed mb-3">
              Plataforma de recomendación de dupes, clones de lujo y conjuntos de moda en pesos mexicanos con enlaces de afiliados.
            </p>
            <p className="text-[11px] text-stone-500">
              © {new Date().getFullYear()} Clones y hallazgos de moda. Todos los derechos reservados.
            </p>
          </div>

          <div>
            <h4 className="text-stone-200 font-semibold mb-3 uppercase tracking-wider text-[11px]">
              Tiendas y Redes de Afiliados
            </h4>
            <ul className="space-y-1.5 text-stone-400">
              <li>Amazon Associates (Programa de Afiliados)</li>
              <li>ASOS & Shein Creator Partnerships</li>
              <li>Awin (Zara, Mango, Farfetch, El Corte Inglés)</li>
              <li>Rakuten Advertising & Impact Radius</li>
            </ul>
          </div>

          <div>
            <h4 className="text-stone-200 font-semibold mb-3 uppercase tracking-wider text-[11px]">
              Monetización & Privacidad
            </h4>
            <p className="text-stone-400 leading-relaxed mb-2">
              Esta aplicación utiliza enlaces de afiliados. Cuando realizas una compra a través de estos enlaces, podemos recibir una comisión sin coste adicional para ti.
            </p>
            <button
              onClick={() => setActiveTab('affiliate-hub')}
              className="text-amber-400 hover:text-amber-300 font-medium underline flex items-center gap-1"
            >
              Configurar tus IDs en el Panel de Afiliados →
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedOutfit && (
        <OutfitDetailModal
          outfit={selectedOutfit}
          onClose={() => setSelectedOutfit(null)}
          isSaved={savedIds.includes(selectedOutfit.id)}
          onToggleSave={handleToggleSave}
          affiliateConfig={affiliateConfig}
          onItemClickTracked={handleItemClickTracked}
        />
      )}

      {isAIModalOpen && (
        <AIStylistModal
          isOpen={isAIModalOpen}
          onClose={() => setIsAIModalOpen(false)}
          onOutfitGenerated={handleOutfitGenerated}
        />
      )}
    </div>
  );
}
