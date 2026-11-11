<x-layout>
    <x-form title="Welcome back" description="Sign in to your account and keep building.">
        <form action="/login" method="POST" class="mt-8 space-y-4">
            @csrf

            <x-form.field name="email" label="Email" type="email" placeholder="you@example.com" required autofocus />
            <x-form.field name="password" label="Password" type="password" placeholder="Your password" required />

            <button type="submit" class="btn mt-2 h-10 w-full">Login</button>
        </form>

        <p class="mt-6 text-center text-xs text-muted-foreground">
            No account yet?
            <a href="/register" class="font-semibold text-primary hover:underline">Create one</a>
        </p>
    </x-form>
</x-layout>
