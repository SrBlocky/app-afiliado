import React, { useState } from 'react';
import { Shirt, Sparkles, Loader2, ArrowRight, Layers, AlertCircle, ShoppingBag } from 'lucide-react';
import { OutfitSet, AffiliateConfig } from '../types';
import { OutfitCard } from './OutfitCard';

interface PieceMatchmakerViewProps {
  onSelectOutfit: (outfit: OutfitSet) => void;
  onQuickBuy: (outfit: OutfitSet) => void;
  isSaved: (id: string) => boolean;
  onToggleSave: (id: string) => void;
  affiliateConfig: AffiliateConfig;
  onAddNewOutfits: (outfits: OutfitSet[]) => void;
}

export const PieceMatchmakerView: React.FC<PieceMatchmakerViewProps> = ({
  onSelectOutfit,
  onQuickBuy,
  isSaved,
  onToggleSave,
  affiliateConfig,
  onAddNewOutfits,
}) => {
  const [pieceInput, setPieceInput] = useState('');
  const [occasion, setOccasion] = useState('Casual Chic & Oficina');
  const [gender, setGender] = useState('Mujer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedMatches, setGeneratedMatches] = useState<OutfitSet[]>([]);

  const samplePieces = [
    'Pantalón de pinzas beige de tiro alto',
    'Chaqueta biker de cuero negro vintage',
    'Falda midi vaquera con abertura frontal',
    'Camisa de lino blanco oversize',
    'Vestido lencero negro satinado',
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pieceInput.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/match-piece', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pieceDescription: pieceInput,
          occasion,
          gender,
        }),
      });

      const data = await res.json();
      if (data.success && data.outfits && data.outfits.length > 0) {
        setGeneratedMatches(data.outfits);
        onAddNewOutfits(data.outfits);
      } else {
        setError('No se pudieron generar combinaciones para esta prenda. Prueba con más detalle.');
      }
    } catch (err: any) {
      console.error('Error in match-piece:', err);
      setError('Error al conectar con el estilista de combinaciones.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 text-white rounded-3xl p-6 sm:p-10 border border-stone-800 shadow-xl relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30 mb-4">
            <Shirt className="w-3.5 h-3.5" />
            Capsule Wardrobe Matchmaker
          </div>
          <h1 className="font-['Playfair_Display',serif] text-2xl sm:text-4xl font-bold mb-3 leading-tight">
            ¿Tienes una prenda y no sabes con qué combinarla?
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed mb-6">
            Dinos qué prenda tienes en tu armario y nuestra IA creará múltiples conjuntos completos a su alrededor, seleccionando las mejores prendas complementarias con links directos de compra.
          </p>

          {/* Quick suggestions */}
          <div className="mb-4">
            <span className="text-[11px] uppercase font-bold text-stone-400 block mb-2">
              Ejemplos populares para probar:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {samplePieces.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setPieceInput(p)}
                  className="text-xs bg-stone-800/80 hover:bg-stone-700 text-stone-200 px-3 py-1 rounded-lg border border-stone-700 transition-colors cursor-pointer"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleGenerate} className="space-y-3">
            {error && (
              <div className="p-3 bg-rose-950/80 border border-rose-600 rounded-xl text-xs text-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={pieceInput}
                onChange={(e) => setPieceInput(e.target.value)}
                placeholder="Escribe tu prenda (ej: Pantalón de lino verde oliva, blazer beige...)"
                className="flex-1 px-4 py-3 bg-stone-800/90 border border-stone-700 rounded-xl text-white placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
              <button
                type="submit"
                disabled={loading || !pieceInput.trim()}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm shrink-0 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                    Armando Conjuntos...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-stone-950" />
                    Crear Looks Alrededor
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-4 text-xs text-stone-400 pt-1">
              <div className="flex items-center gap-2">
                <span>Género:</span>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="bg-stone-800 text-stone-200 py-1 px-2 rounded-lg border border-stone-700 text-xs"
                >
                  <option value="Mujer">Mujer</option>
                  <option value="Hombre">Hombre</option>
                  <option value="Unisex">Unisex</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span>Ocasión:</span>
                <select
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="bg-stone-800 text-stone-200 py-1 px-2 rounded-lg border border-stone-700 text-xs"
                >
                  <option value="Casual Chic & Oficina">Casual & Oficina</option>
                  <option value="Cena & Noche">Cena Elegante & Noche</option>
                  <option value="Boda & Fiesta">Boda & Evento</option>
                  <option value="Vacaciones">Vacaciones & Verano</option>
                </select>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Results Section */}
      {generatedMatches.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-['Playfair_Display',serif] text-2xl font-bold text-stone-900">
                Conjuntos Creados para: "{pieceInput}"
              </h2>
              <p className="text-xs text-stone-600">
                Looks armonizados listos para comprar con enlaces directos
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full font-bold">
              {generatedMatches.length} Variaciones Disponibles
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {generatedMatches.map((outfit) => (
              <OutfitCard
                key={outfit.id}
                outfit={outfit}
                isSaved={isSaved(outfit.id)}
                onToggleSave={onToggleSave}
                onSelectOutfit={onSelectOutfit}
                onQuickBuy={onQuickBuy}
                affiliateConfig={affiliateConfig}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
