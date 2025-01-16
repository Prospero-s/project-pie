<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class Representative
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Enterprise::class, inversedBy: 'representatives')]
    private Enterprise $enterprise;

    #[ORM\Column(length: 255)]
    private string $nom;

    #[ORM\Column(length: 255)]
    private string $qualite;

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

    public function getNom(): string
    {
        return $this->nom;
    }

    public function setNom(string $nom): self
    {
        $this->nom = $nom;
        return $this;
    }

    public function getQualite(): string
    {
        return $this->qualite;
    }

    public function setQualite(string $qualite): self
    {
        $this->qualite = $qualite;
        return $this;
    }
}
