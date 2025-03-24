<?php

namespace App\Entity;

use App\Repository\KpiDataRepository;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

#[ORM\Entity(repositoryClass: KpiDataRepository::class)]
class KpiData
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Company::class, inversedBy: 'kpiData')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Company $company = null;

    #[ORM\Column]
    private array $kpi = [];

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $pdfUrl = null;

    #[ORM\Column(length: 255)]
    private ?string $status = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTime $updatedAt = null;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $deletedAt = null;

    #[ORM\OneToMany(targetEntity: UploadDocument::class, mappedBy: 'kpiData')]
    private Collection $uploadDocuments;

    public function __construct()
    {
        $this->uploadDocuments = new ArrayCollection();
        $this->setCreatedAt(new \DateTimeImmutable());
    }

    public function getId(): ?int
    {
        return $this->id;
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

    public function getKpi(): array
    {
        return $this->kpi;
    }

    public function setKpi(array $kpi): static
    {
        $this->kpi = $kpi;

        return $this;
    }

    public function getPdfUrl(): ?string
    {
        return $this->pdfUrl;
    }

    public function setPdfUrl(?string $pdfUrl): static
    {
        $this->pdfUrl = $pdfUrl;

        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $this->status = $status;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    public function getUpdatedAt(): ?\DateTime
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(?\DateTime $updatedAt): static
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }

    public function getDeletedAt(): ?\DateTimeImmutable
    {
        return $this->deletedAt;
    }

    public function setDeletedAt(?\DateTimeImmutable $deletedAt): self
    {
        $this->deletedAt = $deletedAt;
        return $this;
    }

    /**
     * @return Collection<int, UploadDocument>
     */
    public function getUploadDocuments(): Collection
    {
        return $this->uploadDocuments;
    }

    public function addUploadDocument(UploadDocument $uploadDocument): self
    {
        if (!$this->uploadDocuments->contains($uploadDocument)) {
            $this->uploadDocuments->add($uploadDocument);
            $uploadDocument->setKpiData($this);
        }

        return $this;
    }

    public function removeUploadDocument(UploadDocument $uploadDocument): self
    {
        if ($this->uploadDocuments->removeElement($uploadDocument)) {
            // set the owning side to null (unless already changed)
            if ($uploadDocument->getKpiData() === $this) {
                $uploadDocument->setKpiData(null);
            }
        }

        return $this;
    }
}
