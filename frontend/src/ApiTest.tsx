// frontend/src/ApiTest.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ApiTest: React.FC = () => {
    const [message, setMessage] = useState<string>('');

    useEffect(() => {
        // Remplacez par l'URL de votre API Symfony
        axios.get('http://localhost:8080/api/test')
            .then(response => {
                setMessage(response.data.message);
            })
            .catch(error => {
                console.error("Erreur lors de la connexion à l'API :", error);
                setMessage("Erreur de connexion à l'API");
            });
    }, []);

    return (
        <div>
            <h1>Test de la Connexion API</h1>
            <p>Message de l'API : {message}</p>
        </div>
    );
};

export default ApiTest;