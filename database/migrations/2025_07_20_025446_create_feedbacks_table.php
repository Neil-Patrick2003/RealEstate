    <?php

    use Illuminate\Database\Migrations\Migration;
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;

    return new class extends Migration
    {
        /**
         * Run the migrations.
         */
        public function up(): void
        {
            Schema::create('feedbacks', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('deal_id');
                $table->unsignedBigInteger('agent_id');
                $table->tinyInteger('communication')->unsigned()->comment('Rating 1-5');
                $table->tinyInteger('negotiation')->unsigned()->comment('Rating 1-5');
                $table->tinyInteger('professionalism')->unsigned()->comment('Rating 1-5');
                $table->tinyInteger('knowledge')->unsigned()->comment('Rating 1-5');
                $table->text('comments')->nullable();
                $table->timestamps();

                // Explicit foreign keys
                $table->foreign('deal_id')->references('id')->on('deals')->onDelete('cascade');
                $table->foreign('agent_id')->references('id')->on('users')->onDelete('cascade');
            });

            Schema::create('feedback_characteristics', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('feedback_id');
                $table->string('characteristic', 50);
                $table->timestamps();

                $table->foreign('feedback_id')->references('id')->on('feedbacks')->onDelete('cascade');
            });
        }

        /**
         * Reverse the migrations.
         */
        public function down(): void
        {
            Schema::table('feedback_characteristics', function (Blueprint $table) {
                $table->dropForeign(['feedback_id']);
            });
            Schema::dropIfExists('feedback_characteristics');

            Schema::table('feedbacks', function (Blueprint $table) {
                $table->dropForeign(['deal_id']);
                $table->dropForeign(['agent_id']);
            });
            Schema::dropIfExists('feedbacks');
        }
    };
