import assert from "node:assert/strict";
import { assess, examples } from "./evidence.mjs";
const ext = examples.extract;
const cases = [
  ["tea", examples.tea, "traditional"],
  ["verified dry extract", ext, "established"],
  ["vague extract", examples.vague, "incomplete"],
  ["same percent by mass", {...ext,basis:"mm"}, "unmatched"],
  ["85 percent by mass", {...ext,der:"6:1",concentration:"85",basis:"mm"}, "traditional"],
  ["85 percent by volume", {...ext,der:"6:1",concentration:"85"}, "unmatched"],
  ["water range", {...ext,solvent:"water",der:"4–6:1"}, "traditional"],
  ["water outside range", {...ext,solvent:"water",der:"3:1"}, "unmatched"],
  ["upper inclusive bounds", {...ext,der:"7.4:1",concentration:"70"}, "established"],
  ["lower inclusive bounds", {...ext,der:"3:1",concentration:"40"}, "established"],
  ["range extends beyond evidence", {...ext,der:"3-8:1"}, "unmatched"],
  ["wrong denominator", {...ext,der:"5:2"}, "incomplete"],
  ["reversed range", {...ext,der:"6-4:1"}, "incomplete"],
  ["unknown ethanol basis", {...ext,basis:""}, "incomplete"],
  ["unknown plant part", {...ext,part:""}, "incomplete"],
  ["unsupported plant part", {...ext,part:"leaf"}, "outside"],
  ["unsupported herb", {...ext,botanical:"other"}, "outside"],
  ["empty label", {}, "incomplete"],
];
for (const [name,input,expected] of cases) {
  const result = assess(input);
  assert.equal(result.status,expected,name);
  if (["traditional","established"].includes(expected)) assert.match(result.row.url,/^https:\/\/www\.ema\.europa\.eu\//,name);
}
console.log("Passed " + cases.length + " scripted source, boundary, missing-data, and scope checks.");
