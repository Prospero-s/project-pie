<?php

namespace App\Repository;

use App\Entity\UserGroup;
use App\Entity\User;
use App\Entity\GroupRole;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\ORM\EntityManagerInterface;

/**
 * @extends ServiceEntityRepository<UserGroup>
 */
class UserGroupRepository extends ServiceEntityRepository
{
    private EntityManagerInterface $entityManager;

    public function __construct(ManagerRegistry $registry, EntityManagerInterface $entityManager)
    {
        parent::__construct($registry, UserGroup::class);
        $this->entityManager = $entityManager;
    }

    /**
     * @param string $cognitoId
     * @return list<UserGroup>
     */
    public function findByMemberCognitoId(string $cognitoId): array
    {
        return $this->createQueryBuilder('ug')
            ->join('ug.users', 'u')
            ->join('ug.owner', 'o')
            ->where('u.cognitoId = :cognitoId')
            ->orWhere('o.cognitoId = :cognitoId')
            ->setParameter('cognitoId', $cognitoId)
            ->getQuery()
            ->getResult();
    }

    // /**
    //  * @param string $cognitoId
    //  * @return list<UserGroup>
    //  */
    // public function findByOwnerCognitoId(string $cognitoId): array
    // {
    //     return $this->findBy(['ownerCognitoId' => $cognitoId]);
    // }

    /**
     * @param int $groupId
     * @return UserGroup|null
     */
    public function findGroupWithMembersAndInvestments(int $groupId): ?UserGroup
    {
        return $this->createQueryBuilder('g')
            ->leftJoin('g.users', 'u')
            ->leftJoin('u.investments', 'i')
            ->leftJoin('i.company', 'c')
            ->where('g.id = :groupId')
            ->setParameter('groupId', $groupId)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * @param int $groupId
     * @return UserGroup|null
     */
    public function findGroupWithMembers(int $groupId): ?UserGroup
    {
        return $this->createQueryBuilder('g')
            ->leftJoin('g.users', 'u')
            ->where('g.id = :groupId')
            ->setParameter('groupId', $groupId)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * @param string $name
     * @param User $owner
     * @param list<string> $invitationEmails
     * @return UserGroup
     */
    public function createGroup(string $name, User $owner, array $invitationEmails = []): UserGroup
    {
        $group = new UserGroup();
        $group->setName($name);
        $group->setOwner($owner);
        $group->setCreatedAt(new \DateTime());
        $group->addUser($owner);

        // Créer le rôle OWNER pour le créateur
        $ownerRole = new GroupRole();
        $ownerRole->setUser($owner);
        $ownerRole->setUserGroup($group);
        $ownerRole->setRole(GroupRole::ROLE_OWNER);

        $this->entityManager->persist($group);
        $this->entityManager->persist($ownerRole);

        return $group;
    }

    /**
     * @param UserGroup $group
     * @param User $member
     */
    public function addMemberToGroup(UserGroup $group, User $member): void
    {
        $group->addUser($member);
        $this->entityManager->persist($group);
    }

    /**
     * @param UserGroup $group
     * @param User $member
     */
    public function removeMemberFromGroup(UserGroup $group, User $member): void
    {
        $group->removeUser($member);
        $this->entityManager->persist($group);
    }
}
