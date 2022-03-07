const express = require('express')
const app = express()
const port = process.env.PORT || 3000;
const csvFilePath = './condominios.csv'
const csv = require('csvtojson')
const bodyParser = require('body-parser')
app.use(bodyParser.json())
const nodeGeocoder = require('node-geocoder');
const cors = require('cors');

// const { Client } = require("@googlemaps/google-maps-services-js");

// const client = new Client({});

let options = {
    provedor: 'openstreetmap',
    apiKey: 'AIzaSyAMskAL-mUQo7vuC83jiE-y73lmgTWxXxU' // for Mapquest, OpenCage, Google Premier
};

const geoCoder = nodeGeocoder(options);
app.use(cors({
    origin: '*'
}));

function getDistanceFromLatLonInKm(position1, position2) {
    "use strict";
    var deg2rad = function(deg) { return deg * (Math.PI / 180); },
        R = 6371,
        dLat = deg2rad(position2.lat - position1.lat),
        dLng = deg2rad(position2.lng - position1.lng),
        a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(position1.lat)) *
        Math.cos(deg2rad(position1.lat)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2),
        c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return ((R * c * 1000).toFixed());
}

function calcularRaio(latClient, lngClient, raio) {
    let result = [];

    let distancia;
    return new Promise((resolve, reject) => {
        readCsv.then((conds) => {
            conds.map((condominio) => {
                distancia = getDistanceFromLatLonInKm({ lat: latClient, lng: lngClient }, { lat: condominio.LAT, lng: condominio.LNG }) / 1000
                if (distancia <= raio) {
                    console.log("raio: " + raio + " Condominio: " + condominio.NOMCON + " ditancia: " + distancia)

                    condominio.DISTANCIA = distancia
                    result.push(condominio);

                }
            })
            console.log(result.length)

            resolve(result);
        })
    });
}

const readCsv = new Promise((resolve, reject) => {
    csv().fromFile(csvFilePath).then((jsonObj) => {
        resolve(jsonObj)
    });
})



function getGeoLocation(address) {
    return new Promise((resolve, reject) => {
        geoCoder.geocode(address)
            .then((res) => {
                resolve(res)
            })
            .catch((err) => {
                reject(err)
            });
    })
}



// app.get('/atualizar', (req, res) => {
//     readCsv.then((jsonCond) => {
//         createObj(jsonCond).then((data) => {
//             console.log(data.length)
//         })
//     })
// })

// function createObj(jsonCond) {
//     return new Promise((resolve, reject) => {
//         let arr = [];

//         jsonCond.map((cond) => {
//             getGeoLocation('Avenida Saturnino Rangel Mauro,3518 ').then((value) => {
//                 let obj = {
//                     "ID": cond.id,
//                     "CONDOMINIO": cond.Condominio,
//                     "Endereco": cond.Endereco,
//                     "Bairro": cond.Bairro,
//                     "Cidade": cond.Cidade,
//                     "Estado": cond.Estado,
//                     "CEP": cond.CEP,
//                     "Unidade": cond.Unidade
//                         // "Lat": value[0].latitude == undefined ? 0 : value[0].latitude,
//                         // "Long": value[0].longitude == undefined ? 0 : value[0].longitude
//                 };

//                 // console.log(data.length);
//                 arr.push(obj);
//             })
//         });
//         resolve(arr)

//     })
// }


// async function createCsv(data) {
//     console.log(data.length)
//     const csv = new ObjectsToCsv(data);
//     // Save to file:


//     await csv.toDisk("./teste.csv");
//     // res.send("ok")
//     // Return the CSV file as string:
//     console.log(await csv.toString());
// }
app.post('/calcular', (req, res) => {
    let lat, lng, raio;
    lat = req.body.lat;
    lng = req.body.lng;
    raio = req.body.raio;


    calcularRaio(lat, lng, raio).then((jsonCondominios) => {
            res.json(jsonCondominios)
        })
        // distancia = getDistanceFromLatLonInKm({ lat: -3.8533236, lng: -38.4821246 }, { lat: -3.8424993, lng: -38.4920836 })


    // csv()
    //     .fromString(response.data)
    //     .then((jsonObj) => {
    //         res.json(jsonObj)
    //     });
});


app.get('/teste', (req, res) => {
    res.send("ok")
})
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})