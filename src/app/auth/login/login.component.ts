import { Router } from '@angular/router';
import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthApiService } from '../auth-api.service';
import { Token } from '../auth.interfaces';
import { AuthService } from '../auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, AfterViewInit {

  errors: string|undefined;
  form: FormGroup;
  @ViewChild('uiUsername', { static: true }) uiUsername!: ElementRef;

  constructor(
    private auth: AuthService,
    private api: AuthApiService,
    private fb: FormBuilder,
    private router: Router,
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  ngOnInit() {
    if (this.auth.isLoggedIn() === true) {
      this.router.navigate(['']);
      return;
    }
  }

  ngAfterViewInit() {
    this.uiUsername.nativeElement.focus();
  }

  login() {
    this.errors = '';
    const form = this.form.value;
    const username = form.username;
    const password = form.password;
    this.api.login(username, password)
      .subscribe((x: Token) => {
          // store token
          this.auth.setToken(x);
          // redirect after login
          if (this.auth.redirectUrl != null) {
            this.router.navigateByUrl(this.auth.redirectUrl);
          } else {
            this.router.navigate(['']);
          }
        },
        (err: HttpErrorResponse) => {
          if (err.status === 401) {
            setTimeout(() => this.errors = 'Credentials are invalid', 200);
          } else if (err.status === 400) {
            setTimeout(() => this.errors = err.error, 200);
          } else {
            setTimeout(() => this.errors = 'An connection error or an server error has occured', 200);
          }
        }
      );
  }
}
