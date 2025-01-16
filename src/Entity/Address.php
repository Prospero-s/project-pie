<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class Address
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\OneToOne(inversedBy: 'address')]
    #[ORM\JoinColumn(nullable: false)]
    private Enterprise $enterprise;

    #[ORM\Column(length: 10, nullable: true)]
    private ?string $numVoie = null;

    #[ORM\Column(length: 50, nullable: true)]
    private ?string $typeVoie = null;

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

    public function getEnterprise(): Enterprise
    {
        return $this->enterprise;
    }

    public function setEnterprise(Enterprise $enterprise): self
    {
        $this->enterprise = $enterprise;
        return $this;
    }

    public function getNumVoie(): ?string
    {
        return $this->numVoie;
    }

    public function setNumVoie(?string $numVoie): self
    {
        $this->numVoie = $numVoie;
        return $this;
    }

    public function getTypeVoie(): ?string
    {
        return $this->typeVoie;
    }

    public function setTypeVoie(?string $typeVoie): self
    {
        $this->typeVoie = $typeVoie;
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
            $this->numVoie,
            $this->typeVoie,
            $this->voie,
            $this->codePostal,
            $this->commune,
            $this->pays !== 'FRANCE' ? $this->pays : null
        ]);
        
        return implode(' ', $parts);
    }
} 