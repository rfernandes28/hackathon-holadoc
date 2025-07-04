// --- Clases de Entidades del Juego ---

// Representa cualquier objeto en movimiento en el juego
export class Entity {
  img: HTMLImageElement;
  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number,
    public speed: number,
    svgData: string
  ) {
    this.img = new Image();
    this.img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
  }

  update() {
    this.x -= this.speed;
  }
}

// Representa al jugador (AHORA CON ANIMACIÓN)
export class Player extends Entity {
  velocityY = 0;
  gravity = 0.5;
  jumpPower = -12;
  isJumping = false;
  groundY: number;

  // Propiedades de la animación
  private runFrames: HTMLImageElement[] = [];
  private jumpFrame: HTMLImageElement;
  private currentFrameIndex = 0;
  private animationTimer = 0;
  private animationSpeed = 8; // Cambiar de frame cada 8 ciclos del juego

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    runSvgData: string[],
    jumpSvgData: string
  ) {
    // Llama al constructor padre con el primer frame de la animación
    super(x, y, width, height, 0, runSvgData[0]);

    // Carga todos los frames de la animación de correr
    this.runFrames = runSvgData.map((svg) => {
      const img = new Image();
      img.src = 'data:image/svg+xml;base64,' + btoa(svg);
      return img;
    });

    // Carga el frame de salto
    this.jumpFrame = new Image();
    this.jumpFrame.src = 'data:image/svg+xml;base64,' + btoa(jumpSvgData);

    this.groundY = y;
  }

  // El método de dibujo ahora elige qué frame mostrar
  override draw(ctx: CanvasRenderingContext2D) {
    let currentImage: HTMLImageElement;

    if (this.isJumping) {
      currentImage = this.jumpFrame;
    } else {
      currentImage = this.runFrames[this.currentFrameIndex];
    }

    ctx.drawImage(currentImage, this.x, this.y, this.width, this.height);
  }

  // El método de actualización ahora también controla la animación
  override update() {
    // Lógica de salto y gravedad (existente)
    this.velocityY += this.gravity;
    this.y += this.velocityY;

    if (this.y > this.groundY) {
      this.y = this.groundY;
      this.velocityY = 0;
      this.isJumping = false;
    }

    // Lógica de la animación
    if (!this.isJumping) {
      this.animationTimer++;
      if (this.animationTimer >= this.animationSpeed) {
        this.animationTimer = 0;
        this.currentFrameIndex =
          (this.currentFrameIndex + 1) % this.runFrames.length;
      }
    }
  }

  jump() {
    if (!this.isJumping) {
      this.velocityY = this.jumpPower;
      this.isJumping = true;
    }
  }
}

// Representa obstáculos y coleccionables
export class Obstacle extends Entity {
  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    speed: number,
    svgData: string,
    public type: 'danger' | 'reward'
  ) {
    super(x, y, width, height, speed, svgData);
  }
}

// --- SVGs para los Assets del Juego (ACTUALIZADO) ---
export const ASSETS = {
  player_run: [
    // Frame 1
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 100"><g fill="#3498db"><circle cx="25" cy="15" r="10"/><rect x="15" y="30" width="20" height="40" rx="5"/><rect x="5" y="70" width="15" height="30" rx="5"/><rect x="30" y="70" width="15" height="30" rx="5"/></g></svg>`,
    // Frame 2
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 100"><g fill="#3498db"><circle cx="25" cy="15" r="10"/><rect x="15" y="30" width="20" height="40" rx="5"/><rect x="5" y="70" width="15" height="25" rx="5" transform="rotate(-15 12.5 82.5)"/><rect x="30" y="70" width="15" height="30" rx="5" transform="rotate(15 37.5 85)"/></g></svg>`,
  ],
  player_jump: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 100"><g fill="#3498db"><circle cx="25" cy="15" r="10"/><rect x="15" y="30" width="20" height="40" rx="5"/><rect x="10" y="65" width="15" height="25" rx="5" transform="rotate(20 17.5 77.5)"/><rect x="25" y="65" width="15" height="25" rx="5" transform="rotate(-20 32.5 77.5)"/></g></svg>`,
  virus: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="30" fill="#e74c3c"/><g fill="#c0392b"><rect x="45" y="5" width="10" height="20" rx="5"/><rect x="45" y="75" width="10" height="20" rx="5"/><rect x="5" y="45" width="20" height="10" rx="5"/><rect x="75" y="45" width="20" height="10" rx="5"/><rect transform="rotate(45 25 25)" x="20" y="10" width="10" height="20" rx="5"/><rect transform="rotate(45 75 75)" x="70" y="60" width="10" height="20" rx="5"/><rect transform="rotate(-45 75 25)" x="70" y="10" width="10" height="20" rx="5"/><rect transform="rotate(-45 25 75)" x="20" y="60" width="10" height="20" rx="5"/></g></svg>`,
  bacteria: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 40"><rect x="5" y="5" width="90" height="30" rx="15" fill="#f1c40f"/><circle cx="25" cy="20" r="5" fill="#f39c12"/><circle cx="50" cy="20" r="3" fill="#f39c12"/><circle cx="75" cy="20" r="5" fill="#f39c12"/></svg>`,
  pill: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50"><path d="M25,0 A25,25 0 0,0 25,50 H75 A25,25 0 0,0 75,0 H25 Z" fill="#2ecc71"/><path d="M50,0 V50 H75 A25,25 0 0,0 75,0 H50 Z" fill="#27ae60"/></svg>`,
  injection: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40"><g fill="#9b59b6"><rect x="0" y="10" width="20" height="20" rx="5"/><rect x="15" y="0" width="10" height="40" rx="5"/><rect x="25" y="12.5" width="70" height="15" rx="5" fill="#bdc3c7"/><path d="M90 5 L 120 20 L 90 35 Z" fill="#8e44ad"/></g></svg>`,
};
