<?php

/**
 * Script de test pour le compte de démonstration
 * 
 * Ce script vérifie que le compte de démonstration a été créé correctement
 * et affiche un résumé des données générées.
 */

require_once __DIR__ . '/../vendor/autoload.php';

use Symfony\Component\Dotenv\Dotenv;

// Charger les variables d'environnement
$dotenv = new Dotenv();
$dotenv->load(__DIR__ . '/../.env');

// Configuration de la base de données depuis DATABASE_URL
$databaseUrl = $_ENV['DATABASE_URL'] ?? 'postgresql://postgres:mypgdbpass@postgres:5432/postgres';
$urlParts = parse_url($databaseUrl);

$host = $urlParts['host'];
$port = $urlParts['port'];
$dbname = ltrim($urlParts['path'], '/');
$username = $urlParts['user'];
$password = $urlParts['pass'];

try {
    $pdo = new PDO("pgsql:host=$host;port=$port;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "🔗 Connexion à la base de données réussie\n\n";
    
    // Vérifier l'utilisateur de démonstration
    $stmt = $pdo->prepare("
        SELECT u.id, u.name, u.email, u.cognito_id, ug.name as group_name 
        FROM \"user\" u 
        LEFT JOIN user_group ug ON u.user_group_id = ug.id 
        WHERE u.email = 'tifasek566@ethsms.com'
    ");
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        echo "✅ Utilisateur de démonstration trouvé:\n";
        echo "   - ID: {$user['id']}\n";
        echo "   - Nom: {$user['name']}\n";
        echo "   - Email: {$user['email']}\n";
        echo "   - Cognito ID: {$user['cognito_id']}\n";
        echo "   - Groupe: {$user['group_name']}\n\n";
    } else {
        echo "❌ Utilisateur de démonstration non trouvé\n";
        exit(1);
    }
    
    // Compter les entreprises
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM company");
    $companyCount = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    echo "📊 Nombre d'entreprises créées: $companyCount\n";
    
    // Compter les investissements
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM company_investment WHERE user_id = " . $user['id']);
    $investmentCount = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    echo "💰 Nombre d'investissements: $investmentCount\n";
    
    // Calculer le montant total investi
    $stmt = $pdo->query("SELECT SUM(amount) as total FROM company_investment WHERE user_id = " . $user['id']);
    $totalAmount = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    $formattedAmount = number_format($totalAmount, 0, ',', ' ');
    echo "💵 Montant total investi: $formattedAmount EUR\n\n";
    
    // Afficher le top 5 des investissements
    echo "🏆 Top 5 des plus gros investissements:\n";
    $stmt = $pdo->query("
        SELECT c.denomination, ci.amount, ci.funding_type, ci.invested_at
        FROM company_investment ci 
        JOIN company c ON ci.company_id = c.id 
        WHERE ci.user_id = " . $user['id'] . "
        ORDER BY ci.amount DESC 
        LIMIT 5
    ");
    
    while ($investment = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $amount = number_format($investment['amount'], 0, ',', ' ');
        $date = date('d/m/Y', strtotime($investment['invested_at']));
        echo "   - {$investment['denomination']}: $amount EUR ({$investment['funding_type']}) - $date\n";
    }
    
    echo "\n";
    
    // Afficher la répartition par secteur
    echo "📈 Répartition par secteur:\n";
    $stmt = $pdo->query("
        SELECT c.sector, COUNT(*) as nb_companies, SUM(ci.amount) as total_amount
        FROM company_investment ci 
        JOIN company c ON ci.company_id = c.id 
        WHERE ci.user_id = " . $user['id'] . "
        GROUP BY c.sector 
        ORDER BY total_amount DESC
    ");
    
    while ($sector = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $amount = number_format($sector['total_amount'], 0, ',', ' ');
        echo "   - {$sector['sector']}: {$sector['nb_companies']} entreprise(s) - $amount EUR\n";
    }
    
    echo "\n✅ Test du compte de démonstration terminé avec succès!\n";
    echo "\n📋 Identifiants de connexion:\n";
    echo "   - Email: tifasek566@ethsms.com\n";
    echo "   - Mot de passe: Tifasek566@ethsms.com\n";
    
} catch (PDOException $e) {
    echo "❌ Erreur de connexion à la base de données: " . $e->getMessage() . "\n";
    exit(1);
} catch (Exception $e) {
    echo "❌ Erreur: " . $e->getMessage() . "\n";
    exit(1);
} 