import React from 'react';
import {Form, Button, Select, Input} from 'antd';
import PropTypes from 'prop-types';
import {bindAll} from 'lodash';
// import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import MapGL from 'react-map-gl';
import Geocoder from 'react-map-gl-geocoder';
import addressess from './IndiaCities.json';
const Option = Select.Option;

const MAPBOX_TOKEN = 'pk.eyJ1IjoiYW1vbG5hdmFsIiwiYSI6ImNrb2N1YTBncTA2aGsybnBldzcxb2JyNTMifQ.S16QfaROFdnjbn6MLCKwnw';

// mapboxgl.accessToken = MAPBOX_TOKEN;


const countries = {
    'India': {
        // ...addressess
        'Maharashtra': {
            'Pune' : ['Yerwada', 'Kalyani Nagar', 'Vishrantwadi', 'Magarpatta', 'Hinjewadi'],
            'Mumbai': ['Andheri(E)', 'Andheri(w)', 'Goregaon', 'Juhu', 'Kurla', 'Sion']
        },
        'Madhya Pradesh': {
            'Ujjain': ['Mahakal Area', 'Mahananda', 'Rishi Nagar', 'Saket Nagar', '']
        }
    }
};


class AddressFormComponent extends React.Component {
    constructor(props) {
        super(props);
        bindAll(this, ['setFormItem']);

        this.state = {
            map: null,
            geocoder: null,
            viewport: {
                lng: -70.9,
                lat: 42.35,
                zoom: 9
            }
        };
        this.mapRef = React.createRef();
        this.geocoderContainerRef = React.createRef();
    }

    setFormItem(val, item) {
        this.props.setFormItem(val, item);
    }

    render() {
        const {getFieldDecorator, selectedCountry, selectedState, selectedCity, selectedArea} = this.props;

        return(
            <React.Fragment>
                <Form.Item name="select" label="Location" className="geo-location-container">
                        
                    <div
                        className="geo-loc"
                        ref={this.geocoderContainerRef}
                        style={{position: 'absolute', width: 100, height: 50, zIndex: 1}}
                    />
                    <div className="map-comp">
                        <MapGL
                            ref={this.mapRef}
                            {...this.state.viewport}
                            width="100px"
                            height="100px"
                            clearOnBlur={true}
                            clearAndBlurOnEsc={true}
                            // onViewportChange={(viewport) => this.setState({viewport})}
                            mapboxApiAccessToken={MAPBOX_TOKEN}>
                            <Geocoder
                                mapRef={this.mapRef}
                                clearAndBlurOnEsc={true}
                                onResult={(data, data1, ds) => {

                                    let resultData = data.result.place_name.split(',');
                                    resultData = Array.from(new Set(resultData));
                                    // const regions = ['selectedArea','selectedCity', 'selectedState', 'selectedCountry'];
                                    const regions = ['selectedCountry', 'selectedState', 'selectedCity', 'selectedArea'];
                                    // const [selectedArea, selectedCity, selectedState, selectedCountry] = data.result.place_name.split(',');

                                    if(resultData.length > 4) {
                                        resultData.splice(1, resultData.length - 4);
                                    }
                                    const location = {};
                                    let j = 0;
                                    for(let i = resultData.length - 1; i >=0; i--) {
                                        const placeName = resultData[i] || '';
                                        location[regions[j]] = placeName.trim();
                                        j++;
                                    }
                                    this.setFormItem(location, 'location');
                                }}
                                containerRef={this.geocoderContainerRef}
                                // onViewportChange={(viewport) => this.setState({viewport})}
                                mapboxApiAccessToken={MAPBOX_TOKEN}
                                clearOnBlur={true}
                                position="top-left"
                            />
                        </MapGL>
                    </div>
                    {/* <div ref={this.mapContainer} id="map"></div>
                    <div id="geocoder" className="geocoder">x
                        {this.state.geocoder && this.state.geocoder.onAdd(this.state.map)}
                    </div> */}

                    {/* <input id="autocomplete" placeholder="Enter your address"
                        onFocus={this.geolocate} type="text" className="form-control" /> */}

                    </Form.Item>
                <div className="detail-form">
                    {selectedArea && <Form.Item name="select" label="Area">
                        <Input disabled value={selectedArea} placeholder="Area" />
                    </Form.Item>}
                    {selectedCity && <Form.Item name="select" label="City">
                        <Input disabled value={selectedCity} placeholder="City" />
                    </Form.Item>}
                    {(selectedCountry || selectedState) && !selectedCity && <span>Please enter city name or area name</span>}
                    {selectedState && <Form.Item name="select" label="State">
                        <Input disabled value={selectedState} placeholder="State" />
                    </Form.Item>}
                    {selectedCountry && <Form.Item name="select" label="Country">
                        <Input disabled value={selectedCountry} placeholder="Country" />
                    </Form.Item>}
                    {/* <Form.Item name="select" label="Country">
                    {getFieldDecorator('country', {rules: [{required: true, message: 'Please select your country!'}]})(
                        <Select placeholder="Please select a country" onChange={(val) => this.setFormItem(val, 'selectedCountry')}>
                            {Object.keys(countries).map((item) => <Option key={item} value={item}>{item}</Option>)}
                        </Select>
                    )}

                </Form.Item>
                <Form.Item name="select" label="State">
                    {getFieldDecorator('state', {rules: [{required: true, message: 'Please select your state!'}]})(
                        <Select placeholder="Please select a state"
                            disabled={selectedCountry ? false : true}
                            onChange={(val) => this.setFormItem(val, 'selectedState')}>
                            {selectedCountry && Object.keys(countries[selectedCountry]).map((item) => <Option key={item} value={item}>{item}</Option>)}
                        </Select>
                    )}
                </Form.Item>
                <Form.Item name="select" label="City">
                    {getFieldDecorator('city', {rules: [{required: true, message: 'Please select your city!'}]})(
                        <Select disabled={selectedState ? false : true} placeholder="Please select a city" onChange={(val) => this.setFormItem(val, 'selectedCity')}>
                            {selectedState && Object.keys(countries[selectedCountry][selectedState]).map((item) => <Option key={item} value={item}>{item}</Option>)}
                        </Select>
                    )}
                </Form.Item>
                <Form.Item name="select" label="Area">
                    {getFieldDecorator('area', {rules: [{required: true, message: 'Please select your area!'}]})(
                        <Select disabled={selectedCity ? false : true} placeholder="Please select area" onChange={(val) => this.setFormItem(val, 'selectedArea')}>
                            {selectedCity && countries[selectedCountry][selectedState][selectedCity] &&
                    countries[selectedCountry][selectedState][selectedCity].map((item) => <Option key={item} value={item}>{item}</Option>)}
                        </Select>
                        // <Input disabled={selectedCity ? false : true} placeholder="Please select area" onChange={(val) => this.setFormItem(val, 'selectedArea')}></Input>
                    )}
                </Form.Item> */}

                </div>
            </React.Fragment>);
    }
}


AddressFormComponent.propTypes = {
    getFieldDecorator: PropTypes.func.isRequired,
    fetchHelpingHands: PropTypes.func.isRequired,
    selectedCountry: PropTypes.string.isRequired,
    selectedState: PropTypes.string.isRequired,
    selectedCity: PropTypes.string.isRequired,
    selectedArea: PropTypes.string.isRequired,
    setFormItem: PropTypes.func.isRequired
};

const AddressFormComponentForm = Form.create()(AddressFormComponent);


export default AddressFormComponentForm;
