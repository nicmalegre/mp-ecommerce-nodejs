var express = require("express");
var exphbs = require("express-handlebars");
const mercadopago = require("mercadopago");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const bodyParser = require("body-parser");

var port = process.env.PORT || 3000;
const baseUrl = process.env.BASE_URL;

var app = express();
app.use(bodyParser.urlencoded({ extended: true }));

mercadopago.configure({
  sandbox: true,
  access_token: process.env.ACCESS_TOKEN,
});

app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

app.use(express.static("assets"));

app.use("/assets", express.static(__dirname + "/assets"));

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/detail", function (req, res) {
  res.render("detail", req.query);
});

app.get("/failure", function (req, res) {
  res.render("failure", req.query);
});

app.get("/pending", function (req, res) {
  res.render("pending", req.query);
});

app.get("/success", function (req, res) {
  res.render("success", req.query);
});

app.post("/create-preference", (req, res) => {
  let preference = {
    items: [
      {
        //id
        id: "1234",
        //name
        title: req.body.title,
        //description
        description: "Dispositivo móvil de Tienda e-commerce",
        //url
        picture_url: req.body.img,
        //cantidad
        quantity: 1,
        //precio
        unit_price: Number(req.body.price),
        //external_reference
      },
    ],
    back_urls: {
      success: `${baseUrl}success`,
      failure: `${baseUrl}failure`,
      pending: `${baseUrl}pending`,
    },
    auto_return: "approved",
    payment_methods: {
      installments: 6,
      excluded_payment_methods: [{ id: "amex" }],
      excluded_payment_types: [{ id: "atm" }],
    },
    external_reference: "nicolasalegremz@gmail.com",
  };

  mercadopago.preferences
    .create(preference)
    .then(function (response) {
      res.redirect(response.body.init_point);
    })
    .catch(function (error) {
      console.log(error);
    });
});

app.listen(port);
