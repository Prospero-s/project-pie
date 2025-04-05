<?php

namespace App\Entity;

use App\Repository\NotificationSettingsRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: NotificationSettingsRepository::class)]
class NotificationSettings
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private ?bool $emailEnabled = null;

    #[ORM\Column]
    private ?bool $smsEnabled = null;

    #[ORM\Column]
    private ?bool $pushEnabled = null;

    #[ORM\OneToOne(inversedBy: 'notificationSettings', cascade: ['persist', 'remove'])]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $userId = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $updatedAt = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function isEmailEnabled(): ?bool
    {
        return $this->emailEnabled;
    }

    public function setEmailEnabled(bool $emailEnabled): static
    {
        $this->emailEnabled = $emailEnabled;

        return $this;
    }

    public function isSmsEnabled(): ?bool
    {
        return $this->smsEnabled;
    }

    public function setSmsEnabled(bool $smsEnabled): static
    {
        $this->smsEnabled = $smsEnabled;

        return $this;
    }

    public function isPushEnabled(): ?bool
    {
        return $this->pushEnabled;
    }

    public function setPushEnabled(bool $pushEnabled): static
    {
        $this->pushEnabled = $pushEnabled;

        return $this;
    }

    public function getUserId(): ?User
    {
        return $this->userId;
    }

    public function setUserId(User $userId): static
    {
        $this->userId = $userId;

        return $this;
    }

    public function getUpdatedAt(): ?\DateTimeInterface
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTimeInterface $updatedAt): static
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }
}
