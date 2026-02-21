<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('home');

Route::get('dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('kanban/login', fn () => Inertia::render('kanban/Login'))->name('kanban.login');
Route::get('kanban/register', fn () => Inertia::render('kanban/Register'))->name('kanban.register');
Route::get('kanban/workspaces', fn () => Inertia::render('kanban/Workspaces'))->name('kanban.workspaces');
Route::get('kanban', fn () => Inertia::render('kanban/Board'))->name('kanban.board');
