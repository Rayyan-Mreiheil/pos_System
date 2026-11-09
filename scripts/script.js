// FreshMart POS - beginner-friendly JavaScript using arrays, objects, loops and DOM events.

// The product catalog is an array of objects.
const products = [
  { id: 1, name: "Red Apples", price: 2.49, category: "Produce", emoji: "🍎" },
  { id: 2, name: "Bananas", price: 1.29, category: "Produce", emoji: "🍌" },
  { id: 3, name: "Fresh Bread", price: 3.25, category: "Bakery", emoji: "🍞" },
  { id: 4, name: "Whole Milk", price: 2.89, category: "Dairy", emoji: "🥛" },
  { id: 5, name: "Cheddar Cheese", price: 4.75, category: "Dairy", emoji: "🧀" },
  { id: 6, name: "Pasta", price: 1.99, category: "Pantry", emoji: "🍝" },
  { id: 7, name: "Orange Juice", price: 3.49, category: "Drinks", emoji: "🧃" },
  { id: 8, name: "Coffee", price: 7.99, category: "Pantry", emoji: "☕" }
];

// Each order entry stores a product ID and the selected quantity.
let currentOrder = [];
let completedSales = [];
let nextProductId = 9;
let nextReceiptNumber = 1;
let toastTimer = null;

// Select the HTML elements we need to update or listen to.
const productGrid = document.querySelector("#productGrid");
const productSearch = document.querySelector("#productSearch");
const categoryFilter = document.querySelector("#categoryFilter");
const orderItems = document.querySelector("#orderItems");
const subtotalElement = document.querySelector("#subtotal");
const totalItemsElement = document.querySelector("#totalItems");
const finalTotalElement = document.querySelector("#finalTotal");
const orderItemLabel = document.querySelector("#orderItemLabel");
const productCount = document.querySelector("#productCount");
const amountPaidInput = document.querySelector("#amountPaid");
const changeDueElement = document.querySelector("#changeDue");
const discountLine = document.querySelector("#discountLine");
const discountAmountElement = document.querySelector("#discountAmount");
const receiptModal = document.querySelector("#receiptModal");
const toastMessage = document.querySelector("#toastMessage");

/**
 * Formats a numeric monetary amount into a currency string (e.g., $2.49).
 */
function formatMoney(amount) {
  return "$" + amount.toFixed(2);
}

/**
 * Searches and returns a product object from the catalog array by its unique ID.
 */
function getProductById(productId) {
  for (let i = 0; i < products.length; i++) {
    if (products[i].id === productId) {
      return products[i];
    }
  }
  return null;
}

/**
 * Finds and returns the specific order entry object (productId and quantity) in the current order list.
 */
function getOrderEntry(productId) {
  for (let i = 0; i < currentOrder.length; i++) {
    if (currentOrder[i].productId === productId) {
      return currentOrder[i];
    }
  }
  return null;
}

/**
 * Renders product cards on the product grid based on search input and category filter values.
 */
function renderProducts() {
  const searchText = productSearch.value.trim().toLowerCase();
  const selectedCategory = categoryFilter.value;
  let html = "";
  let visibleProducts = 0;

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const matchesSearch = product.name.toLowerCase().includes(searchText);
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;

    if (matchesSearch && matchesCategory) {
      html += `
        <article class="product-card">
          <div class="product-visual ${product.category.toLowerCase()}">${product.emoji}</div>
          <p class="product-category">${product.category}</p>
          <h4 class="product-name">${escapeHTML(product.name)}</h4>
          <div class="product-bottom">
            <span class="product-price">${formatMoney(product.price)}</span>
            <button class="add-button" type="button" data-add-id="${product.id}" aria-label="Add ${escapeHTML(product.name)}">+</button>
          </div>
        </article>`;
      visibleProducts++;
    }
  }

  productGrid.innerHTML = html;
  productCount.textContent = products.length + (products.length === 1 ? " product" : " products");
  document.querySelector("#noProductsMessage").classList.toggle("hidden", visibleProducts !== 0);
}

/**
 * Adds a product to the current order or increments its quantity if it's already added.
 */
function addProduct(productId) {
  const product = getProductById(productId);
  if (product === null) {
    return;
  }

  const existingEntry = getOrderEntry(productId);
  if (existingEntry !== null) {
    existingEntry.quantity++;
  } else {
    currentOrder.push({ productId: productId, quantity: 1 });
  }

  renderOrder();
  updatePayment();
  showToast(product.name + " added to the order.");
}

/**
 * Changes the quantity of an item in the current order by a specified change value (+1 or -1).
 */
function changeQuantity(productId, change) {
  const entry = getOrderEntry(productId);
  if (entry === null) {
    return;
  }

  entry.quantity += change;
  if (entry.quantity <= 0) {
    removeProduct(productId);
    return;
  }

  renderOrder();
  updatePayment();
}

/**
 * Removes a product completely from the active order list.
 */
function removeProduct(productId) {
  let newOrder = [];
  for (let i = 0; i < currentOrder.length; i++) {
    if (currentOrder[i].productId !== productId) {
      newOrder.push(currentOrder[i]);
    }
  }
  currentOrder = newOrder;
  renderOrder();
  updatePayment();
}

/**
 * Calculates the total cost of all items in the current order before any discounts.
 */
function calculateSubtotal() {
  let subtotal = 0;
  for (let i = 0; i < currentOrder.length; i++) {
    const product = getProductById(currentOrder[i].productId);
    if (product !== null) {
      subtotal += product.price * currentOrder[i].quantity;
    }
  }
  return subtotal;
}

/**
 * Calculates the total item count across all products in the current order.
 */
function calculateItemCount() {
  let itemCount = 0;
  for (let i = 0; i < currentOrder.length; i++) {
    itemCount += currentOrder[i].quantity;
  }
  return itemCount;
}

/**
 * Calculates a 10% discount if the subtotal is greater than $100.
 */
function calculateDiscount(subtotal) {
  if (subtotal > 100) {
    return subtotal * 0.10;
  }
  return 0;
}

/**
 * Calculates the final total amount after subtracting applicable discounts from the subtotal.
 */
function calculateFinalTotal() {
  const subtotal = calculateSubtotal();
  const discount = calculateDiscount(subtotal);
  return Math.max(0, subtotal - discount);
}

/**
 * Renders the order summary panel HTML and updates all respective totals, counts, and labels.
 */
function renderOrder() {
  if (currentOrder.length === 0) {
    orderItems.innerHTML = `
      <div class="empty-order">
        <div class="empty-icon">＋</div>
        <h4>Your order is empty</h4>
        <p>Add a product from the catalog to begin.</p>
      </div>`;
  } else {
    let html = "";
    for (let i = 0; i < currentOrder.length; i++) {
      const entry = currentOrder[i];
      const product = getProductById(entry.productId);
      if (product !== null) {
        const lineTotal = product.price * entry.quantity;
        html += `
          <div class="order-item">
            <div>
              <p class="order-product-name">${escapeHTML(product.name)}</p>
              <span class="order-unit-price">${formatMoney(product.price)} each</span>
              <button class="remove-button" type="button" data-remove-id="${product.id}">Remove</button>
            </div>
            <div class="quantity-controls" aria-label="Quantity for ${escapeHTML(product.name)}">
              <button type="button" data-quantity-id="${product.id}" data-change="-1" aria-label="Decrease quantity">−</button>
              <span class="quantity-number">${entry.quantity}</span>
              <button type="button" data-quantity-id="${product.id}" data-change="1" aria-label="Increase quantity">+</button>
            </div>
            <div class="order-item-total">${formatMoney(lineTotal)}</div>
          </div>`;
      }
    }
    orderItems.innerHTML = html;
  }

  const subtotal = calculateSubtotal();
  const discount = calculateDiscount(subtotal);
  const itemCount = calculateItemCount();

  subtotalElement.textContent = formatMoney(subtotal);
  totalItemsElement.textContent = itemCount;
  orderItemLabel.textContent = itemCount + (itemCount === 1 ? " item" : " items");
  finalTotalElement.textContent = formatMoney(subtotal - discount);
  discountAmountElement.textContent = "−" + formatMoney(discount);
  discountLine.classList.toggle("hidden", discount === 0);
}

/**
 * Calculates and updates the change due based on the amount paid input.
 */
function updatePayment() {
  const amountPaid = Number(amountPaidInput.value) || 0;
  const change = Math.max(0, amountPaid - calculateFinalTotal());
  changeDueElement.textContent = formatMoney(change);
}

/**
 * Clears the current order list and resets payment inputs and displays.
 */
function clearOrder(showConfirmation) {
  if (currentOrder.length === 0) {
    showToast("The order is already empty.");
    return;
  }

  if (showConfirmation) {
    const shouldClear = window.confirm("Cancel this order and remove all selected products?");
    if (!shouldClear) {
      return;
    }
  }

  currentOrder = [];
  amountPaidInput.value = "";
  renderOrder();
  updatePayment();
  showToast("Order cleared. You can start a new order.");
}

/**
 * Validates the customer's payment, logs the completed sale, and triggers the receipt modal.
 */
function completeSale() {
  if (currentOrder.length === 0) {
    showToast("Add at least one product before completing the sale.");
    return;
  }

  const finalTotal = calculateFinalTotal();
  const amountPaid = Number(amountPaidInput.value) || 0;

  if (amountPaid < finalTotal) {
    showToast("The amount paid must be at least " + formatMoney(finalTotal) + ".");
    amountPaidInput.focus();
    return;
  }

  const receiptNumber = "#FM-" + String(nextReceiptNumber).padStart(3, "0");
  const saleDate = new Date();
  const sale = {
    receiptNumber: receiptNumber,
    date: saleDate,
    itemCount: calculateItemCount(),
    subtotal: calculateSubtotal(),
    discount: calculateDiscount(calculateSubtotal()),
    total: finalTotal,
    paid: amountPaid,
    change: amountPaid - finalTotal,
    items: copyOrderItems()
  };

  completedSales.push(sale);
  showReceipt(sale);
  renderSalesHistory();
  nextReceiptNumber++;
  document.querySelector("#transactionNumber").textContent = "#FM-" + String(nextReceiptNumber).padStart(3, "0");
}

/**
 * Creates a standalone snapshot copy of the items in the current order for records.
 */
function copyOrderItems() {
  const items = [];
  for (let i = 0; i < currentOrder.length; i++) {
    const entry = currentOrder[i];
    const product = getProductById(entry.productId);
    if (product !== null) {
      items.push({
        name: product.name,
        price: product.price,
        quantity: entry.quantity,
        total: product.price * entry.quantity
      });
    }
  }
  return items;
}

/**
 * Populates and displays the receipt modal with sale summary details.
 */
function showReceipt(sale) {
  document.querySelector("#receiptNumber").textContent = sale.receiptNumber;
  document.querySelector("#receiptDate").textContent = sale.date.toLocaleString();
  document.querySelector("#receiptSubtotal").textContent = formatMoney(sale.subtotal);
  document.querySelector("#receiptDiscount").textContent = "−" + formatMoney(sale.discount);
  document.querySelector("#receiptTotal").textContent = formatMoney(sale.total);
  document.querySelector("#receiptPaid").textContent = formatMoney(sale.paid);
  document.querySelector("#receiptChange").textContent = formatMoney(sale.change);
  document.querySelector("#receiptDiscountRow").classList.toggle("hidden", sale.discount === 0);

  let receiptHTML = "";
  for (let i = 0; i < sale.items.length; i++) {
    const item = sale.items[i];
    receiptHTML += `
      <div class="receipt-item">
        <div>${escapeHTML(item.name)}<small>${item.quantity} × ${formatMoney(item.price)}</small></div>
        <strong>${formatMoney(item.total)}</strong>
      </div>`;
  }
  document.querySelector("#receiptItems").innerHTML = receiptHTML;
  receiptModal.classList.remove("hidden");
}

/**
 * Renders the session's sales history table and updates the sales count pill.
 */
function renderSalesHistory() {
  const historyBody = document.querySelector("#salesHistoryBody");
  document.querySelector("#salesCount").textContent = completedSales.length + (completedSales.length === 1 ? " sale" : " sales");

  if (completedSales.length === 0) {
    historyBody.innerHTML = '<tr class="history-empty"><td colspan="5">Completed sales will appear here during this session.</td></tr>';
    return;
  }

  let html = "";
  for (let i = completedSales.length - 1; i >= 0; i--) {
    const sale = completedSales[i];
    html += `
      <tr>
        <td><strong>${sale.receiptNumber}</strong></td>
        <td>${sale.date.toLocaleString()}</td>
        <td>${sale.itemCount}</td>
        <td class="align-right"><strong>${formatMoney(sale.total)}</strong></td>
        <td><span class="sale-status">Completed</span></td>
      </tr>`;
  }
  historyBody.innerHTML = html;
}

/**
 * Resets the order state to start a new order and hides the receipt modal.
 */
function startNewOrder() {
  currentOrder = [];
  amountPaidInput.value = "";
  renderOrder();
  updatePayment();
  receiptModal.classList.add("hidden");
  showToast("Ready for the next customer.");
}

/**
 * Displays a temporary toast notification message on the screen.
 */
function showToast(message) {
  toastMessage.textContent = message;
  toastMessage.classList.remove("hidden");
  if (toastTimer !== null) {
    clearTimeout(toastTimer);
  }
  toastTimer = setTimeout(function () {
    toastMessage.classList.add("hidden");
  }, 2600);
}

/**
 * Updates the top bar clock with the current system date and time.
 */
function updateClock() {
  document.querySelector("#currentDateTime").textContent = new Date().toLocaleString();
}

/**
 * Escapes user-entered strings to safely insert them into HTML and prevent XSS injection.
 */
function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Event delegation: the product buttons are created dynamically by renderProducts().
productGrid.addEventListener("click", function (event) {
  const button = event.target.closest("[data-add-id]");
  if (button !== null) {
    addProduct(Number(button.dataset.addId));
  }
});

// Event delegation for the quantity and remove buttons in the order summary list.
orderItems.addEventListener("click", function (event) {
  const quantityButton = event.target.closest("[data-quantity-id]");
  const removeButton = event.target.closest("[data-remove-id]");

  if (quantityButton !== null) {
    changeQuantity(Number(quantityButton.dataset.quantityId), Number(quantityButton.dataset.change));
  } else if (removeButton !== null) {
    removeProduct(Number(removeButton.dataset.removeId));
  }
});

productSearch.addEventListener("input", renderProducts);
categoryFilter.addEventListener("change", renderProducts);
amountPaidInput.addEventListener("input", updatePayment);

document.querySelector("#clearOrderBtn").addEventListener("click", function () {
  clearOrder(true);
});
document.querySelector("#completeSaleBtn").addEventListener("click", completeSale);
document.querySelector("#closeReceiptBtn").addEventListener("click", function () {
  receiptModal.classList.add("hidden");
});
document.querySelector("#newOrderBtn").addEventListener("click", startNewOrder);
document.querySelector("#printReceiptBtn").addEventListener("click", function () {
  window.print();
});

// Handles custom product creation form submission and adds it to the catalog.
document.querySelector("#customProductForm").addEventListener("submit", function (event) {
  event.preventDefault();

  const nameInput = document.querySelector("#customProductName");
  const priceInput = document.querySelector("#customProductPrice");
  const categoryInput = document.querySelector("#customProductCategory");

  const name = nameInput.value.trim();
  const price = Number(priceInput.value);
  const category = categoryInput.value;

  const categoryEmojis = {
    Produce: "🍎",
    Bakery: "🍞",
    Dairy: "🥛",
    Pantry: "☕",
    Drinks: "🧃"
  };

  if (name === "" || !Number.isFinite(price) || price <= 0) {
    showToast("Enter a product name and a price greater than zero.");
    return;
  }

  products.push({
    id: nextProductId,
    name: name,
    price: price,
    category: category,
    emoji: categoryEmojis[category] || "🛍️"
  });

  nextProductId++;

  renderProducts();

  nameInput.value = "";
  priceInput.value = "";

  showToast(name + " added to the product catalog.");
});

// Close the receipt modal when the cashier clicks outside the receipt card background.
receiptModal.addEventListener("click", function (event) {
  if (event.target === receiptModal) {
    receiptModal.classList.add("hidden");
  }
});

// Initial page setup execution on load.
renderProducts();
renderOrder();
renderSalesHistory();
updatePayment();
updateClock();
setInterval(updateClock, 1000);