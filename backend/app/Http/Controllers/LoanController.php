<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Loan;
use App\Models\Member;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LoanController extends Controller
{
    const LOAN_DAYS    = 14;    // a book can be kept 14 days
    const MAX_LOANS    = 3;     // a member can have max 3 books at the same time
    const FINE_PER_DAY = 0.50;  // money for each late day

    // GET /api/loans?status=active|overdue|returned&q=ali&member_id=1
    public function index(Request $request)
    {
        $today = today()->toDateString();
        $query = Loan::with(['book:id,title,author', 'member:id,full_name,email']);

        $status = $request->query('status');
        if ($status === 'active') {
            $query->whereNull('return_date')->where('due_date', '>=', $today);
        } elseif ($status === 'overdue') {
            $query->whereNull('return_date')->where('due_date', '<', $today);
        } elseif ($status === 'returned') {
            $query->whereNotNull('return_date');
        }

        if ($memberId = $request->query('member_id')) {
            $query->where('member_id', $memberId);
        }

        // Search by book title or member name
        if ($q = $request->query('q')) {
            $query->where(function ($w) use ($q) {
                $w->whereHas('book', fn ($b) => $b->where('title', 'like', "%{$q}%"))
                  ->orWhereHas('member', fn ($m) => $m->where('full_name', 'like', "%{$q}%"));
            });
        }

        return $query->orderByDesc('id')->paginate($request->integer('per_page', 10));
    }

    // POST /api/loans   { book_id, member_id, days? }   -> borrow a book
    public function store(Request $request)
    {
        $data = $request->validate([
            'book_id'   => 'required|integer|exists:books,id',
            'member_id' => 'required|integer|exists:members,id',
            'days'      => 'nullable|integer|min:1|max:60',
        ]);

        // A transaction: all steps succeed together, or nothing is saved
        $loan = DB::transaction(function () use ($data, $request) {
            $book   = Book::lockForUpdate()->findOrFail($data['book_id']);
            $member = Member::findOrFail($data['member_id']);
            $today  = today();

            if ($member->status !== 'active') {
                abort(422, 'This member is blocked.');
            }
            if ($book->available_copies < 1) {
                abort(422, 'No copies of this book are available.');
            }

            $openLoans = $member->loans()->whereNull('return_date');

            if ((clone $openLoans)->where('due_date', '<', $today->toDateString())->exists()) {
                abort(422, 'This member has late books. They must return them first.');
            }
            if ((clone $openLoans)->count() >= self::MAX_LOANS) {
                abort(422, 'This member already has ' . self::MAX_LOANS . ' books.');
            }

            $book->decrement('available_copies');

            return Loan::create([
                'book_id'   => $book->id,
                'member_id' => $member->id,
                'user_id'   => $request->user()->id,
                'loan_date' => $today->toDateString(),
                'due_date'  => $today->copy()->addDays($data['days'] ?? self::LOAN_DAYS)->toDateString(),
            ]);
        });

        return response()->json($loan->load(['book:id,title,author', 'member:id,full_name,email']), 201);
    }

    // PATCH /api/loans/{id}/return   -> the member brings the book back
    public function returnBook(Loan $loan)
    {
        if ($loan->return_date) {
            abort(422, 'This book was already returned.');
        }

        DB::transaction(function () use ($loan) {
            $today    = today();
            $daysLate = $today->gt($loan->due_date)
                ? (int) $loan->due_date->diffInDays($today)
                : 0;

            $loan->update([
                'return_date' => $today->toDateString(),
                'fine'        => $daysLate * self::FINE_PER_DAY,
            ]);

            $loan->book()->increment('available_copies');
        });

        return $loan->fresh(['book:id,title,author', 'member:id,full_name,email']);
    }
}