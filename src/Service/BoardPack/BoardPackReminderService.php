<?php

namespace App\Service\BoardPack;

use App\Entity\Company;
use App\Entity\Document;
use App\Entity\User;
use App\Repository\CompanyRepository;
use App\Repository\DocumentRepository;
use App\Repository\UserRepository;
use App\Service\Mail\MailService;

class BoardPackReminderService
{
    public function __construct(
        private CompanyRepository $companyRepository,
        private DocumentRepository $documentRepository,
        private UserRepository $userRepository,
        private MailService $mailService
    ) {
    }

    /**
     * Vérifie et envoie les rappels pour les Board Packs manquants
     */
    public function checkAndSendReminders(): void
    {
        $currentDate = new \DateTime();
        
        // Vérifier les rappels trimestriels
        $this->checkQuarterlyReminders($currentDate);
        
        // Vérifier les rappels semestriels
        $this->checkSemesterReminders($currentDate);
        
        // Vérifier les rappels annuels
        $this->checkYearlyReminders($currentDate);
    }

    /**
     * Vérifie les rappels trimestriels
     */
    private function checkQuarterlyReminders(\DateTime $currentDate): void
    {
        $currentYear = (int) $currentDate->format('Y');
        $currentQuarter = $this->getCurrentQuarter($currentDate);
        
        // Date limite pour le trimestre (fin du mois suivant)
        $dueDate = $this->getQuarterDueDate($currentYear, $currentQuarter);
        
        // Si nous sommes passés la date limite, envoyer des rappels
        if ($currentDate > $dueDate) {
            $this->sendRemindersForPeriod($currentYear, 'Q' . $currentQuarter, 'trimestriel', $dueDate);
        }
    }

    /**
     * Vérifie les rappels semestriels
     */
    private function checkSemesterReminders(\DateTime $currentDate): void
    {
        $currentYear = (int) $currentDate->format('Y');
        $currentSemester = $this->getCurrentSemester($currentDate);
        
        // Date limite pour le semestre (fin du mois suivant)
        $dueDate = $this->getSemesterDueDate($currentYear, $currentSemester);
        
        // Si nous sommes passés la date limite, envoyer des rappels
        if ($currentDate > $dueDate) {
            $this->sendRemindersForPeriod($currentYear, 'H' . $currentSemester, 'semestriel', $dueDate);
        }
    }

    /**
     * Vérifie les rappels annuels
     */
    private function checkYearlyReminders(\DateTime $currentDate): void
    {
        $currentYear = (int) $currentDate->format('Y');
        
        // Date limite pour l'année (fin mars de l'année suivante)
        $dueDate = new \DateTime(($currentYear + 1) . '-03-31');
        
        // Si nous sommes passés la date limite, envoyer des rappels
        if ($currentDate > $dueDate) {
            $this->sendRemindersForPeriod($currentYear, (string) $currentYear, 'annuel', $dueDate);
        }
    }

    /**
     * Envoie des rappels pour une période donnée
     */
    private function sendRemindersForPeriod(int $year, string $period, string $periodType, \DateTime $dueDate): void
    {
        $companies = $this->companyRepository->findAll();
        $companiesWithDocuments = [];
        $companiesWithoutDocuments = [];

        foreach ($companies as $company) {
            $hasDocument = $this->hasDocumentForPeriod($company, $year, $period);
            
            if ($hasDocument) {
                $companiesWithDocuments[] = $company;
            } else {
                $companiesWithoutDocuments[] = $company;
            }
        }

        // Envoyer des rappels pour les entreprises sans Board Pack
        foreach ($companiesWithoutDocuments as $company) {
            $this->sendReminderForCompany($company, $periodType, $dueDate, $companiesWithDocuments, $companies);
        }
    }

    /**
     * Vérifie si une entreprise a un document pour une période donnée
     */
    private function hasDocumentForPeriod(Company $company, int $year, string $period): bool
    {
        $documents = $this->documentRepository->findByCompanyAndYear($company, $year);
        
        foreach ($documents as $document) {
            if ($this->documentMatchesPeriod($document, $period)) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Vérifie si un document correspond à une période
     */
    private function documentMatchesPeriod(Document $document, string $period): bool
    {
        $periodicity = $document->getPeriodicity();
        
        // Pour les documents trimestriels
        if ($periodicity === 'Q' && str_starts_with($period, 'Q')) {
            return true; // Simplifié : tout document trimestriel correspond
        }
        
        // Pour les documents semestriels
        if ($periodicity === 'H' && str_starts_with($period, 'H')) {
            return true; // Simplifié : tout document semestriel correspond
        }
        
        // Pour les documents annuels
        if ($periodicity === 'Y' && is_numeric($period)) {
            return true; // Simplifié : tout document annuel correspond
        }
        
        return false;
    }

    /**
     * Envoie un rappel pour une entreprise spécifique
     *
     * @param array<Company> $companiesWithDocuments
     * @param array<Company> $allCompanies
     */
    private function sendReminderForCompany(
        Company $company,
        string $periodType,
        \DateTime $dueDate,
        array $companiesWithDocuments,
        array $allCompanies
    ): void {
        // Récupérer les utilisateurs administrateurs pour cette entreprise
        $admins = $this->getCompanyAdmins($company);
        
        foreach ($admins as $admin) {
            // Déterminer le type de rappel à envoyer
            $completionRate = count($allCompanies) > 0 ? count($companiesWithDocuments) / count($allCompanies) : 0;
            
            if ($completionRate > 0.5) {
                // Plus de 50% des entreprises ont déposé leurs Board Packs - envoyer un email incitatif
                $this->mailService->sendBoardPackIncentiveEmail(
                    $admin->getEmail(),
                    $admin->getName(),
                    $company->getDenomination(),
                    count($companiesWithDocuments),
                    count($allCompanies)
                );
            } else {
                // Rappel normal
                $this->mailService->sendBoardPackReminderEmail(
                    $admin->getEmail(),
                    $admin->getName(),
                    $company->getDenomination(),
                    $periodType,
                    $dueDate
                );
            }
        }
    }

    /**
     * Récupère les administrateurs d'une entreprise
     *
     * @return array<User>
     */
    private function getCompanyAdmins(Company $company): array
    {
        // Pour l'instant, retourner tous les utilisateurs ayant des investissements dans cette entreprise
        // TODO: Améliorer pour ne récupérer que les administrateurs réels de l'entreprise
        $users = $this->userRepository->findAll();
        $admins = [];
        
        foreach ($users as $user) {
            // Vérifier si l'utilisateur a des investissements dans cette entreprise
            $investments = $user->getInvestments();
            foreach ($investments as $investment) {
                if ($investment->getCompany() === $company) {
                    $admins[] = $user;
                    break;
                }
            }
        }
        
        // Si aucun admin trouvé, retourner tous les utilisateurs du système
        if (empty($admins)) {
            $admins = $this->userRepository->findAll();
        }
        
        return $admins;
    }

    /**
     * Détermine le trimestre actuel
     */
    private function getCurrentQuarter(\DateTime $date): int
    {
        $month = (int) $date->format('n');
        
        return match (true) {
            $month <= 3 => 1,
            $month <= 6 => 2,
            $month <= 9 => 3,
            default => 4,
        };
    }

    /**
     * Détermine le semestre actuel
     */
    private function getCurrentSemester(\DateTime $date): int
    {
        $month = (int) $date->format('n');
        
        return $month <= 6 ? 1 : 2;
    }

    /**
     * Calcule la date limite pour un trimestre
     */
    private function getQuarterDueDate(int $year, int $quarter): \DateTime
    {
        $endMonth = $quarter * 3;
        $dueMonth = $endMonth + 1; // Mois suivant la fin du trimestre
        
        if ($dueMonth > 12) {
            $year++;
            $dueMonth = 1;
        }
        
        return new \DateTime("$year-$dueMonth-31");
    }

    /**
     * Calcule la date limite pour un semestre
     */
    private function getSemesterDueDate(int $year, int $semester): \DateTime
    {
        $endMonth = $semester * 6;
        $dueMonth = $endMonth + 1; // Mois suivant la fin du semestre
        
        if ($dueMonth > 12) {
            $year++;
            $dueMonth = 1;
        }
        
        return new \DateTime("$year-$dueMonth-31");
    }

}