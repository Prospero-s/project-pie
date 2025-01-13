<?php

namespace App\Repository;

use App\Entity\Enterprise;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\ORM\EntityManagerInterface;
use App\Entity\Representative;
use App\Entity\Address;
use App\Entity\Investment;

class EnterpriseRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry, EntityManagerInterface $em)
    {
        parent::__construct($registry, Enterprise::class);
        $this->em = $em;
    }

    public function saveEnterprise(string $cognitoId, array $data): array
    {
        try {
            // Extraire le sub du token JWT
            $tokenParts = explode('.', $cognitoId);
            $payload = json_decode(base64_decode($tokenParts[1]), true);
            $sub = $payload['sub'] ?? throw new \Exception('Token invalide : sub manquant');

            // Recherche ou création de l'entreprise
            $enterprise = $this->em->getRepository(Enterprise::class)->findOneBy(['siren' => $data['siren']]);
            
            if (!$enterprise) {
                $enterprise = new Enterprise();
                $enterprise->setCognitoId($sub);
                $enterprise->setSiren($data['siren']);
                $enterprise->setDenomination($data['denomination']);
                $enterprise->setFormeJuridique($data['formeJuridique'] ?? null);
                $enterprise->setCodeApe($data['codeApe'] ?? null);
                $enterprise->setSiret($data['siret'] ?? null);
                $enterprise->setUpdatedAt($data['updatedAt'] ?? new \DateTime("9999-12-31 23:59:59"));
                $enterprise->setCreatedAt(new \DateTime());
                $enterprise->setDeletedAt(new \DateTime("9999-12-31 23:59:59"));
                $enterprise->setSector($data['sector'] ?? null);
                //Création des représentants
                foreach ($data['representants'] as $representant) {
                    $representantEntity = new Representative();
                    $representantEntity->setEnterprise($enterprise);
                    $representantEntity->setNom($representant['nom']);
                    $representantEntity->setQualite($representant['qualite'] ?? null);
                    $this->em->persist($representantEntity);
                }

                // Création de l'adresse
                if (!empty($data['adresse'])) {
                    $address = new Address();
                    $address->setEnterprise($enterprise);
                    $address->setNumVoie($data['adresse']['numVoie'] ?? null);
                    $address->setTypeVoie($data['adresse']['typeVoie'] ?? null);
                    $address->setVoie($data['adresse']['voie'] ?? null);
                    $address->setCodePostal($data['adresse']['codePostal'] ?? null);
                    $address->setCommune($data['adresse']['commune'] ?? null);
                    $address->setPays($data['adresse']['pays'] ?? 'FRANCE');
                    
                    $this->em->persist($address);
                }

                $this->em->persist($enterprise);
            }

            // Création de l'investissement
            $investment = new Investment();
            $investment->setEnterprise($enterprise);
            $investment->setCognitoId($sub);
            $investment->setFundingType($data['fundingType']);
            $investment->setAmount($data['amountRaised']);
            $investment->setCurrency($data['currency'] ?? 'EUR');

            $this->em->persist($investment);
            $this->em->flush();

            return [
                'success' => true,
                'enterprise' => [
                    'id' => $enterprise->getId(),
                    'siren' => $enterprise->getSiren(),
                    'denomination' => $enterprise->getDenomination()
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