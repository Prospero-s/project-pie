<?php 

namespace App\Controller;

use App\Form\StartupType;
use App\Bundle\FrameworkBundle\Controller\AbstractController;
use App\Component\HttpFoundation\Response;
use App\Component\HttpFoundation\Request;
use App\Component\Routing\Annotation\Route;
use App\Contracts\HttpClient\HttpClientInterface;

class CompanyController extends AbstractController{

    private HttpClientInterface $httpClient;

    public function __construct(HttpClientInterface $httpClient)
    {
        $this->httpClient = $httpClient;
    }

    public function createStartup(Request $request): Response
    {
        // Créer le formulaire avec StartupType
        $form = $this->createForm(StartupType::class);
    
        $form->handleRequest($request);
    
        $data = null;
        $errorMessage = null;
    
        if ($form->isSubmitted() && $form->isValid()) {
            $siren = $form->get('siren')->getData();
    
            if (!preg_match('/^\\d{9}$/', $siren)) {
                $errorMessage = "SIREN invalide. Veuillez vérifier et réessayer.";
            } else {
                try {
                    $response = $this->httpClient->request('GET', "https://api.inpi.fr/entreprise/$siren", [
                        'headers' => [
                            'Authorization' => 'Bearer YOUR_API_TOKEN_HERE',
                        ],
                    ]);
    
                    if ($response->getStatusCode() === 200) {
                        $data = $response->toArray();
                    } else {
                        $errorMessage = "Informations non disponibles pour ce SIREN.";
                    }
                } catch (\Exception $e) {
                    $errorMessage = "Une erreur s'est produite lors de la récupération des données.";
                }
            }
        }
    
        return $this->render('startup/create.html.twig', [
            'form' => $form->createView(),
            'data' => $data,
            'error' => $errorMessage,
        ]);
    }
    
}
