<?php

namespace App\Http\Controllers;

use App\Models\Member;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MemberController extends Controller
{
    // GET /api/members?q=ali&status=active&page=1
    public function index(Request $request)
    {
        $query = Member::withCount([
            'loans as active_loans_count' => fn ($q) => $q->whereNull('return_date'),
        ]);

        if ($q = $request->query('q')) {
            $query->where(function ($w) use ($q) {
                $w->where('full_name', 'like', "%{$q}%")
                  ->orWhere('email', 'like', "%{$q}%")
                  ->orWhere('phone', 'like', "%{$q}%");
            });
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        return $query->orderBy('full_name')->paginate($request->integer('per_page', 10));
    }

    // GET /api/members/{id}   -> member + all their loans
    public function show(Member $member)
    {
        return $member->load([
            'loans' => fn ($q) => $q->with('book:id,title,author')->orderByDesc('id'),
        ]);
    }

    // POST /api/members
    public function store(Request $request)
    {
        $member = Member::create($this->validateMember($request));

        return response()->json($member, 201);
    }

    // PUT /api/members/{id}
    public function update(Request $request, Member $member)
    {
        $member->update($this->validateMember($request, $member));

        return $member;
    }

    // DELETE /api/members/{id}   (admin only)
    public function destroy(Request $request, Member $member)
    {
        abort_unless($request->user()->isAdmin(), 403, 'Only an admin can delete members.');

        if ($member->loans()->whereNull('return_date')->exists()) {
            abort(422, 'This member still has borrowed books.');
        }

        $member->delete();

        return response()->json(['message' => 'Member deleted.']);
    }

    private function validateMember(Request $request, ?Member $member = null): array
    {
        return $request->validate([
            'full_name' => 'required|string|max:100',
            'email'     => ['required', 'email', 'max:150', Rule::unique('members', 'email')->ignore($member?->id)],
            'phone'     => 'nullable|string|max:30',
            'address'   => 'nullable|string|max:255',
            'status'    => 'required|in:active,blocked',
        ]);
    }
}