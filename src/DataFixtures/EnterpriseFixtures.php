<?php

namespace App\DataFixtures;

use App\Entity\Enterprise;
use App\Entity\Address;
use App\Entity\Representative;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class EnterpriseFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $jsonContent = file_get_contents(__DIR__ . '/data/fixtures.json');
        $data = json_decode($jsonContent, true);

        foreach ($data['enterprises'] as $index => $enterpriseData) {
            $enterprise = new Enterprise();
            $enterprise->setDenomination($enterpriseData['denomination']);
            $enterprise->setSector($enterpriseData['main_activity']);
            $enterprise->setFormeJuridique($enterpriseData['legal_form']);
            $enterprise->setSiret($enterpriseData['siret']);
            $enterprise->setSiren($enterpriseData['siren']);
            $enterprise->setCodeApe($enterpriseData['code_naf']);
            $enterprise->setCognitoId('cognito_' . $index);
            $enterprise->setCreatedAt(new \DateTime());
            $enterprise->setUpdatedAt(new \DateTime());
            $enterprise->setDeletedAt(new \DateTime('9999-12-31'));

            // Création de l'adresse
            $address = new Address();
            $address->setNumVoie($enterpriseData['address']['lane_number']);
            $address->setTypeVoie($enterpriseData['address']['track_type']);
            $address->setVoie($enterpriseData['address']['route']);
            $address->setCodePostal((string)$enterpriseData['address']['postal_code']);
            $address->setCommune($enterpriseData['address']['city']);
            $address->setPays($enterpriseData['address']['country']);
            $address->setEnterprise($enterprise);

            // Création du représentant
            $representative = new Representative();
            $representative->setNom($enterpriseData['recipient']['lastname']);
            $representative->setQualite($enterpriseData['recipient']['firstname']);
            $enterprise->addRepresentant($representative);

            $manager->persist($enterprise);
            $manager->persist($address);
            $manager->persist($representative);
        }

        $manager->flush();
    }
}
