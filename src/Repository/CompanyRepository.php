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

/**
 * @extends ServiceEntityRepository<Company>
 */
class CompanyRepository extends ServiceEntityRepository
{
    private EntityManagerInterface $em;

    public function __construct(
        ManagerRegistry $registry,
        EntityManagerInterface $em,
        private UserService $userService
    ) {
        parent::__construct($registry, Company::class);
        $this->em = $em;
    }

    /**
     * @param string $cognitoId
     * @param string $email
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
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
                $company->setUpdatedAt(new \DateTime());
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
            $investment->setUserGroup($investorUser->getUserGroup());
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

    /**
     * @param array<string, mixed> $filters
     * @param string $cognitoId
     * @param int $page
     * @param int $limit
     * @param string $sortField
     * @param string $sortOrder
     * @return array<string, mixed>
     */
    public function findByFiltersWithPagination(
        array $filters,
        string $cognitoId,
        int $page = 1,
        int $limit = 10,
        string $sortField = 'updatedAt',
        string $sortOrder = 'desc'
    ): array {
        try {
            // Correction de la requête pour récupérer le groupe de l'utilisateur
            $user = $this->em->createQueryBuilder()
                ->select('u')
                ->from('App\Entity\User', 'u')
                ->where('u.cognitoId = :cognitoId')
                ->setParameter('cognitoId', $cognitoId)
                ->getQuery()
                ->getSingleResult();

            $userGroup = $user->getUserGroup();

            $qb = $this->createQueryBuilder('c')
                ->select(
                    'c as company',
                    '(SELECT COALESCE(SUM(inv_sum.amount), 0) 
                      FROM App\Entity\CompanyInvestment inv_sum 
                      WHERE inv_sum.company = c.id 
                      AND inv_sum.userGroup = :userGroup
                    ) as group_total_amount',
                    '(SELECT MAX(inv_date.investedAt)
                      FROM App\Entity\CompanyInvestment inv_date
                      WHERE inv_date.company = c.id
                      AND inv_date.userGroup = :userGroup
                    ) as last_investment_date'
                )
                ->join('c.investments', 'i_main')
                ->where('i_main.userGroup = :userGroup')
                ->setParameter('userGroup', $userGroup)
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
                    $qb->orderBy('last_investment_date', $sortOrder);
                    break;
                case 'denomination':
                    $qb->orderBy('c.denomination', $sortOrder);
                    break;
                default:
                    $qb->orderBy('last_investment_date', 'DESC');
            }

            // Calcul du total
            $countQb = clone $qb;
            $total = count($countQb->getQuery()->getResult());

            // Pagination
            $qb->setFirstResult(($page - 1) * $limit)
               ->setMaxResults($limit);

            $results = $qb->getQuery()->getResult();

            // Récupération des types de financement
            $formattedResults = array_map(function ($result) use ($userGroup) {
                $company = $result['company'];

                // Requête simplifiée pour obtenir les types de financement
                $fundingTypes = $this->createQueryBuilder('c2')
                    ->select('DISTINCT i.fundingType')
                    ->join('c2.investments', 'i')
                    ->where('c2.id = :companyId')
                    ->andWhere('i.userGroup = :userGroup')
                    ->setParameter('companyId', $company->getId())
                    ->setParameter('userGroup', $userGroup)
                    ->getQuery()
                    ->getScalarResult();

                $latestInvestment = $this->em->createQueryBuilder()
                    ->select('i.id')
                    ->from(CompanyInvestment::class, 'i')
                    ->where('i.company = :companyId')
                    ->andWhere('i.userGroup = :userGroup')
                    ->orderBy('i.investedAt', 'DESC')
                    ->setMaxResults(1)
                    ->setParameter('companyId', $company->getId())
                    ->setParameter('userGroup', $userGroup)
                    ->getQuery()
                    ->getOneOrNullResult();

                return [
                    'id' => $company->getId(),
                    'denomination' => $company->getDenomination(),
                    'sector' => $company->getSector(),
                    'updatedAt' => $result['last_investment_date'] ?
                        (new \DateTime($result['last_investment_date']))->format('Y-m-d H:i:s') : null,
                    'investment' => [
                        'id' => $latestInvestment['id'],
                        'totalAmount' => (int)$result['group_total_amount'],
                        'fundingTypes' => array_column($fundingTypes, 'fundingType')
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
