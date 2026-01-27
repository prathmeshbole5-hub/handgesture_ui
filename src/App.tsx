import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './sections/Hero';
import { About } from './sections/About';
import { Services } from './sections/Services';
import { Portfolio } from './sections/Portfolio';
import { Blog } from './sections/Blog';
import { Contact } from './sections/Contact';
import { GestureController } from './components/GestureController';
import { SectionWrapper } from './components/SectionWrapper';

function App() {
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'services', 'portfolio', 'blog', 'contact'];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* Custom Cursor Logic */
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      if ((e.target as HTMLElement).tagName === 'A' || (e.target as HTMLElement).tagName === 'BUTTON' || (e.target as HTMLElement).closest('a') || (e.target as HTMLElement).closest('button')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <div className="bg-dark min-h-screen text-white font-sans selection:bg-primary selection:text-white relative cursor-none">
      {/* Global Scanline Effect */}
      <div className="fixed inset-0 pointer-events-none z-[50] opacity-[0.03] scanline"></div>

      {/* Custom Mouse Cursor */}
      <div
        className="fixed pointer-events-none z-[9999] mix-blend-difference transition-transform duration-100 ease-out"
        style={{
          left: cursorPos.x,
          top: cursorPos.y,
          transform: `translate(-50%, -50%) scale(${isHovering ? 2.5 : 1})`
        }}
      >
        <div className={`w-4 h-4 rounded-full bg-white ${isHovering ? 'opacity-50' : 'opacity-100'}`}></div>
        {isHovering && <div className="absolute inset-0 border border-white rounded-full animate-ping"></div>}
      </div>

      {/* Global Spotlight Effect */}
      <div
        className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${cursorPos.x}px ${cursorPos.y}px, rgba(255, 77, 0, 0.06), transparent 80%)`
        }}
      ></div>


      <Navbar activeSection={activeSection} />

      {/* Hand Gesture Controller Overlay */}
      <GestureController />

      <main>
        <SectionWrapper id="home">
          <Hero />
        </SectionWrapper>

        <SectionWrapper id="about" delay={0.2}>
          <About />
        </SectionWrapper>

        <SectionWrapper id="services" delay={0.2}>
          <Services />
        </SectionWrapper>

        <SectionWrapper id="portfolio" delay={0.2}>
          <Portfolio />
        </SectionWrapper>

        <SectionWrapper id="blog" delay={0.2}>
          <Blog />
        </SectionWrapper>

        <SectionWrapper id="contact" delay={0.2}>
          <Contact />
        </SectionWrapper>
      </main>
    </div>
  );
}

export default App;
