/**
 * Stemming & spelling variation normalization for craft e-commerce terms.
 */
export function normalizeWord(word) {
  if (!word) return "";
  let w = word.toLowerCase().trim().replace(/[^a-z0-9]/g, "");

  // Common craft synonyms and spelling variations
  if (w === "mould" || w === "moulds" || w === "mold" || w === "molds") return "mold";
  if (w === "colour" || w === "colours" || w === "color" || w === "colors") return "color";
  if (w === "jewellery" || w === "jewelry" || w === "jewelries" || w === "jewel" || w === "jewels") return "jewelry";
  if (w === "flavour" || w === "flavours" || w === "flavor" || w === "flavors") return "flavor";
  if (w === "silicon" || w === "silicone" || w === "silicones") return "silicone";
  if (w === "fragrance" || w === "fragrances" || w === "scent" || w === "scents" || w === "aroma" || w === "perfume" || w === "perfumes") return "fragrance";
  if (w === "wax" || w === "waxes") return "wax";
  if (w === "candle" || w === "candles") return "candle";
  if (w === "tool" || w === "tools" || w === "tooling") return "tool";
  if (w === "pigment" || w === "pigments") return "pigment";
  if (w === "resin" || w === "resins" || w === "epoxy") return "resin";
  if (w === "bead" || w === "beads") return "bead";
  if (w === "kit" || w === "kits") return "kit";
  if (w === "set" || w === "sets") return "set";
  if (w === "flower" || w === "flowers") return "flower";
  if (w === "glitter" || w === "glitters") return "glitter";
  if (w === "ribbon" || w === "ribbons") return "ribbon";
  if (w === "clay" || w === "clays") return "clay";
  if (w === "clock" || w === "clocks") return "clock";
  if (w === "marker" || w === "markers") return "marker";
  if (w === "number" || w === "numbers") return "number";
  if (w === "paint" || w === "paints" || w === "painting") return "paint";
  if (w === "brush" || w === "brushes") return "brush";
  if (w === "lacquer" || w === "lacquers") return "lacquer";
  if (w === "varnish" || w === "varnishes") return "varnish";
  if (w === "jesmonite" || w === "jesmonites") return "jesmonite";
  if (w === "sticker" || w === "stickers") return "sticker";
  if (w === "sheet" || w === "sheets") return "sheet";

  // General English singularization rules
  if (w.endsWith("ies") && w.length > 4) return w.slice(0, -3) + "y";
  if (w.endsWith("es") && w.length > 4 && (w.endsWith("shes") || w.endsWith("ches") || w.endsWith("sses") || w.endsWith("xes"))) {
    return w.slice(0, -2);
  }
  if (w.endsWith("s") && !w.endsWith("ss") && w.length > 3) {
    return w.slice(0, -1);
  }
  return w;
}

/**
 * Normalizes a full text string for search comparison.
 */
export function normalizeSearchTerm(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/\bmoulds?\b/g, "mold")
    .replace(/\bcolours?\b/g, "color")
    .replace(/\bjewellery\b/g, "jewelry")
    .replace(/\bflavours?\b/g, "flavor")
    .replace(/\bfragrances?\b|\bscents?\b|\baroma\b|\bperfumes?\b/g, "fragrance")
    .replace(/\bsilicones?\b/g, "silicone")
    .replace(/\bcandles?\b/g, "candle")
    .replace(/\bwaxes\b/g, "wax")
    .replace(/\btools?\b/g, "tool")
    .replace(/\bpigments?\b/g, "pigment")
    .replace(/\bresins?\b|\bepoxy\b/g, "resin")
    .replace(/\bbeads?\b/g, "bead")
    .replace(/\bclocks?\b/g, "clock")
    .replace(/\bnumbers?\b/g, "number")
    .replace(/\bpaints?\b/g, "paint")
    .replace(/\bstickers?\b/g, "sticker")
    .replace(/\bsheets?\b/g, "sheet")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Splits a search query into non-empty search tokens.
 */
export function tokenizeQuery(query) {
  if (!query) return [];
  return query
    .toLowerCase()
    .split(/[\s,+/_\-&|#]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

/**
 * Scores a product against a search query.
 * Returns { matches: boolean, score: number }.
 */
export function scoreProductSearch(product, query) {
  if (!query || !query.trim()) {
    return { matches: true, score: 0 };
  }

  const queryRaw = query.toLowerCase().trim();
  const queryNorm = normalizeSearchTerm(queryRaw);
  const rawTokens = tokenizeQuery(queryRaw);
  const normTokens = rawTokens.map(normalizeWord);

  if (rawTokens.length === 0) {
    return { matches: true, score: 0 };
  }

  const nameRaw = (product.name || "").toLowerCase();
  const nameNorm = normalizeSearchTerm(nameRaw);
  const nameWords = tokenizeQuery(nameRaw).map(normalizeWord);

  const catRaw = (
    product.categoryName ||
    (typeof product.category === "object" ? product.category?.name : product.category) ||
    ""
  ).toLowerCase();
  const catNorm = normalizeSearchTerm(catRaw);
  const catWords = tokenizeQuery(catRaw).map(normalizeWord);

  const subCatRaw = (product.subcategory || product.subCategory || "").toLowerCase();
  const subCatNorm = normalizeSearchTerm(subCatRaw);
  const subCatWords = tokenizeQuery(subCatRaw).map(normalizeWord);

  const descRaw = (product.description || product.shortDescription || "").toLowerCase();
  const descNorm = normalizeSearchTerm(descRaw);
  const descWords = tokenizeQuery(descRaw).map(normalizeWord);

  const tagsRaw = (
    Array.isArray(product.tags) ? product.tags.join(" ") : (product.tags || "")
  ).toLowerCase();
  const tagsWords = tokenizeQuery(tagsRaw).map(normalizeWord);

  const materialsRaw = (
    Array.isArray(product.materials) ? product.materials.join(" ") : (product.materials || "")
  ).toLowerCase();
  const materialsWords = tokenizeQuery(materialsRaw).map(normalizeWord);

  const brandRaw = (product.brand || "").toLowerCase();

  // 1. Exact Name Match (Highest priority)
  if (nameRaw === queryRaw || nameNorm === queryNorm) {
    return { matches: true, score: 10000 };
  }

  // 2. Name starts with query
  if (nameRaw.startsWith(queryRaw) || nameNorm.startsWith(queryNorm)) {
    return { matches: true, score: 8000 };
  }

  // 3. Full phrase in Product Name
  if (nameRaw.includes(queryRaw) || nameNorm.includes(queryNorm)) {
    return { matches: true, score: 6000 };
  }

  // 4. Exact Category or Subcategory Match
  if (catRaw === queryRaw || catNorm === queryNorm) {
    return { matches: true, score: 5000 };
  }
  if (subCatRaw === queryRaw || subCatNorm === queryNorm) {
    return { matches: true, score: 4500 };
  }

  // 5. Full phrase in Category or Subcategory
  if (catRaw.includes(queryRaw) || catNorm.includes(queryNorm)) {
    return { matches: true, score: 4000 };
  }
  if (subCatRaw.includes(queryRaw) || subCatNorm.includes(queryNorm)) {
    return { matches: true, score: 3800 };
  }

  // 6. Token matching: ALL query tokens must match the product
  let allTokensMatched = true;
  let tokenScore = 0;
  let nameMatchCount = 0;
  let catMatchCount = 0;

  for (let i = 0; i < rawTokens.length; i++) {
    const raw = rawTokens[i];
    const norm = normTokens[i];

    const inNameExact = nameWords.includes(norm) || nameWords.includes(raw);
    const inNamePartial =
      inNameExact ||
      (norm.length >= 3 && nameWords.some((w) => w.startsWith(norm))) ||
      (raw.length >= 3 && nameRaw.includes(raw));

    const inCatExact =
      catWords.includes(norm) ||
      catWords.includes(raw) ||
      subCatWords.includes(norm) ||
      subCatWords.includes(raw);

    const inCatPartial =
      inCatExact ||
      (norm.length >= 3 && (catNorm.includes(norm) || subCatNorm.includes(norm)));

    const inTags =
      tagsWords.includes(norm) ||
      tagsWords.includes(raw) ||
      (norm.length >= 3 && (tagsRaw.includes(raw) || tagsRaw.includes(norm)));

    const inMaterials =
      materialsWords.includes(norm) ||
      materialsWords.includes(raw) ||
      (norm.length >= 3 && (materialsRaw.includes(raw) || materialsRaw.includes(norm)));

    const inDesc =
      descWords.includes(norm) ||
      descWords.includes(raw) ||
      (norm.length >= 4 && descRaw.includes(raw));

    const inBrand = brandRaw.includes(raw) || brandRaw.includes(norm);

    if (inNameExact) {
      nameMatchCount++;
      tokenScore += 300;
    } else if (inNamePartial) {
      nameMatchCount++;
      tokenScore += 200;
    } else if (inCatExact) {
      catMatchCount++;
      tokenScore += 180;
    } else if (inCatPartial) {
      catMatchCount++;
      tokenScore += 120;
    } else if (inTags) {
      tokenScore += 80;
    } else if (inMaterials) {
      tokenScore += 60;
    } else if (inDesc) {
      tokenScore += 30;
    } else if (inBrand) {
      tokenScore += 20;
    } else {
      allTokensMatched = false;
      break;
    }
  }

  if (allTokensMatched) {
    // Relevance boost if words appear together in title and category
    if (nameMatchCount > 0 && catMatchCount > 0) {
      tokenScore += 150;
    }
    // Boost if multiple tokens matched in the product title
    if (nameMatchCount >= 2) {
      tokenScore += 100 * nameMatchCount;
    }
    return { matches: true, score: tokenScore };
  }

  return { matches: false, score: 0 };
}

/**
 * Filters and ranks a list of products by a search query.
 */
export function filterAndRankProducts(products, query) {
  if (!Array.isArray(products) || products.length === 0) return [];
  if (!query || !query.trim()) return [...products];

  const scored = [];
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    if (!p) continue;
    const { matches, score } = scoreProductSearch(p, query);
    if (matches) {
      scored.push({ product: p, score, originalIndex: i });
    }
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.originalIndex - b.originalIndex;
  });

  return scored.map((item) => item.product);
}
