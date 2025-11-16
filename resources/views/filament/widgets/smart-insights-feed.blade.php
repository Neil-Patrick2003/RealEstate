<div class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-md mx-auto">
        <!-- Enhanced Smart Insights Widget -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-md">
            <!-- Header Section -->
            <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <div>
                        <h3 class="text-base font-semibold text-gray-800">Smart Insights</h3>
                        <p class="text-xs text-gray-500 mt-0.5">Real-time analytics & trends</p>
                    </div>
                </div>
                <div class="text-right">
                    <span class="inline-flex items-center gap-1 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded-full border border-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Auto-updates hourly
                    </span>
                </div>
            </div>

            <!-- Content Section -->
            <div class="divide-y divide-gray-100">
                <!-- Empty State -->
                <div id="emptyState" class="p-6 text-center">
                    <div class="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h4 class="text-sm font-medium text-gray-700 mb-1">No insights yet</h4>
                    <p class="text-xs text-gray-500 mb-4">Your hourly job will populate this with analytics</p>
                    <button class="text-xs text-blue-600 font-medium hover:text-blue-700 transition-colors">
                        Run analysis now
                    </button>
                </div>

                <!-- Insights List -->
                <ul id="insightsList" class="hidden">
                    <!-- Sample Insight 1 -->
                    <li class="px-5 py-4 flex items-start gap-3 hover:bg-gray-50 transition-colors duration-150">
                        <div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span class="text-lg">🏠</span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 mb-1">
                                <p class="font-medium text-gray-900 truncate">Lipa City +25%</p>
                                <span class="inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5 bg-green-100 text-green-800 flex-shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                    </svg>
                                    Up
                                </span>
                            </div>
                            <p class="text-sm text-gray-600">Inquiries increased 25% vs last week</p>
                            <div class="flex items-center gap-2 mt-2">
                                <span class="text-xs text-gray-500">Today, 10:30 AM</span>
                                <span class="w-1 h-1 rounded-full bg-gray-300"></span>
                                <span class="text-xs text-gray-500">High impact</span>
                            </div>
                        </div>
                    </li>

                    <!-- Sample Insight 2 -->
                    <li class="px-5 py-4 flex items-start gap-3 hover:bg-gray-50 transition-colors duration-150">
                        <div class="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span class="text-lg">📱</span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 mb-1">
                                <p class="font-medium text-gray-900 truncate">Mobile Traffic -18%</p>
                                <span class="inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5 bg-red-100 text-red-800 flex-shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                    </svg>
                                    Down
                                </span>
                            </div>
                            <p class="text-sm text-gray-600">Mobile engagement dropped significantly</p>
                            <div class="flex items-center gap-2 mt-2">
                                <span class="text-xs text-gray-500">Today, 9:15 AM</span>
                                <span class="w-1 h-1 rounded-full bg-gray-300"></span>
                                <span class="text-xs text-gray-500">Medium impact</span>
                            </div>
                        </div>
                    </li>

                    <!-- Sample Insight 3 -->
                    <li class="px-5 py-4 flex items-start gap-3 hover:bg-gray-50 transition-colors duration-150">
                        <div class="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span class="text-lg">🛒</span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 mb-1">
                                <p class="font-medium text-gray-900 truncate">Cart Abandonment +12%</p>
                                <span class="inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5 bg-amber-100 text-amber-800 flex-shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    Warn
                                </span>
                            </div>
                            <p class="text-sm text-gray-600">Checkout issues detected in analytics</p>
                            <div class="flex items-center gap-2 mt-2">
                                <span class="text-xs text-gray-500">Yesterday, 4:45 PM</span>
                                <span class="w-1 h-1 rounded-full bg-gray-300"></span>
                                <span class="text-xs text-gray-500">Critical</span>
                            </div>
                        </div>
                    </li>

                    <!-- Sample Insight 4 -->
                    <li class="px-5 py-4 flex items-start gap-3 hover:bg-gray-50 transition-colors duration-150">
                        <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span class="text-lg">👥</span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 mb-1">
                                <p class="font-medium text-gray-900 truncate">New User Signups +8%</p>
                                <span class="inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5 bg-blue-100 text-blue-800 flex-shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                    </svg>
                                    Up
                                </span>
                            </div>
                            <p class="text-sm text-gray-600">Registration conversion improved</p>
                            <div class="flex items-center gap-2 mt-2">
                                <span class="text-xs text-gray-500">Yesterday, 2:20 PM</span>
                                <span class="w-1 h-1 rounded-full bg-gray-300"></span>
                                <span class="text-xs text-gray-500">Medium impact</span>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>

            <!-- Footer Section -->
            <div class="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                <button class="text-xs text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                </button>
                <a href="#" class="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors">
                    View all insights
                </a>
            </div>
        </div>

        <!-- Toggle Button for Demo -->
        <div class="mt-6 text-center">
            <button id="toggleDemo" class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                Toggle Demo Data
            </button>
        </div>
    </div>
</div>

<script>
    document.addEventListener('DOMContentLoaded', function() {
        const emptyState = document.getElementById('emptyState');
        const insightsList = document.getElementById('insightsList');
        const toggleButton = document.getElementById('toggleDemo');

        // Initially show empty state
        emptyState.classList.remove('hidden');
        insightsList.classList.add('hidden');

        toggleButton.addEventListener('click', function() {
            if (emptyState.classList.contains('hidden')) {
                // Switch to empty state
                emptyState.classList.remove('hidden');
                insightsList.classList.add('hidden');
            } else {
                // Switch to insights list
                emptyState.classList.add('hidden');
                insightsList.classList.remove('hidden');
            }
        });
    });
</script>
