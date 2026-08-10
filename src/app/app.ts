import { Component } from '@angular/core';

import { HeroComponent } from './hero/hero.component';

@Component({
  selector: 'app-root',
  imports: [HeroComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
