app.use(express.json({limit: '50mb'}));

var express = require('express')
var cors = require('cors')
var app = express()

var corsOptions = {
  origin: 'https://i454903.hera.fhict.nl',
  optionsSuccessStatus: 200
}



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

    

app.post('/api/searchImages', cors(corsOptions), (req, res) => {
    searchForProduct(res, req.body.base64);
});

app.get("/test", cors(corsOptions), (req, res) =>{
    console.log("Rooot")
    res.send("yooo!")
})

//PORT ENVIRONMENT VARIABLE
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}..`));