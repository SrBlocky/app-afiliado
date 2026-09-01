import { AffiliateConfig, AffiliateClickLog, ClothingItem, StoreName } from '../types';

export const DEFAULT_AFFILIATE_CONFIG: AffiliateConfig = {
  sheinId: 'shein_alex_mx',
  sheinPromoCode: 'SHEIN15',
  sheinReferralLink: 'https://shein.top/outfitclones',
  customUtmSource: 'shein_clones_app',
  customUtmCampaign: 'outfits_mexico',
  defaultCommissionRate: 10.0, // 10% standard SHEIN Publisher Program commission
  payoutCurrency: 'MXN',
};

const AFFILIATE_CONFIG_STORAGE_KEY = 'shein_clones_affiliate_config_v3';
const AFFILIATE_CLICKS_STORAGE_KEY = 'shein_clones_affiliate_clicks_v3';
const SAVED_OUTFITS_STORAGE_KEY = 'shein_clones_saved_outfits_v3';

export function formatMXN(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getAffiliateConfig(): AffiliateConfig {
  try {
    const raw = localStorage.getItem(AFFILIATE_CONFIG_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_AFFILIATE_CONFIG, ...JSON.parse(raw) };
    }
  } catch {
    // fallback
  }
  return DEFAULT_AFFILIATE_CONFIG;
}

export function saveAffiliateConfig(config: AffiliateConfig): void {
  try {
    localStorage.setItem(AFFILIATE_CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Error saving affiliate config:', err);
  }
}

/**
 * Builds a monetized affiliate URL for SHEIN items & collections
 */
export function buildAffiliateUrl(
  rawUrl: string,
  store: StoreName = 'Shein',
  itemName: string = '',
  config: AffiliateConfig = getAffiliateConfig()
): string {
  if (!rawUrl || rawUrl.trim() === '') {
    return buildStoreSearchUrl(store, itemName, config);
  }

  try {
    const url = new URL(rawUrl);

    // If it's a SHEIN link or shein.top, append user's affiliate parameters
    if (config.sheinId) {
      url.searchParams.set('aff_id', config.sheinId);
      url.searchParams.set('url_from', config.sheinId);
    }

    // Append standard analytics & attribution tags
    if (config.customUtmSource) {
      url.searchParams.set('utm_source', config.customUtmSource);
    }
    if (config.customUtmCampaign) {
      url.searchParams.set('utm_campaign', config.customUtmCampaign);
    }
    url.searchParams.set('utm_medium', 'affiliate');
    if (itemName) {
      url.searchParams.set('utm_content', encodeURIComponent(itemName.substring(0, 30)));
    }
    url.searchParams.set('ref', 'www');
    url.searchParams.set('rep', 'dir');
    url.searchParams.set('ret', 'mx');

    return url.toString();
  } catch {
    return buildStoreSearchUrl(store, itemName, config);
  }
}

export function buildStoreSearchUrl(
  _store: StoreName,
  query: string,
  config: AffiliateConfig = getAffiliateConfig()
): string {
  const q = encodeURIComponent(query.trim());
  const affId = encodeURIComponent(config.sheinId || 'shein_alex_mx');
  const utmSource = encodeURIComponent(config.customUtmSource || 'shein_clones_app');
  const utmCampaign = encodeURIComponent(config.customUtmCampaign || 'outfits_mexico');
  
  return `https://www.shein.com.mx/pdsearch/${q}/?aff_id=${affId}&url_from=${affId}&utm_source=${utmSource}&utm_campaign=${utmCampaign}&utm_medium=affiliate&ref=www&rep=dir&ret=mx`;
}

/**
 * Tracks an affiliate click and stores in local log history
 */
export function trackAffiliateClick(
  item: ClothingItem,
  outfitId: string,
  outfitTitle: string,
  customUrl?: string
): AffiliateClickLog {
  const config = getAffiliateConfig();
  const finalUrl = customUrl || buildAffiliateUrl(item.buyUrl, item.store, item.name, config);
  const commRate = item.commissionRatePct || config.defaultCommissionRate || 8.0;
  const estimatedCommission = Number(((item.price * commRate) / 100).toFixed(2));

  const log: AffiliateClickLog = {
    id: 'clk_' + Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toISOString(),
    outfitId,
    outfitTitle,
    itemId: item.id,
    itemName: item.name,
    store: item.store,
    price: item.price,
    estimatedCommission,
    finalAffiliateUrl: finalUrl,
  };

  try {
    const existing = getAffiliateClickLogs();
    const updated = [log, ...existing].slice(0, 200); // keep last 200 clicks
    localStorage.setItem(AFFILIATE_CLICKS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error logging click:', err);
  }

  return log;
}

export function getAffiliateClickLogs(): AffiliateClickLog[] {
  try {
    const raw = localStorage.getItem(AFFILIATE_CLICKS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return [];
}

export function clearAffiliateClickLogs(): void {
  try {
    localStorage.removeItem(AFFILIATE_CLICKS_STORAGE_KEY);
  } catch {
    // fallback
  }
}

export function getSavedOutfitIds(): string[] {
  try {
    const raw = localStorage.getItem(SAVED_OUTFITS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return [];
}

export function toggleSaveOutfit(outfitId: string): string[] {
  try {
    const saved = getSavedOutfitIds();
    const exists = saved.includes(outfitId);
    const updated = exists ? saved.filter((id) => id !== outfitId) : [...saved, outfitId];
    localStorage.setItem(SAVED_OUTFITS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}
