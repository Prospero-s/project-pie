<?php

namespace App\Controller\Api;

use App\Entity\Document;
use App\Entity\Kpi;
use App\Entity\Company;
use App\Entity\UserGroup;
use App\Entity\User;
use App\Repository\DocumentRepository;
use App\Repository\KpiRepository;
use App\Repository\CompanyRepository;
use App\Service\User\UserService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Uid\Uuid;

#[Route('/api/documents', name: 'api_documents_')]
class DocumentController extends AbstractController
{
    private EntityManagerInterface $entityManager;
    private DocumentRepository $documentRepository;
    private KpiRepository $kpiRepository;
    private CompanyRepository $companyRepository;
    private UserService $userService;

    public function __construct(
        EntityManagerInterface $entityManager,
        DocumentRepository $documentRepository,
        KpiRepository $kpiRepository,
        CompanyRepository $companyRepository,
        UserService $userService
    ) {
        $this->entityManager = $entityManager;
        $this->documentRepository = $documentRepository;
        $this->kpiRepository = $kpiRepository;
        $this->companyRepository = $companyRepository;
        $this->userService = $userService;
    }

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(Request $request): Response
    {
        $companyId = $request->query->get('companyId');
        $year = $request->query->get('year');
        $cognitoId = $request->headers->get('X-Cognito-Id');
        
        if (!$cognitoId) {
            return $this->json(['error' => 'Authentication required'], Response::HTTP_UNAUTHORIZED);
        }
        
        try {
            // Récupérer l'utilisateur et son groupe
            $user = $this->userService->findUserByCognitoId($cognitoId);
            
            if (!$user) {
                return $this->json(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
            }
            
            $userGroup = $user->getUserGroup();
            
            if (!$userGroup) {
                return $this->json(['error' => 'User group not found'], Response::HTTP_NOT_FOUND);
            }
            
            // Filtrer les documents par groupe d'utilisateurs
            $qb = $this->documentRepository->createQueryBuilder('d')
                ->where('d.userGroup = :userGroup')
                ->setParameter('userGroup', $userGroup)
                ->orderBy('d.addDate', 'DESC');
            
            // Ajouter un filtre par compagnie si nécessaire
            if ($companyId) {
                $company = $this->companyRepository->find($companyId);
                
                if (!$company) {
                    return $this->json(['error' => 'Company not found'], Response::HTTP_NOT_FOUND);
                }
                
                $qb->andWhere('d.company = :company')
                   ->setParameter('company', $company);
            }
            
            // Ajouter un filtre par année si nécessaire
            if ($year) {
                $qb->andWhere('d.year = :year')
                   ->setParameter('year', (int)$year);
            }
            
            $documents = $qb->getQuery()->getResult();
            
            return $this->json(
                $documents,
                Response::HTTP_OK,
                [],
                ['groups' => 'document_list']
            );
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'show', methods: ['GET'])]
    public function show(string $id, Request $request): Response
    {
        $cognitoId = $request->headers->get('X-Cognito-Id');
        
        if (!$cognitoId) {
            return $this->json(['error' => 'Authentication required'], Response::HTTP_UNAUTHORIZED);
        }
        
        try {
            // Récupérer l'utilisateur et son groupe
            $user = $this->userService->findUserByCognitoId($cognitoId);
            
            if (!$user) {
                return $this->json(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
            }
            
            $userGroup = $user->getUserGroup();
            
            if (!$userGroup) {
                return $this->json(['error' => 'User group not found'], Response::HTTP_NOT_FOUND);
            }
            
            $document = $this->documentRepository->findOneByUuid($id);
            
            if (!$document) {
                return $this->json(['error' => 'Document not found'], Response::HTTP_NOT_FOUND);
            }
            
            // Vérifier que le document appartient au groupe de l'utilisateur
            if ($document->getUserGroup() !== $userGroup) {
                return $this->json(['error' => 'Access denied'], Response::HTTP_FORBIDDEN);
            }
            
            return $this->json(
                $document,
                Response::HTTP_OK,
                [],
                ['groups' => 'document']
            );
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
    
    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(string $id, Request $request): Response
    {
        $cognitoId = $request->headers->get('X-Cognito-Id');
        
        if (!$cognitoId) {
            return $this->json(['error' => 'Authentication required'], Response::HTTP_UNAUTHORIZED);
        }
        
        try {
            // Récupérer l'utilisateur et son groupe
            $user = $this->userService->findUserByCognitoId($cognitoId);
            
            if (!$user) {
                return $this->json(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
            }
            
            $userGroup = $user->getUserGroup();
            
            if (!$userGroup) {
                return $this->json(['error' => 'User group not found'], Response::HTTP_NOT_FOUND);
            }
            
            $document = $this->documentRepository->findOneByUuid($id);
            
            if (!$document) {
                return $this->json(['error' => 'Document not found'], Response::HTTP_NOT_FOUND);
            }
            
            // Vérifier que le document appartient au groupe de l'utilisateur
            if ($document->getUserGroup() !== $userGroup) {
                return $this->json(['error' => 'Access denied'], Response::HTTP_FORBIDDEN);
            }
            
            // Supprimer les KPIs associés
            $kpis = $this->kpiRepository->findByDocument($document);
            foreach ($kpis as $kpi) {
                $this->entityManager->remove($kpi);
            }
            
            // Supprimer le document
            $this->entityManager->remove($document);
            $this->entityManager->flush();
            
            return $this->json(['message' => 'Document deleted successfully'], Response::HTTP_OK);
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/save', name: 'save', methods: ['POST'])]
    public function save(Request $request): Response
    {
        $cognitoId = $request->headers->get('X-Cognito-Id');
        
        if (!$cognitoId) {
            return $this->json(['error' => 'Authentication required'], Response::HTTP_UNAUTHORIZED);
        }
        
        try {
            // Récupérer l'utilisateur et son groupe
            $user = $this->userService->findUserByCognitoId($cognitoId);
            
            if (!$user) {
                return $this->json(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
            }
            
            $userGroup = $user->getUserGroup();
            
            if (!$userGroup) {
                return $this->json(['error' => 'User group not found'], Response::HTTP_NOT_FOUND);
            }
            
            $data = json_decode($request->getContent(), true);
            
            if (!isset($data['companyId']) || !isset($data['pdf']) || 
                !isset($data['periodicity']) || !isset($data['year'])) {
                return $this->json(['error' => 'Missing required fields'], Response::HTTP_BAD_REQUEST);
            }
            
            // Récupérer la compagnie par son ID normal
            $company = $this->companyRepository->find($data['companyId']);
            
            if (!$company) {
                return $this->json(['error' => 'Company not found'], Response::HTTP_NOT_FOUND);
            }
            
            // Création du document
            $document = new Document();
            $document->setBlob($data['pdf']);
            $document->setPeriodicity($data['periodicity']);
            $document->setYear((int)$data['year']);
            $document->setCompany($company);
            $document->setUserGroup($userGroup);
            
            // Définir le statut du document (par défaut 'validated', ou 'draft' si spécifié)
            $status = isset($data['status']) ? $data['status'] : 'validated';
            $document->setStatus($status);
            
            // Définir le nom du fichier s'il est disponible
            if (isset($data['filename']) && !empty($data['filename'])) {
                $document->setFilename($data['filename']);
            } else {
                // Générer un nom de fichier basé sur la compagnie et la date
                $filename = $company->getDenomination() . '_' . (new \DateTime())->format('Y-m-d') . '.pdf';
                $document->setFilename($filename);
            }
            
            $this->entityManager->persist($document);
            
            // Traitement des KPIs
            if (isset($data['kpis']) && is_array($data['kpis'])) {
                // Récupérer les unités si elles sont fournies
                $kpiUnits = isset($data['units']) && is_array($data['units']) ? $data['units'] : [];
                
                foreach ($data['kpis'] as $kpiName => $periods) {
                    // Récupérer l'unité pour ce KPI
                    $kpiUnit = isset($kpiUnits[$kpiName]) ? $this->validateUnit($kpiUnits[$kpiName]) : '';
                    
                    foreach ($periods as $period => $value) {
                        $kpi = new Kpi();
                        $kpi->setName($kpiName);
                        $kpi->setPeriod($period);
                        $kpi->setDocument($document);
                        
                        // Les valeurs sont maintenant directement numériques
                        if (is_numeric($value)) {
                            $kpi->setValue((float)$value);
                        } else {
                            // Fallback : essayer d'extraire la valeur si ce n'est pas numérique
                            $numericValue = $this->extractNumericValue($value);
                            $kpi->setValue($numericValue);
                        }
                        
                        // Définir l'unité validée
                        $kpi->setUnit($kpiUnit);
                        
                        $this->entityManager->persist($kpi);
                    }
                }
            }
            
            $this->entityManager->flush();
            
            return $this->json(
                ['id' => $document->getId(), 'message' => 'Document saved successfully'],
                Response::HTTP_CREATED
            );
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}/view', name: 'view_pdf', methods: ['GET'])]
    public function viewPdf(string $id, Request $request): Response
    {
        $cognitoId = $request->headers->get('X-Cognito-Id');
        
        if (!$cognitoId) {
            return $this->json(['error' => 'Authentication required'], Response::HTTP_UNAUTHORIZED);
        }
        
        try {
            // Récupérer l'utilisateur et son groupe
            $user = $this->userService->findUserByCognitoId($cognitoId);
            
            if (!$user) {
                return $this->json(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
            }
            
            $userGroup = $user->getUserGroup();
            
            if (!$userGroup) {
                return $this->json(['error' => 'User group not found'], Response::HTTP_NOT_FOUND);
            }
            
            $document = $this->documentRepository->findOneByUuid($id);
            
            if (!$document) {
                return $this->json(['error' => 'Document not found'], Response::HTTP_NOT_FOUND);
            }
            
            // Vérifier que le document appartient au groupe de l'utilisateur
            if ($document->getUserGroup() !== $userGroup) {
                return $this->json(['error' => 'Access denied'], Response::HTTP_FORBIDDEN);
            }
            
            // Décoder le contenu base64 du PDF
            $pdfContent = base64_decode($document->getBlob(), true);
            
            if ($pdfContent === false) {
                return $this->json(['error' => 'Invalid PDF content'], Response::HTTP_INTERNAL_SERVER_ERROR);
            }
            
            // Créer la réponse avec le contenu PDF
            $response = new Response($pdfContent);
            $response->headers->set('Content-Type', 'application/pdf');
            $filename = $document->getFilename() ?: 'document.pdf';
            $response->headers->set('Content-Disposition', 'inline; filename="' . $filename . '"');
            
            return $response;
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'update', methods: ['PUT'])]
    public function update(string $id, Request $request): Response
    {
        $cognitoId = $request->headers->get('X-Cognito-Id');
        
        if (!$cognitoId) {
            return $this->json(['error' => 'Authentication required'], Response::HTTP_UNAUTHORIZED);
        }
        
        try {
            // Récupérer l'utilisateur et son groupe
            $user = $this->userService->findUserByCognitoId($cognitoId);
            
            if (!$user) {
                return $this->json(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
            }
            
            $userGroup = $user->getUserGroup();
            
            if (!$userGroup) {
                return $this->json(['error' => 'User group not found'], Response::HTTP_NOT_FOUND);
            }
            
            $document = $this->documentRepository->findOneByUuid($id);
            
            if (!$document) {
                return $this->json(['error' => 'Document not found'], Response::HTTP_NOT_FOUND);
            }
            
            // Vérifier que le document appartient au groupe de l'utilisateur
            if ($document->getUserGroup() !== $userGroup) {
                return $this->json(['error' => 'Access denied'], Response::HTTP_FORBIDDEN);
            }
            
            $data = json_decode($request->getContent(), true);
            
            // Mettre à jour les champs du document si fournis
            if (isset($data['status'])) {
                $document->setStatus($data['status']);
            }
            
            if (isset($data['year'])) {
                $document->setYear((int)$data['year']);
            }
            
            if (isset($data['periodicity'])) {
                $document->setPeriodicity($data['periodicity']);
            }
            
            if (isset($data['filename'])) {
                $document->setFilename($data['filename']);
            }
            
            // Mise à jour des KPIs si fournis
            if (isset($data['kpis']) && is_array($data['kpis'])) {
                // Supprimer tous les KPIs existants du document
                $existingKpis = $this->kpiRepository->findByDocument($document);
                foreach ($existingKpis as $kpi) {
                    $this->entityManager->remove($kpi);
                }
                
                // Récupérer les unités si elles sont fournies
                $kpiUnits = isset($data['units']) && is_array($data['units']) ? $data['units'] : [];
                
                // Ajouter les nouveaux KPIs
                foreach ($data['kpis'] as $kpiName => $periods) {
                    // Récupérer l'unité pour ce KPI
                    $kpiUnit = isset($kpiUnits[$kpiName]) ? $this->validateUnit($kpiUnits[$kpiName]) : '';
                    
                    foreach ($periods as $period => $value) {
                        $kpi = new Kpi();
                        $kpi->setName($kpiName);
                        $kpi->setPeriod($period);
                        $kpi->setDocument($document);
                        
                        // Les valeurs sont maintenant directement numériques
                        if (is_numeric($value)) {
                            $kpi->setValue((float)$value);
                        } else {
                            // Fallback : essayer d'extraire la valeur si ce n'est pas numérique
                            $numericValue = $this->extractNumericValue($value);
                            $kpi->setValue($numericValue);
                        }
                        
                        // Définir l'unité validée
                        $kpi->setUnit($kpiUnit);
                        
                        $this->entityManager->persist($kpi);
                    }
                }
            }
            
            $this->entityManager->persist($document);
            $this->entityManager->flush();
            
            return $this->json(
                ['id' => $document->getId(), 'message' => 'Document updated successfully'],
                Response::HTTP_OK
            );
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Extrait la valeur numérique d'une chaîne
     * @param string $value Chaîne contenant une valeur (ex: "125K€", "-3.2M$", "12%")
     * @return float Valeur numérique extraite ou 0 si impossible
     */
    private function extractNumericValue(string $value): float
    {
        if (empty($value) || $value === 'N.A') {
            return 0;
        }
        
        // Nettoyer la chaîne
        $value = trim($value);
        
        // Traiter les valeurs négatives avec parenthèses (ex: "(123)" -> "-123")
        if (str_starts_with($value, '(') && str_ends_with($value, ')')) {
            $value = '-' . substr($value, 1, -1);
        }
        
        // Remplacer les caractères spéciaux
        $value = str_replace(['−', ' '], ['-', ''], $value);
        
        // Extraire le nombre avec une expression régulière
        if (preg_match('/^(-?\(?[\d\s]+[.,]?\d*\)?)/', $value, $matches)) {
            $numStr = $matches[1];
            $numStr = str_replace([',', '(', ')'], ['.', '-', ''], $numStr);
            
            try {
                $numValue = (float) $numStr;
                
                // Appliquer les multiplicateurs
                if (stripos($value, 'K') !== false) {
                    $numValue *= 1000;
                } elseif (stripos($value, 'M') !== false) {
                    $numValue *= 1000000;
                } elseif (stripos($value, 'B') !== false || stripos($value, 'G') !== false) {
                    $numValue *= 1000000000;
                }
                
                return $numValue;
            } catch (\Exception $e) {
                return 0;
            }
        }
        
        return 0;
    }
    
    /**
     * Valide qu'une unité fait partie des unités autorisées
     * @param string $unit Unité à valider
     * @return string Unité validée ou chaîne vide si non autorisée
     */
    private function validateUnit(string $unit): string
    {
        $allowedUnits = ['€', '$', '£', '¥', '%', 'x', ''];
        
        return in_array($unit, $allowedUnits) ? $unit : '';
    }

} 