import React, { Component } from 'react';
import './App.css';
//import Web3 from 'web3'
import Navbar from './navbar'
import Content from './Content'
import { connect } from 'react-redux'
import {
  loadWeb3,
  loadAccount,
  loadToken,
  loadExchange
} from '../store/interactions'
import {contractsLoadedSelector} from '../store/selectors'

// import {accountSelector} from '../store/selectors'
class App extends Component {
  componentWillMount() {
    this.loadBlockchainData(this.props.dispatch)
  }

  async loadBlockchainData(dispatch) {
    const web3 = await loadWeb3(dispatch)
    const networkId = await web3.eth.net.getId()
    await loadAccount(web3, dispatch)
    const token = await loadToken(web3, networkId, dispatch)
    if(!token){
      window.alert('Token smart contract not detected on the current network.Please select another network with metamask.')
      return    
    }
    const exchange = await loadExchange(web3, networkId, dispatch)
    if(!exchange)
    {
      window.alert('Exchange smart contract not detected on the current network.Please select another network with metamask.')
      return 
    }
  }

  render() {
    //console.log(this.props.account)
    return (
      <div>
       <Navbar/>
        { this.props.contractsLoaded ? <Content/> : <div className = "content"> </div> }      
        
      </div>

    );
  }
}

function mapStateToProps(state) {
  //console.log('contractsLoaded?' , contractsLoadedSelector(state))
  return {
    contractsLoaded : contractsLoadedSelector(state)
    //account : accountSelector(state)
    // TODO: Fill me in...
  }
}

export default connect(mapStateToProps)(App);
