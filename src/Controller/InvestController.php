<?php

namespace App\Controller;

use App\Entity\Invest;
use App\Entity\UserWallet;
use App\Entity\Enterprise;
use App\Repository\InvestRepository;
use App\Repository\InvestWalletRepository;
use App\Repository\UserWalletRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class WalletController extends AbstractController
{
    #[Route('/invest/{userWallet}', name: 'invest_list', methods: ['GET'])]
    public function list(InvestRepository $investRepository, UserWallet $userWallet): Response
    {
        $invests = $investRepository->findAll(['userWallet' => $userWallet]);

        return $this->json($invests, Response::HTTP_OK, [], [
            'groups' => ['invest:read']
        ]);
    }

    #[Route('/invest/{id}', name: 'invest_show', methods: ['GET'])]
    public function show(int $id, InvestRepository $investRepository): Response
    {
        $invest = $investRepository->findOneBy(['id' => $id]);

        if (!$invest) {
            return $this->json(['error' => 'Investment not found'], Response::HTTP_NOT_FOUND);
        }

        return $this->json($invest, Response::HTTP_OK, [], [
            'groups' => ['invest:read']
        ]);
    }

    #[Route('/invest', name: 'invest_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): Response
    {
        $data = json_decode($request->getContent(), true);

        $amount = $data['amount'] ?? null;
        $entStartValue = $data['ent_start_value'] ?? null;
        $paymentDate = $data['payment_date'] ?? null;
        $enterpriseId = $data['enterprise_id'] ?? null;
        $walletId = $data['wallet_id'] ?? null;

        if (!$amount || !$entStartValue || !$paymentDate || !$enterpriseId || !$walletId) {
            return $this->json(['error' => 'Missing required data'], Response::HTTP_BAD_REQUEST);
        }

        $enterprise = $em->getRepository(Enterprise::class)->find($enterpriseId);
        if (!$enterprise) {
            return $this->json(['error' => 'Enterprise not found'], Response::HTTP_NOT_FOUND);
        }

        $userWallet = $em->getRepository(UserWallet::class)->find($walletId);
        if (!$userWallet) {
            return $this->json(['error' => 'User wallet not found'], Response::HTTP_NOT_FOUND);
        }

        $invest = new Invest();
        $invest->setAmount($amount)
               ->setEntStartValue($entStartValue)
               ->setPaymentDate(new \DateTime($paymentDate))
               ->setEnterprise($enterprise)
               ->setUserWallet($userWallet);

        $em->persist($invest);
        $em->flush();

        return $this->json($invest, Response::HTTP_CREATED, [], [
            'groups' => ['invest:read']
        ]);
    }

    #[Route('/invest/{id}', name: 'invest_update', methods: ['PUT'])]
    public function update(int $id, Request $request, InvestRepository $investRepository, EntityManagerInterface $em): Response
    {
        $data = json_decode($request->getContent(), true);

        $invest = $investRepository->find($id);
        if (!$invest) {
            return $this->json(['error' => 'Investment not found'], Response::HTTP_NOT_FOUND);
        }
        // si l'entreprise n'existe pas 
        if (isset($data['enterprise_id'])) {
            $enterprise = $em->getRepository(Enterprise::class)->find($data['enterprise_id']);
            if (!$enterprise) {
                return $this->json(['error' => 'Enterprise not found'], Response::HTTP_NOT_FOUND);
            } 
        }
        
        // ou que le wallet n'existe pas
        if (isset($data['wallet_id'])) {
            $userWallet = $em->getRepository(UserWallet::class)->find($data['wallet_id']);
            if (!$userWallet) {
                return $this->json(['error' => 'User wallet not found'], Response::HTTP_NOT_FOUND);
            } 
        }


        if (isset($data['amount'])) {
            $invest->setAmount($data['amount']);
        }
        if (isset($data['ent_start_value'])) {
            $invest->setEntStartValue($data['ent_start_value']);
        }
        if (isset($data['payment_date'])) {
            $invest->setPaymentDate(new \DateTime($data['payment_date']));
        }
        if (isset($data['enterprise_id'])) {
            $enterprise = $em->getRepository(Enterprise::class)->find($data['enterprise_id']);
            if ($enterprise) {
                $invest->setEnterprise($enterprise);
            } else {
                return $this->json(['error' => 'Enterprise not found'], Response::HTTP_NOT_FOUND);
            }
        }
        if (isset($data['wallet_id'])) {
            $userWallet = $em->getRepository(UserWallet::class)->find($data['wallet_id']);
            if ($userWallet) {
                $invest->setUserWallet($userWallet);
            } else {
                return $this->json(['error' => 'User wallet not found'], Response::HTTP_NOT_FOUND);
            }
        }

        $em->flush();

        return $this->json($invest, Response::HTTP_OK, [], [
            'groups' => ['invest:read']
        ]);
    }

    #[Route('/invest/{id}', name: 'invest_delete', methods: ['DELETE'])]
    public function delete(int $id, InvestRepository $investRepository, EntityManagerInterface $em): Response
    {
        $invest = $investRepository->find($id);
        if (!$invest) {
            return $this->json(['error' => 'Investment not found'], Response::HTTP_NOT_FOUND);
        }

        $em->remove($invest);
        $em->flush();

        return $this->json(['message' => 'Investment deleted successfully'], Response::HTTP_OK);
    }
}
