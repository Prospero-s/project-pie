<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

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
    public function scrapePdf(Request $request, PdfScraper $pdfScraper): JsonResponse
    {
        $file = $request->files->get('pdf');

        if (!$file) {
            return new JsonResponse(['error' => 'No PDF file provided.'], Response::HTTP_BAD_REQUEST);
        }

        if ($file->getMimeType() !== 'application/pdf') {
            return new JsonResponse(['error' => 'Invalid file type. Only PDFs are allowed.'], Response::HTTP_BAD_REQUEST);
        }

        $uploadDir = __DIR__ . '/../../var/uploads';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $filePath = $uploadDir . '/' . $file->getClientOriginalName();
        $file->move($uploadDir, $file->getClientOriginalName());

        try {
            $textData = $pdfScraper->extractText($filePath);
            $images = $pdfScraper->extractImages($filePath, $uploadDir . '/images');

            return new JsonResponse([
                'text' => $textData['text'] ?? '',
                'details' => $textData['details'] ?? [],
                'images' => $images,
            ]);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => 'An error occurred: ' . $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }


}
