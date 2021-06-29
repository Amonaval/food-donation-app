import React from 'react';
import {Form, Button, InputNumber, Spin, Modal, Card, Popover, Tooltip} from 'antd';
import {NavLink} from 'react-router-dom';
import PropTypes from 'prop-types';
import {bindAll, isEmpty} from 'lodash';

import HelpingHandComponent from './subComponents/HelpingHandComponent.Connect';
import DonarComponent from './subComponents/DonarsComponent.Connect';

import {createButtonClass} from '../../utils';

const mockOTP = {
    '7588646483': '1234'
};

class AppComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            autocomplete: undefined,
            componentForm: {
                street_number: 'short_name',
                route: 'long_name',
                locality: 'long_name',
                administrative_area_level_1: 'short_name',
                country: 'long_name',
                postal_code: 'short_name'
            },
            showScreen: '',
            searchMob: null,
            isModalVisible: false
        };
        bindAll(this, ['geolocate', 'createButtonClass', 'changeScreen', 'initAutocomplete', 'handleOk']);
        this.autocomplete = null;
    }

    componentDidUpdate(prevProps) {
        const {responseMessage = {}} = this.props;
        const {responseMessage: prevResponseMessage = {}} = prevProps;
        if(!isEmpty(responseMessage.message) && responseMessage.message !== prevResponseMessage.message) {
            this.setState({isModalVisible: true});
        }
    }

    componentDidMount() {
        const googleMapScript = document.createElement('script');
        window.document.body.appendChild(googleMapScript);
        this.props.clearResponseMessage();

        // googleMapScript.addEventListener('load', () => {
        //     // this.googleMap = this.createGoogleMap()
        //     // this.marker = this.createMarker()
        //     this.initAutocomplete();
        // });
    }

    handleOk() {
        this.setState({isModalVisible: false});
    }

    initAutocomplete() {
        // Create the autocomplete object, restricting the search predictions to
        // geographical location types.
        let autocomplete = new window.google.maps.places.Autocomplete(
            document.getElementById('autocomplete'), {types: ['geocode']}
        );

        // Avoid paying for data that you don't need by restricting the set of
        // place fields that are returned to just the address components.
        autocomplete.setFields(['address_component']);

        // When the user selects an address from the drop-down, populate the
        // address fields in the form.
        autocomplete.addListener('place_changed', () => {
            // this.setState({autocomplete: autocomplete.getPlace()})
            this.setState({autocomplete: autocomplete});
        });
    }

    geolocate() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                var geolocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                var circle = new window.google.maps.Circle({center: geolocation, radius: position.coords.accuracy});

                if(this.state.autocomplete) {
                    this.state.autocomplete.setBounds(circle.getBounds());
                }
            });
        }
    }

    changeScreen(screenName) {

        const {auth} = this.props;
        const {isAuthenticated, user = {}} = auth;
        if(!(user && isAuthenticated)) {
            this.props.history.push('/login');
        }

        let locationData = {selectedCountry: '', selectedState: '', selectedCity: '', selectedArea: ''};
        /******* If past user get his location data *******/
        if(auth.user.pool && localStorage.getItem(`${auth.user.pool.clientId}`)) {
            const userData = localStorage.getItem(`${auth.user.pool.clientId}`).split('_');
            // let selectedCountry, selectedState, selectedCity, selectedArea;
            // [selectedCountry, selectedState, selectedCity, selectedArea] = userData;
            locationData.selectedArea = userData[3];
            locationData.selectedCity = userData[2];
            locationData.selectedState = userData[1];
            locationData.selectedCountry = userData[0];
        }

        this.props.clearResponseMessage();
        this.setState({...locationData, showScreen: screenName});

        var timer1 = setTimeout(() => {
            this.props.form.setFieldsValue({'country': locationData.selectedCountry,
                'city': locationData.selectedCity,
                'state': locationData.selectedState,
                'mobileNo': '',
                'area': locationData.selectedArea});

            if((locationData.selectedCity || locationData.selectedArea) && this.state.showScreen === 'helpinghand') {
                // this.fetchProviders();
            }
            clearTimeout(timer1);
        }, 30);

    }

    createButtonClass(type) {
        const {showScreen} = this.state;
        return createButtonClass(type, showScreen);
    }

    render() {
        const {auth, userRequests = [], responseMessage} = this.props;
        const {getFieldDecorator} = this.props.form;
        const {autocomplete = {}, componentForm, showScreen} = this.state;
        // const {ad = {}} = initData;
        const addressComps = autocomplete.getPlace && autocomplete.getPlace().address_components;
        const {isAuthenticated, user = {}} = auth;

        const commonProps = {
            ...this.props,
            ...this.state,
            getFieldDecorator,
            isAuthenticated,
            user,
            showScreen
        };
        const aboutDonate = 'For those who wants to initate food donation or fullfill open request of food around your area';
        const aboutNeed = 'For those who wants to initate food requirement or confirm from exisitng food donations request around your area';
        return (
            <Spin spinning={this.props.loading}>
                <div className="container">
                    {!this.props.flow && <p className="control landing-page-btns">
                        <div className="donate-btn">


                            <Card size="small" title={<NavLink to="/app/donar">I want to Donate</NavLink>}>
                                <p><b>Donate</b> the food by initiating the request voluntarily & the person in need can confirm.</p>
                                <p><b>Search Needs</b> & donate food for the needs raised around your area/city.</p>
                            </Card>



                            {/* <NavLink to="/app/donar">
                                <Button type="button" className="ant-btn ant-btn ant-btn-link custom-links" >I want to donate</Button>
                            </NavLink> */}
                            {/* <Popover content={aboutDonate} title="Donate food">
                                <Icon type="info-circle" />
                            </Popover> */}
                            {/* <p><b>Donate</b> the food by initiating the request voluntarily & the person in need can confirm.</p>
                            <p><b>Search Needs</b> & donate food for the needs raised around your area/city.</p> */}
                        </div>
                        <div className="need-btn">


                            <Card size="small" title={<NavLink to="/app/helpinghand">I am in Need</NavLink>}>
                                <p><b>Raise</b> a need for food & some noble donar around you can fulfill your request or </p>
                                <p><b>Search Donation</b> open request voluntarily donar has raised and which meets your need, Confirm it.</p>

                            </Card>

                            {/* <NavLink to="/app/helpinghand">
                                <Button type="button" className="ant-btn ant-btn ant-btn-link custom-links" >I am in need</Button>
                            </NavLink> */}
                            {/* <Popover content={aboutNeed} title="Need food">
                                <Icon type="info-circle" />
                            </Popover> */}
                            {/* <p><b>Raise</b> a need for food & some noble donar around you can fulfill your request or </p>
                            <p><b>Search Donation</b> open request voluntarily donar has raised which meets your need, confirm it.</p> */}

                        </div>

                    </p>}


                    {this.props.flow === 'donar' && <DonarComponent
                        changeScreen={this.changeScreen}
                        createButtonClass={this.createButtonClass}
                        commonProps={commonProps} />}


                    {this.props.flow === 'helpinghand' && <HelpingHandComponent
                        changeScreen={this.changeScreen}
                        createButtonClass={this.createButtonClass}
                        commonProps={commonProps} />}


                    {/* <div>{ad.text}</div>
                        <div id="locationField">
                            <input id="autocomplete"
                                placeholder="Enter your address"
                                onFocus={this.geolocate}
                                type="text"/>
                        </div>

                        {addressComps && addressComps.map((item) => {
                            if(componentForm[item.types[0]]) {
                                return <div>{item[componentForm[item.types[0]]]}</div>;
                            }
                            return null;
                        })} */}





                    {/* {this.props.loading && } */}
                    {!this.props.loading && responseMessage &&
                    <Modal title="Request Confirm" visible={this.state.isModalVisible} onOk={this.handleOk}>
                        <p>{responseMessage.message}</p>
                    </Modal>}
                </div>
            </Spin>
        );
    }
}


AppComponent.propTypes = {
    auth: PropTypes.object.isRequired,
    loading: PropTypes.boolean,
    userRequests: PropTypes.array,
    responseMessage: PropTypes.object
};

AppComponent.defaultProps = {
    loading: false,
    userRequests: [],
    responseMessage: {},
    flow: ''
};

const AppComponentForm = Form.create()(AppComponent);


export default AppComponentForm;
