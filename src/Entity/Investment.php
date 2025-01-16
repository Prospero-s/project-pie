<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class Investment
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\OneToOne(inversedBy: 'investment')]
    #[ORM\JoinColumn(nullable: false)]
    private Enterprise $enterprise;

    #[ORM\Column(length: 255)]
    private string $cognitoId;

    #[ORM\Column(type: 'string', length: 50)]
    private string $fundingType;

    #[ORM\Column(type: 'bigint')]
    private int $amount;

    #[ORM\Column(length: 3)]
    private string $currency = 'EUR';

    #[ORM\Column(type: 'datetime')]
    private \DateTime $investedAt;

    public function __construct()
    {
        $this->investedAt = new \DateTime();
    }

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

    public function getCognitoId(): string
    {
        return $this->cognitoId;
    }

    public function setCognitoId(string $cognitoId): self
    {
        $this->cognitoId = $cognitoId;
        return $this;
    }

    public function getFundingType(): string
    {
        return $this->fundingType;
    }

    public function setFundingType(string $fundingType): self
    {
        $this->fundingType = $fundingType;
        return $this;
    }

    public function getAmount(): int
    {
        return $this->amount;
    }

    public function setAmount(int $amount): self
    {
        $this->amount = $amount;
        return $this;
    }

    public function getCurrency(): string
    {
        return $this->currency;
    }

    public function setCurrency(string $currency): self
    {
        $this->currency = $currency;
        return $this;
    }

    public function getInvestedAt(): \DateTime
    {
        return $this->investedAt;
    }

    public function setInvestedAt(\DateTime $investedAt): self
    {
        $this->investedAt = $investedAt;
        return $this;
    }
} 