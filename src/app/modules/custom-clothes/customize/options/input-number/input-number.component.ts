import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';

@Component({
  selector: 'app-input-number',
  templateUrl: './input-number.component.html',
  styleUrls: ['./input-number.component.css'],
})
export class InputNumberComponent implements OnInit {
  /**
   * Valor ingresado por el usuario
   */
  @Input() value: number;
  /**
   * Intervalo que se debe sumar o restar cuando se oprimen las flechas en el input
   */
  @Input() step = 1;
  /**
   * Emite el valor actual en el input cuando se realiza un cambio en ese valor
   */
  @Output() valueChange = new EventEmitter<number>();

  constructor() {}

  ngOnInit(): void {}
  /**
   * Función que emite el valor actual en el input al realizar un cambio en ese valor
   * @param $event Contiene el valor actual en el input
   */
  emitChange($event: number): void {
    this.valueChange.emit($event);
  }
  /**
   * Función que suma el valor actual en el input con el valor de intervalo de conteo
   * y emite ese valor
   */
  onStepUp(): void {
    this.value += this.step;
    this.valueChange.emit(this.value);
  }
  /**
   * Función que resta el valor actual en el input con el valor de intervalo de conteo
   * y emite ese valor
   */
  onStepDown(): void {
    this.value -= this.step;
    this.valueChange.emit(this.value);
  }
}
