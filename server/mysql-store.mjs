import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";
import { fileURLToPath } from "node:url";
import { buildGeneratedProductCopy as buildGeneratedProductCopyWithAI } from "./product-ai.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;
const schemaFile = path.join(__dirname, "db", "schema.sql");
const legacyStoreFile = path.join(__dirname, "data", "store.json");

const JSON_COLUMNS = {
  auth_users: ["user_metadata"],
  properties: ["images", "color_variants", "institution_slugs"],
  product_categories: ["features"],
  product_pairings: ["recommended_ids"],
  product_promotions: ["product_ids", "category_targets"],
  promotional_banners: ["placements"],
  orders: ["items"],
};

const TABLE_COLUMNS = {
  auth_users: ["id", "email", "password", "created_at", "user_metadata"],
  sessions: ["access_token", "user_id", "expires_at"],
  profiles: ["id", "user_id", "full_name", "currency", "phone", "status", "created_at", "updated_at"],
  user_roles: ["id", "user_id", "role"],
  product_categories: ["id", "name", "slug", "image_url", "features", "created_at", "updated_at", "user_id"],
  product_institutions: ["id", "name", "slug", "description", "image_url", "display_order", "status", "created_at", "updated_at", "user_id"],
  currency_settings: ["id", "auto_update", "manual_rate", "fallback_rate", "profit_margin_enabled", "profit_margin_usd", "cache_hours", "rate_source_url", "last_live_rate", "last_rate_updated_at", "updated_at", "user_id"],
  properties: ["id", "title", "description", "long_description", "property_type", "featured_slug", "price", "currency", "location", "city", "country", "images", "color_variants", "institution_slugs", "status", "featured", "bedrooms", "bathrooms", "area_sqft", "created_at", "updated_at", "user_id"],
  product_pairings: ["id", "product_id", "recommended_ids"],
  product_promotions: ["id", "title", "description", "promotion_type", "discount_type", "discount_value", "offer_label", "product_ids", "category_targets", "status", "starts_at", "ends_at", "created_at", "updated_at", "user_id"],
  catalogues: ["id", "title", "category", "year", "month", "document_url", "document_name", "document_type", "cover_image_url", "imported_count", "status", "created_at", "updated_at", "user_id"],
  hero_slides: ["id", "eyebrow", "accent_title", "title", "description", "image_url", "image_alt", "cta_label", "cta_href", "cta_enabled", "display_order", "status", "created_at", "updated_at", "user_id"],
  promotional_banners: ["id", "title", "subtitle", "category", "background_image_url", "cta_label", "cta_href", "placements", "status", "starts_at", "ends_at", "has_countdown", "countdown_ends_at", "created_at", "updated_at", "user_id"],
  inquiries: ["id", "created_at", "email", "message", "name", "phone", "property_id", "status", "user_id"],
  leads: ["id", "created_at", "email", "name", "notes", "phone", "source", "status"],
  orders: ["id", "created_at", "currency", "items", "phone", "shipping_address", "status", "total", "updated_at", "user_id"],
  bookings: ["id", "booking_date", "created_at", "notes", "property_id", "status", "updated_at", "user_id"],
  messages: ["id", "body", "created_at", "read", "recipient_id", "sender_id", "subject"],
  subscriptions: ["id", "amount", "created_at", "currency", "end_date", "plan_name", "start_date", "status", "updated_at", "user_id"],
  rfq_requests: ["id", "created_at", "full_name", "company_name", "email", "phone", "product_interest", "quantity", "message", "status"],
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
    image_url: "/images/institutions/hospitals.jpg",
  },
  {
    name: "Hotels",
    slug: "hotels",
    description: "Reception, lounge, back-office, dining, and room-support furniture for hospitality spaces that need comfort and polish.",
    image_url: "/images/institutions/hotels.jpg",
  },
  {
    name: "Schools",
    slug: "schools",
    description: "Furniture for offices, staff rooms, libraries, labs, administration blocks, and flexible learning support areas.",
    image_url: "/images/institutions/schools.jpg",
  },
];

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

const buildDefaultCurrencySettings = (timestamp = nowIso()) => ({
  id: "storefront",
  auto_update: true,
  manual_rate: 27,
  fallback_rate: 27,
  profit_margin_enabled: false,
  profit_margin_usd: 0,
  cache_hours: 24,
  rate_source_url: "https://open.er-api.com/v6/latest/USD",
  last_live_rate: null,
  last_rate_updated_at: null,
  updated_at: timestamp,
  user_id: null,
});

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

let pool;
let initialized = false;

const OPTIONAL_SCHEMA_COLUMNS = {
  properties: [
    { name: "long_description", definition: "LONGTEXT NULL AFTER `description`" },
    { name: "featured_slug", definition: "VARCHAR(255) NULL AFTER `property_type`" },
    { name: "color_variants", definition: "LONGTEXT NULL AFTER `images`" },
    { name: "institution_slugs", definition: "LONGTEXT NULL AFTER `color_variants`" },
  ],
  promotional_banners: [
    { name: "background_image_url", definition: "LONGTEXT NULL" },
  ],
  hero_slides: [
    { name: "cta_enabled", definition: "TINYINT(1) NOT NULL DEFAULT 1 AFTER `cta_href`" },
  ],
  currency_settings: [
    { name: "profit_margin_enabled", definition: "TINYINT(1) NOT NULL DEFAULT 0 AFTER `fallback_rate`" },
  ],
};

export const isMysqlConfigured = () =>
  Boolean(process.env.MYSQL_HOST && process.env.MYSQL_USER && process.env.MYSQL_DATABASE);

const getPool = () => {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT || 3306),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD || "",
      database: process.env.MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
    });
  }
  return pool;
};

const asDbDateTime = (value) => {
  if (!value) return null;
  if (typeof value === "number") return value;
  return `${String(value).replace("T", " ").replace("Z", "").slice(0, 19)}`;
};

const serializeRow = (table, row) => {
  const jsonColumns = JSON_COLUMNS[table] || [];
  const next = { ...row };
  jsonColumns.forEach((column) => {
    if (column in next) next[column] = JSON.stringify(next[column] ?? null);
  });
  ["created_at", "updated_at", "start_date", "end_date", "booking_date", "starts_at", "ends_at", "countdown_ends_at", "last_rate_updated_at"].forEach((key) => {
    if (key in next && next[key]) next[key] = asDbDateTime(next[key]);
  });
  if ("featured" in next && typeof next.featured === "boolean") next.featured = next.featured ? 1 : 0;
  if ("read" in next && typeof next.read === "boolean") next.read = next.read ? 1 : 0;
  if ("has_countdown" in next && typeof next.has_countdown === "boolean") next.has_countdown = next.has_countdown ? 1 : 0;
  if ("cta_enabled" in next && typeof next.cta_enabled === "boolean") next.cta_enabled = next.cta_enabled ? 1 : 0;
  if ("auto_update" in next && typeof next.auto_update === "boolean") next.auto_update = next.auto_update ? 1 : 0;
  if ("profit_margin_enabled" in next && typeof next.profit_margin_enabled === "boolean") next.profit_margin_enabled = next.profit_margin_enabled ? 1 : 0;
  return next;
};

const deserializeRow = (table, row) => {
  const jsonColumns = JSON_COLUMNS[table] || [];
  const next = { ...row };
  jsonColumns.forEach((column) => {
    if (typeof next[column] === "string") {
      try {
        next[column] = JSON.parse(next[column]);
      } catch {
        next[column] = null;
      }
    }
  });
  if ("featured" in next) next.featured = next.featured === null ? null : Boolean(next.featured);
  if ("read" in next) next.read = next.read === null ? null : Boolean(next.read);
  if ("has_countdown" in next) next.has_countdown = next.has_countdown === null ? null : Boolean(next.has_countdown);
  if ("cta_enabled" in next) next.cta_enabled = next.cta_enabled === null ? true : Boolean(next.cta_enabled);
  if ("auto_update" in next) next.auto_update = next.auto_update === null ? true : Boolean(next.auto_update);
  if ("profit_margin_enabled" in next) next.profit_margin_enabled = next.profit_margin_enabled === null ? false : Boolean(next.profit_margin_enabled);
  ["price", "total", "amount", "quantity", "year", "month", "imported_count", "discount_value", "display_order", "manual_rate", "fallback_rate", "profit_margin_usd", "cache_hours", "last_live_rate"].forEach((key) => {
    if (key in next && next[key] !== null) next[key] = Number(next[key]);
  });
  ["created_at", "updated_at", "start_date", "end_date", "booking_date", "starts_at", "ends_at", "countdown_ends_at", "last_rate_updated_at"].forEach((key) => {
    if (next[key] instanceof Date) next[key] = next[key].toISOString();
  });
  return next;
};

const seedState = () => {
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

  return {
    authUsers,
    sessions: [],
    profiles: authUsers.map((user) => ({
      id: uid("profile"),
      user_id: user.id,
      full_name: String(user.user_metadata.full_name || ""),
      currency: "USD",
      phone: typeof user.user_metadata.phone === "string" ? user.user_metadata.phone : null,
      status: "active",
      created_at: createdAt,
      updated_at: createdAt,
    })),
    user_roles: [
      { id: uid("role"), user_id: authUsers[0].id, role: "admin" },
      { id: uid("role"), user_id: authUsers[1].id, role: "admin" },
      { id: uid("role"), user_id: authUsers[2].id, role: "user" },
    ],
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
        body: "This project is now using the MySQL-backed server adapter.",
        created_at: createdAt,
        read: false,
        recipient_id: authUsers[0].id,
        sender_id: null,
        subject: "MySQL Backend Ready",
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

const importState = async (state) => {
  const db = getPool();
  for (const [table, rows] of Object.entries(state)) {
    if (!TABLE_COLUMNS[table] || !Array.isArray(rows) || !rows.length) continue;
    for (const row of rows) {
      const preparedRow =
        table === "product_categories"
          ? { ...row, features: normalizeCategoryFeaturedItems(row.features || [], row.image_url) }
          : row;
      const normalized = serializeRow(table, preparedRow);
      const columns = TABLE_COLUMNS[table].filter((column) => column in normalized);
      const updateColumns = columns.filter((column) => column !== "id");
      await db.query(
        `INSERT INTO \`${table}\` (${columns.map((column) => `\`${column}\``).join(", ")}) VALUES (${columns.map(() => "?").join(", ")}) ON DUPLICATE KEY UPDATE ${updateColumns.map((column) => `\`${column}\` = VALUES(\`${column}\`)`).join(", ")}`,
        columns.map((column) => normalized[column]),
      );
    }
  }
};

export const ensureMysqlReady = async () => {
  if (!isMysqlConfigured()) return false;
  if (initialized) return true;

  const db = getPool();
  const schema = fs.readFileSync(schemaFile, "utf8");
  for (const statement of schema.split(/;\s*\n/).map((item) => item.trim()).filter(Boolean)) {
    await db.query(statement);
  }

  for (const [table, columns] of Object.entries(OPTIONAL_SCHEMA_COLUMNS)) {
    for (const column of columns) {
      const [[existing]] = await db.query(
        "SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?",
        [table, column.name],
      );
      if (!Number(existing.count)) {
        await db.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column.name}\` ${column.definition}`);
      }
    }
  }

  const [[countRow]] = await db.query("SELECT COUNT(*) AS count FROM auth_users");
  if (!countRow.count) {
    if (fs.existsSync(legacyStoreFile)) {
      await importState(JSON.parse(fs.readFileSync(legacyStoreFile, "utf8")));
    } else {
      await importState(seedState());
    }
  }

  const [[categoryCountRow]] = await db.query("SELECT COUNT(*) AS count FROM product_categories");
  if (!Number(categoryCountRow.count)) {
    await importState({ product_categories: buildDefaultCategoryRows() });
  }

  const [[institutionCountRow]] = await db.query("SELECT COUNT(*) AS count FROM product_institutions");
  if (!Number(institutionCountRow.count)) {
    await importState({ product_institutions: buildDefaultInstitutionRows() });
  }

  const [[currencySettingsCountRow]] = await db.query("SELECT COUNT(*) AS count FROM currency_settings");
  if (!Number(currencySettingsCountRow.count)) {
    await importState({ currency_settings: [buildDefaultCurrencySettings()] });
  }

  initialized = true;
  return true;
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

const normalizeInsertRow = (table, row) => {
  const timestamp = nowIso();
  switch (table) {
    case "profiles":
      return { id: uid("profile"), created_at: timestamp, updated_at: timestamp, status: "active", currency: "USD", phone: null, full_name: null, ...row };
    case "user_roles":
      return { id: uid("role"), role: "user", ...row };
    case "properties":
      return { id: uid("property"), created_at: timestamp, updated_at: timestamp, status: "approved", featured: false, featured_slug: null, bedrooms: 0, bathrooms: 0, area_sqft: 0, country: "Zimbabwe", images: [], color_variants: [], institution_slugs: [], ...row };
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
      return { ...buildDefaultCurrencySettings(timestamp), ...row, updated_at: timestamp };
    case "product_pairings":
      return { id: uid("pair"), recommended_ids: [], ...row };
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
      return { id: uid("catalogue"), created_at: timestamp, updated_at: timestamp, imported_count: 0, status: "uploaded", ...row };
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
      return { id: uid("inq"), created_at: timestamp, property_id: null, status: "new", user_id: null, phone: null, message: null, ...row };
    case "leads":
      return { id: uid("lead"), created_at: timestamp, notes: null, phone: null, source: null, status: "new", ...row };
    case "orders":
      return { id: uid("order"), created_at: timestamp, updated_at: timestamp, currency: "USD", items: [], phone: null, shipping_address: null, status: "pending", total: 0, ...row };
    case "bookings":
      return { id: uid("booking"), created_at: timestamp, updated_at: timestamp, notes: null, status: "pending", booking_date: today(), ...row };
    case "messages":
      return { id: uid("msg"), created_at: timestamp, read: false, recipient_id: null, sender_id: null, subject: null, ...row };
    case "subscriptions":
      return { id: uid("sub"), created_at: timestamp, updated_at: timestamp, currency: "USD", end_date: null, amount: 0, status: "active", start_date: today(), ...row };
    case "rfq_requests":
      return { id: uid("rfq"), created_at: timestamp, company_name: null, phone: null, product_interest: null, quantity: null, message: null, status: "New", ...row };
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
  await ensureMysqlReady();

  if (!userId) {
    return { data: null, error: { message: "A signed-in admin is required to import products." } };
  }

  if (!Array.isArray(rows) || !rows.length) {
    return { data: null, error: { message: "No catalogue product rows were provided." } };
  }

  const db = getPool();
  const [existingRows] = await db.query("SELECT title, property_type, location FROM properties");
  const existingKeys = new Set(existingRows.map((row) => productImportKey(row)));
  const rejected = [];
  const imported = [];

  for (const [index, row] of rows.slice(0, 500).entries()) {
    const rowNumber = Number(row?.rowNumber || index + 2);
    const normalized = normalizeImportedProduct(row, rowNumber);

    if (normalized.errors.length) {
      rejected.push({ rowNumber, reason: normalized.errors.join(" ") });
      continue;
    }

    const key = productImportKey(normalized.product);
    if (existingKeys.has(key)) {
      rejected.push({ rowNumber, reason: "Duplicate product name, category, and SKU/model." });
      continue;
    }

    existingKeys.add(key);
    const product = normalizeInsertRow("properties", {
      ...normalized.product,
      user_id: userId,
    });
    const serialized = serializeRow("properties", product);
    const columns = TABLE_COLUMNS.properties.filter((column) => column in serialized);
    await db.query(
      `INSERT INTO properties (${columns.map((column) => `\`${column}\``).join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`,
      columns.map((column) => serialized[column]),
    );
    imported.push(product);
  }

  if (catalogueId) {
    await db.query(
      "UPDATE catalogues SET imported_count = imported_count + ?, status = ?, updated_at = ? WHERE id = ?",
      [imported.length, imported.length ? "imported" : "uploaded", asDbDateTime(nowIso()), catalogueId],
    );
  }

  return {
    data: {
      importedCount: imported.length,
      rejected,
      products: imported,
    },
    error: null,
  };
};

const buildWhere = (filters = []) => {
  if (!filters.length) return { clause: "", params: [] };
  return {
    clause: ` WHERE ${filters.map((filter) => `\`${filter.field}\` = ?`).join(" AND ")}`,
    params: filters.map((filter) => filter.value),
  };
};

const selectRows = async (table, payload) => {
  await ensureMysqlReady();
  const db = getPool();
  const { clause, params } = buildWhere(payload.filters || []);
  const orderBy = payload.orderBy ? ` ORDER BY \`${payload.orderBy.field}\` ${payload.orderBy.ascending ? "ASC" : "DESC"}` : "";
  const limitClause = payload.limitCount !== null && payload.limitCount !== undefined ? ` LIMIT ${Number(payload.limitCount)}` : "";
  const [rows] = await db.query(`SELECT * FROM \`${table}\`${clause}${orderBy}${limitClause}`, params);
  let parsed = rows.map((row) => deserializeRow(table, row));

  if (table === "bookings" && typeof payload.columns === "string" && payload.columns.includes("properties(")) {
    const propertyIds = [...new Set(parsed.map((row) => row.property_id).filter(Boolean))];
    const propertyMap = new Map();
    if (propertyIds.length) {
      const [propertyRows] = await db.query(`SELECT id, title FROM properties WHERE id IN (${propertyIds.map(() => "?").join(", ")})`, propertyIds);
      propertyRows.forEach((row) => propertyMap.set(row.id, row.title));
    }
    parsed = parsed.map((row) => ({ ...row, properties: row.property_id ? { title: propertyMap.get(row.property_id) || null } : null }));
  }

  return parsed;
};

export const executeQuery = async (payload) => {
  try {
    await ensureMysqlReady();
    const { table, mode = "select", singleMode = "many", selectOptions = {}, upsertConflict = null } = payload;
    const db = getPool();

    if (mode === "select") {
      const rows = await selectRows(table, payload);
      const count = rows.length;
      const head = Boolean(selectOptions.head);
      if (singleMode === "single") return rows.length ? { data: rows[0], error: null } : { data: null, error: { message: "Row not found" } };
      if (singleMode === "maybeSingle") return { data: rows[0] || null, error: null };
      return { data: head ? null : rows, error: null, count };
    }

    if (mode === "insert") {
      const rows = (Array.isArray(payload.payload) ? payload.payload : [payload.payload]).map((row) => normalizeInsertRow(table, row));
      for (const row of rows) {
        const normalized = serializeRow(table, row);
        const columns = TABLE_COLUMNS[table].filter((column) => column in normalized);
        await db.query(
          `INSERT INTO \`${table}\` (${columns.map((column) => `\`${column}\``).join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`,
          columns.map((column) => normalized[column]),
        );

        if (table === "orders") {
          const items = Array.isArray(row.items) ? row.items : [];
          for (const item of items) {
            const booking = normalizeInsertRow("bookings", {
              property_id: item.id,
              user_id: String(row.user_id),
              booking_date: today(),
              status: row.status === "confirmed" ? "confirmed" : "pending",
              notes: `Order ${row.id}: ${item.name} x${item.quantity}`,
            });
            const serializedBooking = serializeRow("bookings", booking);
            const bookingColumns = TABLE_COLUMNS.bookings.filter((column) => column in serializedBooking);
            await db.query(
              `INSERT INTO bookings (${bookingColumns.map((column) => `\`${column}\``).join(", ")}) VALUES (${bookingColumns.map(() => "?").join(", ")})`,
              bookingColumns.map((column) => serializedBooking[column]),
            );
          }
        }
      }
      if (singleMode === "single") return { data: rows[0] || null, error: rows[0] ? null : { message: "Row not found" } };
      if (singleMode === "maybeSingle") return { data: rows[0] || null, error: null };
      return { data: rows, error: null };
    }

    if (mode === "upsert") {
      const rows = Array.isArray(payload.payload) ? payload.payload : [payload.payload];
      const updatedRows = [];
      for (const row of rows) {
        const normalizedRow = normalizeInsertRow(table, row);
        const serialized = serializeRow(table, normalizedRow);
        const columns = TABLE_COLUMNS[table].filter((column) => column in serialized);
        const conflictKey = upsertConflict || "id";
        const updates = columns.filter((column) => column !== conflictKey).map((column) => `\`${column}\` = VALUES(\`${column}\`)`).join(", ");
        await db.query(
          `INSERT INTO \`${table}\` (${columns.map((column) => `\`${column}\``).join(", ")}) VALUES (${columns.map(() => "?").join(", ")}) ON DUPLICATE KEY UPDATE ${updates}`,
          columns.map((column) => serialized[column]),
        );
        updatedRows.push(clone(normalizedRow));
      }
      if (singleMode === "single") return { data: updatedRows[0] || null, error: updatedRows[0] ? null : { message: "Row not found" } };
      if (singleMode === "maybeSingle") return { data: updatedRows[0] || null, error: null };
      return { data: updatedRows, error: null };
    }

    const matchingRows = await selectRows(table, payload);
    if (mode === "update") {
      const updates = Array.isArray(payload.payload) ? payload.payload[0] || {} : payload.payload || {};
      const serializedUpdates = serializeRow(table, updates);
      const keys = Object.keys(serializedUpdates);
      const assignments = keys.map((key) => `\`${key}\` = ?`);
      if (!keys.includes("updated_at")) {
        assignments.push("`updated_at` = ?");
      }
      const { clause, params } = buildWhere(payload.filters || []);
      await db.query(
        `UPDATE \`${table}\` SET ${assignments.join(", ")}${clause}`,
        [...keys.map((key) => serializedUpdates[key]), ...(keys.includes("updated_at") ? [] : [asDbDateTime(nowIso())]), ...params],
      );
      const affected = await selectRows(table, payload);
      if (singleMode === "single") return { data: affected[0] || null, error: affected[0] ? null : { message: "Row not found" } };
      if (singleMode === "maybeSingle") return { data: affected[0] || null, error: null };
      return { data: affected.length ? affected : matchingRows, error: null };
    }

    if (mode === "delete") {
      const { clause, params } = buildWhere(payload.filters || []);
      await db.query(`DELETE FROM \`${table}\`${clause}`, params);
      if (singleMode === "single") return { data: matchingRows[0] || null, error: matchingRows[0] ? null : { message: "Row not found" } };
      if (singleMode === "maybeSingle") return { data: matchingRows[0] || null, error: null };
      return { data: matchingRows, error: null };
    }

    return { data: [], error: null };
  } catch (error) {
    return { data: null, error: { message: error instanceof Error ? error.message : "Unexpected MySQL backend error." } };
  }
};

export const getSessionForToken = async (accessToken) => {
  await ensureMysqlReady();
  if (!accessToken) return { data: { session: null }, error: null };
  const db = getPool();
  const [sessionRows] = await db.query("SELECT access_token, user_id, expires_at FROM sessions WHERE access_token = ? AND expires_at > ? LIMIT 1", [accessToken, Date.now()]);
  if (!sessionRows.length) return { data: { session: null }, error: null };
  const [userRows] = await db.query("SELECT * FROM auth_users WHERE id = ? LIMIT 1", [sessionRows[0].user_id]);
  if (!userRows.length) return { data: { session: null }, error: null };
  const user = deserializeRow("auth_users", userRows[0]);
  return { data: { session: buildSession(user, sessionRows[0].access_token) }, error: null };
};

export const signInWithPassword = async ({ email, password }) => {
  await ensureMysqlReady();
  const db = getPool();
  const [rows] = await db.query("SELECT * FROM auth_users WHERE LOWER(email) = LOWER(?) LIMIT 1", [email]);
  if (!rows.length) return { data: { session: null, user: null }, error: { message: "Invalid email or password." } };
  const user = deserializeRow("auth_users", rows[0]);
  if (user.password !== password) return { data: { session: null, user: null }, error: { message: "Invalid email or password." } };
  const session = buildSession(user);
  await db.query("DELETE FROM sessions WHERE user_id = ?", [user.id]);
  await db.query("INSERT INTO sessions (access_token, user_id, expires_at) VALUES (?, ?, ?)", [session.access_token, user.id, session.expires_at]);
  return { data: { session, user: session.user }, error: null };
};

export const signUp = async ({ email, password, options }) => {
  await ensureMysqlReady();
  const db = getPool();
  const [existing] = await db.query("SELECT id FROM auth_users WHERE LOWER(email) = LOWER(?) LIMIT 1", [email]);
  if (existing.length) return { data: { user: null, session: null }, error: { message: "An account with this email already exists." } };
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
  await db.query("INSERT INTO auth_users (id, email, password, created_at, user_metadata) VALUES (?, ?, ?, ?, ?)", [user.id, user.email, user.password, asDbDateTime(user.created_at), JSON.stringify(user.user_metadata)]);
  await db.query("INSERT INTO profiles (id, user_id, full_name, currency, phone, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [uid("profile"), user.id, user.user_metadata.full_name || "", "USD", user.user_metadata.phone || null, "active", asDbDateTime(user.created_at), asDbDateTime(user.created_at)]);
  await db.query("INSERT INTO user_roles (id, user_id, role) VALUES (?, ?, ?)", [uid("role"), user.id, "user"]);
  const session = buildSession(user);
  await db.query("INSERT INTO sessions (access_token, user_id, expires_at) VALUES (?, ?, ?)", [session.access_token, user.id, session.expires_at]);
  return { data: { user: session.user, session }, error: null };
};

export const resetPasswordDirect = async ({ email, password }) => {
  await ensureMysqlReady();

  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const nextPassword = typeof password === "string" ? password : "";

  if (!normalizedEmail) {
    return { data: { user: null }, error: { message: "Enter the email address for this account." } };
  }

  if (nextPassword.length < 6) {
    return { data: { user: null }, error: { message: "Password must be at least 6 characters." } };
  }

  const db = getPool();
  const [rows] = await db.query("SELECT * FROM auth_users WHERE LOWER(email) = LOWER(?) LIMIT 1", [normalizedEmail]);

  if (!rows.length) {
    return { data: { user: null }, error: { message: "No account exists for that email." } };
  }

  const user = deserializeRow("auth_users", rows[0]);
  await db.query("UPDATE auth_users SET password = ? WHERE id = ?", [nextPassword, user.id]);
  await db.query("DELETE FROM sessions WHERE user_id = ?", [user.id]);

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
  await ensureMysqlReady();
  if (!accessToken) return { error: null };
  await getPool().query("DELETE FROM sessions WHERE access_token = ?", [accessToken]);
  return { error: null };
};

export const setSession = async ({ access_token }) => {
  const response = await getSessionForToken(access_token);
  if (!response.data.session) return { data: { session: null }, error: { message: "Could not restore session." } };
  return { data: { session: response.data.session }, error: null };
};

export const invokeFunction = async (name, body = {}, origin = "") => {
  await ensureMysqlReady();
  if (name === "generate-product-description") {
    return { data: await buildGeneratedProductCopyWithAI(body), error: null };
  }

  if (name === "send-rfq-notification") {
    await executeQuery({
      table: "rfq_requests",
      mode: "insert",
      payload: {
        full_name: String(body?.full_name || ""),
        company_name: body?.company_name ? String(body.company_name) : null,
        email: String(body?.email || ""),
        phone: body?.phone ? String(body.phone) : null,
        product_interest: body?.product_interest ? String(body.product_interest) : null,
        quantity: typeof body?.quantity === "number" ? body.quantity : null,
        message: body?.message ? String(body.message) : null,
        status: "New",
      },
    });
    return { data: { ok: true }, error: null };
  }

  if (name === "create-checkout") {
    return { data: { url: `${origin || ""}/dashboard?payment=mock-success` }, error: null };
  }

  if (name === "currency-rate") {
    const db = getPool();
    const [rows] = await db.query("SELECT * FROM currency_settings WHERE id = 'storefront' LIMIT 1");
    const settings = rows[0] ? deserializeRow("currency_settings", rows[0]) : buildDefaultCurrencySettings();
    const marginEnabled = settings.profit_margin_enabled === true;
    const marginUsd = marginEnabled ? Number(settings.profit_margin_usd || 0) : 0;
    const cacheHours = Math.max(1, Number(settings.cache_hours || 24));
    const cachedAt = settings.last_rate_updated_at ? new Date(settings.last_rate_updated_at).getTime() : 0;
    const cacheIsFresh = Number.isFinite(cachedAt) && Date.now() - cachedAt < cacheHours * 60 * 60 * 1000;

    if (!settings.auto_update) {
      return {
        data: {
          rate: Number(settings.manual_rate || settings.fallback_rate || 27),
          marginUsd,
          marginEnabled,
          source: "manual",
          updatedAt: settings.updated_at,
          autoUpdate: false,
        },
        error: null,
      };
    }

    if (cacheIsFresh && Number(settings.last_live_rate) > 0) {
      return {
        data: {
          rate: Number(settings.last_live_rate),
          marginUsd,
          marginEnabled,
          source: "live-cache",
          updatedAt: settings.last_rate_updated_at,
          autoUpdate: true,
        },
        error: null,
      };
    }

    try {
      const response = await fetch(settings.rate_source_url, { signal: AbortSignal.timeout(8000) });
      if (!response.ok) throw new Error(`Rate service returned ${response.status}.`);
      const payload = await response.json();
      const liveRate = Number(payload?.rates?.ZWG);
      if (!Number.isFinite(liveRate) || liveRate <= 0) throw new Error("ZWG rate was missing.");
      const updatedAt = nowIso();
      await db.query(
        "UPDATE currency_settings SET last_live_rate = ?, last_rate_updated_at = ?, updated_at = ? WHERE id = 'storefront'",
        [liveRate, asDbDateTime(updatedAt), asDbDateTime(updatedAt)],
      );
      return {
        data: {
          rate: liveRate,
          marginUsd,
          marginEnabled,
          source: "live",
          updatedAt,
          autoUpdate: true,
        },
        error: null,
      };
    } catch {
      return {
        data: {
          rate: Number(settings.last_live_rate || settings.fallback_rate || settings.manual_rate || 27),
          marginUsd,
          marginEnabled,
          source: settings.last_live_rate ? "stale-cache" : "fallback",
          updatedAt: settings.last_rate_updated_at || settings.updated_at,
          autoUpdate: true,
        },
        error: null,
      };
    }
  }

  return { data: null, error: { message: `Function "${name}" is not available in MySQL mode.` } };
};
