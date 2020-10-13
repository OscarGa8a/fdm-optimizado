import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomizeComponent } from './customize/customize.component';
import { BoardComponent } from './customize/board/board.component';
import { FileSaverModule } from 'ngx-filesaver';

@NgModule({
  declarations: [CustomizeComponent, BoardComponent],
  imports: [
    CommonModule,
    FileSaverModule
  ],
  exports: [
    CustomizeComponent
  ]
})
export class CustomClothesModule { }
