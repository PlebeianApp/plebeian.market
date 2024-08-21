## checkout experience flow

> Prototype: [figma](https://www.figma.com/design/qddIrt9LUqwr3HVPJvL19K/Untitled?node-id=0-1&t=ZoOKfLxJ5y36dzBE-1)

> Flow diagram: [figmaJam](https://www.figma.com/board/8G14J3u7waBkBUnxqfd2GS/Checkout-flow-diagram?node-id=0-1&t=n3a6CdQrPJft1mzU-1)

> Libs:  [js-lightning-tools](https://github.com/getAlby/js-lightning-tools), [scure-bip32](https://github.com/paulmillr/scure-bip32) to derive new addresses from xpub, NDK to manage NWC strings [docs](https://github.com/nostr-dev-kit/ndk/tree/master/ndk/src/nwc)

### High level overview
**Step 1: Cart Summary**  
  
* A user fills their cart with products from multiple merchants.  
* The cart displays a unified subtotal, shipping cost, and total cost, which are aggregated from the different merchants' products and shipping costs.  
  
**Step 2: Proceed to Checkout**  
  
* The user clicks the checkout button in the cart and is redirected to the checkout page.  
  
**Step 3: Review Orders**  
  
* On the checkout page, the user can:  
	• Review their orders, separated by merchant  
	• View each merchant's order details  
	• Fill out a form to set their shipping address and other details  
	• Provide different details for each merchant, if needed  (further development)
  
**Step 4: Communication and Payment**  
  
* Once the user has reviewed their orders, they can initiate communication with each merchant.  
* Payment Options:  
	• If the merchant has valid payment details(*), the user can pay directly.  
	• If the merchant lacks valid payment details, direct payment is not possible.  
	• Even if the merchant has valid payment details, the user can choose not to pay immediately and instead contact the merchant to ask questions or clarify details.  
* After completing payment/order placement, a new direct message is sent from the user to the merchant.

> (*) Valid payment details are those explicitly set by the merchant, excluding profile payment details in kind:0. Merchants have the option to allow the platform to request invoices using their profile payment details to set them as a valid payment details.
  
**Step 5: Order Management**  
  
* Order Entry Creation:  
	• If both parties are registered and non-paranoid users on the platform, a new entry is created in the orders table with the order details.  
	• The order status will be set to "pending" if payment has not been made, "partiallyPaid" if not all required payments (order and v4v) have been made, or "paid" if all payments have been made successfully. 
* Exceptions:  
	• If both users are unregistered or paranoid, no order entry is created.  
	• However, if the seller is registered independently of `trust_lvl`, but the buyer is paranoid or unregistered, an order will still be created; in the case of a paranoid user, the `buyer_user_id` public key can be encrypted using the merchant's key.  
* Order Management:  
	• If an order entry is created:  
	- The user and merchant can then view communication and order details/status in their dashboard.  
	• If no order entry is created, users can still maintain their communication in direct messages, but there is no order entry to manage. We will improve this in further development.
  
**Step 6: Merchant Order Management**  
  
* The merchant can:  
	• Confirm or cancel the order  
	• Provide updates by modifying the order details  
	• Mark the order as complete once shipped  
  
**Step 7: User Order Management**  
  
* The user can also mark the order as complete once received.  
* If both parties agree that the sale was successful, it is considered a verified sale.  
  
**Step 8: Conflict Resolution**  
  
* If the merchant attempts to defraud the user, the user can report this, which will impact the merchant's trustworthiness.  
* If the buyer attempts to defraud the merchant, the merchant can report this, which will impact the user's trustworthiness.  
* Conflict resolution is out of scope, and users should be disclaimed and aware of this limitation.

**Key features**
-  **Unified Cart and Checkout**
	- All products from different merchants are displayed together, and the customer checks out once to complete the entire order
- **Checkout Best Practices**
	- **Provide clear vendor attribution** - Make it obvious which products are from which merchant
	- **Unregistered users checkout** - Don't force account creation to reduce friction
	- **Use a progress indicator** - Show the customer's progress through the checkout steps
	- **Optimize form fields** - Unify required fields for all the merchants (one form to rule them all), but allowing customisation for each one if necessary
	- **Provide order review** - Allow the customer to review and edit the order before finalising