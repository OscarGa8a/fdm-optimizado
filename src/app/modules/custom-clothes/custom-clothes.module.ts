import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomizeComponent } from './customize/customize.component';
import { BoardComponent } from './customize/board/board.component';
import { FileSaverModule } from 'ngx-filesaver';
import { FeatherIconsModule } from '../../shared/components/feather-icons/feather-icons.module';
import { HeaderModule } from './customize/header/header.module';
import { SelectionComponent } from './customize/selection/selection/selection.component';

@NgModule({
  declarations: [CustomizeComponent, BoardComponent, SelectionComponent],
  imports: [
    CommonModule,
    FileSaverModule,
    FeatherIconsModule,
    HeaderModule
  ],
  exports: [
    CustomizeComponent
  ]
})
export class CustomClothesModule { }
