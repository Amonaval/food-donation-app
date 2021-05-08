import React from 'react';
import { Button, InputNumber} from 'antd';
import {bindAll} from 'lodash';


import {checkIfErrors} from '../../../utils';
import RaiseNeedView from '../subViews/RaiseNeedView';
import HelpingHandView from '../subViews/HelpingHandView';
import {timeSlots} from '../../../consts';


class HelpingHandComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            adress: {}
        }
        bindAll(this, ['raiseNeed', 'fetchProviders', 'fetchDonars', 'createLocationPayload', 
            'setFormItem', 'confirmProvideRequest', 'getUsersRequest']);
    }

    componentDidMount() {
        this.props.clearResponseMessage();
    }
   
    setFormItem(val, item) {
        this.setState({[item]: val});
    }

    
    getUsersRequest() {
        const {searchMob} = this.state;
        if(searchMob) {
            this.props.getNeedyStatus({data: searchMob});
        }
    }

    raiseNeed() {
        const {commonProps} = this.props
        const {form} = commonProps;
        let {...rest} = this.state;
        let {location} = rest;

        const errors = form.validateFields();

        // if(!mockOTP[rest.mobileNo] || mockOTP[rest.mobileNo] != this.state.otp) {
        //     form.setFields({['otp']: {value: this.state.otp, errors: [new Error('Invalid OTP')]}});
        //     form.validateFields('otp');
        //     return;
        // }
        const errorInfo = form.getFieldsError();
        if(checkIfErrors(errorInfo)) {
            return;
        }

        rest.serveOn = rest.serveOn._d.toDateString();
        const {auth} = commonProps;
        const data = {
            date: rest.serveOn,
            serves: rest.serves,
            purpose: rest.purpose,
            serveAs: rest.serveAs,
            helpingHandName: auth.user.username,
            areaName: location.selectedArea,
            city: location.selectedCity,
            state: location.selectedState,
            country: location.selectedCountry,
            mobileNo: rest.mobileNo
        };

        if(auth.user.pool) {
            localStorage.setItem(`${auth.user.pool.clientId}`, `${location.selectedCountry}_${location.selectedState}_${location.selectedCity}_${location.selectedArea}`);
        }
        this.props.raiseNeed(data);
    }

    createLocationPayload(){
        const {commonProps} = this.props
        const {form} = commonProps;
        const {location, mobileNo} = this.state;
        const {selectedCountry, selectedState, selectedCity, selectedArea} = location;

        // if(!mockOTP[mobileNo] || mockOTP[mobileNo] != this.state.otp) {
        //     form.setFields({['otp']: {value: this.state.otp, errors: [new Error('Invalid OTP')]}});
        //     form.validateFields('otp');
        //     return;
        // }

        form.validateFields();
        const errorInfo = form.getFieldsError();
        if(checkIfErrors(errorInfo)) {
            return;
        }

        if(!(selectedCountry && selectedState && (selectedCity || selectedArea))) {
            form.validateFields(['country', 'state', 'city', 'area']);
            return;
        }
        let rest = {
            country: selectedCountry,
            state: selectedState,
            city: selectedCity
        };
        if(selectedArea) {
            rest = {
                ...rest,
                areaName: selectedArea
            };
        }
        return rest;
    }

    fetchDonars() {
        const payload = this.createLocationPayload();
        this.props.fetchDonars(payload);
    }

    fetchProviders() {
        const payload = this.createLocationPayload();
        if(payload) {
            this.props.fetchProviders(payload);
        }
    }

    confirmProvideRequest() {
        const {commonProps = {}} = this.props;
        const {auth} = commonProps;
        this.props.confirmRequest({name: auth.user.username, contactNo: this.state.mobileNo});
    }

    componentDidUpdate() {
        const {commonProps = {}} = this.props;
        const {location} = this.state;
        if(!location && commonProps.selectedCountry) {
            this.setState({
                location: {
                    selectedCountry: commonProps.selectedCountry,
                    selectedState: commonProps.selectedState,
                    selectedCity: commonProps.selectedCity,
                    selectedArea: commonProps.selectedArea
                }
            });
        }
    }


    render() {
        let {commonProps, createButtonClass, changeScreen, userRequests} = this.props;
        const {showScreen} = commonProps;

        let confirmedRequest = [];
        let unconfirmedRequest = [];
        userRequests.forEach((item) => {
            if(item.confirmedBy !== null) {
                confirmedRequest.push(item);
            } else {
                unconfirmedRequest.push(item);
            }
        });
       
        return (
            <div>
                <div className="btn-group">
                    <Button className={createButtonClass('raiseNeed')} onClick={() => changeScreen('raiseNeed')}>Raise Need</Button>
                    <Button className={createButtonClass('helpinghand')} onClick={() => changeScreen('helpinghand')}>Looking food</Button>
                    <Button className={createButtonClass('searchStatusHH')} onClick={() => changeScreen('searchStatusHH')}>Track Status</Button>
                    {/* <Button disabled className={createButtonClass('y')} onClick={() => changeScreen('registerHH')}>Register as Helping Hand</Button> */}
                </div>
                {showScreen === 'helpinghand' && <HelpingHandView
                    {...commonProps}
                    {...this.state}
                    setFormItem={this.setFormItem}
                    fetchProviders={this.fetchProviders}
                    confirmProvideRequest={this.confirmProvideRequest} />}
                {showScreen === 'raiseNeed' && <RaiseNeedView
                    {...commonProps}
                    {...this.state}
                    raiseNeed={this.raiseNeed}
                    fetchDonars={this.fetchDonars}
                    setFormItem={this.setFormItem} />}

                {/* {showScreen === 'searchStatusHH' && <div className="search-status"> Track status for Helping hand/Needy. Work under progress </div>} */}

                {showScreen === 'searchStatusHH' && <div className="search-status">
                    <Button className="ant-btn ant-btn-primary" onClick={this.getUsersRequest}>Get Status</Button>
                    <InputNumber placeholder="Enter your mobile no" value={this.state.searchMob} onChange={(val) => this.setFormItem(val, 'searchMob')} />

                    <div>
                        {unconfirmedRequest && unconfirmedRequest.length > 0 && <span><b>UnConfirmed Request</b></span>}
                        {unconfirmedRequest && unconfirmedRequest.map((item, index) => <div className="unconfirmed-list" key={item.date}>
                            {<span>{index + 1}. <b>{item.purpose}</b></span>}
                        </div>)}
                        {confirmedRequest && confirmedRequest.length > 0 && <span><b>Confirmed Request</b></span>}
                        {confirmedRequest && confirmedRequest.map((item, index) => <div className="confirmed-list" key={item.date}>
                            {<span>{index + 1}. <b>{item.confirmedBy}</b> will donate <span><b>{item.purpose}</b></span>
                            <span> between </span><span>{timeSlots[item.serveAs]}</span><span>contact No: {item.mobileNo}</span>
                            </span>}
                        </div>)}
                        {confirmedRequest && confirmedRequest.length > 0 && <b>Please be available to pickup</b>}
                        <br />
                        {(userRequests && userRequests.length > 0) && <div> Keep doing good work </div>}
                        {(userRequests && userRequests.length === 0) && <div> No request found</div>}
                    </div>
                </div>}
           
            </div>);
    }
}


HelpingHandComponent.propTypes = {};

HelpingHandComponent.defaultProps = {};

export default HelpingHandComponent;
