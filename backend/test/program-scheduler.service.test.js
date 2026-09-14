import assert from "node:assert/strict";
import { describe, it } from "node:test";

import programSchedulerService from "../src/services/program-scheduler.service.js";

describe("program-scheduler", () => {
  it("programa múltiples competencias secuencialmente", () => {
    const competencies = [
      {
        competencyCode: "220501092",

        learningActivities: [
          {
            learningActivityCode: "GA1-220501092-AA1",
            estimatedWeeks: 1,
          },
        ],
      },

      {
        competencyCode: "220501093",

        learningActivities: [
          {
            learningActivityCode: "GA1-220501093-AA1",
            estimatedWeeks: 2,
          },
        ],
      },
    ];

    const result = programSchedulerService.schedule(
      competencies,
      new Date(2026, 1, 2),
    );

    assert.equal(result.competencies.length, 2);
  });

  it("encadena competencias completas sin solapamientos", () => {
    const competencies = [
      {
        competencyCode: "220501092",
        learningActivities: [
          {
            learningActivityCode: "GA1-220501092-AA1",
            estimatedWeeks: 3,
          },
        ],
      },

      {
        competencyCode: "220501093",
        learningActivities: [
          {
            learningActivityCode: "GA1-220501093-AA1",
            estimatedWeeks: 2,
          },
        ],
      },
    ];

    const result = programSchedulerService.schedule(
      competencies,
      new Date(2026, 1, 2),
    );

    const firstEnd = result.competencies[0].endDate;
    const secondStart = result.competencies[1].startDate;
    const expectedStart = new Date(firstEnd);

    expectedStart.setDate(expectedStart.getDate() + 1);

    assert.equal(
      secondStart.toISOString().substring(0, 10),
      expectedStart.toISOString().substring(0, 10),
    );
  });

  it("conserva las métricas de cada competencia programada", () => {
    const competencies = [
      {
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
      },
    ];

    const result = programSchedulerService.schedule(
      competencies,
      new Date(2026, 1, 2),
    );

    result.competencies[0].totalLearningActivities;
    result.competencies[0].totalWeeks;
  });

  it("calcula métricas generales del programa", () => {
    const competencies = [
      {
        competencyCode: "220501092",
        learningActivities: [
          {
            learningActivityCode: "GA1-220501092-AA1",
            estimatedWeeks: 1,
          },
        ],
      },

      {
        competencyCode: "220501093",
        learningActivities: [
          {
            learningActivityCode: "GA1-220501093-AA1",
            estimatedWeeks: 2,
          },
        ],
      },
    ];

    const result = programSchedulerService.schedule(
      competencies,
      new Date(2026, 1, 2),
    );

    assert.equal(result.totalCompetencies, 2);
    assert.equal(result.totalLearningActivities, 2);
    assert.equal(result.totalWeeks, 3);
  });

  it("calcula métricas globales del cronograma", () => {
    const competencies = [
      {
        competencyCode: "220501092",
        totalEvidences: 3,

        learningActivities: [
          {
            learningActivityCode: "GA1-220501092-AA1",
            estimatedWeeks: 1,
          },
        ],
      },

      {
        competencyCode: "220501093",
        totalEvidences: 2,
        learningActivities: [
          {
            learningActivityCode: "GA1-220501093-AA1",
            estimatedWeeks: 2,
          },
        ],
      },
    ];

    const result = programSchedulerService.schedule(
      competencies,
      new Date(2026, 1, 2),
    );

    assert.equal(result.totalCompetencies, 2);
    assert.equal(result.totalLearningActivities, 2);
    assert.equal(result.totalWeeks, 3);
    assert.equal(result.totalDays, 21);
    assert.equal(result.totalEvidences, 5);
  });
});