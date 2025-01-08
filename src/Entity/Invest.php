<?php

namespace App\Entity;

use App\Repository\InvestRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: InvestRepository::class)]
class Invest
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private ?int $amount = null;

    #[ORM\Column]
    private ?int $ent_start_value = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $payment_date = null;

    #[ORM\ManyToOne(inversedBy: 'invests')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Enterprise $enterprise = null;

    #[ORM\ManyToOne(inversedBy: 'invests')]
    #[ORM\JoinColumn(nullable: false)]
    private ?UserWallet $userWallet = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getAmount(): ?int
    {
        return $this->amount;
    }

    public function setAmount(int $amount): static
    {
        $this->amount = $amount;

        return $this;
    }

    public function getEntStartValue(): ?int
    {
        return $this->ent_start_value;
    }

    public function setEntStartValue(int $ent_start_value): static
    {
        $this->ent_start_value = $ent_start_value;

        return $this;
    }

    public function getPaymentDate(): ?\DateTimeInterface
    {
        return $this->payment_date;
    }

    public function setPaymentDate(\DateTimeInterface $payment_date): static
    {
        $this->payment_date = $payment_date;

        return $this;
    }

    public function getEnterprise(): ?Enterprise
    {
        return $this->enterprise;
    }

    public function setEnterprise(?Enterprise $enterprise): static
    {
        $this->enterprise = $enterprise;

        return $this;
    }

    public function getUserWallet(): ?UserWallet
    {
        return $this->userWallet;
    }

    public function setUserWallet(?UserWallet $userWallet): static
    {
        $this->userWallet = $userWallet;

        return $this;
    }
}
