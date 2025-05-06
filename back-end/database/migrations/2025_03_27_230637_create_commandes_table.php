<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('commandes')) {
            Schema::create('commandes', function (Blueprint $table) {
                $table->id();
                $table->string('numero_commande');
                $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade');
                $table->string('nom');
                $table->string('prenom');
                $table->string('email');
                $table->string('telephone');
                $table->string('adress');
                $table->string('ville');
                $table->string('pays')->default('Maroc');
                $table->text('notes')->nullable();
                $table->foreignId('ligne_commande_id')->nullable()->constrained('ligne_commandes')->onDelete('cascade');
                $table->float('total_produits');
                $table->float('frais_livraison');
                $table->float('total');
                $table->string('methode_paiement')->default('à la livraison');
                $table->enum('statut', ['en_attente', 'En cour', 'Livre'])->default('en_attente');
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('commandes');
    }
};