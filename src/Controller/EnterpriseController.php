<?php

namespace App\Controller;

use App\Entity\Enterprise;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class EnterpriseController extends AbstractController
{
    #[Route('/enterprises', name: 'app_enterprise_list')]
    public function index(EntityManagerInterface $entityManager): Response
    {
        $enterprises = $entityManager
            ->getRepository(Enterprise::class)
            ->findAll();

        return $this->render('enterprise/index.html.twig', [
            'enterprises' => $enterprises,
        ]);
    }
} 