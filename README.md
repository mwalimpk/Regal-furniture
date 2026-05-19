# Regal Office Home

This project now runs as a single project-owned stack:

- React + Vite frontend
- Node server for API and hosting
- file-backed persistence by default
- MySQL-backed persistence when MySQL environment variables are present

## Local development

Run:

```bash
npm install
npm run dev
```

Open:

- `http://localhost:8080`
- `http://localhost:8080/admin`

## Production mode

Build and serve:

```bash
npm run build
npm run start
```

## MySQL configuration

To use MySQL instead of the file-backed store, set these environment variables before starting the server:

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=your_mysql_user
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=regalofficehome
```

When MySQL is configured:

- the server creates the required tables automatically from `server/db/schema.sql`
- the project imports any existing `server/data/store.json` records on first run
- the API keeps the same frontend contract, so admin and storefront screens continue to work

## Notes

- Uploaded product images are stored under `server/data/uploads`
- File-backed persistence remains available as a fallback while MySQL credentials are being prepared
# Reagal-Furniture
