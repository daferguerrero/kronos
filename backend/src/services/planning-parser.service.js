import ExcelJS from "exceljs";

const parse = async (filePath) => {
  const workbook = new ExcelJS.Workbook();

  await workbook.xlsx.readFile(filePath);

  const phases = workbook.worksheets
    .map((sheet) => sheet.name)
    .filter((name) => name !== "INSTRUCTIVO");

  const phaseDetails = workbook.worksheets
    .filter((sheet) => sheet.name !== "INSTRUCTIVO")
    .map((sheet) => {
      const headerRow = findHeaderRow(sheet);

      const firstDataRow = headerRow + 2;

      const headers = extractHeaders(sheet, headerRow);

      const columns = findColumnIndexes(headers);

      const records = extractRecords(sheet, firstDataRow, columns);

      const competencies = groupByCompetency(records);

      return {
        name: sheet.name,

        totalRows: sheet.rowCount,
        headerRow,
        firstDataRow,

        totalRecords: records.length,
        headers,

        totalCompetencies: competencies.length,

        competencies: competencies.slice(0, 2),
      };
    });

  return {
    sheets: workbook.worksheets.map((sheet) => sheet.name),

    totalSheets:
      workbook.worksheets.length,
      phases,

    totalPhases:
      phases.length,
      phaseDetails
  };

};

const findHeaderRow = (sheet) => {
  for (let rowNumber = 1; rowNumber <= sheet.rowCount; rowNumber++) {
    const row = sheet.getRow(rowNumber);

    const values = row.values
      .filter((value) => value)
      .join(" ")
      .toUpperCase();

    if (
      values.includes("COMPETENCIA") &&
      values.includes("RESULTADOS DE APRENDIZAJE")
    ) {
      return rowNumber;
    }
  }

  return null;
};

const findFirstDataRow = (sheet, headerRow) => {
  for (
    let rowNumber = headerRow + 1;
    rowNumber <= sheet.rowCount;
    rowNumber++
  ) {
    const row = sheet.getRow(rowNumber);

    const values = row.values.filter((value) => value);

    if (values.length > 3 && !values.join(" ").includes("COMPETENCIA")) {
      return rowNumber;
    }
  }

  return null;
};

const extractRecords = (sheet, firstDataRow, columns) => {
  const records = [];

  for (let rowNumber = firstDataRow; rowNumber <= sheet.rowCount; rowNumber++) {
    const row = sheet.getRow(rowNumber);

    const phase = getCellText(row.getCell(columns.phase));

    const projectActivity = getCellText(row.getCell(columns.projectActivity));

    const competency = getCellText(row.getCell(columns.competency));

    const learningOutcome = getCellText(row.getCell(columns.learningOutcome));

    const learningActivity = getCellText(row.getCell(columns.learningActivity));

    const directHours = getCellText(row.getCell(columns.directHours));

    const independentHours = getCellText(row.getCell(columns.independentHours));

    const evidence = getCellText(row.getCell(columns.evidence));

    if (!phase && !projectActivity && !competency) {
      continue;
    }

    records.push({
      phase,
      projectActivity,
      competency,
      learningOutcome,
      learningActivity,
      directHours,
      independentHours,
      evidence
    });
  }

  return records;
};

const getCellText = (cell) => {
  const value = cell.value;

  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number") {
    return value.toString();
  }

  if (value.text) {
    return value.text.trim();
  }

  if (value.richText) {
    return value.richText
      .map((item) => item.text)
      .join("")
      .trim();
  }

  if (value.result !== undefined) {
    return value.result.toString();
  }

  return String(value).trim();
};

const extractHeaders = (sheet, headerRow) => {
  const row = sheet.getRow(headerRow + 1);

  return row.values
    .filter((value) => value)
    .map((value) => {
      if (typeof value === "string") {
        return value.trim();
      }

      if (value?.text) {
        return value.text.trim();
      }

      return String(value).trim();
    });
};

const findColumnIndexes = (headers) => {
  return {
    phase: headers.findIndex((h) => h.includes("FASE DE PROYECTO")) + 1,

    projectActivity:
      headers.findIndex((h) => h.includes("ACTIVIDAD DE PROYECTO")) + 1,

    competency: headers.findIndex((h) => h.includes("COMPETENCIA")) + 1,

    learningOutcome:
      headers.findIndex((h) => h.includes("RESULTADOS DE APRENDIZAJE")) + 1,

    learningActivity:
      headers.findIndex((h) => h.includes("ACTIVIDADES DE APRENDIZAJE")) + 1,

    directHours:
      headers.findIndex((h) => h.includes("HORAS TRABAJO DIRECTO")) + 1,

    independentHours:
      headers.findIndex((h) => h.includes("HORAS TRABAJO INDEPENDIENTE")) + 1,

    evidence:
      headers.findIndex((h) => h.includes("DESCRIPCIÓN DE LA EVIDENCIA")) + 1,
  };
};

const parseCompetency = (competencyText) => {
  const [code, ...nameParts] = competencyText.split(" - ");

  return {
    code: code?.trim() ?? "",

    name: nameParts.join(" - ").trim(),
  };
};

const getCompetencyType = (competencyCode) =>
  competencyCode.startsWith("24") ? "TRANSVERSAL" : "TECHNICAL";

const parseLearningActivity = (learningActivityText) => {
  const [code, ...nameParts] = learningActivityText.split(" - ");

  return {
    code: code?.trim() ?? "",
    name: nameParts.join(" - ").trim(),
  };
};

const extractEvidenceCodes = (evidenceText) => {
  if (!evidenceText) {
    return [];
  }

  const matches = evidenceText.match(/GA\d+-\d+-AA\d+-EV\d+/g);

  return matches ?? [];
};

const groupByCompetency = (records) => {
  const map = new Map();

  for (const record of records) {
    const parsedCompetency = parseCompetency(record.competency);

    const key = parsedCompetency.code;

    if (!map.has(key)) {
      map.set(key, {
        competencyCode:
          parsedCompetency.code,

        competencyType:
          getCompetencyType(parsedCompetency.code),

        competencyName:
          parsedCompetency.name,

        records: [],
      });
    }

    map.get(key).records.push(record);
  }

  return Array.from(map.values()).map((competency) => {
    const learningActivities = groupByLearningActivity(competency.records);

    const totalHours = learningActivities.reduce(
      (total, activity) => total + activity.totalHours,
      0,
    );

    const totalEvidences = learningActivities.reduce(
      (total, activity) => total + activity.totalEvidences,
      0,
    );

    const estimatedWeeks = Math.ceil(totalHours / 48);

    return {
      competencyCode: competency.competencyCode,
      competencyType: competency.competencyType,
      competencyName: competency.competencyName,

      totalLearningActivities:
        learningActivities.length,
        totalHours,
        estimatedWeeks,
        totalEvidences,
        learningActivities,
    };
  });
};

const groupByLearningActivity = (records) => {
  const map = new Map();

  for (const record of records) {
    const key = record.learningActivity;

    if (!map.has(key)) {
      map.set(key, {
        learningActivity: key,
        records: [],
      });
    }

    map.get(key).records.push(record);
  }

  return Array.from(map.values()).map((activity) => {
    const firstRecord = activity.records[0];

    const evidences = extractEvidenceCodes(firstRecord.evidence);

    const parsedLearningActivity = parseLearningActivity(
      activity.learningActivity,
    );

    const directHours = Number(firstRecord.directHours) || 0;

    const independentHours = Number(firstRecord.independentHours) || 0;

    const totalHours = directHours + independentHours;

    const estimatedWeeks = Math.ceil(totalHours / 48);

    return {
      learningActivityCode:
        parsedLearningActivity.code,

      learningActivityName:
        parsedLearningActivity.name,
        directHours,
        independentHours,
        totalHours,
        estimatedWeeks,

      totalEvidences:
        evidences.length,
        evidences,

      totalRecords: activity.records.length,

      records: activity.records.slice(0, 3),
    };
  });
};

export default {
  parse,
};