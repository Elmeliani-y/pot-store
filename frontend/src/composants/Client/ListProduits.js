import React, { useEffect, useState } from 'react';
import '../../App.css';

const ListProduits = () => {
  const [produites, setProduites] = useState([]);

  useEffect(() => {
    const fetchPanier = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/produites");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setProduites(data.produites);
      } catch (error) {
        console.error("Error fetching panier data:", error);
      }
    };

    fetchPanier();
  }, []);

  return (
    <div className="container produits-grid">
      {produites.slice(-8).map((produite) => (
        <div key={produite.id} className="produit-card">
          <div className="produit-image-container">
            <img
              src={`http://127.0.0.1:8000/images/${produite.image}`}
              alt={produite.nom}
              className="produit-image"
            />
          </div>
          <div className="produit-details">
            <h3 className="produit-nom">{produite.nom}</h3>
            <p className="produit-prix">{produite.prix} DH</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListProduits;