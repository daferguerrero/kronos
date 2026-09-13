class ScheduleConfig {
  constructor({
    ficha,
    startProgramDate,
    startTrainingDate,
    endProgramDate,
    weekStartDay,
  }) {
    this.ficha = ficha;

    this.startProgramDate = startProgramDate;

    this.startTrainingDate = startTrainingDate;

    this.endProgramDate = endProgramDate;

    this.weekStartDay = weekStartDay;
  }
}

export default ScheduleConfig;
