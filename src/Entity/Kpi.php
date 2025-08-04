<?php

namespace App\Entity;

use App\Repository\KpiRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Uid\Uuid;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: KpiRepository::class)]
class Kpi
{
    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    #[Groups(["kpi", "document"])]
    private $id;

    #[ORM\Column(type: 'string', length: 255)]
    #[Groups(["kpi", "document"])]
    private $name;

    #[ORM\Column(type: 'float', nullable: true)]
    #[Groups(["kpi", "document"])]
    private $value;

    #[ORM\Column(type: 'string', length: 10)]
    #[Groups(["kpi", "document"])]
    private $period;

    #[ORM\ManyToOne(targetEntity: Document::class, inversedBy: 'kpis')]
    #[ORM\JoinColumn(nullable: false)]
    private $document;

    #[ORM\Column(type: 'string', length: 20, nullable: true)]
    #[Groups(["kpi", "document"])]
    private $unit;

    public function __construct()
    {
        $this->id = Uuid::v4();
    }

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;

        return $this;
    }

    public function getValue(): ?float
    {
        return $this->value;
    }

    public function setValue(?float $value): self
    {
        $this->value = $value;

        return $this;
    }

    public function getPeriod(): ?string
    {
        return $this->period;
    }

    public function setPeriod(string $period): self
    {
        $this->period = $period;

        return $this;
    }

    public function getDocument(): ?Document
    {
        return $this->document;
    }

    public function setDocument(?Document $document): self
    {
        $this->document = $document;

        return $this;
    }

    public function getUnit(): ?string
    {
        return $this->unit;
    }

    public function setUnit(?string $unit): self
    {
        $this->unit = $unit;

        return $this;
    }
}
