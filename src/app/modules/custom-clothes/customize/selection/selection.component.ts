import { Component, OnInit, Output, EventEmitter } from '@angular/core';
/**
 * Componente que muestra las opciones en el editor
 */
@Component({
  selector: 'app-selection',
  templateUrl: './selection.component.html',
  styleUrls: ['./selection.component.css']
})
export class SelectionComponent {
  /**
   * Emite la opción de personalización escogida en el editor
   */
  @Output() openOneEvent = new EventEmitter<string>();

  // constructor() { }

  // ngOnInit(): void {}
  /**
   * Función que permite emitir la opción de personalización escogida
   * @param option Cadena con la opción escogida
   */
  sendOpenOne(option: string) {
    // console.log('sendOpenOne');
    this.openOneEvent.emit(option);
  }

}
