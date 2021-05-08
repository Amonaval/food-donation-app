
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var ObjectID = require('mongodb').ObjectID;
var path = require('path');
var cors = require('cors');
var GameState = require('./config/Model')
var connectDB = require('./config/db');
connectDB();

var app = express();

var mongoose = require('mongoose');
var cardUtils = require('./utils/cardUtils_new')();
var initGameState = require('./utils/initGameState');
var saveGameState = require('./utils/saveGameState');


var {fetchUsersData, createProvideRequest, getDataByArea, fetchReisteredHelpingHand,
   registerHelpingHand, confirmProvideRequest, fetchUserStatus, fetchNeedyStatus, confirmNeedRequest, 
   registerDonar, createNeedRequest, fetchNeeds, fetchReisteredDonars} = cardUtils;

saveGameState()


var PORT = process.env.PORT || 8090;


app.set('view engine', 'pug');
app.set('views', './views')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());


app.use(express.static(path.join(__dirname, './client/dist')));
// if(process.env.NODE_ENV === 'production') {
//    app.get('/*', function (req, res) {
//    	res.sendFile(path.join(__dirname, './client/dist', 'index.html'));
//   });
//    // app.use(express.static('./client/dist'));
// }


app.post('/api/createProvideRequest', async function(req, res) {
   const newProviderData = await createProvideRequest(req.body);
   res.status(200).send({message: 'Good Work!! We have registered your help. Awaiting confirmation from needy.'})
})

app.post('/api/createNeedRequest', async function(req, res) {
   const newProviderData = await createNeedRequest(req.body);
   res.status(200).send({message: 'Good Work!! We have registered your need. Awaiting confirmation from donar.'})
})



app.post('/api/registerHelpingHand', async function(req, res) {
   const registeredHelper = await registerHelpingHand(req.body);
   res.status(200).send({message: 'You are now registered helping hand in this area'})
})

app.post('/api/registerDonar', async function(req, res) {
   const registeredHelper = await registerDonar(req.body);
   res.status(200).send({message: 'You are now registered donar in this area'})
})

async function getDataByAreas({req, onSuccess}) {
   const areaData = await getDataByArea(req.query); 
   let isInValid = !areaData || areaData.status == 'fail';
   console.log('areaData', )
   // if(!req.query.areaName) {
   //    isInValid = !areaData || areaData.length === 0;
   // }
   const onlyCities = !req.query.areaName;
   if(isInValid) {
      return areaData;
   } else {
      let allProviders = [];
      if(onlyCities) {
         const allUsers = [];
         // Select all areas of the city to find request
         areaData.areas && areaData.areas.forEach((item) => {
            allUsers.push(onSuccess(item));
         })
         // Some request are created on cities directly & not choosed specific area.
         const cityLevelData = onSuccess(areaData, true); 
         if(cityLevelData) {
            allUsers.push(cityLevelData);
         }
         allProviders = await Promise.all(allUsers);
      } else {
         allProviders = [await onSuccess(areaData)];
      }
      if(allProviders.message) {
         return allProviders;
      }
      const data = {};
      allProviders.forEach((item) => {
         if(item) {
            const key = Object.keys(item);
            data[key] = item[key];
         }
      });
      return data;
   }
}

app.get('/api/fetchProviders', async function (req, res) {
   const payload = {
      onSuccess: fetchUsersData,
      req
   }
   const result = await getDataByAreas(payload);
   if(result.message) {
      res.status(result.code).send({message: result.message});
   } else {
      res.status(200).send(result);
   }
});


app.get('/api/fetchNeeds', async function (req, res) {

   const payload = {
      onSuccess: fetchNeeds,
      req
   }
   const result = await getDataByAreas(payload);
   if(result.message) {
      res.status(result.code).send({message: result.message});
   } else {
      res.status(200).send(result);
   }
});


app.get('/api/fetchHelpingHand', async function (req, res) {
   const payload = {
      onSuccess: fetchReisteredHelpingHand,
      req
   }
   const result = await getDataByAreas(payload);
   if(result.message) {
      res.status(result.code).send({message: result.message});
   } else {
      res.status(200).send(result);
   }
});

app.get('/api/fetchDonars', async function (req, res) {
   const payload = {
      onSuccess: fetchReisteredDonars,
      req
   }
   const result = await getDataByAreas(payload);
   if(result.message) {
      res.status(result.code).send({message: result.message});
   } else {
      res.status(200).send(result);
   }
});


 
app.post('/api/confirmProvideRequest', async function(req, res) {
   const newProviderData = await confirmProvideRequest(req.body);
   res.status(200).send(newProviderData)
})

app.post('/api/confirmNeedRequest', async function(req, res) {
   const resp = await confirmNeedRequest(req.body);
   res.status(200).send(resp)
})


app.get('/api/fetchUserStatus', async function(req, res) {
   let usersData = await fetchUserStatus(req.query);
   if(!usersData) {
      res.status(200).send({message: 'You have no pending request'});
   } else {
      if(!Array.isArray(usersData)) {
         usersData = [usersData];
      }
      res.status(200).send(usersData);
   }
})

app.get('/api/fetchNeedyStatus', async function(req, res) {
   let usersData = await fetchNeedyStatus(req.query);
   if(!usersData) {
      res.status(200).send({message: 'You have no pending request'});
   } else {
      if(!Array.isArray(usersData)) {
         usersData = [usersData];
      }
      res.status(200).send(usersData);
   }
})


app.get('/*', function (req, res) {
   res.sendFile(path.join(__dirname, './client/dist', 'index.html'));
});


app.use((req, res, next) => {
    console.log("MiddleWare Called");
    next();
})


app.listen(PORT, '0.0.0.0')