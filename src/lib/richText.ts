const allowedTags = new Set([
  "A",
  "B",
  "BLOCKQUOTE",
  "BR",
  "CODE",
  "DEL",
  "DIV",
  "EM",
  "FIGCAPTION",
  "FIGURE",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "HR",
  "I",
  "IFRAME",
  "IMG",
  "INPUT",
  "KBD",
  "LABEL",
  "LI",
  "MARK",
  "OL",
  "P",
  "PRE",
  "S",
  "SECTION",
  "SOURCE",
  "SPAN",
  "STRIKE",
  "STRONG",
  "SUB",
  "SUP",
  "TABLE",
  "TBODY",
  "TD",
  "TFOOT",
  "TH",
  "THEAD",
  "TR",
  "U",
  "UL",
  "VIDEO",
]);

const allowedHrefPattern = /^(https?:|mailto:|tel:|\/(?!\/)|#)/i;
const allowedMediaSrcPattern = /^(https?:|\/(?!\/))/i;
const allowedImageSrcPattern = /^(https?:|\/(?!\/)|data:image\/(?:png|jpe?g|gif|webp);base64,)/i;
const youtubeEmbedSrcPattern = /^https:\/\/(?:www\.)?(?:youtube\.com|youtube-nocookie\.com)\/embed\/[a-z0-9_-]+(?:[?&#][a-z0-9_.,=%&;:+/-]*)?$/i;
const youtubeIdPattern = /^[a-z0-9_-]{6,32}$/i;
const embeddableVideoUrlPattern =
  /((?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtube-nocookie\.com|m\.youtube\.com|youtu\.be)\/[^\s<>"']+|https?:\/\/[^\s<>"']+\.(?:mp4|webm|ogg)(?:[?#][^\s<>"']*)?)/gi;

const allowedDataAttributes = new Set([
  "data-ai-layout",
  "data-ai-section",
  "data-ai-slot",
  "data-ai-tone",
  "data-checked",
  "data-color",
  "data-type",
  "data-youtube-video",
]);
const allowedDataTypes = new Set(["taskItem", "taskList"]);
const allowedAiLayouts = new Set([
  "benefit-grid",
  "callout",
  "comparison",
  "hero",
  "media-grid",
  "media-left",
  "media-right",
  "proof-strip",
  "spec-table",
  "stack",
  "standalone-media",
]);
const allowedAiSlots = new Set(["action", "benefit", "copy", "details", "media", "proof", "specs"]);
const allowedAiToken = /^[a-z0-9][a-z0-9 -]{0,70}$/i;
const allowedTextAlign = new Set(["left", "center", "right", "justify"]);
const allowedFontSizes = new Set(["0.875rem", "1rem", "1.125rem", "1.35rem", "1.75rem"]);
const allowedLineHeights = new Set(["1.35", "1.6", "1.85", "2.1"]);
const allowedMediaTypes = /^video\/(?:mp4|ogg|webm)$/i;
const allowedNumericAttribute = /^\d{1,4}$/;

const hexColorPattern = /^#[0-9a-f]{3}(?:[0-9a-f]{3})?(?:[0-9a-f]{2})?$/i;
const rgbColorPattern =
  /^rgba?\(\s*(?:\d{1,3}%?\s*,\s*){2}\d{1,3}%?(?:\s*,\s*(?:0|1|0?\.\d+|\d{1,3}%))?\s*\)$/i;
const hslColorPattern =
  /^hsla?\(\s*[\d.]+(?:deg|rad|turn)?\s*,\s*[\d.]+%\s*,\s*[\d.]+%(?:\s*,\s*(?:0|1|0?\.\d+|\d{1,3}%))?\s*\)$/i;

const isSafeColor = (value: string) => {
  const color = value.trim();
  return (
    color === "transparent" ||
    color.toLowerCase() === "currentcolor" ||
    hexColorPattern.test(color) ||
    rgbColorPattern.test(color) ||
    hslColorPattern.test(color)
  );
};

const sanitizeStyle = (style: string) => {
  const safeDeclarations: string[] = [];

  style.split(";").forEach((declaration) => {
    const [rawProperty, ...rawValueParts] = declaration.split(":");
    const property = rawProperty?.trim().toLowerCase();
    const value = rawValueParts.join(":").trim();
    if (!property || !value) return;

    if ((property === "color" || property === "background-color") && isSafeColor(value)) {
      safeDeclarations.push(`${property}: ${value}`);
      return;
    }

    if (property === "text-align" && allowedTextAlign.has(value.toLowerCase())) {
      safeDeclarations.push(`${property}: ${value.toLowerCase()}`);
      return;
    }

    if (property === "font-size" && allowedFontSizes.has(value)) {
      safeDeclarations.push(`${property}: ${value}`);
      return;
    }

    if (property === "line-height" && allowedLineHeights.has(value)) {
      safeDeclarations.push(`${property}: ${value}`);
    }
  });

  return safeDeclarations.join("; ");
};

const unwrapElement = (element: Element) => {
  const parent = element.parentNode;
  if (!parent) return;

  while (element.firstChild) {
    parent.insertBefore(element.firstChild, element);
  }

  parent.removeChild(element);
};

const removeElement = (element: Element) => {
  element.parentNode?.removeChild(element);
};

const trimUrlPunctuation = (value: string) => {
  let url = value.trim();
  let suffix = "";

  while (/[),.;!?]$/.test(url)) {
    suffix = `${url.slice(-1)}${suffix}`;
    url = url.slice(0, -1);
  }

  return { url, suffix };
};

const getYoutubeVideoId = (value: string) => {
  const rawLink = value.trim();
  if (!rawLink) return "";

  try {
    const candidate = /^(?:www\.)?(?:youtube\.com|youtube-nocookie\.com|m\.youtube\.com|youtu\.be)\//i.test(rawLink)
      ? `https://${rawLink}`
      : rawLink;
    const url = new URL(candidate);
    const host = url.hostname.replace(/^www\./i, "").toLowerCase();

    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0] || "";
      return youtubeIdPattern.test(id) ? id : "";
    }

    if (host === "youtube.com" || host === "youtube-nocookie.com" || host === "m.youtube.com") {
      const watchId = url.searchParams.get("v") || "";
      if (youtubeIdPattern.test(watchId)) return watchId;

      const [, route, id] = url.pathname.split("/");
      if ((route === "embed" || route === "shorts" || route === "live") && youtubeIdPattern.test(id || "")) {
        return id;
      }
    }
  } catch {
    return "";
  }

  return "";
};

const getYoutubeEmbedUrl = (value: string) => {
  const id = getYoutubeVideoId(value);
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : "";
};

const isDirectVideoUrl = (value: string) => /^https?:\/\/.+\.(?:mp4|webm|ogg)(?:[?#].*)?$/i.test(value.trim());

const createEmbeddedVideoElement = (documentRef: Document, source: string) => {
  const { url } = trimUrlPunctuation(source);
  const embedUrl = getYoutubeEmbedUrl(url);

  const wrapper = documentRef.createElement("div");
  wrapper.setAttribute("data-ai-layout", "standalone-media");
  wrapper.setAttribute("data-ai-section", "product media");

  const mediaSlot = documentRef.createElement("div");
  mediaSlot.setAttribute("data-ai-slot", "media");

  if (embedUrl) {
    const youtubeWrapper = documentRef.createElement("div");
    youtubeWrapper.setAttribute("data-youtube-video", "");

    const iframe = documentRef.createElement("iframe");
    iframe.setAttribute("src", embedUrl);
    iframe.setAttribute("width", "640");
    iframe.setAttribute("height", "360");
    iframe.setAttribute("allowfullscreen", "");
    youtubeWrapper.appendChild(iframe);
    mediaSlot.appendChild(youtubeWrapper);
  } else if (isDirectVideoUrl(url)) {
    const video = documentRef.createElement("video");
    video.setAttribute("src", url);
    video.setAttribute("controls", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("preload", "metadata");
    mediaSlot.appendChild(video);
  } else {
    return null;
  }

  wrapper.appendChild(mediaSlot);
  return wrapper;
};

const replaceEmbeddableVideoLinks = (wrapper: HTMLElement) => {
  Array.from(wrapper.querySelectorAll("a[href]")).forEach((anchor) => {
    const href = anchor.getAttribute("href") || "";
    const embed = createEmbeddedVideoElement(wrapper.ownerDocument, href);
    if (!embed) return;

    const listItem = anchor.closest("li");
    const target = listItem && listItem.textContent?.trim() === anchor.textContent?.trim() ? listItem : anchor;
    target.replaceWith(embed);
  });
};

const replaceBareEmbeddableVideoUrls = (wrapper: HTMLElement) => {
  const showText = wrapper.ownerDocument.defaultView?.NodeFilter.SHOW_TEXT || 4;
  const walker = wrapper.ownerDocument.createTreeWalker(wrapper, showText);
  const textNodes: Text[] = [];

  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    embeddableVideoUrlPattern.lastIndex = 0;
    const hasEmbeddableUrl = Boolean(node.nodeValue && embeddableVideoUrlPattern.test(node.nodeValue));
    embeddableVideoUrlPattern.lastIndex = 0;
    if (!hasEmbeddableUrl) continue;
    if (node.parentElement?.closest("a, iframe, video")) continue;
    textNodes.push(node);
  }

  textNodes.forEach((node) => {
    const text = node.nodeValue || "";
    const fragment = wrapper.ownerDocument.createDocumentFragment();
    let cursor = 0;
    embeddableVideoUrlPattern.lastIndex = 0;

    for (const match of text.matchAll(embeddableVideoUrlPattern)) {
      const matched = match[0];
      const index = match.index || 0;
      const { url, suffix } = trimUrlPunctuation(matched);
      const embed = createEmbeddedVideoElement(wrapper.ownerDocument, url);
      if (!embed) continue;

      if (index > cursor) {
        fragment.appendChild(wrapper.ownerDocument.createTextNode(text.slice(cursor, index)));
      }
      fragment.appendChild(embed);
      if (suffix) {
        fragment.appendChild(wrapper.ownerDocument.createTextNode(suffix));
      }
      cursor = index + matched.length;
    }

    if (!fragment.childNodes.length) return;
    if (cursor < text.length) {
      fragment.appendChild(wrapper.ownerDocument.createTextNode(text.slice(cursor)));
    }
    node.replaceWith(fragment);
  });
};

const embedRichTextVideos = (wrapper: HTMLElement) => {
  replaceEmbeddableVideoLinks(wrapper);
  replaceBareEmbeddableVideoUrls(wrapper);
};

const getAttributeMap = (element: Element) =>
  new Map(Array.from(element.attributes).map((attribute) => [attribute.name.toLowerCase(), attribute.value]));

const restoreGlobalAttributes = (element: Element, attributes: Map<string, string>) => {
  const style = sanitizeStyle(attributes.get("style") || "");
  if (style) {
    element.setAttribute("style", style);
  }

  allowedDataAttributes.forEach((attributeName) => {
    const value = attributes.get(attributeName);
    if (value === undefined) return;

    if (attributeName === "data-type" && !allowedDataTypes.has(value)) return;
    if (attributeName === "data-ai-layout" && !allowedAiLayouts.has(value)) return;
    if (attributeName === "data-ai-slot" && !allowedAiSlots.has(value)) return;
    if ((attributeName === "data-ai-section" || attributeName === "data-ai-tone") && !allowedAiToken.test(value)) return;
    if (attributeName === "data-checked" && value !== "true" && value !== "false") return;
    if (attributeName === "data-color" && !isSafeColor(value)) return;

    element.setAttribute(attributeName, value);
  });
};

const restoreDimension = (element: Element, attributes: Map<string, string>, name: "height" | "width") => {
  const value = attributes.get(name)?.trim();
  if (value && allowedNumericAttribute.test(value)) {
    element.setAttribute(name, value);
  }
};

const restoreTableSpan = (element: Element, attributes: Map<string, string>, name: "colspan" | "rowspan") => {
  const value = attributes.get(name)?.trim();
  if (value && allowedNumericAttribute.test(value)) {
    element.setAttribute(name, value);
  }
};

const cleanElement = (element: Element) => {
  Array.from(element.children).forEach(cleanElement);

  const tagName = element.tagName.toUpperCase();
  if (!allowedTags.has(tagName)) {
    unwrapElement(element);
    return;
  }

  const attributes = getAttributeMap(element);
  Array.from(element.attributes).forEach((attribute) => element.removeAttribute(attribute.name));
  restoreGlobalAttributes(element, attributes);

  if (tagName === "A") {
    const href = attributes.get("href")?.trim() || "";
    if (!allowedHrefPattern.test(href)) {
      unwrapElement(element);
      return;
    }

    element.setAttribute("href", href);
    element.setAttribute("target", "_blank");
    element.setAttribute("rel", "noreferrer");
    return;
  }

  if (tagName === "IMG") {
    const src = attributes.get("src")?.trim() || "";
    if (!allowedImageSrcPattern.test(src)) {
      removeElement(element);
      return;
    }

    element.setAttribute("src", src);
    element.setAttribute("loading", "lazy");
    restoreDimension(element, attributes, "width");
    restoreDimension(element, attributes, "height");

    const alt = attributes.get("alt")?.trim();
    const title = attributes.get("title")?.trim();
    if (alt) element.setAttribute("alt", alt);
    if (title) element.setAttribute("title", title);
    return;
  }

  if (tagName === "IFRAME") {
    const src = attributes.get("src")?.trim() || "";
    if (!youtubeEmbedSrcPattern.test(src)) {
      removeElement(element);
      return;
    }

    element.setAttribute("src", src);
    element.setAttribute("loading", "lazy");
    element.setAttribute("allowfullscreen", "");
    element.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    element.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
    restoreDimension(element, attributes, "width");
    restoreDimension(element, attributes, "height");
    return;
  }

  if (tagName === "VIDEO") {
    const src = attributes.get("src")?.trim() || "";
    const poster = attributes.get("poster")?.trim() || "";
    const hasSourceChild = Array.from(element.children).some((child) => child.tagName.toUpperCase() === "SOURCE");

    if (src) {
      if (!allowedMediaSrcPattern.test(src)) {
        removeElement(element);
        return;
      }
      element.setAttribute("src", src);
    } else if (!hasSourceChild) {
      removeElement(element);
      return;
    }

    if (poster && allowedImageSrcPattern.test(poster)) {
      element.setAttribute("poster", poster);
    }

    element.setAttribute("controls", "");
    element.setAttribute("playsinline", "");
    element.setAttribute("preload", "metadata");
    return;
  }

  if (tagName === "SOURCE") {
    const src = attributes.get("src")?.trim() || "";
    if (element.parentElement?.tagName.toUpperCase() !== "VIDEO" || !allowedMediaSrcPattern.test(src)) {
      removeElement(element);
      return;
    }

    element.setAttribute("src", src);
    const type = attributes.get("type")?.trim() || "";
    if (allowedMediaTypes.test(type)) {
      element.setAttribute("type", type);
    }
    return;
  }

  if (tagName === "INPUT") {
    if ((attributes.get("type") || "").toLowerCase() !== "checkbox") {
      removeElement(element);
      return;
    }

    element.setAttribute("type", "checkbox");
    element.setAttribute("disabled", "");
    if (attributes.has("checked")) {
      element.setAttribute("checked", "");
    }
    return;
  }

  if (tagName === "TD" || tagName === "TH") {
    restoreTableSpan(element, attributes, "colspan");
    restoreTableSpan(element, attributes, "rowspan");
  }
};

export const sanitizeRichTextHtml = (html: string) => {
  if (!html.trim()) return "";

  if (typeof document === "undefined") {
    return html
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
      .replace(/\son\w+=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
      .replace(/javascript:/gi, "")
      .trim();
  }

  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;
  wrapper.querySelectorAll("script,style,object,embed,form,button,textarea,select").forEach((node) => node.remove());
  embedRichTextVideos(wrapper);
  Array.from(wrapper.children).forEach(cleanElement);

  return wrapper.innerHTML
    .replace(/<p>(\s|&nbsp;|<br>)*<\/p>/gi, "")
    .trim();
};
