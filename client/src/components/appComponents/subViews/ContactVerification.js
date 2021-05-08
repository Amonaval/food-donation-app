import React from 'react';
import {Form, Input, InputNumber} from 'antd';
import PropTypes from 'prop-types';
import {bindAll} from 'lodash';

class ContactVerifyView extends React.Component {
    constructor(props) {
        super(props);
        bindAll(this, ['setFormItem', 'mobileNoValidator']);
    }

    setFormItem(val, item) {
        this.props.setFormItem(val, item);
    }

    mobileNoValidator(rule, value, callback) {
        if(value.match(/^([+]\d{2}[ ])?\d{10}$/g) != null){
            callback();
        } else {
            callback('Invalid contact no');
        }
    }

    render() {
        const {getFieldDecorator} = this.props;

        return(
            <React.Fragment>
                <Form.Item label="Contact No">
                    {getFieldDecorator('mobileNo', {rules: [
                        {required: true, message: 'Contact no is required'},
                        {validator: (rule, index, callback) => {
                            if(this.mobileNoValidator) {
                                this.mobileNoValidator(rule, index, callback, this.props, this.form);
                            } else{
                                callback();
                            }
                        }}]
                    })(
                        <Input onChange={(e) => this.setFormItem(parseInt(e.target.value, 10), 'mobileNo')} />
                    )}
                </Form.Item>
                {/* <Form.Item label="OTP">
                    {getFieldDecorator('otp', {rules: [{required: true, message: 'Please enter OTP'}]})(
                        <InputNumber onChange={(val) => this.setFormItem(val, 'otp')} />
                    )}
                </Form.Item> */}
            </React.Fragment>

        );

    }
}


ContactVerifyView.propTypes = {
    getFieldDecorator: PropTypes.func.isRequired,
    setFormItem: PropTypes.func.isRequired
};

const ContactVerifyViewForm = Form.create()(ContactVerifyView);


export default ContactVerifyViewForm;
