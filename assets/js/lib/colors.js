export const getFundingTypeColor = type => {
  switch (type) {
    case 'seed':
      return 'green';
    case 'serieA':
      return 'blue';
    case 'serieB':
      return 'purple';
    case 'serieC':
      return 'magenta';
    case 'growth':
      return 'cyan';
    case 'ipo':
      return 'gold';
    case 'debt':
      return 'orange';
    case 'grant':
      return 'lime';
    default:
      return 'default';
  }
};

export const getSectorTypeColor = type => {
  switch (type) {
    case 'technology':
      return 'geekblue';
    case 'healthcare':
      return 'volcano';
    case 'finance':
      return 'gold';
    case 'retail':
      return 'magenta';
    case 'manufacturing':
      return 'purple';
    case 'energy':
      return 'lime';
    case 'education':
      return 'cyan';
    default:
      return '#0958d9';
  }
};

export const SECTOR_TYPE_CHART_COLORS = type => {
  switch (type) {
    case 'Technologie':
      return '#1d39c4';
    case 'Santé':
      return '#d4380d';
    case 'Finance':
      return '#d48806';
    case 'retail':
      return '#c41d7f';
    case 'Industrie':
      return '#531dab';
    case 'Énergie':
      return '#7cb305';
    case 'Éducation':
      return '#08979c';
    default:
      return '#0958d9';
  }
};

export const DONUT_CHART_COLORS = [
  '#389e0d', // seed - Vert
  '#0958d9', // serieA - Bleu
  '#531dab', // serieB - Violet
  '#c41d7f', // serieC - Rouge
  '#08979c', // growth - Orange
  '#d48806', // ipo - Or
];

export const PIE_CHART_COLORS = type => {
  switch (type) {
    case 'Amorçage (Seed)':
      return '#389e0d';
    case 'Série A':
      return '#0958d9';
    case 'Série B':
      return '#531dab';
    case 'Série C':
      return '#c41d7f';
    case 'Croissance (Growth)':
      return '#08979c';
    case 'Introduction en bourse (IPO)':
      return '#d48806';
    default:
      return '#0958d9';
  }
};

export const BAR_CHART_COLORS = type => {
  switch (type) {
    case 'Amorçage (Seed)':
      return '#389e0d';
    case 'Série A':
      return '#0958d9';
    case 'Série B':
      return '#531dab';
    case 'Série C':
      return '#c41d7f';
    case 'Croissance (Growth)':
      return '#08979c';
    case 'Introduction en bourse (IPO)':
      return '#d48806';
    default:
      return '#0958d9';
  }
};
