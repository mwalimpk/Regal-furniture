import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const OPENAI_IMAGES_URL = "https://api.openai.com/v1/images/generations";

const asString = (value: unknown, fallback = "") =>
  value === null || value === undefined ? fallback : String(value).trim();

const parseLines = (value: unknown) =>
  String(value || "")
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

const asArray = (value: unknown) => Array.isArray(value) ? value.map(String).map((item) => item.trim()).filter(Boolean) : [];

const escapeHtml = (value: unknown) =>
  asString(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const firstNonEmpty = (...values: unknown[]) => values.map((value) => asString(value)).find(Boolean) || "";

const stripHtml = (value: unknown) =>
  asString(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const youtubeIdPattern = /^[a-z0-9_-]{6,32}$/i;

const getYoutubeVideoId = (value: unknown) => {
  const link = asString(value);
  if (!link) return "";

  try {
    const candidate = /^(?:www\.)?(?:youtube\.com|youtube-nocookie\.com|m\.youtube\.com|youtu\.be)\//i.test(link)
      ? `https://${link}`
      : link;
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

const getYoutubeEmbedUrl = (value: unknown) => {
  const id = getYoutubeVideoId(value);
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : "";
};

const isDirectVideoUrl = (value: unknown) => /^https?:\/\/.+\.(?:mp4|webm|ogg)(?:[?#].*)?$/i.test(asString(value));

const renderVideoEmbed = (link: string, index = 0) => {
  const embedUrl = getYoutubeEmbedUrl(link);
  const title = `Product video ${index + 1}`;

  if (embedUrl) {
    return [
      '<div data-youtube-video>',
      `<iframe src="${escapeHtml(embedUrl)}" title="${escapeHtml(title)}" width="640" height="360" allowfullscreen></iframe>`,
      "</div>",
    ].join("");
  }

  if (isDirectVideoUrl(link)) {
    return `<video src="${escapeHtml(link)}" controls playsinline preload="metadata"></video>`;
  }

  return "";
};

const hasEmbeddedMedia = (html: unknown) => /<(?:iframe|video)\b/i.test(asString(html));

const toneProfile = (tone: string) => {
  const normalized = tone.toLowerCase();
  if (normalized.includes("corporate")) {
    return {
      voice: "precise, specification-led, and procurement-ready",
      opening: "Built for confident commercial selection",
      conversionPromise: "A specification-led choice for teams comparing fit, stock, and long-term value.",
      layoutStrategy: "Prioritize proof, specifications, availability, and quote confidence.",
      toneKey: "corporate procurement",
    };
  }
  if (normalized.includes("warm")) {
    return {
      voice: "warm, helpful, and showroom-consultative",
      opening: "Designed to feel approachable and easy to place",
      conversionPromise: "A guided recommendation that helps the buyer picture the piece in their room.",
      layoutStrategy: "Prioritize room fit, practical reassurance, and friendly buying advice.",
      toneKey: "warm showroom",
    };
  }
  if (normalized.includes("luxury")) {
    return {
      voice: "elevated, refined, and lifestyle-led",
      opening: "Styled for a polished interior statement",
      conversionPromise: "An elevated presentation that makes the product feel considered and worth choosing.",
      layoutStrategy: "Prioritize aspiration, material presence, media-led storytelling, and restrained proof.",
      toneKey: "luxury styling",
    };
  }
  if (normalized.includes("clear")) {
    return {
      voice: "direct, practical, and easy to compare",
      opening: "Made for straightforward product selection",
      conversionPromise: "A clear buying path that answers what it is, where it fits, and why it is worth ordering.",
      layoutStrategy: "Prioritize the decision summary, key benefits, and specifications early.",
      toneKey: "clear practical",
    };
  }
  return {
    voice: "premium, polished, and buyer-focused",
    opening: "Crafted for a polished workspace impression",
    conversionPromise: "A polished product story that builds confidence while keeping the next buying step close.",
    layoutStrategy: "Prioritize a showroom overview, visual proof, benefit-led copy, and ordering reassurance.",
    toneKey: "premium polished",
  };
};

const buildImageRequests = (context: Record<string, string>, extraMediaNotes: unknown, generateImageIdeas: boolean) => {
  const requested = parseLines(extraMediaNotes);
  const defaults = generateImageIdeas
    ? ["front three-quarter showroom view", "side profile showing scale", "close-up detail of finish or hardware"]
    : [];
  const source = requested.length ? requested : defaults;

  return source.slice(0, 4).map((note, index) => {
    const purpose = note.replace(/^(ask for|generate|request|add)\s+/i, "").trim();
    const marketing = buildImageSectionCopy(context, purpose || note);
    return {
      id: `ai-image-${index + 1}`,
      title: purpose.split(/\s+/).slice(0, 8).join(" ") || `Supporting image ${index + 1}`,
      purpose,
      section_heading: marketing.section_heading,
      section_copy: marketing.section_copy,
      marketing_copy: marketing.section_copy,
      caption: marketing.caption,
      prompt: [
        `Photorealistic premium furniture product image for ${context.productName}, a ${context.category}.`,
        `Create: ${purpose}.`,
        context.materials ? `Materials and finish: ${context.materials}.` : "",
        context.dimensions ? `Specifications or scale notes: ${context.dimensions}.` : "",
        context.idealBuyer ? `Intended room or buyer: ${context.idealBuyer}.` : "",
        "Clean showroom lighting, accurate proportions, no people, no text overlays, no watermark.",
      ].filter(Boolean).join(" "),
    };
  });
};

const buildImagePrompt = (context: Record<string, unknown>, purpose: string) => [
  `Photorealistic premium furniture product image for ${context.productName}, a ${context.category}.`,
  `Create: ${purpose}.`,
  context.materials ? `Materials and finish: ${context.materials}.` : "",
  context.dimensions ? `Specifications or scale notes: ${context.dimensions}.` : "",
  context.idealBuyer ? `Intended room or buyer: ${context.idealBuyer}.` : "",
  context.useCase ? `Use case: ${context.useCase}.` : "",
  context.visibleDetails ? `Preserve these visible details where relevant: ${context.visibleDetails}.` : "",
  "Clean showroom lighting, accurate proportions, no people, no text overlays, no watermark, product centered and easy to inspect.",
].filter(Boolean).join(" ");

const buildImageSectionCopy = (context: Record<string, unknown>, purposeValue: unknown) => {
  const purpose = firstNonEmpty(purposeValue, "supporting product view");
  const normalized = purpose.toLowerCase();
  const productName = firstNonEmpty(context.productName, "this product");
  const audience = firstNonEmpty(context.idealBuyer, "the intended room");
  const materials = firstNonEmpty(context.materials, "the finish, construction, and proportions");
  const useCase = firstNonEmpty(context.useCase, "daily use");

  if (/close|detail|texture|stitch|finish|hardware|grain|upholstery|material/i.test(normalized)) {
    return {
      section_heading: "A Closer Look at the Finish",
      section_copy: `This close-up gives shoppers proof of the details that are hard to judge from a standard product photo: ${materials}. It turns finish, texture, hardware, and construction cues into visible reasons to trust ${productName}.`,
      caption: "Detail view for finish, texture, and construction confidence.",
    };
  }

  if (/side|profile|angle|three-quarter|3\/4|different angle|back|rear/i.test(normalized)) {
    return {
      section_heading: "See the Shape Before It Arrives",
      section_copy: `This angle helps buyers understand the profile, depth, and visual balance of ${productName}. For ${audience}, that extra perspective makes it easier to judge placement, clearance, and how confidently the piece will sit in the room.`,
      caption: "Alternative angle for scale, profile, and placement confidence.",
    };
  }

  if (/lifestyle|room|office|showroom|setting|space|environment/i.test(normalized)) {
    return {
      section_heading: "Picture It in Use",
      section_copy: `This setting connects ${productName} to ${useCase}, helping customers imagine the product beyond the catalogue view. It shows how the piece can support the look, workflow, and buying purpose they have in mind.`,
      caption: "In-room view for use case and placement context.",
    };
  }

  return {
    section_heading: "Another Reason to Choose It",
    section_copy: `This supporting image adds buying clarity by showing another useful view of ${productName}. It helps customers compare finish, proportion, and practical fit before they request a quote or place an order.`,
    caption: "Supporting product view for buyer confidence.",
  };
};

const normalizeImageRequests = (context: Record<string, unknown>, requests: unknown) =>
  (Array.isArray(requests) ? requests : []).slice(0, 4).map((request, index) => {
    const row = request && typeof request === "object" ? request as Record<string, unknown> : {};
    const purpose = firstNonEmpty(row.purpose, row.title, `supporting product image ${index + 1}`);
    const title = firstNonEmpty(row.title, purpose.split(/\s+/).slice(0, 8).join(" "), `Supporting image ${index + 1}`);
    const marketing = buildImageSectionCopy(context, purpose);
    return {
      ...row,
      id: firstNonEmpty(row.id, `ai-image-${index + 1}`),
      title,
      purpose,
      prompt: firstNonEmpty(row.prompt, buildImagePrompt(context, purpose)),
      section_heading: firstNonEmpty(row.section_heading, marketing.section_heading),
      section_copy: firstNonEmpty(row.section_copy, row.marketing_copy, marketing.section_copy),
      marketing_copy: firstNonEmpty(row.marketing_copy, row.section_copy, marketing.section_copy),
      caption: firstNonEmpty(row.caption, marketing.caption),
    };
  });

const buildLocalCopy = (body: Record<string, unknown>, imageRequests: Array<Record<string, string>>) => {
  const answers = body.answers && typeof body.answers === "object" ? body.answers as Record<string, unknown> : {};
  const productName = firstNonEmpty(body.name, "This product");
  const category = firstNonEmpty(body.category, "office furniture");
  const tone = firstNonEmpty(answers.tone, "Premium and polished");
  const profile = toneProfile(tone);
  const materials = firstNonEmpty(answers.materials, body.features, "premium materials and durable construction");
  const dimensions = firstNonEmpty(answers.dimensions, body.sku ? `SKU/model reference: ${body.sku}` : "");
  const idealBuyer = firstNonEmpty(answers.idealBuyer, "modern offices, reception areas, and home workspaces");
  const useCase = firstNonEmpty(answers.useCase, "daily use, buyer confidence, and practical commercial fit-outs");
  const visibleDetails = firstNonEmpty(answers.visibleDetails, "Use product images to confirm finish, proportion, and buyer-facing details.");
  const currentCopy = firstNonEmpty(body.mode === "long_description" ? stripHtml(body.long_description) : body.description);

  const description = [
    `${profile.opening}, ${productName} is a ${category} piece shaped for ${idealBuyer}.`,
    `It pairs ${materials} with ${useCase}, helping buyers understand fit, finish, and value quickly.`,
    visibleDetails ? `The product details worth noticing are ${visibleDetails}.` : "",
    dimensions ? `Specifications such as ${dimensions} make it easier to confirm fit before ordering.` : "",
    currentCopy ? "Existing catalogue notes have been reshaped into a clearer buying story." : "",
    profile.conversionPromise,
  ].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();

  const rows = [
    ["Category", category],
    ["Materials / finish", materials],
    ["Dimensions / specs", dimensions],
    ["SKU / model", asString(body.sku)],
    ["Warehouse", asString(body.warehouse)],
    ["Price", [asString(body.currency), asString(body.price)].filter(Boolean).join(" ")],
  ].filter(([, value]) => value);

  const videoLinks = asArray(answers.videoLinks);
  const videoEmbeds = videoLinks.map((link, index) => renderVideoEmbed(link, index)).filter(Boolean);
  const fallbackVideoLinks = videoLinks.filter((link) => !renderVideoEmbed(link));
  const videoMediaSection = videoLinks.length
    ? [
        '<div data-ai-layout="media-grid" data-ai-section="product media">',
        videoEmbeds.length ? `<div data-ai-slot="media">${videoEmbeds.join("")}</div>` : "",
        '<div data-ai-slot="details">',
        "<h3>Product Media</h3>",
        videoEmbeds.length ? "<p>Watch the product media to confirm scale, finish, and placement before ordering.</p>" : "",
        fallbackVideoLinks.length ? `<ul>${fallbackVideoLinks.map((link) => `<li><a href="${escapeHtml(link)}">${escapeHtml(link)}</a></li>`).join("")}</ul>` : "",
        "</div>",
        "</div>",
      ].filter(Boolean).join("")
    : "";
  const primaryImage = asArray(body.imageUrls)[0];
  const primaryImageLabel = asArray(body.imageLabels)[0] || `${productName} detail`;
  const visualSection = primaryImage
    ? [
        '<div data-ai-layout="media-left" data-ai-section="visual details">',
        '<div data-ai-slot="media">',
        `<figure><img src="${escapeHtml(primaryImage)}" alt="${escapeHtml(primaryImageLabel)}" /><figcaption>${escapeHtml(primaryImageLabel)}</figcaption></figure>`,
        "</div>",
        '<div data-ai-slot="copy">',
        "<h3>Finish, Shape, and First Impression</h3>",
        `<p>${escapeHtml(visibleDetails)}</p>`,
        "</div>",
        "</div>",
      ].join("")
    : [
        '<div data-ai-layout="stack" data-ai-section="visual details">',
        "<h3>Visual Details</h3>",
        `<p>${escapeHtml(visibleDetails)}</p>`,
        "</div>",
      ].join("");
  const longDescription = [
    `<div data-ai-layout="hero" data-ai-section="overview" data-ai-tone="${profile.toneKey}"><h2>${escapeHtml(productName)}</h2><p>${escapeHtml(description)}</p></div>`,
    `<div data-ai-layout="callout" data-ai-section="buyer fit"><h3>Best Fit</h3><p>${escapeHtml(productName)} suits ${escapeHtml(idealBuyer)} where the priority is ${escapeHtml(useCase)}.</p><p>${escapeHtml(profile.layoutStrategy)}</p></div>`,
    visualSection,
    `<div data-ai-layout="benefit-grid" data-ai-section="buying reasons"><div data-ai-slot="benefit"><h3>Why It Works</h3><p>${escapeHtml(useCase)}</p></div><div data-ai-slot="benefit"><h3>Easy to Choose</h3><p>${escapeHtml(profile.voice)} guidance helps customers compare fit, finish, and value quickly.</p></div><div data-ai-slot="benefit"><h3>Ordering Confidence</h3><p>Use the specifications and showroom support to confirm the right quantity, finish, and delivery plan.</p></div></div>`,
    `<div data-ai-layout="spec-table" data-ai-section="specifications"><h3>Specifications</h3><table><tbody>${rows.map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`).join("")}</tbody></table></div>`,
    videoMediaSection,
    '<div data-ai-layout="callout" data-ai-section="delivery and ordering"><div data-ai-slot="action"><h3>Delivery and Ordering</h3><p>Confirm availability, delivery timing, and project quantities with the Regal Office & Home team. <a href="/contact">Contact the showroom</a> for support.</p></div></div>',
  ].filter(Boolean).join("");

  return { description, long_description: longDescription, image_requests: imageRequests };
};

const buildPrompt = (body: Record<string, unknown>, imageRequests: Array<Record<string, string>>) => {
  const answers = body.answers && typeof body.answers === "object" ? body.answers as Record<string, unknown> : {};
  return `Generate product copy for Regal Office & Home.

Return strict JSON:
{"description":"","long_description":"","image_requests":[{"title":"","purpose":"","prompt":"","section_heading":"","section_copy":"","caption":""}]}

Product name: ${body.name}
Category: ${body.category}
Featured subcategory: ${body.featuredSubcategory || ""}
Existing short description: ${body.description || ""}
Existing long description: ${stripHtml(body.long_description)}
Price: ${[body.currency, body.price].filter(Boolean).join(" ")}
SKU/model: ${body.sku || ""}
Warehouse: ${body.warehouse || ""}
Image labels: ${asArray(body.imageLabels).join(", ") || "None"}
Image URLs: ${asArray(body.imageUrls).join(", ") || "None"}
Color variants: ${Array.isArray(body.colorVariants) ? body.colorVariants.map((item) => JSON.stringify(item)).join("; ") : "None"}

Admin inputs:
- Tone: ${answers.tone || "Premium and polished"}
- Ideal buyer or room: ${answers.idealBuyer || ""}
- Visible image details: ${answers.visibleDetails || ""}
- Materials, finish, or color: ${answers.materials || ""}
- Dimensions/specifications: ${answers.dimensions || ""}
- Use case and benefit focus: ${answers.useCase || ""}
- Preferred section order: ${answers.layoutOrder || ""}
- Main long-description focus: ${answers.focus || ""}
- Video/product media links: ${asArray(answers.videoLinks).join(", ") || "None"}
- Supporting image requests: ${imageRequests.map((item) => item.purpose).join("; ") || "None"}

Rules:
- Rewrite existing copy in the requested tone when existing copy is present. Do not copy any existing sentence verbatim unless it is a model number, dimension, material, URL, or fixed product name.
- Do not describe your writing process or say "the copy uses". Write customer-facing sales copy only.
- For long_description, act as a conversion-focused ecommerce page architect. Do not list the preferred section order. Use it to organize section sequence, layout, and emphasis.
- Let tone influence layout decisions:
  - Premium and polished: showroom overview, visual proof, benefits, specifications, ordering reassurance.
  - Clear and practical: decision clarity and specifications early; concise bullets and tables.
  - Warm showroom consultant: guided fit sections, reassurance, and friendly explanatory copy.
  - Corporate procurement: specifications, availability, quantity/quote confidence, and proof points.
  - Luxury home styling: aspiration and media/text storytelling before restrained proof and care details.
- Use only these safe layout wrappers when they improve conversion:
  - data-ai-layout values: hero, media-left, media-right, benefit-grid, callout, comparison, media-grid, proof-strip, spec-table, stack.
  - data-ai-slot values: copy, media, benefit, proof, details, action, specs.
  - Example: <div data-ai-layout="media-left" data-ai-section="visual details"><div data-ai-slot="media">...</div><div data-ai-slot="copy">...</div></div>
- Use media-left or media-right only when an image strengthens the section. Use img tags only with provided uploaded image URLs. If a useful image is missing, add it to image_requests instead of inventing a URL.
- For every image_requests item, write section_heading and section_copy as customer-facing marketing copy for the long-description image/text section. Do not put the raw image prompt in section_copy. Explain why that angle, close-up, detail, or lifestyle scene helps the buyer trust the product.
- Use benefit-grid for 2-3 buyer reasons, callout for confidence/ordering/care, spec-table for technical facts, and media-grid when multiple valid media links/images belong together.
- If dimensions, specifications, SKU, price, warehouse, materials, or finish are provided, include a Specifications section as an HTML table.
- If video links are provided, embed them in the relevant Product Media section. Convert YouTube watch, shorts, live, youtu.be, or embed URLs to https://www.youtube-nocookie.com/embed/VIDEO_ID inside an iframe. Use a video tag for direct mp4, webm, or ogg URLs. Use anchor links only for video URLs that cannot be safely embedded.
- Use h2/h3 for sections, p for prose, ul/li for benefits, table for specifications, video/iframe for embeddable video, and anchor links for non-video URLs.
- Do not include scripts, styles, forms, buttons, markdown fences, or unsafe HTML.`;
};

const extractOpenAIText = (data: Record<string, unknown>) => {
  if (typeof data.output_text === "string") return data.output_text;
  const output = Array.isArray(data.output) ? data.output : [];
  return output.flatMap((item) => {
    const row = item && typeof item === "object" ? item as Record<string, unknown> : {};
    return Array.isArray(row.content) ? row.content : [];
  }).map((item) => {
    const row = item && typeof item === "object" ? item as Record<string, unknown> : {};
    return String(row.text || row.content || "");
  }).filter(Boolean).join("\n");
};

const parseJson = (value: string) => {
  try {
    return JSON.parse(value);
  } catch {
    const match = value.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  }
};

const generateTextWithOpenAI = async (apiKey: string, body: Record<string, unknown>, imageRequests: Array<Record<string, string>>) => {
  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: Deno.env.get("OPENAI_TEXT_MODEL") || "gpt-5.5",
      instructions: "You are a senior ecommerce content architect and conversion copywriter for premium furniture. Choose page layout, components, and persuasive emphasis from the buyer context and selected tone.",
      input: buildPrompt(body, imageRequests),
    }),
  });

  if (!response.ok) throw new Error(`OpenAI text generation failed (${response.status})`);
  const parsed = parseJson(extractOpenAIText(await response.json()));
  if (!parsed) throw new Error("OpenAI returned copy that could not be parsed.");
  return parsed;
};

const generateTextWithLovable = async (apiKey: string, body: Record<string, unknown>, imageRequests: Array<Record<string, string>>) => {
  const imageUrls = asArray(body.imageUrls).filter((url) => /^https?:\/\//i.test(url));
  const prompt = buildPrompt(body, imageRequests);
  const userContent = imageUrls.length
    ? [
        { type: "text", text: prompt },
        ...imageUrls.slice(0, 8).map((url) => ({ type: "image_url", image_url: { url } })),
      ]
    : prompt;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: "You write safe structured ecommerce product copy and conversion-focused page layouts for premium furniture." },
        { role: "user", content: userContent },
      ],
    }),
  });

  if (!response.ok) throw new Error(`AI gateway error (${response.status})`);
  const data = await response.json();
  const parsed = parseJson(data.choices?.[0]?.message?.content?.trim() || "");
  if (!parsed) throw new Error("AI gateway returned copy that could not be parsed.");
  return parsed;
};

const generateImagesWithOpenAI = async (apiKey: string, imageRequests: Array<Record<string, string>>, enabled: boolean) => {
  if (!enabled || !imageRequests.length) return [];
  const limit = Math.max(1, Math.min(Number(Deno.env.get("OPENAI_IMAGE_MAX") || 2), imageRequests.length, 4));
  const generated = [];

  for (const request of imageRequests.slice(0, limit)) {
    const response = await fetch(OPENAI_IMAGES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: Deno.env.get("OPENAI_IMAGE_MODEL") || "gpt-image-2",
        prompt: request.prompt,
        size: Deno.env.get("OPENAI_IMAGE_SIZE") || "1024x1024",
        quality: Deno.env.get("OPENAI_IMAGE_QUALITY") || "low",
        n: 1,
      }),
    });

    if (!response.ok) throw new Error(`OpenAI image generation failed (${response.status})`);
    const data = await response.json();
    const image = data?.data?.[0];
    if (image?.b64_json) {
      generated.push({ ...request, dataUrl: `data:image/png;base64,${image.b64_json}`, revised_prompt: image.revised_prompt || "" });
    } else if (image?.url) {
      generated.push({ ...request, url: image.url, revised_prompt: image.revised_prompt || "" });
    }
  }

  return generated;
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json() as Record<string, unknown>;
    const answers = body.answers && typeof body.answers === "object" ? body.answers as Record<string, unknown> : {};

    if (!body.name || !body.category) {
      return new Response(JSON.stringify({ error: "name and category are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const context = {
      productName: asString(body.name, "This product"),
      category: asString(body.category, "office furniture"),
      materials: firstNonEmpty(answers.materials, body.features),
      dimensions: firstNonEmpty(answers.dimensions, body.sku),
      idealBuyer: firstNonEmpty(answers.idealBuyer),
      useCase: firstNonEmpty(answers.useCase),
      visibleDetails: firstNonEmpty(answers.visibleDetails),
    };
    const imageRequests = buildImageRequests(context, answers.extraMediaNotes, answers.generateImageIdeas === true);
    const fallback = buildLocalCopy(body, imageRequests);
    const warnings: string[] = [];
    let copy: Record<string, unknown> = fallback;

    const openAiKey = Deno.env.get("OPENAI_API_KEY");
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");

    if (openAiKey) {
      try {
        copy = { ...fallback, ...(await generateTextWithOpenAI(openAiKey, body, imageRequests)) };
      } catch (error) {
        warnings.push(error instanceof Error ? error.message : "OpenAI text generation failed.");
      }
    }

    if ((!copy.description || !copy.long_description) && lovableKey) {
      try {
        copy = { ...fallback, ...(await generateTextWithLovable(lovableKey, body, imageRequests)) };
      } catch (error) {
        warnings.push(error instanceof Error ? error.message : "AI gateway text generation failed.");
      }
    }

    copy = {
      ...copy,
      image_requests: normalizeImageRequests(context, copy.image_requests || imageRequests),
    };

    let generatedImages: unknown[] = [];
    if (openAiKey) {
      try {
        generatedImages = await generateImagesWithOpenAI(
          openAiKey,
          copy.image_requests as Array<Record<string, string>>,
          answers.generateImageIdeas === true || Boolean(firstNonEmpty(answers.extraMediaNotes)),
        );
        generatedImages = normalizeImageRequests(context, generatedImages);
      } catch (error) {
        warnings.push(error instanceof Error ? error.message : "OpenAI image generation failed.");
      }
    } else if (answers.generateImageIdeas === true || Boolean(firstNonEmpty(answers.extraMediaNotes))) {
      warnings.push("OPENAI_API_KEY is not configured, so exact image requests were prepared for manual upload.");
    }

    const mode = body.mode === "long_description" ? "long_description" : "description";
    const videoLinks = asArray(answers.videoLinks);
    const videoEmbeds = videoLinks.map((link, index) => renderVideoEmbed(link, index)).filter(Boolean);
    if (
      mode === "long_description" &&
      videoEmbeds.length &&
      !hasEmbeddedMedia(copy.long_description)
    ) {
      const mediaHtml = [
        '<div data-ai-layout="media-grid" data-ai-section="product media">',
        `<div data-ai-slot="media">${videoEmbeds.join("")}</div>`,
        '<div data-ai-slot="details"><h3>Product Media</h3><p>Watch the product media to confirm scale, finish, and placement before ordering.</p></div>',
        "</div>",
      ].join("");
      copy = {
        ...copy,
        long_description: [asString(copy.long_description || fallback.long_description), mediaHtml].filter(Boolean).join(""),
      };
    }

    const payload = mode === "long_description"
      ? {
          description: asString(copy.description || fallback.description),
          long_description: asString(copy.long_description || fallback.long_description),
        }
      : {
          description: asString(copy.description || fallback.description),
        };

    return new Response(JSON.stringify({
      ...payload,
      image_requests: Array.isArray(copy.image_requests) && copy.image_requests.length ? copy.image_requests : imageRequests,
      generated_images: generatedImages,
      warning: warnings.join(" "),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-product-description error", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
