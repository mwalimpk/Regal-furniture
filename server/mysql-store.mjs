import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";
import { fileURLToPath } from "node:url";

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
  properties: ["images"],
  product_pairings: ["recommended_ids"],
  orders: ["items"],
};

const TABLE_COLUMNS = {
  auth_users: ["id", "email", "password", "created_at", "user_metadata"],
  sessions: ["access_token", "user_id", "expires_at"],
  profiles: ["id", "user_id", "full_name", "currency", "phone", "status", "created_at", "updated_at"],
  user_roles: ["id", "user_id", "role"],
  properties: ["id", "title", "description", "property_type", "price", "currency", "location", "city", "country", "images", "status", "featured", "bedrooms", "bathrooms", "area_sqft", "created_at", "updated_at", "user_id"],
  product_pairings: ["id", "product_id", "recommended_ids"],
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

let pool;
let initialized = false;

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
  ["created_at", "updated_at", "start_date", "end_date", "booking_date"].forEach((key) => {
    if (key in next && next[key]) next[key] = asDbDateTime(next[key]);
  });
  if ("featured" in next && typeof next.featured === "boolean") next.featured = next.featured ? 1 : 0;
  if ("read" in next && typeof next.read === "boolean") next.read = next.read ? 1 : 0;
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
  ["price", "total", "amount", "quantity"].forEach((key) => {
    if (key in next && next[key] !== null) next[key] = Number(next[key]);
  });
  ["created_at", "updated_at", "start_date", "end_date", "booking_date"].forEach((key) => {
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
    properties: [],
    product_pairings: [],
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
      const normalized = serializeRow(table, row);
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

  const [[countRow]] = await db.query("SELECT COUNT(*) AS count FROM auth_users");
  if (!countRow.count) {
    if (fs.existsSync(legacyStoreFile)) {
      await importState(JSON.parse(fs.readFileSync(legacyStoreFile, "utf8")));
    } else {
      await importState(seedState());
    }
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
      return { id: uid("property"), created_at: timestamp, updated_at: timestamp, status: "approved", featured: false, bedrooms: 0, bathrooms: 0, area_sqft: 0, country: "Zimbabwe", images: [], ...row };
    case "product_pairings":
      return { id: uid("pair"), recommended_ids: [], ...row };
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
    const category = body?.category ? `${body.category}` : "office furniture";
    const features = body?.features ? `${body.features}` : "premium craftsmanship";
    const productName = body?.name ? `${body.name}` : "This product";
    return {
      data: {
        description: `${productName} is a ${category.toLowerCase()} piece designed for practical daily use, clean presentation, and long-term durability. Key highlights include ${features}, making it a strong fit for executive offices, reception areas, and home workspaces.`,
      },
      error: null,
    };
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

  return { data: null, error: { message: `Function "${name}" is not available in MySQL mode.` } };
};
