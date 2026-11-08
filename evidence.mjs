const PDF = "https://www.ema.europa.eu/en/documents/herbal-monograph/final-european-union-herbal-monograph-valeriana-officinalis-l-radix_en.pdf";
export const source = {
  title: "EMA/HMPC/150848/2015 · Valeriana officinalis L., radix",
  index: "https://www.ema.europa.eu/en/medicines/herbal/valerianae-radix",
  pages: {composition: PDF + "#page=3", forms: PDF + "#page=4"},
};
export const examples = {
  tea: {name:"Valerian root tea", botanical:"valerian", part:"root", form:"tea", solvent:"", concentration:"", basis:"", der:""},
  extract: {name:"Valerian dry extract", botanical:"valerian", part:"root", form:"dry", solvent:"ethanol", concentration:"60", basis:"vv", der:"5:1"},
  vague: {name:"Valerian capsules", botanical:"valerian", part:"root", form:"dry", solvent:"", concentration:"", basis:"", der:""},
};

const rows = [
  {id:"tea", tier:"traditional", title:"Cut valerian root prepared as tea", form:"tea", detail:"The traditional-use column includes cut valerian root as an oral herbal tea.", url:source.pages.forms, reference:"p. 4 · §3"},
  {id:"ethanol-vv", tier:"established", title:"Ethanolic dry extract", form:"dry", solvent:"ethanol", basis:"vv", minPercent:40, maxPercent:70, minDer:3, maxDer:7.4, detail:"Dry extract with a drug-to-extract ratio of 3–7.4:1 and an ethanol solvent of 40–70% by volume.", url:source.pages.composition, reference:"p. 3 · §2"},
  {id:"water", tier:"traditional", title:"Water-based dry extract", form:"dry", solvent:"water", minDer:4, maxDer:6, detail:"The traditional-use column includes a water dry extract with a drug-to-extract ratio of 4–6:1.", url:source.pages.composition, reference:"p. 3 · §2(d)"},
  {id:"ethanol-mm", tier:"traditional", title:"85% ethanol dry extract by mass", form:"dry", solvent:"ethanol", basis:"mm", minPercent:85, maxPercent:85, minDer:5.5, maxDer:7.4, detail:"This dry extract appears in the traditional-use column at 85% ethanol by mass and a ratio of 5.5–7.4:1.", url:source.pages.forms, reference:"p. 4 · §2(n)"},
];

function ratio(raw) {
  const match = String(raw ?? "").trim().match(/^(\d+(?:\.\d+)?)\s*(?:[-–]\s*(\d+(?:\.\d+)?))?\s*:\s*1$/u);
  if (!match) return null;
  const lo = Number(match[1]);
  const hi = Number(match[2] ?? match[1]);
  return lo > 0 && hi >= lo ? [lo, hi] : null;
}

export function assess(input) {
  if (!input.botanical || !input.part || !input.form) {
    return {status:"incomplete", reason:"Add the botanical name, plant part, and preparation from the label."};
  }
  if (input.botanical !== "valerian" || input.part !== "root" || !["tea","dry"].includes(input.form)) {
    return {status:"outside", reason:"This prototype covers valerian root tea and selected valerian root dry extracts."};
  }
  if (input.form === "tea") {
    return {status:"traditional", row:rows[0]};
  }
  if (!input.solvent || !String(input.der ?? "").trim()) {
    return {status:"incomplete", reason:"Look for the extraction solvent and drug-to-extract ratio, such as 5:1."};
  }
  const span = ratio(input.der);
  if (!span) return {status:"incomplete", reason:"Enter a valid ratio such as 5:1 or 4–6:1."};
  let concentration;
  if (input.solvent === "ethanol") {
    const raw = String(input.concentration ?? "").trim();
    concentration = Number(raw);
    if (!/^\d+(?:\.\d+)?$/.test(raw) || concentration > 100 || !["vv","mm"].includes(input.basis)) {
      return {status:"incomplete", reason:"Add the ethanol percentage and specify whether it is by volume (v/v) or by mass (m/m)."};
    }
  }
  const row = rows.find(rule => rule.form === "dry" && rule.solvent === input.solvent &&
    span[0] >= rule.minDer && span[1] <= rule.maxDer &&
    (!rule.basis || (input.basis === rule.basis && concentration >= rule.minPercent && concentration <= rule.maxPercent)));
  if (row) return {status:row.tier, row};
  return {status:"unmatched", reason:"The supplied details do not fit a preparation covered by this prototype. Check the linked monograph or ask a pharmacist."};
}
