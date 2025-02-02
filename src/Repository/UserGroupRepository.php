<?php

namespace App\Repository;

use App\Entity\UserGroup;
use App\Entity\User;
use App\Entity\GroupRole;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\ORM\EntityManagerInterface;
class UserGroupRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry, EntityManagerInterface $em)
    {
        parent::__construct($registry, UserGroup::class);
        $this->em = $em;
    }

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

    public function findByOwnerCognitoId(string $cognitoId): array
    {
        return $this->findBy(['ownerCognitoId' => $cognitoId]);
    }

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

    public function findGroupWithMembers(int $groupId): ?UserGroup
    {
        return $this->createQueryBuilder('g')
            ->leftJoin('g.users', 'u')
            ->where('g.id = :groupId')
            ->setParameter('groupId', $groupId)
            ->getQuery()
            ->getOneOrNullResult();
    }

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
        
        $this->em->persist($group);
        $this->em->persist($ownerRole);
        
        return $group;
    }

    public function addMemberToGroup(UserGroup $group, User $member): void
    {
        $group->addUser($member);
        $this->em->persist($group);
    }

    public function removeMemberFromGroup(UserGroup $group, User $member): void
    {
        $group->removeUser($member);
        $this->em->persist($group);
    }
}