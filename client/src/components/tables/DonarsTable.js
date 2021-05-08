import React from 'react';
import {Table, Modal, Button, Spin} from 'antd';
import PropTypes from 'prop-types';
import {bindAll, kebabCase, isEmpty, isEqual} from 'lodash';
import {connect} from 'react-redux';

class HelpingHandsTable extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isModalVisible: false
        };
    }

    componentDidUpdate(prevProps) {
        const {donarsResponse = {}} = this.props;
        const {donarsResponse: prevResponseMessage = {}} = prevProps;
        if(!isEmpty(donarsResponse.message) && donarsResponse.message !== prevResponseMessage.message) {
            this.setState({isModalVisible: true});
        }
    }
    
    render() {

        let {areawiseDonars = [], donarsResponse, loading} = this.props;

        const defaultcolumns = [
            {
                title: 'Name',
                dataIndex: 'name',
                key: 'name'
            },
            {
                title: 'Available Time',
                dataIndex: 'availableTimeSlot',
                key: 'availableTimeSlot',
                width: '150px'
            },
            {
                title: 'Working Days',
                dataIndex: 'workingDays',
                key: 'workingDays',
                width: '100px'
            },
            {
                title: 'Contact Details',
                dataIndex: 'donarsContactNo',
                key: 'donarsContactNo',
                width: '130px'
            },
            {
                title: 'Serviceable Area',
                dataIndex: 'serviceableArea',
                key: 'serviceableArea',
                width: '250px'
            }
        ];

        return(
            <Spin spinning={loading}>
                <div className="helping-hand-table">
                    {!loading && donarsResponse &&
                    <Modal title="Request Confirm" visible={this.state.isModalVisible} onOk={() => this.setState({isModalVisible: false})}>
                        <p>{donarsResponse.message}</p>
                    </Modal>}
                    {!isEmpty(areawiseDonars) && <Table
                        bordered
                        dataSource={areawiseDonars}
                        columns={defaultcolumns}
                        pagination={areawiseDonars.length > 10}/>}

                </div>
            </Spin>);

    }
}



const mapStateToProps = (state, ownProps) => {
    const {sampleReducer = {}} = state;
    const {areawiseDonars = [], donarsResponse = {}, loading} = sampleReducer;

    return {
        areawiseDonars,
        loading,
        donarsResponse,
        name: ownProps.name
    };
};

const mapDispatchToProps = (dispatch) => {
    return {

    };
};

HelpingHandsTable.propTypes = {};

HelpingHandsTable.defaultProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(HelpingHandsTable);
