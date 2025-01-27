<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use App\Entity\CompanyInvestment;
use App\Repository\UserRepository;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: '`user`')]
class User
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: "integer")]
    private ?int $id = null;

    #[ORM\Column(type: "string", length: 255, unique: true)]
    private string $cognitoId;

    #[ORM\Column(type: "string", length: 255)]
    private string $email;

    #[ORM\Column(type: "json")]
    private array $roles = [];

    #[ORM\OneToMany(targetEntity: CompanyInvestment::class, mappedBy: 'user')]
    private Collection $investments;

    #[ORM\Column(type: 'datetime')]
    private \DateTime $createdAt;

    #[ORM\ManyToOne(targetEntity: UserGroup::class, inversedBy: 'users')]
    private ?UserGroup $userGroup = null;

    public function __construct()
    {
        $this->investments = new ArrayCollection();
        $this->createdAt = new \DateTime();
        $this->roles[] = 'ROLE_USER';
    }

    public function getId(): ?int
    {
        return $this->id;
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

    public function getEmail(): string
    {
        return $this->email;
    }

    public function setEmail(string $email): self
    {
        $this->email = $email;
        return $this;
    }

    public function getRoles(): array
    {
        return array_unique($this->roles);
    }

    public function setRoles(array $roles): self
    {
        $this->roles = $roles;
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
            $investment->setUser($this);
        }
        return $this;
    }

    public function removeInvestment(CompanyInvestment $investment): self
    {
        if ($this->investments->removeElement($investment)) {
            if ($investment->getUser() === $this) {
                $investment->setUser(null);
            }
        }
        return $this;
    }

    public function getCreatedAt(): \DateTime
    {
        return $this->createdAt;
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
} 