export const sectorTranslation = (t, sector) => {
  const sectors = [
    { value: 'technology', label: t('company_details.sectors.technology') },
    { value: 'healthcare', label: t('company_details.sectors.healthcare') },
    { value: 'finance', label: t('company_details.sectors.finance') },
    { value: 'retail', label: t('company_details.sectors.retail') },
    {
      value: 'manufacturing',
      label: t('company_details.sectors.manufacturing'),
    },
    { value: 'energy', label: t('company_details.sectors.energy') },
    { value: 'education', label: t('company_details.sectors.education') },
    { value: 'luxury', label: t('company_details.sectors.luxury') },
    {
      value: 'beauty_personal_care',
      label: t('company_details.sectors.beauty_personal_care'),
    },
    { value: 'aerospace', label: t('company_details.sectors.aerospace') },
    { value: 'automotive', label: t('company_details.sectors.automotive') },
    {
      value: 'pharmaceuticals',
      label: t('company_details.sectors.pharmaceuticals'),
    },
    {
      value: 'telecommunications',
      label: t('company_details.sectors.telecommunications'),
    },
    {
      value: 'industrial_equipment',
      label: t('company_details.sectors.industrial_equipment'),
    },
    { value: 'software', label: t('company_details.sectors.software') },
    {
      value: 'technology_services',
      label: t('company_details.sectors.technology_services'),
    },
    {
      value: 'defense_aerospace',
      label: t('company_details.sectors.defense_aerospace'),
    },
    { value: 'other', label: t('company_details.sectors.other') },
  ];

  const matchingSector = sectors.find(s => s.value === sector);
  return matchingSector ? matchingSector.label : sector;
};

export const fundingTypeTranslation = (t, fundingType) => {
  // Handle both database values (display names) and translation keys
  const fundingTypes = [
    // Database display names to translation keys mapping
    { value: 'Seed', label: t('funding_types.Seed') },
    { value: 'Series A', label: t('funding_types.Series A') },
    { value: 'Series B', label: t('funding_types.Series B') },
    { value: 'Series C', label: t('funding_types.Series C') },
    { value: 'Growth', label: t('funding_types.Growth') },
    { value: 'Private Equity', label: t('funding_types.Private Equity') },
    { value: 'Venture Capital', label: t('funding_types.Venture Capital') },
    { value: 'Corporate Venture', label: t('funding_types.Corporate Venture') },
    {
      value: 'Strategic Investment',
      label: t('funding_types.Strategic Investment'),
    },
    { value: 'Bridge Funding', label: t('funding_types.Bridge Funding') },
    // Legacy camelCase keys for backward compatibility
    { value: 'seed', label: t('funding.types.seed') },
    { value: 'serieA', label: t('funding.types.serieA') },
    { value: 'serieB', label: t('funding.types.serieB') },
    { value: 'serieC', label: t('funding.types.serieC') },
    { value: 'growth', label: t('funding.types.growth') },
    { value: 'ipo', label: t('funding.types.ipo') },
    { value: 'debt', label: t('funding.types.debt') },
    { value: 'grant', label: t('funding.types.grant') },
    { value: 'other', label: t('funding.types.other') },
  ];

  const cleanedFundingType = fundingType?.trim();
  const matchingFundingType = fundingTypes.find(
    f => f.value === cleanedFundingType,
  );
  return matchingFundingType ? matchingFundingType.label : cleanedFundingType;
};

export const monthTranslation = (t, month) => {
  const months = [
    { value: 'January', label: t('months.january') },
    { value: 'February', label: t('months.february') },
    { value: 'March', label: t('months.march') },
    { value: 'April', label: t('months.april') },
    { value: 'May', label: t('months.may') },
    { value: 'June', label: t('months.june') },
    { value: 'July', label: t('months.july') },
    { value: 'August', label: t('months.august') },
    { value: 'September', label: t('months.september') },
    { value: 'October', label: t('months.october') },
    { value: 'November', label: t('months.november') },
    { value: 'December', label: t('months.december') },
  ];

  const cleanedMonth = month.trim();
  const matchingMonth = months.find(s => s.value === cleanedMonth);
  return matchingMonth ? matchingMonth.label : cleanedMonth;
};
