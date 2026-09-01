import React from 'react';
import { Search, SlidersHorizontal, Sparkles, X, ArrowUpDown } from 'lucide-react';
import { FilterOptions } from '../types';
import { formatMXN } from '../utils/affiliate';

interface FilterBarProps {
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  totalResults: number;
  onOpenAIStylist: () => void;
}

const OCCASIONS = [
  'Todas',
  'Casual',
  'Oficina / Trabajo',
  'Cena Elegante',
  'Boda / Evento',
  'Streetwear',
  'Viajes / Vacaciones',
  'Gimnasio / Deportivo',
];

const AESTHETICS = [
  'Todas',
  'Old Money',
  'Minimalista',
  'Casual Chic',
  'Streetwear',
  'Glamour Nocturno',
  'Athleisure',
  'Boho',
];

const SEASONS = ['Todas', 'Primavera', 'Verano', 'Otoño', 'Invierno', 'Todo el Año'];

const GENDERS = ['Todos', 'Mujer', 'Hombre', 'Unisex'];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  setFilters,
  totalResults,
  onOpenAIStylist,
}) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const handleReset = () => {
    setFilters({
      searchQuery: '',
      gender: 'Todos',
      occasion: 'Todas',
      aesthetic: 'Todas',
      season: 'Todas',
      maxPrice: 10000,
      sortBy: 'popular',
    });
  };

  const isFiltered =
    filters.searchQuery !== '' ||
    filters.gender !== 'Todos' ||
    filters.occasion !== 'Todas' ||
    filters.aesthetic !== 'Todas' ||
    filters.season !== 'Todas' ||
    filters.maxPrice < 10000;

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-4 sm:p-5 mb-8">
      {/* Search Input and AI Callout Row */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between mb-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="filter-search-input"
            type="text"
            placeholder="Buscar por estilo, prendas o colores (ej: blazer marfil, lino, fiesta, zapatillas)..."
            value={filters.searchQuery}
            onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
            className="w-full pl-10 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600 transition-all"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              showAdvanced || isFiltered
                ? 'bg-stone-900 text-white border-stone-900'
                : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filtros
            {isFiltered && <span className="w-2 h-2 rounded-full bg-amber-400" />}
          </button>

          <button
            onClick={onOpenAIStylist}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
            Crear Look con IA
          </button>
        </div>
      </div>

      {/* Occasion Quick Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs">
        <span className="text-stone-400 font-medium whitespace-nowrap mr-1">Ocasión:</span>
        {OCCASIONS.map((occ) => (
          <button
            key={occ}
            onClick={() => setFilters((prev) => ({ ...prev, occasion: occ }))}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all font-medium ${
              filters.occasion === occ
                ? 'bg-stone-900 text-white shadow-sm font-semibold'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
            }`}
          >
            {occ}
          </button>
        ))}
      </div>

      {/* Advanced Expandable Filters */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs animate-in fade-in duration-200">
          {/* Gender */}
          <div>
            <label className="block text-stone-600 font-semibold mb-1.5">Género / Tipo de Ajuste</label>
            <div className="flex rounded-lg bg-stone-100 p-1">
              {GENDERS.map((g) => (
                <button
                  key={g}
                  onClick={() => setFilters((prev) => ({ ...prev, gender: g }))}
                  className={`flex-1 py-1.5 text-center rounded-md font-medium transition-all ${
                    filters.gender === g
                      ? 'bg-white text-stone-900 shadow-xs font-semibold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Aesthetic */}
          <div>
            <label className="block text-stone-600 font-semibold mb-1.5">Estética / Vibe</label>
            <select
              value={filters.aesthetic}
              onChange={(e) => setFilters((prev) => ({ ...prev, aesthetic: e.target.value }))}
              className="w-full py-2 px-3 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              {AESTHETICS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          {/* Season */}
          <div>
            <label className="block text-stone-600 font-semibold mb-1.5">Temporada / Clima</label>
            <select
              value={filters.season}
              onChange={(e) => setFilters((prev) => ({ ...prev, season: e.target.value }))}
              className="w-full py-2 px-3 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              {SEASONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Sort & Max Price */}
          <div>
            <label className="block text-stone-600 font-semibold mb-1.5">Ordenar Por</label>
            <select
              value={filters.sortBy}
              onChange={(e: any) => setFilters((prev) => ({ ...prev, sortBy: e.target.value }))}
              className="w-full py-2 px-3 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <option value="popular">Más Populares & Guardados</option>
              <option value="price-asc">Precio Look: Menor a Mayor</option>
              <option value="price-desc">Precio Look: Mayor a Menor</option>
              <option value="commission">Mayor Comisión Afiliado ($ MXN)</option>
              <option value="newest">Más Recientes</option>
            </select>
          </div>

          {/* Price Range Slider */}
          <div className="sm:col-span-2 lg:col-span-4 flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-stone-100">
            <div className="w-full sm:w-1/2 flex items-center gap-3">
              <span className="text-stone-500 whitespace-nowrap">Presupuesto máx:</span>
              <input
                type="range"
                min="500"
                max="10000"
                step="250"
                value={filters.maxPrice}
                onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: Number(e.target.value) }))}
                className="w-full accent-amber-600"
              />
              <span className="font-mono font-bold text-stone-800 shrink-0">{formatMXN(filters.maxPrice)}</span>
            </div>

            {isFiltered && (
              <button
                onClick={handleReset}
                className="text-stone-500 hover:text-stone-900 underline text-xs cursor-pointer"
              >
                Limpiar todos los filtros
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results Count & Quick Status */}
      <div className="mt-3 flex items-center justify-between text-xs text-stone-500">
        <span>
          Mostrando <strong>{totalResults}</strong> conjuntos de moda recomendados
        </span>
        {isFiltered && (
          <span className="text-amber-700 font-medium flex items-center gap-1">
            Filtros aplicados
            <button onClick={handleReset} className="hover:text-stone-900 ml-1">
              (Reset)
            </button>
          </span>
        )}
      </div>
    </div>
  );
};
