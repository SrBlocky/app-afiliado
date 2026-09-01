import React, { useState } from 'react';
import {
  DollarSign,
  MousePointerClick,
  Settings,
  Link,
  Copy,
  Check,
  Calculator,
  ShieldCheck,
  ExternalLink,
  Trash2,
  ShoppingBag,
  Sparkles,
  Tag,
  HelpCircle,
} from 'lucide-react';
import { AffiliateConfig, AffiliateClickLog, StoreName } from '../types';
import {
  saveAffiliateConfig,
  buildAffiliateUrl,
  formatMXN,
} from '../utils/affiliate';

interface AffiliateDashboardProps {
  config: AffiliateConfig;
  onUpdateConfig: (newConfig: AffiliateConfig) => void;
  clickLogs: AffiliateClickLog[];
  onClearLogs: () => void;
}

export const AffiliateDashboard: React.FC<AffiliateDashboardProps> = ({
  config,
  onUpdateConfig,
  clickLogs,
  onClearLogs,
}) => {
  const [formData, setFormData] = useState<AffiliateConfig>({ ...config });
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Link Generator Tool State
  const [genUrl, setGenUrl] = useState('');
  const [genStore, setGenStore] = useState<StoreName>('Shein');
  const [genItemName, setGenItemName] = useState('');
  const [generatedResult, setGeneratedResult] = useState('');
  const [copiedGen, setCopiedGen] = useState(false);
  const [copiedPromo, setCopiedPromo] = useState(false);

  // Revenue Simulator State
  const [simVisitors, setSimVisitors] = useState(8000);
  const [simCtr, setSimCtr] = useState(15); // % click to SHEIN
  const [simConversion, setSimConversion] = useState(4.0); // % purchase rate on SHEIN
  const [simAov, setSimAov] = useState(850); // $ MXN average basket in SHEIN Mexico
  const [simCommission, setSimCommission] = useState(formData.defaultCommissionRate || 10.0);

  // Calculate Metrics
  const totalClicks = clickLogs.length;
  const totalEstimatedRevenue = clickLogs.reduce((s, l) => s + l.estimatedCommission, 0);

  // Top collections breakdown
  const lineCounts: Record<string, number> = {};
  clickLogs.forEach((l) => {
    lineCounts[l.store] = (lineCounts[l.store] || 0) + 1;
  });
  const topSubbrand = Object.entries(lineCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'MOTF (Shein)';

  // Simulator calculations
  const simTotalClicks = (simVisitors * simCtr) / 100;
  const simTotalSales = (simTotalClicks * simConversion) / 100;
  const simTotalVolume = simTotalSales * simAov;
  const simMonthlyEarnings = (simTotalVolume * simCommission) / 100;
  const simAnnualEarnings = simMonthlyEarnings * 12;

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveAffiliateConfig(formData);
    onUpdateConfig(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleGenerateLink = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUrl = buildAffiliateUrl(genUrl, genStore, genItemName || 'Prenda SHEIN', formData);
    setGeneratedResult(finalUrl);
  };

  const copyGenerated = () => {
    if (navigator.clipboard && generatedResult) {
      navigator.clipboard.writeText(generatedResult);
      setCopiedGen(true);
      setTimeout(() => setCopiedGen(false), 2000);
    }
  };

  const copyPromoCode = () => {
    if (navigator.clipboard && formData.sheinPromoCode) {
      navigator.clipboard.writeText(formData.sheinPromoCode);
      setCopiedPromo(true);
      setTimeout(() => setCopiedPromo(false), 2000);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/30 mb-3">
            <DollarSign className="w-3.5 h-3.5" />
            Monetización Exclusiva SHEIN Publisher & Influencer
          </div>
          <h1 className="font-['Playfair_Display',serif] text-2xl sm:text-3xl font-bold mb-2">
            Panel de Afiliados SHEIN & Ganancias
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Configura tu <strong>ID de Afiliado de SHEIN</strong> y cupón de descuento para que todas las recomendaciones de clones y hallazgos lleven tus enlaces automáticos y ganes comisiones (10% a 15%) por cada compra en México.
          </p>
        </div>

        <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 shrink-0 text-center w-full md:w-auto">
          <span className="text-xs text-stone-400 block mb-1">Comisión SHEIN Proyectada</span>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400">
            {formatMXN(totalEstimatedRevenue)}
          </span>
          <span className="text-[11px] text-stone-500 block mt-1">en base a {totalClicks} clicks</span>
        </div>
      </div>

      {/* Top 4 KPI Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">Clicks a SHEIN</span>
            <MousePointerClick className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-stone-900">{totalClicks}</div>
          <span className="text-[11px] text-stone-400 mt-1 block">Registrados en la app</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">Ganancia Estimada</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600">{formatMXN(totalEstimatedRevenue)}</div>
          <span className="text-[11px] text-stone-400 mt-1 block">Tasa ~{formData.defaultCommissionRate}%</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">Colección Popular</span>
            <ShoppingBag className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-xl font-bold text-stone-900 truncate">{topSubbrand}</div>
          <span className="text-[11px] text-stone-400 mt-1 block">Mayor intención de compra</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">ID SHEIN Activo</span>
            <ShieldCheck className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-lg font-bold font-mono text-stone-900 truncate">
            {formData.sheinId || 'Sin configurar'}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
            {formData.sheinId ? 'Inyectando en cada link' : 'Agrega tu ID'}
          </span>
        </div>
      </div>

      {/* Main Grid: Settings on left, Simulator on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* SHEIN Affiliate Configuration Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-stone-800" />
              <h2 className="font-['Playfair_Display',serif] text-xl font-bold text-stone-900">
                Configuración de tu Cuenta SHEIN
              </h2>
            </div>
            {savedSuccess && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1 animate-in fade-in">
                <Check className="w-3.5 h-3.5" /> ¡Guardado correctamente!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs sm:text-sm">
            {/* SHEIN Affiliate ID */}
            <div>
              <label className="block font-bold text-stone-800 mb-1">
                SHEIN Affiliate ID / Publisher Username (aff_id)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formData.sheinId}
                  onChange={(e) => setFormData({ ...formData, sheinId: e.target.value })}
                  placeholder="Ej: shein_alex_mx"
                  className="flex-1 px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                />
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                Se insertará como <code>?aff_id={formData.sheinId || 'tu_id'}&url_from={formData.sheinId || 'tu_id'}</code> en todos los productos.
              </p>
            </div>

            {/* SHEIN Promo Code & Referral Link */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-stone-800 mb-1">Cupón de Descuento (Promo Code)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.sheinPromoCode}
                    onChange={(e) => setFormData({ ...formData, sheinPromoCode: e.target.value.toUpperCase() })}
                    placeholder="Ej: SHEIN15 o TUCODIGO"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono font-bold text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                  />
                  <Tag className="w-4 h-4 text-rose-400 absolute right-3 top-3 pointer-events-none" />
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Se muestra en las fichas de prendas para incentivar la compra con tu código.
                </p>
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">Enlace de Referido Principal (shein.top)</label>
                <input
                  type="url"
                  value={formData.sheinReferralLink}
                  onChange={(e) => setFormData({ ...formData, sheinReferralLink: e.target.value })}
                  placeholder="https://shein.top/tu-enlace"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                />
                <p className="text-[11px] text-stone-500 mt-1">
                  Enlace corto oficial de tu perfil o tienda en SHEIN.
                </p>
              </div>
            </div>

            {/* Commission Rate & Currency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-stone-800 mb-1">Comisión Estimada de SHEIN (%)</label>
                <input
                  type="number"
                  step="0.5"
                  min="5"
                  max="30"
                  value={formData.defaultCommissionRate}
                  onChange={(e) => setFormData({ ...formData, defaultCommissionRate: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                />
                <p className="text-[11px] text-stone-500 mt-1">SHEIN paga entre 10% y 15% según volumen.</p>
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">Moneda de Pago</label>
                <input
                  type="text"
                  readOnly
                  value="MXN (Pesos Mexicanos)"
                  className="w-full px-3.5 py-2.5 bg-stone-100 border border-stone-200 rounded-xl font-medium text-stone-700 cursor-not-allowed"
                />
              </div>
            </div>

            {/* UTM Tracking */}
            <div className="pt-2 border-t border-stone-100">
              <label className="block font-bold text-stone-800 mb-1">
                Etiquetas de Analítica (UTM Tags para SHEIN)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={formData.customUtmSource}
                  onChange={(e) => setFormData({ ...formData, customUtmSource: e.target.value })}
                  placeholder="utm_source (ej: clones_app)"
                  className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono"
                />
                <input
                  type="text"
                  value={formData.customUtmCampaign}
                  onChange={(e) => setFormData({ ...formData, customUtmCampaign: e.target.value })}
                  placeholder="utm_campaign (ej: outfits_mexico)"
                  className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Guardar Configuración de SHEIN
            </button>
          </form>
        </div>

        {/* Revenue & Traffic Simulator (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-stone-950 via-stone-900 to-rose-950 text-white rounded-3xl p-6 sm:p-8 border border-rose-900/40 shadow-xl space-y-6">
          <div className="flex items-center gap-2 border-b border-stone-800 pb-3">
            <Calculator className="w-5 h-5 text-rose-400" />
            <h3 className="font-['Playfair_Display',serif] text-xl font-bold text-stone-100">
              Simulador de Ganancias SHEIN
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            {/* Visitors Slider */}
            <div>
              <div className="flex justify-between text-stone-300 font-medium mb-1">
                <span>Visitantes Mensuales a la App:</span>
                <span className="font-mono font-bold text-white">{simVisitors.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="50000"
                step="1000"
                value={simVisitors}
                onChange={(e) => setSimVisitors(Number(e.target.value))}
                className="w-full accent-rose-500"
              />
            </div>

            {/* Click to SHEIN CTR */}
            <div>
              <div className="flex justify-between text-stone-300 font-medium mb-1">
                <span>Tasa de Click a SHEIN (CTR):</span>
                <span className="font-mono font-bold text-white">{simCtr}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="35"
                step="1"
                value={simCtr}
                onChange={(e) => setSimCtr(Number(e.target.value))}
                className="w-full accent-rose-500"
              />
            </div>

            {/* Conversion Rate */}
            <div>
              <div className="flex justify-between text-stone-300 font-medium mb-1">
                <span>Tasa de Conversión / Compra:</span>
                <span className="font-mono font-bold text-white">{simConversion}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={simConversion}
                onChange={(e) => setSimConversion(Number(e.target.value))}
                className="w-full accent-rose-500"
              />
            </div>

            {/* Basket size */}
            <div>
              <div className="flex justify-between text-stone-300 font-medium mb-1">
                <span>Cesta Promedio SHEIN ($ MXN):</span>
                <span className="font-mono font-bold text-white">{formatMXN(simAov)}</span>
              </div>
              <input
                type="range"
                min="300"
                max="3000"
                step="50"
                value={simAov}
                onChange={(e) => setSimAov(Number(e.target.value))}
                className="w-full accent-rose-500"
              />
            </div>
          </div>

          {/* Results Box */}
          <div className="bg-stone-900/90 rounded-2xl p-4 border border-rose-500/30 text-center space-y-2">
            <span className="text-xs text-stone-400 uppercase font-semibold tracking-wider">
              Ingresos Mensuales Proyectados
            </span>
            <div className="text-3xl font-extrabold font-mono text-emerald-400">
              {formatMXN(simMonthlyEarnings)} <span className="text-xs text-stone-400 font-sans">/ mes</span>
            </div>
            <div className="text-xs text-stone-400 pt-1 border-t border-stone-800">
              Proyección Anual: <strong className="text-rose-300 font-mono">{formatMXN(simAnnualEarnings)}</strong> al año
            </div>
          </div>
        </div>
      </div>

      {/* Quick Monetized Link Generator Tool for SHEIN */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-5">
        <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
          <Link className="w-5 h-5 text-rose-600" />
          <div>
            <h3 className="font-['Playfair_Display',serif] text-xl font-bold text-stone-900">
              Generador Rápido de Enlace SHEIN Monetizado
            </h3>
            <p className="text-xs text-stone-500">
              Pega cualquier link de producto de shein.com.mx o escribe el nombre de la prenda para generar tu enlace de afiliado al instante.
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerateLink} className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs sm:text-sm">
          <div className="sm:col-span-4">
            <label className="block text-stone-700 font-bold mb-1">Línea o Colección SHEIN</label>
            <select
              value={genStore}
              onChange={(e: any) => setGenStore(e.target.value)}
              className="w-full py-2.5 px-3 bg-stone-50 border border-stone-200 rounded-xl font-medium"
            >
              <option value="Shein">SHEIN Principal</option>
              <option value="MOTF (Shein)">MOTF (Lujo & Clones Premium)</option>
              <option value="DAZY (Shein)">DAZY (Moda Coreana & Minimal)</option>
              <option value="GLOWMODE (Shein)">GLOWMODE (Athleisure & Fitness)</option>
              <option value="SHEIN Privé">SHEIN Privé (Gala & Noche)</option>
              <option value="SHEIN MOD">SHEIN MOD (Retro & Chic)</option>
              <option value="ROMWE">ROMWE (Streetwear & Y2K)</option>
              <option value="SHEIN Man">SHEIN Men (Hombre)</option>
            </select>
          </div>

          <div className="sm:col-span-5">
            <label className="block text-stone-700 font-bold mb-1">URL o Nombre de la Prenda</label>
            <input
              type="text"
              value={genUrl}
              onChange={(e) => setGenUrl(e.target.value)}
              placeholder="https://www.shein.com.mx/... o 'blazer lino motf'"
              className="w-full py-2.5 px-3.5 bg-stone-50 border border-stone-200 rounded-xl"
            />
          </div>

          <div className="sm:col-span-3 flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-colors cursor-pointer"
            >
              Generar Enlace
            </button>
          </div>
        </form>

        {generatedResult && (
          <div className="p-4 bg-rose-50/50 border border-rose-200 rounded-2xl space-y-2 animate-in fade-in">
            <span className="text-xs font-bold text-stone-700 block">Tu Enlace de Afiliado SHEIN Listo:</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={generatedResult}
                className="flex-1 px-3 py-2 bg-white border border-rose-200 rounded-xl font-mono text-xs text-stone-800 select-all"
              />
              <button
                onClick={copyGenerated}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
              >
                {copiedGen ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedGen ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Real-time Click Log Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <MousePointerClick className="w-5 h-5 text-stone-800" />
            <h3 className="font-['Playfair_Display',serif] text-xl font-bold text-stone-900">
              Historial de Clicks en SHEIN ({clickLogs.length})
            </h3>
          </div>
          {clickLogs.length > 0 && (
            <button
              onClick={onClearLogs}
              className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Limpiar Historial
            </button>
          )}
        </div>

        {clickLogs.length === 0 ? (
          <div className="text-center py-10 text-stone-400 text-xs">
            <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-40 text-stone-500" />
            No hay clicks registrados aún. Haz click en "Comprar en SHEIN" en cualquier conjunto para probar el registro de comisiones en tiempo real.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 font-semibold">
                  <th className="pb-2">Fecha / Hora</th>
                  <th className="pb-2">Prenda</th>
                  <th className="pb-2">Conjunto</th>
                  <th className="pb-2">Línea SHEIN</th>
                  <th className="pb-2">Precio</th>
                  <th className="pb-2 text-right">Comisión Estimada</th>
                  <th className="pb-2 text-center">Enlace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {clickLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-2.5 font-mono text-stone-500">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-2.5 font-semibold text-stone-900 max-w-[180px] truncate">{log.itemName}</td>
                    <td className="py-2.5 text-stone-600 max-w-[160px] truncate">{log.outfitTitle}</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-800 font-medium">
                        {log.store}
                      </span>
                    </td>
                    <td className="py-2.5 font-mono font-medium text-stone-900">{formatMXN(log.price)}</td>
                    <td className="py-2.5 font-mono font-bold text-emerald-700 text-right">
                      +{formatMXN(log.estimatedCommission)}
                    </td>
                    <td className="py-2.5 text-center">
                      <a
                        href={log.finalAffiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-stone-400 hover:text-stone-800 inline-block p-1"
                        title="Ver enlace monetizado en SHEIN"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
