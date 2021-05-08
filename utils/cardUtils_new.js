

module.exports = function () {
    
    var {
            Country,
            State,
            City,
            Areas,
            ProviderSchema,
            HelpingHandRegisterSchema,
            DonarRegisterSchema,
            NeedRequestSchema

        } = require('../config/Model');
    
    var ObjectID = require('mongodb').ObjectID;
    var {timeSlots} = require('../config/appConfig');
    
    async function createLocationEntry(level, payload) {
        const {areaName, city, state, country, type, instanceData} = payload;
    
        let objectType = {}
        switch(type) {
            case 'provider': 
                    objectType = { name: areaName, providers: [instanceData]}
                    break;
            case 'helpinghand':  
                    objectType = { name: areaName, helpingHandRegistered: [instanceData]}
                    break;
            case 'donars': 
                    objectType = { name: areaName, registeredDonars: [instanceData]}
                    break;
            case 'raisedNeed': 
                    objectType = { name: areaName, raisedNeeds: [instanceData]}
                    break;
        }

        var newAreas = await (new Areas(objectType)).save();
        if(level === 'areas') {   
            return newAreas;
        }
        var newCity = await (new City({ name: city, areas: [newAreas]})).save();
        if(level === 'city') {
            return newCity; 
        }
        var newState = await (new State({ name: state, cities: [newCity]})).save();  
        if(level === 'state') {
            return newState;
        }
        var newCountry = await (new Country({ name: country, states: [newState]})).save();  
        return newCountry;
    }

    function pushData(type, areaData, instanceData) {
        switch(type) {
            case 'provider': 
                areaData.providers.push(instanceData);
                break;
            case 'helpinghand': 
                areaData.helpingHandRegistered.push(instanceData);
                break;
            case 'donars': 
                areaData.registeredDonars.push(instanceData);
                break;
            case 'raisedNeed': 
                areaData.raisedNeeds.push(instanceData);
                break;
        }
    }
    
    async function saveLocationData(instanceData, payload, type) {
        let {areaName = '', city = '', state = '', country = '', ...rest} = payload;
        let countryData = null, stateData = null, cityData = null, areaData = null;
        if(areaName && city && state && country) {        
            countryData = await Country.findOne({name: country}); 
            if(countryData) {
                stateData = await State.findOne({name: state}); 
                if(stateData) {
                    cityData = await City.findOne({name: city}); 
                    if(cityData) {
                        areaData = await Areas.findOne({name: areaName}); 
                        if(areaData) {
                            pushData(type, areaData, instanceData)
                            // areaData.providers.push(provider);
                        } else {
                            areaData = await createLocationEntry('areas', {instanceData, areaName, type});
                            cityData.areas.push(areaData);
                        }
                        await areaData.save()
                    } else {
                        cityData = await createLocationEntry('city', {instanceData, areaName, city, type}); 
                        stateData.cities.push(cityData);
                    }
                    await cityData.save()
                } else {
                    stateData = await createLocationEntry('state', {instanceData, areaName, city, state, type});
                    countryData.states.push(stateData);
                }
                await stateData.save()
            } else {
                countryData = await createLocationEntry('country', {instanceData, areaName, city, state, country, type});
            }
            await countryData.save()
        } else {
            return 'Incomplete Data';
        }    
    }

    async function saveLocationDataCityLevel(instanceData, payload, type) {
        let {city = '', state = '', country = '', ...rest} = payload;
        let countryData = null, stateData = null, cityData = null;
        if(city && state && country) {        
            countryData = await Country.findOne({name: country}); 
            if(countryData) {
                stateData = await State.findOne({name: state}); 
                if(stateData) {
                    cityData = await City.findOne({name: city}); 
                    if(cityData) {
                        pushData(type, cityData, instanceData)
                    } else {
                        cityData = await createLocationEntry('city', {instanceData, city, type}); 
                        stateData.cities.push(cityData);
                    }
                    await cityData.save()
                } else {
                    stateData = await createLocationEntry('state', {instanceData, city, state, type});
                    countryData.states.push(stateData);
                }
                await stateData.save()
            } else {
                countryData = await createLocationEntry('country', {instanceData, city, state, country, type});
            }
            await countryData.save()
        } else {
            return 'Incomplete Data';
        }    
    }

    async function createProvideRequest(payload = {}) {
        let {areaName = '', city = '', state = '', country = '', ...rest} = payload;
        rest = {
            ...rest,
            confirmedBy: null
        }
        const provider = new ProviderSchema(rest);
        await provider.save()
        if(!payload.areaName) {
            await saveLocationDataCityLevel(provider, payload, 'provider')
        } else {
            await saveLocationData(provider, payload, 'provider')
        }
    }

    async function createNeedRequest(payload = {}) {
        let {areaName = '', city = '', state = '', country = '', ...rest} = payload;
        rest = {
            ...rest,
            confirmedBy: null
        }
        const donarRegister = new NeedRequestSchema(rest);
        await donarRegister.save()
        
        if(!payload.areaName) {
            await saveLocationDataCityLevel(donarRegister, payload, 'raisedNeed')
        } else {
            await saveLocationData(donarRegister, payload, 'raisedNeed'); 
        }
    }


    async function registerHelpingHand(payload = {}) {
        let {areaName = '', city = '', state = '', country = '', ...rest} = payload;
       
        const helpingHand = new HelpingHandRegisterSchema(rest);
        await helpingHand.save()
        await saveLocationData(helpingHand, payload, 'helpinghand'); 
    }

    async function registerDonar(payload = {}) {
        let {areaName = '', city = '', state = '', country = '', ...rest} = payload;
        const donarRegister = new DonarRegisterSchema(rest);
        await donarRegister.save()
        await saveLocationData(donarRegister, payload, 'donars'); 
    }

 

    async function fetchReisteredDonars(areaObj) {
         // To fetch country then get state thn city -- as state, city can be duplicate
         let donarsInArea = await Areas.findOne({_id: areaObj._id}).populate('registeredDonars').exec();
        if(donarsInArea && donarsInArea.registeredDonars.length > 0) {
            return {[areaObj.name]: donarsInArea.registeredDonars}
        } else {
            return {code: 200, status: 'fail', message: 'No Donars found at this place', area: null}
        }
    }
    async function fetchNeeds(areaObj, lookupOnlyCities) {
         // To fetch country then get state thn city -- as state, city can be duplicate
        let raisedNeedInArea = await Areas.findOne({_id: areaObj._id}).populate('raisedNeeds').exec();
        if(lookupOnlyCities) {
            const cityLevelData = await City.findOne({_id: areaObj._id}).populate('raisedNeeds').exec();
            if(cityLevelData && cityLevelData.raisedNeeds.length > 0) {
                return {[areaObj.name]: cityLevelData.raisedNeeds};
            } else {
                return null
            }
        }
        if(raisedNeedInArea && raisedNeedInArea.raisedNeeds.length > 0) {
            return {[areaObj.name]: raisedNeedInArea.raisedNeeds}
        } else {
            return {code: 200, status: 'fail', message: 'No Needs around this area', area: null}
        }
    }

    async function fetchUsersData(areaObj, lookupOnlyCities) {
         // To fetch country then get state thn city -- as state, city can be duplicate
        let providersInArea = await Areas.findOne({_id: areaObj._id}).populate('providers').exec();
        let {providers = []} = providersInArea || {};
        if(lookupOnlyCities) {
            const cityLevelData = await City.findOne({_id: areaObj._id}).populate('providers').exec();
            console.log('cityLevelData', areaObj.name, cityLevelData)
            if(cityLevelData && cityLevelData.providers.length > 0) {
                return {[areaObj.name]: cityLevelData.providers};
            } else {
                return null
            }
        }
         // let providersInArea = await Areas.findOne({name: areaName}).populate('providers').exec();
        if(providers.length > 0) {
            return {[areaObj.name]: providers};
        } else {
            return {code: 200, status: 'fail', message: 'No Provider found at this place', area: null}
        }
    }

    async function fetchReisteredHelpingHand(areaObj) {
        // To fetch country then get state thn city -- as state, city can be duplicate
        let helpingHandInArea = await Areas.findOne({_id: areaObj._id}).populate('helpingHandRegistered').exec();
        // let providersInArea = await Areas.findOne({name: areaName}).populate('providers').exec();
        // gameData = gameData.populate('areas').exec();
       if(helpingHandInArea && helpingHandInArea.helpingHandRegistered.length > 0) {
           return {[areaObj.name]: helpingHandInArea.helpingHandRegistered};
       } else {
           return {code: 200, status: 'fail', message: 'No helping hand around this area for support', area: null}
       }
   }

    

    async function getDataByArea({country, state, city, areaName}) {
        if(country && state && (city || areaName)) {
            try {
                let provideCountry = await Country.findOne({name: country}).populate('states').exec();
                stateObj = provideCountry.states.find((item) => item.name === state);
                let provideState = await State.findOne({_id: stateObj._id}).populate('cities').exec();
                cityObj = provideState.cities.find((item) => item.name === city);
                let provideCity = await City.findOne({_id: cityObj._id}).populate('areas').exec();
                
                if(areaName) {
                    areaObj = provideCity.areas.find((item) => item.name === areaName);
                } else {
                    areaObj = provideCity;
                }
                return areaObj;
            }
            catch {
                return {code: 200, status: 'fail', message: 'No data found at this place', area: null}
            }
        } else {
            return {code: 404, status: 'fail', message: 'Invalid Inputs'}
        }
    }


    async function confirmProvideRequest(reqBody) {
        const {confirmedBy = null, confirmedIdList = [], removedIdList = [], helpingHandContactNo = null} = reqBody;
        if(!confirmedBy) {
            return {message: 'Invalid Inputs'}
        }
        // confirmedIdList = confirmedIdList.map((item) => ObjectID(item));
        // Update only if confirmedBy is null
        try{
            const confirmedRequest = await ProviderSchema.updateOne(
                { _id: { $in: confirmedIdList } },
                { $set: { confirmedBy : confirmedBy, helpingHandContactNo: helpingHandContactNo } },
                {multi: true}
            );
            const cancelRequestRequest = await ProviderSchema.updateOne(
                { _id: { $in: removedIdList } },
                { $set: { confirmedBy : null, helpingHandContactNo: null } },
                {multi: true}
            );
            return {message: 'Request Modified! Please be available to collect'}
        } catch(err) {
            return {message: 'Unable to save info', error: err}
        }
     }
    
     async function confirmNeedRequest(reqBody) {
        const {confirmedBy = null, confirmedIdList = [], removedIdList = [], donarsContactNo = null} = reqBody;
        if(!confirmedBy) {
            return {message: 'Invalid Inputs'}
        }
        try{
            const confirmedRequest = await NeedRequestSchema.updateOne(
                { _id: { $in: confirmedIdList } },
                { $set: { confirmedBy : confirmedBy, donarsContactNo: donarsContactNo } },
                {multi: true}
            );
            const cancelRequestRequest = await NeedRequestSchema.updateOne(
                { _id: { $in: removedIdList } },
                { $set: { confirmedBy : null, donarsContactNo: null } },
                {multi: true}
            );
            return {message: 'Request Modified! Please be ready to donate. Helping hand may contact you for the same.'}
        } catch(err) {
            return {message: 'Unable to save info', error: err}
        }
     }
    
     

    async function fetchUserStatus({data}) {
        userData = await ProviderSchema.find({mobileNo: data});
        return userData;
    }

    async function fetchNeedyStatus({data}) {
        userData = await NeedRequestSchema.find({mobileNo: data});
        return userData;
    }

    return {
            createProvideRequest: createProvideRequest,
            getDataByArea: getDataByArea,
            fetchUsersData: fetchUsersData,
            confirmProvideRequest: confirmProvideRequest,
            confirmNeedRequest: confirmNeedRequest,
            fetchUserStatus: fetchUserStatus,
            fetchNeedyStatus: fetchNeedyStatus,
            registerHelpingHand: registerHelpingHand,
            fetchReisteredHelpingHand: fetchReisteredHelpingHand,
            registerDonar, 
            createNeedRequest, 
            fetchNeeds, 
            fetchReisteredDonars
        }   
    
    }