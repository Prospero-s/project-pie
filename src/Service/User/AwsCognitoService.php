<?php

namespace App\Service\User;

use Aws\CognitoIdentityProvider\CognitoIdentityProviderClient;
use Aws\Exception\AwsException;
use Aws\Credentials\Credentials;

class AwsCognitoService
{
    private CognitoIdentityProviderClient $client;
    private string $userPoolId;

    public function __construct(
        string $region,
        string $userPoolId,
        string $accessKeyId = null,
        string $secretAccessKey = null
    ) {
        $config = [
            'version' => 'latest',
            'region' => $region,
        ];

        if ($accessKeyId && $secretAccessKey) {
            $credentials = new Credentials($accessKeyId, $secretAccessKey);
            $config['credentials'] = $credentials;
        }

        $this->client = new CognitoIdentityProviderClient($config);
        $this->userPoolId = $userPoolId;
    }

    /**
     * Vérifie si un utilisateur existe déjà dans Cognito en utilisant son email
     */
    public function userExistsByEmail(string $email): bool
    {
        try {
            $params = [
                'UserPoolId' => $this->userPoolId,
                'Filter' => 'email = "' . $email . '"',
                'Limit' => 1
            ];

            $result = $this->client->listUsers($params);

            // Si la liste des utilisateurs n'est pas vide, l'utilisateur existe
            return !empty($result['Users']);
        } catch (AwsException $e) {
            // En cas d'erreur, on considère que l'utilisateur n'existe pas
            return false;
        }
    }

    /**
     * Confirme manuellement l'inscription d'un utilisateur sans nécessiter de code de confirmation.
     */
    public function adminConfirmSignUp(string $username): bool
    {
        try {
            $this->client->adminConfirmSignUp([
                'UserPoolId' => $this->userPoolId,
                'Username' => $username,
            ]);

            return true;
        } catch (AwsException $e) {
            if ($e->getAwsErrorCode() === 'UserNotFoundException') {
                throw new \Exception('Utilisateur non trouvé');
            }

            if ($e->getAwsErrorCode() === 'NotAuthorizedException') {
                throw new \Exception('Vous n\'êtes pas autorisé à effectuer cette action');
            }

            throw new \Exception('Erreur lors de la confirmation du compte: ' . $e->getMessage());
        }
    }

    /**
     * Réinitialise manuellement le mot de passe d'un utilisateur.
     */
    public function adminResetUserPassword(string $username): bool
    {
        try {
            $this->client->adminResetUserPassword([
                'UserPoolId' => $this->userPoolId,
                'Username' => $username,
            ]);

            return true;
        } catch (AwsException $e) {
            throw new \Exception('Erreur lors de la réinitialisation du mot de passe: ' . $e->getMessage());
        }
    }

    /**
     * Définit directement le mot de passe d'un utilisateur
     */
    public function setUserPassword(string $username, string $password): bool
    {
        try {
            $this->client->adminSetUserPassword([
                'UserPoolId' => $this->userPoolId,
                'Username' => $username,
                'Password' => $password,
                'Permanent' => true
            ]);

            return true;
        } catch (AwsException $e) {
            throw new \Exception('Erreur lors de la définition du mot de passe: ' . $e->getMessage());
        }
    }
}
