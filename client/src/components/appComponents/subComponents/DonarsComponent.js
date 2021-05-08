import React from 'react';
import {Button, InputNumber} from 'antd';
import {bindAll} from 'lodash';


import {checkIfErrors} from '../../../utils';
import DonarView from '../subViews/DonarComponent';
import NeedAround from '../subViews/NeedAround';
import {timeSlots} from '../../../consts';

const mockOTP = {
    '7588646483': '1234'
};

class DonarComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {}
        bindAll(this, ['getUsersRequest', 'createProvider', 'fetchHelpingHands', 
            'setFormItem', 'createLocationPayload', 'fetchNeeds', 'confirmNeedRequest']);
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
            this.props.getUserStatus({data: searchMob});
        }
    }

    createProvider() {
        const {commonProps} = this.props
        const {form} = commonProps;
        let {...rest} = this.state;
        let {location = {}} = rest;

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
            description: rest.foodDesc,
            serveAs: rest.serveAs,
            providerName: auth.user.username,
            providerAddress: rest.address,
            areaName: location.selectedArea && location.selectedArea.trim(),
            city: location.selectedCity.trim(),
            state: location.selectedState.trim(),
            mobileNo: rest.mobileNo,
            country: location.selectedCountry.trim()
        };

        if(auth.user.pool) {
            localStorage.setItem(`${auth.user.pool.clientId}`, `${location.selectedCountry}_${location.selectedState}_${location.selectedCity}_${location.selectedArea}`);
        }
        this.props.createProvider(data);
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
        if(!(selectedCountry && selectedState && (selectedCity || selectedArea))) {
            form.validateFields(['country', 'state', 'city', 'area']);
            return;
        }
        const rest = {
            country: selectedCountry,
            state: selectedState,
            city: selectedCity,
            areaName: selectedArea
        };
        return rest;
    }

    fetchHelpingHands() {
        const payload = this.createLocationPayload();
        if(payload) {
            this.props.fetchHelpingHands(payload);
        }
    }

    fetchNeeds() {
        const payload = this.createLocationPayload();
        this.props.fetchNeeds(payload);
    }


    confirmNeedRequest() {
        const {commonProps} = this.props
        const {auth} = commonProps;
        this.props.confirmNeedRequest({name: auth.user.username, contactNo: this.state.mobileNo});
    }

    componentDidUpdate() {
        const {commonProps = {}} = this.props;
        if(!this.state.selectedCountry && commonProps.selectedCountry) {
            this.setState({
                selectedCountry: commonProps.selectedCountry,
                selectedState: commonProps.selectedState,
                selectedCity: commonProps.selectedCity,
                selectedArea: commonProps.selectedArea
            });
        }
    }


    render() {


        let {commonProps, userRequests, createButtonClass, changeScreen} = this.props;
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
        // return(<div>Hello</div>)
        return(
            <div>
                <div className="btn-group">
                    <Button className={createButtonClass('provider')} onClick={() => changeScreen('provider')}>Donate</Button>
                    <Button className={createButtonClass('needAround')} onClick={() => changeScreen('needAround')}>Search Need</Button>
                    <Button className={createButtonClass('searchStatus')} onClick={() => changeScreen('searchStatus')}>Track Status</Button>
                    {/* <Button disabled className={createButtonClass('x')} onClick={() => changeScreen('registerDonar')}>Register as Donar</Button> */}
                </div>
                {showScreen === 'provider' && <DonarView
                    {...commonProps}
                    {...this.state}
                    createProvider={this.createProvider}
                    setFormItem={this.setFormItem}
                    fetchHelpingHands={this.fetchHelpingHands} />}
                
                {showScreen === 'needAround' && <NeedAround
                    {...commonProps}
                    {...this.state}
                    confirmNeedRequest={this.confirmNeedRequest}
                    setFormItem={this.setFormItem}
                    fetchNeeds={this.fetchNeeds} />}
                {showScreen === 'searchStatus' && <div className="search-status">
                    <Button className="ant-btn ant-btn-primary" onClick={this.getUsersRequest}>Get Status</Button>
                    <InputNumber placeholder="Enter your mobile no" value={this.state.searchMob} onChange={(val) => this.setFormItem(val, 'searchMob')} />

                    <div>
                        {unconfirmedRequest && unconfirmedRequest.length > 0 && <span><b>UnConfirmed Request</b></span>}
                        {unconfirmedRequest && unconfirmedRequest.map((item, index) => <div className="unconfirmed-list" key={item.date}>
                            {<span>{index + 1}. <b>{item.description}</b></span>}
                        </div>)}
                        {confirmedRequest && confirmedRequest.length > 0 && <span><b>Confirmed Request</b></span>}
                        {confirmedRequest && confirmedRequest.map((item, index) => <div className="confirmed-list" key={item.date}>
                            {<span>{index + 1}. <b>{item.confirmedBy}</b> will pickup <span><b>{item.description}</b></span>
                             <span> between </span><span>{timeSlots[item.serveAs]}</span><span>contact No: {item.mobileNo}</span>
                            </span>}
                        </div>)}
                        <br />
                        {(userRequests && userRequests.length > 0) && <div>Thank you for you contribution. You are doing a noble work.</div>}
                    </div>
                </div>}
            </div>
        );

    }
}

DonarComponent.propTypes = {};

DonarComponent.defaultProps = {};

export default DonarComponent;
