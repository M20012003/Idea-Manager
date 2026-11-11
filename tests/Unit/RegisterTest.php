<?php

use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

it('reggister  a user', function () {
    /** @var TestCase $this */
    $this->post('/register', [
        'name' => 'Mahdiye',
        'email' => 'mahdiyegholami2003@gmail.com',
        'password' => '123456789',
    ])->assertRedirect('/');

    $this->assertAuthenticated();

    expect(Auth::user())->toMatchArray([
        'name' => 'Mahdiye',
        'email' => 'mahdiyegholami2003@gmail.com',
    ]);
});
