<?php

namespace App\Controller\Front;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;

class MainController extends AbstractController
{
    #[Route('/{lng}/auth/signin', name: 'app_signin', requirements: ['lng' => 'fr|en'])]
    public function signin(Request $request, string $lng): Response
    {
        $request->getSession()->set('_locale', $lng);
        
        return $this->render('main/index.html.twig', [
            'controller_name' => 'MainController',
            'locale' => $lng
        ]);
    }

    #[Route('/{lng}/auth/signup', name: 'app_signup', requirements: ['lng' => 'fr|en'])]
    public function signup(Request $request, string $lng): Response
    {
        $request->getSession()->set('_locale', $lng);
        
        return $this->render('main/index.html.twig', [
            'controller_name' => 'MainController',
            'locale' => $lng
        ]);
    }

    #[Route('/{lng}/dashboard', name: 'app_dashboard', requirements: ['lng' => 'fr|en'])]
    public function dashboard(Request$request, string $lng): Response
    {
        $request->getSession()->set('_locale', $lng);
        
        return $this->render('main/index.html.twig', [
            'controller_name' => 'MainController',
            'locale' => $lng
        ]);
    }

    #[Route('/{lng}/investments', name: 'app_investments', requirements: ['lng' => 'fr|en'])]
    public function investments(Request $request, string $lng): Response
    {
        $request->getSession()->set('_locale', $lng);
        
        return $this->render('main/index.html.twig', [
            'controller_name' => 'MainController',
            'locale' => $lng
        ]);
    }

    #[Route('/',name: 'app_redirect')]
    public function redirectToLocale(Request $request): Response
    {
        $preferredLanguage = $request->getPreferredLanguage(['fr', 'en']);
        return $this->redirectToRoute('app_signin', ['lng' => $preferredLanguage]);
    }

    #[Route('/{path}', name: 'catch_all', requirements: ['path' => '.+'])]
    public function catchAll(Request $request, string $path): Response
    {
        if ($path === 'auth/callback') {
            return $this->render('main/index.html.twig', [
                'controller_name' => 'MainController',
            ]);
        }

        if (str_contains($path, 'oauth2') || str_contains($path, 'saml2')) {
            throw $this->createNotFoundException('Not Found');
        }

        $preferredLanguage = $request->getPreferredLanguage(['fr', 'en']);
        return $this->redirectToRoute('app_signin', [
            'lng' => $preferredLanguage
        ]);
    }
}
