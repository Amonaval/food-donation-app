import {connect} from 'react-redux';
import AppComponent from './appComponent';
import {clearResponseMessage} from '../../actions/sampleAction';

const mapStateToProps = (state, ownProps) => {
    const {sampleReducer = {}} = state;
    const {allProviders = [], createStatus = {}, responseMessage, reqAdded, reqRemoved, loading, userRequests} = sampleReducer;
    
    return {
        createStatus,
        allProviders,
        responseMessage,
        userRequests,
        reqAdded,
        reqRemoved,
        loading,
        ...ownProps
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        clearResponseMessage: () => {
            dispatch(clearResponseMessage());
        }
    };
};

// export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AppComponent));
export default connect(mapStateToProps, mapDispatchToProps)(AppComponent);
