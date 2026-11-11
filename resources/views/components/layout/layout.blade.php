<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>Idea</title>
        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>

    <body class="min-h-dvh bg-background text-foreground antialiased">
        <div class="grid-backdrop pointer-events-none fixed inset-0 -z-10 opacity-50"></div>

        <x-layout.nav />

        <main class="relative mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6">
            {{ $slot }}
        </main>

        @session('success')
            <div
                x-data="{ show: true }"
                x-init="setTimeout(() => show = false, 3200)"
                x-show="show"
                x-cloak
                x-transition.opacity.duration.300ms
                class="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-success/30 bg-card px-4 py-3 text-sm text-foreground shadow-2xl"
                role="status"
            >
                <span class="grid h-7 w-7 place-items-center rounded-full bg-success/15 text-success">
                    <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                </span>
                {{ $value }}
            </div>
        @endsession
    </body>
</html>
