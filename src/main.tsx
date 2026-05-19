import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const rootElement = document.getElementById("root");

const showBootError = (message: string) => {
  if (!rootElement) return;
  rootElement.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:#fcfaf7;color:#171a18;font-family:Inter,system-ui,sans-serif;">
      <div style="max-width:880px;width:100%;background:#fff;border:1px solid #e6ddd1;border-radius:28px;padding:32px;box-shadow:0 20px 50px rgba(23,26,24,0.08);">
        <div style="font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:#8c8274;margin-bottom:12px;">Startup Error</div>
        <h1 style="margin:0 0 16px;font-family:'Playfair Display',serif;font-size:32px;">The site failed during startup.</h1>
        <pre style="white-space:pre-wrap;word-break:break-word;font-size:14px;line-height:1.7;color:#5f584f;margin:0;">${message}</pre>
      </div>
    </div>
  `;
};

window.addEventListener("error", (event) => {
  showBootError(event.error?.stack || event.message || "Unknown startup error.");
});

window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason;
  showBootError(reason?.stack || reason?.message || String(reason));
});

try {
  if (!rootElement) {
    throw new Error("Root element '#root' was not found.");
  }

  createRoot(rootElement).render(<App />);
} catch (error) {
  showBootError(error instanceof Error ? error.stack || error.message : String(error));
}
