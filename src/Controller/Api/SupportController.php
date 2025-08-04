<?php

namespace App\Controller\Api;

use App\Service\Mail\MailService;
use App\Service\User\UserService;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/support', name: 'api_support_')]
class SupportController extends AbstractController
{
    public function __construct(
        private MailService $mailService,
        private UserService $userService,
        private LoggerInterface $logger
    ) {
    }

    #[Route('/submit', name: 'submit', methods: ['POST'])]
    public function submitSupportRequest(Request $request): JsonResponse
    {
        try {
            $cognitoId = $request->headers->get('x-cognito-id');
            $email = $request->headers->get('x-cognito-email');
            $name = $request->headers->get('x-cognito-name');

            if (!$cognitoId || !$email) {
                $this->logger->warning('Support request failed: Missing authentication headers', [
                    'cognitoId' => $cognitoId ? 'present' : 'missing',
                    'email' => $email ? 'present' : 'missing'
                ]);
                return $this->json(['error' => 'Missing authentication headers'], Response::HTTP_UNAUTHORIZED);
            }

            $data = json_decode($request->getContent(), true);

            if (!isset($data['title']) || !isset($data['description'])) {
                $this->logger->warning('Support request failed: Missing required fields', [
                    'hasTitle' => isset($data['title']),
                    'hasDescription' => isset($data['description']),
                    'userEmail' => $email
                ]);
                return $this->json(['error' => 'Missing required fields'], Response::HTTP_BAD_REQUEST);
            }

            $title = trim($data['title']);
            $description = trim($data['description']);

            if (empty($title)) {
                return $this->json(['error' => 'Title is required'], Response::HTTP_BAD_REQUEST);
            }

            if (empty($description)) {
                return $this->json(['error' => 'Description is required'], Response::HTTP_BAD_REQUEST);
            }

            // Récupérer le nom d'utilisateur depuis l'auth (priorité : name du token, sinon email)
            $userName = !empty($name) ? $name : $email;

            // Récupérer ou créer l'utilisateur
            $user = $this->userService->getOrCreateUser($cognitoId, $email, $name);

            $this->logger->info('Attempting to send support request email', [
                'userEmail' => $email,
                'userName' => $userName,
                'title' => $title
            ]);

            // Envoyer les emails avec le titre et la description
            $this->mailService->sendSupportRequestEmail(
                $email,
                $userName,
                $title,
                $description
            );

            $this->logger->info('Support request email sent successfully', [
                'userEmail' => $email,
                'userName' => $userName,
                'title' => $title
            ]);

            return $this->json([
                'message' => 'Support request submitted successfully',
                'reference' => 'SUP-' . date('YmdHis')
            ], Response::HTTP_OK);

        } catch (\Exception $e) {
            $this->logger->error('Support request failed with exception', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'email' => $email ?? 'unknown',
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            
            return $this->json([
                'error' => 'Internal server error',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
} 