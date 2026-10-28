<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    // GET /api/categories
    public function index()
    {
        return Category::withCount('books')->orderBy('name')->get();
    }

    // POST /api/categories
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:100|unique:categories,name',
            'description' => 'nullable|string|max:255',
        ]);

        return response()->json(Category::create($data), 201);
    }

    // PUT /api/categories/{id}
    public function update(Request $request, Category $category)
    {
        $data = $request->validate([
            'name'        => ['required', 'string', 'max:100', Rule::unique('categories', 'name')->ignore($category->id)],
            'description' => 'nullable|string|max:255',
        ]);

        $category->update($data);

        return $category;
    }

    // DELETE /api/categories/{id}   (admin only)
    public function destroy(Request $request, Category $category)
    {
        abort_unless($request->user()->isAdmin(), 403, 'Only an admin can delete categories.');

        // Books in this category are kept (their category becomes empty)
        $category->delete();

        return response()->json(['message' => 'Category deleted.']);
    }
}