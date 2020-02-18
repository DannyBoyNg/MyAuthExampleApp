import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  private apiUrl = environment.apiUrl;
  secretMessage: Observable<string>|undefined;

  constructor(private http: HttpClient, public auth: AuthService) { }

  ngOnInit(): void {
    this.secretMessage = this.http.get(`${this.apiUrl}/home`, { responseType: 'text' });
  }

}
