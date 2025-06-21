<?php

namespace App\Tests\Unit\Service\Mail;

use App\Service\Mail\MailService;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Twig\Environment;

class MailServiceTest extends TestCase
{
    private MailService $mailService;
    private MailerInterface $mailer;
    private Environment $twig;

    protected function setUp(): void
    {
        // Créer les mocks
        $this->mailer = $this->createMock(MailerInterface::class);
        $this->twig = $this->createMock(Environment::class);

        // Créer l'instance de MailService avec les mocks
        $this->mailService = new MailService($this->mailer, $this->twig);
    }

    public function testSendVerificationEmail(): void
    {
        // Arrange
        $email = 'test@example.com';
        $fullName = 'John Doe';
        $verificationCode = '123456';
        $htmlContent = '<html>Votre code de vérification est : 123456</html>';

        // Configurer le mock Twig
        $this->twig
            ->expects($this->once())
            ->method('render')
            ->with('emails/verification.html.twig', [
                'code' => $verificationCode,
                'fullName' => $fullName
            ])
            ->willReturn($htmlContent);

        // Configurer le mock Mailer
        $this->mailer
            ->expects($this->once())
            ->method('send')
            ->with($this->callback(function (Email $email) use ($htmlContent) {
                return $email->getHtmlBody() === $htmlContent
                    && $email->getSubject() === 'Confirmation de votre compte Prospero'
                    && $email->getFrom()[0]->getAddress() === 'no-reply@tryprospero.fr'
                    && $email->getFrom()[0]->getName() === 'Prospero';
            }));

        // Act
        $this->mailService->sendVerificationEmail($email, $fullName, $verificationCode);
    }

    public function testSendWelcomeEmail(): void
    {
        // Arrange
        $email = 'test@example.com';
        $fullName = 'John Doe';
        $htmlContent = '<html>Bienvenue sur Prospero</html>';

        // Configurer le mock Twig
        $this->twig
            ->expects($this->once())
            ->method('render')
            ->with('emails/welcome.html.twig', [
                'fullName' => $fullName
            ])
            ->willReturn($htmlContent);

        // Configurer le mock Mailer
        $this->mailer
            ->expects($this->once())
            ->method('send')
            ->with($this->callback(function (Email $email) use ($htmlContent) {
                return $email->getHtmlBody() === $htmlContent
                    && $email->getSubject() === 'Bienvenue sur Prospero';
            }));

        // Act
        $this->mailService->sendWelcomeEmail($email, $fullName);
    }

    public function testSendPasswordResetEmail(): void
    {
        // Arrange
        $email = 'test@example.com';
        $resetCode = '654321';
        $htmlContent = '<html>Votre code de réinitialisation est : 654321</html>';

        // Configurer le mock Twig
        $this->twig
            ->expects($this->once())
            ->method('render')
            ->with('emails/password_reset.html.twig', [
                'code' => $resetCode
            ])
            ->willReturn($htmlContent);

        // Configurer le mock Mailer
        $this->mailer
            ->expects($this->once())
            ->method('send')
            ->with($this->callback(function (Email $email) use ($htmlContent) {
                return $email->getHtmlBody() === $htmlContent
                    && $email->getSubject() === 'Réinitialisation de votre mot de passe Prospero';
            }));

        // Act
        $this->mailService->sendPasswordResetEmail($email, $resetCode);
    }
}
