import academicDateService from "./academic-date.service.js";

const calculateRange = (startDate, estimatedWeeks) => {
  const academicDays = estimatedWeeks * 7;

  const endDate = academicDateService.addAcademicDays(startDate, academicDays);

  return {
    startDate: new Date(startDate),

    endDate,
  };
};

export default {
  calculateRange,
};
