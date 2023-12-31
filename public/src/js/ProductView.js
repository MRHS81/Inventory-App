import Storage from "./Storage.js";

const titleInput = document.querySelector("#product-title");
const quantityInput = document.querySelector("#product-quantity");
const categoryInput = document.querySelector("#product-category");
const addNewProductBtn = document.querySelector("#add-new-product");
const productsList = document.querySelector("#products-list");

const searchInput = document.querySelector("#search-input");
const selectedSort = document.querySelector("#sort-products");
const numberOfProducts = document.querySelector("#numberOfProducts");

const backdrop = document.querySelector("#backdrop");
const editProductModal = document.querySelector("#edit-product-modal");
const closeModalBtn = document.querySelector("#close-modal");

const editTitleInput = document.querySelector("#edit-product-title");
const editQuantityInput = document.querySelector("#edit-product-quantity");
const editCategoryInput = document.querySelector("#edit-product-category");
const editProductBtn = document.querySelector("#edit-product-btn");

class ProductView {
  constructor() {
    this.products = [];
    addNewProductBtn.addEventListener("click", (e) => this.addNewProduct(e));
    searchInput.addEventListener("input", (e) => this.searchProducts(e));
    selectedSort.addEventListener("change", (e) => this.sortProducts(e));
    closeModalBtn.addEventListener("click", () => this.closeEditProductModal());

    editProductBtn.addEventListener("click", (e) => {
      e.preventDefault();

      const productId = e.target.dataset.productId;
      this.editProduct(productId);
    });
  }

  setApp(sort = "newest") {
    this.products = Storage.getAllProducts(sort);
    this.createProductsList(this.products);
    numberOfProducts.textContent = this.products.length;
  }

  createProductItem(titleInput, quantityInput, categoryInput) {
    const title = titleInput.value.trim();
    const quantity = quantityInput.value.trim();
    const category = categoryInput.value.trim();

    if (!title || !quantity || !category) return;

    return { title, quantity, category };
  }

  addNewProduct(e) {
    e.preventDefault();

    Storage.saveProduct(
      this.createProductItem(titleInput, quantityInput, categoryInput)
    );

    this.setApp();

    [titleInput, quantityInput, searchInput].forEach((item) => {
      item.value = "";
    });

    selectedSort.value = "newest";
  }

  createProductsList(products) {
    let result = "";

    products.forEach((product) => {
      const selectedCategory = Storage.getAllCategories().find(
        (c) => c.id === Number(product.category)
      );

      result += `
        <div class="flex items-center justify-between text-xs min-[425px]:text-sm sm:text-base">
          <span class="text-slate-400">${product.title}</span>
          <div class="flex items-center gap-x-1.5 min-[425px]:gap-x-3">
            <span class="text-slate-400 hidden sm:block">${new Date(
              product.createdAt
            ).toLocaleDateString()}</span>
            <span class="block px-3 py-0.5 text-slate-400 border border-slate-400 rounded-2xl">${
              selectedCategory.title
            }</span>
            <span class="flex items-center justify-center w-6 h-6 min-[425px]:w-7 min-[425px]:h-7 rounded-full bg-slate-500 border-2 border-slate-400 text-slate-300">${
              product.quantity
            }</span>
            <button class="edit-product border px-2 py-0.5 rounded-2xl border-yellow-400 text-yellow-400" data-product-id="${
              product.id
            }">edit</button>
            <button class="delete-product border px-2 py-0.5 rounded-2xl border-red-400 text-red-400" data-product-id="${
              product.id
            }">delete</button>
          </div>
        </div>
        `;
    });

    productsList.innerHTML = result;

    const deleteProductBtns = document.querySelectorAll(".delete-product");
    deleteProductBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => this.deleteProduct(e));
    });

    const editProductBtns = document.querySelectorAll(".edit-product");
    editProductBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => this.showEditProductModal(e));
    });
  }

  searchProducts(e) {
    const value = e.target.value.trim().toLowerCase();

    const filteredProducts = this.products.filter((p) =>
      p.title.toLowerCase().includes(value)
    );

    this.createProductsList(filteredProducts);
  }

  sortProducts(e) {
    const value = e.target.value;
    this.setApp(value);
    searchInput.value = "";
  }

  deleteProduct(e) {
    e.preventDefault();

    const productId = e.target.dataset.productId;
    Storage.deleteProduct(productId);
    this.setApp();
  }

  editProduct(productId) {
    const updatedProduct = this.createProductItem(
      editTitleInput,
      editQuantityInput,
      editCategoryInput
    );

    Storage.saveProduct({ id: productId, ...updatedProduct });
    this.setApp();
    this.closeEditProductModal();
  }

  setEditFormValues(productId) {
    const product = this.products.find((p) => p.id === Number(productId));

    editTitleInput.value = product.title;
    editQuantityInput.value = product.quantity;
    editCategoryInput.value = product.category;
    editProductBtn.dataset.productId = product.id;
  }

  showEditProductModal(e) {
    backdrop.classList.remove("hidden");
    editProductModal.classList.remove("-translate-y-full", "opacity-0");
    editProductModal.classList.add("translate-y-[25vh]", "opacity-1");

    const productId = e.target.dataset.productId;
    this.setEditFormValues(productId);
  }

  closeEditProductModal() {
    backdrop.classList.add("hidden");
    editProductModal.classList.add("-translate-y-full", "opacity-0");
    editProductModal.classList.remove("translate-y-[25vh]", "opacity-1");
  }
}

export default new ProductView();
