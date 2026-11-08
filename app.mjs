import { assess, examples, source } from "./evidence.mjs";
import { parseLabel, readLabel } from "./label-reader.mjs";

const headings = {
  traditional:"Traditional use",
  established:"Well-established use",
  incomplete:"Insufficient label details",
  unmatched:"No match in this prototype",
  outside:"Outside the prototype scope",
};
const template = document.querySelector("#panel");
const panels = document.querySelector("#panels");

function createPanel(side, initial) {
  const panel = template.content.firstElementChild.cloneNode(true);
  panel.dataset.side = side;
  panel.querySelector(".panel-label").textContent = "LABEL " + side;
  const name = panel.querySelector(".product");
  const preset = panel.querySelector("[name=preset]");
  preset.setAttribute("aria-label", "Example for label " + side);
  const form = panel.querySelector("form");
  const result = panel.querySelector(".result");
  const link = panel.querySelector(".source");

  function render() {
    const outcome = assess(Object.fromEntries(new FormData(form)));
    result.dataset.status = outcome.status;
    result.querySelector(".result-status").textContent = headings[outcome.status];
    result.querySelector("h4").textContent = outcome.row?.title ?? "Evidence match withheld";
    result.querySelector(".result-copy").textContent = outcome.row?.detail ?? outcome.reason;
    link.href = outcome.row?.url ?? source.index;
    link.textContent = outcome.row ? "View EMA source · " + outcome.row.reference + " ↗" : "View EMA source index ↗";
  }
  function load(key) {
    if (key === "custom") {
      panel.querySelector("details").open = true;
      name.textContent = "Custom label";
      return;
    }
    const example = examples[key];
    for (const [field, value] of Object.entries(example)) {
      if (field !== "name") form.elements.namedItem(field).value = value;
    }
    name.textContent = example.name;
    render();
  }
  form.addEventListener("submit", event => event.preventDefault());
  form.addEventListener("input", () => {
    preset.value = "custom";
    name.textContent = "Custom label";
    render();
  });
  preset.addEventListener("change", () => load(preset.value));
  preset.value = initial;
  load(initial);
  panels.append(panel);
  return {
    apply(fields) {
      for (const [field, value] of Object.entries(fields)) form.elements.namedItem(field).value = value;
      preset.value = "custom";
      load("custom");
      render();
      panel.scrollIntoView({block:"nearest"});
      name.setAttribute("tabindex", "-1");
      name.focus({preventScroll:true});
    },
  };
}

createPanel("A", "tea");
const labelB = createPanel("B", "extract");
const photo = document.querySelector("#label-photo");
const sample = document.querySelector("#scan-sample");
const status = document.querySelector("#scan-status");
const review = document.querySelector("#scan-review");
const detected = document.querySelector("#detected-text");
const preview = document.querySelector("#photo-preview");
let previewUrl;

async function scan(loadImage) {
  photo.disabled = sample.disabled = true;
  review.hidden = true;
  detected.value = "";
  status.textContent = "Loading the text reader…";
  try {
    const image = await loadImage();
    const text = await readLabel(image, percent => {
      status.textContent = "Reading label · " + percent + "%";
    });
    if (!text) throw new Error("No text found.");
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = URL.createObjectURL(image);
    preview.src = previewUrl;
    detected.value = text;
    review.hidden = false;
    status.textContent = "Text detected. Check it before using it.";
    detected.focus();
  } catch {
    status.textContent = "This photo could not be read. Try a clearer JPEG or PNG, or enter the label details below.";
  } finally {
    photo.value = "";
    photo.disabled = sample.disabled = false;
  }
}

photo.addEventListener("change", () => {
  const file = photo.files[0];
  if (!file) return;
  if (file.size > 12 * 1024 * 1024) {
    photo.value = "";
    review.hidden = true;
    status.textContent = "Choose an image under 12 MB.";
    return;
  }
  void scan(() => file);
});
sample.addEventListener("click", () => scan(async () => {
  const response = await fetch("./sample-label.png");
  if (!response.ok) throw new Error("Sample unavailable.");
  return response.blob();
}));
document.querySelector("#apply-scan").addEventListener("click", () => {
  labelB.apply(parseLabel(detected.value));
});
