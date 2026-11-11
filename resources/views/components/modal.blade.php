@props(['name', 'title', 'open' => false])

<div
    x-data="{ show: @js($open), name: @js($name) }"
    x-show="show"
    x-cloak
    @open-modal.window="if ($event.detail === name) { show = true }"
    @close-modal.window="show = false"
    @keydown.escape.window="show = false"
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-{{ $name }}-title"
    style="display: none"
>
    <div
        class="absolute inset-0 bg-background/80 backdrop-blur-sm"
        @click="show = false"
        aria-hidden="true"
    ></div>

    <div
        x-show="show"
        x-transition:enter="ease-out duration-200"
        x-transition:enter-start="opacity-0 translate-y-3 scale-[0.98]"
        x-transition:enter-end="opacity-100 translate-y-0 scale-100"
        x-transition:leave="ease-in duration-150"
        x-transition:leave-start="opacity-100 translate-y-0 scale-100"
        x-transition:leave-end="opacity-0 translate-y-3 scale-[0.98]"
        class="relative flex max-h-[85dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
    >
        <div class="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
            <h2 id="modal-{{ $name }}-title" class="text-lg font-semibold text-foreground">{{ $title }}</h2>

            <button
                type="button"
                aria-label="Close modal"
                @click="show = false"
                class="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <div class="overflow-y-auto px-6 py-5">
            {{ $slot }}
        </div>
    </div>
</div>
