import React from 'react';
import ReactDOM from 'react-dom';
import {Form, Button, Empty, Select, Input, DatePicker, InputNumber, Switch, Spin} from 'antd';
import PropTypes from 'prop-types';
import {bindAll, kebabCase, isEmpty} from 'lodash';
import moment from 'moment';

import AddressFormComponent from './AddressFormView';
import HelpingHandsTable from '../../tables/HelpingHandsTable';
import ContactVerifyView from './ContactVerification';
import {timeSlots} from '../../../consts';


const Option = Select.Option;



class DonarView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        bindAll(this, ['setFormItem']);
    }



    setFormItem(val, item) {
        this.props.setFormItem(val, item);
    }

    componentDidUpdate(prevProps) {
        if(prevProps.selectedArea !== this.props.selectedArea) {
            // this.props.fetchHelpingHands();
        }
    }


    render() {

        const {createProvider, setFormItem, fetchHelpingHands, auth, getFieldDecorator, showScreen, location} = this.props;
        const {selectedCountry, selectedState, selectedCity, selectedArea} = location;

        return(
            <React.Fragment>
                <Form className="provider-form"
                    labelCol={{span: 8}}
                    wrapperCol={{span: 14}}
                    layout="horizontal"
                    initialValues={{size: 'middle'}}
                    size={'middle'}>

                    <AddressFormComponent
                        setFormItem={setFormItem}
                        selectedCountry={selectedCountry}
                        selectedState={selectedState}
                        selectedCity={selectedCity}
                        selectedArea={selectedArea}
                        getFieldDecorator={getFieldDecorator}
                        showScreen={showScreen}
                    />
                    <ContactVerifyView setFormItem={setFormItem} getFieldDecorator={getFieldDecorator} />


                    <Form.Item name={['user', 'address']} label="Detail Address">
                        {getFieldDecorator('user_address', {rules: [{required: true, message: 'Address is required'}]})(
                            <Input.TextArea value={this.props.address} onChange={(e) => this.setFormItem(e.target.value, 'address')} />
                        )}
                    </Form.Item>
                    <Form.Item name={['user', 'address']} label="Food Description">
                        {getFieldDecorator('food_desc', {rules: [{required: true, message: 'Please add some food description'}]})(
                            <Input.TextArea value={this.props.foodDesc} onChange={(e) => this.setFormItem(e.target.value, 'foodDesc')} />
                        )}
                    </Form.Item>
                    <Form.Item label="Feed how many people">
                        {getFieldDecorator('serves', {rules: [{required: true, message: 'Approx people it can serve'}]})(
                            <InputNumber value={this.props.serves} min="0" onChange={(val) => this.setFormItem(val, 'serves')} />
                        )}
                    </Form.Item>

                    <Form.Item label="Date" >
                        {getFieldDecorator('serveOn', {rules: [{required: true, message: 'Please mention date you will provide food on'}]})(
                            <DatePicker
                                disabledDate = {(current) => {
                                    // Can not select days before today and today
                                    return current && current < moment().endOf('day');
                                }}
                                onChange={(val) => this.setFormItem(val, 'serveOn')} />
                        )}
                    </Form.Item>
                    <Form.Item label="Pickup time" >
                        {getFieldDecorator('serveas', {rules: [{required: true, message: 'Please enter pickup time'}]})(
                            // <Switch checkedChildren="LUNCH" unCheckedChildren="DINNER" checked={this.props.serveAs} onChange={(val) => this.setFormItem(val, 'serveAs')} />
                            <Select placeholder="Please select a state" onChange={(val) => this.setFormItem(val, 'serveAs')} >
                                {Object.keys(timeSlots).map((item) => <Option key={item} value={item}>{timeSlots[item]}</Option>)}
                            </Select>
                        )}
                    </Form.Item>
                    <Button disabled={!(selectedCity || selectedArea)} className="ant-btn ant-btn-primary" onClick={createProvider}>Confirm</Button>
                </Form>
                <div>
                    <HelpingHandsTable selectedArea={selectedArea} name={auth.user.username}/>
                </div>
            </React.Fragment>
        );
    }
}


DonarView.propTypes = {
    auth: PropTypes.object.isRequired,
    showScreen: PropTypes.string.isRequired,
    getFieldDecorator: PropTypes.func.isRequired,
    fetchHelpingHands: PropTypes.func.isRequired,
    selectedCountry: PropTypes.string.isRequired,
    selectedState: PropTypes.string.isRequired,
    selectedCity: PropTypes.string.isRequired,
    selectedArea: PropTypes.string.isRequired,
    setFormItem: PropTypes.func.isRequired,
    createProvider: PropTypes.func.isRequired
};

const DonarViewForm = Form.create()(DonarView);


export default DonarViewForm;
