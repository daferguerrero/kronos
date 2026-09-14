import assert from "node:assert/strict";
import { describe, it } from "node:test";

import learningActivitySchedulerService from "../src/services/learning-activity-scheduler.service.js";

describe("learning-activity-scheduler", () =>{
  it("programa actividades de aprendizaje secuencialmente", () => {
    const activities = [
      {
        learningActivityCode: "GA1-220501092-AA1",
        estimatedWeeks: 1,
      },

      {
        learningActivityCode: "GA1-220501092-AA2",
        estimatedWeeks: 2,
      },
    ];

    const result = learningActivitySchedulerService.schedule(
      activities,
      new Date(2026, 1, 2),
    );

    assert.equal(result.length, 2);
  });

  it("encadena actividades sin solapamientos", () => {
    const activities = [
      {
        learningActivityCode: "GA1-220501092-AA1",
        estimatedWeeks: 1,
      },

      {
        learningActivityCode: "GA1-220501092-AA2",
        estimatedWeeks: 2,
      },
    ];

    const result = learningActivitySchedulerService.schedule(
      activities,
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

  it("respeta el receso institucional", () => {
    const activities = [
      {
        learningActivityCode: "GA1-220501092-AA1",
        estimatedWeeks: 4,
      },
    ];

    const result = learningActivitySchedulerService.schedule(
      activities,
      new Date(2026, 11, 10),
    );

    assert.equal(result[0].endDate.getFullYear(), 2027);
    assert.equal(result[0].endDate.getMonth(), 1);
  });

  it("calcula la duración total en días", () => {
    const activities = [
      {
        learningActivityCode: "GA1-220501092-AA1",
        estimatedWeeks: 2,
      },
    ];

    const result = learningActivitySchedulerService.schedule(
      activities,
      new Date(2026, 1, 2),
    );

    assert.equal(result[0].totalDays, 14);
  });

  it("conserva las evidencias de la actividad programada", () => {
    const activities = [
      {
        learningActivityCode: "GA1-220501092-AA1",
        estimatedWeeks: 1,
        totalEvidences: 3,
        evidences: [
          "GA1-220501092-AA1-EV01",
          "GA1-220501092-AA1-EV02",
          "GA1-220501092-AA1-EV03",
        ],
      },
    ];

    const result = learningActivitySchedulerService.schedule(
      activities,
      new Date(2026, 1, 2),
    );

    assert.equal(result[0].totalEvidences, 3);
    assert.equal(result[0].evidences.length, 3);
  });
})
