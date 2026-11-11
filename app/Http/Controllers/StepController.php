<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Step;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class StepController extends Controller
{
    /**
     * Toggle the completed state of a step owned by the authenticated user.
     */
    public function toggle(Step $step): RedirectResponse
    {
        abort_unless(
            $step->idea()->where('user_id', Auth::id())->exists(),
            403
        );

        $step->update(['completed' => ! $step->completed]);

        return back();
    }
}
