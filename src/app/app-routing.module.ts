import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  { path: '',
    pathMatch: 'full',
    redirectTo: 'custom'
  },
  { path: 'custom',
    loadChildren: () => import('./pages/custom-clothes-page/custom-clothes-page.module').then(m => m.CustomClothesPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
