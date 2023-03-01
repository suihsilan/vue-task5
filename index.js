// import { createApp } from "https://cdnjs.cloudflare.com/ajax/libs/vue/3.2.47/vue.esm-browser.min.js";

const { defineRule, Form, Field, ErrorMessage, configure } = VeeValidate;
const { required, email, min, max } = VeeValidateRules;
const { localize, loadLocaleFromURL } = VeeValidateI18n;

defineRule("required", required);
defineRule("email", email);

// 讀取外部的資源
loadLocaleFromURL("./zh_TW.json");

// Activate the locale
configure({
  generateMessage: localize("zh_TW"),
  validateOnInput: true, // 調整為：輸入文字時，就立即進行驗證
});

const apiUrl = "https://vue3-course-api.hexschool.io";
const apiPath = "sui-vue";

Object.keys(VeeValidateRules).forEach((rule) => {
  if (rule !== "default") {
    VeeValidate.defineRule(rule, VeeValidateRules[rule]);
  }
});

//單一產品modal的元件
const productModal = {
  //當id變動時，取的遠端資料,並呈現modal
  props: ["id", "addToCart", "openModal"],
  data() {
    return {
      modal: {}, //存取實體化的modal
      tempProduct: {},
      qty: 1,
    };
  },
  template: "#userProductModal",
  watch: {
    //利用watch監聽props傳入的id值是否有更新/變動
    id() {
      //id變動了
      console.log("productModal:", this.id);
      if (this.id) {
        //當id存在時才發送請求
        //發送請求，取得單一產品資料
        axios
          .get(`${apiUrl}/v2/api/${apiPath}/product/${this.id}`)
          .then((res) => {
            console.log("單一產品", res.data.product);
            //存入到this.tempProduct 單一產品細節資料
            this.tempProduct = res.data.product;
            this.modal.show();
          })
          .catch((err) => {
            console.log(err.data.message);
          });
      }
    },
  },
  methods: {
    hide() {
      this.modal.hide();
    },
  },
  mounted() {
    //生成modal的生命週期
    //modal實體化
    this.modal = new bootstrap.Modal(this.$refs.modal);
    //監聽dom 當modal關閉時...要做其他事情
    this.$refs.modal.addEventListener("hidden.bs.modal", (event) => {
      this.openModal(""); //更改id
    });
  },
};

Vue.createApp({
  data() {
    return {
      products: [], //產品列表
      productId: "",
      cart: {},
      loadingItem: "", //存id
      form: {
        user: {
          name: "",
          email: "",
          tel: "",
          address: "",
        },
        message: "",
      },
    };
  },
  components: {
    //區域註冊元件
    productModal,
    VForm: Form,
    VField: Field,
    ErrorMessage: ErrorMessage,
  },
  methods: {
    getProducts() {
      //取得產品列表方法
      axios
        .get(`${apiUrl}/v2/api/${apiPath}/products/all`)
        .then((res) => {
          // console.log("產品列表", res.data.products);
          //存入到this.products
          this.products = res.data.products;
        })
        .catch((err) => {
          console.log(err.data.message);
        });
    },
    openModal(id) {
      //傳入該產品的id因應資料顯現正確的產品內容
      this.productId = id;
      // console.log("外層帶入的product id", id);
    },
    addToCart(product_id, qty = 1) {
      //當沒有傳入該參數時，會使用預設值
      //加入購物車方法
      const data = {
        //api需要的欄位結構
        product_id,
        qty,
      };

      axios
        .post(`${apiUrl}/v2/api/${apiPath}/cart`, { data })
        .then((res) => {
          let loader = this.$loading.show();
          // simulate AJAX
          setTimeout(() => {
            loader.hide();
          }, 500);
          // console.log("加入購物車", res.data);
          this.$refs.productModal.hide();
          //觸發取的購物車列表方法
          this.getCarts();
        })
        .catch((err) => {
          console.log(err.data.message);
        });
    },
    getCarts() {
      //取得購物車列表方法
      axios
        .get(`${apiUrl}/v2/api/${apiPath}/cart`)
        .then((res) => {
          // console.log("購物車:", res.data.data);
          //存入購物車列表
          this.cart = res.data.data;
        })
        .catch((err) => {
          console.log(err.data.message);
        });
    },
    updateCartItem(item) {
      //item中的購物車的id ,產品的id
      //更新購物車資料(這段會比較複雜)
      const data = {
        product_id: item.product.id,
        qty: item.qty,
      };
      // console.log("data", data, "購物車id", item.id);
      //發送ajax之前先將品項的id存在變數裡
      this.loadingItem = item.id;
      axios
        .put(`${apiUrl}/v2/api/${apiPath}/cart/${item.id}`, { data })
        .then((res) => {
          //更新購物車後
          // console.log("更新購物車:", res.data.data);
          this.cart = res.data.data;
          //重新取的購物車列表
          this.getCarts();
          let loader = this.$loading.show();
          // simulate AJAX
          setTimeout(() => {
            loader.hide();
          }, 500);
          //已發送請求更新資料後再把這個變數清除，才可以再繼續選擇數量
          this.loadingItem = null;
        })
        .catch((err) => {
          console.log(err.data.message);
        });
    },
    deleteItem(item) {
      axios
        .delete(`${apiUrl}/v2/api/${apiPath}/cart/${item.id}`)
        .then((res) => {
          //刪除購物車後
          // console.log("刪除購物車:", res.data);
          //重新取的購物車列表
          this.getCarts();
          let loader = this.$loading.show();
          // simulate AJAX
          setTimeout(() => {
            loader.hide();
          }, 500);
          this.loadingItem = null;
        })
        .catch((err) => {
          console.log(err.data.message);
        });
    },
    clearCart() {
      axios
        .delete(`${apiUrl}/v2/api/${apiPath}/carts`)
        .then((res) => {
          this.getCarts();
          let loader = this.$loading.show();
          // simulate AJAX
          setTimeout(() => {
            loader.hide();
          }, 500);
          this.loadingItem = null;
        })
        .catch((err) => {
          console.log(err.data.message);
        });
    },
    onSubmit() {
      // console.log("按我");
      const url = `${apiUrl}/v2/api/${apiPath}/order`;
      const order = this.form;
      axios
        .post(url, { data: order })
        .then((response) => {
          alert("結帳成功");
          this.getCarts();
          let loader = this.$loading.show();
          // simulate AJAX
          setTimeout(() => {
            loader.hide();
          }, 500);
          this.$refs.form.resetForm();
        })
        .catch((err) => {
          alert(err.response.data.message);
        });
    },
    isPhone(value) {
      const phoneNumber = /^(09)[0-9]{8}$/;
      return phoneNumber.test(value) ? true : "需要正確的電話號碼";
    },
  },
  mounted() {
    //在畫面生成之後，觸發取的產品資料的方法
    this.getProducts();
    //執行取的購物車列表
    this.getCarts();

    let loader = this.$loading.show();
    setTimeout(() => {
      loader.hide();
    }, 1500);
  },
})
  .use(VueLoading.LoadingPlugin)
  .mount("#app");
