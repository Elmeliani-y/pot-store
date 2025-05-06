import React, { useEffect, useState } from 'react';
import Footer from '../../layout/Footer';
import Slider from '../../layout/slider';
import BarreCategories from './BarreCategories';
import '../../App.css';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ajouterAuPanier } from '../../redux/actions/panierActions';
import logo from '../../Images/PHFOOTER1.png';
import LoadingScreen from '../../layout/LoadingScreen';
import Navigation from "../../layout/Navigation";

const Accueil = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduits = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/produites");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
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

  if (loading) return <LoadingScreen />;
  if (error) return <div className="error">Erreur: {error}</div>;
  if (produits.length === 0) return <div className="empty">Aucun produit disponible</div>;

  return (
    <>
      <Navigation />
      <div className="accueil-container">
        <Slider />
        <main className="main-content">
          <aside>
            <BarreCategories />
          </aside>
          <section className="products-section">
            <div className="products-grid">
              {produits.slice(0, 3).map((produit) => (
                <div
                  key={produit.id}
                  className="product-card"
                  onClick={() => navigate(`/produit/${produit.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="product-image-wrapper">
                    <img
                      src={`http://127.0.0.1:8000/images/${produit.image}`}
                      alt={produit.nom}
                      className="product-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = require('../../Images/default-image.png');
                      }}
                    />
                    <div className="product-hover-overlay">
                      <button
                        className="cart-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(ajouterAuPanier(produit));
                        }}
                      >
                        <span className="cart-icon">🛒</span>
                        <span className="tooltip">Ajouter au panier</span>
                      </button>
                    </div>
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{produit.nom}</h3>
                    <p className="product-price">{produit.prix} DH</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Accueil;
