/**
 * Search and product matching utilities for Lemon House Craft.
 * Supports:
 * - Exact and partial product names
 * - Product keywords, description, tags, materials, and category names
 * - Case-insensitive matching
 * - Spelling normalization (mould/mold, colour/color, jewellery/jewelry, etc.)
 * - Multi-word tokenized matching (e.g. "Christmas Mould" matches "Christmas Silicone Mold")
 * - Relevancy scoring and ranking
 */

/**
 * Normalizes a string for search matching:
 * - Converts to lower case
 * - Strips apostrophes and extraneous punctuation
 * - Normalizes British / American spelling variations (mould -> mold, etc.)
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
  const normTokens = rawTokens.map(normalizeSearchTerm);

  if (rawTokens.length === 0) {
    return { matches: true, score: 0 };
  }

  const nameRaw = (product.name || "").toLowerCase();
  const nameNorm = normalizeSearchTerm(nameRaw);

  const catRaw = (
    product.categoryName ||
    (typeof product.category === "object" ? product.category?.name : product.category) ||
    ""
  ).toLowerCase();
  const catNorm = normalizeSearchTerm(catRaw);

  const subCatRaw = (product.subcategory || product.subCategory || "").toLowerCase();
  const subCatNorm = normalizeSearchTerm(subCatRaw);

  const descRaw = (product.description || product.shortDescription || "").toLowerCase();
  const descNorm = normalizeSearchTerm(descRaw);

  const tagsRaw = (
    Array.isArray(product.tags) ? product.tags.join(" ") : (product.tags || "")
  ).toLowerCase();
  const tagsNorm = normalizeSearchTerm(tagsRaw);

  const materialsRaw = (
    Array.isArray(product.materials) ? product.materials.join(" ") : (product.materials || "")
  ).toLowerCase();
  const materialsNorm = normalizeSearchTerm(materialsRaw);

  const brandRaw = (product.brand || "").toLowerCase();

  // 1. Exact Name Match (Highest priority)
  if (nameRaw === queryRaw || nameNorm === queryNorm) {
    return { matches: true, score: 1000 };
  }

  // 2. Full phrase in Product Name
  if (nameRaw.includes(queryRaw) || nameNorm.includes(queryNorm)) {
    return { matches: true, score: 600 };
  }

  // 3. Full phrase in Category or Subcategory
  if (catRaw === queryRaw || catNorm === queryNorm) {
    return { matches: true, score: 450 };
  }
  if (catRaw.includes(queryRaw) || catNorm.includes(queryNorm)) {
    return { matches: true, score: 400 };
  }
  if (subCatRaw.includes(queryRaw) || subCatNorm.includes(queryNorm)) {
    return { matches: true, score: 380 };
  }

  // 4. Token-based matching
  // Every token must match in at least one attribute
  let allTokensMatched = true;
  let tokenScore = 0;
  let nameMatchCount = 0;
  let catMatchCount = 0;

  for (let i = 0; i < rawTokens.length; i++) {
    const t = rawTokens[i];
    const nt = normTokens[i];

    const inName = nameRaw.includes(t) || nameNorm.includes(nt);
    const inCat =
      catRaw.includes(t) ||
      catNorm.includes(nt) ||
      subCatRaw.includes(t) ||
      subCatNorm.includes(nt);
    const inTags = tagsRaw.includes(t) || tagsNorm.includes(nt);
    const inMaterials = materialsRaw.includes(t) || materialsNorm.includes(nt);
    const inDesc = descRaw.includes(t) || descNorm.includes(nt);
    const inBrand = brandRaw.includes(t);

    if (inName) {
      nameMatchCount++;
      tokenScore += 120;
    } else if (inCat) {
      catMatchCount++;
      tokenScore += 70;
    } else if (inTags) {
      tokenScore += 45;
    } else if (inMaterials) {
      tokenScore += 35;
    } else if (inDesc) {
      tokenScore += 20;
    } else if (inBrand) {
      tokenScore += 15;
    } else {
      allTokensMatched = false;
      break;
    }
  }

  if (allTokensMatched) {
    // Relevance boost if words appear together in title and category
    if (nameMatchCount > 0 && catMatchCount > 0) {
      tokenScore += 60;
    }
    // Boost if multiple tokens matched in the product title
    if (nameMatchCount >= 2) {
      tokenScore += 50 * nameMatchCount;
    }
    return { matches: true, score: tokenScore };
  }

  // For longer queries (3+ tokens), match if at least 70% of tokens match name or category
  if (rawTokens.length >= 3) {
    let matchedCount = 0;
    let partialScore = 0;
    for (let i = 0; i < rawTokens.length; i++) {
      const t = rawTokens[i];
      const nt = normTokens[i];
      if (nameRaw.includes(t) || nameNorm.includes(nt)) {
        matchedCount++;
        partialScore += 40;
      } else if (catRaw.includes(t) || catNorm.includes(nt)) {
        matchedCount++;
        partialScore += 25;
      }
    }
    if (matchedCount >= 2 && matchedCount >= Math.ceil(rawTokens.length * 0.7)) {
      return { matches: true, score: partialScore };
    }
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
