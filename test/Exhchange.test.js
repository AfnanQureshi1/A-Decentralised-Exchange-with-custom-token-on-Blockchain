import { EVM_REVERT, ETHER_ADDRESS ,  ether, tokens } from './helpers'

const Token = artifacts.require("./Token");
const Exchange = artifacts.require("./Exchange");

require('chai')
	.use(require('chai-as-promised'))
	.should()


 contract('Exchange',([deployer , receiver , feeAccount, user1]) => {
		let token
		let exchange
		const feePercent = 10

	    beforeEach(async () => {
	    //DEPLOY TOKEN
	    token = await Token.new()
		//GIVE TOKENS TO USER
		token.transfer(user1, tokens(100) , {from : deployer})
		//Deploy Exchange
		exchange = await Exchange.new(feeAccount, feePercent);
			})



		describe('deployment' , () => {
			it('tracks the fee Account ' , async () => {				
				const result = await exchange.feeAccount();			
				result.should.equal(feeAccount);
			})	
			
			it('tracks the fee percent' , async () => {				
				const result = await exchange.feePercent();			
				result.toString().should.equal(feePercent.toString());
			})	
		})


		describe('depositing Ether', () => {
			let result
			let amount

			beforeEach(async () => {
				amount = ether(1)
				result = await exchange.depositEther({from: user1,value: amount})
			})

			it ('tracks the Ether deposit' , async ()=> {
				const balance = await exchange.tokens(ETHER_ADDRESS, user1);
				balance.toString().should.equal(amount.toString());
				})

			it('emits a Deposit event' , async() => {
						
						const log = result.logs[0]
						log.event.should.eq('Deposit') // eq= equal
						const event = log.args
						event.token.toString().should.equal(ETHER_ADDRESS, 'token address is correct')
						event.user.should.equal(user1, 'user address is correct')
						event.amount.toString().should.equal(amount.toString() , 'amount is correct')				
						event.balance.toString().should.equal(amount.toString() , 'balance is correct')
					})


		})


		describe('depositing tokens' , () => {
			let amount
			let result
		
			describe('success' ,()=> {
					beforeEach(async ()=> {
					amount = tokens(10)
					await token.approve(exchange.address, amount,{from : user1})
					result = await exchange.depositToken(token.address, amount ,{from :user1} )
				})
				it('tracks the token deposit' , async () =>{
					//check exchange balance
					let balance;
					
					balance = await token.balanceOf(exchange.address)
					balance.toString().should.equal(amount.toString())
					//Checks tokens on exchange
					balance = await exchange.tokens(token.address, user1)
					balance.toString().should.equal(amount.toString())


				})


				it('emits a deposit event' , async() => {
						
						const log = result.logs[0]
						log.event.should.eq('Deposit') // eq= equal
						const event = log.args
						event.token.toString().should.equal(token.address, 'token address is correct')
						event.user.should.equal(user1, 'user address is correct')
						event.amount.toString().should.equal(tokens(10).toString() , 'amount is correct')				
						event.balance.toString().should.equal(tokens(10).toString() , 'balance is correct')
					})


			})

			describe('failure' ,()=> {
				it('rejects ether deposits', async()=>{
					await exchange.depositToken(ETHER_ADDRESS,tokens(10),{from : user1}).should.be.rejectedWith(EVM_REVERT);
					 
				})
				it('fails when no tokens are approved', async()=>{

					await exchange.depositToken(token.address, tokens(10),{from : user1 }).should.be.rejectedWith(EVM_REVERT);

				}) 
				

				
				
			})

		})
})



//})
