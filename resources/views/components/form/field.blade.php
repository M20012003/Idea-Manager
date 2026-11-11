@props(['label' => null, 'name', 'type' => 'text', 'value' => ''])

<div class="space-y-2">
    @if ($label)
        <label for="{{ $name }}" class="label">{{ $label }}</label>
    @endif

    @if ($type === 'textarea')
        <textarea
            id="{{ $name }}"
            name="{{ $name }}"
            rows="4"
            {{ $attributes->class(['textarea', 'input-error' => $errors->has($name)]) }}
        >{{ old($name, $value) }}</textarea>
    @else
        <input
            id="{{ $name }}"
            name="{{ $name }}"
            type="{{ $type }}"
            value="{{ old($name, $value) }}"
            {{ $attributes->class(['input', 'input-error' => $errors->has($name)]) }}
        >
    @endif

    <x-form.error :name="$name" />
</div>
