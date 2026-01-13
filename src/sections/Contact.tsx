import { motion } from 'framer-motion';
import { Mail, Phone, MapPin } from 'lucide-react';

export const Contact = () => {
    return (
        <section id="contact" className="min-h-screen bg-dark text-white flex flex-col md:flex-row relative">
            {/* Left: Contact Info & Form */}
            <div className="w-full md:w-1/2 p-12 md:p-24 flex flex-col justify-center bg-zinc-900 z-10">
                <div className="flex items-center gap-4 text-gray-400 mb-12">
                    <span className="text-xl font-bold text-white">06</span>
                    <span className="text-xs tracking-[0.2em] font-bold uppercase">Contact</span>
                    <div className="h-[2px] w-12 bg-primary"></div>
                </div>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-4xl font-bold tracking-widest uppercase mb-12"
                >
                    Contact
                    <div className="w-24 h-1 bg-primary mt-4"></div>
                </motion.h2>

                <div className="space-y-6 mb-12">
                    <div className="flex items-center gap-4">
                        <Mail className="text-gray-500" size={20} />
                        <div>
                            <span className="block text-xs text-gray-500 uppercase tracking-wider">E-Mail</span>
                            <a href="mailto:contact@vanzer.com" className="text-sm font-bold hover:text-primary transition-colors">contact@vanzer.com</a>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Phone className="text-gray-500" size={20} />
                        <div>
                            <span className="block text-xs text-gray-500 uppercase tracking-wider">Phone</span>
                            <span className="text-sm font-bold">(541) 754-3010</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <MapPin className="text-gray-500" size={20} />
                        <div>
                            <span className="block text-xs text-gray-500 uppercase tracking-wider">Address</span>
                            <span className="text-sm font-bold">123 Street Name, City, Country</span>
                        </div>
                    </div>
                </div>

                <form className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <input type="text" placeholder="Your Name" className="bg-transparent border border-gray-700 p-3 text-sm focus:border-primary focus:outline-none transition-colors" />
                        <input type="email" placeholder="Your E-Mail" className="bg-transparent border border-gray-700 p-3 text-sm focus:border-primary focus:outline-none transition-colors" />
                    </div>
                    <input type="text" placeholder="Your Topic" className="w-full bg-transparent border border-gray-700 p-3 text-sm focus:border-primary focus:outline-none transition-colors" />
                    <textarea placeholder="Your Message" rows={4} className="w-full bg-transparent border border-gray-700 p-3 text-sm focus:border-primary focus:outline-none transition-colors"></textarea>

                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn-glow bg-primary text-white text-xs font-bold uppercase tracking-widest px-8 py-3 hover:bg-white hover:text-black transition-colors"
                    >
                        Send Message
                    </motion.button>
                </form>
            </div>

            {/* Right: Map Placeholder */}
            <div className="w-full md:w-1/2 h-[50vh] md:h-full bg-gray-800 relative grayscale">
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.15830869428!2d-74.119763973046!3d40.69766374874431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2s!4v1650000000000!5m2!1sen!2s"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-dark/20 pointer-events-none"></div>
            </div>
        </section>
    );
};
