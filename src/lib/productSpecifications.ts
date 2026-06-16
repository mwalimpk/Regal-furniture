export type ProductSpecification = {
  label: string;
  value: string;
};

const genericHeaderLabels = new Set(["feature", "label", "name", "specification", "value"]);

const specificationLabelPattern =
  /\b(category|dimension|feature|finish|material|model|price|sku|spec|warehouse|warranty|availability|color|colour|height|width|depth|frame|seat|fabric|leather|wood|capacity)\b/i;

const normalizeText = (value: string | null | undefined) =>
  String(value || "")
    .replace(/\s+/g, " ")
    .trim();

const normalizeLabel = (value: string) =>
  normalizeText(value)
    .replace(/[:：]+$/, "")
    .trim();

const normalizeKey = (value: string) =>
  normalizeLabel(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const hasUsefulValue = (value: string) => {
  const normalized = normalizeText(value).toLowerCase();
  return Boolean(normalized && !["-", "n/a", "na", "none", "null", "undefined"].includes(normalized));
};

const textFromCells = (cells: HTMLCollectionOf<HTMLTableCellElement>, startIndex: number) =>
  Array.from(cells)
    .slice(startIndex)
    .map((cell) => normalizeText(cell.textContent))
    .filter(hasUsefulValue)
    .join(" ");

const specificationsFromTable = (table: HTMLTableElement): ProductSpecification[] =>
  Array.from(table.rows)
    .map((row) => {
      const cells = row.cells;
      if (cells.length < 2) return null;

      const label = normalizeLabel(cells[0].textContent || "");
      const value = textFromCells(cells, 1);
      const labelKey = normalizeKey(label);

      if (!label || !value || genericHeaderLabels.has(labelKey)) return null;
      return { label, value };
    })
    .filter((spec): spec is ProductSpecification => Boolean(spec));

const hasSpecificationHeadingBefore = (table: HTMLTableElement) => {
  let previous = table.previousElementSibling;

  while (previous) {
    const tagName = previous.tagName.toUpperCase();
    if (/^H[1-6]$/.test(tagName)) {
      return /specification|specs/i.test(previous.textContent || "");
    }

    previous = previous.previousElementSibling;
  }

  return false;
};

const isSpecificationTable = (table: HTMLTableElement) => {
  const aiContainer = table.closest("[data-ai-layout], [data-ai-section]");
  const aiLayout = aiContainer?.getAttribute("data-ai-layout") || "";
  const aiSection = aiContainer?.getAttribute("data-ai-section") || "";

  if (aiLayout === "spec-table" || /specification|specs/i.test(aiSection)) return true;
  if (hasSpecificationHeadingBefore(table)) return true;

  const labels = specificationsFromTable(table).map((spec) => spec.label);
  return labels.length >= 2 && labels.some((label) => specificationLabelPattern.test(label));
};

export const extractProductSpecificationsFromHtml = (html: string): ProductSpecification[] => {
  if (!html.trim() || typeof document === "undefined") return [];

  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;

  return mergeProductSpecifications(
    Array.from(wrapper.querySelectorAll("table"))
      .filter((table): table is HTMLTableElement => table instanceof HTMLTableElement)
      .filter(isSpecificationTable)
      .flatMap(specificationsFromTable),
  );
};

export const mergeProductSpecifications = (
  specifications: Array<ProductSpecification | null | undefined>,
): ProductSpecification[] => {
  const order: string[] = [];
  const merged = new Map<string, ProductSpecification>();

  specifications.forEach((specification) => {
    if (!specification) return;

    const label = normalizeLabel(specification.label);
    const value = normalizeText(specification.value);
    const key = normalizeKey(label);

    if (!key || !label || !hasUsefulValue(value)) return;
    if (!merged.has(key)) order.push(key);

    merged.set(key, { label, value });
  });

  return order.map((key) => merged.get(key)!);
};
