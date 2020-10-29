import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
/**
 * Componente que maneja el texto mostrado en la cabecera de las opciones del editor
 */
@Component({
  selector: 'app-top-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  /**
   * Almacena el título de la opción seleccionada en el editor
   */
  @Input() title: string;
  /**
   * Indica si se debe mostrar el mensaje de cuando se realiza un cambio
   * en la opción seleccionada
   */
  @Input() showMessage = false;
  /**
   * Indica si se ha cerrado la opción seleccionada previamente en el editor
   */
  @Output() eventClose = new EventEmitter<boolean>();

  // constructor() { }

  // ngOnInit(): void {}

  /**
   * Función que emite un evento cuando se cierra la opción seleccionada en el editor
   */
  sendClose = (): void => {
    // console.log('sendClose');
    this.eventClose.emit(true);
  }

}
