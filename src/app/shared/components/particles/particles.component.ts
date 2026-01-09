import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-particles',
  template: '<canvas #particleCanvas class="particles-canvas"></canvas>',
  styles: [`
    .particles-canvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
      pointer-events: none;
    }
  `]
})
export class ParticlesComponent implements OnInit {
  @ViewChild('particleCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private mouse = { x: 0, y: 0, radius: 0 };

  ngOnInit() {
    this.initCanvas();
    this.createParticles();
    this.animate();
    this.addEventListeners();
  }

  private initCanvas() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  private resizeCanvas() {
    const canvas = this.canvasRef.nativeElement;
    const container = canvas.parentElement!;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  }

  private createParticles() {
    const canvas = this.canvasRef.nativeElement;
    const particleCount = Math.floor((canvas.width * canvas.height) / 15000);
    
    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 2 + 1;
      const speedX = (Math.random() - 0.5) * 0.5;
      const speedY = (Math.random() - 0.5) * 0.5;
      
      this.particles.push(new Particle(x, y, size, speedX, speedY, this.ctx));
    }
  }

  private addEventListeners() {
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.mouse.radius = 150;
    });

    window.addEventListener('mouseout', () => {
      this.mouse.radius = 0;
    });
  }

  private animate() {
    requestAnimationFrame(() => this.animate());
    this.updateParticles();
  }

  private updateParticles() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].update(this.mouse);
      this.particles[i].draw();
      
      for (let j = i; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          this.ctx.strokeStyle = `rgba(255, 255, 255, ${1 - distance/100})`;
          this.ctx.lineWidth = 0.4;
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.stroke();
        }
      }
    }
  }
}

class Particle {
  constructor(
    public x: number,
    public y: number,
    public size: number,
    private speedX: number,
    private speedY: number,
    private ctx: CanvasRenderingContext2D
  ) {}

  update(mouse: { x: number; y: number; radius: number }) {
    const dx = mouse.x - this.x;
    const dy = mouse.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = mouse.radius;
    
    if (distance < maxDistance) {
      const angle = Math.atan2(dy, dx);
      const force = (maxDistance - distance) / maxDistance * 0.6;
      const directionX = Math.cos(angle) * force;
      const directionY = Math.sin(angle) * force;
      
      this.x -= directionX * 5;
      this.y -= directionY * 5;
    }
    
    this.x += this.speedX;
    this.y += this.speedY;
    const canvas = this.ctx.canvas;
    if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
    if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
    
    if (this.x > canvas.width + 5) this.x = -5;
    else if (this.x < -5) this.x = canvas.width + 5;
    if (this.y > canvas.height + 5) this.y = -5;
    else if (this.y < -5) this.y = canvas.height + 5;
  }

  draw() {
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    this.ctx.fill();
  }
}
