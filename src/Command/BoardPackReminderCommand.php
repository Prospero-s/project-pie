<?php

namespace App\Command;

use App\Service\BoardPack\BoardPackReminderService;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:board-pack:check-reminders',
    description: 'Vérifie et envoie les rappels pour les Board Packs manquants',
)]
class BoardPackReminderCommand extends Command
{
    public function __construct(
        private BoardPackReminderService $reminderService
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $io->title('Vérification des rappels Board Pack');

        try {
            $this->reminderService->checkAndSendReminders();
            
            $io->success('Vérification des rappels terminée avec succès');
            
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $io->error('Erreur lors de la vérification des rappels: ' . $e->getMessage());
            
            return Command::FAILURE;
        }
    }
} 