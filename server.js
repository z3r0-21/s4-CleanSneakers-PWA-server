var express = require('express');
var app = express();
app.use(express.json({limit: '50mb'}));


//Google Vision API setup
const vision = require('@google-cloud/vision');

const productSearchClient = new vision.ProductSearchClient({keyFilename: "./key.json"});
const imageAnnotatorClient = new vision.ImageAnnotatorClient({keyFilename: "./key.json"});

//MySQL DB
const mysql = require('mysql')
const con = mysql.createPool({
  connectionLimit: 10,
  host: '',
  user: '',
  password: '',
  database: ''
})


//Prevents CORS-related issues, request are not restricted to a certain IP address
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


//Google Vision API request
async function searchForProduct(res, image) {
    const projectId = 'shoes-search-pwa';
    const location = 'europe-west1';
    const productSetId = 'sneaker';
    const productCategory = 'apparel-v2';
    const filter = '';
    const productSetPath = productSearchClient.productSetPath(
      projectId,
      location,
      productSetId
    );

    const request = {
        image: {content: image},
        features: [{type: 'PRODUCT_SEARCH', "maxResults":5}],
        imageContext: {
        productSearchParams: {
            productSet: productSetPath,
            productCategories: [productCategory],
            filter: filter,
        },
        },
    };

    const [response] = await imageAnnotatorClient.batchAnnotateImages({
      requests: [request],
    });
    const results = response['responses'][0]['productSearchResults']['results'];

    res.send(results)
    }


// ENDPOINTS
app.post('/api/searchImages', function (req, res, next) {
    searchForProduct(res, req.body.base64);
});

app.post('/addsneakers', function (req, res, next) {
  const name = req.body.name
  const material = req.body.material
  const color = req.body.color
  const rain = req.body.rain
  const snow = req.body.snow

  const queryString = "INSERT INTO sneakers(`sneaker_name`, `material`, `color`, `rain`, `snow`) VALUES(?, ?, ?, ?, ?)"
  con.query(queryString, [name, material, color, rain, snow], (err, results, fields) => {
    if (err) {
      res.sendStatus(500)
      return
    }
    res.end()
  })
});

app.get('/sneakers', function (req, res, next) {
    const queryString = "SELECT * FROM sneakers"
    con.query(queryString, (err, rows, fields) => {
      if (err) {
        console.log(err)
        res.sendStatus(500)
        return
      }
      res.json(rows)
    })
});

//PORT ENVIRONMENT VARIABLE
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}..`));
