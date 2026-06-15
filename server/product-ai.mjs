import "./load-env.mjs";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const OPENAI_IMAGES_URL = "https://api.openai.com/v1/images/generations";

const asString = (value, fallback = "") =>
  value === null || value === undefined ? fallback : String(value).trim();

const asStringArray = (value) => {
  if (Array.isArray(value)) return value.map(asString).filter(Boolean);
  if (typeof value === "string") return parseLines(value);
  return [];
};

const escapeHtml = (value) =>
  asString(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const firstNonEmpty = (...values) => values.map(asString).find(Boolean) || "";

const parseLines = (value) =>
  String(value || "")
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

const stripHtml = (value) =>
  asString(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const youtubeIdPattern = /^[a-z0-9_-]{6,32}$/i;

const getYoutubeVideoId = (value) => {
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

const getYoutubeEmbedUrl = (value) => {
  const id = getYoutubeVideoId(value);
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : "";
};

const isDirectVideoUrl = (value) => /^https?:\/\/.+\.(?:mp4|webm|ogg)(?:[?#].*)?$/i.test(asString(value));

const renderVideoEmbed = (link, index = 0) => {
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

const hasEmbeddedMedia = (html) => /<(?:iframe|video)\b/i.test(asString(html));

const sentence = (value) => {
  const text = asString(value).replace(/\s+/g, " ").trim();
  if (!text) return "";
  return /[.!?]$/.test(text) ? text : `${text}.`;
};

const toneProfile = (tone = "") => {
  const normalized = tone.toLowerCase();
  if (normalized.includes("corporate")) {
    return {
      adjective: "procurement-ready",
      voice: "precise, specification-led, and commercially practical",
      opening: "Built for confident commercial selection",
      cadence: "clear specification language, confident value framing, and minimal flourish",
      conversionPromise: "The result is a confident specification-led choice for teams comparing fit, stock, and long-term value.",
      layoutStrategy: "Lead with proof, specifications, availability, and quote confidence before softer styling language.",
      toneKey: "corporate procurement",
    };
  }
  if (normalized.includes("warm")) {
    return {
      adjective: "welcoming",
      voice: "warm, helpful, and showroom-consultative",
      opening: "Designed to feel approachable and easy to place",
      cadence: "inviting guidance, soft benefits, and practical reassurance",
      conversionPromise: "The result is an easy-to-understand recommendation that helps the buyer picture the piece in their room.",
      layoutStrategy: "Lead with room fit, practical reassurance, and guided buying advice.",
      toneKey: "warm showroom",
    };
  }
  if (normalized.includes("luxury")) {
    return {
      adjective: "elevated",
      voice: "elegant, refined, and lifestyle-led",
      opening: "Styled for a polished interior statement",
      cadence: "refined phrasing, sensory detail, and restrained luxury cues",
      conversionPromise: "The result is an elevated presentation that makes the product feel considered, desirable, and worth choosing.",
      layoutStrategy: "Lead with aspiration, material presence, media-led storytelling, and restrained proof points.",
      toneKey: "luxury styling",
    };
  }
  if (normalized.includes("clear")) {
    return {
      adjective: "practical",
      voice: "direct, useful, and easy to compare",
      opening: "Made for straightforward product selection",
      cadence: "plain language, short benefit-led clauses, and direct comparison points",
      conversionPromise: "The result is a clear buying path that answers what it is, where it fits, and why it is worth ordering.",
      layoutStrategy: "Lead with the decision summary, key benefits, and specifications early.",
      toneKey: "clear practical",
    };
  }
  return {
    adjective: "premium",
    voice: "premium, polished, and buyer-focused",
    opening: "Crafted for a polished workspace impression",
    cadence: "polished showroom language, concrete details, and buyer confidence",
    conversionPromise: "The result is a polished product story that builds confidence while keeping the next buying step close.",
    layoutStrategy: "Lead with a strong showroom overview, then pair visual proof with benefit-led copy and clear ordering reassurance.",
    toneKey: "premium polished",
  };
};

const buildContext = (body = {}) => {
  const answers = body?.answers && typeof body.answers === "object" ? body.answers : {};
  const productName = firstNonEmpty(body.name, "This product");
  const category = firstNonEmpty(body.category, "office furniture");
  const imageLabels = asStringArray(body.imageLabels);
  const imageUrls = asStringArray(body.imageUrls);
  const colorVariants = Array.isArray(body.colorVariants) ? body.colorVariants : [];
  const tone = firstNonEmpty(answers.tone, "Premium and polished");
  const profile = toneProfile(tone);
  const materials = firstNonEmpty(answers.materials, body.features, "premium materials and durable construction");
  const dimensions = firstNonEmpty(answers.dimensions, body.sku ? `SKU/model reference: ${body.sku}` : "");
  const idealBuyer = firstNonEmpty(answers.idealBuyer, "modern offices, reception areas, home workspaces, and project fit-outs");
  const useCase = firstNonEmpty(answers.useCase, "daily use, client-facing presentation, and practical commercial fit-outs");
  const visibleDetails = firstNonEmpty(
    answers.visibleDetails,
    imageUrls.length ? `The uploaded media includes ${imageUrls.length} product view${imageUrls.length === 1 ? "" : "s"} for confirming shape, finish, and proportion.` : "",
  );
  const focus = firstNonEmpty(answers.focus, useCase);
  const currentDescription = firstNonEmpty(body.description);
  const currentLongDescription = firstNonEmpty(stripHtml(body.long_description));
  const videoLinks = asStringArray(answers.videoLinks);
  const layoutOrder = parseLines(
    firstNonEmpty(
      answers.layoutOrder,
      "Lead with the strongest buying reason, pair visuals with finish or scale copy, place specifications near the buying decision, close with delivery and quote reassurance",
    ),
  );
  const imageRequests = buildImageRequests({
    productName,
    category,
    materials,
    dimensions,
    idealBuyer,
    useCase,
    visibleDetails,
    extraMediaNotes: answers.extraMediaNotes,
    generateImageIdeas: answers.generateImageIdeas,
  });

  return {
    mode: body?.mode === "long_description" ? "long_description" : "description",
    answers,
    productName,
    category,
    featuredSubcategory: firstNonEmpty(body.featuredSubcategory),
    price: firstNonEmpty(body.price),
    currency: firstNonEmpty(body.currency),
    sku: firstNonEmpty(body.sku),
    warehouse: firstNonEmpty(body.warehouse),
    imageLabels,
    imageUrls,
    colorVariants,
    tone,
    profile,
    materials,
    dimensions,
    idealBuyer,
    useCase,
    visibleDetails,
    focus,
    currentDescription,
    currentLongDescription,
    videoLinks,
    layoutOrder,
    imageRequests,
  };
};

const buildImageRequests = ({
  productName,
  category,
  materials,
  dimensions,
  idealBuyer,
  useCase,
  visibleDetails,
  extraMediaNotes,
  generateImageIdeas,
}) => {
  const requested = parseLines(extraMediaNotes);
  const defaults = generateImageIdeas
    ? [
        "front three-quarter showroom view",
        "side profile showing scale and proportions",
        "close-up detail of finish, upholstery, hardware, or texture",
      ]
    : [];
  const source = requested.length ? requested : defaults;

  return source.slice(0, 4).map((note, index) => {
    const cleanNote = note.replace(/^(ask for|generate|request|add)\s+/i, "").trim();
    const title = cleanNote
      .replace(/\.$/, "")
      .split(/\s+/)
      .slice(0, 8)
      .join(" ");
    const marketing = buildImageSectionCopy({
      productName,
      category,
      materials,
      dimensions,
      idealBuyer,
      useCase,
      visibleDetails,
    }, cleanNote || note);
    return {
      id: `ai-image-${index + 1}`,
      title: title || `Supporting image ${index + 1}`,
      purpose: cleanNote || note,
      section_heading: marketing.section_heading,
      section_copy: marketing.section_copy,
      marketing_copy: marketing.section_copy,
      caption: marketing.caption,
      prompt: [
        `Photorealistic premium furniture product image for ${productName}, a ${category}.`,
        `Create: ${cleanNote || note}.`,
        materials ? `Materials and finish: ${materials}.` : "",
        dimensions ? `Specifications or scale notes: ${dimensions}.` : "",
        idealBuyer ? `Intended room or buyer: ${idealBuyer}.` : "",
        useCase ? `Use case: ${useCase}.` : "",
        visibleDetails ? `Preserve these visible details where relevant: ${visibleDetails}.` : "",
        "Clean showroom lighting, accurate proportions, no people, no text overlays, no watermark, product centered and easy to inspect.",
      ].filter(Boolean).join(" "),
    };
  });
};

const buildImagePrompt = (context, purpose) => [
  `Photorealistic premium furniture product image for ${context.productName}, a ${context.category}.`,
  `Create: ${purpose}.`,
  context.materials ? `Materials and finish: ${context.materials}.` : "",
  context.dimensions ? `Specifications or scale notes: ${context.dimensions}.` : "",
  context.idealBuyer ? `Intended room or buyer: ${context.idealBuyer}.` : "",
  context.useCase ? `Use case: ${context.useCase}.` : "",
  context.visibleDetails ? `Preserve these visible details where relevant: ${context.visibleDetails}.` : "",
  "Clean showroom lighting, accurate proportions, no people, no text overlays, no watermark, product centered and easy to inspect.",
].filter(Boolean).join(" ");

const buildImageSectionCopy = (context, purposeValue) => {
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

const normalizeImageRequests = (context, requests = []) =>
  (Array.isArray(requests) ? requests : []).slice(0, 4).map((request, index) => {
    const purpose = firstNonEmpty(request?.purpose, request?.title, `supporting product image ${index + 1}`);
    const title = firstNonEmpty(request?.title, purpose.split(/\s+/).slice(0, 8).join(" "), `Supporting image ${index + 1}`);
    const marketing = buildImageSectionCopy(context, purpose);
    return {
      ...request,
      id: firstNonEmpty(request?.id, `ai-image-${index + 1}`),
      title,
      purpose,
      prompt: firstNonEmpty(request?.prompt, buildImagePrompt(context, purpose)),
      section_heading: firstNonEmpty(request?.section_heading, marketing.section_heading),
      section_copy: firstNonEmpty(request?.section_copy, request?.marketing_copy, marketing.section_copy),
      marketing_copy: firstNonEmpty(request?.marketing_copy, request?.section_copy, marketing.section_copy),
      caption: firstNonEmpty(request?.caption, marketing.caption),
    };
  });

const buildDescription = (context) => {
  const {
    productName,
    category,
    featuredSubcategory,
    materials,
    dimensions,
    idealBuyer,
    useCase,
    visibleDetails,
    currentDescription,
    currentLongDescription,
    profile,
  } = context;
  const categoryLabel = category.toLowerCase();
  const article = /^[aeiou]/i.test(categoryLabel) ? "an" : "a";
  const existingCues = [currentDescription, currentLongDescription]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .slice(0, 220);
  const placement = featuredSubcategory
    ? `${article} ${categoryLabel} piece in the ${featuredSubcategory.toLowerCase()} range`
    : `${article} ${categoryLabel} piece`;

  return [
    `${profile.opening}, ${productName} is ${placement} made for ${idealBuyer}.`,
    `It brings together ${materials} and ${useCase}, giving shoppers a clear reason to picture it in their own space.`,
    visibleDetails ? sentence(`The product details worth noticing are ${visibleDetails}`) : "",
    dimensions ? `Specifications such as ${dimensions} make it easier to confirm fit before ordering.` : "",
    existingCues ? "Existing catalogue notes have been reshaped into a clearer buying story." : "",
    profile.conversionPromise,
  ].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
};

const renderImageFigure = (context, index = 0) => {
  const image = context.imageUrls[index];
  if (!image) return "";
  const label = context.imageLabels[index] || `${context.productName} detail`;
  return [
    "<figure>",
    `<img src="${escapeHtml(image)}" alt="${escapeHtml(label)}" />`,
    `<figcaption>${escapeHtml(label)}</figcaption>`,
    "</figure>",
  ].join("");
};

const renderOverview = (context, description) => [
  `<div data-ai-layout="hero" data-ai-section="overview" data-ai-tone="${escapeHtml(context.profile.toneKey)}">`,
  `<h2>${escapeHtml(context.productName)}</h2>`,
  `<p>${escapeHtml(description)}</p>`,
  "</div>",
].join("");

const renderBestFit = (context) => [
  '<div data-ai-layout="callout" data-ai-section="buyer fit">',
  "<h3>Best Fit</h3>",
  `<p>${escapeHtml(context.productName)} suits ${escapeHtml(context.idealBuyer)} where the priority is ${escapeHtml(context.focus)}.</p>`,
  `<p>${escapeHtml(context.profile.layoutStrategy)}</p>`,
  "</div>",
].join("");

const renderVisualDetails = (context) => {
  const imageReview = context.imageLabels.length
    ? `<p>Image review covered ${context.imageLabels.slice(0, 6).map(escapeHtml).join(", ")}${context.imageLabels.length > 6 ? ", and more" : ""}.</p>`
    : "";
  const media = renderImageFigure(context);
  const copy = [
    "<h3>Finish, Shape, and First Impression</h3>",
    `<p>${escapeHtml(context.visibleDetails || "Use the product images to confirm finish, proportion, profile, and buyer-facing details before publishing.")}</p>`,
    imageReview,
  ].filter(Boolean).join("");

  if (media) {
    return [
      '<div data-ai-layout="media-left" data-ai-section="visual details">',
      `<div data-ai-slot="media">${media}</div>`,
      `<div data-ai-slot="copy">${copy}</div>`,
      "</div>",
    ].join("");
  }

  return [
    '<div data-ai-layout="stack" data-ai-section="visual details">',
    "<h3>Visual Details</h3>",
    `<p>${escapeHtml(context.visibleDetails || "Use the product images to confirm finish, proportion, profile, and buyer-facing details before publishing.")}</p>`,
    imageReview,
    "</div>",
  ].filter(Boolean).join("");
};

const renderBenefits = (context) => [
  '<div data-ai-layout="benefit-grid" data-ai-section="buying reasons">',
  '<div data-ai-slot="benefit">',
  "<h3>Why It Works</h3>",
  `<p>${escapeHtml(sentence(context.useCase))}</p>`,
  "</div>",
  '<div data-ai-slot="benefit">',
  "<h3>Comfort and Function</h3>",
  `<p>${escapeHtml(sentence(`The ${context.profile.voice} positioning helps customers understand fit, finish, and daily value quickly`))}</p>`,
  "</div>",
  '<div data-ai-slot="benefit">',
  "<h3>Easy to Choose</h3>",
  `<p>${escapeHtml(context.featuredSubcategory ? `Placed in the ${context.featuredSubcategory} range for easier browsing and comparison.` : "Organized so shoppers can compare the piece confidently before requesting a quote.")}</p>`,
  "</div>",
  "</div>",
].filter(Boolean).join("");

const renderSpecifications = (context) => {
  const rows = [
    ["Category", context.category],
    ["Featured type", context.featuredSubcategory],
    ["Materials / finish", context.materials],
    ["Dimensions / specs", context.dimensions],
    ["SKU / model", context.sku],
    ["Warehouse", context.warehouse],
    ["Price", [context.currency, context.price].filter(Boolean).join(" ")],
  ].filter(([, value]) => value);

  if (!rows.length) return "";

  return [
    '<div data-ai-layout="spec-table" data-ai-section="specifications">',
    "<h3>Specifications</h3>",
    "<table><tbody>",
    ...rows.map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`),
    "</tbody></table>",
    "</div>",
  ].join("");
};

const renderCare = () => [
  '<div data-ai-layout="callout" data-ai-section="care and placement">',
  "<h3>Care and Placement</h3>",
  "<p>Place the product in a dry indoor setting, clean with suitable furniture-safe products, and confirm finish-specific care guidance with the showroom team before delivery.</p>",
  "</div>",
].join("");

const renderDelivery = (context) => [
  '<div data-ai-layout="callout" data-ai-section="delivery and ordering">',
  '<div data-ai-slot="action">',
  "<h3>Delivery and Ordering</h3>",
  `<p>Confirm availability${context.warehouse ? ` from ${escapeHtml(context.warehouse)}` : ""}, delivery timing, and project quantities with the Regal Office & Home team.</p>`,
  '<p><a href="/contact">Contact the showroom</a> for bulk orders, quotations, and project support.</p>',
  "</div>",
  "</div>",
].join("");

const renderMedia = (context) => {
  const secondImage = renderImageFigure(context, 1);
  const videoEmbeds = context.videoLinks.map(renderVideoEmbed).filter(Boolean);
  const fallbackLinks = context.videoLinks.filter((link) => !renderVideoEmbed(link));
  if (!context.videoLinks.length && !secondImage) return "";
  return [
    '<div data-ai-layout="media-grid" data-ai-section="product media">',
    secondImage ? `<div data-ai-slot="media">${secondImage}</div>` : "",
    videoEmbeds.length ? `<div data-ai-slot="media">${videoEmbeds.join("")}</div>` : "",
    '<div data-ai-slot="details">',
    "<h3>Product Media</h3>",
    videoEmbeds.length ? "<p>Watch the product media to confirm scale, finish, and placement before ordering.</p>" : "",
    fallbackLinks.length ? [
    "<ul>",
    ...fallbackLinks.map((link) => `<li><a href="${escapeHtml(link)}">${escapeHtml(link)}</a></li>`),
    "</ul>",
    ].join("") : "",
    !videoEmbeds.length && !fallbackLinks.length ? "<p>Use the supporting product media to confirm finish, scale, and placement before ordering.</p>" : "",
    "</div>",
    "</div>",
  ].filter(Boolean).join("");
};

const sectionRenderers = [
  { match: /overview|intro|summary|decision|lead|strongest/i, render: renderOverview },
  { match: /visual|image|photo|detail/i, render: renderVisualDetails },
  { match: /comfort|function|benefit|reason|value|use/i, render: renderBenefits },
  { match: /spec|dimension|material|finish|price|sku|warehouse/i, render: renderSpecifications },
  { match: /fit|buyer|room|focus/i, render: renderBestFit },
  { match: /care|maintenance/i, render: renderCare },
  { match: /delivery|order|quote|buy|rfq/i, render: renderDelivery },
  { match: /media|video|link/i, render: renderMedia },
];

const buildLongDescription = (context, description) => {
  const rendered = [];
  const used = new Set();
  const renderByName = (name) => {
    const renderer = sectionRenderers.find((item) => item.match.test(name));
    if (!renderer || used.has(renderer.render.name)) return;
    const html = renderer.render(context, description);
    if (!html) return;
    used.add(renderer.render.name);
    rendered.push(html);
  };

  context.layoutOrder.forEach(renderByName);
  [
    "Overview",
    "Best fit",
    "Visual details",
    "Comfort and function",
    "Specifications",
    "Product media",
    "Care",
    "Delivery and ordering",
  ].forEach(renderByName);

  return rendered.join("");
};

const buildFallbackCopy = (context) => {
  const description = buildDescription(context);
  const long_description = buildLongDescription(context, description);
  return {
    description,
    long_description,
    image_requests: context.imageRequests,
  };
};

const extractResponseText = (data) => {
  if (typeof data?.output_text === "string") return data.output_text;
  const content = data?.output?.flatMap((item) => item?.content || []) || [];
  const texts = content
    .map((item) => item?.text || item?.content || "")
    .filter(Boolean);
  return texts.join("\n").trim();
};

const parseJsonResponse = (value) => {
  const text = asString(value);
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
};

const buildOpenAITextPrompt = (context) => {
  const currentCopy = context.mode === "long_description"
    ? context.currentLongDescription || context.currentDescription
    : context.currentDescription || context.currentLongDescription;
  return `Generate product copy for Regal Office & Home.

Return strict JSON with these keys:
{
  "description": "plain text short description",
  "long_description": "safe HTML fragment using the layout primitives below",
  "image_requests": [{"title":"", "purpose":"", "prompt":"", "section_heading":"", "section_copy":"", "caption":""}]
}

Product:
- Name: ${context.productName}
- Category: ${context.category}
- Featured subcategory: ${context.featuredSubcategory || "None"}
- Price: ${[context.currency, context.price].filter(Boolean).join(" ") || "Not provided"}
- SKU/model: ${context.sku || "Not provided"}
- Warehouse: ${context.warehouse || "Not provided"}
- Uploaded image labels: ${context.imageLabels.join(", ") || "None"}
- Uploaded image URLs: ${context.imageUrls.join(", ") || "None"}
- Color variants: ${context.colorVariants.map((variant) => [variant.name, variant.hex, variant.image_count ? `${variant.image_count} images` : ""].filter(Boolean).join(" / ")).join("; ") || "None"}

Admin guidance:
- Tone: ${context.tone}
- Ideal buyer or room: ${context.idealBuyer}
- Visible details: ${context.visibleDetails}
- Materials, finish, or color: ${context.materials}
- Dimensions or specifications: ${context.dimensions}
- Use case and benefit focus: ${context.useCase}
- Main focus: ${context.focus}
- Preferred section order: ${context.layoutOrder.join(", ")}
- Video links: ${context.videoLinks.join(", ") || "None"}
- Other images to request or generate: ${context.imageRequests.map((item) => item.purpose).join("; ") || "None"}
- Existing copy to rewrite in the requested tone: ${currentCopy || "None"}

Rules:
- Rewrite existing copy into the requested tone when existing copy is present. Do not copy any existing sentence verbatim unless it is a model number, dimension, material, URL, or fixed product name.
- Do not describe your writing process or say "the copy uses". Write customer-facing sales copy only.
- For short description, return 70 to 120 words with no headings. Make it feel written in the selected tone, with a clear buyer reason to continue.
- For long_description, act as a conversion-focused ecommerce page architect. Do not list the preferred section order. Use it to decide section sequence, pacing, and emphasis.
- Let tone influence layout decisions:
  - Premium and polished: start with a strong showroom overview, then visual proof, benefits, specifications, and ordering reassurance.
  - Clear and practical: put decision clarity and specifications early; use concise bullets and tables.
  - Warm showroom consultant: use guided fit sections, reassuring callouts, and friendly explanatory copy.
  - Corporate procurement: prioritize specification tables, availability, quantity/quote confidence, and proof points.
  - Luxury home styling: lead with aspiration and media/text storytelling, then restrained proof and care details.
- Use only these safe layout wrappers when they improve conversion:
  - data-ai-layout values: hero, media-left, media-right, benefit-grid, callout, comparison, media-grid, proof-strip, spec-table, stack.
  - data-ai-slot values: copy, media, benefit, proof, details, action, specs.
  - Example: <div data-ai-layout="media-left" data-ai-section="visual details" data-ai-tone="${context.profile.toneKey}"><div data-ai-slot="media">...</div><div data-ai-slot="copy">...</div></div>
- Use media-left or media-right only when an image strengthens the section. Use img tags only with provided uploaded image URLs. If a useful image is missing, add it to image_requests instead of inventing a URL.
- For every image_requests item, write section_heading and section_copy as customer-facing marketing copy for the long-description image/text section. Do not put the raw image prompt in section_copy. Explain why that angle, close-up, detail, or lifestyle scene helps the buyer trust the product.
- Use benefit-grid for 2-3 buyer reasons, callout for confidence/ordering/care, spec-table for technical facts, and media-grid when multiple valid media links/images belong together.
- If dimensions, specifications, SKU, price, warehouse, materials, or finish are provided, include a Specifications section as an HTML table.
- If video links are provided, embed them in the relevant Product Media section. Convert YouTube watch, shorts, live, youtu.be, or embed URLs to https://www.youtube-nocookie.com/embed/VIDEO_ID inside an iframe. Use a video tag for direct mp4, webm, or ogg URLs. Use anchor links only for video URLs that cannot be safely embedded.
- Choose HTML components intelligently: h2/h3 for sections, p for prose, ul/li for scannable benefits, table for specifications, video/iframe for embeddable video, and anchor links for non-video URLs.
- Do not include scripts, styles, forms, buttons, markdown fences, or unsafe HTML.
- Keep facts grounded in the provided values.`;
};

const callOpenAIText = async (context) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_TEXT_MODEL || "gpt-5.5",
      instructions: "You are a senior ecommerce content architect and conversion copywriter for premium furniture. Generate safe, structured product copy that chooses page layout, components, and persuasive emphasis from the buyer context and selected tone.",
      input: buildOpenAITextPrompt(context),
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`OpenAI text generation failed (${response.status}): ${message.slice(0, 240)}`);
  }

  const data = await response.json();
  const parsed = parseJsonResponse(extractResponseText(data));
  if (!parsed) throw new Error("OpenAI returned text that could not be parsed as JSON.");

  return {
    description: asString(parsed.description),
    long_description: asString(parsed.long_description),
    image_requests: Array.isArray(parsed.image_requests) ? normalizeImageRequests(context, parsed.image_requests) : context.imageRequests,
  };
};

const callOpenAIImages = async (context, imageRequests) => {
  const apiKey = process.env.OPENAI_API_KEY;
  const shouldGenerateImages = context.answers.generateImageIdeas === true || Boolean(firstNonEmpty(context.answers.extraMediaNotes));
  if (!apiKey || !shouldGenerateImages || !imageRequests.length) return [];

  const limit = Math.max(1, Math.min(Number(process.env.OPENAI_IMAGE_MAX || 2), imageRequests.length, 4));
  const model = process.env.OPENAI_IMAGE_MODEL || "gpt-image-2";
  const generated = [];

  for (const request of imageRequests.slice(0, limit)) {
    const response = await fetch(OPENAI_IMAGES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        prompt: request.prompt,
        size: process.env.OPENAI_IMAGE_SIZE || "1024x1024",
        quality: process.env.OPENAI_IMAGE_QUALITY || "low",
        n: 1,
      }),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`OpenAI image generation failed (${response.status}): ${message.slice(0, 240)}`);
    }

    const data = await response.json();
    const image = data?.data?.[0];
    if (image?.b64_json) {
      generated.push({
        ...request,
        dataUrl: `data:image/png;base64,${image.b64_json}`,
        revised_prompt: image.revised_prompt || "",
      });
    } else if (image?.url) {
      generated.push({
        ...request,
        url: image.url,
        revised_prompt: image.revised_prompt || "",
      });
    }
  }

  return generated;
};

export const buildGeneratedProductCopy = async (body = {}) => {
  const context = buildContext(body);
  const fallback = buildFallbackCopy(context);
  let result = fallback;
  const warnings = [];

  try {
    const openAiCopy = await callOpenAIText(context);
    if (openAiCopy?.description || openAiCopy?.long_description) {
      result = {
        ...fallback,
        ...openAiCopy,
        image_requests: openAiCopy.image_requests?.length ? openAiCopy.image_requests : fallback.image_requests,
      };
    }
  } catch (error) {
    warnings.push(error instanceof Error ? error.message : "OpenAI text generation failed.");
  }

  try {
    const generated_images = await callOpenAIImages(context, result.image_requests || []);
    if (generated_images.length) {
      result = { ...result, generated_images };
    } else if ((context.answers.generateImageIdeas || firstNonEmpty(context.answers.extraMediaNotes)) && !process.env.OPENAI_API_KEY) {
      warnings.push("OPENAI_API_KEY is not configured, so image prompts were prepared for manual upload.");
    }
  } catch (error) {
      warnings.push(error instanceof Error ? error.message : "OpenAI image generation failed.");
  }

  result = {
    ...result,
    image_requests: normalizeImageRequests(context, result.image_requests || fallback.image_requests),
    generated_images: normalizeImageRequests(context, result.generated_images || []),
  };

  const mediaHtml = renderMedia(context);
  if (context.mode === "long_description" && mediaHtml && hasEmbeddedMedia(mediaHtml) && !hasEmbeddedMedia(result.long_description)) {
    result = {
      ...result,
      long_description: [result.long_description || fallback.long_description, mediaHtml].filter(Boolean).join(""),
    };
  }

  const response = context.mode === "long_description"
    ? {
        description: result.description || fallback.description,
        long_description: result.long_description || fallback.long_description,
      }
    : {
        description: result.description || fallback.description,
      };

  return {
    ...response,
    image_requests: result.image_requests || fallback.image_requests,
    generated_images: result.generated_images || [],
    warning: warnings.join(" "),
  };
};
