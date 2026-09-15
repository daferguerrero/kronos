import assert from "node:assert/strict";
import { describe, it } from "node:test";

import concurrencyValidatorService from "../src/services/concurrency-validator.service.js";

describe("concurrency-validator", () => {
  it("detecta concurrencia entre competencias técnicas y transversales", () => {
    const result = concurrencyValidatorService.analyze({
      technicalWeeks: 12,
      transversalWeeks: 4,
    });

    assert.equal(result.canRunConcurrently, true);
  });

  it("detecta cuando no existe concurrencia", () => {
    const result = concurrencyValidatorService.analyze({
      technicalWeeks: 12,
      transversalWeeks: 0,
    });

    assert.equal(result.canRunConcurrently, false);
  });
})