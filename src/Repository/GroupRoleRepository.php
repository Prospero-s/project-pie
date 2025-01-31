<?php

namespace App\Repository;

use App\Entity\GroupRole;
use App\Entity\User;
use App\Entity\UserGroup;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\ORM\EntityManagerInterface;

class GroupRoleRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry, EntityManagerInterface $em)
    {
        parent::__construct($registry, GroupRole::class);
        $this->em = $em;
    }

    public function updateOrCreateRole(User $user, UserGroup $group, string $role): GroupRole
    {
        // Supprimer l'ancien rôle s'il existe
        $existingRole = $this->findOneBy([
            'user' => $user,
            'userGroup' => $group
        ]);

        if ($existingRole) {
            $this->em->remove($existingRole);
            $this->em->flush();
        }

        // Créer le nouveau rôle
        $groupRole = new GroupRole();
        $groupRole->setUser($user);
        $groupRole->setUserGroup($group);
        $groupRole->setRole($role);
        
        $this->em->persist($groupRole);
        $this->em->flush();
        
        return $groupRole;
    }
} 