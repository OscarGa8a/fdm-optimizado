import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomizeComponent } from './customize/customize.component';
import { BoardComponent } from './customize/board/board.component';
import { FileSaverModule } from 'ngx-filesaver';
import { FeatherIconsModule } from '../../shared/components/feather-icons/feather-icons.module';

@NgModule({
  declarations: [CustomizeComponent, BoardComponent],
  imports: [
    CommonModule,
    FileSaverModule,
    FeatherIconsModule
  ],
  exports: [
    CustomizeComponent
  ]
})
export class CustomClothesModule { }
