# FreshMart POS — JavaScript Practice Starter

This starter project intentionally contains **no JavaScript implementation**. The HTML and CSS are ready; your job is to write `script.js`.

## Run it
1. Open `index.html` in your browser.
2. Open this folder in VS Code.
3. Create a new file named `script.js` in the same folder. The HTML already includes `<script src="script.js"></script>`.
4. Complete the tasks below in order and refresh the browser to test.

## Practice checklist
- [ ] Create an array of at least 6 product objects.
- [ ] Render product cards from your array.
- [ ] Make the Add buttons add products to the order.
- [ ] Display each selected product's name, unit price, quantity, and line total.
- [ ] Implement increase, decrease, and remove buttons.
- [ ] Show an empty-order message when the order is empty.
- [ ] Calculate subtotal, total quantity, and final total.
- [ ] Clear the order after asking for confirmation.
- [ ] Validate the amount paid and calculate change.
- [ ] Complete the sale and show the receipt.
- [ ] Add product search and category filtering.
- [ ] Add a 10% discount if subtotal is greater than $100.
- [ ] Add a custom product.
- [ ] Show the current date and time.
- [ ] Track completed sales during the current session.

## Useful element IDs
`productGrid`, `productSearch`, `categoryFilter`, `noProductsMessage`, `customProductForm`, `customProductName`, `customProductPrice`, `orderItems`, `subtotal`, `totalItems`, `finalTotal`, `discountLine`, `discountAmount`, `amountPaid`, `changeDue`, `clearOrderBtn`, `completeSaleBtn`, `transactionNumber`, `receiptModal`, `receiptItems`, `newOrderBtn`, `salesHistoryBody`, `salesCount`, `currentDateTime`, `toastMessage`.

## Recommended order
Start with selecting elements using `document.querySelector()`. Then define your product array and `currentOrder` array. Build one small function at a time and test it before moving on.

Note: The product cards are static HTML in this starter so you can begin by implementing the order behavior. Later, replace them with cards generated from your products array.
