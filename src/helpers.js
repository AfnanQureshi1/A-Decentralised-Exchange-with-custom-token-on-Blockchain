export const ETHER_ADDRESS = '0x0000000000000000000000000';

export const EVM_REVERT = 'VM Exception while processing transaction: revert';

export const tokens = (n) => {
	return new web3.utils.BN(
	web3.utils.toWei(n.toString(), 'tokens')
	)
}
// same as ether
//export const ether = (n) => tokens(n);
function ether (n) {
  return new web3.BigNumber(web3.toWei(n, 'ether'));
}

module.exports = {
  ether,
};