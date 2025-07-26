<?php

namespace App\Command;

use App\Service\Mail\MailService;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:test-email',
    description: 'Test email sending functionality',
)]
class TestEmailCommand extends Command
{
    public function __construct(
        private MailService $mailService
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addArgument('email', InputArgument::REQUIRED, 'Email address to send test to')
            ->addArgument('name', InputArgument::OPTIONAL, 'Name of recipient', 'Test User');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $email = $input->getArgument('email');
        $name = $input->getArgument('name');

        $io->title('Test Email Sending');

        try {
            $io->info('Sending test support email...');
            
            $this->mailService->sendSupportRequestEmail(
                $email,
                $name,
                'Test depuis commande Symfony',
                'Ceci est un email de test envoyé depuis une commande Symfony pour vérifier que le système fonctionne correctement.'
            );

            $io->success('Email sent successfully!');
            $io->note('Check your mailbox (and spam folder) for the email.');

            return Command::SUCCESS;

        } catch (\Exception $e) {
            $io->error('Failed to send email: ' . $e->getMessage());
            $io->note('Error details: ' . $e->getTraceAsString());
            
            return Command::FAILURE;
        }
    }
} 