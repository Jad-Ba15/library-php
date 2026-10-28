<?php

namespace App\Http\Controllers;

use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class BookController extends Controller
{
    // GET /api/books?q=php&category_id=1&available=1&page=1
    public function index(Request $request)
    {
        $query = Book::with('category:id,name');

        // Search in title, author or ISBN
        if ($q = $request->query('q')) {
            $query->where(function ($w) use ($q) {
                $w->where('title', 'like', "%{$q}%")
                  ->orWhere('author', 'like', "%{$q}%")
                  ->orWhere('isbn', 'like', "%{$q}%");
            });
        }

        if ($categoryId = $request->query('category_id')) {
            $query->where('category_id', $categoryId);
        }

        // Only books that can be borrowed now
        if ($request->boolean('available')) {
            $query->where('available_copies', '>', 0);
        }

        return $query->orderBy('title')->paginate($request->integer('per_page', 10));
    }

    // GET /api/books/{id}
    public function show(Book $book)
    {
        return $book->load([
            'category:id,name',
            'loans' => fn ($q) => $q->with('member:id,full_name')->orderByDesc('id'),
        ]);
    }

    // POST /api/books
    public function store(Request $request)
    {
        $data = $this->validateBook($request);

        // A new book: all copies are on the shelf
        $data['available_copies'] = $data['total_copies'];

        $book = Book::create($data);

        return response()->json($book->load('category:id,name'), 201);
    }

    // PUT /api/books/{id}
    public function update(Request $request, Book $book)
    {
        $data = $this->validateBook($request, $book);

        // Copies that are borrowed right now
        $borrowed = $book->total_copies - $book->available_copies;

        if ($data['total_copies'] < $borrowed) {
            throw ValidationException::withMessages([
                'total_copies' => "{$borrowed} copies are borrowed now, so total copies can't be less than {$borrowed}.",
            ]);
        }

        $data['available_copies'] = $data['total_copies'] - $borrowed;

        $book->update($data);

        return $book->load('category:id,name');
    }

    // DELETE /api/books/{id}   (admin only)
    public function destroy(Request $request, Book $book)
    {
        abort_unless($request->user()->isAdmin(), 403, 'Only an admin can delete books.');

        if ($book->loans()->whereNull('return_date')->exists()) {
            abort(422, 'This book is borrowed now. Wait until it is returned.');
        }

        $book->delete();

        return response()->json(['message' => 'Book deleted.']);
    }

    // Same rules for create and update
    private function validateBook(Request $request, ?Book $book = null): array
    {
        return $request->validate([
            'title'        => 'required|string|max:200',
            'author'       => 'required|string|max:150',
            'isbn'         => ['nullable', 'string', 'max:20', Rule::unique('books', 'isbn')->ignore($book?->id)],
            'year'         => 'nullable|integer|min:0|max:' . date('Y'),
            'category_id'  => 'nullable|integer|exists:categories,id',
            'total_copies' => 'required|integer|min:1|max:1000',
            'description'  => 'nullable|string',
        ]);
    }
}