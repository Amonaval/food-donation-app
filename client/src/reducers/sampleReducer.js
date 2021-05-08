


import {CREATE_DONATION_REQUEST, FETCH_DONATION_REQUEST, API_SUFFIX, GET_DONARS_REQUEST_STATUS, FETCH_HELPING_HANDS,
    RAISE_NEED_REQUEST, FETCH_NEEDS, CONFIRM_NEED_REQUEST,
    REMOVE_REQUEST, ADD_REQUEST, CONFIRM_REQUEST, CLEAR_RESPONSE_MESSAGE, FETCH_DONARS, GET_NEEDY_REQUEST_STATUS} from '../actions/actionTypes';

const {SUCCESS} = API_SUFFIX;

export default function sampleReducer(initialState = {}) {
    return (state = initialState, action) => {

        if(!action.payload) {
            action.payload = {};
        }
        switch (action.type) {
            case CREATE_DONATION_REQUEST:
            case FETCH_DONATION_REQUEST:
            case GET_DONARS_REQUEST_STATUS:
            case GET_NEEDY_REQUEST_STATUS:
            case FETCH_HELPING_HANDS:
            case CONFIRM_REQUEST:
            case CONFIRM_NEED_REQUEST:
            case RAISE_NEED_REQUEST:
            case FETCH_NEEDS:
            case FETCH_DONARS:
                return {
                    ...state,
                    loading:true,
                    userRequests: [],
                    responseMessage: {}
                };
            case CLEAR_RESPONSE_MESSAGE: {
                return {
                    ...state,
                    responseMessage: {},
                    areawiseHelpingHands: [],
                    areawiseDonars: [],
                    helpingHandResponse: {},
                    donarsResponse: {},
                    reqAdded: [],
                    reqRemoved: []
                };
            }
            case `${GET_NEEDY_REQUEST_STATUS}${SUCCESS}`: {
                
                const {allData: userRequests, responseMessage} = createFinalData(action.payload);
                return Object.assign({}, {
                    ...state,
                    loading: false,
                    userRequests,
                    responseMessage
                });
            }
            case `${GET_DONARS_REQUEST_STATUS}${SUCCESS}`: {
                const {allData: userRequests, responseMessage} = createFinalData(action.payload);
                return Object.assign({}, {
                    ...state,
                    loading: false,
                    userRequests,
                    responseMessage
                });
            }
            case `${RAISE_NEED_REQUEST}${SUCCESS}`:
            case `${CREATE_DONATION_REQUEST}${SUCCESS}`:
                return Object.assign({}, {
                    ...state,
                    loading: false,
                    responseMessage: action.payload
                });
            case `${CONFIRM_NEED_REQUEST}${SUCCESS}`:
            case `${CONFIRM_REQUEST}${SUCCESS}`:
                return Object.assign({}, {
                    ...state,
                    loading: false,
                    responseMessage: action.payload,
                    reqAdded: [],
                    reqRemoved: []
                });
            case `${FETCH_DONATION_REQUEST}${SUCCESS}`: {
                
                const {allData: allProviders, responseMessage} = createFinalData(action.payload);
                return Object.assign({}, {
                    ...state,
                    loading: false,
                    // helpingHands: helpingHands,
                    allProviders,
                    responseMessage
                });
            }

            case `${FETCH_NEEDS}${SUCCESS}`: {
                const {allData: allNeeds, responseMessage} = createFinalData(action.payload);
                return Object.assign({}, {
                    ...state,
                    loading: false,
                    allNeeds,
                    responseMessage
                });
            }

            case `${FETCH_HELPING_HANDS}${SUCCESS}`: {
               
                const {allData: areawiseHelpingHands, responseMessage: helpingHandResponse} = createFinalData(action.payload);
                return Object.assign({}, {
                    ...state,
                    loading: false,
                    areawiseHelpingHands,
                    helpingHandResponse
                });
            }
            case `${FETCH_DONARS}${SUCCESS}`: {

                const {allData: areawiseDonars, donarsResponse} = createFinalData(action.payload);
                return Object.assign({}, {
                    ...state,
                    loading: false,
                    // helpingHands: helpingHands,
                    areawiseDonars,
                    donarsResponse
                });
            }
            case ADD_REQUEST: {
                const newAdded = [...state.reqAdded];
                let newRemoved = [...state.reqRemoved]
                const confirmedLocalData = state[action.payload.tableName].map((item, index) => {
                    if(item.key === action.payload.key) {
                        let itemFound = false;
                        newRemoved = newRemoved.filter((item1) => {
                            if(item1 === item._id) {
                                itemFound = true;
                            }
                            return item1 !== item._id;
                        });
                        if(!itemFound) {
                            newAdded.push(item._id);
                        }
                        return {...item, confirmedBy: action.payload.name};
                    }
                    return item;
                });

                return Object.assign({}, {
                    ...state,
                    [action.payload.tableName]: confirmedLocalData,
                    reqAdded: newAdded,
                    reqRemoved: newRemoved
                });
            }
            case REMOVE_REQUEST: {
                let newAdded = [...state.reqAdded];
                const newRemoved= [...state.reqRemoved];
                const updatedData = state[action.payload.tableName].map((item, index) => {
                    if(item.key === action.payload.key) {
                        let itemFound = false;
                        newAdded = newAdded.filter((item1) => {
                            if(item1 === item._id) {
                                itemFound = true;
                            }
                            return item1 !== item._id;
                        });
                        if(!itemFound) {
                            newRemoved.push(item._id);
                        }
                        return {...item, confirmedBy: null};

                    }
                    return item;
                });
                return Object.assign({}, {
                    ...state,
                    [action.payload.tableName]: updatedData,
                    reqRemoved: newRemoved,
                    reqAdded: newAdded
                });
            }
            default:
                return state;
        }
    };
}


function createFinalData(payload) {
    let allData = [];
    let responseMessage = {};
    // let helpingHands = [];
    if(payload.message) {
        responseMessage = payload;
    } else if(Array.isArray(payload)) {
        allData = payload;
    } else {
        const allAreas = Object.keys(payload);
        if(allAreas.length > 1) {
            allAreas.forEach((item) => {
                payload[item].forEach((subItem) => {
                    allData.push({
                        ...subItem,
                        areaName: item
                    });
                });
            });
        } else {
            allData = Object.values(payload)[0];
        }
    }
    return {
        allData: allData.map((data, index) => {
            return {
                key: data.key || index,
                ...data
            };
        }),
        responseMessage
    };
}