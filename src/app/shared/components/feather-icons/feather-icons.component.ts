import { Component, OnInit, Input } from '@angular/core';
import * as feather from 'feather-icons';

@Component({
  selector: 'app-feather-icons',
  templateUrl: './feather-icons.component.html',
  styleUrls: ['./feather-icons.component.scss']
})
export class FeatherIconsComponent implements OnInit {
  /**
   * Nombre de icono que será asignado en el componente padre board
   */
  @Input() public icon: any;

  constructor() { }

  ngOnInit(): void {
    setTimeout(() => {
      feather.replace();
    });
  }

}
