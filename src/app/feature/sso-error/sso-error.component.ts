import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sso-error',
  standalone: true,
  imports: [],
  templateUrl: './sso-error.component.html',
  styleUrl: './sso-error.component.scss'
})
export class SsoErrorComponent {
  constructor(private router: Router) {}

  retry(): void {
    // 重新導向到 SSO 入口
    this.router.navigate(['/']);
  }
}
