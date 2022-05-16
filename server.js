const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json({limit: '50mb'}));

//const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//     console.log("Listening on " + PORT)
// })

app.get("/test", (req, res) =>{
    console.log("Rooot")
    res.send("yooo!")
})

// const corsOptions ={
//     origin:'http://localhost:3000', 
//     credentials:true,            //access-control-allow-credentials:true
//     optionSuccessStatus:200
// }
// app.use(cors(corsOptions));

let allowedOrigins = ["http://localhost:3000", "https://i454903.hera.fhict.nl'"]
let origin = req.headers.origin;
if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
}

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

app.post('/api/searchImages', (req, res) => {
    searchForProduct(res, req.body.base64);
});



//PORT ENVIRONMENT VARIABLE
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}..`));