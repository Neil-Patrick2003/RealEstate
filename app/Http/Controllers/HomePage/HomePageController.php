<?php

namespace App\Http\Controllers\HomePage;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use Inertia\Inertia;

class HomePageController extends Controller
{

    public function contact()
    {
        return Inertia::render('Headers/ContactPage');
    }
    public function blogs()
    {

        $blogs = Blog::latest()
            ->paginate(9); // 9 blogs per page for 3-column grid

        return Inertia::render('Headers/BlogPostPage', [
            'blogs' => $blogs->items(),
            'pagination' => [
                'current_page' => $blogs->currentPage(),
                'last_page' => $blogs->lastPage(),
                'per_page' => $blogs->perPage(),
                'total' => $blogs->total(),
                'prev_page_url' => $blogs->previousPageUrl(),
                'next_page_url' => $blogs->nextPageUrl(),
            ]
        ]);

    }



    public function about()
    {
        return Inertia::render('Headers/AboutPage');
    }


}
