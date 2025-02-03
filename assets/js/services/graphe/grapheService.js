export const sectorTranslation = (t, sector) => {
  const sectors = [
    { value: "technology", label: t("company_details.sectors.technology") },
    { value: "healthcare", label: t("company_details.sectors.healthcare") },
    { value: "finance", label: t("company_details.sectors.finance") },
    { value: "retail", label: t("company_details.sectors.retail") },
    { value: "manufacturing", label: t("company_details.sectors.manufacturing") },
    { value: "energy", label: t("company_details.sectors.energy") },
    { value: "education", label: t("company_details.sectors.education") },
    { value: "other", label: t("company_details.sectors.other") },
  ];

  const matchingSector = sectors.find((s) => s.value === sector);
  return matchingSector ? matchingSector.label : sector;
};

export const monthTranslation = (t, month) => {
  const months = [
    { value: "01", label: t("months.january") },
    { value: "02", label: t("months.february") },
    { value: "03", label: t("months.march") },
    { value: "04", label: t("months.april") },
    { value: "05", label: t("months.may") },
    { value: "06", label: t("months.june") },
    { value: "07", label: t("months.july") },
    { value: "08", label: t("months.august") },
    { value: "09", label: t("months.september") },
    { value: "10", label: t("months.october") },
    { value: "11", label: t("months.november") },
    { value: "12", label: t("months.december") }
  ];

  const matchingMonth = months.find((s) => s.value === month);
  return matchingMonth ? matchingMonth.label : month;
}
