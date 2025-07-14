import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-welcome',
  imports: [MatIconModule],
  templateUrl: './welcome.component.html',
})
export class WelcomeComponent {
  constructor() {
    // Component initialization
  }
}
