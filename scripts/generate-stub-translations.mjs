#!/usr/bin/env node
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';
import matter from 'gray-matter';

const BLOG_DIR = path.resolve(process.cwd(), 'src/content/blog');
const DATE_PREFIX_RE = /^\d{4}-\d{2}-\d{2}-/;
const SO_SUFFIX_RE = /-so$/i;

const readMarkdownFiles = (dir) => {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...readMarkdownFiles(p));
    else if (e.isFile() && p.toLowerCase().endsWith('.md')) files.push(p);
  }
  return files;
};

const toBaseSlug = (filePath) => {
  const filename = path.basename(filePath).replace(/\.md$/i, '');
  const noDate = filename.replace(DATE_PREFIX_RE, '');
  return noDate.replace(SO_SUFFIX_RE, '');
};

const inferDatePrefix = (filePath) => {
  const filename = path.basename(filePath).replace(/\.md$/i, '');
  const m = filename.match(DATE_PREFIX_RE);
  return m ? m[0] : '';
};

const loadPost = (filePath) => {
  const raw = readFileSync(filePath, 'utf8');
  const parsed = matter(raw);
  return { filePath, ...parsed };
};

const savePost = (filePath, data, content) => {
  const out = matter.stringify(content, data);
  const dir = path.dirname(filePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(filePath, out, 'utf8');
};

const mapCategoryToEnglish = (category) => {
  const c = (category || '').trim();
  const map = new Map([
    ['Caafimaad', 'Health'],
    ['Barbaarinta Carruurta', 'Parenting'],
    ['Waxbarasho', 'Education'],
    ['Quraanka', 'Quran'],
    ['Magacyada Carruurta', 'Baby Names'],
  ]);
  return map.get(c) ?? c;
};

const mapCategoryToSomali = (category) => {
  const c = (category || '').trim();
  const map = new Map([
    ['Health', 'Caafimaad'],
    ['Parenting', 'Barbaarinta Carruurta'],
    ['Education', 'Waxbarasho'],
    ['Quran', 'Quraanka'],
    ['Baby Names', 'Magacyada Carruurta'],
  ]);
  return map.get(c) ?? c;
};

const main = () => {
  const allFiles = readMarkdownFiles(BLOG_DIR);
  const posts = allFiles.map(loadPost);
  const byBase = new Map();
  for (const p of posts) {
    const base = toBaseSlug(p.filePath);
    if (!byBase.has(base)) byBase.set(base, []);
    byBase.get(base).push(p);
  }

  let created = 0;
  for (const [base, group] of byBase.entries()) {
    const hasSo = group.some(p => (p.data.language || '').toLowerCase() === 'so' || SO_SUFFIX_RE.test(path.basename(p.filePath, '.md')));
    const hasEn = group.some(p => (p.data.language || '').toLowerCase() === 'en');

    // Create EN stub from SO if missing
    if (hasSo && !hasEn) {
      const soPost = group.find(p => (p.data.language || '').toLowerCase() === 'so')
        || group.find(p => SO_SUFFIX_RE.test(path.basename(p.filePath, '.md')));
      if (!soPost) continue;
      const datePrefix = inferDatePrefix(soPost.filePath);
      const enFileName = `${datePrefix}${base}.md`;
      const enFilePath = path.join(path.dirname(soPost.filePath), enFileName);

      const enData = { ...soPost.data };
      enData.language = 'en';
      enData.category = mapCategoryToEnglish(enData.category);
      // Mark as stub for editors to replace later
      enData.excerpt = enData.excerpt || '[AUTO-STUB] Needs translation to English';

      savePost(enFilePath, enData, soPost.content || '[AUTO-STUB] Needs translation to English');
      created += 1;

      const soSlug = path.basename(soPost.filePath).replace(/\.md$/i, '');
      const enSlug = enFileName.replace(/\.md$/i, '');
      const translations = { ...(soPost.data.translations || {}), en: enSlug, so: soSlug };
      savePost(soPost.filePath, { ...soPost.data, translations }, soPost.content || '');
      continue;
    }

    // Create SO stub from EN if missing
    if (hasEn && !hasSo) {
      const enPost = group.find(p => (p.data.language || '').toLowerCase() === 'en');
      if (!enPost) continue;
      const datePrefix = inferDatePrefix(enPost.filePath);
      const soFileName = `${datePrefix}${base}-so.md`;
      const soFilePath = path.join(path.dirname(enPost.filePath), soFileName);

      const soData = { ...enPost.data };
      soData.language = 'so';
      soData.category = mapCategoryToSomali(soData.category);
      soData.excerpt = soData.excerpt || '[AUTO-STUB] U baahan turjumaad Soomaali';

      savePost(soFilePath, soData, enPost.content || '[AUTO-STUB] U baahan turjumaad Soomaali');
      created += 1;

      const enSlug = path.basename(enPost.filePath).replace(/\.md$/i, '');
      const soSlug = soFileName.replace(/\.md$/i, '');
      const translationsEn = { ...(enPost.data.translations || {}), en: enSlug, so: soSlug };
      savePost(enPost.filePath, { ...enPost.data, translations: translationsEn }, enPost.content || '');

      const translationsSo = { ...(soData.translations || {}), en: enSlug, so: soSlug };
      savePost(soFilePath, { ...soData, translations: translationsSo }, enPost.content || '');
    }
  }

  // eslint-disable-next-line no-console
  console.log(`Stub translation generation completed. Created ${created} stub post(s).`);
};

main();


