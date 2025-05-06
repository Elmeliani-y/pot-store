export const fetchPanierRequest = () => ({ type: 'FETCH_PANIER_REQUEST' });
export const fetchPanierSuccess = (data) => ({
  type: 'FETCH_PANIER_SUCCESS',
  payload: data,
});
export const fetchPanierFailure = (error) => ({
  type: 'FETCH_PANIER_FAILURE',
  payload: error,
});

export const modifierQuantite = (itemId, newQuantity) => ({
  type: 'MODIFIER_QUANTITE',
  payload: { itemId, newQuantity },
});

// Updated ajouterAuPanier to handle cart updates on the frontend only.
export const ajouterAuPanier = (produit) => (dispatch, getState) => {
  try {
    const state = getState();
    const existingCart = state.panier.panier || [];
    const localPanier = JSON.parse(localStorage.getItem("panier")) || [];

    // Check if the product already exists in the cart
    const existingProduct = existingCart.find((item) => item.id === produit.id);
    const existingLocalProduct = localPanier.find((item) => item.id === produit.id);

    let updatedProduct;
    if (existingProduct) {
      // Increment the quantity if the product already exists
      updatedProduct = { ...existingProduct, quantité: existingProduct.quantité + 1 };
    } else {
      // Add the product to the cart if it doesn't exist
      updatedProduct = { ...produit, quantité: 1 };
    }

    // Update Redux state
    dispatch({
      type: 'AJOUTER_AU_PANIER',
      payload: updatedProduct,
    });

    // Update localStorage
    let updatedLocalPanier;
    if (existingLocalProduct) {
      updatedLocalPanier = localPanier.map(item =>
        item.id === produit.id
          ? { ...item, quantité: item.quantité + 1 }
          : item
      );
    } else {
      updatedLocalPanier = [...localPanier, { ...produit, quantité: 1 }];
    }
    localStorage.setItem("panier", JSON.stringify(updatedLocalPanier));

    // Force a cart update event
    const event = new Event('cartUpdated');
    window.dispatchEvent(event);

  } catch (error) {
    console.error('Error updating cart:', error);
    dispatch({
      type: 'AJOUTER_AU_PANIER_ERREUR',
      payload: error.message,
    });
  }
};

// Fonction pour récupérer le panier depuis l'API
export const fetchPanier = () => async (dispatch) => {
  dispatch(fetchPanierRequest());
  try {
    const response = await fetch('http://127.0.0.1:8000/api/ligne-commandes');
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    const data = await response.json();
    if (!data || !Array.isArray(data)) {
      throw new Error('Unexpected API response format');
    }
    console.log('Fetched cart data:', data); // Debug log
    dispatch(fetchPanierSuccess(data));
  } catch (error) {
    console.error('Error fetching cart data:', error);
    dispatch(fetchPanierFailure(error.message));
  }
};

// Fonction pour mettre à jour la quantité dans l'API
export const updateQuantity = (itemId, newQuantity) => async (dispatch) => {
  try {
    const response = await fetch(`http://127.0.0.1:8000/api/ligne-commandes/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ quantité: newQuantity }),
    });

    if (!response.ok) {
      throw new Error('Failed to update quantity');
    }

    const data = await response.json();
    console.log('Quantity updated successfully:', data);
    dispatch(modifierQuantite(itemId, newQuantity)); // Mettre à jour le state Redux
  } catch (error) {
    console.error('Error updating quantity:', error);
  }
};

