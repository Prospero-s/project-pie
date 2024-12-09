<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Psr\Log\LoggerInterface;
use App\Service\ScraperPdf;


class PdfController extends AbstractController
{
    #[Route('/pdf', name: 'pdf')]
    public function index(): Response
    {
        return $this->render('main/index.html.twig', [
            'controller_name' => 'PdfController',
        ]);
    }

    #[Route('/api/pdf', name: 'pdf-api', methods: ['POST'])]
    public function scrapePdf(Request $request, ScraperPdf $pdfScraper, LoggerInterface $logger): JsonResponse
    {
        $logger->info('scrapePdf called');

        // Vérifie si le fichier a été reçu
        $file = $request->files->get('pdf');
        if (!$file) {
            $logger->error('No file provided in the request.');
            return new JsonResponse(['error' => 'No file provided'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $logger->info('File received: ' . $file->getClientOriginalName());

        // Vérifie le type MIME
        $mimeType = $file->getMimeType();
        if ($mimeType !== 'application/pdf') {
            $logger->error('Invalid file type: ' . $mimeType);
            return new JsonResponse(['error' => 'Invalid file type. Only PDFs are allowed.'], JsonResponse::HTTP_BAD_REQUEST);
        }

        // Définit le répertoire d'upload
        $uploadDir = __DIR__ . '/../var/uploads';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
            $logger->info('Upload directory created successfully.');
        }

        $filePath = $uploadDir . '/' . $file->getClientOriginalName();
        $file->move($uploadDir, $file->getClientOriginalName());
        $logger->info('File moved to ' . $filePath);

        if (!file_exists($filePath)) {
            $logger->error('File does not exist after being moved.');
            return new JsonResponse(['error' => 'Failed to move the file.'], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }

        // Extraction des images et du texte
        $imageOutputDir = $uploadDir . '/images';
        try {
            $result = $pdfScraper->extractImagesAndText($filePath, $imageOutputDir);

            $logger->info('Text and images extracted successfully.');

            // Encode le texte en UTF-8
            if (isset($result['text'])) {
                $result['text'] = mb_convert_encoding($result['text'], 'UTF-8', 'auto');
            }

            // Prépare les chemins pour les rendre accessibles publiquement
            $publicImages = array_map(
                fn($path) => '/../uploads/images/' . basename($path), // Conserve uniquement le nom de fichier
                $result['images']
            );            

            return new JsonResponse([
                'text' => $result['text'] ?? '',
                'images' => $publicImages,
            ], JsonResponse::HTTP_OK);
        } catch (\Exception $e) {
            $logger->error('Error while processing PDF: ' . $e->getMessage());
            return new JsonResponse(['error' => 'An error occurred: ' . $e->getMessage()], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/uploads/{filename}', name: 'uploads')]
    public function serveFile(string $filename): Response
    {
        $filePath = $this->getParameter('kernel.project_dir') . '/../src/var/uploads/images/' . $filename;

        if (!file_exists($filePath)) {
            throw $this->createNotFoundException('File not found');
        }

        return new BinaryFileResponse($filePath);
    }

}
