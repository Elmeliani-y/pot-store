import React, { useEffect, useState } from 'react';
import Footer from '../../layout/Footer';
import '../../App.css';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ajouterAuPanier } from '../../redux/actions/panierActions';
import logo from '../../Images/PHFOOTER1.png';
import LoadingScreen from '../../layout/LoadingScreen';
import Navigation from "../../layout/Navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Boutique = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const cartError = useSelector((state) => state.panier.error); 

  useEffect(() => {
    const fetchProduits = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/produites");
        if (!response.ok) {
          throw new Error(`Erreur HTTP! Statut: ${response.status}`);
        }
        const data = await response.json();
        const produitsData = Array.isArray(data.produites) ? data.produites : Array.isArray(data) ? data : [];
        setProduits(produitsData);
      } catch (err) {
        console.error("Erreur de chargement:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduits();
  }, []);

  useEffect(() => {
    console.log("Fetched produits:", produits);
  }, [produits]);

  // Updated handleAddToCart to handle local storage when logged out
  const handleAddToCart = (produit) => {
    const storedId = localStorage.getItem('userId');
    const cartItem = {
      id: produit.id,
      nom: produit.nom,
      prix: produit.prix,
      quantité: 1,
      image: produit.image,
    };

    if (!storedId) {
      const localCart = JSON.parse(localStorage.getItem("panier")) || [];
      const existingItem = localCart.find((item) => item.id === produit.id);

      if (existingItem) {
        existingItem.quantité += 1;
      } else {
        localCart.push(cartItem);
      }

      localStorage.setItem("panier", JSON.stringify(localCart));
      toast.success("Produit ajouté au panier local!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: { backgroundColor: "green", color: "white" },
      });
    } else {
      // Dispatch Redux action for logged-in users
      dispatch(ajouterAuPanier(cartItem));
      toast.success("Produit ajouté au panier!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: { backgroundColor: "green", color: "white" },
      });
    }
  };

  if (loading) return <LoadingScreen />;
  if (error) return <div className="error">Erreur: {error}</div>;

  return (
    <>
      <Navigation />
      <div className="boutique-page">
        <main className="boutique-container">
          <h1 className="boutique-title">Notre Boutique</h1>
          {cartError && <div className="error">Erreur: {cartError}</div>} {/* Display cart error */}
          <div className="produits-grid">
            {produits && produits.length > 0 ? (
              produits.map((produit) => (
                <div
                  key={produit.id}
                  className="produit-card"
                  onClick={() => navigate(`/produit/${produit.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="produit-image-container">
                    <img
                      src={`http://127.0.0.1:8000/images/${produit.image}`}
                      alt={produit.nom}
                      className="produit-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = require('../../Images/default-image.png');
                      }}
                    />
                    <div className="produit-hover-actions">
                      <button
                        className="cart-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(produit);
                        }}
                      >
                        <span className="cart-icon">🛒</span>
                        <span className="tooltip">Ajouter au panier</span>
                      </button>
                    </div>
                  </div>
                  <div className="produit-details">
                    <h3 className="produit-nom">{produit.nom}</h3>
                    <p className="produit-prix">{produit.prix} DH</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty">Aucun produit disponible</div>
            )}
          </div>
        </main>
        <Footer />
      </div>
      <ToastContainer />
    </>
  );
};

export default Boutique;