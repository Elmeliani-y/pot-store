<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Produite;

class ProduitController extends Controller
{
   
    public function index()
    {
        $products = Produite::all(); // Fetch all products
        foreach ($products as $product) {
            if (!$product->image) {
                $product->image = url('images/default.png');
            }
        }
        return response()->json($products);
    }

    
     
     public function store(Request $request)
     {
         $request->validate([
             'nom' => 'required|string|max:255',
             'description' => 'required|string',
             'prix' => 'required|numeric',
             'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
             'quantité' => 'required|integer',
             'id_categorie' => 'required|exists:categories,id',
         ]);
     
         $imagePath = null;
     
         if ($request->hasFile('image')) {
             $image = $request->file('image');
             $extension = $image->getClientOriginalExtension();
     
             // Nettoyer le nom du produit pour en faire un nom de fichier sûr
             $cleanName = preg_replace('/[^a-zA-Z0-9_-]/', '_', strtolower($request->nom));
             $imageName = $cleanName . '.' . $extension;
     
             // Enregistrer dans public/images
             $image->move(public_path('images'), $imageName);
     
             // Chemin relatif pour la base de données
             $imagePath = $imageName;
         }
     
         $produit = new Produite([
             'nom' => $request->nom,
             'description' => $request->description,
             'prix' => $request->prix,
             'image' => $imagePath,
             'quantité' => $request->quantité,
             'id_categorie' => $request->id_categorie,
         ]);
     
         $produit->save();
     
         return response()->json($produit, 201);
     }
     

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $produit = Produite::find($id);

        if (!$produit) {
            return response()->json(['message' => 'Produit non trouvé'], 404);
        }

        return response()->json($produit);
    }

   
    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $produit = Produite::find($id);
    
        if (!$produit) {
            return response()->json(['message' => 'Produit non trouvé'], 404);
        }
    
        // Valider les champs
        $request->validate([
            'nom' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'prix' => 'sometimes|required|numeric',
            'image' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
            'quantité' => 'sometimes|required|integer',
            'id_categorie' => 'sometimes|required|exists:categories,id',
        ]);
    
        // Mettre à jour les champs
        $produit->nom = $request->nom ?? $produit->nom;
        $produit->description = $request->description ?? $produit->description;
        $produit->prix = $request->prix ?? $produit->prix;
        $produit->quantité = $request->quantité ?? $produit->quantité;
        $produit->id_categorie = $request->id_categorie ?? $produit->id_categorie;
    
        // Si une nouvelle image est fournie
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $extension = $image->getClientOriginalExtension();
            $cleanName = preg_replace('/[^a-zA-Z0-9_-]/', '_', strtolower($produit->nom));
            $imageName = $cleanName . '.' . $extension;
    
            $image->move(public_path('images'), $imageName);
            $produit->image = $imageName;
        }
    
        $produit->save();
    
        return response()->json(['message' => 'Produit mis à jour avec succès', 'produit' => $produit]);
    }
    
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
{
    $produit = Produite::find($id);

    if (!$produit) {
        return response()->json(['message' => 'Produit non trouvé'], 404);
    }

    $produit->delete();

    return response()->json(['message' => 'Produit supprimé avec succès']);
}
    public function getProductImage($filename)
    {
        $path = storage_path('app/public/images/' . $filename);
        if (!file_exists($path)) {
            return response()->json(['error' => 'Image not found'], 404);
        }
        return response()->file($path);
    }
}