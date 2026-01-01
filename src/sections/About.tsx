import { motion } from 'framer-motion';

export const About = () => {
    return (
        <section id="about" className="h-screen w-full relative bg-white text-dark overflow-hidden flex items-center">
            {/* Background/Layout */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gray-100/50 hidden md:block"></div>

            {/* Content */}
            <div className="container mx-auto px-12 md:px-24 flex flex-col md:flex-row h-full items-center">

                {/* Left Side: Text */}
                <div className="w-full md:w-1/2 flex flex-col justify-center z-10">
                    <div className="flex items-center gap-4 text-gray-400 mb-8">
                        <span className="text-xl font-bold text-dark">02</span>
                        <span className="text-xs tracking-[0.2em] font-bold uppercase">The Problem</span>
                        <div className="h-[2px] w-12 bg-gray-300"></div>
                    </div>

                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl md:text-5xl font-bold tracking-widest uppercase mb-4"
                    >
                        Integrity <span className="text-primary">Paradox</span>
                    </motion.h2>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-gray-500 max-w-lg mb-8 leading-relaxed space-y-4"
                    >
                        <p>
                            <strong>Evidence can be altered</strong> during collection, storage, or transfer, weakening court admissibility.
                        </p>
                        <p>
                            Traditional digital forensics relies on static hashing (MD5/SHA-256). A hash only tells you if a file is different now than it was then; it doesn't tell you <strong>who</strong> changed it, <strong>when</strong>, or <strong>where</strong> the break occurred.
                        </p>
                        <div className="border-l-4 border-primary pl-4 py-2 italic text-dark/70">
                            "Hashes and timestamps exist, but are often not end-to-end or auditable."
                        </div>
                    </motion.div>

                    <div className="flex flex-col gap-2">
                        <h4 className="font-bold text-xs uppercase tracking-widest text-primary mb-2">Key Challenges:</h4>
                        <ul className="text-sm text-gray-500 space-y-2">
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-dark rounded-full"></span>
                                End-to-end hashing workflows
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-dark rounded-full"></span>
                                Tamper-evident logs
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-dark rounded-full"></span>
                                Usable Chain-of-Custody reporting
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Right Side: Image overlap */}
                <div className="w-full md:w-1/2 h-full flex items-center justify-center relative">
                    <motion.div
                        className="w-3/4 h-3/4 bg-gray-200 overflow-hidden relative shadow-2xl"
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <img
                            src="https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=2670&auto=format&fit=crop"
                            alt="Cyber Security"
                            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                        />

                        {/* Big P Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-multiply opacity-20">
                            <span className="text-[20rem] font-bold text-primary">P</span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
