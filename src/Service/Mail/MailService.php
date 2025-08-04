<?php

namespace App\Service\Mail;

use Psr\Log\LoggerInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Mime\Address;
use Twig\Environment;

class MailService
{
    private MailerInterface $mailer;
    private Environment $twig;
    private LoggerInterface $logger;
    private string $sender;
    private Address $fromAddress;
    private string $supportEmail;

    public function __construct(
        MailerInterface $mailer,
        Environment $twig,
        LoggerInterface $logger
    ) {
        $this->mailer = $mailer;
        $this->twig = $twig;
        $this->logger = $logger;
        $this->sender = 'postmaster@tryprospero.fr';
        $this->fromAddress = new Address('postmaster@tryprospero.fr', 'Prospero');
        $this->supportEmail = 'tryprospero@gmail.com';
    }

    public function sendVerificationEmail(string $email, string $fullName, string $verificationCode): void
    {
        $subject = 'Confirmation de votre compte Prospero';
        $htmlContent = $this->twig->render('emails/verification.html.twig', [
            'code' => $verificationCode,
            'fullName' => $fullName
        ]);

        $this->sendEmail($email, $subject, $htmlContent);
    }

    public function sendWelcomeEmail(string $email, string $fullName): void
    {
        $subject = 'Bienvenue sur Prospero';
        $htmlContent = $this->twig->render('emails/welcome.html.twig', [
            'fullName' => $fullName
        ]);

        $this->sendEmail($email, $subject, $htmlContent);
    }

    public function sendPasswordResetEmail(string $email, string $resetCode): void
    {
        $subject = 'Réinitialisation de votre mot de passe Prospero';
        $htmlContent = $this->twig->render('emails/password_reset.html.twig', [
            'code' => $resetCode
        ]);

        $this->sendEmail($email, $subject, $htmlContent);
    }

    public function sendGroupInvitationEmail(
        string $email, 
        string $groupName, 
        string $inviterName, 
        string $invitationLink
    ): void {
        $subject = "Invitation à rejoindre l'organisation $groupName sur Prospero";
        $htmlContent = $this->twig->render('emails/group_invitation.html.twig', [
            'groupName' => $groupName,
            'inviterName' => $inviterName,
            'invitationLink' => $invitationLink
        ]);

        $this->sendEmail($email, $subject, $htmlContent);
    }

    public function sendSupportRequestEmail(
        string $userEmail,
        string $userName,
        string $title,
        string $description
    ): void {
        try {
            $this->logger->info('Starting to send support request emails', [
                'userEmail' => $userEmail,
                'userName' => $userName,
                'title' => $title,
                'supportEmail' => $this->supportEmail
            ]);

            // Email à l'équipe support
            $supportSubject = 'Nouvelle demande de support - ' . $title;
            $supportHtmlContent = $this->twig->render('emails/support_team.html.twig', [
                'userName' => $userName,
                'userEmail' => $userEmail,
                'title' => $title,
                'description' => $description,
                'submittedAt' => new \DateTime()
            ]);

            $this->logger->info('Sending support team email', [
                'to' => $this->supportEmail,
                'subject' => $supportSubject
            ]);

            $this->sendEmail($this->supportEmail, $supportSubject, $supportHtmlContent);

            $this->logger->info('Support team email sent successfully');

            // Email de confirmation à l'utilisateur
            $userSubject = 'Confirmation de votre demande de support - ' . $title;
            $userHtmlContent = $this->twig->render('emails/support_confirmation.html.twig', [
                'userName' => $userName,
                'title' => $title,
                'description' => $description,
                'submittedAt' => new \DateTime()
            ]);

            $this->logger->info('Sending user confirmation email', [
                'to' => $userEmail,
                'subject' => $userSubject
            ]);

            $this->sendEmail($userEmail, $userSubject, $userHtmlContent);

            $this->logger->info('User confirmation email sent successfully');

        } catch (\Exception $e) {
            $this->logger->error('Failed to send support request emails', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'userEmail' => $userEmail,
                'userName' => $userName,
                'title' => $title
            ]);
            throw $e;
        }
    }

    public function sendBoardPackReminderEmail(
        string $email,
        string $userName,
        string $companyName,
        string $periodType,
        \DateTime $dueDate
    ): void {
        $subject = "Rappel : Board Pack $periodType attendu pour $companyName";
        $htmlContent = $this->twig->render('emails/board_pack_reminder.html.twig', [
            'userName' => $userName,
            'companyName' => $companyName,
            'periodType' => $periodType,
            'dueDate' => $dueDate
        ]);

        $this->sendEmail($email, $subject, $htmlContent);
    }

    public function sendBoardPackIncentiveEmail(
        string $email,
        string $userName,
        string $companyName,
        int $companiesUploaded,
        int $totalCompanies
    ): void {
        $subject = "Rappel urgent : Board Pack en attente pour $companyName";
        $htmlContent = $this->twig->render('emails/board_pack_incentive.html.twig', [
            'userName' => $userName,
            'companyName' => $companyName,
            'companiesUploaded' => $companiesUploaded,
            'totalCompanies' => $totalCompanies
        ]);

        $this->sendEmail($email, $subject, $htmlContent);
    }

    private function sendEmail(string $to, string $subject, string $htmlContent): void
    {
        try {
            $this->logger->info('Preparing to send email', [
                'to' => $to,
                'subject' => $subject,
                'from' => $this->fromAddress->getAddress(),
                'sender' => $this->sender
            ]);

            $email = (new Email())
                ->from($this->fromAddress)
                ->sender($this->sender)
                ->to($to)
                ->subject($subject)
                ->html($htmlContent);

            $this->mailer->send($email);

            $this->logger->info('Email sent successfully', [
                'to' => $to,
                'subject' => $subject
            ]);

        } catch (\Exception $e) {
            $this->logger->error('Failed to send email', [
                'to' => $to,
                'subject' => $subject,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'from' => $this->fromAddress->getAddress(),
                'sender' => $this->sender
            ]);
            throw $e;
        }
    }
}
