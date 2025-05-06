<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class ProduitController extends Controller
{
    /**
     * Serve product images from the storage.
     *
     * @param string $filename
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function getProductImage($filename)
    {
        $path = public_path('images/' . $filename);

        if (!file_exists($path)) {
            return response()->json(['error' => 'Image not found'], 404);
        }

        return response()->file($path, [
            'Content-Type' => mime_content_type($path),
            'Cache-Control' => 'public, max-age=31536000',
        ]);
    }
}