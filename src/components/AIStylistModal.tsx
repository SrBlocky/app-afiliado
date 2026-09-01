import React, { useState } from 'react';
import { Sparkles, X, Wand2, Loader2, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { OutfitSet } from '../types';

interface AIStylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOutfitGenerated: (outfit: OutfitSet) => void;
}

export const AIStylistModal: React.FC<AIStylistModalProps> = ({
  isOpen,
  onClose,
  onOutfitGenerated,
}) => {
  const [occasion, setOccasion] = useState('Casual Chic');
  const [aesthetic, setAesthetic] = useState('Old Money');
  const [season, setSeason] = useState('Otoño');
  const [gender, setGender] = useState('Mujer');
  const [budgetTier, setBudgetTier] = useState('Económico SHEIN ($600 - $1,500 MXN)');
  const [colorPreference, setColorPreference] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate-outfit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: customPrompt,
          occasion,
          aesthetic,
          season,
          gender,
          budgetTier,
          colorPreference,
        }),
      });

      const data = await response.json();
      if (data.success && data.outfit) {
        onOutfitGenerated(data.outfit);
        onClose();
      } else {
        setError(data.error || 'No se pudo generar el conjunto. Inténtalo de nuevo.');
      }
    } catch (err: any) {
      console.error('AI Outfit error:', err);
      setError('Ocurrió un error de conexión con el servicio de estilismo IA.');
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    'Clon Old Money con blazer MOTF de SHEIN y mocasines',
    'Look athleisure cómodo con leggings GLOWMODE estilo Alo Yoga',
    'Outfit aesthetic coreano con cárdigan DAZY y falda plisada',
    'Vestido de satén SHEIN Privé para cena elegante con tacones',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-rose-950 to-stone-900 text-white p-5 sm:p-6 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="font-['Playfair_Display',serif] text-xl sm:text-2xl font-bold">
                Estilista IA - Clones SHEIN
              </h2>
              <p className="text-xs text-rose-200">
                Crea conjuntos y clones de pasarela 100% con prendas disponibles en SHEIN México
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 text-stone-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Prompts */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              Inspiración Rápida de Clones SHEIN:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {samplePrompts.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCustomPrompt(s)}
                  className="text-left text-[11px] bg-stone-100 hover:bg-rose-50 hover:border-rose-300 text-stone-700 px-3 py-1.5 rounded-lg transition-colors border border-stone-200 cursor-pointer"
                >
                  "{s}"
                </button>
              ))}
            </div>
          </div>

          {/* Prompt input */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Describe tu look ideal o el clon que buscas:
            </label>
            <textarea
              rows={3}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Ej: Quiero un clon del estilo Old Money de Sofia Richie usando la línea MOTF de SHEIN en tonos marfil y negro..."
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-600 transition-all resize-none"
            />
          </div>

          {/* 2x2 Grid of Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Ocasión Principal</label>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="w-full py-2.5 px-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              >
                <option value="Casual Chic">Casual Chic / Diario</option>
                <option value="Oficina / Trabajo">Oficina / Trabajo (MOTF)</option>
                <option value="Cena Elegante">Cena Elegante / Cita (SHEIN Privé)</option>
                <option value="Boda / Evento">Boda / Gala / Cóctel</option>
                <option value="Streetwear">Streetwear & Y2K (ROMWE / ICON)</option>
                <option value="Viajes / Vacaciones">Viajes / Vacaciones / Playa</option>
                <option value="Gimnasio / Deportivo">Gimnasio / Athleisure (GLOWMODE)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Estética / Estilo</label>
              <select
                value={aesthetic}
                onChange={(e) => setAesthetic(e.target.value)}
                className="w-full py-2.5 px-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              >
                <option value="Old Money">Old Money / Lujo Silencioso (MOTF)</option>
                <option value="Minimalista">Estética Coreana & Clean Girl (DAZY)</option>
                <option value="Casual Chic">Casual Chic & Retro (SHEIN MOD)</option>
                <option value="Streetwear">Streetwear & Grunge (ROMWE)</option>
                <option value="Glamour Nocturno">Glamour & Satén (SHEIN Privé)</option>
                <option value="Athleisure">Athleisure & Fitness (GLOWMODE)</option>
                <option value="Boho">Boho & Vacaciones</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Género / Tipo de Prenda</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full py-2.5 px-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              >
                <option value="Mujer">Mujer</option>
                <option value="Hombre">Hombre (SHEIN Men / Dazy Man)</option>
                <option value="Unisex">Unisex / Oversized</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Presupuesto en SHEIN</label>
              <select
                value={budgetTier}
                onChange={(e) => setBudgetTier(e.target.value)}
                className="w-full py-2.5 px-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              >
                <option value="Ultra Económico (< $800 MXN)">Ultra Económico (&lt; $800 MXN)</option>
                <option value="Económico SHEIN ($800 - $1,500 MXN)">Económico SHEIN ($800 - $1,500 MXN)</option>
                <option value="Colección Premium MOTF ($1,500 - $2,500 MXN)">Colección Premium MOTF ($1,500 - $2,500 MXN)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Colores o Tonos Preferidos (Opcional):
            </label>
            <input
              type="text"
              value={colorPreference}
              onChange={(e) => setColorPreference(e.target.value)}
              placeholder="Ej: Tonos arena, verde salvia, marfil, negro mate, azul marino..."
              className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-stone-900 to-stone-800 hover:from-rose-700 hover:to-rose-800 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-75"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Buscando prendas y clones en SHEIN México...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-rose-300" />
                  Generar Clon Completo en SHEIN
                </>
              )}
            </button>
            <p className="text-[11px] text-stone-400 text-center mt-2">
              Se creará un conjunto exclusivo de prendas SHEIN con precios en MXN y enlaces con tu ID de afiliado.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
