import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Footer from '../../layout/Footer';
import LoadingScreen from '../../layout/LoadingScreen';
import Navigation from "../../layout/Navigation";
import '../../App.css';

const Produit = () => {
  const { id } = useParams();
  const [produit, setProduit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantite, setQuantite] = useState(1);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProduit = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/produites/${id}`);
        if (!response.ok) {
          throw new Error(`Erreur HTTP! Statut: ${response.status}`);
        }
        const data = await response.json();
        setProduit(data);
      } catch (err) {
        console.error("Erreur de chargement:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduit();
  }, [id]);

  // Updated handleAddToCart to handle local storage when logged out
  const handleAddToCart = () => {
    if (quantite > produit.stock) {
      alert("La quantité demandée dépasse le stock disponible.");
      return;
    }

    const token = localStorage.getItem("authToken");
    const cartItem = {
      id: produit.id,
      nom: produit.nom,
      prix: produit.prix,
      quantité: quantite,
      image: produit.image,
    };

    if (!token) {
      // Handle local storage for logged-out users
      const localCart = JSON.parse(localStorage.getItem("panier")) || [];
      const existingItem = localCart.find((item) => item.id === produit.id);

      if (existingItem) {
        existingItem.quantité += quantite;
      } else {
        localCart.push(cartItem);
      }

      localStorage.setItem("panier", JSON.stringify(localCart));
      alert("Produit ajouté au panier local.");
    } else {
      // Dispatch Redux action for logged-in users
      dispatch({
        type: "AJOUTER_AU_PANIER",
        payload: cartItem,
      });
      alert("Produit ajouté au panier.");
    }

    console.log(`Added ${quantite} of product ${produit.nom} to cart.`);
  };

  if (loading) return <LoadingScreen />;
  if (error) return <div className="error">Erreur: {error}</div>;
  if (!produit) return <div className="empty">Produit introuvable</div>;

  return (
    <>
      <Navigation />
      <div className="produit-page">
        <main className="produit-container">
          <img
            src={`http://127.0.0.1:8000/images/${produit.image}`}
            alt={produit.nom}
            className="produit-image-large"
          />
          <div className="produit-details">
            <h1 className="produit-title">{produit.nom}</h1>
            <p className="produit-description">{produit.description}</p>
            <p className="produit-prix">Prix: {produit.prix} DH</p>
            <p className="produit-stock">Stock disponible: {produit.stock}</p>
            <div className="quantity-controls">
              <button
                className="quantity-button"
                onClick={() => setQuantite((prev) => Math.max(prev - 1, 1))}
                disabled={quantite <= 1}
              >
                -
              </button>
              <span>{quantite}</span>
              <button
                className="quantity-button"
                onClick={() => setQuantite((prev) => prev + 1)}
                disabled={quantite >= produit.stock}
              >
                +
              </button>
            </div>
            <button className="add-to-cart-btn" onClick={handleAddToCart}>
              Ajouter au panier
            </button>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Produit;