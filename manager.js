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


const managerMenu = () => {

  inquirer.prompt([{
    type: "list",
    name: "menuChoice",
    message: "Welcome. Which functionality would you like to access?",
    choices: ["View Products for Sale", "View Low Inventory", "Add More Inventory", "Add New Product"]
  }]).then(response => {
    (response.menuChoice === "View Products for Sale") ? displayInventory():
      (response.menuChoice === "View Low Inventory") ? lowInventory() :
      (response.menuChoice === "Add More Inventory") ? restockInventory() :
      (response.menuChoice === "Add New Product") ? addInventory() : false;
  });
}

const tableInventory = (inventory) => {
  let data = [
    ["ID", "Product", "Department", "Price ($)", "Inventory"]
  ];

  inventory.forEach(product => {
    let col = [];
    col.push(product.id, product.product_name, product.department_name, product.price, product.stock_quantity);
    data.push(col);
  })

  let output = table(data);
  return console.log(output);
}

const lowInventory = () => {

  db.query("SELECT * FROM products WHERE stock_quantity <=5", (err, inventory) => {
    if (err) throw err;
    tableInventory(inventory);
    managerMenu();
  })
}

const displayInventory = () => {

  db.query("SELECT * FROM products", (err, inventory) => {
    if (err) throw err;
    tableInventory(inventory);
    managerMenu();
  })
}

const restockInventory = () => {

  db.query("SELECT * FROM products", (err, inventory) => {
    if (err) throw err;

    inquirer.prompt([{
        type: "list",
        name: "product_name",
        message: "Which of the following items would you like to update?",
        choices: inventory.map(product => product.product_name)
      },
      {
        type: "input",
        name: "inventoryQty",
        message: "How many would you like to add?",
        validate: (quantity) => {
          if (Number.isInteger(Number(quantity))) {
            return true;
          } else {
            console.log("\nPlease enter a valid quantity. (Whole numbers only)");
            return false;
          }
        }
      }
    ]).then(response => {
      const selectedProduct = inventory.find(product => product.product_name === response.product_name);
      const stock = selectedProduct.stock_quantity + parseInt(response.inventoryQty);
      updateDB(selectedProduct, stock);
    });
  })
}

const updateDB = (product, stock) => {
  db.query("UPDATE products SET ? WHERE ?", [{
      stock_quantity: stock
    },
    {
      id: product.id
    }
  ], (err, response) => {
    if (err) throw err;
    console.log(`\n ${product.product_name} has succesfully been restocked. Current stock quantity: ${stock}`);
    managerMenu();
  });
}

const addInventory = () => {
  console.log("\n Enter product data:")
  inquirer.prompt([{
      type: "input",
      name: "product_name",
      message: "Product Name:",
      default: "Balaclava"
    },
    {
      type: "input",
      name: "department_name",
      message: "department_name",
      default: "Fashion"
    },
    {
      type: "input",
      name: "price",
      message: "Price:",
      default: 5,
      validate: (price) => !isNaN(price) ? true : false
    },
    {
      type: "input",
      name: "stock_quantity",
      message: "How many would you like to add?",
      default: 10,
      validate: (quantity) => {
        if (Number.isInteger(Number(quantity))) {
          return true;
        } else {
          console.log("\nPlease enter a valid quantity. (Whole numbers only)");
          return false;
        }
      }
    }
  ]).then(product => {
    db.query("INSERT INTO products SET ?", {
      product_name: product.product_name,
      department_name: product.department_name,
      price: parseFloat(product.price),
      stock_quantity: parseInt(product.stock_quantity)
    }, (err, result) => {
      if (err) throw err;
      console.log("The product has been entered into the database.");
      managerMenu();
    });
  });
}


db.connect(err => {

  if (err) throw err;
  console.log("Connected to database.\n");
  managerMenu();
});