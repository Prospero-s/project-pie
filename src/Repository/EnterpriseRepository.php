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
                $company->setFormeJuridique($data['formeJuridique'] ?? null);
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
                    $address->setTypeVoie($data['adresse']['typeVoie'] ?? null);
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
} 