import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildGeneratedProductCopy as buildGeneratedProductCopyWithAI } from "./product-ai.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const dataRoot = path.join(projectRoot, "server", "data");
const storeFile = path.join(dataRoot, "store.json");
const uploadRoot = path.join(dataRoot, "uploads");

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;

const ADMIN_ACCOUNT = {
  email: "geshpk@gmail.com",
  password: "RegalAdmin#2026!Pk",
  full_name: "Regal Admin",
};

const SECONDARY_ADMIN_ACCOUNT = {
  email: "paul.kiragu@gmail.com",
  password: "RegalAdmin#2026!Pk",
  full_name: "Paul Kiragu",
};

const DEMO_ACCOUNT = {
  email: "client@regalofficehome.com",
  password: "ClientDemo#2026!",
  full_name: "Demo Client",
};

const nowIso = () => new Date().toISOString();
const today = () => new Date().toISOString().split("T")[0];
const uid = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
const clone = (value) => JSON.parse(JSON.stringify(value));
const slugify = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const DEFAULT_PRODUCT_CATEGORIES = [
  {
    name: "Executive Suites",
    slug: "executive-suites",
    image_url: "/uploads/collections/executive-suites/big-tall-500-hi-back-swivel-chair-netting-02da43e643.jpg",
    features: [
      { id: "featured-executive-chairs", name: "Executive chairs", image_url: "/uploads/collections/executive-suites/big-tall-500-hi-back-swivel-chair-netting-02da43e643.jpg" },
      { id: "featured-executive-desks", name: "Executive desks", image_url: "/uploads/collections/executive-suites/big-tall-500-hi-back-swivel-chair-netting-02da43e643.jpg" },
    ],
  },
  {
    name: "Office Suites",
    slug: "office-suites",
    image_url: "/uploads/collections/office-suites/almin-workstation-4-seater-df4ddb5484.jpg",
    features: [
      { id: "featured-workstations", name: "Workstations", image_url: "/uploads/collections/office-suites/almin-workstation-4-seater-df4ddb5484.jpg" },
      { id: "featured-operator-seating", name: "Operator seating", image_url: "/uploads/collections/office-suites/almin-workstation-4-seater-df4ddb5484.jpg" },
    ],
  },
  {
    name: "Conference & Boardroom",
    slug: "conference-boardroom",
    image_url: "/uploads/collections/conference-boardroom/arcadian-boardroom-table-079a3a1fbd.jpg",
    features: [
      { id: "featured-boardroom-tables", name: "Boardroom tables", image_url: "/uploads/collections/conference-boardroom/arcadian-boardroom-table-079a3a1fbd.jpg" },
      { id: "featured-conference-chairs", name: "Conference chairs", image_url: "/uploads/collections/conference-boardroom/arcadian-boardroom-table-079a3a1fbd.jpg" },
    ],
  },
  {
    name: "Reception & Lobby",
    slug: "reception-lobby",
    image_url: "/uploads/collections/reception-lobby/chesterfield-leather-couch-3-seater-933676b7ed.png",
    features: [
      { id: "featured-reception-sofas", name: "Reception sofas", image_url: "/uploads/collections/reception-lobby/chesterfield-leather-couch-3-seater-933676b7ed.png" },
      { id: "featured-visitor-seating", name: "Visitor seating", image_url: "/uploads/collections/reception-lobby/chesterfield-leather-couch-3-seater-933676b7ed.png" },
    ],
  },
  {
    name: "Home Office",
    slug: "home-office",
    image_url: "/uploads/collections/home-office/aqua-ergonomic-swivel-chair-dc140d6557.jpg",
    features: [
      { id: "featured-home-office-chairs", name: "Home office chairs", image_url: "/uploads/collections/home-office/aqua-ergonomic-swivel-chair-dc140d6557.jpg" },
      { id: "featured-compact-desks", name: "Compact desks", image_url: "/uploads/collections/home-office/aqua-ergonomic-swivel-chair-dc140d6557.jpg" },
    ],
  },
  {
    name: "Industrial & Laboratory",
    slug: "industrial-laboratory",
    image_url: "/uploads/collections/industrial-laboratory/blackpool-industrial-draughtman-chair-822ed5892c.png",
    features: [
      { id: "featured-lab-stools", name: "Laboratory stools", image_url: "/uploads/collections/industrial-laboratory/blackpool-industrial-draughtman-chair-822ed5892c.png" },
      { id: "featured-technical-task-seating", name: "Technical task seating", image_url: "/uploads/collections/industrial-laboratory/blackpool-industrial-draughtman-chair-822ed5892c.png" },
    ],
  },
  {
    name: "Accessories",
    slug: "accessories",
    image_url: "/uploads/collections/accessories/metal-4-drawer-filing-cabinet-wth-bar-fdd5e9e2a5.jpg",
    features: [
      { id: "featured-filing-storage", name: "Filing storage", image_url: "/uploads/collections/accessories/metal-4-drawer-filing-cabinet-wth-bar-fdd5e9e2a5.jpg" },
      { id: "featured-workspace-add-ons", name: "Workspace add-ons", image_url: "/uploads/collections/accessories/metal-4-drawer-filing-cabinet-wth-bar-fdd5e9e2a5.jpg" },
    ],
  },
];

const buildDefaultCategoryRows = (timestamp = nowIso()) =>
  DEFAULT_PRODUCT_CATEGORIES.map((category) => ({
    id: `category-${category.slug}`,
    name: category.name,
    slug: category.slug,
    image_url: category.image_url,
    features: category.features.map((feature, index) => ({
      ...feature,
      slug: feature.slug || slugify(feature.name || feature.id || index),
    })),
    created_at: timestamp,
    updated_at: timestamp,
    user_id: null,
  }));

const DEFAULT_PRODUCT_INSTITUTIONS = [
  {
    name: "Government",
    slug: "government",
    description: "Durable boardroom, office, storage, and reception furniture for departments, agencies, and public service environments.",
    image_url: "/images/institutions/government.jpg",
  },
  {
    name: "Hospitals",
    slug: "hospitals",
    description: "Practical seating, workstations, storage, and administrative furniture for healthcare teams and patient-facing spaces.",
    image_url: "/images/institutions/hospitals-reception.png",
  },
  {
    name: "Hotels",
    slug: "hotels",
    description: "Reception, lounge, back-office, dining, and room-support furniture for hospitality spaces that need comfort and polish.",
    image_url: "/images/institutions/hotels-lobby.png",
  },
  {
    name: "Schools",
    slug: "schools",
    description: "Furniture for offices, staff rooms, libraries, labs, administration blocks, and flexible learning support areas.",
    image_url: "/images/institutions/schools.jpg",
  },
  {
    name: "Corporate Offices",
    slug: "corporate-offices",
    description: "Executive suites, boardrooms, open-plan teams, receptions, and storage for growing business environments.",
    image_url: "/images/hero-slides/boardroom-office.jpeg",
  },
  {
    name: "Property Developers",
    slug: "property-developers",
    description: "Furniture packages for show units, sales offices, apartment amenities, and multi-room development handovers.",
    image_url: "/images/hero-slides/home-and-office.jpeg",
  },
];

const DEFAULT_INSTITUTION_IMAGE_UPDATE_SLUGS = new Set(["hospitals", "hotels"]);

const buildDefaultInstitutionRows = (timestamp = nowIso()) =>
  DEFAULT_PRODUCT_INSTITUTIONS.map((institution, index) => ({
    id: `institution-${institution.slug}`,
    ...institution,
    display_order: index + 1,
    status: "active",
    created_at: timestamp,
    updated_at: timestamp,
    user_id: null,
  }));

const ensureDefaultInstitutionRows = (rows, timestamp = nowIso()) => {
  const currentRows = Array.isArray(rows) ? rows : [];
  const defaultRows = buildDefaultInstitutionRows(timestamp);
  const defaultRowBySlug = new Map(defaultRows.map((row) => [row.slug, row]));
  let updatedExistingRows = false;
  const normalizedRows = currentRows.map((row) => {
    const slug = String(row?.slug || "").trim().toLowerCase();
    const defaultRow = defaultRowBySlug.get(slug);
    if (!defaultRow || !DEFAULT_INSTITUTION_IMAGE_UPDATE_SLUGS.has(slug) || row.image_url === defaultRow.image_url) return row;

    updatedExistingRows = true;
    return { ...row, image_url: defaultRow.image_url, updated_at: timestamp };
  });
  const existingSlugs = new Set(normalizedRows.map((row) => String(row?.slug || "").trim().toLowerCase()).filter(Boolean));
  const missingRows = defaultRows.filter((row) => !existingSlugs.has(row.slug));

  return {
    rows: [...normalizedRows, ...missingRows].sort((left, right) => Number(left.display_order || 0) - Number(right.display_order || 0)),
    changed: !Array.isArray(rows) || missingRows.length > 0 || updatedExistingRows,
  };
};

const buildDefaultCurrencySettings = (timestamp = nowIso()) => ({
  id: "storefront",
  auto_update: true,
  manual_rate: 27,
  fallback_rate: 27,
  profit_margin_usd: 7,
  cache_hours: 24,
  rate_source_url: "https://open.er-api.com/v6/latest/USD",
  last_live_rate: null,
  last_rate_updated_at: null,
  updated_at: timestamp,
  user_id: null,
});

const MIN_ZWG_RATE_ADJUSTMENT = 7;

const resolveCurrencyBaseRate = (...values) => {
  for (const value of values) {
    const rate = Number(value);
    if (Number.isFinite(rate) && rate > 0) return rate;
  }
  return 27;
};

const resolveZwgRateAdjustment = (settings = {}) => {
  const adjustment = Number(settings.profit_margin_usd);
  return Number.isFinite(adjustment) ? Math.max(MIN_ZWG_RATE_ADJUSTMENT, adjustment) : MIN_ZWG_RATE_ADJUSTMENT;
};

const buildCurrencyRatePayload = ({ settings, baseRate, source, updatedAt, autoUpdate }) => {
  const safeBaseRate = resolveCurrencyBaseRate(baseRate);
  const rateAdjustmentZwg = resolveZwgRateAdjustment(settings);

  return {
    rate: safeBaseRate + rateAdjustmentZwg,
    baseRate: safeBaseRate,
    rateAdjustmentZwg,
    source,
    updatedAt,
    autoUpdate,
  };
};

const normalizeCategoryFeaturedItems = (features = [], fallbackImage = "") => {
  const values = Array.isArray(features)
    ? features
    : String(features || "").split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);

  return values
    .map((item, index) => {
      if (item && typeof item === "object") {
        const name = String(item.name || item.title || "").trim();
        const slug = slugify(item.slug || name || item.id || "");
        const image_url = String(item.image_url || item.image || fallbackImage || "").trim();
        if (!name && !image_url) return null;
        return {
          id: String(item.id || `featured-${slugify(name || image_url) || index}`),
          name,
          slug,
          image_url,
        };
      }

      const name = String(item || "").trim();
      if (!name) return null;
      return {
        id: `featured-${slugify(name) || index}`,
        name,
        slug: slugify(name),
        image_url: fallbackImage,
      };
    })
    .filter(Boolean);
};

const ensureDataRoot = () => {
  fs.mkdirSync(dataRoot, { recursive: true });
  fs.mkdirSync(uploadRoot, { recursive: true });
};

const buildInitialState = () => {
  const createdAt = nowIso();
  const authUsers = [
    {
      id: uid("user"),
      email: ADMIN_ACCOUNT.email,
      password: ADMIN_ACCOUNT.password,
      created_at: createdAt,
      user_metadata: { full_name: ADMIN_ACCOUNT.full_name, phone: "+263000000000" },
    },
    {
      id: uid("user"),
      email: SECONDARY_ADMIN_ACCOUNT.email,
      password: SECONDARY_ADMIN_ACCOUNT.password,
      created_at: createdAt,
      user_metadata: { full_name: SECONDARY_ADMIN_ACCOUNT.full_name, phone: "+263000000001" },
    },
    {
      id: uid("user"),
      email: DEMO_ACCOUNT.email,
      password: DEMO_ACCOUNT.password,
      created_at: createdAt,
      user_metadata: { full_name: DEMO_ACCOUNT.full_name, phone: "+263712345678" },
    },
  ];

  const profiles = authUsers.map((user) => ({
    id: uid("profile"),
    user_id: user.id,
    full_name: String(user.user_metadata.full_name || ""),
    currency: "USD",
    phone: typeof user.user_metadata.phone === "string" ? user.user_metadata.phone : null,
    status: "active",
    created_at: createdAt,
    updated_at: createdAt,
  }));

  const user_roles = [
    { id: uid("role"), user_id: authUsers[0].id, role: "admin" },
    { id: uid("role"), user_id: authUsers[1].id, role: "admin" },
    { id: uid("role"), user_id: authUsers[2].id, role: "user" },
  ];

  return {
    authUsers,
    sessions: [],
    profiles,
    user_roles,
    product_categories: buildDefaultCategoryRows(createdAt),
    product_institutions: buildDefaultInstitutionRows(createdAt),
    currency_settings: [buildDefaultCurrencySettings(createdAt)],
    properties: [],
    product_pairings: [],
    product_promotions: [],
    catalogues: [],
    hero_slides: [],
    promotional_banners: [],
    inquiries: [],
    leads: [],
    orders: [],
    bookings: [],
    messages: [
      {
        id: uid("msg"),
        body: "Backend ownership now lives inside this project. Admin data is being stored by the local server rather than the browser.",
        created_at: createdAt,
        read: false,
        recipient_id: authUsers[0].id,
        sender_id: null,
        subject: "Project Backend Ready",
      },
    ],
    subscriptions: [
      {
        id: uid("sub"),
        amount: 25,
        created_at: createdAt,
        currency: "USD",
        end_date: null,
        plan_name: "Showroom Growth",
        start_date: today(),
        status: "active",
        updated_at: createdAt,
        user_id: authUsers[0].id,
      },
    ],
    rfq_requests: [],
  };
};

const ensureStateFile = () => {
  ensureDataRoot();
  if (!fs.existsSync(storeFile)) {
    fs.writeFileSync(storeFile, JSON.stringify(buildInitialState(), null, 2), "utf8");
  }
};

const loadState = () => {
  ensureStateFile();
  const state = JSON.parse(fs.readFileSync(storeFile, "utf8"));
  let changed = false;

  if (!Array.isArray(state.product_categories)) {
    state.product_categories = buildDefaultCategoryRows();
    changed = true;
  }

  const institutions = ensureDefaultInstitutionRows(state.product_institutions);
  state.product_institutions = institutions.rows;
  changed = changed || institutions.changed;

  if (!Array.isArray(state.currency_settings) || !state.currency_settings.length) {
    state.currency_settings = [buildDefaultCurrencySettings()];
    changed = true;
  }

  if (Array.isArray(state.properties)) {
    state.properties = state.properties.map((property) => {
      if (Array.isArray(property.institution_slugs)) return property;
      changed = true;
      return { ...property, institution_slugs: [] };
    });
  }

  if (Array.isArray(state.product_categories)) {
    state.product_categories = state.product_categories.map((category) => {
      const normalizedFeatures = normalizeCategoryFeaturedItems(category.features, category.image_url);
      const isStructured =
        Array.isArray(category.features) &&
        category.features.every((item) => item && typeof item === "object" && "name" in item && "slug" in item && "image_url" in item);
      if (isStructured) return category;
      changed = true;
      return { ...category, features: normalizedFeatures };
    });
  }

  if (Array.isArray(state.hero_slides)) {
    state.hero_slides = state.hero_slides.map((slide) => {
      if ("cta_enabled" in slide) return slide;
      changed = true;
      return { ...slide, cta_enabled: true };
    });
  }

  if (changed) saveState(state);
  return state;
};

const saveState = (state) => {
  ensureDataRoot();
  fs.writeFileSync(storeFile, JSON.stringify(state, null, 2), "utf8");
};

const toPublicUser = (user) => ({
  id: user.id,
  email: user.email,
  created_at: user.created_at,
  user_metadata: user.user_metadata,
});

const buildSession = (user, accessToken = `${uid("session")}-${user.id}`) => ({
  access_token: accessToken,
  expires_at: Date.now() + SESSION_DURATION_MS,
  user: toPublicUser(user),
});

const getTable = (state, table) => state[table] || [];
const setTable = (state, table, rows) => {
  state[table] = rows;
};

const sortRows = (rows, field, ascending) =>
  [...rows].sort((a, b) => {
    const left = a[field];
    const right = b[field];
    if (left === right) return 0;
    if (left === undefined || left === null) return ascending ? -1 : 1;
    if (right === undefined || right === null) return ascending ? 1 : -1;
    return left > right ? (ascending ? 1 : -1) : (ascending ? -1 : 1);
  });

const withBookingRelation = (rows, state) =>
  rows.map((row) => {
    const property = state.properties.find((item) => item.id === row.property_id);
    return {
      ...row,
      properties: property ? { title: property.title } : null,
    };
  });

const getFilteredRows = (state, payload) => {
  const {
    table,
    filters = [],
    orderBy = null,
    limitCount = null,
    columns = "*",
  } = payload;

  let rows = clone(getTable(state, table));

  for (const filter of filters) {
    rows = rows.filter((row) => row[filter.field] === filter.value);
  }

  if (orderBy) {
    rows = sortRows(rows, orderBy.field, orderBy.ascending);
  }

  if (limitCount !== null) {
    rows = rows.slice(0, limitCount);
  }

  if (table === "bookings" && typeof columns === "string" && columns.includes("properties(")) {
    rows = withBookingRelation(rows, state);
  }

  return rows;
};

const normalizeInsertRow = (table, row) => {
  const timestamp = nowIso();
  switch (table) {
    case "profiles":
      return {
        id: uid("profile"),
        created_at: timestamp,
        updated_at: timestamp,
        status: "active",
        avatar_url: null,
        currency: "USD",
        phone: null,
        full_name: null,
        ...row,
      };
    case "user_roles":
      return {
        id: uid("role"),
        role: "user",
        ...row,
      };
    case "properties":
      return {
        id: uid("property"),
        created_at: timestamp,
        updated_at: timestamp,
        status: "approved",
        featured: false,
        featured_slug: null,
        bedrooms: 0,
        bathrooms: 0,
        area_sqft: 0,
        country: "Zimbabwe",
        images: [],
        color_variants: [],
        institution_slugs: [],
        ...row,
      };
    case "product_categories": {
      const name = String(row.name || "").trim();
      const slug = String(row.slug || slugify(name || "category"));
      const imageUrl = String(row.image_url || "");
      return {
        id: uid("category"),
        name,
        slug,
        image_url: "",
        created_at: timestamp,
        updated_at: timestamp,
        user_id: null,
        ...row,
        slug,
        features: normalizeCategoryFeaturedItems(row.features || [], imageUrl),
      };
    }
    case "product_institutions":
      return {
        id: uid("institution"),
        description: "",
        image_url: "",
        display_order: 0,
        status: "active",
        created_at: timestamp,
        updated_at: timestamp,
        user_id: null,
        ...row,
      };
    case "currency_settings":
      return {
        ...buildDefaultCurrencySettings(timestamp),
        ...row,
        updated_at: timestamp,
      };
    case "product_pairings":
      return {
        id: uid("pair"),
        recommended_ids: [],
        ...row,
      };
    case "product_promotions":
      return {
        id: uid("promo"),
        created_at: timestamp,
        updated_at: timestamp,
        description: null,
        promotion_type: "single_product",
        discount_type: "percentage",
        discount_value: null,
        offer_label: null,
        product_ids: [],
        category_targets: [],
        status: "active",
        starts_at: null,
        ends_at: null,
        ...row,
      };
    case "catalogues":
      return {
        id: uid("catalogue"),
        created_at: timestamp,
        updated_at: timestamp,
        imported_count: 0,
        status: "uploaded",
        ...row,
      };
    case "hero_slides":
      return {
        id: uid("hero"),
        created_at: timestamp,
        updated_at: timestamp,
        eyebrow: null,
        accent_title: null,
        description: null,
        image_alt: null,
        cta_label: "Explore Collection",
        cta_href: "/categories",
        cta_enabled: true,
        display_order: 1,
        status: "active",
        ...row,
      };
    case "promotional_banners":
      return {
        id: uid("banner"),
        created_at: timestamp,
        updated_at: timestamp,
        subtitle: null,
        background_image_url: null,
        cta_label: null,
        cta_href: null,
        placements: [],
        status: "active",
        starts_at: null,
        ends_at: null,
        has_countdown: false,
        countdown_ends_at: null,
        ...row,
      };
    case "inquiries":
      return {
        id: uid("inq"),
        created_at: timestamp,
        property_id: null,
        status: "new",
        user_id: null,
        phone: null,
        message: null,
        ...row,
      };
    case "leads":
      return {
        id: uid("lead"),
        created_at: timestamp,
        notes: null,
        phone: null,
        source: null,
        status: "new",
        ...row,
      };
    case "orders":
      return {
        id: uid("order"),
        created_at: timestamp,
        updated_at: timestamp,
        currency: "USD",
        items: [],
        phone: null,
        shipping_address: null,
        status: "pending",
        total: 0,
        ...row,
      };
    case "bookings":
      return {
        id: uid("booking"),
        created_at: timestamp,
        updated_at: timestamp,
        notes: null,
        status: "pending",
        booking_date: today(),
        ...row,
      };
    case "messages":
      return {
        id: uid("msg"),
        created_at: timestamp,
        read: false,
        recipient_id: null,
        sender_id: null,
        subject: null,
        ...row,
      };
    case "subscriptions":
      return {
        id: uid("sub"),
        created_at: timestamp,
        updated_at: timestamp,
        currency: "USD",
        end_date: null,
        amount: 0,
        status: "active",
        start_date: today(),
        ...row,
      };
    case "rfq_requests":
      return {
        id: uid("rfq"),
        created_at: timestamp,
        company_name: null,
        phone: null,
        product_interest: null,
        quantity: null,
        message: null,
        status: "New",
        ...row,
      };
    default:
      return row;
  }
};

const firstTextValue = (row, keys) => {
  for (const key of keys) {
    const value = row?.[key];
    if (value !== undefined && value !== null && String(value).trim()) return String(value).trim();
  }
  return "";
};

const parseImportPrice = (value) => {
  if (typeof value === "number") return value;
  const normalized = String(value ?? "").replace(/[^0-9.-]/g, "");
  return Number(normalized);
};

const productImportKey = (product) =>
  [product.title, product.property_type, product.location || ""].map((value) => String(value || "").trim().toLowerCase()).join("|");

const normalizeImportedProduct = (row, rowNumber) => {
  const title = firstTextValue(row, ["title", "name", "product_name", "product", "item", "item_name"]);
  const propertyType = firstTextValue(row, ["property_type", "category", "product_type", "type", "collection"]);
  const featuredSlug = slugify(firstTextValue(row, ["featured_slug", "subcategory", "sub_category", "featured", "featured_category"]));
  const rawPrice = row?.price ?? row?.unit_price ?? row?.selling_price ?? row?.amount ?? row?.cost;
  const price = parseImportPrice(rawPrice);
  const currency = firstTextValue(row, ["currency"]).toUpperCase() || "USD";
  const description = firstTextValue(row, ["description", "details", "notes"]);
  const longDescription = firstTextValue(row, ["long_description", "full_description", "rich_description"]);
  const location = firstTextValue(row, ["location", "sku", "model", "code"]);
  const city = firstTextValue(row, ["city", "warehouse"]) || "Harare";
  const imageUrl = firstTextValue(row, ["image", "image_url", "images", "photo"]);
  const errors = [];

  if (!title) errors.push("Missing product name.");
  if (!propertyType) errors.push("Missing category.");
  if (!Number.isFinite(price) || price < 0) errors.push("Invalid price.");
  if (!["USD", "ZWG"].includes(currency)) errors.push("Unsupported currency.");

  return {
    rowNumber,
    errors,
    product: {
      title,
      description,
      long_description: longDescription,
      property_type: propertyType,
      featured_slug: featuredSlug || null,
      price,
      currency,
      location,
      city,
      country: "Zimbabwe",
      images: imageUrl ? [imageUrl] : [],
      status: "approved",
      bedrooms: 0,
      bathrooms: 0,
      area_sqft: 0,
    },
  };
};

export const importCatalogueProducts = async ({ catalogueId, userId, rows }) => {
  if (!userId) {
    return { data: null, error: { message: "A signed-in admin is required to import products." } };
  }

  if (!Array.isArray(rows) || !rows.length) {
    return { data: null, error: { message: "No catalogue product rows were provided." } };
  }

  const state = loadState();
  if (!Array.isArray(state.catalogues)) state.catalogues = [];
  if (!Array.isArray(state.properties)) state.properties = [];

  const existingKeys = new Set(state.properties.map(productImportKey));
  const rejected = [];
  const imported = [];

  rows.slice(0, 500).forEach((row, index) => {
    const rowNumber = Number(row?.rowNumber || index + 2);
    const normalized = normalizeImportedProduct(row, rowNumber);

    if (normalized.errors.length) {
      rejected.push({ rowNumber, reason: normalized.errors.join(" ") });
      return;
    }

    const key = productImportKey(normalized.product);
    if (existingKeys.has(key)) {
      rejected.push({ rowNumber, reason: "Duplicate product name, category, and SKU/model." });
      return;
    }

    existingKeys.add(key);
    const product = normalizeInsertRow("properties", {
      ...normalized.product,
      user_id: userId,
    });
    state.properties.push(product);
    imported.push(product);
  });

  if (catalogueId) {
    const catalogue = state.catalogues.find((item) => item.id === catalogueId);
    if (catalogue) {
      catalogue.imported_count = Number(catalogue.imported_count || 0) + imported.length;
      catalogue.status = imported.length ? "imported" : "uploaded";
      catalogue.updated_at = nowIso();
    }
  }

  saveState(state);

  return {
    data: {
      importedCount: imported.length,
      rejected,
      products: imported,
    },
    error: null,
  };
};

const executeMutation = (state, payload) => {
  const { table, mode, filters = [], upsertConflict = null } = payload;
  const tableRows = clone(getTable(state, table));
  const payloadRows = Array.isArray(payload.payload) ? payload.payload : [payload.payload];

  if (mode === "insert") {
    const insertedRows = payloadRows.map((row) => normalizeInsertRow(table, row));
    setTable(state, table, [...tableRows, ...insertedRows]);

    if (table === "orders") {
      insertedRows.forEach((order) => {
        const items = Array.isArray(order.items) ? order.items : [];
        items.forEach((item) => {
          state.bookings.push(
            normalizeInsertRow("bookings", {
              property_id: item.id,
              user_id: String(order.user_id),
              booking_date: today(),
              status: order.status === "confirmed" ? "confirmed" : "pending",
              notes: `Order ${order.id}: ${item.name} x${item.quantity}`,
            }),
          );
        });
      });
    }

    saveState(state);
    return insertedRows;
  }

  if (mode === "upsert") {
    const conflictKey = upsertConflict || "id";
    const nextRows = [...tableRows];
    const updatedRows = [];

    payloadRows.forEach((row) => {
      const matchIndex = nextRows.findIndex((existing) => existing[conflictKey] === row[conflictKey]);
      if (matchIndex >= 0) {
        nextRows[matchIndex] = { ...nextRows[matchIndex], ...row };
        updatedRows.push(nextRows[matchIndex]);
      } else {
        const normalized = normalizeInsertRow(table, row);
        nextRows.push(normalized);
        updatedRows.push(normalized);
      }
    });

    setTable(state, table, nextRows);
    saveState(state);
    return updatedRows;
  }

  const matchingRows = getFilteredRows(
    { ...state, [table]: tableRows },
    { table, filters, columns: payload.columns, orderBy: payload.orderBy, limitCount: payload.limitCount },
  );

  if (mode === "update") {
    const nextRows = tableRows.map((row) => {
      const isMatch = matchingRows.some((match) => match.id === row.id);
      if (!isMatch) return row;
      return {
        ...row,
        ...payload.payload,
        updated_at: nowIso(),
      };
    });
    setTable(state, table, nextRows);
    saveState(state);
    return nextRows.filter((row) => matchingRows.some((match) => match.id === row.id));
  }

  if (mode === "delete") {
    const nextRows = tableRows.filter((row) => !matchingRows.some((match) => match.id === row.id));
    setTable(state, table, nextRows);
    saveState(state);
    return matchingRows;
  }

  return matchingRows;
};

export const executeQuery = async (payload) => {
  try {
    const state = loadState();
    const { mode = "select", singleMode = "many", selectOptions = {} } = payload;

    if (mode !== "select") {
      const mutatedRows = executeMutation(state, payload);
      if (singleMode === "single") {
        return { data: mutatedRows[0] || null, error: mutatedRows[0] ? null : { message: "Row not found" } };
      }
      if (singleMode === "maybeSingle") {
        return { data: mutatedRows[0] || null, error: null };
      }
      return { data: mutatedRows, error: null };
    }

    const rows = getFilteredRows(state, payload);
    const count = rows.length;
    const head = Boolean(selectOptions.head);

    if (singleMode === "single") {
      if (!rows.length) return { data: null, error: { message: "Row not found" } };
      return { data: rows[0], error: null };
    }

    if (singleMode === "maybeSingle") {
      return { data: rows[0] || null, error: null };
    }

    return { data: head ? null : rows, error: null, count };
  } catch (error) {
    return {
      data: null,
      error: { message: error instanceof Error ? error.message : "Unexpected backend error." },
    };
  }
};

const resolveSessionEntry = (state, accessToken) =>
  state.sessions.find((entry) => entry.access_token === accessToken && entry.expires_at > Date.now());

export const getSessionForToken = async (accessToken) => {
  if (!accessToken) return { data: { session: null }, error: null };

  const state = loadState();
  const sessionEntry = resolveSessionEntry(state, accessToken);
  if (!sessionEntry) return { data: { session: null }, error: null };

  const user = state.authUsers.find((entry) => entry.id === sessionEntry.user_id);
  if (!user) return { data: { session: null }, error: null };

  return { data: { session: buildSession(user, sessionEntry.access_token) }, error: null };
};

export const signInWithPassword = async ({ email, password }) => {
  const state = loadState();
  const user = state.authUsers.find((entry) => entry.email.toLowerCase() === email.toLowerCase());
  if (!user || user.password !== password) {
    return { data: { session: null, user: null }, error: { message: "Invalid email or password." } };
  }

  const session = buildSession(user);
  state.sessions = state.sessions.filter((entry) => entry.user_id !== user.id);
  state.sessions.push({
    access_token: session.access_token,
    user_id: user.id,
    expires_at: session.expires_at,
  });
  saveState(state);
  return { data: { session, user: session.user }, error: null };
};

export const signUp = async ({ email, password, options }) => {
  const state = loadState();
  const exists = state.authUsers.some((entry) => entry.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return { data: { user: null, session: null }, error: { message: "An account with this email already exists." } };
  }

  const user = {
    id: uid("user"),
    email,
    password,
    created_at: nowIso(),
    user_metadata: {
      full_name: options?.data?.full_name || "",
      phone: options?.data?.phone || "",
    },
  };

  state.authUsers.push(user);
  state.profiles.push({
    id: uid("profile"),
    user_id: user.id,
    full_name: String(user.user_metadata.full_name || ""),
    currency: "USD",
    phone: typeof user.user_metadata.phone === "string" ? user.user_metadata.phone : null,
    status: "active",
    created_at: user.created_at,
    updated_at: user.created_at,
  });
  state.user_roles.push({
    id: uid("role"),
    user_id: user.id,
    role: "user",
  });

  const session = buildSession(user);
  state.sessions.push({
    access_token: session.access_token,
    user_id: user.id,
    expires_at: session.expires_at,
  });
  saveState(state);
  return { data: { user: session.user, session }, error: null };
};

export const resetPasswordDirect = async ({ email, password }) => {
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const nextPassword = typeof password === "string" ? password : "";

  if (!normalizedEmail) {
    return { data: { user: null }, error: { message: "Enter the email address for this account." } };
  }

  if (nextPassword.length < 6) {
    return { data: { user: null }, error: { message: "Password must be at least 6 characters." } };
  }

  const state = loadState();
  const user = state.authUsers.find((entry) => entry.email.toLowerCase() === normalizedEmail);

  if (!user) {
    return { data: { user: null }, error: { message: "No account exists for that email." } };
  }

  user.password = nextPassword;
  state.sessions = state.sessions.filter((entry) => entry.user_id !== user.id);
  saveState(state);

  return {
    data: {
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        user_metadata: user.user_metadata || {},
      },
    },
    error: null,
  };
};

export const signOut = async (accessToken) => {
  const state = loadState();
  state.sessions = state.sessions.filter((entry) => entry.access_token !== accessToken);
  saveState(state);
  return { error: null };
};

export const setSession = async ({ access_token }) => {
  const sessionResponse = await getSessionForToken(access_token);
  if (!sessionResponse.data.session) {
    return { data: { session: null }, error: { message: "Could not restore session." } };
  }
  return { data: { session: sessionResponse.data.session }, error: null };
};

export const invokeFunction = async (name, body = {}, origin = "") => {
  const state = loadState();

  if (name === "generate-product-description") {
    return { data: await buildGeneratedProductCopyWithAI(body), error: null };
  }

  if (name === "send-rfq-notification") {
    state.rfq_requests.unshift(
      normalizeInsertRow("rfq_requests", {
        full_name: String(body?.full_name || ""),
        company_name: body?.company_name ? String(body.company_name) : null,
        email: String(body?.email || ""),
        phone: body?.phone ? String(body.phone) : null,
        product_interest: body?.product_interest ? String(body.product_interest) : null,
        quantity: typeof body?.quantity === "number" ? body.quantity : null,
        message: body?.message ? String(body.message) : null,
        status: "New",
      }),
    );
    saveState(state);
    return { data: { ok: true }, error: null };
  }

  if (name === "create-checkout") {
    return {
      data: {
        url: `${origin || ""}/dashboard?payment=mock-success`,
      },
      error: null,
    };
  }

  if (name === "currency-rate") {
    const settings = state.currency_settings?.find((item) => item.id === "storefront") || buildDefaultCurrencySettings();
    const cacheHours = Math.max(1, Number(settings.cache_hours || 24));
    const cachedAt = settings.last_rate_updated_at ? new Date(settings.last_rate_updated_at).getTime() : 0;
    const cacheIsFresh = Number.isFinite(cachedAt) && Date.now() - cachedAt < cacheHours * 60 * 60 * 1000;

    if (!settings.auto_update) {
      return {
        data: buildCurrencyRatePayload({
          settings,
          baseRate: resolveCurrencyBaseRate(settings.manual_rate, settings.fallback_rate),
          source: "manual",
          updatedAt: settings.updated_at,
          autoUpdate: false,
        }),
        error: null,
      };
    }

    if (cacheIsFresh && Number(settings.last_live_rate) > 0) {
      return {
        data: buildCurrencyRatePayload({
          settings,
          baseRate: settings.last_live_rate,
          source: "live-cache",
          updatedAt: settings.last_rate_updated_at,
          autoUpdate: true,
        }),
        error: null,
      };
    }

    try {
      const response = await fetch(settings.rate_source_url, { signal: AbortSignal.timeout(8000) });
      if (!response.ok) throw new Error(`Rate service returned ${response.status}.`);
      const payload = await response.json();
      const liveRate = Number(payload?.rates?.ZWG);
      if (!Number.isFinite(liveRate) || liveRate <= 0) throw new Error("ZWG rate was missing.");

      settings.last_live_rate = liveRate;
      settings.last_rate_updated_at = nowIso();
      settings.updated_at = nowIso();
      if (!state.currency_settings?.length) state.currency_settings = [settings];
      saveState(state);

      return {
        data: buildCurrencyRatePayload({
          settings,
          baseRate: liveRate,
          source: "live",
          updatedAt: settings.last_rate_updated_at,
          autoUpdate: true,
        }),
        error: null,
      };
    } catch (error) {
      return {
        data: buildCurrencyRatePayload({
          settings,
          baseRate: resolveCurrencyBaseRate(settings.last_live_rate, settings.fallback_rate, settings.manual_rate),
          source: settings.last_live_rate ? "stale-cache" : "fallback",
          updatedAt: settings.last_rate_updated_at || settings.updated_at,
          autoUpdate: true,
        }),
        error: null,
      };
    }
  }

  return { data: null, error: { message: `Function "${name}" is not available in project mode.` } };
};

const mimeFromExt = (ext) => {
  switch (ext.toLowerCase()) {
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".svg":
      return "image/svg+xml";
    case ".pdf":
      return "application/pdf";
    case ".csv":
      return "text/csv";
    case ".tsv":
      return "text/tab-separated-values";
    case ".txt":
      return "text/plain";
    case ".xls":
      return "application/vnd.ms-excel";
    case ".xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case ".doc":
      return "application/msword";
    case ".docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case ".jpeg":
    case ".jpg":
    default:
      return "image/jpeg";
  }
};

export const uploadFile = async ({ path: relativePath, dataUrl }) => {
  if (!relativePath || !dataUrl) {
    return { data: null, error: { message: "Path and file content are required." } };
  }

  const match = String(dataUrl).match(/^data:(.+);base64,(.+)$/);
  if (!match) {
    return { data: null, error: { message: "Invalid upload payload." } };
  }

  const safeRelativePath = path.normalize(String(relativePath).replace(/^\/+/, ""));
  if (safeRelativePath.startsWith("..") || path.isAbsolute(safeRelativePath)) {
    return { data: null, error: { message: "Invalid upload path." } };
  }

  const publicPath = safeRelativePath.replace(/\\/g, "/");
  const destination = path.join(uploadRoot, safeRelativePath);
  if (!destination.startsWith(uploadRoot)) {
    return { data: null, error: { message: "Invalid upload path." } };
  }

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, Buffer.from(match[2], "base64"));

  return {
    data: {
      path: publicPath,
      publicUrl: `/uploads/${publicPath}`,
      contentType: match[1] || mimeFromExt(path.extname(safeRelativePath)),
    },
    error: null,
  };
};

export const getUploadFile = (requestPath) => {
  const safePath = path.normalize(requestPath.replace(/^\/+/, ""));
  const filePath = path.join(uploadRoot, safePath);

  if (!filePath.startsWith(uploadRoot) || !fs.existsSync(filePath)) {
    return null;
  }

  return {
    filePath,
    contentType: mimeFromExt(path.extname(filePath)),
  };
};

export const backendPaths = {
  projectRoot,
  uploadRoot,
};
