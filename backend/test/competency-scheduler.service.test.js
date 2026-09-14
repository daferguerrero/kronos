import assert from "node:assert/strict";
import { describe, it } from "node:test";

import competencySchedulerService from "../src/services/competency-scheduler.service.js";

describe("competency-scheduler", () => {
  it("programa una competencia completa", () => {
    const competency = {
      competencyCode: "220501092",

      learningActivities: [
        {
          learningActivityCode: "GA1-220501092-AA1",
          estimatedWeeks: 1,
        },

        {
          learningActivityCode: "GA1-220501092-AA2",
          estimatedWeeks: 2,
        },
      ],
    };

    const result = competencySchedulerService.schedule(
      competency,
      new Date(2026, 1, 2),
    );

    assert.equal(result.learningActivities.length, 2);
  });

  it("calcula el inicio y fin de la competencia", () => {
    const competency = {
      competencyCode: "220501092",

      learningActivities: [
        {
          learningActivityCode: "GA1-220501092-AA1",
          estimatedWeeks: 1,
        },

        {
          learningActivityCode: "GA1-220501092-AA2",
          estimatedWeeks: 2,
        },
      ],
    };

    const result = competencySchedulerService.schedule(
      competency,
      new Date(2026, 1, 2),
    );

    assert.ok(result.startDate);
    assert.ok(result.endDate);
  });

  it("calcula métricas de la competencia programada", () => {
    const competency = {
      competencyCode: "220501092",

      learningActivities: [
        {
          learningActivityCode: "GA1-220501092-AA1",

          estimatedWeeks: 1,
        },

        {
          learningActivityCode: "GA1-220501092-AA2",

          estimatedWeeks: 2,
        },
      ],
    };

    const result = competencySchedulerService.schedule(
      competency,
      new Date(2026, 1, 2),
    );

    assert.equal(result.totalLearningActivities, 2);
    assert.equal(result.totalWeeks, 3);
  });
})