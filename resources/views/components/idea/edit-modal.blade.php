@props(['idea'])

@php
    $editSteps = old('steps', $idea->steps
        ->sortBy('id')
        ->map(fn ($step) => ['id' => $step->id, 'description' => $step->description])
        ->values()
        ->all());

    $editLinks = old('links', $idea->links?->toArray() ?? []);
    $editStatus = old('status', $idea->status->value);
    $currentImage = $idea->image_path ? Storage::disk('public')->url($idea->image_path) : null;
@endphp

<x-modal
    :name="'edit-idea-'.$idea->id"
    title="Edit Idea"
    :open="$errors->any() && (int) old('idea_id') === $idea->id"
>
    <form
        x-data="{
            status: @js($editStatus),
            steps: @js($editSteps).map((step, index) => ({ ...step, uid: 'saved-' + (step.id ?? index) })),
            links: @js($editLinks),
            newStep: '',
            newLink: '',
            imagePreview: null,
            imageError: '',
            hasImage: @js((bool) $idea->image_path),
            removeImage: false,
            addStep() {
                const value = this.newStep.trim();

                if (value === '' || this.steps.some((step) => step.description === value)) {
                    this.newStep = '';

                    return;
                }

                this.steps.push({ id: null, description: value, uid: 'new-' + Date.now() + Math.random() });
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

                if (file) {
                    this.removeImage = false;
                }
            }
        }"
        method="POST"
        action="{{ route('idea.update', $idea) }}"
        enctype="multipart/form-data"
        class="space-y-6"
    >
        @csrf
        @method('PUT')

        <input type="hidden" name="idea_id" value="{{ $idea->id }}">

        @if ($errors->any() && (int) old('idea_id') === $idea->id)
            <div class="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-destructive" role="alert">
                <p class="text-sm font-semibold">The idea was not updated</p>
                <ul class="mt-1 list-disc space-y-0.5 pl-5 text-xs">
                    @foreach ($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        <div class="space-y-2">
            <label for="edit-title-{{ $idea->id }}" class="label">Title</label>
            <input
                id="edit-title-{{ $idea->id }}"
                name="title"
                type="text"
                value="{{ old('title', $idea->title) }}"
                placeholder="What's your idea?"
                required
                class="input {{ $errors->has('title') ? 'input-error' : '' }}"
            >
            <x-form.error name="title" />
        </div>

        <div class="space-y-2">
            <span class="label">Status</span>

            <div class="flex flex-wrap gap-2">
                @foreach (App\IdeaStatus::cases() as $status)
                    <button
                        type="button"
                        @click="status = '{{ $status->value }}'"
                        data-test="edit-status-{{ $status->value }}"
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

        <div class="space-y-2">
            <label for="edit-description-{{ $idea->id }}" class="label">Description</label>
            <textarea
                id="edit-description-{{ $idea->id }}"
                name="description"
                rows="4"
                required
                placeholder="Describe your idea..."
                class="textarea {{ $errors->has('description') ? 'input-error' : '' }}"
            >{{ old('description', $idea->description) }}</textarea>
            <x-form.error name="description" />
        </div>

        <div class="space-y-2">
            <span class="label">Featured image</span>

            <label for="edit-image-{{ $idea->id }}" class="file-drop">
                <input
                    id="edit-image-{{ $idea->id }}"
                    name="image"
                    type="file"
                    accept="image/*"
                    class="sr-only"
                    @change="previewImage($event)"
                >

                <template x-if="imagePreview">
                    <span class="block w-full">
                        <img :src="imagePreview" alt="New image preview" class="mx-auto max-h-48 w-full rounded-lg object-cover">
                    </span>
                </template>

                @if ($currentImage)
                    <template x-if="! imagePreview && hasImage && ! removeImage">
                        <span class="block w-full space-y-2">
                            <img
                                src="{{ $currentImage }}"
                                alt="{{ $idea->title }}"
                                class="mx-auto max-h-48 w-full rounded-lg object-cover"
                            >
                            <span class="block font-mono text-[11px] text-muted-foreground">Current image · click to replace</span>
                        </span>
                    </template>
                @endif

                <template x-if="! imagePreview && (! hasImage || removeImage)">
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
            </label>

            @if ($currentImage)
                <div class="flex items-center gap-2">
                    <button
                        type="button"
                        x-show="! removeImage"
                        @click="removeImage = true; imagePreview = null"
                        class="btn btn-danger btn-outlined h-8 text-[11px]"
                    >
                        Remove image
                    </button>

                    <button
                        type="button"
                        x-show="removeImage"
                        x-cloak
                        @click="removeImage = false"
                        class="btn btn-ghost h-8 text-[11px]"
                    >
                        Keep current image
                    </button>

                    <input type="hidden" name="remove_image" :value="removeImage ? '1' : '0'">
                </div>
            @endif

            <p class="error" x-show="imageError" x-text="imageError" x-cloak></p>
            <x-form.error name="image" />
        </div>

        <fieldset class="space-y-3">
            <legend class="label">Action steps</legend>

            <div class="flex items-center gap-2">
                <input
                    x-model="newStep"
                    type="text"
                    id="edit-new-step-{{ $idea->id }}"
                    placeholder="What needs to be done?"
                    class="input flex-1"
                    spellcheck="false"
                    @keyup.enter.prevent="addStep()"
                >
                <button type="button" @click="addStep()" class="btn btn-icon shrink-0" aria-label="Add step">
                    <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                </button>
            </div>

            <template x-for="(step, index) in steps" :key="step.uid">
                <div class="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm">
                    <span class="w-5 shrink-0 font-mono text-[11px] text-muted-foreground" x-text="String(index + 1).padStart(2, '0')"></span>

                    <input
                        type="text"
                        x-model="step.description"
                        :name="`steps[${index}][description]`"
                        class="input h-9 flex-1"
                        maxlength="255"
                    >
                    <input type="hidden" :name="`steps[${index}][id]`" :value="step.id">

                    <button
                        type="button"
                        @click="steps.splice(index, 1)"
                        class="shrink-0 text-muted-foreground transition hover:text-destructive"
                        aria-label="Remove step"
                    >
                        <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </template>

            <p class="text-xs text-muted-foreground" x-show="steps.length === 0" x-cloak>No steps yet — add the first one above.</p>
        </fieldset>

        <fieldset class="space-y-3">
            <legend class="label">Links</legend>

            <div class="flex items-center gap-2">
                <input
                    x-model="newLink"
                    type="url"
                    id="edit-new-link-{{ $idea->id }}"
                    placeholder="https://example.com"
                    autocomplete="url"
                    class="input flex-1"
                    spellcheck="false"
                    @keyup.enter.prevent="addLink()"
                >
                <button type="button" @click="addLink()" class="btn btn-icon shrink-0" aria-label="Add link">
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
                    >
                        <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </template>

            <p class="text-xs text-muted-foreground" x-show="links.length === 0" x-cloak>No links yet.</p>
        </fieldset>

        <div class="flex items-center justify-end gap-3 border-t border-border pt-5">
            <button type="button" class="btn btn-ghost" @click="$dispatch('close-modal')">Cancel</button>
            <button type="submit" class="btn">Save changes</button>
        </div>
    </form>
</x-modal>
