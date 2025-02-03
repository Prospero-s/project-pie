export const sectorTranslation = (t, sector) => {
  const sectors = [
    { value: 'technology', label: t('company_details.sectors.technology') },
    { value: 'healthcare', label: t('company_details.sectors.healthcare') },
    { value: 'finance', label: t('company_details.sectors.finance') },
    { value: 'retail', label: t('company_details.sectors.retail') },
    { value: 'manufacturing', label: t('company_details.sectors.manufacturing') },
    { value: 'energy', label: t('company_details.sectors.energy') },
    { value: 'education', label: t('company_details.sectors.education') },
    { value: 'other', label: t('company_details.sectors.other') },
  ];

  const matchingSector = sectors.find((s) => s.value === sector);
  return matchingSector ? matchingSector.label : sector;
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
    { value: 'December', label: t('months.december') }
  ];

  const cleanedMonth = month.trim();
  const matchingMonth = months.find((s) => s.value === cleanedMonth);
  return matchingMonth ? matchingMonth.label : cleanedMonth;
};
