/*
  Authors : initappz (Rahul Jograna)
  Website : https://initappz.com/
  App Name : ionic 5 groceryee app
  Created : 10-Sep-2020
  This App Template Source code is licensed as per the
  terms found in the Website https://initappz.com/license
  Copyright and Good Faith Purchasers © 2020-present initappz.
*/
import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';
import { NavController } from '@ionic/angular';
@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
})
export class ResetPasswordPage implements OnInit {
  div_type;
  sent: boolean;
  email: any;
  otp: any;
  myOPT: any;
  verified: any;
  userid: any;
  password: any;
  repass: any;
  loggedIn: boolean;
  id: any;
  constructor(
    private api: ApiService,
    public util: UtilService,
    private navCtrl: NavController
  ) {
    this.div_type = 1;
    this.sent = false;
    this.email = '';
    this.otp = '';
    this.password = '';
    this.repass = '';
    this.verified = false;
  }

  ngOnInit() {
  }

  sendOTP() {
    console.log(this.email, ';sendOTPDriver');
    if (!this.email) {
      this.util.showToast(this.util.getString('email is required'), 'dark', 'bottom');
      return false;
    }
    const emailfilter = /^[\w._-]+[+]?[\w._-]+@[\w.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailfilter.test(this.email)) {
      this.util.showToast(this.util.getString('Please enter valid email'), 'dark', 'bottom');
      return false;
    }
    this.loggedIn = true;
    const param = {
      email: this.email
    };
    this.api.post('users/sendOTP', param).subscribe((data: any) => {
      console.log(data);
      this.loggedIn = false;
      if (data && data.status === 200) {
        this.id = data.data.id;
        this.loggedIn = false;
        this.div_type = 2;
      } else {
        if (data && data.status === 500 && data.data && data.data.message) {
          this.util.errorToast(data.data.message);
          return false;
        }
        this.util.errorToast(this.util.getString('Something went wrong'));
        return false;
      }
    }, error => {
      console.log(error);
      this.loggedIn = false;
      this.util.errorToast(this.util.getString('Something went wrong'));
    });
  }

  verifyOTP() {
    // this.div_type = 3;
    if (!this.otp || this.otp === '') {
      this.util.showToast(this.util.getString('otp is required'), 'dark', 'bottom');
      return false;
    }
    this.loggedIn = true;
    const param = {
      id: this.id,
      otp: this.otp
    };
    this.api.post('users/verifyOTP', param).subscribe((data: any) => {
      console.log(data);
      this.loggedIn = false;
      if (data && data.status === 200) {
        this.loggedIn = false;
        this.div_type = 3;
      } else {
        if (data && data.status === 500 && data.data && data.data.message) {
          this.util.errorToast(data.data.message);
          return false;
        }
        this.util.errorToast(this.util.getString('Something went wrong'));
        return false;
      }
    }, error => {
      console.log(error);
      this.loggedIn = false;
      this.util.errorToast(this.util.getString('Something went wrong'));
    });
  }

  sendEmail() {
    console.log('pwddd0<<<<<<', this.password);
    if (!this.password || !this.repass || this.password === '' || this.repass === '') {
      this.util.errorToast(this.util.getString('All Field are required'));
      return false;
    }
    const param = {
      email: this.email,
      pwd: this.password
    };
    this.loggedIn = true;
    this.api.post('users/update_password', param).subscribe((data: any) => {
      console.log(data);
      this.loggedIn = false;
      if (data && data.status === 200) {
        this.loggedIn = false;
        this.util.errorToast(this.util.getString('Password Updated'));
        this.back();
      } else {
        if (data && data.status === 500 && data.data && data.data.message) {
          this.util.errorToast(data.data.message);
          return false;
        }
        this.util.errorToast(this.util.getString('Something went wrong'));
        return false;
      }
    }, error => {
      console.log(error);
      this.loggedIn = false;
      this.util.errorToast(this.util.getString('Something went wrong'));
    });
  }

  back() {
    this.navCtrl.back();
  }
}
