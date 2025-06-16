<?php

namespace App\DataFixtures\Demo\User;

use App\Entity\User;
use App\Entity\UserGroup;
use App\Entity\NotificationSettings;
use App\DataFixtures\Demo\Common\DemoDataLoader;
use Doctrine\Persistence\ObjectManager;

class DemoUserFixture
{
    private DemoDataLoader $dataLoader;
    private array $userData;

    public function __construct(DemoDataLoader $dataLoader)
    {
        $this->dataLoader = $dataLoader;
        $this->userData = $this->dataLoader->loadUserData();
    }

    public function createDemoUser(ObjectManager $manager): User
    {
        $userData = $this->userData['user'];
        
        $user = new User();
        $user->setCognitoId($userData['cognitoId'])
             ->setName($userData['name'])
             ->setEmail($userData['email']);

        echo "✅ Création du nouveau compte de démonstration...\n";
        echo "📧 Email: " . $userData['email'] . "\n";
        echo "🔑 Mot de passe: " . $userData['password'] . "\n\n";

        return $user;
    }

    public function createDemoGroup(ObjectManager $manager, User $owner): UserGroup
    {
        $groupData = $this->userData['group'];
        
        $group = new UserGroup();
        $group->setName($groupData['name'])
              ->setOwner($owner);

        return $group;
    }

    public function createNotificationSettings(ObjectManager $manager, User $user): NotificationSettings
    {
        $notifData = $this->userData['notificationSettings'];
        
        $notificationSettings = new NotificationSettings();
        $notificationSettings->setUserId($user)
                            ->setEmailEnabled($notifData['emailEnabled'])
                            ->setSmsEnabled($notifData['smsEnabled'])
                            ->setPushEnabled($notifData['pushEnabled'])
                            ->setUpdatedAt(new \DateTime());

        return $notificationSettings;
    }

    public function getDemoUserEmail(): string
    {
        return $this->userData['user']['email'];
    }

    public function getDemoGroupName(): string
    {
        return $this->userData['group']['name'];
    }
} 