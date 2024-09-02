import { WalletFilled, WalletOutlined } from '@ant-design/icons';
import { Button, notification } from 'antd';
import { deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';

import { firestore } from '@/firebase/firebaseConfig';
import { useAuth } from '@/hooks/useAuth';

interface FavoriteButtonProps {
  SIREN: string;
  startupName: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  SIREN,
  startupName,
}) => {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (user) {
      const checkFavorite = async () => {
        const favoriteDocRef = doc(
          firestore,
          'users',
          user.id,
          'favorites',
          SIREN,
        );
        const favoriteDoc = await getDoc(favoriteDocRef);
        if (favoriteDoc.exists()) {
          setIsFavorite(true);
        }
      };

      checkFavorite();
    }
  }, [user, SIREN]);

  const toggleFavorite = async () => {
    if (!user) {
      console.error('User not logged in');
      return;
    }
    const favoriteDocRef = doc(firestore, 'users', user.id, 'favorites', SIREN);
    try {
      if (isFavorite) {
        await deleteDoc(favoriteDocRef);
        setIsFavorite(false);
        notification.success({
          message: 'Favori supprimé',
          description: `${startupName} a été supprimé de vos favoris.`,
        });
      } else {
        await setDoc(favoriteDocRef, {
          name: startupName,
          SIREN: SIREN,
        });
        setIsFavorite(true);
        notification.success({
          message: 'Favori ajouté',
          description: `${startupName} a été ajouté à vos favoris.`,
        });
      }
    } catch (error) {
      console.error('Error updating favorite: ', error);
      notification.error({
        message: 'Erreur',
        description: `Une erreur s'est produite lors de la mise à jour des favoris.`,
      });
    }
  };

  return (
    <Button
      onClick={toggleFavorite}
      type="text"
      icon={
        isFavorite ? (
          <WalletFilled style={{ color: '#1c2434' }} />
        ) : (
          <WalletOutlined />
        )
      }
    >
      {isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    </Button>
  );
};

export default FavoriteButton;
