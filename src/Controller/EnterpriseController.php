<?php

namespace App\Controller;

use App\Entity\Enterprise;
use App\Entity\UserWallet;
use App\Repository\EnterpriseRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class EnterpriseController extends AbstractController
{
    #[Route('/enterprise', name: 'enterprise_list', methods: ['GET'])]
    public function list(EnterpriseRepository $enterpriseRepository): Response
    {
        $enterprises = $enterpriseRepository->findAll();

        return $this->json($enterprises, Response::HTTP_OK, [], []);
    }

    #[Route('/enterprise/{id}', name: 'enterprise_show', methods: ['GET'])]
    public function show(int $id, EnterpriseRepository $enterpriseRepository): Response
    {
        $enterprise = $enterpriseRepository->find($id);

        if (!$enterprise) {
            return $this->json(['error' => 'Enterprise not found'], Response::HTTP_NOT_FOUND);
        }

        return $this->json($enterprise, Response::HTTP_OK, [], []);
    }

    #[Route('/enterprise/{userWallet}', name: 'enterprise_show', methods: ['GET'])]
    public function getEnterpriseInvestsByUserWallet(UserWallet $userWallet, EnterpriseRepository $enterpriseRepository): Response
    {
        $enterpriseList = $enterpriseRepository->findInvestsByUserWallet($userWallet);
 
        if (!$enterpriseList) {
            return $this->json(['error' => 'Enterprises not found'], Response::HTTP_NOT_FOUND);
        }

        return $this->json($enterpriseList, Response::HTTP_OK, [], []);
    }

    #[Route('/enterprise', name: 'enterprise_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): Response
    {
        $data = json_decode($request->getContent(), true);

        $enterprise = new Enterprise();
        $this->setEnterpriseData($enterprise, $data);

        $em->persist($enterprise);
        $em->flush();

        return $this->json($enterprise, Response::HTTP_CREATED, [], [
        ]);
    }

    #[Route('/enterprise/{id}', name: 'enterprise_update', methods: ['PUT'])]
    public function update(int $id, Request $request, EnterpriseRepository $enterpriseRepository, EntityManagerInterface $em): Response
    {
        $enterprise = $enterpriseRepository->find($id);

        if (!$enterprise) {
            return $this->json(['error' => 'Enterprise not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        $this->setEnterpriseData($enterprise, $data);

        $em->flush();

        return $this->json($enterprise, Response::HTTP_OK, [], [
        ]);
    }

    #[Route('/enterprise/{id}', name: 'enterprise_delete', methods: ['DELETE'])]
    public function delete(int $id, EnterpriseRepository $enterpriseRepository, EntityManagerInterface $em): Response
    {
        $enterprise = $enterpriseRepository->find($id);

        if (!$enterprise) {
            return $this->json(['error' => 'Enterprise not found'], Response::HTTP_NOT_FOUND);
        }

        $em->remove($enterprise);
        $em->flush();

        return $this->json(['message' => 'Enterprise deleted successfully'], Response::HTTP_OK);
    }

    private function setEnterpriseData(Enterprise $enterprise, array $data): void
    {
        if (isset($data['denomination'])) {
            $enterprise->setDenomination($data['denomination']);
        }
        if (isset($data['remote_society'])) {
            $enterprise->setRemoteSociety($data['remote_society']);
        }
        if (isset($data['established_in_france'])) {
            $enterprise->setEstablishedInFrance($data['established_in_france']);
        }
        if (isset($data['legal_form'])) {
            $enterprise->setLegalForm($data['legal_form']);
        }
        if (isset($data['main_activity'])) {
            $enterprise->setMainActivity($data['main_activity']);
        }
        if (isset($data['name'])) {
            $enterprise->setName($data['name']);
        }
        if (isset($data['siret'])) {
            $enterprise->setSiret($data['siret']);
        }
        if (isset($data['siren'])) {
            $enterprise->setSiren($data['siren']);
        }
        if (isset($data['code_naf'])) {
            $enterprise->setCodeNaf($data['code_naf']);
        }
        if (isset($data['activities'])) {
            $enterprise->setActivities($data['activities']);
        }
        if (isset($data['capital'])) {
            $enterprise->setCapital($data['capital']);
        }
        if (isset($data['min_capital'])) {
            $enterprise->setMinCapital($data['min_capital']);
        }
        if (isset($data['currency'])) {
            $enterprise->setCurrency($data['currency']);
        }
    }
}
