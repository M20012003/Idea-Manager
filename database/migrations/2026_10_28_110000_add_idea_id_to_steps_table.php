<?php

use App\Models\Idea;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Repair databases where the steps table was created before the
     * idea_id column was added to the original create_steps_table migration.
     *
     * The original migration already supplies this column on fresh installs,
     * so the guard keeps this migration idempotent.
     */
    public function up(): void
    {
        if (Schema::hasColumn('steps', 'idea_id')) {
            return;
        }

        Schema::table('steps', function (Blueprint $table) {
            $table->foreignIdFor(Idea::class)->after('id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasColumn('steps', 'idea_id')) {
            return;
        }

        Schema::table('steps', function (Blueprint $table) {
            $table->dropColumn('idea_id');
        });
    }
};
