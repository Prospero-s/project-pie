<?php

namespace App\Controller\Api;

use App\Entity\GroupInvitation;
use App\Entity\UserGroup;
use App\Entity\User;
use App\Repository\GroupInvitationRepository;
use App\Repository\UserRepository;
use App\Service\User\UserService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/group-invitations')]
class GroupInvitationController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private GroupInvitationRepository $invitationRepository,
        private UserService $userService
    ) {}

    #[Route('', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);
            $cognitoId = $request->headers->get('x-cognito-id');
            $email = $request->headers->get('x-cognito-email');
            
            if (!$cognitoId || !$email) {
                return $this->json(['error' => 'Missing authentication headers'], Response::HTTP_UNAUTHORIZED);
            }

            if (!isset($data['email']) || !isset($data['groupId'])) {
                return $this->json(['error' => 'Missing required fields'], Response::HTTP_BAD_REQUEST);
            }

            // Validation de l'email
            if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                return $this->json(['error' => 'invalid-email'], Response::HTTP_BAD_REQUEST);
            }

            $user = $this->userService->getOrCreateUser($cognitoId, $email);
            $group = $this->entityManager->getRepository(UserGroup::class)->find($data['groupId']);

            if (!$group) {
                return $this->json(['error' => 'Group not found'], Response::HTTP_NOT_FOUND);
            }

            if ($group->getOwner()->getId() !== $user->getId()) {
                return $this->json(['error' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
            }

            // Vérifier si une invitation existe déjà
            $existingInvitation = $this->invitationRepository->findOneBy([
                'email' => $data['email'],
                'group' => $group
            ]);

            if ($existingInvitation) {
                return $this->json(['error' => 'invitation-exists'], Response::HTTP_BAD_REQUEST);
            }

            $invitation = new GroupInvitation();
            $invitation->setGroup($group);
            $invitation->setEmail($data['email']);
            $invitation->setInvitedBy($user);

            $this->entityManager->persist($invitation);
            $this->entityManager->flush();

            return $this->json([
                'id' => $invitation->getId(),
                'email' => $invitation->getEmail(),
                'token' => $invitation->getToken(),
                'expiresAt' => $invitation->getExpiresAt()->format('Y-m-d H:i:s')
            ], Response::HTTP_CREATED);
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/accept/{token}', methods: ['POST'])]
    public function accept(string $token, Request $request): JsonResponse
    {
        $cognitoId = $request->headers->get('x-cognito-id');
        $email = $request->headers->get('x-cognito-email');
        
        $user = $this->userService->getOrCreateUser($cognitoId, $email);
        $invitation = $this->invitationRepository->findOneBy(['token' => $token]);

        if (!$invitation) {
            return $this->json(['error' => 'Invitation not found'], Response::HTTP_NOT_FOUND);
        }

        if ($invitation->isExpired()) {
            return $this->json(['error' => 'Invitation expired'], Response::HTTP_BAD_REQUEST);
        }

        if ($invitation->getEmail() !== $email) {
            return $this->json(['error' => 'Invalid email'], Response::HTTP_FORBIDDEN);
        }

        $group = $invitation->getGroup();
        $group->addUser($user);

        $this->entityManager->remove($invitation);
        $this->entityManager->flush();

        return $this->json([
            'group' => [
                'id' => $group->getId(),
                'name' => $group->getName(),
                'owner' => [
                    'id' => $group->getOwner()->getId(),
                    'email' => $group->getOwner()->getEmail()
                ]
            ]
        ]);
    }

    #[Route('/pending', methods: ['GET'])]
    public function getPendingInvitations(Request $request): JsonResponse
    {
        try {
            $email = $request->headers->get('x-cognito-email');
            
            if (!$email) {
                return $this->json([
                    'error' => 'Unauthorized: Missing required headers'
                ], Response::HTTP_UNAUTHORIZED);
            }

            $invitations = $this->invitationRepository->findValidInvitationsByEmail($email);

            return $this->json([
                'invitations' => array_map(fn($invitation) => [
                    'id' => $invitation->getId(),
                    'token' => $invitation->getToken(),
                    'group' => [
                        'id' => $invitation->getGroup()->getId(),
                        'name' => $invitation->getGroup()->getName()
                    ],
                    'invitedBy' => [
                        'email' => $invitation->getInvitedBy()->getEmail()
                    ],
                    'expiresAt' => $invitation->getExpiresAt()->format('Y-m-d H:i:s')
                ], $invitations)
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Une erreur est survenue lors du chargement des invitations',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
} 