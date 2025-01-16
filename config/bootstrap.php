use Symfony\Component\Dotenv\Dotenv;

require dirname(__DIR__).'/vendor/autoload.php';

// Charger les variables d'environnement
if (file_exists(dirname(__DIR__).'/.env')) {
    (new Dotenv())->usePutenv()->bootEnv(dirname(__DIR__).'/.env');
}
