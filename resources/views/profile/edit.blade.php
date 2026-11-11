<x-layout>
    <div class="py-10">
        <a
            href="{{ route('idea.index') }}"
            class="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
        >
            <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back to ideas
        </a>

        <div class="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <x-card is="div" class="!p-0 overflow-hidden">
                <div class="border-b border-border/70 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 px-6 py-6 sm:px-8">
                    <div class="flex items-center gap-4">
                        <div class="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-lg font-bold text-primary-foreground shadow-lg">
                            {{ \Illuminate\Support\Str::upper(\Illuminate\Support\Str::substr($user->name, 0, 1)) }}
                        </div>
                        <div>
                            <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">Account</p>
                            <h1 class="mt-1 text-2xl font-bold tracking-tight">Edit profile</h1>
                            <p class="mt-1 text-sm text-muted-foreground">Update your name, email address, and password.</p>
                        </div>
                    </div>
                </div>

                <form action="{{ route('profile.update') }}" method="POST" class="space-y-8 p-6 sm:p-8">
                    @csrf
                    @method('PATCH')

                    <section class="space-y-4">
                        <div class="flex items-center gap-2">
                            <span class="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                                <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" aria-hidden="true">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                </svg>
                            </span>
                            <div>
                                <h2 class="text-sm font-semibold">Profile information</h2>
                                <p class="text-xs text-muted-foreground">How others will see you in the workspace.</p>
                            </div>
                        </div>

                        <div class="grid gap-4 sm:grid-cols-2">
                            <div class="sm:col-span-2">
                                <x-form.field name="name" label="Name" :value="$user->name" required autocomplete="name" />
                            </div>
                            <div class="sm:col-span-2">
                                <x-form.field name="email" label="Email address" type="email" :value="$user->email" required autocomplete="email" />
                            </div>
                        </div>
                    </section>

                    <div class="h-px bg-border/70"></div>

                    <section class="space-y-4">
                        <div class="flex items-center gap-2">
                            <span class="grid h-8 w-8 place-items-center rounded-lg bg-secondary/10 text-secondary">
                                <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" aria-hidden="true">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                                </svg>
                            </span>
                            <div>
                                <h2 class="text-sm font-semibold">Change password</h2>
                                <p class="text-xs text-muted-foreground">Leave blank to keep your current password.</p>
                            </div>
                        </div>

                        <div class="grid gap-4 sm:grid-cols-2">
                            <x-form.field name="password" label="New password" type="password" autocomplete="new-password" placeholder="At least 8 characters" />
                            <x-form.field name="password_confirmation" label="Confirm new password" type="password" autocomplete="new-password" placeholder="Repeat new password" />
                        </div>
                    </section>

                    <div class="flex flex-wrap items-center justify-end gap-3 border-t border-border/70 pt-6">
                        <a href="{{ route('idea.index') }}" class="btn btn-ghost h-10 px-5 text-xs">Cancel</a>
                        <button type="submit" class="btn h-10 px-6 text-xs">Save changes</button>
                    </div>
                </form>
            </x-card>

            <div class="space-y-4">
                <x-card is="div">
                    <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">Signed in as</p>
                    <p class="mt-3 text-lg font-semibold">{{ $user->name }}</p>
                    <p class="mt-1 break-all text-sm text-muted-foreground">{{ $user->email }}</p>
                    <div class="mt-4 rounded-xl border border-border/70 bg-background/40 p-3 text-xs text-muted-foreground">
                        Member since <span class="font-medium text-foreground">{{ $user->created_at->format('M j, Y') }}</span>
                    </div>
                </x-card>

                <x-card is="div" class="border-primary/20 bg-primary/5">
                    <p class="text-sm font-semibold">Password tips</p>
                    <ul class="mt-2 space-y-1.5 text-xs text-muted-foreground">
                        <li>Use at least 8 characters.</li>
                        <li>Mix letters, numbers, or symbols for a stronger password.</li>
                        <li>If you leave the password fields empty, your current password stays the same.</li>
                    </ul>
                </x-card>
            </div>
        </div>
    </div>
</x-layout>
