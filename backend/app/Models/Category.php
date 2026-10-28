<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    // The categories table has no created_at / updated_at
    public $timestamps = false;

    protected $fillable = ['name', 'description'];

    // One category has many books
    public function books()
    {
        return $this->hasMany(Book::class);
    }
}