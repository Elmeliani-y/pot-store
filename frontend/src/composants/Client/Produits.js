import React from 'react';
import Footer from '../../layout/Footer';
import ListProduits from './ListProduits';
import BarreCategories from './BarreCategories';
import Navigation from "../../layout/Navigation";

const Produits = () => {
  return (
    <div>
      <Navigation />
      <div className="container my-4 p-0">
        <div className="content">
          <BarreCategories/>
          <ListProduits />
        </div>
      </div>

      <Footer/>
    </div>
  );
};

export default Produits;