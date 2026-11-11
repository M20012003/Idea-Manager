<?php

use App\IdeaStatus;
use App\Models\Idea;
use App\Models\Step;
use App\Models\User;

test('an idea can be updated by its owner', function () {
    $user = User::factory()->create();
    $idea = Idea::factory()->for($user)->create([
        'title' => 'Old title',
        'status' => IdeaStatus::PENDING,
    ]);

    $kept = $idea->steps()->create(['description' => 'Keep me', 'completed' => true]);
    $removed = $idea->steps()->create(['description' => 'Remove me']);

    $this->actingAs($user)
        ->put(route('idea.update', $idea), [
            'title' => 'New title',
            'description' => 'Updated description',
            'status' => IdeaStatus::COMPLETED->value,
            'links' => ['https://example.com'],
            'steps' => [
                ['id' => $kept->id, 'description' => 'Renamed step'],
                ['description' => 'Brand new step'],
            ],
        ])
        ->assertRedirect(route('idea.index'));

    $idea->refresh();

    expect($idea->title)->toBe('New title')
        ->and($idea->description)->toBe('Updated description')
        ->and($idea->status)->toBe(IdeaStatus::COMPLETED)
        ->and($idea->links->toArray())->toBe(['https://example.com'])
        ->and($idea->steps->sortBy('id')->pluck('description')->values()->all())
        ->toBe(['Renamed step', 'Brand new step'])
        ->and($idea->steps->firstWhere('id', $kept->id)->completed)->toBeTruthy()
        ->and(Step::find($removed->id))->toBeNull();
});

test('an idea cannot be updated by another user', function () {
    $owner = User::factory()->create();
    $intruder = User::factory()->create();
    $idea = Idea::factory()->for($owner)->create(['title' => 'Original title']);

    $this->actingAs($intruder)
        ->put(route('idea.update', $idea), [
            'title' => 'Hijacked title',
            'description' => 'Hijacked description',
            'status' => IdeaStatus::COMPLETED->value,
        ])
        ->assertForbidden();

    expect($idea->fresh()->title)->toBe('Original title');
});

test('updating an idea requires valid input', function () {
    $user = User::factory()->create();
    $idea = Idea::factory()->for($user)->create();

    $this->actingAs($user)
        ->put(route('idea.update', $idea), [
            'title' => '',
            'description' => '',
            'status' => IdeaStatus::PENDING->value,
        ])
        ->assertSessionHasErrors(['title', 'description']);

    expect($idea->fresh()->title)->not->toBe('');
});
