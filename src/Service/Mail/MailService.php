<?php

namespace App\Service\Mail;

use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Mime\Address;
use Twig\Environment;

class MailService
{
    private MailerInterface $mailer;
    private Environment $twig;
    private string $sender;
    private Address $fromAddress;
    private string $supportEmail;

    public function __construct(
        MailerInterface $mailer,
        Environment $twig
    ) {
        $this->mailer = $mailer;
        $this->twig = $twig;
        $this->sender = 'postmaster@tryprospero.fr';
        $this->fromAddress = new Address('no-reply@tryprospero.fr', 'Prospero');
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
        // Email à l'équipe support
        $supportSubject = 'Nouvelle demande de support - ' . $title;
        $supportHtmlContent = $this->twig->render('emails/support_team.html.twig', [
            'userName' => $userName,
            'userEmail' => $userEmail,
            'title' => $title,
            'description' => $description,
            'submittedAt' => new \DateTime()
        ]);

        $this->sendEmail($this->supportEmail, $supportSubject, $supportHtmlContent);

        // Email de confirmation à l'utilisateur
        $userSubject = 'Confirmation de votre demande de support - ' . $title;
        $userHtmlContent = $this->twig->render('emails/support_confirmation.html.twig', [
            'userName' => $userName,
            'title' => $title,
            'description' => $description,
            'submittedAt' => new \DateTime()
        ]);

        $this->sendEmail($userEmail, $userSubject, $userHtmlContent);
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
        $email = (new Email())
            ->from($this->fromAddress)
            ->sender($this->sender)
            ->to($to)
            ->subject($subject)
            ->html($htmlContent);

        $this->mailer->send($email);
    }
}
