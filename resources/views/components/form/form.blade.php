@props(['title', 'description'])

<div class="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-10">
    <div class="w-full max-w-md">
        <div class="rounded-2xl border border-border bg-card/80 p-8 shadow-[0_30px_80px_-50px_var(--color-primary)] backdrop-blur">
            <div class="text-center">
                <h1 class="text-2xl font-bold tracking-tight text-foreground">{{ $title }}</h1>
                <p class="mt-1 text-sm text-muted-foreground">{{ $description }}</p>
            </div>

            {{ $slot }}
        </div>
    </div>
</div>
