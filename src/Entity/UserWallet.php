<?php

namespace App\Entity;

use App\Repository\UserWalletRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: UserWalletRepository::class)]
class UserWallet
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'userWallets')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user_id = null;

    /**
     * @var Collection<int, Invest>
     */
    #[ORM\OneToMany(targetEntity: Invest::class, mappedBy: 'userWallet')]
    private Collection $invests;

    public function __construct()
    {
        $this->invests = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUserId(): ?User
    {
        return $this->user_id;
    }

    public function setUserId(?User $user_id): static
    {
        $this->user_id = $user_id;

        return $this;
    }

    /**
     * @return Collection<int, Invest>
     */
    public function getInvests(): Collection
    {
        return $this->invests;
    }

    public function addInvest(Invest $invest): static
    {
        if (!$this->invests->contains($invest)) {
            $this->invests->add($invest);
            $invest->setUserWallet($this);
        }

        return $this;
    }

    public function removeInvest(Invest $invest): static
    {
        if ($this->invests->removeElement($invest)) {
            // set the owning side to null (unless already changed)
            if ($invest->getUserWallet() === $this) {
                $invest->setUserWallet(null);
            }
        }

        return $this;
    }
}
