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
        <div className="fixed left-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-6 p-4 rounded-full backdrop-blur-[2px] bg-black/5 border border-white/5 shadow-2xl">
            {dots.map((dot, index) => (
                <a
                    key={dot.id}
                    href={`#${dot.id}`}
                    className="group flex items-center gap-4 py-2"
                >
                    <div className="relative flex items-center">
                        <span className="absolute left-full ml-6 text-xs tracking-widest font-display font-bold opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 whitespace-nowrap text-white/80 bg-black/50 px-2 py-1 rounded backdrop-blur-sm border border-white/10">
                            {index + 1 < 10 ? `0${index + 1}` : index + 1} &nbsp; {dot.label.toUpperCase()}
                        </span>
                        <Magnetic>
                            <motion.div
                                whileHover={{
                                    scale: 1.5,
                                    boxShadow: "0 0 15px rgba(255, 77, 0, 1)"
                                }}
                                whileTap={{ scale: 0.9 }}
                                className={`w-3 h-3 rounded-full transition-all duration-500 ${activeSection === dot.id ? 'bg-primary scale-125 shadow-[0_0_15px_rgba(255,77,0,0.6)]' : 'bg-white/20 hover:bg-white'
                                    }`}
                            />
                        </Magnetic>
                        {activeSection === dot.id && (
                            <motion.div
                                layoutId="activeDot"
                                className="absolute inset-0 -m-3 border border-primary/50 rounded-full"
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            />
                        )}
                    </div>
                </a>
            ))}
            {/* Vertical line connector */}
            <div className="absolute left-[27px] top-4 bottom-4 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent -z-10" />
        </div>
    );
};
