<?php

namespace App\Entity;

use App\Repository\DocumentRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: DocumentRepository::class)]
class Document
{
    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    #[Groups(["document", "document_list"])]
    private $id;

    #[ORM\Column(type: 'text')]
    private $blob;

    #[ORM\Column(type: 'datetime')]
    #[Groups(["document", "document_list"])]
    private $addDate;

    #[ORM\Column(type: 'integer')]
    #[Groups(["document", "document_list"])]
    private $year;

    #[ORM\Column(type: 'string', length: 10)]
    #[Groups(["document", "document_list"])]
    private $periodicity;

    #[ORM\OneToMany(mappedBy: 'document', targetEntity: Kpi::class, orphanRemoval: true)]
    #[Groups(["document"])]
    private $kpis;

    #[ORM\ManyToOne(targetEntity: Company::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(["document", "document_list"])]
    private $company;

    #[ORM\ManyToOne(targetEntity: UserGroup::class)]
    #[ORM\JoinColumn(nullable: true)]
    #[Groups(["document", "document_list"])]
    private $userGroup;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    #[Groups(["document", "document_list"])]
    private $filename;

    public function __construct()
    {
        $this->id = Uuid::v4();
        $this->addDate = new \DateTime();
        $this->kpis = new ArrayCollection();
    }

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function getBlob(): ?string
    {
        return $this->blob;
    }

    public function setBlob(string $blob): self
    {
        $this->blob = $blob;

        return $this;
    }

    public function getAddDate(): ?\DateTimeInterface
    {
        return $this->addDate;
    }

    public function setAddDate(\DateTimeInterface $addDate): self
    {
        $this->addDate = $addDate;

        return $this;
    }

    public function getYear(): ?int
    {
        return $this->year;
    }

    public function setYear(int $year): self
    {
        $this->year = $year;

        return $this;
    }

    public function getPeriodicity(): ?string
    {
        return $this->periodicity;
    }

    public function setPeriodicity(string $periodicity): self
    {
        $this->periodicity = $periodicity;

        return $this;
    }

    /**
     * @return Collection<int, Kpi>
     */
    public function getKpis(): Collection
    {
        return $this->kpis;
    }

    public function addKpi(Kpi $kpi): self
    {
        if (!$this->kpis->contains($kpi)) {
            $this->kpis[] = $kpi;
            $kpi->setDocument($this);
        }

        return $this;
    }

    public function removeKpi(Kpi $kpi): self
    {
        if ($this->kpis->removeElement($kpi)) {
            // set the owning side to null (unless already changed)
            if ($kpi->getDocument() === $this) {
                $kpi->setDocument(null);
            }
        }

        return $this;
    }

    public function getCompany(): ?Company
    {
        return $this->company;
    }

    public function setCompany(?Company $company): self
    {
        $this->company = $company;

        return $this;
    }

    public function getUserGroup(): ?UserGroup
    {
        return $this->userGroup;
    }

    public function setUserGroup(?UserGroup $userGroup): self
    {
        $this->userGroup = $userGroup;

        return $this;
    }

    public function getFilename(): ?string
    {
        return $this->filename;
    }

    public function setFilename(?string $filename): self
    {
        $this->filename = $filename;

        return $this;
    }
} 