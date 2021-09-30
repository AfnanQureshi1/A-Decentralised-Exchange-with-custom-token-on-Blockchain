pragma solidity ^0.5.0;
import "./Token.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract Exchange{
		//Variables
 		using SafeMath for uint;
		address public feeAccount; // the account that recieves exchange fees
		uint256 public feePercent ; // fee percentage
		address constant ETHER = address(0); //STORE ETHERS IN TOKENS MAPPING WITH BLANK ADDRESS

		mapping(address => mapping (address =>uint256)) public tokens ;
		mapping(uint256 => _Order) public orders;
		uint256 public orderCount;
		mapping(uint256 => bool ) public orderCancelled;
		mapping(uint256 => bool ) public orderFilled;

	//	address constant ETHER = address(0); // allows to store ether in tokens mapping with blank address

		//fall back when ether is sent to this smart contract by mistake
		function() external{
			revert();
		}

		//Events
		event Deposit (address token , address user , uint256 amount, uint256 balance);
		event Withdraw (address token , address user , uint256 amount, uint256 balance);
		event Order(
			uint256 id,
			address user,
			address tokenGet,
			uint256 amountGet,
			address tokenGive,
			uint256 amountGive,
			uint256 timestamp
		);

		event Cancel(
			uint256 id,
			address user,
			address tokenGet,
			uint256 amountGet,
			address tokenGive,
			uint256 amountGive,
			uint256 timestamp
		);

		event Trade(
        uint256 id,
        address user,     // user who created the order
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        address userFill, // the user who filled the order
        uint256 timestamp
    );


		// a way to model the order
	
		struct _Order{
			uint256 id;
			address user;
			address tokenGet;
			uint256 amountGet;
			address tokenGive;
			uint256 amountGive;
			uint256 timestamp;
		}


		// add order to storage

			constructor(address _feeAccount, uint256 _feePercent) public {
				feeAccount = _feeAccount;
				feePercent = _feePercent;
			} 



			function withdrawEther(uint _amount) public{
				require(tokens[ETHER][msg.sender]>= _amount);
				tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].sub(_amount);
				msg.sender.transfer(_amount);
				emit Withdraw(ETHER,msg.sender,_amount, tokens[ETHER][msg.sender]);
			} 

			function depositEther() payable public {
				tokens[ETHER][msg.sender]=tokens[ETHER][msg.sender].add(msg.value);
				emit Deposit(ETHER, msg.sender, msg.value ,tokens[ETHER][msg.sender]);

			}

			function depositToken(address _token, uint _amount) public {
				// dont let deposit ether

				require(_token!=ETHER);
				require(Token(_token).transferFrom (msg.sender, address(this) , _amount));
				tokens[_token][msg.sender]=tokens[_token][msg.sender].add(_amount);
				emit Deposit(_token, msg.sender, _amount ,tokens[_token][msg.sender]);

			}


			function withdrawToken(address _token, uint256 _amount) public {
				require(_token != ETHER);
				require(tokens[_token][msg.sender]>= _amount);
				tokens[_token][msg.sender] = tokens[_token][msg.sender].sub(_amount);
				require(Token(_token).transfer(msg.sender, _amount));
				emit Withdraw(_token, msg.sender, _amount , tokens[_token][msg.sender]);
			}

				function balanceOf(address _token, address _user) public view returns (uint256) {
		        return tokens[_token][_user];
		   			 }

		   			// a way to  store the order on blockchain
			
			function makeOrder(address _tokenGet , uint256 _amountGet , address _tokenGive , uint256 _amountGive  ) public {
				orderCount = orderCount.add(1);
				orders[orderCount] = _Order(orderCount ,msg.sender,  _tokenGet , _amountGet , _tokenGive, _amountGive, now);
				emit Order(orderCount, msg.sender, _tokenGet , _amountGet , _tokenGive, _amountGive, now);

			}


			function cancelOrder(uint256 _id) public{
				_Order storage _order = orders[_id];
				require(address(_order.user)== msg.sender);
				require(_order.id == _id); // order must exist
				//must be "my order"
				
				// must be a valid order

				orderCancelled[_id] = true;
				emit Cancel(_order.id, msg.sender, _order.tokenGet , _order.amountGet , _order.tokenGive, _order.amountGive, now);


			}

			function fillOrder(uint256 _id) public{
				require(_id > 0 && _id <= orderCount); // order id is valid
				require(!orderFilled[_id]); // order is not already filled
				require(!orderCancelled[_id]); // order is not in cancelled 

				_Order storage _order = orders[_id]; //fetch the order
				_trade(_order.id,_order.user , _order.tokenGet , _order.amountGet ,  _order.tokenGive , _order.amountGive );
				
				
				//mark order as filled
				orderFilled[_order.id] = true; 

			}

			function _trade(uint256 _orderId , address _user , address _tokenGet ,uint256 _amountGet,  address _tokenGive , uint256 _amountGive) internal { // using function only in solidity
							// Fee paid by the user that fills the order, a.k.a. msg.sender.
       			 uint256 _feeAmount = _amountGet.mul(feePercent).div(100);
				// execute trade and
				// charge fees
				tokens[_tokenGet][msg.sender] = tokens[_tokenGet][msg.sender].sub(_amountGet.add(_feeAmount)); // subtract the amount of tokens plus the percentage of fees from senders account
		        tokens[_tokenGet][_user] = tokens[_tokenGet][_user].add(_amountGet);
		        tokens[_tokenGet][feeAccount] = tokens[_tokenGet][feeAccount].add(_feeAmount); //add fee to fee account
		        tokens[_tokenGive][_user] = tokens[_tokenGive][_user].sub(_amountGive);
		        tokens[_tokenGive][msg.sender] = tokens[_tokenGive][msg.sender].add(_amountGive);

				// emit trade event
				 emit Trade(_orderId, _user, _tokenGet, _amountGet, _tokenGive, _amountGive, msg.sender /*user filling the order*/, now);



			}

		//which Token
		// how much
		// track balance of exchange
		// manage deposit - update balance
		// send tokens to this contract
		// emit event

	

}



// TODO
// [X] Set Fees
// [x] Set Fee account
// [x] deposit ehter
// [x] WITHDRAW ehter
// [x]DEPOSIT TOKENS
// [x]WITHDRAW TOKENS
// [x]CHECK BALANCES
// [x]MAKE orders
// [x]FILL orders
// [x]CANCEL ORDER
// [x] CHARGE Fees

