// Analiza las semanas técnicas y transversales para determinar si pueden ejecutarse concurrentemente.
const analyze = ({ technicalWeeks, transversalWeeks }) => {
  return {
    technicalWeeks,
    transversalWeeks,
    canRunConcurrently: technicalWeeks > 0 && transversalWeeks > 0,
  };
};

export default {
  analyze,
};
