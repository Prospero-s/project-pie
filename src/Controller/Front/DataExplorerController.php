<?php

namespace App\Controller\Front;

use App\Repository\CompanyInvestmentRepository;
use App\Repository\CompanyRepository;
use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/explorer', name: 'explorer_')]
class DataExplorerController extends AbstractController
{
    private UserRepository $userRepository;
    private CompanyRepository $companyRepository;
    private CompanyInvestmentRepository $companyInvestmentRepository;

    public function __construct(
        UserRepository $userRepository,
        CompanyRepository $companyRepository,
        CompanyInvestmentRepository $companyInvestmentRepository
    ) {
        $this->userRepository = $userRepository;
        $this->companyRepository = $companyRepository;
        $this->companyInvestmentRepository = $companyInvestmentRepository;
    }

    /**
     * Page principale de l'explorateur de données avec les métriques
     * Cette méthode ne vérifie pas l'authentification pour faciliter le développement
     */
    #[Route('/data/{companyId}/{queryName}', name: 'data', methods: ['GET'])]
    public function displayData(Request $request, int $companyId, string $queryName): Response
    {
        // Vérifier que l'entreprise existe
        $company = $this->companyRepository->find($companyId);
        if (!$company) {
            return $this->json([
                'error' => 'Entreprise non trouvée',
                'details' => 'L\'entreprise demandée n\'existe pas'
            ], 404);
        }

        // Récupérer n'importe quel utilisateur du groupe pour la démo (en dev uniquement)
        // En production, il faudrait utiliser l'authentification réelle
        $userFromDb = $this->userRepository->findOneBy([], ['id' => 'ASC']);

        if (!$userFromDb || !$userFromDb->getUserGroup()) {
            return $this->json([
                'error' => 'Aucun utilisateur disponible',
                'details' => 'Aucun utilisateur trouvé dans la base de données'
            ], 404);
        }

        $userGroup = $userFromDb->getUserGroup();

        // Exécuter la requête spécifiée
        $data = $this->companyInvestmentRepository->executeQueryById(
            $queryName,
            $companyId,
            $userGroup
        );

        // Retourner les données au format JSON
        if ($request->headers->get('Accept') === 'application/json' || $request->query->get('format') === 'json') {
            return $this->json([
                'results' => $data
            ]);
        }

        // Rendu de la vue Twig avec les données
        return $this->render('explorer/data.html.twig', [
            'data' => $data,
            'queryName' => $queryName,
            'company' => $company
        ]);
    }

    /**
     * Liste des requêtes prédéfinies disponibles
     */
    #[Route('/queries', name: 'queries', methods: ['GET'])]
    public function getQueries(Request $request): Response
    {
        // Récupérer la liste des requêtes prédéfinies
        $queries = $this->companyInvestmentRepository->getPredefinedQueries();

        // Retourner les données au format JSON
        if ($request->headers->get('Accept') === 'application/json' || $request->query->get('format') === 'json') {
            return $this->json([
                'queries' => $queries
            ]);
        }

        // Rendu de la vue Twig avec les requêtes
        return $this->render('explorer/queries.html.twig', [
            'queries' => $queries
        ]);
    }
}
