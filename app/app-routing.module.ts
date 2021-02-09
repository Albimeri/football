import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RatingsComponent } from './ratings/ratings.component';
import { AdminComponent } from './admin/admin.component';
import { SuggestionsComponent } from './suggestions/suggestions.component';
import { RulesComponent } from './rules/rules.component';


const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    loadChildren: ''
  },
  {
    path: 'ratings',
    component: RatingsComponent,
    loadChildren: ''
  },
  {
    path: 'suggestions',
    component: SuggestionsComponent,
    loadChildren: ''
  },

  {
    path: 'admin',
    component: AdminComponent,
    loadChildren: ''
  },
  {
    path: 'rules',
    component: RulesComponent,
    loadChildren: ''
  },
  {
    path: '',
    component: HomeComponent,
    loadChildren: ''
  },
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full'
  },

  { path: '**', component: HomeComponent }

  // { path: 'add-expense', component: HomeComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
