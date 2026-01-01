import { motion } from 'framer-motion';

export const Hero = () => {
    return (
        <section id="home" className="h-screen w-full relative overflow-hidden flex items-center justify-center bg-dark">
            {/* Background Image/Overlay */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-dark via-dark/80 to-transparent"></div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-12 md:px-24 flex flex-col justify-center h-full">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4 text-white/60 mb-8">
                        <span className="text-xl font-bold">01</span>
                        <span className="text-xs tracking-[0.2em] font-bold">DEIV</span>
                        <div className="h-[2px] w-12 bg-white/20"></div>
                    </div>

                    <motion.h1
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-6xl md:text-8xl font-bold tracking-widest text-white mb-4"
                    >
                        EVIDENCE
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="text-white/80 text-lg max-w-2xl mb-8 leading-relaxed"
                    >
                        Digital Evidence Integrity Validator. <br />
                        <span className="text-sm text-white/50 uppercase tracking-widest block mt-2">
                            Guarantee integrity and chain-of-custody for digital evidence.
                        </span>
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <a href="#about" className="inline-flex items-center gap-2 text-primary font-bold text-xs tracking-widest uppercase hover:text-white transition-colors">
                            Explore The Solution &rarr;
                        </a>
                    </motion.div>
                </div>

                {/* Big E Letter Background */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 text-[40rem] font-bold text-primary/5 select-none -z-10 pointer-events-none">
                    E
                </div>
            </div>
        </section>
    );
};
