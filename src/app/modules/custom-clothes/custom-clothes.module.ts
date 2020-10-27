import { NgModule, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomizeComponent } from './customize/customize.component';
import { BoardComponent } from './customize/board/board.component';
import { FileSaverModule } from 'ngx-filesaver';
import { FeatherIconsModule } from '../../shared/components/feather-icons/feather-icons.module';
import { HeaderModule } from './customize/header/header.module';
import { SelectionComponent } from './customize/selection/selection.component';
import { OptionsModule } from './customize/options/options.module';
import * as Hammer from 'hammerjs';
import {
  HammerModule,
  HAMMER_GESTURE_CONFIG,
  HammerGestureConfig,
} from '@angular/platform-browser';

@Injectable()
export class HammerConfig extends HammerGestureConfig {
  overrides = {
    swipe: { direction: Hammer.DIRECTION_ALL },
  } as any;
}

@NgModule({
  declarations: [CustomizeComponent, BoardComponent, SelectionComponent],
  imports: [
    CommonModule,
    FileSaverModule,
    FeatherIconsModule,
    HeaderModule,
    OptionsModule,
    HammerModule
  ],
  exports: [
    CustomizeComponent
  ],
  providers: [
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: HammerConfig,
    },
  ],
})
export class CustomClothesModule { }
