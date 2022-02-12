var express = require("express");
var exphbs = require("express-handlebars");
const mercadopago = require("mercadopago");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const bodyParser = require("body-parser");

var port = process.env.PORT || 3000;
const mercadoPagoAccessToken = process.env.ACCESS_TOKEN;
const integratorId = process.env.INTEGRATOR_ID;
const baseUrl = process.env.BASE_URL;

var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

if (!mercadoPagoAccessToken) {
  console.log("Error: access token not defined");
  process.exit(1);
}

mercadopago.configure({
  access_token: mercadoPagoAccessToken,
  integrator_id: integratorId,
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
        id: "1234",
        title: req.body.title,
        description: "Dispositivo móvil de Tienda e-commerce",
        picture_url: req.body.img,
        quantity: 1,
        unit_price: Number(req.body.price),
      },
    ],
    payer: {
      name: "Lalo",
      surname: "Landa",
      email: "test_user_63274575@testuser.com",
      phone: {
        area_code: "11",
        number: 22223333,
      },
      address: {
        street_name: "Falsa",
        street_number: 123,
        zip_code: "1111",
      },
    },
    back_urls: {
      success: `${baseUrl}success`,
      failure: `${baseUrl}failure`,
      pending: `${baseUrl}pending`,
    },
    external_reference: "nicolasalegremz@gmail.com",
    auto_return: "approved",
    payment_methods: {
      installments: 6,
      excluded_payment_methods: [{ id: "amex" }],
      excluded_payment_types: [{ id: "atm" }],
    },
    notification_url: `${baseUrl}notify-payment`,
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

app.post("/notify-payment", (req, res) => {
  const { body } = req;

  console.log("BODY");
  console.log(body);

  res.status(200).json({
    status: "OK",
    body,
  });
});

app.get("*", function (req, res) {
  res.render("error");
});

app.listen(port);
