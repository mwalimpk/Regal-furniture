import { JSDOM } from "jsdom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { sanitizeRichTextHtml } from "@/lib/richText";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("sanitizeRichTextHtml", () => {
  it("preserves safe AI layout attributes and strips unsafe markup", () => {
    const dom = new JSDOM("<!doctype html><html><body></body></html>");
    vi.stubGlobal("document", dom.window.document);

    const html = sanitizeRichTextHtml(`
      <div data-ai-layout="media-left" data-ai-section="visual details" onclick="alert(1)">
        <div data-ai-slot="media"><img src="/images/product.jpg" alt="Desk detail" /></div>
        <div data-ai-slot="copy"><script>alert(1)</script><h3>Executive detail</h3></div>
      </div>
      <div data-ai-layout="position-fixed" data-ai-slot="admin">Bad layout</div>
    `);

    expect(html).toContain('data-ai-layout="media-left"');
    expect(html).toContain('data-ai-section="visual details"');
    expect(html).toContain('data-ai-slot="media"');
    expect(html).toContain('loading="lazy"');
    expect(html).not.toContain("onclick");
    expect(html).not.toContain("<script");
    expect(html).not.toContain("position-fixed");
    expect(html).not.toContain('data-ai-slot="admin"');
  });

  it("preserves safe product video embeds", () => {
    const dom = new JSDOM("<!doctype html><html><body></body></html>");
    vi.stubGlobal("document", dom.window.document);

    const html = sanitizeRichTextHtml(`
      <div data-ai-layout="media-grid" data-ai-section="product media">
        <div data-ai-slot="media">
          <div data-youtube-video>
            <iframe src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ" width="640" height="360"></iframe>
          </div>
          <video src="https://cdn.example.com/product-demo.mp4" autoplay muted></video>
        </div>
      </div>
      <iframe src="https://evil.example.com/embed/nope"></iframe>
    `);

    expect(html).toContain('data-youtube-video=""');
    expect(html).toContain('src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"');
    expect(html).toContain("allowfullscreen");
    expect(html).toContain('src="https://cdn.example.com/product-demo.mp4"');
    expect(html).toContain("controls");
    expect(html).toContain("playsinline");
    expect(html).not.toMatch(/<video[^>]*autoplay/i);
    expect(html).not.toContain("evil.example.com");
  });

  it("converts product video links into embedded players", () => {
    const dom = new JSDOM("<!doctype html><html><body></body></html>");
    vi.stubGlobal("document", dom.window.document);

    const html = sanitizeRichTextHtml(`
      <h3>Product Media</h3>
      <p><a href="https://youtu.be/dQw4w9WgXcQ">https://youtu.be/dQw4w9WgXcQ</a></p>
      <p>Watch: youtube.com/watch?v=dQw4w9WgXcQ.</p>
    `);

    expect(html).toContain('data-ai-layout="standalone-media"');
    expect(html).toContain('data-ai-section="product media"');
    expect(html).toContain('src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"');
    expect(html).toContain("<iframe");
    expect(html).not.toContain("<a href=\"https://youtu.be/dQw4w9WgXcQ\"");
    expect(html).not.toContain("youtube.com/watch?v=dQw4w9WgXcQ");
  });
});
