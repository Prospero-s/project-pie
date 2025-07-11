<?php

namespace App\Controller\Test;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class HealthController
{
    #[Route('/health', name: 'health_check', priority: 10)]
    public function check(): Response
    {
        return new Response('OK', Response::HTTP_OK);
    }
}