@props(['status' => 'pending'])

@php
    $value = $status instanceof \App\IdeaStatus ? $status->value : $status;

    $classes = 'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide whitespace-nowrap';

    $classes .= match ($value) {
        'in_progress' => ' border-info/30 bg-info/10 text-info',
        'completed' => ' border-success/30 bg-success/10 text-success',
        default => ' border-warning/30 bg-warning/10 text-warning',
    };
@endphp

<span {{ $attributes->class($classes) }}>
    <span class="h-1.5 w-1.5 rounded-full bg-current"></span>
    {{ $slot }}
</span>
