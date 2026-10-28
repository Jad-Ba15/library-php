<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Category;
use App\Models\Loan;
use App\Models\Member;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    // GET /api/dashboard   -> numbers and lists for the home page
    public function __invoke()
    {
        $today = today()->toDateString();

        return response()->json([
            'stats' => [
                'books'           => Book::count(),
                'copies'          => (int) Book::sum('total_copies'),
                'available'       => (int) Book::sum('available_copies'),
                'members'         => Member::count(),
                'active_loans'    => Loan::whereNull('return_date')->count(),
                'overdue_loans'   => Loan::whereNull('return_date')->where('due_date', '<', $today)->count(),
                'fines_collected' => (float) Loan::sum('fine'),
            ],

            // Uses the VIEW we made in the database
            'overdue' => DB::table('overdue_loans')
                ->orderByDesc('days_late')
                ->limit(5)
                ->get(),

            'recent_loans' => Loan::with(['book:id,title', 'member:id,full_name'])
                ->orderByDesc('id')
                ->limit(5)
                ->get(),

            'popular_books' => Book::select('id', 'title', 'author')
                ->withCount('loans')
                ->orderByDesc('loans_count')
                ->limit(5)
                ->get(),

            'books_by_category' => Category::withCount('books')
                ->orderBy('name')
                ->get(),
        ]);
    }
}