import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  HostListener,
  ChangeDetectorRef,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Player, Obstacle, ASSETS } from './game-engine'; // Importa la lógica del juego
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule,  MatIconModule,],
  selector: 'game-section',
  templateUrl: './game-section.component.html',
  styleUrls: ['./game-section.component.css'],
})
export class GameSectionComponent implements AfterViewInit, OnDestroy {
  // URLs de assets para el template
  pillAssetUrl = 'data:image/svg+xml;base64,' + btoa(ASSETS.pill);
  injectionAssetUrl = 'data:image/svg+xml;base64,' + btoa(ASSETS.injection);
  virusAssetUrl = 'data:image/svg+xml;base64,' + btoa(ASSETS.virus);
  bacteriaAssetUrl = 'data:image/svg+xml;base64,' + btoa(ASSETS.bacteria);
  @ViewChild('gameCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  // Propiedades del estado del juego
  score = 0;
  highScore = { name: 'Nadie', score: 0 };
  playerName = 'Jugador';
  isPlaying = false;
  isGameOver = false;
  isNight = false; // Nueva propiedad para controlar el tema día/noche

  // Entidades y contexto del Canvas
  private ctx!: CanvasRenderingContext2D;
  private player!: Player;
  private obstacles: Obstacle[] = [];

  // Parámetros del juego
  private gameSpeed = 5;
  private initialGameSpeed = 5;
  private maxGameSpeed = 15;
  private speedIncrement = 0.002;
  private obstacleTimer = 0;
  private obstacleInterval = 120; // Frames entre obstáculos
  private lastScoreThreshold = 0; // Para controlar el cambio de tema

  // Colores para el suelo
  private groundColorDay = '#6D4C41';
  private groundColorNight = '#424242';

  private gameLoopId: number | null = null;
  private readonly HIGH_SCORE_KEY = 'telemedGameHighScore';

  constructor(private cdr: ChangeDetectorRef, private ngZone: NgZone, private router: Router) {
    this.loadHighScore();

    this.virusAssetUrl = 'data:image/svg+xml;base64,' + btoa(ASSETS.virus);
    this.bacteriaAssetUrl =
      'data:image/svg+xml;base64,' + btoa(ASSETS.bacteria);
    this.pillAssetUrl = 'data:image/svg+xml;base64,' + btoa(ASSETS.pill);
    this.injectionAssetUrl =
      'data:image/svg+xml;base64,' + btoa(ASSETS.injection);
  }

  ngAfterViewInit(): void {
    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
    this.setCanvasSize();
    this.setupGame();
  }

  ngOnDestroy(): void {
    if (this.gameLoopId) {
      cancelAnimationFrame(this.gameLoopId);
    }
  }

  backToWaitingRoom(): void {
    if (this.gameLoopId) {
      cancelAnimationFrame(this.gameLoopId);
    }
    this.router.navigate(['waiting-room']);
  }

  // --- Control del Juego ---

  setupGame() {
    this.isGameOver = false;
    this.isPlaying = false;
    this.score = 0;
    this.gameSpeed = this.initialGameSpeed;
    this.obstacles = [];
    this.isNight = false; // Reinicia a tema de día
    this.lastScoreThreshold = 0; // Reinicia el contador de umbral

    const canvas = this.canvasRef.nativeElement;
    const playerHeight = canvas.height * 0.15;
    const playerWidth = playerHeight * 0.5;
    const groundY = canvas.height - playerHeight - canvas.height * 0.05;

    this.player = new Player(
      50,
      groundY,
      playerWidth,
      playerHeight,
      ASSETS.player_run,
      ASSETS.player_jump
    );

    this.drawInitialState();
    this.cdr.detectChanges();
  }

  startGame(): void {
    if (this.playerName.trim() === '') {
      alert('Por favor, introduce un nombre para jugar.');
      return;
    }
    this.isPlaying = true;
    this.isGameOver = false;

    this.ngZone.runOutsideAngular(() => {
      this.gameLoop();
    });
  }

  private gameLoop = (): void => {
    this.updateGame();
    this.draw();

    if (this.isPlaying) {
      this.gameLoopId = requestAnimationFrame(this.gameLoop);
    }
  };

  private endGame(): void {
    this.isPlaying = false;
    this.isGameOver = true;
    if (this.score > this.highScore.score) {
      this.highScore = { name: this.playerName, score: this.score };
      this.saveHighScore();
    }
    this.ngZone.run(() => {
      this.cdr.detectChanges();
    });
  }

  // --- Lógica de Actualización del Juego ---

  private updateGame(): void {
    this.player.update();

    if (this.gameSpeed < this.maxGameSpeed) {
      this.gameSpeed += this.speedIncrement;
    }

    this.manageObstacles();
    this.checkCollisions();
  }

  private manageObstacles(): void {
    this.obstacleTimer++;
    if (this.obstacleTimer > this.obstacleInterval) {
      this.addObstacle();
      this.obstacleTimer = 0;
      this.obstacleInterval = Math.max(50, 150 - this.gameSpeed * 5);
    }

    this.obstacles.forEach((o) => (o.speed = this.gameSpeed));
    this.obstacles.forEach((o) => o.update());
    this.obstacles = this.obstacles.filter((o) => o.x + o.width > 0);
  }

  private addObstacle(): void {
    const canvas = this.canvasRef.nativeElement;
    const groundHeight = canvas.height * 0.05;

    const yPositions = {
      ground: canvas.height - groundHeight,
      lowAir: canvas.height - groundHeight - this.player.height * 1.8,
      highAir: canvas.height - groundHeight - this.player.height * 2.8,
    };

    const obstacleTypes = [
      {
        svg: ASSETS.virus,
        type: 'danger',
        w: 0.08,
        h: 0.08,
        pos: yPositions.ground,
      },
      {
        svg: ASSETS.bacteria,
        type: 'danger',
        w: 0.12,
        h: 0.05,
        pos: yPositions.ground,
      },
      {
        svg: ASSETS.virus,
        type: 'danger',
        w: 0.07,
        h: 0.07,
        pos: yPositions.lowAir,
      },
      {
        svg: ASSETS.pill,
        type: 'reward',
        w: 0.08,
        h: 0.04,
        pos: yPositions.ground,
      },
      {
        svg: ASSETS.injection,
        type: 'reward',
        w: 0.12,
        h: 0.04,
        pos: yPositions.lowAir,
      },
      {
        svg: ASSETS.pill,
        type: 'reward',
        w: 0.07,
        h: 0.035,
        pos: yPositions.highAir,
      },
    ];

    const config =
      obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
    const width = canvas.width * config.w;
    const height = canvas.height * config.h;
    const y = config.pos - height;

    this.obstacles.push(
      new Obstacle(
        canvas.width,
        y,
        width,
        height,
        this.gameSpeed,
        config.svg,
        config.type as 'danger' | 'reward'
      )
    );
  }

  private checkCollisions(): void {
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      if (
        this.player.x < obs.x + obs.width &&
        this.player.x + this.player.width > obs.x &&
        this.player.y < obs.y + obs.height &&
        this.player.y + this.player.height > obs.y
      ) {
        if (obs.type === 'danger') {
          this.endGame();
          return;
        } else {
          this.ngZone.run(() => {
            this.score += 500;
            // Comprueba si se ha cruzado un umbral de 10000 puntos
            const currentThreshold = Math.floor(this.score / 1000);
            if (currentThreshold > this.lastScoreThreshold) {
              this.isNight = !this.isNight; // Cambia el tema
              this.lastScoreThreshold = currentThreshold;
            }
          });
          this.obstacles.splice(i, 1);
        }
      }
    }
  }

  // --- Renderizado en Canvas ---

  private draw(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibuja el suelo con el color del tema actual
    this.ctx.fillStyle = this.isNight
      ? this.groundColorNight
      : this.groundColorDay;
    this.ctx.fillRect(
      0,
      canvas.height - canvas.height * 0.05,
      canvas.width,
      canvas.height * 0.05
    );

    this.player.draw(this.ctx);
    this.obstacles.forEach((o) => o.draw(this.ctx));
  }

  private drawInitialState(): void {
    this.ngZone.runOutsideAngular(() => {
      const canvas = this.canvasRef.nativeElement;
      this.ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.ctx.fillStyle = this.isNight
        ? this.groundColorNight
        : this.groundColorDay;
      this.ctx.fillRect(
        0,
        canvas.height - canvas.height * 0.05,
        canvas.width,
        canvas.height * 0.05
      );
      this.player.draw(this.ctx);
    });
  }

  // --- Manejo de Eventos y UI ---

  @HostListener('window:resize')
  onResize(): void {
    this.setCanvasSize();
    if (!this.isPlaying) {
      this.setupGame();
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (
      (event.code === 'Space' || event.code === 'ArrowUp') &&
      this.isPlaying
    ) {
      event.preventDefault();
      this.player.jump();
    }
  }

  handleCanvasClick(): void {
    if (this.isPlaying) {
      this.player.jump();
    }
  }

  private setCanvasSize(): void {
    const canvas = this.canvasRef.nativeElement;
    const container = canvas.parentElement!;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  }

  // --- Persistencia de Datos ---

  private saveHighScore(): void {
    try {
      localStorage.setItem(this.HIGH_SCORE_KEY, JSON.stringify(this.highScore));
    } catch (e) {
      console.error('No se pudo guardar el récord en localStorage', e);
    }
  }

  private loadHighScore(): void {
    try {
      const stored = localStorage.getItem(this.HIGH_SCORE_KEY);
      if (stored) {
        this.highScore = JSON.parse(stored);
      }
    } catch (e) {
      console.error('No se pudo cargar el récord de localStorage', e);
    }
  }
}
