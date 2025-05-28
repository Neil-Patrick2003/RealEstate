import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import AdminLayout from '@/Layouts/AdminLayout';


export default function Dashboard() {
      const { t } = useTranslation();

    return (
        <AdminLayout
        
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    {t('welcome')}
                </h2>
            }
        >
            <Head title="Dashboard" />
            

            <div className="">
                <div className="mx-auto  sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            Please choose a language: 
                            <button className='border py-1 px-6 rounded mr-4' onClick={() => i18n.changeLanguage('en')}>EN</button>
                            <button className='border py-1 px-6 rounded ' onClick={() => i18n.changeLanguage('fil')}>FIL</button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
