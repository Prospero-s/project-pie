<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

#[ORM\Entity]
class Company
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 9, unique: true)]
    private string $siren;

    #[ORM\Column(type: 'text')]
    private string $denomination;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $businessStructures = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $codeApe = null;

    #[ORM\Column(length: 14, nullable: true)]
    private ?string $siret = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $sector = null;

    #[ORM\Column(type: 'datetime', nullable: true)]
    private ?\DateTime $updatedAt = null;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $deletedAt = null;

    #[ORM\OneToOne(mappedBy: 'company', cascade: ['persist', 'remove'])]
    private ?CompanyAddress $address = null;

    #[ORM\OneToMany(mappedBy: 'company', targetEntity: Representative::class)]
    private Collection $representatives;

    #[ORM\OneToMany(mappedBy: 'company', targetEntity: CompanyInvestment::class)]
    private Collection $investments;

    #[ORM\OneToMany(targetEntity: KpiData::class, mappedBy: 'company')]
    private Collection $kpiData;

    public function __construct()
    {
        $this->representatives = new ArrayCollection();
        $this->createdAt = new \DateTimeImmutable();
        $this->deletedAt = null;
        $this->kpiData = new ArrayCollection();
    }

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

    public function getBusinessStructures(): ?string
    {
        return $this->businessStructures;
    }

    public function setBusinessStructures(?string $businessStructures): self
    {
        $this->businessStructures = $businessStructures;
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

    public function setUpdatedAt(\DateTime $updatedAt): self
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): self
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    public function getDeletedAt(): \DateTimeImmutable
    {
        return $this->deletedAt;
    }

    public function setDeletedAt(?\DateTimeImmutable $deletedAt): self
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

    public function getInvestments(): Collection
    {
        return $this->investments;
    }

    public function addInvestment(CompanyInvestment $investment): self
    {
        if (!$this->investments->contains($investment)) {
            $this->investments->add($investment);
            $investment->setCompany($this);
        }
        return $this;
    }

    public function removeInvestment(CompanyInvestment $investment): self
    {
        if ($this->investments->removeElement($investment)) {
            if ($investment->getCompany() === $this) {
                $investment->setCompany(null);
            }
        }
        return $this;
    }

    public function getRepresentatives(): Collection
    {
        return $this->representatives;
    }

    public function addRepresentative(Representative $representative): self
    {
        if (!$this->representatives->contains($representative)) {
            $this->representatives->add($representative);
            $representative->setCompany($this);
        }
        return $this;
    }

    public function removeRepresentative(Representative $representative): self
    {
        if ($this->representatives->removeElement($representative)) {
            if ($representative->getCompany() === $this) {
                $representative->setCompany(null);
            }
        }
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

    /**
     * @return Collection<int, KpiData>
     */
    public function getKpiData(): Collection
    {
        return $this->kpiData;
    }

    public function addKpiData(KpiData $kpiData): self
    {
        if (!$this->kpiData->contains($kpiData)) {
            $this->kpiData->add($kpiData);
            $kpiData->setCompany($this);
        }

        return $this;
    }

    public function removeKpiData(KpiData $kpiData): self
    {
        if ($this->kpiData->removeElement($kpiData)) {
            // set the owning side to null (unless already changed)
            if ($kpiData->getCompany() === $this) {
                $kpiData->setCompany(null);
            }
        }

        return $this;
    }
}
