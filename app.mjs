import { assess, examples, source } from "./evidence.mjs";

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
}

createPanel("A", "tea");
createPanel("B", "extract");
