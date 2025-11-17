import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { useEffect, useRef } from 'react';

export default function GuestLayout({ children }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Subtle particle system
        const particles = [];
        const particleCount = 30;

        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = Math.random() * 0.8 - 0.4;
                this.speedY = Math.random() * 0.8 - 0.4;
                const goldVariation = Math.random() * 0.4 + 0.6;
                this.color = `rgba(255, ${180 * goldVariation}, ${50 * goldVariation}, ${Math.random() * 0.2 + 0.05})`;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
                if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
            }

            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Initialize particles
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Very subtle background
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, 'rgba(254, 243, 199, 0.02)'); // amber-50
            gradient.addColorStop(1, 'rgba(255, 237, 213, 0.02)'); // orange-50
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Update and draw particles
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });

            // Very subtle connection lines
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 100) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(255, 215, 0, ${0.08 * (1 - distance / 100)})`;
                        ctx.lineWidth = 0.3;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-white">
            {/* Very subtle animated background */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 pointer-events-none"
            />

            {/* Header with Logo */}
            <div className="relative z-10 mb-8 text-center">
                <Link
                    href="/"
                    className="inline-block transition-all duration-300 hover:scale-105"
                >
                    <div className="relative">
                        <ApplicationLogo className="h-20 w-20 fill-current text-amber-500" />
                        <div className="absolute inset-0 bg-amber-200 rounded-full opacity-0 transition-opacity duration-300 hover:opacity-40 blur-md" />
                    </div>
                </Link>


            </div>

            {/* Content Card */}
            <div className="relative z-10 w-full overflow-hidden bg-white px-6 py-6 shadow-lg sm:max-w-md sm:rounded-xl border border-amber-100 transition-all duration-300 hover:shadow-amber-100 hover:border-amber-200">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-400" />
                {children}
            </div>

            {/* Subtle floating elements */}
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-amber-200 rounded-full animate-pulse opacity-60" />
            <div className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-orange-200 rounded-full animate-pulse opacity-40" />
        </div>
    );
}
