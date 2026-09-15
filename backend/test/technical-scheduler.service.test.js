import assert from "node:assert/strict";
import { it, describe } from "node:test";

import technicalSchedulerService from "../src/services/technical-scheduler.service.js"

describe ("technical-scheduler", () => {
  it("programa competencias de forma secuencial", () => {
    const competencies = [
      {
        competencyCode: "220501092",
        competencyType: "TECHNICAL",
        estimatedWeeks: 3,
      },

      {
        competencyCode: "220501093",
        competencyType: "TECHNICAL",
        estimatedWeeks: 2,
      },
    ];

    const result = technicalSchedulerService.schedule(
      competencies,
      new Date(2026, 1, 2),
    );

    assert.equal(result.length, 2);
    assert.equal(result[0].competencyCode, "220501092");
    assert.equal(result[1].competencyCode, "220501093");
    assert.equal(result[0].competencyType, "TECHNICAL");
  });

  it("encadena las competencias sin solapamientos", () => {
    const competencies = [
      {
        competencyCode: "220501092",
        competencyType: "TECHNICAL",
        estimatedWeeks: 3,
      },

      {
        competencyCode: "220501093",
        competencyType: "TECHNICAL",
        estimatedWeeks: 2,
      },
    ];

    const result = technicalSchedulerService.schedule(
      competencies,
      new Date(2026, 1, 2),
    );

    const firstEnd = result[0].endDate;

    const secondStart = result[1].startDate;

    const expectedStart = new Date(firstEnd);

    expectedStart.setDate(expectedStart.getDate() + 1);

    assert.equal(
      secondStart.toISOString().substring(0, 10),
      expectedStart.toISOString().substring(0, 10),
    );
  });

  it("respeta el receso institucional al programar competencias", () => {
    const competencies = [
      {
        competencyCode: "220501092",
        competencyType: "TECHNICAL",
        estimatedWeeks: 4,
      },
    ];

    const result = technicalSchedulerService.schedule(
      competencies,
      new Date(2026, 11, 10),
    );

    assert.equal(result[0].endDate.getFullYear(), 2027);
    assert.equal(result[0].endDate.getMonth(), 1);
  });

  it("calcula la duración total en días", () => {
    const competencies = [
      {
        competencyCode: "220501092",
        competencyType: "TECHNICAL",
        estimatedWeeks: 3,
      },
    ];

    const result = technicalSchedulerService.schedule(
      competencies,
      new Date(2026, 1, 2),
    );

    assert.equal(result[0].totalDays, 21);
  });

})
