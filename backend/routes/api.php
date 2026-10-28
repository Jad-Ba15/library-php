<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LoanController;
use App\Http\Controllers\MemberController;
use Illuminate\Support\Facades\Route;

// Everyone can try to log in
Route::post('/login', [AuthController::class, 'login']);

// Everything below needs a token (you must be logged in)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/dashboard', DashboardController::class);

    Route::apiResource('categories', CategoryController::class)->except('show');
    Route::apiResource('books', BookController::class);
    Route::apiResource('members', MemberController::class);

    Route::get('/loans', [LoanController::class, 'index']);
    Route::post('/loans', [LoanController::class, 'store']);
    Route::patch('/loans/{loan}/return', [LoanController::class, 'returnBook']);
});