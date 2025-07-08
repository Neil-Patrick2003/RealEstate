import { Link } from '@inertiajs/react';
import { Home } from 'lucide-react';

const DashboardLink = ({ auth }) => {
    const role = auth?.user?.role;

    const dashboardRoutes = {
        Admin: '/admin/dashboard',
        Seller: '/seller/dashboard',
        Agent: '/agent/dashboard',
        Buyer: '/buyer/dashboard',
    };

    console.log(auth);

    const dashboardUrl = dashboardRoutes[role];

    if (!dashboardUrl) return null; // Role not recognized, don't show anything

    return (
        <Link
            href={dashboardUrl}
            className="flex items-center gap-2 p-3 text-gray-700 hover:bg-primary/10 hover:text-primary rounded-lg transition-all duration-200 font-medium"
        >
            <Home size={16} />
            Dashboard
        </Link>
    );
};

export default DashboardLink;
