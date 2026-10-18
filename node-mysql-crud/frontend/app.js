const API_URL = "https://nexus-tech-api.onrender.com/api/products";

const productList = document.getElementById("product-list");
const totalProducts = document.getElementById("total-products");
const totalStock = document.getElementById("total-stock");
const inventoryValue = document.getElementById("inventory-value");
const apiStatus = document.getElementById("api-status");
const searchInput = document.getElementById("search-products");

const productForm = document.getElementById("product-form");
const productIdInput = document.getElementById("product-id");
const formTitle = document.getElementById("form-title");
const formMessage = document.getElementById("form-message");
const clearFormButton = document.getElementById("clear-form-button");
const addProductButton = document.getElementById("add-product-button");

let products = [];

// Display prices in Zambian kwacha.
function formatPrice(price) {
  return new Intl.NumberFormat("en-ZM", {
    style: "currency",
    currency: "ZMW",
    minimumFractionDigits: 2
  }).format(Number(price) || 0);
}

// Load products from the backend API.
async function loadProducts() {
  apiStatus.textContent = "CONNECTING";

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("The server returned an error.");
    }

    products = await response.json();

    apiStatus.textContent = "ONLINE";
    apiStatus.className = "metric-value text-green";

    displayProducts(products);
    updateSummary();
  } catch (error) {
    apiStatus.textContent = "OFFLINE";
    apiStatus.className = "metric-value text-red";

    productList.innerHTML = `
      <tr>
        <td colspan="6">
          Cannot connect to the API. Check that your backend
          server is running at http://localhost:3000.
        </td>
      </tr>
    `;

    console.error("Product loading failed:", error);
  }
}

// Display products in the table.
function displayProducts(productData) {
  if (productData.length === 0) {
    productList.innerHTML = `
      <tr>
        <td colspan="6">No products found.</td>
      </tr>
    `;
    return;
  }

  productList.innerHTML = productData.map(product => `
    <tr>
      <td class="product-id">${product.id}</td>
      <td>
        <strong>${escapeHTML(product.product_name)}</strong>
        <br>
        <span class="muted">${escapeHTML(product.brand)}</span>
      </td>
      <td>${escapeHTML(product.category)}</td>
      <td>${formatPrice(product.price)}</td>
      <td>
        <span class="stock-badge">${Number(product.quantity)} units</span>
      </td>
      <td>
        <button class="btn" data-action="edit"
                data-id="${product.id}">Edit</button>
        <button class="btn btn-danger" data-action="delete"
                data-id="${product.id}">Delete</button>
      </td>
    </tr>
  `).join("");
}

// Prevent product text from being interpreted as HTML.
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

// Calculate inventory summary figures.
function updateSummary() {
  totalProducts.textContent = products.length;

  totalStock.textContent = products.reduce(
    (sum, product) => sum + Number(product.quantity || 0),
    0
  );

  const value = products.reduce(
    (sum, product) =>
      sum + Number(product.price || 0) * Number(product.quantity || 0),
    0
  );

  inventoryValue.textContent = formatPrice(value);
}

// Search by product name, brand, or category.
searchInput.addEventListener("input", () => {
  const searchTerm = searchInput.value.toLowerCase().trim();

  const filteredProducts = products.filter(product =>
    [product.product_name, product.brand, product.category]
      .some(value =>
        String(value ?? "").toLowerCase().includes(searchTerm)
      )
  );

  displayProducts(filteredProducts);
});

// Show a message below the product form.
function showFormMessage(message, isError = false) {
  formMessage.textContent = message;
  formMessage.className = isError ? "text-red" : "text-green";
}

// Clear the form and return it to Create mode.
function resetProductForm() {
  productForm.reset();
  productIdInput.value = "";
  formTitle.textContent = "Product Editor";
  showFormMessage("");
}

// Create a new product or update an existing one.
productForm.addEventListener("submit", async event => {
  event.preventDefault();

  const id = productIdInput.value;

  const product = {
    product_name: document.getElementById("product-name").value.trim(),
    brand: document.getElementById("brand").value.trim(),
    category: document.getElementById("category").value.trim(),
    price: Number(document.getElementById("price").value),
    quantity: Number(document.getElementById("quantity").value),
    description: document.getElementById("description").value.trim()
  };

  if (
    !product.product_name ||
    !product.brand ||
    !product.category ||
    !product.description ||
    !Number.isFinite(product.price) ||
    product.price < 0 ||
    !Number.isInteger(product.quantity) ||
    product.quantity < 0
  ) {
    showFormMessage(
      "Enter valid product details. Price and quantity cannot be negative.",
      true
    );
    return;
  }

  const isEditing = Boolean(id);
  const url = isEditing ? `${API_URL}/${id}` : API_URL;
  const method = isEditing ? "PUT" : "POST";

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(product)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || result.error || "Unable to save product."
      );
    }

    resetProductForm();

    await loadProducts();

    showFormMessage(
      isEditing
        ? "Product updated successfully."
        : "Product created successfully."
    );
  } catch (error) {
    showFormMessage(error.message, true);
    console.error("Saving product failed:", error);
  }
});

// Clear the form.
clearFormButton.addEventListener("click", resetProductForm);

// Open a blank form when Add Product is clicked.
addProductButton.addEventListener("click", () => {
  resetProductForm();

  document.getElementById("product-form-panel").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

  document.getElementById("product-name").focus();
});

// Handle Edit and Delete buttons in the product table.
productList.addEventListener("click", async event => {
  const button = event.target.closest("button[data-action]");

  if (!button) return;

  const id = button.dataset.id;
  const action = button.dataset.action;

  if (action === "edit") {
    const product = products.find(item => String(item.id) === id);

    if (!product) {
      showFormMessage("Product not found.", true);
      return;
    }

    productIdInput.value = product.id;
    document.getElementById("product-name").value = product.product_name;
    document.getElementById("brand").value = product.brand;
    document.getElementById("category").value = product.category;
    document.getElementById("price").value = product.price;
    document.getElementById("quantity").value = product.quantity;
    document.getElementById("description").value =
      product.description ?? "";

    formTitle.textContent = `Edit Product #${product.id}`;
    showFormMessage("Edit the details, then click Save Product.");

    document.getElementById("product-form-panel").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

    document.getElementById("product-name").focus();
  }

  if (action === "delete") {
    const product = products.find(item => String(item.id) === id);

    if (!product) {
      showFormMessage("Product not found.", true);
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to delete "${product.product_name}"? This cannot be undone.`
    );

    if (!confirmed) return;

    button.disabled = true;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || result.error || "Unable to delete product."
        );
      }

      await loadProducts();
      showFormMessage("Product deleted successfully.");
    } catch (error) {
      showFormMessage(error.message, true);
      console.error("Deleting product failed:", error);
    } finally {
      button.disabled = false;
    }
  }
});

// Load products when the page opens.
loadProducts();
