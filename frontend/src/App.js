import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import { Provider } from "react-redux";
import { Route, Routes, Navigate } from "react-router-dom";
import store from "./redux/store";
import Accueil from "./composants/Client/Accueil";
import Boutique from "./composants/Client/Boutique";
import Produits from "./composants/Client/Produits";
import Produit from "./composants/Client/Produit";
import Contact from "./composants/Client/Contact";
import Panier from "./composants/Client/Panier";
import Connecter from "./composants/Connecter";
import Inscrire from "./composants/Inscrire";
import ForgotPassword from "./composants/ForgotPassword";
import ResetPassword from "./composants/ResetPassword";
import TableauBord from "./composants/Admin/TableauBord";
import GestionCommandes from "./composants/Admin/GestionCommandes";
import GestionUtilisateurs from "./composants/Admin/Utilisateurs/GestionUtilisateurs";
import GestionProduits from "./composants/Admin/Produits/GestionProduits";
import GestionPaiement from "./composants/Admin/GestionPaiement";
import ValiderCommande from "./composants/Client/ValiderCommande";

const App = () => (
  <Provider store={store}>
    <>
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/Boutique" element={<Boutique />} />
        <Route path="/Produits" element={<Produits />} />
        <Route path="/produit/:id" element={<Produit />} />
        <Route path="/Contact" element={<Contact />} />
        <Route path="/Panier" element={<Panier />} />
        <Route path="/Valider_Commande" element={<ValiderCommande />} />

        <Route path="/Connecter" element={<Connecter />} />
        <Route path="/Inscrire" element={<Inscrire />} />
        <Route path="/Forgot-Password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword/>} />

        <Route path="/Admin/TableauBord" element={<TableauBord />} />
        <Route path="/GestionCommandes" element={<GestionCommandes />} />
        <Route path="/GestionUtilisateurs" element={<GestionUtilisateurs/>} />    
        <Route path="/GestionProduits" element={<GestionProduits />} />
        <Route path="/GestionPaiement" element={<GestionPaiement />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  </Provider>
);

export default App;
