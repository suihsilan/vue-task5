import { createApp } from "https://unpkg.com/vue@3/dist/vue.esm-browser.js";

const apiUrl = "https://vue3-course-api.hexschool.io";
const apiPath = "sui-vue";

//單一產品modal的元件
const productModal = {
  //當id變動時，取的遠端資料,並呈現modal
  props: ["id", "addToCart"],
  data() {
    return {
      modal: {}, //存取實體化的modal
      tempProduct: {},
    };
  },
  template: "#userProductModal",
  watch: {
    //利用watch監聽props傳入的id值是否有更新/變動
    id() {
      console.log("productModal:", this.id);
      //發送請求，取得單一產品資料
      axios
        .get(`${apiUrl}/v2/api/${apiPath}/product/${this.id}`)
        .then((res) => {
          console.log("單一產品", res.data.product);
          //存入到this.tempProduct 單一產品細節資料
          this.tempProduct = res.data.product;
        })
        .catch((err) => {
          console.log(err.data.message);
        });

      this.modal.show();
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
    // this.modal.show();
  },
};

const app = createApp({
  data() {
    return {
      products: [], //產品列表
      productId: "",
      carts: [],
    };
  },
  methods: {
    getProducts() {
      //取得產品列表方法
      axios
        .get(`${apiUrl}/v2/api/${apiPath}/products/all`)
        .then((res) => {
          console.log("產品列表", res.data.products);
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
      console.log("外層帶入的product id", id);
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
          console.log("加入購物車", res.data);
          this.$refs.productModal.hide();
        })
        .catch((err) => {
          console.log(err.data.message);
        });
    },
  },
  components: {
    //區域註冊元件
    productModal,
  },
  mounted() {
    //在畫面生成之後，觸發取的產品資料的方法
    this.getProducts();
  },
});

app.mount("#app");
