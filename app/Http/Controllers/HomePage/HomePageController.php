<?php

namespace App\Http\Controllers\HomePage;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class HomePageController extends Controller
{

    public function contact()
    {
        return Inertia::render('Headers/ContactPage');
    }
    public function blogs()
    {
        return Inertia::render('Headers/BlogPostPage');
    }

    public function about()
    {
        return Inertia::render('Headers/AboutPage');
    }


}
