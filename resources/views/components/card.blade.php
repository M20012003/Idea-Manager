@props(['href' => null, 'is' => 'a', 'padded' => true])

@php
    $cardClasses = [
        'block rounded-2xl border border-border bg-card text-sm transition duration-200',
        'hover:border-primary/60 hover:shadow-[0_24px_50px_-32px_var(--color-primary)]',
        $padded ? 'p-5' : '',
    ];
@endphp

@if ($href)
    <a href="{{ $href }}" {{ $attributes->class($cardClasses) }}>
        {{ $slot }}
    </a>
@elseif ($is === 'button')
    <button type="button" {{ $attributes->class($cardClasses) }}>
        {{ $slot }}
    </button>
@else
    <div {{ $attributes->class($cardClasses) }}>
        {{ $slot }}
    </div>
@endif
