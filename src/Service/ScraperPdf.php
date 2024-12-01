<?php

namespace App\Service;

use Smalot\PdfParser\Parser;
use thiagoalessio\TesseractOCR\TesseractOCR;

class PdfScraper
{
    public function extractText(string $filePath): array
    {
        $parser = new Parser();
        $pdf = $parser->parseFile($filePath);

        return [
            'text' => $pdf->getText(),
            'details' => $pdf->getDetails(),
        ];
    }

    public function extractImages(string $filePath, string $outputDir): array
    {
        if (!file_exists($outputDir)) {
            mkdir($outputDir, 0777, true);
        }

        $imagick = new \Imagick();
        $imagick->setResolution(300, 300);
        $imagick->readImage($filePath);

        $images = [];
        foreach ($imagick as $index => $page) {
            $imagePath = sprintf('%s/page-%d.png', $outputDir, $index + 1);
            $page->writeImage($imagePath);
            $images[] = $imagePath;
        }

        return $images;
    }
}
