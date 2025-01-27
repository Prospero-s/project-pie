<?php

namespace App\Repository;

use App\Entity\Company;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\ORM\EntityManagerInterface;
use App\Entity\Representative;
use App\Entity\CompanyAddress;
use App\Entity\CompanyInvestment;
use App\Service\User\UserService;
use Doctrine\Common\Collections\ArrayCollection;

class CompanyRepository extends ServiceEntityRepository
{
    public function __construct(
        ManagerRegistry $registry, 
        EntityManagerInterface $em,
        private UserService $userService
    ) {
        parent::__construct($registry, Company::class);
        $this->em = $em;
    }

    public function saveCompany(string $cognitoId, string $email, array $data): array
    {
        try {
            // Récupérer l'utilisateur qui crée l'investissement
            $creatingUser = $this->userService->getOrCreateUser($cognitoId, $email);

            // Récupérer l'utilisateur à qui attribuer l'investissement
            $investorUser = isset($data['investorId']) && $data['investorId']
                ? $this->em->getRepository(User::class)->find($data['investorId'])
                : $creatingUser;

            if (!$investorUser) {
                throw new \Exception('Investisseur non trouvé');
            }

            // Vérifier que les utilisateurs sont dans le même groupe
            if ($creatingUser->getUserGroup() !== $investorUser->getUserGroup()) {
                throw new \Exception('L\'investisseur doit être dans le même groupe');
            }

            // Recherche ou création de l'entreprise
            $company = $this->em->getRepository(Company::class)->findOneBy(['siren' => $data['siren']]);
            
            if (!$company) {
                $company = new Company();
                $company->setSiren($data['siren']);
                $company->setDenomination($data['denomination']);
                $company->setBusinessStructures($data['businessStructures'] ?? null);
                $company->setCodeApe($data['codeApe'] ?? null);
                $company->setSiret($data['siret'] ?? null);
                $company->setUpdatedAt($data['updatedAt'] ?? new \DateTime("9999-12-31 23:59:59"));
                $company->setCreatedAt(new \DateTime());
                $company->setDeletedAt(new \DateTime("9999-12-31 23:59:59"));
                $company->setSector($data['sector'] ?? null);

                //Création des représentants
                foreach ($data['representants'] as $representant) {
                    $representantEntity = new Representative();
                    $representantEntity->setCompany($company);
                    $representantEntity->setNom($representant['nom']);
                    $representantEntity->setQualite($representant['qualite'] ?? null);
                    $this->em->persist($representantEntity);
                }

                // Création de l'adresse
                if (!empty($data['adresse'])) {
                    $address = new CompanyAddress();
                    $address->setCompany($company);
                    $address->setStreetNumber($data['adresse']['streetNumber'] ?? null);
                    $address->setStreetTypes($data['adresse']['streetTypes'] ?? null);
                    $address->setVoie($data['adresse']['voie'] ?? null);
                    $address->setCodePostal($data['adresse']['codePostal'] ?? null);
                    $address->setCommune($data['adresse']['commune'] ?? null);
                    $address->setPays($data['adresse']['pays'] ?? 'FRANCE');
                    
                    $this->em->persist($address);
                }

                $this->em->persist($company);
            }

            // Modification de la création de l'investissement
            $investment = new CompanyInvestment();
            $investment->setCompany($company);
            $investment->setUser($investorUser);
            $investment->setFundingType($data['fundingType']);
            $investment->setAmount($data['amountRaised']);
            $investment->setCurrency($data['currency'] ?? 'EUR');

            $this->em->persist($investment);
            $this->em->flush();

            return [
                'id' => $company->getId(),
                'siren' => $company->getSiren(),
                'denomination' => $company->getDenomination(),
                'investment' => [
                    'id' => $investment->getId(),
                    'amount' => $investment->getAmount(),
                    'investor' => [
                        'id' => $investorUser->getId(),
                        'email' => $investorUser->getEmail()
                    ]
                ]
            ];
        } catch (\Exception $e) {
            throw $e;
        }
    }

    public function findByFiltersWithPagination(array $filters, string $cognitoId, int $page = 1, int $limit = 10, string $sortField = 'updatedAt', string $sortOrder = 'desc'): array
    {
        $qb = $this->createQueryBuilder('c')
            ->select(
                'c as company',
                '(SELECT SUM(inv_sum.amount) 
                  FROM App\Entity\CompanyInvestment inv_sum 
                  JOIN inv_sum.user usr_sum 
                  JOIN usr_sum.userGroup grp_sum 
                  WHERE inv_sum.company = c.id 
                  AND grp_sum.id = (
                      SELECT g_sum.id 
                      FROM App\Entity\User u_sum 
                      JOIN u_sum.userGroup g_sum 
                      WHERE u_sum.cognitoId = :cognitoId
                  )
                ) as group_total_amount',
                '(SELECT inv_last.fundingType 
                  FROM App\Entity\CompanyInvestment inv_last 
                  JOIN inv_last.user usr_last 
                  JOIN usr_last.userGroup grp_last 
                  WHERE inv_last.company = c.id 
                  AND grp_last.id = (
                      SELECT g_last.id 
                      FROM App\Entity\User u_last 
                      JOIN u_last.userGroup g_last 
                      WHERE u_last.cognitoId = :cognitoId
                  )
                  AND inv_last.investedAt = (
                      SELECT MAX(inv_max.investedAt)
                      FROM App\Entity\CompanyInvestment inv_max
                      JOIN inv_max.user usr_max
                      JOIN usr_max.userGroup grp_max
                      WHERE inv_max.company = c.id
                      AND grp_max.id = grp_last.id
                  )
                ) as last_funding_type'
            )
            ->leftJoin('c.investments', 'i_main')
            ->leftJoin('i_main.user', 'main_user')
            ->leftJoin('main_user.userGroup', 'main_group')
            ->where('c.deletedAt > :now')
            ->andWhere('main_user IN (
                SELECT DISTINCT u_filter
                FROM App\Entity\User u_filter
                LEFT JOIN u_filter.userGroup g_filter
                WHERE u_filter.cognitoId = :cognitoId
                OR g_filter.id IN (
                    SELECT g_sub.id
                    FROM App\Entity\UserGroup g_sub
                    JOIN g_sub.users u_sub
                    WHERE u_sub.cognitoId = :cognitoId
                )
            )')
            ->setParameter('now', new \DateTime())
            ->setParameter('cognitoId', $cognitoId)
            ->groupBy('c.id');

        // Application des filtres multiples
        if (!empty($filters['sector'])) {
            if (is_array($filters['sector'])) {
                $qb->andWhere('c.sector IN (:sectors)')
                   ->setParameter('sectors', $filters['sector']);
            } else {
                $qb->andWhere('c.sector = :sector')
                   ->setParameter('sector', $filters['sector']);
            }
        }

        if (!empty($filters['fundingType'])) {
            if (is_array($filters['fundingType'])) {
                $fundingTypeConditions = [];
                foreach ($filters['fundingType'] as $key => $type) {
                    $paramName = 'fundingType_' . $key;
                    $fundingTypeConditions[] = "(SELECT inv_ft{$key}.fundingType 
                        FROM App\Entity\CompanyInvestment inv_ft{$key} 
                        JOIN inv_ft{$key}.user usr_ft{$key} 
                        JOIN usr_ft{$key}.userGroup grp_ft{$key} 
                        WHERE inv_ft{$key}.company = c.id 
                        AND grp_ft{$key}.id = (
                            SELECT g_ft{$key}.id 
                            FROM App\Entity\User u_ft{$key} 
                            JOIN u_ft{$key}.userGroup g_ft{$key} 
                            WHERE u_ft{$key}.cognitoId = :cognitoId
                        )
                        AND inv_ft{$key}.investedAt = (
                            SELECT MAX(inv_ftmax{$key}.investedAt)
                            FROM App\Entity\CompanyInvestment inv_ftmax{$key}
                            JOIN inv_ftmax{$key}.user usr_ftmax{$key}
                            JOIN usr_ftmax{$key}.userGroup grp_ftmax{$key}
                            WHERE inv_ftmax{$key}.company = c.id
                            AND grp_ftmax{$key}.id = grp_ft{$key}.id
                        )
                    ) = :{$paramName}";
                    $qb->setParameter($paramName, $type);
                }
                $qb->andWhere('(' . implode(' OR ', $fundingTypeConditions) . ')');
            } else {
                $qb->andWhere('(SELECT inv_single.fundingType 
                    FROM App\Entity\CompanyInvestment inv_single 
                    JOIN inv_single.user usr_single 
                    JOIN usr_single.userGroup grp_single 
                    WHERE inv_single.company = c.id 
                    AND grp_single.id = (
                        SELECT g_single.id 
                        FROM App\Entity\User u_single 
                        JOIN u_single.userGroup g_single 
                        WHERE u_single.cognitoId = :cognitoId
                    )
                    AND inv_single.investedAt = (
                        SELECT MAX(inv_smax.investedAt)
                        FROM App\Entity\CompanyInvestment inv_smax
                        JOIN inv_smax.user usr_smax
                        JOIN usr_smax.userGroup grp_smax
                        WHERE inv_smax.company = c.id
                        AND grp_smax.id = grp_single.id
                    )
                ) = :fundingType')
                ->setParameter('fundingType', $filters['fundingType']);
            }
        }

        // Gestion du tri
        switch ($sortField) {
            case 'amount':
                $qb->orderBy('group_total_amount', $sortOrder);
                break;
            case 'updatedAt':
                $qb->orderBy('c.updatedAt', $sortOrder);
                break;
            case 'denomination':
                $qb->orderBy('c.denomination', $sortOrder);
                break;
            default:
                $qb->orderBy('c.updatedAt', 'DESC');
        }

        // Calcul du total avant pagination
        $countQb = clone $qb;
        $total = count($countQb->getQuery()->getResult());

        // Pagination
        $qb->setFirstResult(($page - 1) * $limit)
           ->setMaxResults($limit);

        $results = $qb->getQuery()->getResult();

        // Formatage des données modifié
        $formattedResults = array_map(function($result) {
            return [
                'id' => $result['company']->getId(),
                'denomination' => $result['company']->getDenomination(),
                'sector' => $result['company']->getSector(),
                'updatedAt' => $result['company']->getUpdatedAt()->format('Y-m-d H:i:s'),
                'investment' => [
                    'totalAmount' => (int)$result['group_total_amount'] ?? 0,
                    'lastFundingType' => $result['last_funding_type']
                ]
            ];
        }, $results);

        return [
            'data' => $formattedResults,
            'total' => $total,
            'page' => $page,
            'limit' => $limit
        ];
    }
} 