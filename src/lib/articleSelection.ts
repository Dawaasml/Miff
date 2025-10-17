import type { BlogPost } from "@/lib/contentLoader";

// Normalize localized category names to stable route slugs
export function getCategorySlug(name: string): string {
  const n = (name || '').trim().toLowerCase();
  const map: Record<string, string> = {
    'health': 'health',
    'caafimaad': 'health',
    'parenting': 'parenting',
    'barbaarinta carruurta': 'parenting',
    'education': 'education',
    'waxbarasho': 'education',
    'quran': 'quran',
    'quraanka': 'quran',
    'baby names': 'baby-names',
    'magacyada carruurta': 'baby-names',
  };
  return map[n] ?? n.replace(/\s+/g, '-');
}

function canonicalKeyFor(post: BlogPost): string {
  const linked = post.translations ? Object.values(post.translations) : [];
  const group = [post.slug, ...linked].map(s => s.replace(/-so$/i, ''));
  return group.sort()[0];
}

// Return exactly one item per canonical group, preferring the requested language,
// then a mapped translation if present in the dataset, otherwise fallback to 'en',
// and finally any available version. Sorting is newest-first by date.
export function selectCanonicalPerLanguage(posts: BlogPost[], language: string): BlogPost[] {
  const slugToPost = new Map<string, BlogPost>();
  for (const p of posts) slugToPost.set(p.slug, p);

  const byCanonical = new Map<string, BlogPost[]>();
  for (const p of posts) {
    const key = canonicalKeyFor(p);
    if (!byCanonical.has(key)) byCanonical.set(key, []);
    byCanonical.get(key)!.push(p);
  }

  const selected: BlogPost[] = [];
  for (const [, group] of byCanonical.entries()) {
    // Prefer exact language
    const exact = group.find(g => g.language === language);
    if (exact) {
      selected.push(exact);
      continue;
    }
    // Prefer mapped translation if present and exists in dataset
    const anyWithMapping = group.find(g => g.translations && g.translations[language]);
    if (anyWithMapping) {
      const mappedSlug = anyWithMapping.translations![language];
      const mapped = slugToPost.get(mappedSlug);
      if (mapped) {
        selected.push(mapped);
        continue;
      }
    }
    // Fallback to English if available
    const en = group.find(g => g.language === 'en');
    if (en) {
      selected.push(en);
      continue;
    }
    // Last resort: first available
    selected.push(group[0]);
  }

  selected.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return selected;
}

export function selectCategoryPosts(posts: BlogPost[], categorySlug: string, language: string): BlogPost[] {
  const filtered = posts.filter(p => getCategorySlug(p.category) === categorySlug);
  return selectCanonicalPerLanguage(filtered, language);
}


