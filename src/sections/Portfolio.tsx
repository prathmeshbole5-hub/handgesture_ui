import { motion } from 'framer-motion';

const items = [
    { id: 1, title: 'Chain of Custody', category: 'Timeline', img: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?q=80&w=2676&auto=format&fit=crop' },
    { id: 2, title: 'Hash Verification', category: 'Security', img: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2832&auto=format&fit=crop' },
    { id: 3, title: 'Access Logs', category: 'Metadata', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop' }
];

export const Portfolio = () => {
    return (
        <section id="portfolio" className="bg-dark text-white py-20 min-h-screen flex items-center relative overflow-hidden">
            {/* Background Big T */}
            <div className="absolute right-0 bottom-0 text-[30rem] leading-none font-bold text-gray-800 opacity-20 pointer-events-none select-none">
                T
            </div>

            <div className="container mx-auto px-12 md:px-24 w-full">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                    <div className="flex items-center gap-4 text-gray-400 mb-4 md:mb-0">
                        <span className="text-xl font-bold text-white">04</span>
                        <span className="text-xs tracking-[0.2em] font-bold uppercase">Audit Trail</span>
                        <div className="h-[2px] w-12 bg-primary"></div>
                    </div>

                    <div className="flex gap-6 text-xs font-bold tracking-widest text-gray-500">
                        <span className="text-primary border-b-2 border-primary pb-1 cursor-pointer">ALL</span>
                        <span className="cursor-pointer hover:text-white transition-colors">LOGS</span>
                        <span className="cursor-pointer hover:text-white transition-colors">HASHES</span>
                        <span className="cursor-pointer hover:text-white transition-colors">ALERTS</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {items.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ delay: index * 0.2 }}
                            className="group relative cursor-pointer"
                        >
                            <div className="bg-white overflow-hidden aspect-[3/4] relative">
                                <img
                                    src={item.img}
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100"
                                />
                                <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex items-center justify-center">
                                    <span className="text-white font-bold tracking-widest text-xl">VIEW</span>
                                </div>
                            </div>
                            <div className="mt-4 text-center">
                                <h4 className="text-sm font-bold tracking-widest uppercase">{item.title}</h4>
                                <p className="text-xs text-gray-500 mt-1">{item.category}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
