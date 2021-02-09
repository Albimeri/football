import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FooterComponent } from './footer/footer.component';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { environment } from '../environments/environment';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { LoginComponent } from './login/login.component';
import { AdminComponent } from './admin/admin.component';
import { RatingsComponent } from './ratings/ratings.component';
import { HomeService } from './home/home.service';
import { CommonService } from './common/common.service';
import { FirestoreSettingsToken } from '@angular/fire/firestore';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDropConnectedSortingExample } from './drag-and-drop/drag-and-drop.component';
import { PromptDialogComponent } from './prompt-dialog/prompt-dialog.component';
import { HeaderComponent } from './header/header.component';
import { SuggestionsComponent } from './suggestions/suggestions.component';
import { NgxStarsModule } from 'ngx-stars';
import { RulesComponent } from './rules/rules.component';

@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    AppRoutingModule, NgbModule, DragDropModule,
    AngularFireModule.initializeApp(environment.firebase, 'fcc-expenses'),
    AngularFireDatabaseModule,
    NgxStarsModule
  ],
  declarations: [
    AppComponent,
    HomeComponent,
    FooterComponent,
    LoginComponent,
    RatingsComponent,
    CdkDragDropConnectedSortingExample,
    PromptDialogComponent,
    AdminComponent,
    HeaderComponent,
    SuggestionsComponent,
    RulesComponent,
  ],
  bootstrap: [AppComponent],
  providers: [
    AngularFireAuth,
    AngularFirestore,
    HomeService,
    CommonService,
    { provide: FirestoreSettingsToken, useValue: {} }]
})
export class AppModule { }
