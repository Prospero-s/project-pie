<?php

namespace App\Repository;

use App\Entity\GroupInvitation;
use App\Entity\UserGroup;
use App\Entity\User;
use App\Entity\GroupRole;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\ORM\EntityManagerInterface;

/**
 * @extends ServiceEntityRepository<GroupInvitation>
 */
class GroupInvitationRepository extends ServiceEntityRepository
{
    private EntityManagerInterface $em;

    public function __construct(ManagerRegistry $registry, EntityManagerInterface $em)
    {
        parent::__construct($registry, GroupInvitation::class);
        $this->em = $em;
    }

    /**
     * @param string $email
     * @return list<GroupInvitation>
     */
    public function findValidInvitationsByEmail(string $email): array
    {
        return $this->createQueryBuilder('i')
            ->where('i.email = :email')
            ->andWhere('i.expiresAt > :now')
            ->setParameter('email', $email)
            ->setParameter('now', new \DateTime())
            ->getQuery()
            ->getResult();
    }

    /**
     * @param string $token
     * @return GroupInvitation|null
     */
    public function findValidInvitationByToken(string $token): ?GroupInvitation
    {
        return $this->createQueryBuilder('i')
            ->where('i.token = :token')
            ->andWhere('i.expiresAt > :now')
            ->setParameter('token', $token)
            ->setParameter('now', new \DateTime())
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * @return int
     */
    public function deleteExpiredInvitations(): int
    {
        return $this->createQueryBuilder('i')
            ->delete()
            ->where('i.expiresAt <= :now')
            ->setParameter('now', new \DateTime())
            ->getQuery()
            ->execute();
    }

    /**
     * @param string $email
     * @param UserGroup $group
     * @return GroupInvitation|null
     */
    public function findExistingInvitation(string $email, UserGroup $group): ?GroupInvitation
    {
        return $this->createQueryBuilder('i')
            ->where('i.email = :email')
            ->andWhere('i.group = :group')
            ->setParameter('email', $email)
            ->setParameter('group', $group)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * @param UserGroup $group
     * @param string $email
     * @param User $invitedBy
     * @param string $role
     * @return GroupInvitation
     */
    public function createInvitation(
        UserGroup $group,
        string $email,
        User $invitedBy,
        string $role = GroupRole::ROLE_MEMBER
    ): GroupInvitation {
        $invitation = new GroupInvitation();
        $invitation->setGroup($group);
        $invitation->setEmail($email);
        $invitation->setInvitedBy($invitedBy);
        $invitation->setRole($role);

        $this->em->persist($invitation);

        return $invitation;
    }

    /**
     * @param GroupInvitation $invitation
     * @param User $user
     */
    public function acceptInvitation(GroupInvitation $invitation, User $user): void
    {
        $group = $invitation->getGroup();
        $group->addUser($user);

        // Créer le rôle pour l'utilisateur
        $groupRole = new GroupRole();
        $groupRole->setUser($user);
        $groupRole->setUserGroup($group);
        $groupRole->setRole($invitation->getRole());

        $this->em->persist($groupRole);
        $this->em->remove($invitation);
    }

    /**
     * @param UserGroup $group
     * @param string $email
     * @param User $invitedBy
     * @param string $role
     * @return GroupInvitation
     */
    public function createInvitationFromRequest(
        UserGroup $group,
        string $email,
        User $invitedBy,
        string $role = GroupRole::ROLE_MEMBER
    ): GroupInvitation {
        $invitation = new GroupInvitation();
        $invitation->setGroup($group);
        $invitation->setEmail($email);
        $invitation->setInvitedBy($invitedBy);
        $invitation->setRole($role);

        $this->em->persist($invitation);

        return $invitation;
    }
}
