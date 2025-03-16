<?php

namespace App\Controller\Api;

use App\Entity\NotificationSettings;
use App\Enum\NotificationStatus;
use App\Repository\NotificationSettingsRepository;
use App\Repository\UserRepository;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

#[Route('/api/notification-settings')]
class NotificationSettingsController extends AbstractController
{
    private UserRepository $userRepository;
    private NotificationSettingsRepository $notificationSettingsRepository;

    public function __construct(
        UserRepository $userRepository,
        NotificationSettingsRepository $notificationSettingsRepository
    ) {
        $this->userRepository = $userRepository;
        $this->notificationSettingsRepository = $notificationSettingsRepository;
    }

    #[Route('/resets', methods: ['POST'])]
    public function resetNotificationSettings(Request $request): JsonResponse
    {
        try {
            $cognitoId = $request->headers->get('X-Cognito-Id');
            $user = $this->userRepository->findOneBy(['cognitoId' => $cognitoId]);
    
            if (!$cognitoId || !$user) {
                throw new \Exception('Utilisateur non authentifié');
            }

            $settings = $this->notificationSettingsRepository->findOneBy(['userId' => $user]);

            if ($settings) {
                return new JsonResponse([
                    'message' => "Les paramètres de notification sont déjà définis."
                ], 200);
            }

            $this->notificationSettingsRepository->resetNotificationSettings($settings, $user);

            return new JsonResponse([
                'message' => "Paramètres de notification réinitialisés"
            ], 201);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/fetch', methods: ['GET'])]
    public function fetchNotificationSettings(Request $request): JsonResponse
    {
        try {
            $cognitoId = $request->headers->get('x-cognito-id');
            $user = $this->userRepository->findOneBy(['cognitoId' => $cognitoId]);

            if (!$cognitoId || !$user) {
                throw new \Exception('Utilisateur non authentifié');
            }

            $settings = $user->getNotificationSettings();

            return new JsonResponse([
                'settings' => [
                    'email_enabled' => $settings->isEmailEnabled(),
                    'sms_enabled' => $settings->isSmsEnabled(),
                    'push_enabled' => $settings->isPushEnabled()
                ]
            ], 201);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }
}
