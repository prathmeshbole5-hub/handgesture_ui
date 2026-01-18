import { motion } from 'framer-motion';
import { Magnetic } from './Magnetic';

const dots = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'The Problem' },
    { id: 'services', label: 'Solution' },
    { id: 'portfolio', label: 'Audit Trail' },
    { id: 'blog', label: 'Architecture' },
    { id: 'contact', label: 'Contact' },
];

export const Navbar = ({ activeSection }: { activeSection: string }) => {
    return (
        <div className="fixed left-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-6">
            {dots.map((dot, index) => (
                <a
                    key={dot.id}
                    href={`#${dot.id}`}
                    className="group flex items-center gap-4 py-2"
                >
                    <div className="relative flex items-center">
                        <span className="absolute left-full ml-4 text-xs tracking-widest font-bold opacity-0 transition-opacity duration-300 group-hover:opacity-100 whitespace-nowrap text-white">
                            {index + 1 < 10 ? `0${index + 1}` : index + 1} &nbsp; {dot.label.toUpperCase()}
                        </span>
                        <Magnetic>
                            <motion.div
                                className={`w-2 h-2 rounded-full transition-colors duration-300 ${activeSection === dot.id ? 'bg-primary scale-125' : 'bg-gray-500 group-hover:bg-white'
                                    }`}
                            />
                        </Magnetic>
                        {activeSection === dot.id && (
                            <motion.div
                                layoutId="activeDot"
                                className="absolute inset-0 -m-2 border border-white/20 rounded-full"
                                transition={{ duration: 0.3 }}
                            />
                        )}
                    </div>
                </a>
            ))}
            {/* Vertical line connector */}
            <div className="absolute left-[3px] top-0 bottom-0 w-[2px] bg-gray-800 -z-10" />
        </div>
    );
};
