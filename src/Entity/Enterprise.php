<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class Enterprise
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: 'text')]
    private string $cognitoId;

    #[ORM\Column(length: 9, unique: true)]
    private string $siren;

    #[ORM\Column(type: 'text')]
    private string $denomination;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $formeJuridique = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $codeApe = null;

    #[ORM\Column(length: 14, nullable: true)]
    private ?string $siret = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $sector = null;

    #[ORM\Column(type: 'datetime')]
    private \DateTime $updatedAt;

    #[ORM\Column(type: 'datetime')]
    private \DateTime $createdAt;
    
    #[ORM\Column(type: 'datetime')]
    private \DateTime $deletedAt;

    #[ORM\OneToOne(mappedBy: 'enterprise', cascade: ['persist', 'remove'])]
    private ?Address $address = null;

    #[ORM\OneToMany(mappedBy: 'enterprise', targetEntity: Representative::class)]
    private Representative $representants;

    #[ORM\OneToOne(mappedBy: 'enterprise', cascade: ['persist', 'remove'])]
    private ?Investment $investment = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getSiren(): string  
    {   
        return $this->siren;
    }

    public function setSiren(string $siren): self
    {
        $this->siren = $siren;
        return $this;
    }

    public function getDenomination(): string
    {
        return $this->denomination;
    }

    public function setDenomination(string $denomination): self
    {
        $this->denomination = $denomination;
        return $this;
    }

    public function getFormeJuridique(): ?string
    {
        return $this->formeJuridique;
    }

    public function setFormeJuridique(?string $formeJuridique): self
    {
        $this->formeJuridique = $formeJuridique;
        return $this;
    }

    public function getCodeApe(): ?string
    {
        return $this->codeApe;
    }

    public function setCodeApe(?string $codeApe): self
    {
        $this->codeApe = $codeApe;
        return $this;
    }

    public function getSiret(): ?string
    {
        return $this->siret;
    }

    public function setSiret(?string $siret): self
    {
        $this->siret = $siret;
        return $this;
    }

    public function getUpdatedAt(): \DateTime
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTime|string|null $updatedAt): self
    {
        if ($updatedAt === null || $updatedAt === '') {
            // Définir la date par défaut à 9999-12-31 23:59:59
            $this->updatedAt = new \DateTime('9999-12-31 23:59:59');
        } elseif (is_string($updatedAt)) {
            try {
                // Convertit le format dd/mm/yyyy en yyyy-mm-dd 00:00:00
                $date = \DateTime::createFromFormat('d/m/Y H:i:s', $updatedAt . ' 00:00:00');
                if ($date === false) {
                    // Si le format n'est pas bon, on met la date par défaut
                    $this->updatedAt = new \DateTime('9999-12-31 23:59:59');
                } else {
                    $this->updatedAt = $date;
                }
            } catch (\Exception $e) {
                // En cas d'erreur, on met la date par défaut
                $this->updatedAt = new \DateTime('9999-12-31 23:59:59');
            }
        } else {
            $this->updatedAt = $updatedAt;
        }
        return $this;
    }

    public function getCreatedAt(): \DateTime
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTime $createdAt): self
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    public function getDeletedAt(): \DateTime
    {
        return $this->deletedAt;
    }

    public function setDeletedAt(\DateTime $deletedAt): self
    {
        $this->deletedAt = $deletedAt;
        return $this;
    }

    public function getAddress(): ?CompanyAddress
    {
        return $this->address;
    }

    public function setAddress(?CompanyAddress $address): self
    {
        $this->address = $address;
        return $this;
    }

    public function getInvestment(): ?CompanyInvestment
    {
        return $this->investment;
    }

    public function setInvestment(?CompanyInvestment $investment): self
    {
        $this->investment = $investment;
        return $this;
    }

    public function getRepresentants(): array
    {
        return $this->representants;
    }

    public function setRepresentants(array $representants): self
    {
        $this->representants = $representants;
        return $this;
    }

    public function getCognitoId(): string
    {
        return $this->cognitoId;
    }

    public function setCognitoId(string $cognitoId): self
    {
        $this->cognitoId = $cognitoId;
        return $this;
    }

    public function getSector(): ?string
    {
        return $this->sector;
    }

    public function setSector(?string $sector): self
    {
        $this->sector = $sector;
        return $this;
    }
} 