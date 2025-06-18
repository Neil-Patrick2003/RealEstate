import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-100 pt-6 sm:justify-center sm:pt-0 dark:bg-gray-900">
            <div>
                <Link href="/">
                    <ApplicationLogo className="h-20 w-20 fill-current text-gray-500" />
                </Link>
            </div>
            <div>
                <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
 width="300.000000pt" height="300.000000pt" viewBox="0 0 300.000000 300.000000"
 preserveAspectRatio="xMidYMid meet">
<metadata>
Created by potrace 1.10, written by Peter Selinger 2001-2011
</metadata>
<g transform="translate(0.000000,300.000000) scale(0.100000,-0.100000)"
fill="#000000" stroke="none">
<path d="M733 2593 c-12 -2 -36 -20 -53 -39 l-30 -35 0 -1019 0 -1020 34 -38
34 -37 160 0 c147 0 163 2 189 21 55 41 53 23 50 662 -1 325 1 592 4 592 3 0
12 -15 21 -33 41 -87 753 -1210 776 -1225 22 -14 53 -17 195 -17 l169 0 34 37
34 38 0 1020 0 1020 -34 38 -34 37 -160 0 c-147 0 -163 -2 -189 -21 -55 -41
-53 -24 -51 -642 2 -314 2 -572 2 -572 -1 0 -33 53 -72 118 -39 64 -210 335
-379 602 -261 410 -313 488 -343 502 -29 15 -60 18 -185 17 -82 -1 -160 -4
-172 -6z m361 -65 c13 -13 184 -277 381 -588 196 -311 366 -573 378 -583 21
-18 22 -18 44 8 l23 26 0 553 c0 545 0 554 21 580 l20 26 154 0 154 0 20 -26
c21 -27 21 -30 21 -1024 0 -994 0 -997 -21 -1024 l-20 -26 -159 0 c-151 0
-160 1 -183 22 -14 13 -188 284 -387 603 -199 319 -371 590 -382 603 -27 28
-43 28 -62 0 -14 -20 -16 -93 -16 -599 0 -568 0 -577 -21 -603 l-20 -26 -152
0 c-141 0 -152 1 -174 22 l-23 21 0 1006 0 1005 22 23 c21 22 27 23 189 23
160 0 169 -1 193 -22z"/>
</g>
</svg>

            </div>

            <div className="mt-6 w-full overflow-hidden bg-white px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg dark:bg-gray-800">
                {children}
            </div>
        </div>
    );
}
