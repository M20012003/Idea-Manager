<x-layout>
    <header class="relative mt-8 overflow-hidden rounded-3xl border border-border bg-card/60 px-6 py-10 sm:px-10 sm:py-14">
        <div class="grid-backdrop pointer-events-none absolute inset-0 opacity-70"></div>

        <div class="relative">
            <p class="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">workspace / ideas</p>
            <h1 class="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Your <span class="text-gradient">idea</span> board</h1>
            <p class="mt-3 max-w-xl text-sm text-muted-foreground">
                Capture a thought, break it into steps and ship it. Add an image so every card is recognisable at a glance.
            </p>

            <button
                type="button"
                x-data
                @click="$dispatch('open-modal', 'create-idea')"
                data-test="create-idea-button"
                class="group mt-8 flex w-full items-center gap-4 rounded-2xl border border-dashed border-border bg-card/40 p-5 text-left transition hover:border-primary/70 hover:bg-primary/5"
            >
                <span class="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-primary/30 bg-primary/10 text-primary transition group-hover:scale-105">
                    <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                </span>

                <span class="min-w-0">
                    <span class="block text-sm font-semibold text-foreground">What's the idea?</span>
                    <span class="block text-xs text-muted-foreground">Title, description, an image and the first actionable steps.</span>
                </span>
            </button>
        </div>
    </header>

    <section class="mt-8">
        <div class="flex flex-wrap items-center gap-2">
            <a href="/ideas" class="btn h-9 px-4 text-xs {{ request()->has('status') ? 'btn-outlined' : '' }}">
                All <span class="ml-2 font-mono text-[10px] opacity-70">{{ $statusCounts->get('all') }}</span>
            </a>

            @foreach (App\IdeaStatus::cases() as $status)
                <a
                    href="/ideas?status={{ $status->value }}"
                    class="btn h-9 px-4 text-xs {{ request('status') === $status->value ? '' : 'btn-outlined' }}"
                >
                    {{ $status->label() }}
                    <span class="ml-2 font-mono text-[10px] opacity-70">{{ $statusCounts->get($status->value) }}</span>
                </a>
            @endforeach
        </div>

        <div class="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            @forelse ($ideas as $idea)
                <div class="relative">
                    <x-card :padded="false" :href="route('idea.show', $idea)" class="group overflow-hidden">
                    <div class="relative h-44 overflow-hidden bg-muted">
                        @if ($idea->image_path)
                            <img
                                src="{{ Storage::disk('public')->url($idea->image_path) }}"
                                alt="{{ $idea->title }}"
                                loading="lazy"
                                class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            >
                        @else
                            <div class="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 via-card to-secondary/15">
                                <span class="font-mono text-2xl uppercase tracking-widest text-primary/70">
                                    {{ \Illuminate\Support\Str::substr($idea->title, 0, 2) }}
                                </span>
                            </div>
                        @endif

                        <div class="absolute left-3 top-3">
                            <x-idea.status-label :status="$idea->status">{{ $idea->status->label() }}</x-idea.status-label>
                        </div>
                    </div>

                    <div class="p-5">
                        <h3 class="text-base font-semibold text-foreground transition group-hover:text-primary">{{ $idea->title }}</h3>
                        <p class="mt-2 line-clamp-2 text-sm text-muted-foreground">{{ $idea->description }}</p>

                        <div class="mt-4 flex items-center justify-between border-t border-border/70 pt-3 font-mono text-[11px] text-muted-foreground">
                            <span>{{ $idea->created_at->diffForHumans() }}</span>
                            <span>{{ $idea->steps_count }} {{ \Illuminate\Support\Str::plural('step', $idea->steps_count) }}</span>
                        </div>
                    </div>
                    </x-card>

                    <button
                        type="button"
                        x-data
                        @click="$dispatch('open-modal', 'edit-idea-{{ $idea->id }}')"
                        data-test="edit-idea-button"
                        class="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-3 py-1.5 text-[11px] font-semibold text-muted-foreground backdrop-blur transition hover:border-primary/60 hover:text-primary"
                    >
                        <svg class="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                        </svg>
                        Edit
                    </button>
                </div>
            @empty
                <div class="col-span-full flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card/40 px-6 py-16 text-center">
                    <span class="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                        <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.6" stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a3 3 0 0 0 3-3V6.75a3 3 0 1 0-6 0v3a3 3 0 0 0 3 3Zm0 0V21m-6-3h12" />
                        </svg>
                    </span>
                    <p class="text-sm font-semibold text-foreground">No ideas here yet</p>
                    <p class="max-w-sm text-xs text-muted-foreground">Use the box above to capture your first idea — title, description and an image.</p>
                </div>
            @endforelse
        </div>
    </section>

    @foreach ($ideas as $idea)
        <x-idea.edit-modal :idea="$idea" />
    @endforeach

    <x-modal name="create-idea" title="New Idea" :open="$errors->any() && ! old('idea_id')">
        <form
            x-data="{
                status: 'pending',
                imagePreview: null,
                imageError: '',
                steps: @js(old('steps', [])),
                newStep: '',
                links: @js(old('links', [])),
                newLink: '',
                addStep() {
                    const value = this.newStep.trim();
                    if (value !== '' && ! this.steps.includes(value)) {
                        this.steps.push(value);
                    }
                    this.newStep = '';
                },
                addLink() {
                    const value = this.newLink.trim();
                    if (value !== '' && ! this.links.includes(value)) {
                        this.links.push(value);
                    }
                    this.newLink = '';
                },
                previewImage(event) {
                    const file = event.target.files[0];
                    this.imageError = '';

                    if (file && file.size > 2 * 1024 * 1024) {
                        const megabytes = (file.size / 1024 / 1024).toFixed(1);
                        this.imageError = 'That image is ' + megabytes + ' MB. Please choose one under 2 MB.';
                        this.imagePreview = null;
                        event.target.value = '';

                        return;
                    }

                    this.imagePreview = file ? URL.createObjectURL(file) : null;
                }
            }"
            method="POST"
            action="{{ route('idea.store') }}"
            enctype="multipart/form-data"
            class="space-y-6"
        >
            @csrf

            @if ($errors->any())
                <div class="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-destructive" role="alert">
                    <p class="text-sm font-semibold">The idea was not saved</p>
                    <ul class="mt-1 list-disc space-y-0.5 pl-5 text-xs">
                        @foreach ($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif

            <x-form.field label="Title" name="title" placeholder="What's your idea?" autofocus required />

            <div class="space-y-2">
                <span class="label">Status</span>

                <div class="flex flex-wrap gap-2">
                    @foreach (App\IdeaStatus::cases() as $status)
                        <button
                            type="button"
                            @click="status = '{{ $status->value }}'"
                            data-test="button-status-{{ $status->value }}"
                            class="btn flex-1"
                            :class="{ 'btn-outlined': status !== '{{ $status->value }}' }"
                        >
                            {{ $status->label() }}
                        </button>
                    @endforeach
                </div>

                <input type="hidden" name="status" :value="status">
                <x-form.error name="status" />
            </div>

            <x-form.field label="Description" name="description" type="textarea" placeholder="Describe your idea..." required />

            <div class="space-y-2">
                <span class="label">Featured image</span>

                <label for="image" class="file-drop">
                    <input id="image" name="image" type="file" accept="image/*" class="sr-only" @change="previewImage($event)">

                    <template x-if="! imagePreview">
                        <span class="flex flex-col items-center gap-2">
                            <span class="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.6" stroke="currentColor" aria-hidden="true">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5V6.75A2.25 2.25 0 0 1 5.25 4.5h13.5A2.25 2.25 0 0 1 21 6.75v9.75m-18 0A2.25 2.25 0 0 0 5.25 18.75h13.5A2.25 2.25 0 0 0 21 16.5m-18 0 4.72-4.72a2.25 2.25 0 0 1 3.182 0l1.098 1.098m0 0 1.598-1.598a2.25 2.25 0 0 1 3.182 0L21 16.5m-8.4-8.4h.008v.008H12.6V8.1Z" />
                                </svg>
                            </span>
                            <span class="text-sm font-medium text-foreground">Click to upload an image</span>
                            <span class="font-mono text-[11px] text-muted-foreground">PNG, JPG or WEBP · up to 2 MB</span>
                        </span>
                    </template>

                    <template x-if="imagePreview">
                        <span class="block w-full">
                            <img :src="imagePreview" alt="Selected image preview" class="mx-auto max-h-48 w-full rounded-lg object-cover">
                        </span>
                    </template>
                </label>

                <p class="error" x-show="imageError" x-text="imageError" x-cloak></p>
                <x-form.error name="image" />
            </div>

            <fieldset class="space-y-3">
                <legend class="label">Action steps</legend>

                <div class="flex items-center gap-2">
                    <input
                        x-model="newStep"
                        type="text"
                        id="new-step"
                        placeholder="What needs to be done?"
                        class="input flex-1"
                        spellcheck="false"
                        @keyup.enter.prevent="addStep()"
                    >
                    <button type="button" @click="addStep()" class="btn btn-icon shrink-0" aria-label="Add step" data-test="submit-new-step-button">
                        <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                    </button>
                </div>

                <template x-for="(step, index) in steps" :key="index">
                    <div class="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm">
                        <span class="truncate text-primary" x-text="step"></span>
                        <input type="hidden" name="steps[]" :value="step">
                        <button
                            type="button"
                            @click="steps.splice(index, 1)"
                            class="shrink-0 text-muted-foreground transition hover:text-destructive"
                            aria-label="Remove step"
                            data-test="remove-step-button"
                        >
                            <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </template>
            </fieldset>

            <fieldset class="space-y-3">
                <legend class="label">Links</legend>

                <div class="flex items-center gap-2">
                    <input
                        x-model="newLink"
                        type="url"
                        id="new-link"
                        placeholder="https://example.com"
                        autocomplete="url"
                        class="input flex-1"
                        spellcheck="false"
                        @keyup.enter.prevent="addLink()"
                    >
                    <button type="button" @click="addLink()" class="btn btn-icon shrink-0" aria-label="Add link" data-test="add-link-button">
                        <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                    </button>
                </div>

                <template x-for="(link, index) in links" :key="index">
                    <div class="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm">
                        <span class="truncate text-info" x-text="link"></span>
                        <input type="hidden" name="links[]" :value="link">
                        <button
                            type="button"
                            @click="links.splice(index, 1)"
                            class="shrink-0 text-muted-foreground transition hover:text-destructive"
                            aria-label="Remove link"
                            data-test="remove-link-button"
                        >
                            <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </template>
            </fieldset>

            <div class="flex items-center justify-end gap-3 border-t border-border pt-5">
                <button type="button" class="btn btn-ghost" @click="$dispatch('close-modal')">Cancel</button>
                <button type="submit" class="btn">Create</button>
            </div>
        </form>
    </x-modal>
</x-layout>
