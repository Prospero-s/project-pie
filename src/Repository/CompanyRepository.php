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
        try {
            $qb = $this->createQueryBuilder('c')
                ->select(
                    'c as company',
                    '(SELECT COALESCE(SUM(inv_sum.amount), 0) 
                      FROM App\Entity\CompanyInvestment inv_sum 
                      JOIN inv_sum.user usr_sum 
                      JOIN usr_sum.userGroup grp_sum 
                      WHERE inv_sum.company = c.id 
                      AND grp_sum.id = (
                          SELECT DISTINCT g_sum.id 
                          FROM App\Entity\User u_sum 
                          JOIN u_sum.userGroup g_sum 
                          WHERE u_sum.cognitoId = :cognitoId
                      )
                    ) as group_total_amount',
                    '(SELECT MAX(inv_last.fundingType) 
                      FROM App\Entity\CompanyInvestment inv_last 
                      JOIN inv_last.user usr_last 
                      JOIN usr_last.userGroup grp_last 
                      WHERE inv_last.company = c.id 
                      AND grp_last.id = (
                          SELECT DISTINCT g_last.id 
                          FROM App\Entity\User u_last 
                          JOIN u_last.userGroup g_last 
                          WHERE u_last.cognitoId = :cognitoId
                      )
                    ) as last_funding_type'
                )
                ->join('c.investments', 'i_main')
                ->join('i_main.user', 'main_user')
                ->join('main_user.userGroup', 'main_group')
                ->where('main_group.id = (
                    SELECT DISTINCT g.id 
                    FROM App\Entity\User u 
                    JOIN u.userGroup g 
                    WHERE u.cognitoId = :cognitoId
                )')
                ->setParameter('cognitoId', $cognitoId)
                ->groupBy('c.id');

            // Application des filtres
            if (!empty($filters['sector'])) {
                $qb->andWhere('c.sector IN (:sectors)')
                   ->setParameter('sectors', $filters['sector']);
            }

            if (!empty($filters['fundingType'])) {
                $qb->andWhere('i_main.fundingType IN (:fundingTypes)')
                   ->setParameter('fundingTypes', $filters['fundingType']);
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

            // Debug de la requête SQL
            $query = $qb->getQuery();
            $sql = $query->getSQL();
            $params = $query->getParameters();
            
            // Log pour debug
            error_log("SQL Query: " . $sql);
            error_log("Parameters: " . json_encode($params->map(function($param) {
                return $param->getValue();
            })));

            // Calcul du total
            $countQb = clone $qb;
            $total = count($countQb->getQuery()->getResult());

            // Pagination
            $qb->setFirstResult(($page - 1) * $limit)
               ->setMaxResults($limit);

            $results = $qb->getQuery()->getResult();

            // Formatage des résultats
            $formattedResults = array_map(function($result) {
                return [
                    'id' => $result['company']->getId(),
                    'denomination' => $result['company']->getDenomination(),
                    'sector' => $result['company']->getSector(),
                    'updatedAt' => $result['company']->getUpdatedAt() ? 
                        $result['company']->getUpdatedAt()->format('Y-m-d H:i:s') : null,
                    'investment' => [
                        'totalAmount' => (int)$result['group_total_amount'],
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
        } catch (\Exception $e) {
            error_log("Error in findByFiltersWithPagination: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            throw $e;
        }
    }
} 