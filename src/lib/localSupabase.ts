type TableName =
  | "profiles"
  | "user_roles"
  | "properties"
  | "product_pairings"
  | "product_promotions"
  | "catalogues"
  | "promotional_banners"
  | "inquiries"
  | "leads"
  | "orders"
  | "bookings"
  | "messages"
  | "subscriptions"
  | "rfq_requests";

type QueryResult<T> = {
  data: T;
  error: null | { message: string };
  count?: number | null;
};

type Session = {
  access_token: string;
  expires_at: number;
  user: {
    id: string;
    email: string;
    created_at: string;
    user_metadata: Record<string, unknown>;
  };
};

const ACCESS_TOKEN_KEY = "regal-office-home-server-token";
const listeners = new Set<(event: string, session: Session | null) => void>();

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read image file."));
    reader.readAsDataURL(file);
  });

const getAccessToken = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
};

const setAccessToken = (token: string | null) => {
  if (typeof window === "undefined") return;
  if (token) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
};

const notifyAuthListeners = (event: string, session: Session | null) => {
  listeners.forEach((listener) => listener(event, session));
};

const apiRequest = async <T>(pathname: string, init: RequestInit = {}): Promise<T> => {
  const headers = new Headers(init.headers || {});
  const token = getAccessToken();

  if (!headers.has("Content-Type") && init.body && typeof init.body === "string") {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(pathname, {
    ...init,
    headers,
  });

  return response.json() as Promise<T>;
};

class RemoteQueryBuilder {
  private mode: "select" | "insert" | "update" | "delete" | "upsert" = "select";
  private filters: Array<{ field: string; value: unknown }> = [];
  private orderBy: { field: string; ascending: boolean } | null = null;
  private limitCount: number | null = null;
  private selectOptions: Record<string, unknown> = {};
  private columns = "*";
  private payload: unknown = null;
  private singleMode: "many" | "single" | "maybeSingle" = "many";
  private upsertConflict: string | null = null;

  constructor(private table: TableName) {}

  select(columns = "*", options: Record<string, unknown> = {}) {
    this.columns = columns;
    this.selectOptions = options;
    return this;
  }

  insert(payload: unknown) {
    this.mode = "insert";
    this.payload = payload;
    return this;
  }

  upsert(payload: unknown, options: { onConflict?: string } = {}) {
    this.mode = "upsert";
    this.payload = payload;
    this.upsertConflict = options.onConflict || null;
    return this;
  }

  update(payload: unknown) {
    this.mode = "update";
    this.payload = payload;
    return this;
  }

  delete() {
    this.mode = "delete";
    return this;
  }

  eq(field: string, value: unknown) {
    this.filters.push({ field, value });
    return this;
  }

  order(field: string, options: { ascending: boolean }) {
    this.orderBy = { field, ascending: options.ascending };
    return this;
  }

  limit(value: number) {
    this.limitCount = value;
    return this;
  }

  single() {
    this.singleMode = "single";
    return this.execute();
  }

  maybeSingle() {
    this.singleMode = "maybeSingle";
    return this.execute();
  }

  then(resolve: (value: QueryResult<unknown>) => unknown, reject?: (reason: unknown) => unknown) {
    return this.execute().then(resolve, reject);
  }

  async execute(): Promise<QueryResult<unknown>> {
    return apiRequest<QueryResult<unknown>>("/api/query", {
      method: "POST",
      body: JSON.stringify({
        table: this.table,
        mode: this.mode,
        filters: this.filters,
        orderBy: this.orderBy,
        limitCount: this.limitCount,
        selectOptions: this.selectOptions,
        columns: this.columns,
        payload: this.payload,
        singleMode: this.singleMode,
        upsertConflict: this.upsertConflict,
      }),
    });
  }
}

export const supabase = {
  auth: {
    onAuthStateChange(callback: (event: string, session: Session | null) => void) {
      listeners.add(callback);
      return {
        data: {
          subscription: {
            unsubscribe: () => listeners.delete(callback),
          },
        },
      };
    },
    async getSession() {
      const response = await apiRequest<{ data: { session: Session | null }; error: null | { message: string } }>("/api/auth/session");
      if (!response.data.session) {
        setAccessToken(null);
      }
      return response;
    },
    async getUser() {
      const { data } = await supabase.auth.getSession();
      return { data: { user: data.session?.user || null } };
    },
    async signInWithPassword({ email, password }: { email: string; password: string }) {
      const response = await apiRequest<{ data: { session: Session | null; user: Session["user"] | null }; error: null | { message: string } }>(
        "/api/auth/sign-in",
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
        },
      );

      if (response.data.session) {
        setAccessToken(response.data.session.access_token);
        notifyAuthListeners("SIGNED_IN", response.data.session);
      }

      return response;
    },
    async signUp({ email, password, options }: { email: string; password: string; options?: { data?: Record<string, unknown> } }) {
      const response = await apiRequest<{ data: { session: Session | null; user: Session["user"] | null }; error: null | { message: string } }>(
        "/api/auth/sign-up",
        {
          method: "POST",
          body: JSON.stringify({ email, password, options }),
        },
      );

      if (response.data.session) {
        setAccessToken(response.data.session.access_token);
        notifyAuthListeners("SIGNED_IN", response.data.session);
      }

      return response;
    },
    async resetPasswordDirect({ email, password }: { email: string; password: string }) {
      const response = await apiRequest<{ data: { user: Session["user"] | null }; error: null | { message: string } }>(
        "/api/auth/reset-password",
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
        },
      );

      if (!response.error) {
        setAccessToken(null);
        notifyAuthListeners("PASSWORD_RESET", null);
      }

      return response;
    },
    async signOut() {
      const response = await apiRequest<{ error: null | { message: string } }>("/api/auth/sign-out", {
        method: "POST",
      });
      setAccessToken(null);
      notifyAuthListeners("SIGNED_OUT", null);
      return response;
    },
    async setSession(tokens: { access_token?: string }) {
      const response = await apiRequest<{ data: { session: Session | null }; error: null | { message: string } }>("/api/auth/set-session", {
        method: "POST",
        body: JSON.stringify(tokens),
      });

      if (response.data.session) {
        setAccessToken(response.data.session.access_token);
        notifyAuthListeners("SIGNED_IN", response.data.session);
      }

      return response;
    },
  },
  from(table: TableName) {
    return new RemoteQueryBuilder(table);
  },
  functions: {
    async invoke(name: string, { body }: { body?: Record<string, unknown> }) {
      return apiRequest<{ data: unknown; error: null | { message: string } }>(`/api/functions/${name}`, {
        method: "POST",
        body: JSON.stringify({ body }),
      });
    },
  },
  catalogues: {
    async importProducts(payload: { catalogueId?: string; userId: string; rows: Array<Record<string, unknown>> }) {
      return apiRequest<{
        data: { importedCount: number; rejected: Array<{ rowNumber: number; reason: string }>; products: unknown[] } | null;
        error: null | { message: string };
      }>("/api/catalogues/import-products", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
  },
  storage: {
    from(_bucket: string) {
      return {
        async upload(path: string, file: File, _options?: Record<string, unknown>) {
          try {
            const dataUrl = await readAsDataUrl(file);
            return apiRequest<{ data: { path: string; publicUrl: string }; error: null | { message: string } }>(
              "/api/storage/upload",
              {
                method: "POST",
                body: JSON.stringify({ path, dataUrl }),
              },
            );
          } catch (error) {
            return {
              data: null,
              error: { message: error instanceof Error ? error.message : "Upload failed." },
            };
          }
        },
        getPublicUrl(path: string) {
          const origin = typeof window === "undefined" ? "" : window.location.origin;
          return {
            data: {
              publicUrl: path.startsWith("http") ? path : `${origin}/uploads/${path}`,
            },
          };
        },
      };
    },
  },
};
