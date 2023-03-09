import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-content',
  templateUrl: './main-content.component.html',
  styleUrls: ['./main-content.component.css']
})
export class MainContentComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  goToBlog(): void {
    this.router.navigate(['/blog'])
  }

}
