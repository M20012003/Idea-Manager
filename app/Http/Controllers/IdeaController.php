<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreIdeaRequest;
use App\Http\Requests\UpdateIdeaRequest;
use App\IdeaStatus;
use App\Models\Idea;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\View\View;

class IdeaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): View
    {
        /** @var User $user */
        $user = Auth::user();

        $ideas = $user
            ->ideas()
            ->withCount('steps')
            ->with(['steps' => fn ($query) => $query->orderBy('id')])
            ->when(in_array($request->status, IdeaStatus::values()), fn ($query) => $query->where('status', $request->status))
            ->latest()
            ->get();

        return view('idea.index', [
            'ideas' => $ideas,
            'statusCounts' => Idea::statusCounts($user),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): void
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreIdeaRequest $request): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        $idea = $user->ideas()->create($request->safe()->except(['steps', 'image']));

        $steps = collect($request->input('steps', []))
            ->map(fn (string $step): array => ['description' => $step])
            ->all();

        if ($steps !== []) {
            $idea->steps()->createMany($steps);
        }

        if ($request->hasFile('image')) {
            $idea->update([
                'image_path' => $request->file('image')->storePublicly('ideas', 'public'),
            ]);
        }

        return redirect()->route('idea.index')->with('success', 'Your idea has been created!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Idea $idea): View
    {
        $this->authorize('view', $idea);

        $idea->load('steps');

        return view('idea.show', [
            'idea' => $idea,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Idea $idea): void
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateIdeaRequest $request, Idea $idea): RedirectResponse
    {
        $this->authorize('update', $idea);

        $idea->update($request->safe()->except(['steps', 'image', 'remove_image']));

        $this->syncSteps($idea, $request->input('steps', []));

        if ($request->boolean('remove_image') && $idea->image_path) {
            Storage::disk('public')->delete($idea->image_path);

            $idea->update(['image_path' => null]);
        }

        if ($request->hasFile('image')) {
            if ($idea->image_path) {
                Storage::disk('public')->delete($idea->image_path);
            }

            $idea->update([
                'image_path' => $request->file('image')->storePublicly('ideas', 'public'),
            ]);
        }

        return redirect()->route('idea.index')->with('success', 'Your idea has been updated!');
    }

    /**
     * Sync the action steps of the given idea with the submitted list.
     *
     * @param  array<int, array{id?: int|string|null, description: string}>  $steps
     */
    private function syncSteps(Idea $idea, array $steps): void
    {
        $existing = $idea->steps()->get()->keyBy('id');
        $kept = [];

        foreach ($steps as $step) {
            $id = isset($step['id']) && $step['id'] !== null ? (int) $step['id'] : null;

            if ($id !== null && $existing->has($id)) {
                $existing->get($id)->update(['description' => $step['description']]);
                $kept[] = $id;

                continue;
            }

            $kept[] = $idea->steps()->create(['description' => $step['description']])->id;
        }

        $idea->steps()->whereNotIn('id', $kept)->delete();
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Idea $idea): RedirectResponse
    {
        $this->authorize('delete', $idea);

        $idea->steps()->delete();

        if ($idea->image_path) {
            Storage::disk('public')->delete($idea->image_path);
        }

        $idea->delete();

        return redirect()->route('idea.index')->with('success', 'Your idea has been deleted.');
    }
}
