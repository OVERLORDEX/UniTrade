import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { ListingsComponent } from './pages/listings/listings';
import { ListingDetailComponent } from './pages/listing-detail/listing-detail';
import { CreateListingComponent } from './pages/create-listing/create-listing';
import { EditListingComponent } from './pages/edit-listing/edit-listing';
import { MyListingsComponent } from './pages/my-listings/my-listings';
import { FavoritesComponent } from './pages/favorites/favorites';
import { ProfileComponent } from './pages/profile/profile';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'listings', component: ListingsComponent },
  { path: 'listings/:id', component: ListingDetailComponent },
  { path: 'create-listing', component: CreateListingComponent },
  { path: 'edit-listing/:id', component: EditListingComponent },
  { path: 'my-listings', component: MyListingsComponent },
  { path: 'favorites', component: FavoritesComponent },
  { path: 'profile', component: ProfileComponent },
];