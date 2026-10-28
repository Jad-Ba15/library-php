<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class Loan extends Model
{
    // The loans table has no created_at / updated_at
    public $timestamps = false;

    protected $fillable = [
        'book_id', 'member_id', 'user_id',
        'loan_date', 'due_date', 'return_date', 'fine',
    ];

    protected $casts = [
        'loan_date'   => 'date:Y-m-d',
        'due_date'    => 'date:Y-m-d',
        'return_date' => 'date:Y-m-d',
        'fine'        => 'decimal:2',
    ];

    // Always add "status" when a loan is sent as JSON
    protected $appends = ['status'];

    // status = returned / overdue / active
    protected function status(): Attribute
    {
        return Attribute::get(function () {
            if ($this->return_date) {
                return 'returned';
            }
            return $this->due_date->lt(today()) ? 'overdue' : 'active';
        });
    }

    public function book()
    {
        return $this->belongsTo(Book::class);
    }

    public function member()
    {
        return $this->belongsTo(Member::class);
    }

    // The staff user who created the loan
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}