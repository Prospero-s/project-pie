<?php

namespace App\Repository;

use App\Entity\Company;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\ORM\EntityManagerInterface;
use App\Entity\Representative;
use App\Entity\CompanyAddress;
use App\Entity\CompanyInvestment;

class CompanyRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry, EntityManagerInterface $em)
    {
        parent::__construct($registry, Company::class);
        $this->em = $em;
    }

    public function saveCompany(string $cognitoId, array $data): array
    {
        try {
            // Extraire le sub du token JWT
            $tokenParts = explode('.', $cognitoId);
            $payload = json_decode(base64_decode($tokenParts[1]), true);
            $sub = $payload['sub'] ?? throw new \Exception('Token invalide : sub manquant');

            // Recherche ou création de l'entreprise
            $company = $this->em->getRepository(Company::class)->findOneBy(['siren' => $data['siren']]);
            
            if (!$company) {
                $company = new Company();
                $company->setCognitoId($sub);
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

            // Ajout de l'investisseur comme représentant
            $investorRepresentative = new Representative();
            $investorRepresentative->setCompany($company);
            $investorRepresentative->setNom($data['investorName'] ?? 'Investisseur');
            $investorRepresentative->setQualite('Investisseur');
            $investorRepresentative->setCognitoId($sub);
            $this->em->persist($investorRepresentative);

            // Création de l'investissement
            $investment = new CompanyInvestment();
            $investment->setCompany($company);
            $investment->setCognitoId($sub);
            $investment->setFundingType($data['fundingType']);
            $investment->setAmount($data['amountRaised']);
            $investment->setCurrency($data['currency'] ?? 'EUR');

            $this->em->persist($investment);
            $this->em->flush();

            return [
                'success' => true,
                'company' => [
                    'id' => $company->getId(),
                    'siren' => $company->getSiren(),
                    'denomination' => $company->getDenomination()
                ],
                'investment' => [
                    'id' => $investment->getId(),
                    'amount' => $investment->getAmount(),
                    'fundingType' => $investment->getFundingType()
                ]
            ];
        } catch (\Exception $e) {
            throw $e;
        }
    }

    public function findByFilters(array $filters): array
    {
        $qb = $this->createQueryBuilder('c')
            ->leftJoin('c.investment', 'i')
            ->where('c.deletedAt is NULL');

        if (!empty($filters['sector'])) {
            $qb->andWhere('c.sector = :sector')
               ->setParameter('sector', $filters['sector']);
        }

        if (!empty($filters['fundingType'])) {
            $qb->andWhere('i.fundingType = :fundingType')
               ->setParameter('fundingType', $filters['fundingType']);
        }

        return $qb->getQuery()->getResult();
    }

    public function findByFiltersWithPagination(array $filters, int $page = 1, int $limit = 10, string $sortField = 'updatedAt', string $sortOrder = 'desc'): array
    {
        $qb = $this->createQueryBuilder('c')
            ->select('c', 'i')
            ->leftJoin('c.investment', 'i')
            ->where('c.deletedAt is NULL');

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
                $qb->andWhere('i.fundingType IN (:fundingTypes)')
                   ->setParameter('fundingTypes', $filters['fundingType']);
            } else {
                $qb->andWhere('i.fundingType = :fundingType')
                   ->setParameter('fundingType', $filters['fundingType']);
            }
        }

        // Gestion du tri
        switch ($sortField) {
            case 'amount':
                $qb->orderBy('i.amount', $sortOrder);
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

        // Formatage des données
        $formattedResults = array_map(function($company) {
            return [
                'id' => $company->getId(),
                'denomination' => $company->getDenomination(),
                'sector' => $company->getSector(),
                'updatedAt' => $company->getUpdatedAt()->format('Y-m-d H:i:s'),
                'investment' => $company->getInvestment() ? [
                    'amount' => $company->getInvestment()->getAmount(),
                    'fundingType' => $company->getInvestment()->getFundingType(),
                ] : null,
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