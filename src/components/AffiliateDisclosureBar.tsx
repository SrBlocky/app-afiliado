import React from 'react';
import { Info, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';
import { AffiliateConfig } from '../types';

interface AffiliateDisclosureBarProps {
  config: AffiliateConfig;
  onOpenHub: () => void;
}

export const AffiliateDisclosureBar: React.FC<AffiliateDisclosureBarProps> = ({
  config,
  onOpenHub,
}) => {
  return (
    <div className="bg-amber-50/80 border-b border-amber-200/70 text-amber-950 px-4 py-2.5 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-stone-700">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Aviso de Transparencia de Afiliados:</strong> Cuando los usuarios compran prendas recomendadas en SHEIN México a través de tus enlaces, ganas entre un <strong>10% y 15%</strong> de comisión de afiliado.
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="bg-rose-100/90 text-rose-900 px-2 py-0.5 rounded font-mono text-[11px] border border-rose-300">
            SHEIN ID: {config.sheinId || 'Sin configurar'}
          </span>
          <button
            onClick={onOpenHub}
            className="font-semibold text-rose-800 hover:text-rose-950 underline flex items-center gap-1 cursor-pointer"
          >
            Configurar Monetización <TrendingUp className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
