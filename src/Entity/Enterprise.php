<?php

namespace App\Entity;

use App\Repository\EnterpriseRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: EnterpriseRepository::class)]
class Enterprise
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $denomination = null;

    #[ORM\Column]
    private ?bool $remote_society = null;

    #[ORM\Column]
    private ?bool $established_in_france = null;

    #[ORM\Column(length: 255)]
    private ?string $legal_form = null;

    #[ORM\Column(length: 255)]
    private ?string $main_activity = null;

    #[ORM\Column(length: 255)]
    private ?string $name = null;

    #[ORM\Column]
    private ?int $siret = null;

    #[ORM\Column]
    private ?int $siren = null;

    #[ORM\Column(length: 255)]
    private ?string $code_naf = null;

    #[ORM\Column(length: 255)]
    private ?string $activities = null;

    #[ORM\Column]
    private ?int $capital = null;

    #[ORM\Column]
    private ?int $min_capital = null;

    #[ORM\Column(length: 255)]
    private ?string $currency = null;

    /**
     * @var Collection<int, Invest>
     */
    #[ORM\OneToMany(targetEntity: Invest::class, mappedBy: 'enterprise')]
    private Collection $invests;

    /**
     * @var Collection<int, Reminder>
     */
    #[ORM\OneToMany(targetEntity: Reminder::class, mappedBy: 'enterprise')]
    private Collection $reminders;

    public function __construct()
    {
        $this->invests = new ArrayCollection();
        $this->reminders = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDenomination(): ?string
    {
        return $this->denomination;
    }

    public function setDenomination(string $denomination): static
    {
        $this->denomination = $denomination;

        return $this;
    }

    public function isRemoteSociety(): ?bool
    {
        return $this->remote_society;
    }

    public function setRemoteSociety(bool $remote_society): static
    {
        $this->remote_society = $remote_society;

        return $this;
    }

    public function isEstablishedInFrance(): ?bool
    {
        return $this->established_in_france;
    }

    public function setEstablishedInFrance(bool $established_in_france): static
    {
        $this->established_in_france = $established_in_france;

        return $this;
    }

    public function getLegalForm(): ?string
    {
        return $this->legal_form;
    }

    public function setLegalForm(string $legal_form): static
    {
        $this->legal_form = $legal_form;

        return $this;
    }

    public function getMainActivity(): ?string
    {
        return $this->main_activity;
    }

    public function setMainActivity(string $main_activity): static
    {
        $this->main_activity = $main_activity;

        return $this;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getSiret(): ?int
    {
        return $this->siret;
    }

    public function setSiret(int $siret): static
    {
        $this->siret = $siret;

        return $this;
    }

    public function getSiren(): ?int
    {
        return $this->siren;
    }

    public function setSiren(int $siren): static
    {
        $this->siren = $siren;

        return $this;
    }

    public function getCodeNaf(): ?string
    {
        return $this->code_naf;
    }

    public function setCodeNaf(string $code_naf): static
    {
        $this->code_naf = $code_naf;

        return $this;
    }

    public function getActivities(): ?string
    {
        return $this->activities;
    }

    public function setActivities(string $activities): static
    {
        $this->activities = $activities;

        return $this;
    }

    public function getCapital(): ?int
    {
        return $this->capital;
    }

    public function setCapital(int $capital): static
    {
        $this->capital = $capital;

        return $this;
    }

    public function getMinCapital(): ?int
    {
        return $this->min_capital;
    }

    public function setMinCapital(int $min_capital): static
    {
        $this->min_capital = $min_capital;

        return $this;
    }

    public function getCurrency(): ?string
    {
        return $this->currency;
    }

    public function setCurrency(string $currency): static
    {
        $this->currency = $currency;

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
            $invest->setEnterprise($this);
        }

        return $this;
    }

    public function removeInvest(Invest $invest): static
    {
        if ($this->invests->removeElement($invest)) {
            // set the owning side to null (unless already changed)
            if ($invest->getEnterprise() === $this) {
                $invest->setEnterprise(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Reminder>
     */
    public function getReminders(): Collection
    {
        return $this->reminders;
    }

    public function addReminder(Reminder $reminder): static
    {
        if (!$this->reminders->contains($reminder)) {
            $this->reminders->add($reminder);
            $reminder->setEnterprise($this);
        }

        return $this;
    }

    public function removeReminder(Reminder $reminder): static
    {
        if ($this->reminders->removeElement($reminder)) {
            // set the owning side to null (unless already changed)
            if ($reminder->getEnterprise() === $this) {
                $reminder->setEnterprise(null);
            }
        }

        return $this;
    }
}
