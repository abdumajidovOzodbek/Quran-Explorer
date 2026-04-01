/**
 * Downloads all 114 surahs (Arabic + Uzbek + Russian + transliteration)
 * and writes them to assets/data/quran_all.json for bundling inside the APK.
 * Run once: node scripts/generate_quran_data.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_FILE = path.join(__dirname, "../assets/data/quran_all.json");

const QURAN_API = "https://quranapi.pages.dev/api";
const ALQURAN  = "https://api.alquran.cloud/v1";
const TOTAL    = 114;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url, attempt = 0) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (res.status === 429) {
      const wait = Math.min(5000 * (attempt + 1), 30000);
      console.log(`    [429] rate-limited, waiting ${wait / 1000}s → ${url}`);
      await sleep(wait);
      return get(url, attempt + 1);
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    if (attempt < 5) {
      await sleep(2000 * (attempt + 1));
      return get(url, attempt + 1);
    }
    console.warn(`    ✗ Giving up on ${url}: ${e.message}`);
    return null;
  }
}

// Load existing progress if script was interrupted
let existing = { surahList: [], surahs: {} };
if (fs.existsSync(OUT_FILE)) {
  try {
    existing = JSON.parse(fs.readFileSync(OUT_FILE, "utf8"));
    console.log(`Resuming — ${Object.keys(existing.surahs).length} surahs already done.`);
  } catch {}
}

// --- Surah list ---
if (!existing.surahList || existing.surahList.length < 114) {
  console.log("Fetching surah list…");
  const raw = await get(`${QURAN_API}/surah.json`);
  if (raw) {
    existing.surahList = raw.map((s, i) => ({ ...s, surahNo: i + 1 }));
    console.log(`  ✓ ${existing.surahList.length} surahs in list`);
  }
}

// --- Individual surahs ---
for (let n = 1; n <= TOTAL; n++) {
  const key = String(n);
  const s = existing.surahs[key];
  if (s && s.arabic1?.length && s.uzbek?.length && s.russian?.length && s.transliteration?.length) {
    process.stdout.write(`  ✓ ${n} already complete\n`);
    continue;
  }

  console.log(`Downloading surah ${n}/${TOTAL}…`);

  const main = await get(`${QURAN_API}/${n}.json`);
  if (!main) { console.warn(`  ✗ Skipping ${n} (main fetch failed)`); continue; }
  await sleep(300);

  const uzData = await get(`${ALQURAN}/surah/${n}/uz.sodik`);
  const uzbek = uzData?.data?.ayahs?.map((a) => a.text) ?? [];
  await sleep(300);

  const ruData = await get(`${ALQURAN}/surah/${n}/ru.kuliev`);
  const russian = ruData?.data?.ayahs?.map((a) => a.text) ?? [];
  await sleep(300);

  const trData = await get(`${ALQURAN}/surah/${n}/en.transliteration`);
  const transliteration = trData?.data?.ayahs?.map((a) => a.text) ?? [];
  await sleep(300);

  // Strip unused heavy fields (audio URLs bloat the file; they're built at runtime)
  const { audio, ...rest } = main;

  existing.surahs[key] = { ...rest, surahNo: n, uzbek, russian, transliteration };

  // Save progress after every surah so we can resume on interruption
  fs.writeFileSync(OUT_FILE, JSON.stringify(existing));
  console.log(
    `  ✓ ${n} saved  arabic=${main.arabic1?.length} uzbek=${uzbek.length} ru=${russian.length} translit=${transliteration.length}`
  );
}

// Final write
fs.writeFileSync(OUT_FILE, JSON.stringify(existing));
const sizeMB = (fs.statSync(OUT_FILE).size / 1_000_000).toFixed(2);
console.log(`\n✅ Done! quran_all.json = ${sizeMB} MB`);
console.log(`   Location: ${OUT_FILE}`);
