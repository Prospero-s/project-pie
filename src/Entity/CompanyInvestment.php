<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class CompanyInvestment
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Company::class, inversedBy: 'investments')]
    #[ORM\JoinColumn(nullable: false)]
    private Company $company;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'investments')]
    #[ORM\JoinColumn(nullable: false)]
    private User $user;

    #[ORM\ManyToOne(targetEntity: UserGroup::class)]
    #[ORM\JoinColumn(nullable: false)]
    private UserGroup $userGroup;

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

    public function getCompany(): Company
    {
        return $this->company;
    }

    public function setCompany(Company $company): self
    {
        $this->company = $company;
        return $this;
    }

    public function getUser(): User
    {
        return $this->user;
    }

    public function setUser(User $user): self
    {
        $this->user = $user;
        return $this;
    }

    public function getUserGroup(): UserGroup
    {
        return $this->userGroup;
    }

    public function setUserGroup(UserGroup $userGroup): self
    {
        $this->userGroup = $userGroup;
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