<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\Entity\UserGroup;
use App\Entity\GroupInvitation;
use App\Repository\UserGroupRepository;
use App\Repository\UserRepository;
use App\Repository\GroupInvitationRepository;
use App\Service\User\UserService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/user-groups')]
class UserGroupController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private UserGroupRepository $userGroupRepository,
        private UserRepository $userRepository,
        private UserService $userService,
        private GroupInvitationRepository $invitationRepository
    ) {}

    #[Route('', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        try {
            $cognitoId = $request->headers->get('x-cognito-id');
            $email = $request->headers->get('x-cognito-email');
            
            if (!$cognitoId || !$email) {
                return $this->json([
                    'error' => 'Unauthorized: Missing required headers'
                ], Response::HTTP_UNAUTHORIZED);
            }

            $user = $this->userService->getOrCreateUser($cognitoId, $email);
            
            if (!$user) {
                return $this->json([
                    'error' => 'User not found'
                ], Response::HTTP_NOT_FOUND);
            }

            $group = $user->getUserGroup();
            if (!$group) {
                return $this->json(['groups' => []]);
            }

            return $this->json([
                'groups' => [[
                    'id' => $group->getId(),
                    'name' => $group->getName(),
                    'owner' => [
                        'id' => $group->getOwner()->getId(),
                        'email' => $group->getOwner()->getEmail()
                    ],
                    'members' => array_map(fn($member) => [
                        'id' => $member->getId(),
                        'email' => $member->getEmail()
                    ], $group->getUsers()->toArray())
                ]]
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Une erreur est survenue',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        try {
            $cognitoId = $request->headers->get('x-cognito-id');
            $email = $request->headers->get('x-cognito-email');
            
            if (!$cognitoId || !$email) {
                return $this->json([
                    'error' => 'Unauthorized: Missing required headers'
                ], Response::HTTP_UNAUTHORIZED);
            }

            $data = json_decode($request->getContent(), true);
            $owner = $this->userService->getOrCreateUser($cognitoId, $email);
            
            $this->entityManager->beginTransaction();
            try {
                $group = $this->userGroupRepository->createGroup($data['name'], $owner);
                
                // Gérer les invitations
                if (!empty($data['invitations'])) {
                    foreach ($data['invitations'] as $invitationData) {
                        if (!filter_var($invitationData['email'], FILTER_VALIDATE_EMAIL)) {
                            throw new \Exception('invalid-email');
                        }
                        
                        $existingInvitation = $this->invitationRepository->findExistingInvitation($invitationData['email'], $group);
                        if ($existingInvitation) {
                            throw new \Exception('invitation-exists');
                        }
                        
                        $this->invitationRepository->createInvitation($group, $invitationData['email'], $owner);
                    }
                }
                
                $this->entityManager->flush();
                $this->entityManager->commit();
                
                return $this->json([
                    'id' => $group->getId(),
                    'name' => $group->getName(),
                    'owner' => [
                        'id' => $owner->getId(),
                        'email' => $owner->getEmail()
                    ]
                ], Response::HTTP_CREATED);
                
            } catch (\Exception $e) {
                $this->entityManager->rollback();
                throw $e;
            }
        } catch (\Exception $e) {
            return $this->json([
                'error' => $e->getMessage()
            ], Response::HTTP_BAD_REQUEST);
        }
    }

    #[Route('/{id}/members', methods: ['POST'])]
    public function addMember(int $id, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $cognitoId = $request->headers->get('x-cognito-id');
        
        if (!$cognitoId) {
            return $this->json([
                'error' => 'Unauthorized: Missing cognito ID'
            ], Response::HTTP_UNAUTHORIZED);
        }
        
        try {
            $group = $this->userGroupRepository->findGroupWithMembers($id);
            if (!$group) {
                return $this->json(['error' => 'Group not found'], Response::HTTP_NOT_FOUND);
            }

            $currentUser = $this->userRepository->findByCognitoId($cognitoId);
            if (!$currentUser || $group->getOwner()->getId() !== $currentUser->getId()) {
                return $this->json(['error' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
            }

            $newMember = $this->userRepository->findByEmail($data['email']);
            if (!$newMember) {
                return $this->json(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
            }

            $this->userGroupRepository->addMemberToGroup($group, $newMember);
            $this->entityManager->flush();

            return $this->json([
                'id' => $group->getId(),
                'members' => array_map(fn($member) => [
                    'id' => $member->getId(),
                    'email' => $member->getEmail()
                ], $group->getUsers()->toArray())
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Une erreur est survenue',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}/members/{memberId}', methods: ['DELETE'])]
    public function removeMember(UserGroup $group, int $memberId, Request $request): JsonResponse
    {
        $cognitoId = $request->headers->get('x-cognito-id');
        
        if (!$cognitoId) {
            return $this->json([
                'error' => 'Unauthorized: Missing cognito ID'
            ], Response::HTTP_UNAUTHORIZED);
        }
        
        try {
            $currentUser = $this->userRepository->findByCognitoId($cognitoId);
            if (!$currentUser || $group->getOwner()->getId() !== $currentUser->getId()) {
                return $this->json(['error' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
            }

            $memberToRemove = $this->userRepository->find($memberId);
            if (!$memberToRemove) {
                return $this->json(['error' => 'Member not found'], Response::HTTP_NOT_FOUND);
            }

            if ($memberToRemove->getId() === $currentUser->getId()) {
                return $this->json(['error' => 'Cannot remove owner from group'], Response::HTTP_BAD_REQUEST);
            }

            $group->removeUser($memberToRemove);
            $this->entityManager->flush();

            return $this->json([
                'id' => $group->getId(),
                'members' => array_map(fn($member) => [
                    'id' => $member->getId(),
                    'email' => $member->getEmail()
                ], $group->getUsers()->toArray())
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Une erreur est survenue',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', methods: ['GET'])]
    public function show(int $id, Request $request): JsonResponse
    {
        $cognitoId = $request->headers->get('x-cognito-id');
        $email = $request->headers->get('x-cognito-email');
        
        if (!$cognitoId) {
            return $this->json([
                'error' => 'Unauthorized: Missing cognito ID'
            ], Response::HTTP_UNAUTHORIZED);
        }
        
        try {
            $user = $this->userService->getOrCreateUser($cognitoId, $email);
            $group = $this->userGroupRepository->findGroupWithMembersAndInvestments($id);
            
            if (!$group) {
                return $this->json(['error' => 'Group not found'], Response::HTTP_NOT_FOUND);
            }
            
            if (!$group->getUsers()->contains($user)) {
                return $this->json(['error' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
            }

            $members = $group->getUsers();
            $investments = [];
            
            foreach ($members as $member) {
                foreach ($member->getInvestments() as $investment) {
                    $investments[] = [
                        'id' => $investment->getId(),
                        'companyName' => $investment->getCompany()->getDenomination(),
                        'amount' => $investment->getAmount(),
                        'currency' => $investment->getCurrency(),
                        'fundingType' => $investment->getFundingType(),
                        'investedAt' => $investment->getInvestedAt()->format('Y-m-d H:i:s'),
                        'investor' => [
                            'id' => $member->getId(),
                            'email' => $member->getEmail()
                        ]
                    ];
                }
            }

            return $this->json([
                'id' => $group->getId(),
                'name' => $group->getName(),
                'owner' => [
                    'id' => $group->getOwner()->getId(),
                    'email' => $group->getOwner()->getEmail()
                ],
                'members' => array_map(fn($member) => [
                    'id' => $member->getId(),
                    'email' => $member->getEmail()
                ], $members->toArray()),
                'investments' => $investments,
                'createdAt' => $group->getCreatedAt()->format('Y-m-d H:i:s')
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Une erreur est survenue',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
} 