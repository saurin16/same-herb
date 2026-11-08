# Same Herb?

A label comparison prototype for EthnoHack 2026, Track 4 (Digital Health & Phytotherapy). Compare single-ingredient valerian root preparations and see which row of an EMA monograph matches the supplied preparation.

## Run and verify

From this directory, run `python3 -m http.server 8767 --bind 127.0.0.1` and open http://127.0.0.1:8767. Open the default tea and dry extract comparison. Change label B to the incomplete capsule label and inspect the requested fields. Expand either label to change solvent, percentage basis, or drug-to-extract ratio. Run `node evidence.test.mjs` to reproduce 18 scripted checks.

## Evidence and limits

The four manually transcribed preparation records come from the [EMA/HMPC/150848/2015 monograph](https://www.ema.europa.eu/en/documents/herbal-monograph/final-european-union-herbal-monograph-valeriana-officinalis-l-radix_en.pdf), pages 3–4, sections 2–3. The [EMA source index](https://www.ema.europa.eu/en/medicines/herbal/valerianae-radix) lists the adopted monograph and its revision history. Text is paraphrased. The sample labels and tests are synthetic. Test results verify the implemented rules against authored fixtures, with no external label or user study.

The application covers selected valerian root preparations and checks composition, not a product’s approval, effectiveness, clinical use, or personal suitability. It uses no server, user accounts, dose suggestions, or generative model at runtime. OpenAI Codex assisted with implementation, checks, and materials.
