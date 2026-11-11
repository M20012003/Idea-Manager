<?php

use App\Models\User;
use Tests\TestCase;

it('logs in a user', function () {

    $user = User::factory()->create(['password' => '123456789']);
    /** @var TestCase $this */
    $this->post('/login', [
        'email' => $user->email,
        'password' => '123456789',
    ])->assertRedirect('/');

    $this->assertAuthenticated();
    $this->assertAuthenticatedAs($user);

});

it('logs out a user', function () {

    $user = User::factory()->create();
    /** @var TestCase $this */
    $this->actingAs($user)
        ->post('/logout')
        ->assertRedirect('/');

    $this->assertGuest();

});
