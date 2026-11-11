<?php

declare(strict_types=1);
use App\Models\User;
use Pest\Browser\Enums\BrowserType;
use Pest\Browser\Playwright\Playwright;
use Tests\TestCase;

it('create a new idea', function (): void {
    // Chromium is unavailable offline (its download is geo-blocked); use the
    // already-installed Firefox binary so the browser suite can run without a download.
    Playwright::setDefaultBrowserType(BrowserType::FIREFOX);

    /** @var TestCase $this */
    $this->actingAs($user = User::factory()->create());

    visit('/ideas')
        ->click('@create-idea-button')
        ->fill('title', 'some Example Title')
        ->click('@button-status-completed')
        ->fill('description', 'an Example description')
        ->click('Create')
        ->assertPathIs('/ideas');

    expect($user->ideas()->first())->toMatchArray([
        'title' => 'some Example Title',
        'status' => 'completed',
        'description' => 'an Example description',
    ]);
});
