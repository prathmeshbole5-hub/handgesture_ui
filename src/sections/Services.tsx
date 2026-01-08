import { motion } from 'framer-motion';

const services = [
    { title: "Recursive Hashing", desc: "Genesis Hash at seizure, followed by unique Relay Signatures at each hand-off." },
    { title: "Tamper-Evident Logs", desc: "WORM (Write-Once-Read-Many) environment logging identity, action, and metadata.", active: true },
    { title: "Visual Audit Trail", desc: "Human-readable timeline converted from complex cryptographic proofs for court use." }
];

export const Services = () => {
    return (
        <section id="services" className="h-screen w-full relative bg-dark text-white overflow-hidden flex items-center">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-dark"></div>

            <div className="container mx-auto px-12 md:px-24 flex flex-col justify-center h-full z-10 relative">

                <div className="flex items-center gap-4 text-gray-400 mb-12">
                    <span className="text-xl font-bold text-white">03</span>
                    <span className="text-xs tracking-[0.2em] font-bold uppercase">The Solution</span>
                    <div className="h-[2px] w-12 bg-primary"></div>
                </div>

                <div className="flex flex-col md:flex-row gap-12">

                    {/* Service List */}
                    <div className="w-full md:w-1/3 flex flex-col gap-8">
                        {services.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                whileHover={{ scale: 1.02, x: 10, opacity: 1 }}
                                transition={{ delay: index * 0.2 }}
                                className={`cursor-pointer group flex flex-col gap-2 p-4 rounded-lg transition-all duration-300 ${item.active ? 'opacity-100 bg-white/5 border-l-2 border-primary' : 'opacity-40 hover:opacity-100 hover:bg-white/5 border-l-2 border-transparent'}`}
                            >
                                <h3 className="text-lg font-bold tracking-widest uppercase mb-1 group-hover:text-primary transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-xs text-gray-400">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Active Service Detail */}
                    <div className="w-full md:w-2/3">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className="text-4xl md:text-5xl font-bold tracking-wider mb-6">
                                <span className="text-primary">B</span>LACK BOX LOGGING
                            </h2>
                            <p className="text-gray-400 text-sm leading-7 max-w-lg mb-4">
                                Think of this as a flight recorder for data. Every time the evidence is accessed, the system logs
                                <strong> Identity</strong> (Biometric/MFA), <strong> Action</strong> (Viewed, Copied, Moved), and
                                <strong> Environment</strong> (MAC address, IP).
                            </p>
                            <div className="flex gap-4">
                                <div className="bg-white/5 p-4 rounded border border-white/10">
                                    <span className="block text-primary font-bold text-xl mb-1">100%</span>
                                    <span className="text-[10px] uppercase tracking-widest text-gray-500">Immutable</span>
                                </div>
                                <div className="bg-white/5 p-4 rounded border border-white/10">
                                    <span className="block text-primary font-bold text-xl mb-1">Zero</span>
                                    <span className="text-[10px] uppercase tracking-widest text-gray-500">Tampering</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};
