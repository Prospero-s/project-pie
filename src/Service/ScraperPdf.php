<?php

namespace App\Service;

use Smalot\PdfParser\Parser;
use thiagoalessio\TesseractOCR\TesseractOCR;
use Imagick;

class ScraperPdf
{
    // Extraction de texte brut directement du PDF
    public function extractText(string $filePath): array
    {
        $parser = new Parser();
        $pdf = $parser->parseFile($filePath);

        return [
            'text' => $pdf->getText(),
            'details' => $pdf->getDetails(),
        ];
    }

    // Extraction d'images depuis le PDF
    public function extractImages(string $filePath, string $outputDir): array
    {
        if (!file_exists($outputDir)) {
            mkdir($outputDir, 0777, true);
        }

        $imagick = new \Imagick();
        $imagick->setResolution(300, 300); // Résolution pour des images de qualité
        $imagick->readImage($filePath);

        $images = [];
        foreach ($imagick as $index => $page) {
            $imagePath = sprintf('%s/page-%d.png', $outputDir, $index + 1);
            $page->writeImage($imagePath);
            $images[] = $imagePath;
        }

        return $images;
    }

    public function extractImagesAndText(string $filePath, string $outputDir): array
    {
        // Vérifie si le répertoire cible existe, sinon le crée
        if (!file_exists($outputDir)) {
            mkdir($outputDir, 0777, true);
        }

        $imagick = new Imagick();
        $imagick->setResolution(300, 300); // Définit la résolution pour une meilleure qualité
        $imagick->readImage($filePath);

        $images = [];
        $textResults = [];
        foreach ($imagick as $index => $page) {
            $imagePath = sprintf('%s/page-%d.png', $outputDir, $index + 1);
            $page->setImageFormat('png');
            $page->writeImage($imagePath);
            $images[] = $imagePath;

            // Utilisation de TesseractOCR pour lire le texte de chaque image
            $ocr = new TesseractOCR($imagePath);
            $ocr->lang('eng', 'fra'); // Ajout des langues nécessaires
            $textResults[] = $ocr->run();
        }

        // Libère la mémoire utilisée par Imagick
        $imagick->clear();
        $imagick->destroy();

        return [
            'images' => $images,
            'text' => implode("\n", $textResults), // Combine tous les textes extraits
        ];
    }
}
