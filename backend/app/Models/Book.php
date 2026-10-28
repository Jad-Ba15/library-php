<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    protected $fillable = [
        'title', 'author', 'isbn', 'year', 'category_id',
        'total_copies', 'available_copies', 'description',
    ];

    protected $casts = [
        'year'             => 'integer',
        'category_id'      => 'integer',
        'total_copies'     => 'integer',
        'available_copies' => 'integer',
    ];

    // Each book belongs to one category
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    // A book can be borrowed many times
    public function loans()
    {
        return $this->hasMany(Loan::class);
    }
}