import { Component , OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms'; // Necesario para ngModel
import { CommonModule } from '@angular/common'; // Necesario para *ngIf
import { MatIconModule } from '@angular/material/icon'; // Importa MatIconModule
import { Router } from '@angular/router'; // Importa Router

@Component({
  selector: 'login-component',
  standalone: true,
   imports: [FormsModule, CommonModule, MatIconModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent  implements OnInit {
 
  identificacion: string = '';
  password: string = '';
  showPassword: boolean = false; // Para controlar la visibilidad de la contraseña

  constructor(private router: Router) { }

  ngOnInit(): void {
    
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onLogin(): void {
    // Aquí iría la lógica para enviar los datos de login
    console.log('Intentando iniciar sesión con:');
    console.log('Identificación:', this.identificacion);
    console.log('Contraseña:', this.password);

    // Ejemplo de validación básica (puedes expandir esto)
    if (this.identificacion && this.password) {
      // Generar token aleatorio
      const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('token', token);
      localStorage.setItem('identificacion', this.identificacion);
      // Navegar a home
      this.router.navigate(['home']);
    } else {
      alert('Por favor, ingresa tu identificación y contraseña.');
    }
  }


 
}