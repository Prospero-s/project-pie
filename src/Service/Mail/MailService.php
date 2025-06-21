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

    public function __construct(
        MailerInterface $mailer,
        Environment $twig
    ) {
        $this->mailer = $mailer;
        $this->twig = $twig;
        $this->sender = 'postmaster@tryprospero.fr';
        $this->fromAddress = new Address('no-reply@tryprospero.fr', 'Prospero');
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
