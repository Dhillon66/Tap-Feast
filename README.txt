TapFeast – Tablet Restaurant Menu
==================================

This is a simple front-end-only prototype for a tablet-based restaurant menu.
Customers select items on the tablet and place an order. Orders are stored in
`localStorage` and are visible on a separate Kitchen Display page.

Files
-----

- index.html   – Tablet menu for customers (main screen).
- kitchen.html – Kitchen display showing all orders stored in localStorage.
- styles.css   – Shared styles for both screens, with light/dark mode.
- app.js       – Logic for customer ordering and saving orders.
- kitchen.js   – Logic for reading and updating orders in the kitchen view.

How it works
------------

1. Open `index.html` in a browser (ideally sized like a tablet).
2. Choose a table number, select items, and tap **Place Order**.
3. Open `kitchen.html` (can be on another screen or window).
4. The kitchen display will list all orders stored in localStorage.
5. Tap **Mark Ready / Undo** to change order status.

Theme
-----

- Both screens support light and dark themes.
- The theme is saved to `localStorage` and shared across both pages.

Note
----

This is a prototype only. There is no real backend or database. In a real
project, you would send the order as a POST request to your server or API.
