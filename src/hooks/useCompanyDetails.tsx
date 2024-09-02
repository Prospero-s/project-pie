import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { openNotificationWithIcon } from '@/components/Notification/NotifAlert';
import { SearchCompany } from '@/types/search-company';

const isEmptyObject = (obj: any): boolean => {
  return (
    obj &&
    typeof obj === 'object' &&
    !Array.isArray(obj) &&
    Object.keys(obj).length === 0
  );
};

const getValue = (field: any, fallback: any) => {
  return isEmptyObject(field) ? fallback : field;
};

const validateSiren = (siren: string): boolean => {
  const sirenPattern = /^[0-9]{1,9}$/;
  return sirenPattern.test(siren);
};

const useCompanyDetails = (siren: string) => {
  const [company, setCompany] = useState<SearchCompany | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [percent, setPercent] = useState<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const hasFetchedRef = useRef<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      if (!validateSiren(siren)) {
        openNotificationWithIcon(
          'error',
          'Erreur de validation',
          `Le SIREN "${siren}" est incorrect. Le SIREN doit contenir uniquement des chiffres et ne doit pas dépasser 9 caractères.`,
        );
        router.back();
        return;
      }

      if (siren) {
        setCompany(null);
        setLoading(true);
        setPercent(0);

        timerRef.current = setInterval(() => {
          setPercent(prev => (prev < 90 ? prev + 10 : prev));
        }, 100);

        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/company/${siren}/details`,
          );

          if (response.status === 404) {
            throw new Error('SIREN invalide');
          }

          const data = await response.json();

          if (
            typeof data === 'string' &&
            data.includes('Erreur lors de la récupération des données')
          ) {
            throw new Error(data);
          }

          const montantCapital = getValue(
            data.montantCapital,
            data.capitalMinimum,
          );

          const formattedCompany = {
            updatedAt: getValue(data.updatedAt, ''),
            denomination: getValue(data.denomination, ''),
            nombreBeneficiairesEffectifsActifs: getValue(
              data.nombreBeneficiairesEffectifsActifs,
              0,
            ),
            societeEtrangere: getValue(data.societeEtrangere, false),
            etablieEnFrance: getValue(data.etablieEnFrance, false),
            formeJuridique: getValue(data.formeJuridique, ''),
            formeExerciceActivitePrincipale: getValue(
              data.formeExerciceActivitePrincipale,
              '',
            ),
            beneficiairesEffectifs: Array.isArray(data.beneficiairesEffectifs)
              ? data.beneficiairesEffectifs.map(
                  (benef: {
                    beneficiaire: {
                      descriptionPersonne: {
                        dateDeNaissance: string;
                        nom: string;
                        prenoms: string[];
                        nationalite: string;
                      };
                    };
                  }) => ({
                    dateDeNaissance: getValue(
                      benef.beneficiaire.descriptionPersonne.dateDeNaissance,
                      '',
                    ),
                    nom: getValue(
                      benef.beneficiaire.descriptionPersonne.nom,
                      '',
                    ),
                    prenoms: getValue(
                      benef.beneficiaire.descriptionPersonne.prenoms,
                      [],
                    ),
                    nationalite: getValue(
                      benef.beneficiaire.descriptionPersonne.nationalite,
                      '',
                    ),
                  }),
                )
              : [],
            siret: getValue(data.siret, ''),
            adresse: {
              pays: getValue(data.adresse?.pays, ''),
              codePostal: getValue(data.adresse?.codePostal, ''),
              commune: getValue(data.adresse?.commune, ''),
              typeVoie: getValue(data.adresse?.typeVoie, ''),
              voie: getValue(data.adresse?.voie, ''),
              numVoie: getValue(data.adresse?.numVoie, ''),
            },
            activites: Array.isArray(data.activites)
              ? data.activites.map(
                  (act: {
                    dateDebut: string;
                    formeExercice: string;
                    descriptionDetaillee: string;
                    codeApe: string;
                  }) => ({
                    dateDebut: getValue(act.dateDebut, ''),
                    formeExercice: getValue(act.formeExercice, ''),
                    descriptionDetaillee: getValue(
                      act.descriptionDetaillee,
                      '',
                    ),
                    codeApe: getValue(act.codeApe, ''),
                  }),
                )
              : [],
            montantCapital: getValue(montantCapital, ''),
            deviseCapital: getValue(data.deviseCapital, ''),
          };

          clearInterval(timerRef.current);
          setPercent(100);

          setTimeout(() => {
            setCompany(formattedCompany);
            setLoading(false);
          }, 100);
        } catch (error: unknown) {
          clearInterval(timerRef.current);
          setPercent(100);
          setTimeout(() => {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Une erreur inconnue s'est produite";
            openNotificationWithIcon(
              'error',
              'Erreur de récupération',
              errorMessage === 'SIREN invalide'
                ? `Le SIREN "${siren}" est invalide.`
                : "Une erreur s'est produite lors de la récupération des données.",
            );
            setLoading(false);
            router.back();
          }, 100);
        }
      }
    };

    if (hasFetchedRef.current !== siren) {
      fetchCompanyDetails();
      hasFetchedRef.current = siren;
    }
  }, [siren, router]);

  return { company, loading, percent };
};

export default useCompanyDetails;
