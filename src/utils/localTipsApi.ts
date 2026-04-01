/**
 * Local Tips API — Supabase-backed place-based experience sharing
 *
 * Stores user tips/experiences tagged with a place name.
 * Uses Supabase `local_tips` table with localStorage as fallback
 * when Supabase is unavailable.
 */
import { supabase } from '@/integrations/supabase/client';

export interface StoredTip {
  id: string;
  place_name: string;
  place_name_normalized: string;
  content: string;
  author: string;
  category: string;
  likes: number;
  created_at: string;
}

/**
 * Normalize a place name for consistent lookups
 * e.g. "Borivali West" → "borivali west"
 */
function normalizePlaceName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

// ─── localStorage helpers (fallback) ───

const LS_KEY = 'local_tips_store';

function getLocalStoreTips(): StoredTip[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalStoreTips(tips: StoredTip[]): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(tips));
  } catch { /* ignore quota errors */ }
}

// ─── Public API ───

/**
 * Fetch tips for a specific place (case-insensitive partial match).
 * First tries Supabase, falls back to localStorage.
 */
export async function fetchTipsForPlace(placeName: string): Promise<StoredTip[]> {
  const normalized = normalizePlaceName(placeName);
  if (!normalized) return [];

  // Try Supabase first
  try {
    const { data, error } = await supabase
      .from('local_tips')
      .select('*')
      .ilike('place_name_normalized', `%${normalized}%`)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data && data.length > 0) {
      return data as StoredTip[];
    }
    // If Supabase returns 0 results, also check localStorage (could be offline)
    if (!error && data) {
      // Supabase worked but no results — check localStorage too
      const localTips = getLocalStoreTips().filter(t =>
        t.place_name_normalized.includes(normalized)
      );
      return localTips;
    }
  } catch (err) {
    console.warn('Supabase local_tips fetch failed, using localStorage:', err);
  }

  // Fallback to localStorage
  return getLocalStoreTips()
    .filter(t => t.place_name_normalized.includes(normalized))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

/**
 * Add a new tip for a place.
 * Saves to both Supabase and localStorage (for offline resilience).
 */
export async function addTip(
  placeName: string,
  content: string,
  author: string,
  category: string = 'general'
): Promise<StoredTip | null> {
  const normalized = normalizePlaceName(placeName);

  const tip: StoredTip = {
    id: crypto.randomUUID?.() || Date.now().toString(),
    place_name: placeName.trim(),
    place_name_normalized: normalized,
    content: content.trim(),
    author: author.trim(),
    category,
    likes: 0,
    created_at: new Date().toISOString(),
  };

  // Save to localStorage immediately (offline-first)
  const localTips = getLocalStoreTips();
  localTips.unshift(tip);
  saveLocalStoreTips(localTips);

  // Try to save to Supabase as well
  try {
    const { data, error } = await supabase
      .from('local_tips')
      .insert({
        place_name: tip.place_name,
        place_name_normalized: tip.place_name_normalized,
        content: tip.content,
        author: tip.author,
        category: tip.category,
        likes: 0,
      })
      .select()
      .single();

    if (!error && data) {
      // Update the tip with Supabase-generated ID
      tip.id = data.id;
      return data as StoredTip;
    }
    console.warn('Supabase insert failed (tip saved locally):', error?.message);
  } catch (err) {
    console.warn('Supabase insert error (tip saved locally):', err);
  }

  return tip;
}

/**
 * Like a tip — increment the likes counter
 */
export async function likeTip(tipId: string): Promise<void> {
  // Update localStorage
  const localTips = getLocalStoreTips();
  const idx = localTips.findIndex(t => t.id === tipId);
  if (idx >= 0) {
    localTips[idx].likes += 1;
    saveLocalStoreTips(localTips);
  }

  // Try Supabase RPC or update
  try {
    // First get current likes
    const { data } = await supabase
      .from('local_tips')
      .select('likes')
      .eq('id', tipId)
      .single();

    if (data) {
      await supabase
        .from('local_tips')
        .update({ likes: (data.likes || 0) + 1 })
        .eq('id', tipId);
    }
  } catch {
    // Silently fail — localStorage already updated
  }
}

/**
 * Extract a meaningful place name from the weather location string.
 * e.g. "Mumbai, Maharashtra" → "Mumbai"
 */
export function extractPlaceName(location: string): string {
  const parts = location.split(',').map(p => p.trim());
  return parts[0] || location;
}
