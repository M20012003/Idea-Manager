<x-layout>
    <x-form title="Create your account" description="Start capturing ideas and turning them into steps.">
        <form action="/register" method="POST" class="mt-8 space-y-4">
            @csrf

            <x-form.field name="name" label="Name" placeholder="Your name" required autofocus />
            <x-form.field name="email" label="Email" type="email" placeholder="you@example.com" required />
            <x-form.field name="password" label="Password" type="password" placeholder="At least 8 characters" required />

            <button type="submit" class="btn mt-2 h-10 w-full">Create Account</button>
        </form>

        <p class="mt-6 text-center text-xs text-muted-foreground">
            Already registered?
            <a href="/login" class="font-semibold text-primary hover:underline">Sign in</a>
        </p>
    </x-form>
</x-layout>
