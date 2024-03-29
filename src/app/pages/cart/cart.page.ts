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
import { UtilService } from '../../services/util.service';
import { NavigationExtras, Router } from '@angular/router';
import { CartService } from 'src/app/services/cart.service';
import { ApiService } from 'src/app/services/api.service';
import { AlertController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
})
export class CartPage implements OnInit {
  coupon: boolean;
  // totalPrice: any;
  // serviceTax: any;
  deliveryCharge: any;
  // dicount: any;
  grandTotal: any;
  constructor(
    public util: UtilService,
    private alertCtrl: AlertController,
    private router: Router,
    public cart: CartService,
    public api: ApiService,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    console.log('this.cart', this.cart);
    this.getStoreList();
  }

  openMenu() {
    this.util.openMenu();
  }

  add(product, index) {
    if (this.cart.cart[index].quantiy > 0) {
      this.cart.cart[index].quantiy = this.cart.cart[index].quantiy + 1;
      console.log('qty val', this.cart.cart[index].quantiy);
      this.cart.addQuantity(this.cart.cart[index].quantiy, product.id);
    }
  }

  remove(product, index) {
    if (this.cart.cart[index].quantiy === 1) {
      this.cart.cart[index].quantiy = 0;
      this.cart.removeItem(product.id);
    } else {
      this.cart.cart[index].quantiy = this.cart.cart[index].quantiy - 1;
      this.cart.addQuantity(this.cart.cart[index].quantiy, product.id);
    }
  }

  getStoreList() {
    const info = [...new Set(this.cart.cart.map((item) => item.store_id))];
    console.log('store iddss==================>>---', info);
    // test
    // info.push(10, 17);
    // test
    const param = {
      id: info.join(),
    };
    this.api.post('stores/getStoresData', param).subscribe(
      (data: any) => {
        console.log('getStoresData', data);
        if (data && data.status === 200 && data.data.length) {
          this.cart.stores = data.data;
          this.cart.calcuate();
        } else {
          // this.util.showToast(this.util.getString('No Stores Found'), 'danger', 'bottom');
          // this.back();
        }
      },
      (error) => {
        console.log('error', error);
        this.util.showToast(this.util.getString('Something went wrong'), 'danger', 'bottom');
      }
    );
  }

  goToPayment() {
    console.log(this.cart.minOrderPrice);

    if (this.cart.totalPrice < this.cart.minOrderPrice) {
      let text;
      if (this.util.cside === 'left') {
        text = this.util.currecny + ' ' + this.cart.minOrderPrice;
      } else {
        text = this.cart.minOrderPrice + ' ' + this.util.currecny;
      }
      this.util.errorToast(this.util.getString('Minimum order amount must be') + text + this.util.getString('or more'));
      return false;
    }

    this.cart.deliveryAt = 'home';
    // this.cart.datetime = this.datetime;
    // if (this.deliveryOption === 'home') {
    //   // console.log('address');

    // } else {
    //   console.log('payment');
    //   this.router.navigate(['tabs/cart/payment']);
    // }
    console.log(this.cart.deliveryAddress);

    if (!this.cart.deliveryAddress) {
      const param: NavigationExtras = {
        queryParams: {
          from: 'cart',
        },
      };
      this.router.navigate(['maps'], param);
    } else {
      this.router.navigate(['/tabs/cart/delivery-options']);
      this.router.navigate(['tabs/cart/payment']);
    }
  }

  back() {
    this.navCtrl.back();
  }

  openCoupon() {
    this.router.navigate(['offers']);
  }

  async variant(item, indeX) {
    console.log(item);
    const allData = [];
    console.log(item && item.variations !== '');
    console.log(item && item.variations !== '' && item.variations.length > 0);
    console.log(item && item.variations !== '' && item.variations.length > 0 && item.variations[0].items.length > 0);
    if (item && item.variations !== '' && item.variations.length > 0 && item.variations[0].items.length > 0) {
      console.log('->', item.variations[0].items);
      item.variations[0].items.forEach((element, index) => {
        console.log('OK');
        let title = '';
        if (this.util.cside === 'left') {
          const price =
            item.variations && item.variations[0] && item.variations[0].items[index] && item.variations[0].items[index].discount
              ? item.variations[0].items[index].discount
              : item.variations[0].items[index].price;
          title = element.title + ' - ' + this.util.currecny + ' ' + price;
        } else {
          const price =
            item.variations && item.variations[0] && item.variations[0].items[index] && item.variations[0].items[index].discount
              ? item.variations[0].items[index].discount
              : item.variations[0].items[index].price;
          title = element.title + ' - ' + price + ' ' + this.util.currecny;
        }
        const data = {
          name: element.title,
          type: 'radio',
          label: title,
          value: index,
          checked: item.variant === index,
        };
        allData.push(data);
      });

      console.log('All Data', allData);
      const alert = await this.alertCtrl.create({
        header: item.name,
        inputs: allData,
        buttons: [
          {
            text: this.util.getString('Cancel'),
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              console.log('Confirm Cancel');
            },
          },
          {
            text: this.util.getString('Ok'),
            handler: (data) => {
              console.log('Confirm Ok', data);
              console.log('before', this.cart.cart[indeX].variant);
              this.cart.cart[indeX].variant = data;
              console.log('after', this.cart.cart[indeX].variant);
              this.cart.calcuate();
            },
          },
        ],
      });

      await alert.present();
    } else {
      console.log('none');
    }
  }
}
