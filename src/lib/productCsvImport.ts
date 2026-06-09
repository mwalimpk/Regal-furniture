export const PRODUCT_IMPORT_HEADERS = [
  "title",
  "description",
  "long_description",
  "property_type",
  "price",
  "currency",
  "location",
  "city",
  "country",
  "images",
  "status",
  "featured",
] as const;

export const REQUIRED_PRODUCT_IMPORT_HEADERS = ["title", "property_type", "price"] as const;

export const PRODUCT_IMPORT_CATEGORIES = [
  "Executive Desking",
  "Managerial Desking",
  "L-Shaped Desks",
  "Adjustable Desking",
  "Workstations",
  "Executive Chairs",
  "Ergonomic Chairs",
  "Visitor Chairs",
  "Conference Tables",
  "Conference Chairs",
  "Sofas & Lounge",
  "Storage & Filing",
  "Accessories",
] as const;

const PRODUCT_IMPORT_CURRENCIES = ["USD", "ZWL"] as const;
const PRODUCT_IMPORT_CITIES = ["Harare", "Bulawayo", "Both"] as const;
const PRODUCT_IMPORT_COUNTRIES = ["Zimbabwe"] as const;
const PRODUCT_IMPORT_STATUSES = ["approved", "pending", "rejected"] as const;

type ProductImportHeader = (typeof PRODUCT_IMPORT_HEADERS)[number];

export type ExistingProductForImport = {
  title?: string | null;
  property_type?: string | null;
  location?: string | null;
};

export type ProductImportPayload = {
  title: string;
  description: string | null;
  long_description: string | null;
  property_type: string;
  price: number;
  currency: string;
  location: string | null;
  city: string;
  country: string;
  images: string[];
  status: string;
  featured: boolean;
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

export type ProductCsvImportResult = {
  headers: string[];
  validRows: ProductCsvValidRow[];
  errors: ProductCsvImportError[];
};

const normalizeComparable = (value: unknown) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const productKey = (title: unknown, category: unknown, location: unknown) =>
  [title, category, location].map(normalizeComparable).join("|");

const getKnownCategoryMap = (existingProducts: ExistingProductForImport[]) => {
  const categoryMap = new Map<string, string>();

  PRODUCT_IMPORT_CATEGORIES.forEach((category) => {
    categoryMap.set(normalizeComparable(category), category);
  });

  existingProducts.forEach((product) => {
    const category = String(product.property_type || "").trim();
    if (category) categoryMap.set(normalizeComparable(category), category);
  });

  return categoryMap;
};

const getKnownValue = (values: readonly string[], value: string) =>
  values.find((option) => normalizeComparable(option) === normalizeComparable(value));

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

const normalizeHeader = (header: string) => header.trim().replace(/^\uFEFF/, "").toLowerCase();

export const validateProductCsv = (
  text: string,
  existingProducts: ExistingProductForImport[],
): ProductCsvImportResult => {
  const errors: ProductCsvImportError[] = [];
  const cleanText = text.replace(/^\uFEFF/, "");
  const firstLine = cleanText.split(/\r?\n/).find((line) => line.trim()) || "";
  const delimiter = detectDelimiter(firstLine);

  let rows: string[][] = [];
  try {
    rows = parseDelimitedText(cleanText, delimiter);
  } catch (error) {
    return {
      headers: [],
      validRows: [],
      errors: [{ rowNumber: null, message: error instanceof Error ? error.message : "Could not parse CSV." }],
    };
  }

  if (rows.length < 2) {
    return {
      headers: rows[0] || [],
      validRows: [],
      errors: [{ rowNumber: null, message: "CSV needs a header row and at least one product row." }],
    };
  }

  const headers = rows[0].map(normalizeHeader);
  const headerSet = new Set(headers);
  const allowedHeaders = new Set<string>(PRODUCT_IMPORT_HEADERS);
  const duplicateHeaders = headers.filter((header, index) => headers.indexOf(header) !== index);
  const unknownHeaders = headers.filter((header) => !allowedHeaders.has(header));
  const missingRequiredHeaders = REQUIRED_PRODUCT_IMPORT_HEADERS.filter((header) => !headerSet.has(header));

  if (duplicateHeaders.length) {
    errors.push({ rowNumber: null, message: `Duplicate header(s): ${[...new Set(duplicateHeaders)].join(", ")}.` });
  }

  if (unknownHeaders.length) {
    errors.push({
      rowNumber: null,
      message: `Unknown header(s): ${unknownHeaders.join(", ")}. Use database fields: ${PRODUCT_IMPORT_HEADERS.join(", ")}.`,
    });
  }

  if (missingRequiredHeaders.length) {
    errors.push({ rowNumber: null, message: `Missing required header(s): ${missingRequiredHeaders.join(", ")}.` });
  }

  if (errors.length) return { headers, validRows: [], errors };

  const validRows: ProductCsvValidRow[] = [];
  const existingKeys = new Set(
    existingProducts.map((product) => productKey(product.title, product.property_type, product.location)),
  );
  const fileKeys = new Set<string>();
  const categoryMap = getKnownCategoryMap(existingProducts);

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

    headers.forEach((header, cellIndex) => {
      raw[header as ProductImportHeader] = String(cells[cellIndex] || "").trim();
    });

    const title = raw.title.trim();
    const rawCategory = raw.property_type.trim();
    const category = categoryMap.get(normalizeComparable(rawCategory));
    const price = parsePrice(raw.price);
    const currency = getKnownValue(PRODUCT_IMPORT_CURRENCIES, raw.currency || "USD");
    const city = getKnownValue(PRODUCT_IMPORT_CITIES, raw.city || "Harare");
    const country = getKnownValue(PRODUCT_IMPORT_COUNTRIES, raw.country || "Zimbabwe");
    const status = getKnownValue(PRODUCT_IMPORT_STATUSES, raw.status || "approved");
    const featured = parseBoolean(raw.featured);
    const images = parseImages(raw.images);
    const location = raw.location.trim();
    const key = productKey(title, category || rawCategory, location);

    if (!title) rowErrors.push("title is required");
    if (!rawCategory) rowErrors.push("property_type is required");
    if (rawCategory && !category) rowErrors.push(`property_type "${rawCategory}" does not exist in the product category list/catalog`);
    if (price.error) rowErrors.push(price.error);
    if (!currency) rowErrors.push(`currency must be one of: ${PRODUCT_IMPORT_CURRENCIES.join(", ")}`);
    if (!city) rowErrors.push(`city must be one of: ${PRODUCT_IMPORT_CITIES.join(", ")}`);
    if (!country) rowErrors.push(`country must be one of: ${PRODUCT_IMPORT_COUNTRIES.join(", ")}`);
    if (!status) rowErrors.push(`status must be one of: ${PRODUCT_IMPORT_STATUSES.join(", ")}`);
    if (featured.error) rowErrors.push(featured.error);
    rowErrors.push(...images.errors);
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
        price: price.value,
        currency: currency || "USD",
        location: location || null,
        city: city || "Harare",
        country: country || "Zimbabwe",
        images: images.value,
        status: status || "approved",
        featured: featured.value,
        bedrooms: 0,
        bathrooms: 0,
        area_sqft: 0,
      },
    });
  });

  if (!validRows.length && !errors.length) {
    errors.push({ rowNumber: null, message: "CSV does not contain any product rows." });
  }

  return { headers, validRows, errors };
};

export const csvEscape = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;

export const buildProductImportTemplateCsv = () => `${PRODUCT_IMPORT_HEADERS.join(",")}\n`;
