<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;

    // Our users table has created_at but no updated_at
    const UPDATED_AT = null;

    protected $fillable = ['name', 'email', 'password_hash', 'role'];

    // Never send the password hash to the frontend
    protected $hidden = ['password_hash'];

    // Tell Laravel which column holds the password
    public function getAuthPassword()
    {
        return $this->password_hash;
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }
}