const inquirer = require("inquirer");
const mysql = require("mysql");
const {
  table
} = require("table");

const db = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "storefront_db"
});

const displayStock = (purchase) => {

  db.query("SELECT * FROM products", function (err, inventory) {
    if (err) throw err;
    let data = [
      ["ID", "Product", "Department", "Price ($)", "Inventory"]
    ];

    inventory.forEach(product => {
      let col = [];
      col.push(product.id, product.product_name, product.department_name, product.price, product.stock_quantity);
      data.push(col);
    })
    let output = table(data);
    console.log(output);
    
    if (purchase) {
      console.log("Purchase completed. Thank you.\n");
    }
    purchaseById();
  })
}

const purchaseById = () => {

  inquirer.prompt([{
    type: "input",
    name: "id",
    message: "Please enter the ID of the item you would like to purchase:",
    default: "1",
    validate: (answer) => (!isNaN(answer)) ? true : false
  }]).then(purchase => {
    checkInventory(purchase);
  });
}

const checkInventory = (purchase) => {
  db.query("SELECT * FROM products WHERE id = ?", purchase.id, (err, item) => {
    if (err) throw err;

    if (item.length === 0) {
      console.log("Sorry, that item does not exist in our inventory.\n");
      purchaseById();
    } else {
      if (item[0].stock_quantity <= 0) {
        console.log("Sorry, that item is out of stock.\n")
        purchaseById();
      } else {
        updateInventory(item[0]);
      }
    }
  })
}

const updateInventory = (item) => {

  const newStock = item.stock_quantity - 1;

  db.query("UPDATE products SET ? WHERE ?", [{
      stock_quantity: newStock
    },
    {
      id: item.id
    }
  ], (err, result) => {
    if (err) throw err;
    displayStock(true);
  })
}

db.connect(err => {

  if (err) throw err;
  console.log("Connected to database.\n");
  displayStock();
});