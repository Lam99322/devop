import React, { useEffect, useRef } from 'react';

export const FinalOrder = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const settings = {
      particles: {
        length: 500,
        duration: 2,
        velocity: 100,
        effect: -0.75,
        size: 30,
      },
    };

    // Point class
    class Point {
      constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
      }

      clone() {
        return new Point(this.x, this.y);
      }

      length(length) {
        if (typeof length === 'undefined')
          return Math.sqrt(this.x * this.x + this.y * this.y);
        this.normalize();
        this.x *= length;
        this.y *= length;
        return this;
      }

      normalize() {
        const length = this.length();
        this.x /= length;
        this.y /= length;
        return this;
      }
    }

    // Particle class
    class Particle {
      constructor() {
        this.position = new Point();
        this.velocity = new Point();
        this.acceleration = new Point();
        this.age = 0;
      }

      initialize(x, y, dx, dy) {
        this.position.x = x;
        this.position.y = y;
        this.velocity.x = dx;
        this.velocity.y = dy;
        this.acceleration.x = dx * settings.particles.effect;
        this.acceleration.y = dy * settings.particles.effect;
        this.age = 0;
      }

      update(deltaTime) {
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        this.velocity.x += this.acceleration.x * deltaTime;
        this.velocity.y += this.acceleration.y * deltaTime;
        this.age += deltaTime;
      }

      draw(context, image) {
        const ease = (t) => (--t) * t * t + 1;
        const size = image.width * ease(this.age / settings.particles.duration);
        context.globalAlpha = 1 - this.age / settings.particles.duration;
        context.drawImage(
          image,
          this.position.x - size / 2,
          this.position.y - size / 2,
          size,
          size
        );
      }
    }

    // ParticlePool class
    class ParticlePool {
      constructor(length) {
        this.particles = new Array(length);
        for (let i = 0; i < this.particles.length; i++) {
          this.particles[i] = new Particle();
        }
        this.firstActive = 0;
        this.firstFree = 0;
        this.duration = settings.particles.duration;
      }

      add(x, y, dx, dy) {
        this.particles[this.firstFree].initialize(x, y, dx, dy);
        this.firstFree++;
        if (this.firstFree === this.particles.length) this.firstFree = 0;
        if (this.firstActive === this.firstFree) this.firstActive++;
        if (this.firstActive === this.particles.length) this.firstActive = 0;
      }

      update(deltaTime) {
        if (this.firstActive < this.firstFree) {
          for (let i = this.firstActive; i < this.firstFree; i++) {
            this.particles[i].update(deltaTime);
          }
        }
        if (this.firstFree < this.firstActive) {
          for (let i = this.firstActive; i < this.particles.length; i++) {
            this.particles[i].update(deltaTime);
          }
          for (let i = 0; i < this.firstFree; i++) {
            this.particles[i].update(deltaTime);
          }
        }

        while (
          this.particles[this.firstActive].age >= this.duration &&
          this.firstActive !== this.firstFree
        ) {
          this.firstActive++;
          if (this.firstActive === this.particles.length) this.firstActive = 0;
        }
      }

      draw(context, image) {
        if (this.firstActive < this.firstFree) {
          for (let i = this.firstActive; i < this.firstFree; i++) {
            this.particles[i].draw(context, image);
          }
        }
        if (this.firstFree < this.firstActive) {
          for (let i = this.firstActive; i < this.particles.length; i++) {
            this.particles[i].draw(context, image);
          }
          for (let i = 0; i < this.firstFree; i++) {
            this.particles[i].draw(context, image);
          }
        }
      }
    }

    const context = canvas.getContext('2d');
    const particles = new ParticlePool(settings.particles.length);
    const particleRate = settings.particles.length / settings.particles.duration;
    let time;

    const pointOnHeart = (t) => {
      return new Point(
        160 * Math.pow(Math.sin(t), 3),
        130 * Math.cos(t) -
          50 * Math.cos(2 * t) -
          20 * Math.cos(3 * t) -
          10 * Math.cos(4 * t) +
          25
      );
    };

    // Create heart particle image
    const createHeartImage = () => {
      const tempCanvas = document.createElement('canvas');
      const tempContext = tempCanvas.getContext('2d');
      tempCanvas.width = settings.particles.size;
      tempCanvas.height = settings.particles.size;

      const to = (t) => {
        const point = pointOnHeart(t);
        point.x =
          settings.particles.size / 2 +
          (point.x * settings.particles.size) / 350;
        point.y =
          settings.particles.size / 2 -
          (point.y * settings.particles.size) / 350;
        return point;
      };

      tempContext.beginPath();
      let t = -Math.PI;
      let point = to(t);
      tempContext.moveTo(point.x, point.y);
      while (t < Math.PI) {
        t += 0.01;
        point = to(t);
        tempContext.lineTo(point.x, point.y);
      }
      tempContext.closePath();
      tempContext.fillStyle = '#ea80b0';
      tempContext.fill();

      const image = new Image();
      image.src = tempCanvas.toDataURL();
      return image;
    };

    const image = createHeartImage();

    const render = () => {
      requestAnimationFrame(render);

      const newTime = new Date().getTime() / 1000;
      const deltaTime = newTime - (time || newTime);
      time = newTime;

      context.clearRect(0, 0, canvas.width, canvas.height);

      const amount = particleRate * deltaTime;
      for (let i = 0; i < amount; i++) {
        const pos = pointOnHeart(Math.PI - 2 * Math.PI * Math.random());
        const dir = pos.clone().length(settings.particles.velocity);
        particles.add(
          canvas.width / 2 + pos.x,
          canvas.height / 2 - pos.y,
          dir.x,
          -dir.y
        );
      }

      particles.update(deltaTime);
      particles.draw(context, image);

      // Draw text in the center
      context.globalAlpha = 1;
      context.fillStyle = '#ea80b0';
      context.font = 'bold 48px Arial, sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.shadowColor = '#ff69b4';
      context.shadowBlur = 20;
      context.fillText('', canvas.width / 2, canvas.height / 2 - 20);
      context.fillText('', canvas.width / 2, canvas.height / 2 + 30);
      context.shadowBlur = 0;
    };

    const onResize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };

    window.addEventListener('resize', onResize);
    onResize();

    setTimeout(() => {
      render();
    }, 10);

    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh', background: '#000' }}>
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
};
