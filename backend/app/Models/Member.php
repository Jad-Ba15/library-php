<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Member extends Model
{
    // The members table has created_at but no updated_at
    const UPDATED_AT = null;

    protected $fillable = ['full_name', 'email', 'phone', 'address', 'status'];

    // A member can borrow many books
    public function loans()
    {
        return $this->hasMany(Loan::class);
    }
}