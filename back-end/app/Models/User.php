<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject; // Import the JWTSubject interface

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'nom',
        'prenom',
        'telephone',
        'ville',
        'adress',
        'email',
        'password',
        'reset_token',          
        'reset_token_expires_at'
    ];

    /**
     * The attributes that should be set by default.
     *
     * @var array
     */
    protected $attributes = [
        'role' => 'client', // Default role is client
    ];

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     *
     * @return mixed
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }
    public function getJWTCustomClaims()
    {
        return ['role' => $this->role];
    }
    public function commandes()
    {
        return $this->hasMany(Commande::class);
    }
}