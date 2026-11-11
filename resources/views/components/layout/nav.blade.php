<nav class="sticky top-0 z-40 border-b border-border/70 bg-background/70 backdrop-blur-xl">
    <div class="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div class="flex items-center gap-4">
            <a href="/" class="flex items-center gap-3">
                <img src="/images/logo3.png" width="100" alt="Idea logo" class="h-8 w-auto">
            </a>

            @auth
                <a
                    href="{{ route('idea.index') }}"
                    class="rounded-lg px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] transition {{ request()->routeIs('idea.*') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground' }}"
                >
                    ideas
                </a>
            @endauth
        </div>

        <div class="flex items-center gap-2">
            @auth
                <a
                    href="{{ route('profile.edit') }}"
                    class="hidden items-center gap-2 rounded-full border border-border bg-card/70 py-1 pl-1 pr-3 text-xs text-muted-foreground transition hover:border-primary/50 hover:text-foreground sm:flex"
                    title="Edit profile"
                >
                    <span class="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-[10px] font-bold text-primary-foreground">
                        {{ \Illuminate\Support\Str::upper(\Illuminate\Support\Str::substr(auth()->user()->name, 0, 1)) }}
                    </span>
                    {{ auth()->user()->name }}
                </a>

                <form action="/logout" method="POST">
                    @csrf
                    <button type="submit" class="btn btn-ghost h-9 text-xs">Logout</button>
                </form>
            @endauth

            @guest
                <a href="/login" class="btn btn-ghost h-9 text-xs">Login</a>
                <a href="/register" class="btn h-9 text-xs">Register</a>
            @endguest
        </div>
    </div>
</nav>
