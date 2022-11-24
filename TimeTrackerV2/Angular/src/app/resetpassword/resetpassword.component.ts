import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common'

@Component({
  selector: 'app-resetpassword',
  templateUrl: './resetpassword.component.html',
  styleUrls: ['./resetpassword.component.css']
})
export class ResetpasswordComponent implements OnInit {

  data!:any;
  resetForm!:FormGroup;

  constructor(private activeRoute:ActivatedRoute,private location: Location) { }

  ngOnInit(): void {
    
    this.activeRoute.queryParams.subscribe({next:(data: any)=>{
      this.data=data
    }})

    this.resetForm=new FormGroup({

      username:new FormControl(this.data.username),
      newPswd: new FormControl(null),
      confirm:new FormControl(null)
    })

  }

  onSubmit(){
  }
   changedPass(){
      alert('Password has been changed');
      this.location.back()
    }
    
   }


