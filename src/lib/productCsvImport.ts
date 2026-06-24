export const PRODUCT_IMPORT_HEADERS = [
  "title",
  "description",
  "long_description",
  "property_type",
  "featured_slug",
  "price",
  "currency",
  "location",
  "city",
  "country",
  "images",
  "status",
  "featured",
  "institution_slugs",
] as const;

export type ProductImportHeader = (typeof PRODUCT_IMPORT_HEADERS)[number];
export const PRODUCT_IMPORT_IGNORE_HEADER = "__ignore__" as const;
export type ProductImportHeaderDecision = ProductImportHeader | typeof PRODUCT_IMPORT_IGNORE_HEADER;

export const PRODUCT_IMPORT_HEADER_LABELS: Record<ProductImportHeader, string> = {
  title: "Product Name",
  description: "Description",
  long_description: "Long Description",
  property_type: "Category",
  featured_slug: "Featured subcategory",
  price: "Price",
  currency: "Currency",
  location: "SKU / Model",
  city: "Warehouse",
  country: "Country",
  images: "Images",
  status: "Status",
  featured: "Featured",
  institution_slugs: "Institutions",
};

export const PRODUCT_IMPORT_TEMPLATE_HEADERS = PRODUCT_IMPORT_HEADERS.map(
  (header) => PRODUCT_IMPORT_HEADER_LABELS[header],
);

export const PRODUCT_IMPORT_HEADER_EXAMPLES = PRODUCT_IMPORT_HEADERS.map(
  (header) => `${PRODUCT_IMPORT_HEADER_LABELS[header]} (${header})`,
);

export const REQUIRED_PRODUCT_IMPORT_HEADERS = ["title", "property_type", "price"] as const;

const PRODUCT_IMPORT_CURRENCIES = ["USD", "ZWG"] as const;
const PRODUCT_IMPORT_CITIES = ["Harare", "Bulawayo", "Both"] as const;
const PRODUCT_IMPORT_COUNTRIES = ["Zimbabwe"] as const;
const PRODUCT_IMPORT_STATUSES = ["approved", "pending", "rejected"] as const;

export type ExistingProductForImport = {
  title?: string | null;
  property_type?: string | null;
  featured_slug?: string | null;
  location?: string | null;
};

export type KnownFeaturedSlugForImport = string | {
  category: string;
  slug: string;
};

export type ProductImportPayload = {
  title: string;
  description: string | null;
  long_description: string | null;
  property_type: string;
  featured_slug: string | null;
  price: number;
  currency: string;
  location: string | null;
  city: string;
  country: string;
  images: string[];
  status: string;
  featured: boolean;
  institution_slugs: string[];
  bedrooms: number;
  bathrooms: number;
  area_sqft: number;
};

export type ProductCsvValidRow = {
  rowNumber: number;
  key: string;
  payload: ProductImportPayload;
};

export type ProductCsvImportError = {
  rowNumber: number | null;
  message: string;
};

export type ProductCsvHeaderMatchType =
  | "database"
  | "form-label"
  | "alias"
  | "manual"
  | "ignored"
  | "unmatched";

export type ProductCsvHeaderInterpretation = {
  rawHeader: string;
  header: ProductImportHeader | null;
  matchType: ProductCsvHeaderMatchType;
  suggestedHeader: ProductImportHeader | null;
  confidence: number;
  sampleValues: string[];
};

export type ProductCsvImportResult = {
  headers: string[];
  interpretations: ProductCsvHeaderInterpretation[];
  ignoredHeaders: string[];
  rowCount: number;
  validRows: ProductCsvValidRow[];
  errors: ProductCsvImportError[];
};

export type ProductCsvHeaderAnalysis = {
  headers: string[];
  interpretations: ProductCsvHeaderInterpretation[];
  unresolvedHeaders: ProductCsvHeaderInterpretation[];
  ignoredHeaders: string[];
  rowCount: number;
  errors: ProductCsvImportError[];
};

export type ProductCsvValidationOptions = {
  headerMappings?: Partial<Record<string, ProductImportHeaderDecision>>;
  knownInstitutionSlugs?: readonly string[];
};

const normalizeComparable = (value: unknown) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const productKey = (title: unknown, category: unknown, location: unknown) =>
  [title, category, location].map(normalizeComparable).join("|");

const getKnownCategoryMap = (knownCategories: readonly string[] = []) => {
  const categoryMap = new Map<string, string>();

  knownCategories.forEach((category) => {
    categoryMap.set(normalizeComparable(category), category);
  });

  return categoryMap;
};

const getKnownValue = (values: readonly string[], value: string) =>
  values.find((option) => normalizeComparable(option) === normalizeComparable(value));

const getKnownFeaturedLookup = (knownFeaturedSlugs: readonly KnownFeaturedSlugForImport[]) => {
  const globalSlugs = new Set<string>();
  const categorySlugs = new Map<string, Set<string>>();

  knownFeaturedSlugs.forEach((item) => {
    if (typeof item === "string") {
      globalSlugs.add(normalizeComparable(item));
      return;
    }

    const categoryKey = normalizeComparable(item.category);
    const slugKey = normalizeComparable(item.slug);
    if (!categoryKey || !slugKey) return;

    globalSlugs.add(slugKey);
    categorySlugs.set(categoryKey, categorySlugs.get(categoryKey) || new Set<string>());
    categorySlugs.get(categoryKey)?.add(slugKey);
  });

  return { categorySlugs, globalSlugs };
};

const parseBoolean = (value: string) => {
  const normalized = normalizeComparable(value);
  if (!normalized) return { value: false, error: null };
  if (["true", "yes", "y", "1", "featured"].includes(normalized)) return { value: true, error: null };
  if (["false", "no", "n", "0", "not featured"].includes(normalized)) return { value: false, error: null };
  return { value: false, error: "featured must be true or false" };
};

const parsePrice = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return { value: 0, error: "price is required" };

  const normalized = trimmed.replace(/[$,\s]/g, "");
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) {
    return { value: 0, error: "price must be a number" };
  }

  const price = Number(normalized);
  if (!Number.isFinite(price) || price < 0) return { value: 0, error: "price must be zero or greater" };
  return { value: price, error: null };
};

const parseImages = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return { value: [] as string[], errors: [] as string[] };

  let rawImages: string[] = [];
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) rawImages = parsed.map(String);
    } catch {
      return { value: [] as string[], errors: ["images must be pipe-separated URLs or a JSON array"] };
    }
  } else {
    rawImages = trimmed.split("|");
  }

  const images = rawImages.map((image) => image.trim()).filter(Boolean);
  const invalidImages = images.filter((image) => !/^(https?:\/\/|\/|uploads\/|images\/)/i.test(image));

  return {
    value: images,
    errors: invalidImages.length
      ? [`images contains invalid URL/path values: ${invalidImages.slice(0, 3).join(", ")}`]
      : [],
  };
};

const detectDelimiter = (line: string) => {
  const candidates = [",", ";", "\t"];
  const counts = candidates.map((delimiter) => {
    let count = 0;
    let quoted = false;
    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];
      const next = line[index + 1];
      if (char === '"' && quoted && next === '"') {
        index += 1;
        continue;
      }
      if (char === '"') quoted = !quoted;
      if (char === delimiter && !quoted) count += 1;
    }
    return { delimiter, count };
  });

  return counts.sort((left, right) => right.count - left.count)[0].delimiter;
};

const parseDelimitedText = (text: string, delimiter: string) => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  const pushCell = () => {
    row.push(cell.trim());
    cell = "";
  };

  const pushRow = () => {
    pushCell();
    if (row.some((value) => value.trim())) rows.push(row);
    row = [];
  };

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if (char === delimiter && !quoted) {
      pushCell();
      continue;
    }

    if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      pushRow();
      continue;
    }

    cell += char;
  }

  if (cell || row.length) pushRow();
  if (quoted) throw new Error("CSV contains an unclosed quoted value.");

  return rows;
};

const normalizeHeaderToken = (header: string) =>
  header
    .trim()
    .replace(/^\uFEFF/, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const getHeaderWords = (header: string) => normalizeHeaderToken(header).split("_").filter(Boolean);

const PRODUCT_IMPORT_HEADER_ALIAS_SETS: Record<ProductImportHeader, readonly string[]> = {
  title: ["name", "product", "product_name", "product_title", "item", "item_name"],
  description: ["short_description", "summary", "product_description"],
  long_description: ["full_description", "detailed_description", "long_copy", "details", "product_details"],
  property_type: ["category", "product_category", "collection", "product_type", "type"],
  featured_slug: ["featured_subcategory", "featured_category", "subcategory", "sub_category", "collection_slug"],
  price: ["amount", "unit_price", "selling_price", "retail_price"],
  currency: ["currency_code"],
  location: ["sku", "model", "sku_model", "sku_or_model", "product_code", "code", "stock_code"],
  city: ["warehouse", "stock_location", "branch", "store_location"],
  country: ["market"],
  images: ["image", "image_url", "image_urls", "photo", "photos", "product_images", "media"],
  status: ["approval_status", "publish_status"],
  featured: ["is_featured", "featured_product", "promoted"],
  institution_slugs: ["institutions", "institution", "institution_slug", "institution_slugs", "target_institutions"],
};

const PRODUCT_IMPORT_HEADER_ALIAS_VALUES: Record<ProductImportHeader, readonly string[]> = PRODUCT_IMPORT_HEADERS.reduce(
  (lookup, header) => ({
    ...lookup,
    [header]: [
      header,
      header.replace(/_/g, " "),
      PRODUCT_IMPORT_HEADER_LABELS[header],
      ...PRODUCT_IMPORT_HEADER_ALIAS_SETS[header],
    ],
  }),
  {} as Record<ProductImportHeader, readonly string[]>,
);

const PRODUCT_IMPORT_HEADER_LOOKUP = PRODUCT_IMPORT_HEADERS.reduce((lookup, header) => {
  PRODUCT_IMPORT_HEADER_ALIAS_VALUES[header].forEach((alias) => {
    const normalizedAlias = normalizeHeaderToken(alias);
    let matchType: ProductCsvHeaderMatchType = "alias";
    if (normalizedAlias === normalizeHeaderToken(header)) matchType = "database";
    if (normalizedAlias === normalizeHeaderToken(PRODUCT_IMPORT_HEADER_LABELS[header])) matchType = "form-label";

    lookup.set(normalizedAlias, { header, matchType });
  });

  return lookup;
}, new Map<string, { header: ProductImportHeader; matchType: ProductCsvHeaderMatchType }>());

const getEditDistance = (left: string, right: string) => {
  const distances = Array.from({ length: left.length + 1 }, (_, row) => (
    Array.from({ length: right.length + 1 }, (__, column) => (row === 0 ? column : column === 0 ? row : 0))
  ));

  for (let row = 1; row <= left.length; row += 1) {
    for (let column = 1; column <= right.length; column += 1) {
      const cost = left[row - 1] === right[column - 1] ? 0 : 1;
      distances[row][column] = Math.min(
        distances[row - 1][column] + 1,
        distances[row][column - 1] + 1,
        distances[row - 1][column - 1] + cost,
      );
    }
  }

  return distances[left.length][right.length];
};

const getTokenSimilarity = (left: string, right: string) => {
  if (!left || !right) return 0;
  if (left === right) return 1;
  if (left.includes(right) || right.includes(left)) return 0.88;

  const distance = getEditDistance(left, right);
  return 1 - distance / Math.max(left.length, right.length);
};

const scoreHeaderCandidate = (rawHeader: string, alias: string) => {
  const rawToken = normalizeHeaderToken(rawHeader);
  const aliasToken = normalizeHeaderToken(alias);
  const rawWords = getHeaderWords(rawHeader);
  const aliasWords = getHeaderWords(alias);
  const tokenScore = getTokenSimilarity(rawToken, aliasToken);
  const sharedWords = rawWords.filter((word) => aliasWords.some((aliasWord) => getTokenSimilarity(word, aliasWord) >= 0.82));
  const wordScore = sharedWords.length / Math.max(1, Math.min(rawWords.length, aliasWords.length));

  return Math.max(tokenScore, wordScore);
};

const getSuggestedProductImportHeader = (rawHeader: string) => {
  let best: { header: ProductImportHeader; score: number } | null = null;

  PRODUCT_IMPORT_HEADERS.forEach((header) => {
    PRODUCT_IMPORT_HEADER_ALIAS_VALUES[header].forEach((alias) => {
      const score = scoreHeaderCandidate(rawHeader, alias);
      if (!best || score > best.score) best = { header, score };
    });
  });

  return best && best.score >= 0.55 ? best : null;
};

const getProductImportHeaderMatch = (header: string) =>
  PRODUCT_IMPORT_HEADER_LOOKUP.get(normalizeHeaderToken(header)) || null;

const createParseErrorResult = (error: ProductCsvImportError): ProductCsvImportResult => ({
  headers: [],
  interpretations: [],
  ignoredHeaders: [],
  rowCount: 0,
  validRows: [],
  errors: [error],
});

const parseProductCsvText = (text: string) => {
  const cleanText = text.replace(/^\uFEFF/, "");
  const firstLine = cleanText.split(/\r?\n/).find((line) => line.trim()) || "";
  const delimiter = detectDelimiter(firstLine);

  try {
    return {
      rows: parseDelimitedText(cleanText, delimiter),
      error: null,
    };
  } catch (error) {
    return {
      rows: [] as string[][],
      error: {
        rowNumber: null,
        message: error instanceof Error ? error.message : "Could not parse CSV.",
      } satisfies ProductCsvImportError,
    };
  }
};

const getHeaderInterpretations = (
  rows: string[][],
  headerMappings: ProductCsvValidationOptions["headerMappings"] = {},
) => {
  const rawHeaders = (rows[0] || []).map((header) => header.trim().replace(/^\uFEFF/, ""));
  return rawHeaders.map((rawHeader, index): ProductCsvHeaderInterpretation => {
    const mappedHeader = headerMappings[rawHeader];
    const suggestion = getSuggestedProductImportHeader(rawHeader);
    const sampleValues = rows
      .slice(1)
      .map((row) => String(row[index] || "").trim())
      .filter(Boolean)
      .slice(0, 3);

    if (mappedHeader === PRODUCT_IMPORT_IGNORE_HEADER) {
      return {
        rawHeader,
        header: null,
        matchType: "ignored",
        suggestedHeader: suggestion?.header || null,
        confidence: suggestion?.score || 0,
        sampleValues,
      };
    }

    if (mappedHeader) {
      return {
        rawHeader,
        header: mappedHeader,
        matchType: "manual",
        suggestedHeader: suggestion?.header || null,
        confidence: 1,
        sampleValues,
      };
    }

    const match = getProductImportHeaderMatch(rawHeader);
    if (match) {
      return {
        rawHeader,
        header: match.header,
        matchType: match.matchType,
        suggestedHeader: null,
        confidence: 1,
        sampleValues,
      };
    }

    return {
      rawHeader,
      header: null,
      matchType: "unmatched",
      suggestedHeader: suggestion?.header || null,
      confidence: suggestion?.score || 0,
      sampleValues,
    };
  });
};

export const analyzeProductCsvHeaders = (
  text: string,
  options: ProductCsvValidationOptions = {},
): ProductCsvHeaderAnalysis => {
  const parsed = parseProductCsvText(text);

  if (parsed.error) {
    return {
      headers: [],
      interpretations: [],
      unresolvedHeaders: [],
      ignoredHeaders: [],
      rowCount: 0,
      errors: [parsed.error],
    };
  }

  if (parsed.rows.length < 2) {
    return {
      headers: parsed.rows[0] || [],
      interpretations: [],
      unresolvedHeaders: [],
      ignoredHeaders: [],
      rowCount: Math.max(0, parsed.rows.length - 1),
      errors: [{ rowNumber: null, message: "CSV needs a header row and at least one product row." }],
    };
  }

  const interpretations = getHeaderInterpretations(parsed.rows, options.headerMappings);
  const headers = interpretations.map(({ header, rawHeader }) => header || rawHeader);

  return {
    headers,
    interpretations,
    unresolvedHeaders: interpretations.filter(({ matchType, header }) => matchType === "unmatched" && !header),
    ignoredHeaders: interpretations.filter(({ matchType }) => matchType === "ignored").map(({ rawHeader }) => rawHeader),
    rowCount: parsed.rows.length - 1,
    errors: [],
  };
};

const describeHeader = (header: ProductImportHeader, rawHeaders: readonly string[]) =>
  rawHeaders.length > 1 ? `${header} (${rawHeaders.join(", ")})` : header;

export const validateProductCsv = (
  text: string,
  existingProducts: ExistingProductForImport[],
  knownCategories: readonly string[] = [],
  knownFeaturedSlugs: readonly KnownFeaturedSlugForImport[] = [],
  optionsOrInstitutionSlugs: ProductCsvValidationOptions | readonly string[] = {},
): ProductCsvImportResult => {
  const errors: ProductCsvImportError[] = [];
  const options = Array.isArray(optionsOrInstitutionSlugs)
    ? { knownInstitutionSlugs: optionsOrInstitutionSlugs }
    : optionsOrInstitutionSlugs;
  const knownInstitutionSlugs = options.knownInstitutionSlugs || [];
  const parsed = parseProductCsvText(text);

  if (parsed.error) {
    return createParseErrorResult(parsed.error);
  }

  const { rows } = parsed;

  if (rows.length < 2) {
    return {
      headers: rows[0] || [],
      interpretations: [],
      ignoredHeaders: [],
      rowCount: Math.max(0, rows.length - 1),
      validRows: [],
      errors: [{ rowNumber: null, message: "CSV needs a header row and at least one product row." }],
    };
  }

  const interpretations = getHeaderInterpretations(rows, options.headerMappings);
  const headers = interpretations.map(({ header, rawHeader }) => header || rawHeader);
  const ignoredHeaders = interpretations
    .filter(({ matchType }) => matchType === "ignored")
    .map(({ rawHeader }) => rawHeader);
  const canonicalHeaders = interpretations
    .map(({ header }) => header)
    .filter((header): header is ProductImportHeader => Boolean(header));
  const headerSet = new Set(canonicalHeaders);
  const headerSources = new Map<ProductImportHeader, string[]>();

  interpretations.forEach(({ header, rawHeader }) => {
    if (!header) return;
    headerSources.set(header, [...(headerSources.get(header) || []), rawHeader]);
  });

  const duplicateHeaders = Array.from(headerSources.entries()).filter(([, sources]) => sources.length > 1);
  const unknownHeaders = interpretations
    .filter(({ header, matchType }) => !header && matchType !== "ignored")
    .map(({ rawHeader }) => rawHeader);
  const missingRequiredHeaders = REQUIRED_PRODUCT_IMPORT_HEADERS.filter((header) => !headerSet.has(header));

  if (duplicateHeaders.length) {
    errors.push({
      rowNumber: null,
      message: `Duplicate header(s): ${duplicateHeaders.map(([header, sources]) => describeHeader(header, sources)).join("; ")}.`,
    });
  }

  if (unknownHeaders.length) {
    errors.push({
      rowNumber: null,
      message: `Unknown header(s): ${unknownHeaders.join(", ")}. Review each header and map it to a product field or ignore it.`,
    });
  }

  if (missingRequiredHeaders.length) {
    errors.push({
      rowNumber: null,
      message: `Missing required header(s): ${missingRequiredHeaders.map((header) => `${PRODUCT_IMPORT_HEADER_LABELS[header]} (${header})`).join(", ")}.`,
    });
  }

  if (errors.length) {
    return {
      headers,
      interpretations,
      ignoredHeaders,
      rowCount: rows.length - 1,
      validRows: [],
      errors,
    };
  }

  const validRows: ProductCsvValidRow[] = [];
  const existingKeys = new Set(
    existingProducts.map((product) => productKey(product.title, product.property_type, product.location)),
  );
  const fileKeys = new Set<string>();
  const categoryMap = getKnownCategoryMap(knownCategories);
  const featuredLookup = getKnownFeaturedLookup(knownFeaturedSlugs);

  rows.slice(1).forEach((cells, index) => {
    const rowNumber = index + 2;
    const rowErrors: string[] = [];

    if (cells.length > headers.length) {
      rowErrors.push(`has ${cells.length} cells but only ${headers.length} headers`);
    }

    const raw: Record<ProductImportHeader, string> = PRODUCT_IMPORT_HEADERS.reduce(
      (draft, header) => ({ ...draft, [header]: "" }),
      {} as Record<ProductImportHeader, string>,
    );

    interpretations.forEach(({ header }, cellIndex) => {
      if (!header) return;
      raw[header] = String(cells[cellIndex] || "").trim();
    });

    const title = raw.title.trim();
    const rawCategory = raw.property_type.trim();
    const category = categoryMap.get(normalizeComparable(rawCategory));
    const rawFeaturedSlug = raw.featured_slug.trim();
    const price = parsePrice(raw.price);
    const currency = getKnownValue(PRODUCT_IMPORT_CURRENCIES, raw.currency || "USD");
    const city = getKnownValue(PRODUCT_IMPORT_CITIES, raw.city || "Harare");
    const country = getKnownValue(PRODUCT_IMPORT_COUNTRIES, raw.country || "Zimbabwe");
    const status = getKnownValue(PRODUCT_IMPORT_STATUSES, raw.status || "approved");
    const featured = parseBoolean(raw.featured);
    const images = parseImages(raw.images);
    const institutionSlugs = raw.institution_slugs.split("|").map((item) => item.trim()).filter(Boolean);
    const location = raw.location.trim();
    const key = productKey(title, category || rawCategory, location);

    if (!title) rowErrors.push("Product Name is required");
    if (!rawCategory) rowErrors.push("Category is required");
    if (rawCategory && !category) rowErrors.push(`Category "${rawCategory}" does not exist in the product category list/catalog`);
    if (rawFeaturedSlug && knownFeaturedSlugs.length) {
      const categoryFeaturedSlugs = featuredLookup.categorySlugs.get(normalizeComparable(category || rawCategory));
      const featuredSlugExists = categoryFeaturedSlugs
        ? categoryFeaturedSlugs.has(normalizeComparable(rawFeaturedSlug))
        : featuredLookup.globalSlugs.has(normalizeComparable(rawFeaturedSlug));

      if (!featuredSlugExists) {
        rowErrors.push(`Featured subcategory "${rawFeaturedSlug}" does not exist under Category "${rawCategory}"`);
      }
    }
    if (price.error) rowErrors.push(price.error);
    if (!currency) rowErrors.push(`currency must be one of: ${PRODUCT_IMPORT_CURRENCIES.join(", ")}`);
    if (!city) rowErrors.push(`city must be one of: ${PRODUCT_IMPORT_CITIES.join(", ")}`);
    if (!country) rowErrors.push(`country must be one of: ${PRODUCT_IMPORT_COUNTRIES.join(", ")}`);
    if (!status) rowErrors.push(`status must be one of: ${PRODUCT_IMPORT_STATUSES.join(", ")}`);
    if (featured.error) rowErrors.push(featured.error);
    rowErrors.push(...images.errors);
    const unknownInstitutionSlugs = institutionSlugs.filter((slug) => (
      !knownInstitutionSlugs.some((knownSlug) => normalizeComparable(knownSlug) === normalizeComparable(slug))
    ));
    if (unknownInstitutionSlugs.length) {
      rowErrors.push(`institution_slugs contains unknown values: ${unknownInstitutionSlugs.join(", ")}`);
    }
    if (existingKeys.has(key)) rowErrors.push("product already exists in the catalog");
    if (fileKeys.has(key)) rowErrors.push("duplicate product inside this CSV");

    if (rowErrors.length) {
      errors.push({ rowNumber, message: rowErrors.join("; ") + "." });
      return;
    }

    fileKeys.add(key);
    validRows.push({
      rowNumber,
      key,
      payload: {
        title,
        description: raw.description.trim() || null,
        long_description: raw.long_description.trim() || null,
        property_type: category || rawCategory,
        featured_slug: rawFeaturedSlug || null,
        price: price.value,
        currency: currency || "USD",
        location: location || null,
        city: city || "Harare",
        country: country || "Zimbabwe",
        images: images.value,
        status: status || "approved",
        featured: featured.value,
        institution_slugs: institutionSlugs,
        bedrooms: 0,
        bathrooms: 0,
        area_sqft: 0,
      },
    });
  });

  if (!validRows.length && !errors.length) {
    errors.push({ rowNumber: null, message: "CSV does not contain any product rows." });
  }

  return {
    headers,
    interpretations,
    ignoredHeaders,
    rowCount: rows.length - 1,
    validRows,
    errors,
  };
};

export const csvEscape = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;

export const buildProductImportTemplateCsv = () => `${PRODUCT_IMPORT_TEMPLATE_HEADERS.join(",")}\n`;
