import { motion } from 'framer-motion';

export const Blog = () => {
    return (
        <section id="blog" className="min-h-screen bg-white text-dark py-24 flex items-center relative overflow-hidden">
            <div className="container mx-auto px-12 md:px-24">
                <div className="flex items-center gap-4 text-gray-400 mb-16">
                    <span className="text-xl font-bold text-dark">05</span>
                    <span className="text-xs tracking-[0.2em] font-bold uppercase">Architecture</span>
                    <div className="h-[2px] w-12 bg-gray-300"></div>
                </div>

                <div className="flex flex-col md:flex-row gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="w-full md:w-1/2"
                    >
                        <img
                            src="https://images.unsplash.com/photo-1544197150-b99a580bbcbf?q=80&w=2670&auto=format&fit=crop"
                            alt="Server Hardware"
                            className="w-full h-auto shadow-xl"
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="w-full md:w-1/2"
                    >
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Tech Stack / High-Level</span>
                        <h3 className="text-4xl font-bold mt-4 mb-6">Technical Architecture</h3>
                        <div className="w-12 h-1 bg-primary mb-6"></div>
                        <p className="text-gray-500 leading-relaxed mb-8">
                            We use a SHA-3 (Keccak) Hashing Engine for future-proof security against collision attacks,
                            and IPFS (InterPlanetary File System) logic to ensure data distribution without losing integrity.
                        </p>

                        <div className="space-y-4">
                            <motion.div
                                whileHover={{
                                    scale: 1.05,
                                    x: 10,
                                    boxShadow: "0 10px 30px rgba(255, 77, 0, 0.3)"
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 20
                                }}
                                className="border-t border-gray-200 pt-4 cursor-pointer hover:bg-gray-50 transition-colors p-2"
                            >
                                <span className="block text-xs text-gray-400">Security / Cryptography</span>
                                <h4 className="font-bold text-lg">Zero-Knowledge Proofs (ZKP)</h4>
                                <p className="text-xs text-gray-500 mt-1">Verify credentials without exposing sensitive data.</p>
                            </motion.div>
                            <motion.div
                                whileHover={{
                                    scale: 1.05,
                                    x: 10,
                                    boxShadow: "0 10px 30px rgba(255, 77, 0, 0.3)"
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 20
                                }}
                                className="border-t border-gray-200 pt-4 cursor-pointer hover:bg-gray-50 transition-colors p-2"
                            >
                                <span className="block text-xs text-gray-400">Storage / Immutable</span>
                                <h4 className="font-bold text-lg">Merkle Tree Structures</h4>
                                <p className="text-xs text-gray-500 mt-1">Efficient and secure content addressing.</p>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
