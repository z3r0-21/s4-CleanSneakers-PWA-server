var express = require('express');
var app = express();
app.use(express.json({limit: '50mb'}));
const mysql = require('mysql')

const con = mysql.createPool({
  connectionLimit: 10,
  host: 'us-cdbr-east-05.cleardb.net',
  user: 'b7888acda4298a',
  password: '3d4feb63',
  database: 'heroku_2fc6a9042eb8155'
})

function getConnection() {
  return con
}

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});



// const corsOptions ={
//     origin:'http://localhost:3000', 
//     credentials:true,            //access-control-allow-credentials:true
//     optionSuccessStatus:200
// }
// app.use(cors(corsOptions));}

const vision = require('@google-cloud/vision');

const productSearchClient = new vision.ProductSearchClient({keyFilename: "./key.json"});
const imageAnnotatorClient = new vision.ImageAnnotatorClient({keyFilename: "./key.json"});

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


app.post('/api/searchImages', function (req, res, next) {
    searchForProduct(res, req.body.base64);
});

app.get('/test', function (req, res, next) {
    res.send("yooo!")
});

app.get('/sneakers', function (req, res, next) {
    const connection = getConnection()
    const queryString = "SELECT * FROM sneakers"
    connection.query(queryString, (err, rows, fields) => {
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