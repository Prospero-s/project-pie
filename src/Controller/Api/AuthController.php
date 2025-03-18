<?php

namespace App\Controller\Api;

use App\Repository\VerificationCodeRepository;
use App\Service\Mail\MailService;
use App\Service\User\AwsCognitoService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api', name: 'api_auth_')]
class AuthController extends AbstractController
{
    private MailService $mailService;
    private VerificationCodeRepository $verificationCodeRepository;
    private AwsCognitoService $cognitoService;

    public function __construct(
        MailService $mailService,
        VerificationCodeRepository $verificationCodeRepository,
        AwsCognitoService $cognitoService
    ) {
        $this->mailService = $mailService;
        $this->verificationCodeRepository = $verificationCodeRepository;
        $this->cognitoService = $cognitoService;
    }

    #[Route('/auth/send-verification-code', name: 'send_verification_code', methods: ['POST'])]
    public function sendVerificationCode(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['email']) || !isset($data['fullName'])) {
            return $this->json(['error' => 'Données manquantes'], 400);
        }
        
        try {
            $verificationCode = $this->verificationCodeRepository->createVerificationCode(
                $data['email'],
                $data['fullName'],
                'SIGNUP'
            );
            
            $this->mailService->sendVerificationEmail(
                $data['email'],
                $data['fullName'],
                $verificationCode->getCode()
            );
            
            return $this->json(['success' => true]);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Erreur lors de l\'envoi de l\'email: ' . $e->getMessage()], 500);
        }
    }

    #[Route('/auth/verify-code', name: 'verify_code', methods: ['POST'])]
    public function verifyCode(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['email']) || !isset($data['code'])) {
            return $this->json(['error' => 'Données manquantes'], 400);
        }
        
        try {
            $verificationCode = $this->verificationCodeRepository->findValidCode(
                $data['email'],
                $data['code'],
                'SIGNUP'
            );
            
            if (!$verificationCode) {
                return $this->json(['error' => 'Code invalide ou expiré'], 400);
            }
            
            $email = $verificationCode->getEmail();
            $fullName = $verificationCode->getFullName();
            
            $this->cognitoService->adminConfirmSignUp($email);
            
            $this->verificationCodeRepository->remove($verificationCode, true);
            
            try {
                $this->mailService->sendWelcomeEmail($email, $fullName);
            } catch (\Exception $emailError) {
                error_log('Erreur lors de l\'envoi de l\'email de bienvenue: ' . $emailError->getMessage());
            }
            
            return $this->json(['success' => true]);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Erreur lors de la vérification: ' . $e->getMessage()], 500);
        }
    }

    #[Route('/auth/send-welcome-email', name: 'send_welcome_email', methods: ['POST'])]
    public function sendWelcomeEmail(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['email']) || !isset($data['fullName'])) {
            return $this->json(['error' => 'Données manquantes'], 400);
        }
        
        try {
            // Vérifier si l'utilisateur existait déjà dans Cognito avant cette connexion
            $userExistedBefore = $this->cognitoService->userExistsByEmail($data['email']);
            
            // Envoyer l'email de bienvenue uniquement si c'est un nouvel utilisateur
            if (!$userExistedBefore) {
                $this->mailService->sendWelcomeEmail(
                    $data['email'],
                    $data['fullName']
                );
                return $this->json(['success' => true, 'emailSent' => true]);
            }
            
            return $this->json(['success' => true, 'emailSent' => false, 'reason' => 'Utilisateur existant']);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Erreur lors de l\'envoi de l\'email: ' . $e->getMessage()], 500);
        }
    }

    #[Route('/auth/send-reset-password', name: 'send_reset_password', methods: ['POST'])]
    public function sendResetPassword(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['email'])) {
            return $this->json(['error' => 'Données manquantes'], 400);
        }
        
        try {
            $this->verificationCodeRepository->removeAllPreviousCodes($data['email'], 'RESET_PASSWORD');
            
            $verificationCode = $this->verificationCodeRepository->createVerificationCode(
                $data['email'],
                'Utilisateur',
                'RESET_PASSWORD'
            );
            
            $verificationCode->setExpiresAt(
                (new \DateTimeImmutable())->modify('+1 hour')
            );
            $this->verificationCodeRepository->save($verificationCode, true);
            
            $this->mailService->sendPasswordResetEmail(
                $data['email'],
                $verificationCode->getCode()
            );
            
            return $this->json(['success' => true]);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Erreur lors de l\'envoi de l\'email: ' . $e->getMessage()], 500);
        }
    }

    #[Route('/auth/check-verification-code/{email}', name: 'check_verification_code', methods: ['GET'])]
    public function checkVerificationCode(string $email): JsonResponse
    {
        try {
            $hasValidCode = $this->verificationCodeRepository->hasValidCode($email, 'SIGNUP');
            
            return $this->json(['hasValidCode' => $hasValidCode]);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Erreur lors de la vérification: ' . $e->getMessage()], 500);
        }
    }

    #[Route('/auth/update-password', name: 'update_password', methods: ['POST'])]
    public function updatePassword(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        $email = $data['email'];
        $code = $data['code'];
        $newPassword = $data['newPassword'];
        
        try {
            $verificationCode = $this->verificationCodeRepository->findValidCode(
                $email,
                $code,
                'RESET_PASSWORD'
            );
            
            if (!$verificationCode) {
                return $this->json(['error' => 'Code invalide ou expiré'], 400);
            }
            
            $verificationCode->setIsUsed(true);
            $this->verificationCodeRepository->save($verificationCode, true);
            
            try {
                $this->cognitoService->setUserPassword($email, $newPassword);
                
                return $this->json(['success' => true]);
            } catch (\Exception $e) {
                return $this->json([
                    'error' => 'Erreur lors de la mise à jour du mot de passe: ' . $e->getMessage()
                ], 500);
            }
        } catch (\Exception $e) {
            return $this->json(['error' => 'Erreur lors de la réinitialisation: ' . $e->getMessage()], 500);
        }
    }
} 