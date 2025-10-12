import { CheckIcon } from '@heroicons/react/20/solid'

const STATUS_FLOW = ['pending', 'accepted', 'scheduled', 'make_offer', 'final'];

const STEP_LABELS = [
    {
        name: 'Inquiry Sent',
        description: 'You submitted an inquiry for this property.',
    },
    {
        name: 'Seller Accepted',
        description: 'Seller has accepted your inquiry.',
    },
    {
        name: 'Tripping Scheduled',
        description: 'You have scheduled a property visit.',
    },
    {
        name: 'Offer Made',
        description: 'You made an offer to the seller.',
    },
    {
        name: 'Deal Finalized',
        description: 'The deal has been closed successfully.',
    },
];

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

function generateSteps(currentStatus) {
    console.log(currentStatus);
    const currentIndex = STATUS_FLOW.indexOf(currentStatus);

    return STEP_LABELS.map((step, idx) => ({
        ...step,
        status:
            idx < currentIndex
                ? 'complete'
                : idx === currentIndex
                    ? 'current'
                    : 'upcoming',
    }));
}

export default function Progress({ inquiryStatus = 'pending' }) {
    const steps = generateSteps(inquiryStatus);

    return (
        <nav aria-label="Progress">
            <ol role="list" className="overflow-hidden">
                {steps.map((step, stepIdx) => (
                    <li key={step.name} className={classNames(stepIdx !== steps.length - 1 ? 'pb-10' : '', 'relative')}>
                        {step.status === 'complete' ? (
                            <>
                                {stepIdx !== steps.length - 1 && (
                                    <div aria-hidden="true" className="absolute top-4 left-4 mt-0.5 -ml-px h-full w-0.5 bg-primary" />
                                )}
                                <div className="group relative flex items-start">
                                  <span className="flex h-9 items-center">
                                    <span className="relative z-10 flex size-8 items-center justify-center rounded-full bg-primary group-hover:bg-accent">
                                      <CheckIcon aria-hidden="true" className="size-5 text-white" />
                                    </span>
                                  </span>
                                                    <span className="ml-4 flex min-w-0 flex-col">
                                    <span className="text-sm font-medium">{step.name}</span>
                                    <span className="text-sm text-gray-500">{step.description}</span>
                                  </span>
                                </div>
                            </>
                        ) : step.status === 'current' ? (
                            <>
                                {stepIdx !== steps.length - 1 && (
                                    <div aria-hidden="true" className="absolute top-4 left-4 mt-0.5 -ml-px h-full w-0.5 bg-gray-300" />
                                )}
                                <div className="group relative flex items-start">
                                  <span className="flex h-9 items-center">
                                    <span className="relative z-10 flex size-8 items-center justify-center rounded-full border-2 border-accent bg-white">
                                      <span className="size-2.5 rounded-full bg-accent" />
                                    </span>
                                  </span>
                                                    <span className="ml-4 flex min-w-0 flex-col">
                                    <span className="text-sm font-medium text-accent">{step.name}</span>
                                    <span className="text-sm text-gray-500">{step.description}</span>
                                  </span>
                                </div>
                            </>
                        ) : (
                            <>
                                {stepIdx !== steps.length - 1 && (
                                    <div aria-hidden="true" className="absolute top-4 left-4 mt-0.5 -ml-px h-full w-0.5 bg-gray-300" />
                                )}
                                <div className="group relative flex items-start">
                                  <span className="flex h-9 items-center">
                                    <span className="relative z-10 flex size-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white group-hover:border-gray-400">
                                      <span className="size-2.5 rounded-full bg-transparent group-hover:bg-gray-300" />
                                    </span>
                                  </span>
                                                    <span className="ml-4 flex min-w-0 flex-col">
                                    <span className="text-sm font-medium text-gray-500">{step.name}</span>
                                    <span className="text-sm text-gray-500">{step.description}</span>
                                  </span>
                                </div>
                            </>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
