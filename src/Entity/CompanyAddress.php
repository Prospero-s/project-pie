<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class CompanyAddress
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\OneToOne(inversedBy: 'address')]
    #[ORM\JoinColumn(nullable: false)]
    private Company $company;

    #[ORM\Column(length: 10, nullable: true)]
    private ?string $streetNumber = null;

    #[ORM\Column(length: 50, nullable: true)]
    private ?string $streetTypes = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $voie = null;

    #[ORM\Column(length: 5, nullable: true)]
    private ?string $codePostal = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $commune = null;

    #[ORM\Column(length: 50)]
    private string $pays = 'FRANCE';

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCompany(): Company
    {
        return $this->company;
    }

    public function setCompany(Company $company): self
    {
        $this->company = $company;
        return $this;
    }

    public function getStreetNumber(): ?string
    {
        return $this->streetNumber;
    }

    public function setStreetNumber(?string $streetNumber): self
    {
        $this->streetNumber = $streetNumber;
        return $this;
    }

    public function getStreetTypes(): ?string
    {
        return $this->streetTypes;
    }

    public function setStreetTypes(?string $streetTypes): self
    {
        $this->streetTypes = $streetTypes;
        return $this;
    }

    public function getVoie(): ?string
    {
        return $this->voie;
    }

    public function setVoie(?string $voie): self
    {
        $this->voie = $voie;
        return $this;
    }

    public function getCodePostal(): ?string
    {
        return $this->codePostal;
    }

    public function setCodePostal(?string $codePostal): self
    {
        $this->codePostal = $codePostal;
        return $this;
    }

    public function getCommune(): ?string
    {
        return $this->commune;
    }

    public function setCommune(?string $commune): self
    {
        $this->commune = $commune;
        return $this;
    }

    public function getPays(): string
    {
        return $this->pays;
    }

    public function setPays(string $pays): self
    {
        $this->pays = $pays;
        return $this;
    }

    public function getFullAddress(): string
    {
        $parts = array_filter([
            $this->streetNumber,
            $this->streetTypes,
            $this->voie,
            $this->codePostal,
            $this->commune,
            $this->pays !== 'FRANCE' ? $this->pays : null
        ]);

        return implode(' ', $parts);
    }
}
