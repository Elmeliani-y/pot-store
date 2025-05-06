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

// Function to fetch the cart from the API
export const fetchPanier = () => async (dispatch) => {
  dispatch(fetchPanierRequest());
  try {
    const response = await fetch('http://127.0.0.1:8000/api/ligne-commandes');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    dispatch(fetchPanierSuccess(data));
  } catch (error) {
    dispatch(fetchPanierFailure(error.message));
  }
};

// Function to update the quantity in the API
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
    dispatch(modifierQuantite(itemId, newQuantity)); // Update Redux state
  } catch (error) {
    console.error('Error updating quantity:', error);
  }
};

const initialPanierState = {
  panier: JSON.parse(localStorage.getItem("panier")) || [],
  produits: [],
  loading: false,
  error: null,
};

// Ensure localStorage is cleared if the user is not logged in
if (!localStorage.getItem("authToken")) {
  localStorage.setItem("panier", JSON.stringify([]));
}

const panierReducer = (state = initialPanierState, action) => {
  console.log('Processing action in panierReducer:', action);
  switch (action.type) {
    case 'FETCH_PANIER_REQUEST':
      return { ...state, loading: true, error: null };
    case 'FETCH_PANIER_SUCCESS': {
      console.log('FETCH_PANIER_SUCCESS action payload:', action.payload);
      const updatedState = {
        ...state,
        loading: false,
        panier: action.payload.ligneCommandes || JSON.parse(localStorage.getItem("panier")) || [],
      };
      return updatedState;
    }
    case 'FETCH_PANIER_FAILURE':
      return { ...state, loading: false, error: action.payload };
    case 'MODIFIER_QUANTITE': {
      const updatedPanier = state.panier.map((item) =>
        item.id === action.payload.itemId
          ? { ...item, quantité: action.payload.newQuantity }
          : item
      );
      localStorage.setItem("panier", JSON.stringify(updatedPanier));
      return { ...state, panier: updatedPanier };
    }
    case 'AJOUTER_AU_PANIER': {
      const existingProduct = state.panier.find((item) => item.id === action.payload.id);
      let updatedPanier;
      
      if (existingProduct) {
        updatedPanier = state.panier.map(item =>
          item.id === action.payload.id
            ? { ...item, quantité: item.quantité + 1 }
            : item
        );
      } else {
        updatedPanier = [...state.panier, action.payload];
      }
      
      localStorage.setItem("panier", JSON.stringify(updatedPanier));
      return { ...state, panier: updatedPanier };
    }
    case 'AJOUTER_AU_PANIER_ERREUR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

export default panierReducer;
