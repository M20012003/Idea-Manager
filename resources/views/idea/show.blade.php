<x-layout>
    <div class="mx-auto w-full max-w-4xl py-8">
        <a href="{{ route('idea.index') }}" class="btn btn-outlined h-9 text-xs">
            <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back to ideas
        </a>

        <article class="mt-6 overflow-hidden rounded-3xl border border-border bg-card/70">
            @if ($idea->image_path)
                <img
                    src="{{ Storage::disk('public')->url($idea->image_path) }}"
                    alt="{{ $idea->title }}"
                    class="h-60 w-full object-cover md:h-80"
                >
            @endif

            <div class="p-6 md:p-8">
                <div class="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 class="text-3xl font-bold tracking-tight">{{ $idea->title }}</h1>

                        <div class="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <x-idea.status-label :status="$idea->status">{{ $idea->status->label() }}</x-idea.status-label>
                            <span class="font-mono">{{ $idea->created_at->diffForHumans() }}</span>
                        </div>
                    </div>

                    <div class="flex items-center gap-2">
                        <button
                            type="button"
                            x-data
                            @click="$dispatch('open-modal', 'edit-idea-{{ $idea->id }}')"
                            data-test="edit-idea-button"
                            class="btn btn-outlined h-9 text-xs"
                        >
                            <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                            </svg>
                            Edit
                        </button>

                        <form action="{{ route('idea.destroy', $idea) }}" method="POST">
                            @csrf
                            @method('DELETE')

                            <button type="submit" class="btn btn-danger btn-outlined h-9 text-xs">
                                <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.6" stroke="currentColor" aria-hidden="true">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                </svg>
                                Delete
                            </button>
                        </form>
                    </div>
                </div>

                <p class="mt-6 whitespace-pre-line text-sm leading-relaxed text-foreground/90">{{ $idea->description }}</p>
            </div>
        </article>

        @if ($idea->links?->count())
            <section class="mt-8">
                <h2 class="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">links</h2>

                <div class="mt-3 space-y-2">
                    @foreach ($idea->links as $link)
                        <a
                            href="{{ $link }}"
                            target="_blank"
                            rel="noopener"
                            class="flex items-center gap-3 rounded-xl border border-border bg-card/60 px-4 py-3 text-sm text-info transition hover:border-info/50 hover:bg-info/5"
                        >
                            <svg class="h-4 w-4 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.6" stroke="currentColor" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                            </svg>
                            <span class="truncate">{{ $link }}</span>
                        </a>
                    @endforeach
                </div>
            </section>
        @endif

        @php
            $totalSteps = $idea->steps->count();
            $doneSteps = $idea->steps->where('completed', true)->count();
            $progress = $totalSteps > 0 ? (int) round($doneSteps / $totalSteps * 100) : 0;
        @endphp

        <section class="mt-8">
            <div class="flex items-end justify-between gap-4">
                <h2 class="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">action steps</h2>

                @if ($totalSteps)
                    <span class="font-mono text-[11px] text-muted-foreground">{{ $doneSteps }}/{{ $totalSteps }} done</span>
                @endif
            </div>

            @if ($totalSteps)
                <div class="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div class="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500" style="width: {{ $progress }}%"></div>
                </div>
            @endif

            <ul class="mt-4 space-y-2">
                @forelse ($idea->steps as $step)
                    <li>
                        <form method="POST" action="{{ route('step.toggle', $step) }}">
                            @csrf
                            @method('PATCH')

                            <button
                                type="submit"
                                class="flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition {{ $step->completed ? 'border-success/30 bg-success/5 text-muted-foreground' : 'border-border bg-card/60 text-foreground hover:border-primary/50 hover:bg-primary/5' }}"
                            >
                                <span class="grid h-5 w-5 shrink-0 place-items-center rounded-md border {{ $step->completed ? 'border-success bg-success text-background' : 'border-border' }}">
                                    @if ($step->completed)
                                        <svg class="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" aria-hidden="true">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                        </svg>
                                    @endif
                                </span>

                                <span class="{{ $step->completed ? 'line-through decoration-success/60' : '' }}">{{ $step->description }}</span>
                            </button>
                        </form>
                    </li>
                @empty
                    <li class="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                        No steps yet — add them the next time you capture an idea.
                    </li>
                @endforelse
            </ul>
        </section>
    </div>

    <x-idea.edit-modal :idea="$idea" />
</x-layout>
