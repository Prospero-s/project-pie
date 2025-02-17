<?php

namespace App\Entity;

use App\Repository\GroupInvitationRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: GroupInvitationRepository::class)]
class GroupInvitation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: UserGroup::class)]
    #[ORM\JoinColumn(nullable: false)]
    private UserGroup $group;

    #[ORM\Column(type: 'text')]
    private string $email;

    #[ORM\Column(type: 'string', length: 36, unique: true)]
    private string $token;

    #[ORM\Column(type: 'datetime')]
    private \DateTime $expiresAt;

    #[ORM\Column(type: 'datetime')]
    private \DateTime $createdAt;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    private User $invitedBy;

    #[ORM\Column(type: 'string', length: 50)]
    private string $role = GroupRole::ROLE_MEMBER;

    public function __construct()
    {
        $this->token = bin2hex(random_bytes(16));
        $this->createdAt = new \DateTime();
        $this->expiresAt = (new \DateTime())->modify('+7 days');
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getGroup(): UserGroup
    {
        return $this->group;
    }

    public function setGroup(UserGroup $group): self
    {
        $this->group = $group;
        return $this;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function setEmail(string $email): self
    {
        $this->email = $email;
        return $this;
    }

    public function getToken(): string
    {
        return $this->token;
    }

    public function getExpiresAt(): \DateTime
    {
        return $this->expiresAt;
    }

    public function getCreatedAt(): \DateTime
    {
        return $this->createdAt;
    }

    public function isExpired(): bool
    {
        return $this->expiresAt < new \DateTime();
    }

    public function getInvitedBy(): User
    {
        return $this->invitedBy;
    }

    public function setInvitedBy(User $invitedBy): self
    {
        $this->invitedBy = $invitedBy;
        return $this;
    }

    public function getRole(): string
    {
        return $this->role;
    }

    public function setRole(string $role): self
    {
        $this->role = $role;
        return $this;
    }
}
