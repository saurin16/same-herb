const VERSION = "7.0.0";
const CDN = "https://cdn.jsdelivr.net/npm";
let library;

function getLibrary() {
  if (globalThis.Tesseract) return Promise.resolve(globalThis.Tesseract);
  library ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = CDN + "/tesseract.js@" + VERSION + "/dist/tesseract.min.js";
    script.onload = () => resolve(globalThis.Tesseract);
    script.onerror = () => {
      script.remove();
      library = undefined;
      reject(new Error("The label reader could not load."));
    };
    document.head.append(script);
  });
  return library;
}

export function parseLabel(text) {
  const normalized = text.toLowerCase().normalize("NFKC");
  const ratio = normalized.match(/\b(?:der|drug.to.extract ratio)\s*[:=]?\s*(\d+(?:\.\d+)?(?:\s*[-–]\s*\d+(?:\.\d+)?)?\s*:\s*1)\b/u);
  const ethanol = normalized.match(/\bethanol\s*(\d+(?:\.\d+)?)\s*%\s*(?:\(?\s*(v\s*\/\s*v|m\s*\/\s*m)\s*\)?)?/u);
  const botanical = /\bvaleriana officinalis\b|\bvalerian root\b/u.test(normalized) ? "valerian" : "";
  const part = /\b(?:root|radix)\b/u.test(normalized) ? "root" : "";
  const form = /\bdry extract\b/u.test(normalized) ? "dry" : /\b(?:cut|comminuted)\b/u.test(normalized) && /\btea\b/u.test(normalized) ? "tea" : "";
  const solvent = /\bethanol\b/u.test(normalized) ? "ethanol" : /(?:extraction solvent|solvent)\s*:\s*water\b/u.test(normalized) ? "water" : "";
  return {
    botanical, part, form, solvent,
    concentration: ethanol?.[1] ?? "",
    basis: ethanol?.[2]?.replace(/\s|\//g,"") ?? "",
    der: ratio?.[1]?.replace(/\s/g,"") ?? "",
  };
}

export async function readLabel(image, onProgress) {
  const {createWorker} = await getLibrary();
  const worker = await createWorker("eng", 1, {
    workerPath: CDN + "/tesseract.js@" + VERSION + "/dist/worker.min.js",
    corePath: CDN + "/tesseract.js-core@" + VERSION,
    logger: ({status,progress}) => {
      if (status === "recognizing text") onProgress(Math.round(progress * 100));
    },
  });
  try {
    const bitmap = await createImageBitmap(image);
    const size = Math.min(1, 1800 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * size));
    canvas.height = Math.max(1, Math.round(bitmap.height * size));
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const {data} = await worker.recognize(canvas);
    return data.text.trim();
  } finally {
    await worker.terminate();
  }
}
