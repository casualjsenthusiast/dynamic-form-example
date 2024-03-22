import { Component } from '@angular/core';
import { DynamicFormGeneratorComponent } from './components/dynamic-form-generator/dynamic-form-generator.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DynamicFormGeneratorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'dynamic-form-example';
}
