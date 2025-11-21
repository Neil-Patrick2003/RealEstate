<?php

namespace App\Http\Controllers\HomePage;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class ContactController extends Controller
{

    public function index()
    {
        return Inertia::render('Headers/ContactPage');
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|min:10',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        try {
            Mail::send('emails.contact', [
                'name' => $request->name,
                'email' => $request->email,
                'subject' => $request->subject,
                'messageContent' => $request->message,
            ], function ($message) use ($request) {
                $message->to('mulingbayan.neil02@gmail.com')
                    ->subject('New Contact Form Submission: ' . $request->subject)
                    ->replyTo($request->email);
            });

            // For Inertia.js, use a flash message that Inertia can read
            return redirect()->back()->with([
                'success' => true,
                'message' => 'Thank you! Your message has been sent successfully.'
            ]);

        } catch (\Exception $e) {
            \Log::error('Contact form failed: ' . $e->getMessage());

            return redirect()->back()->withErrors([
                'email' => 'Failed to send message. Please try again later.'
            ])->withInput();
        }
    }
}
