import {tokens , EVM_REVERT} from './helpers'

const Token = artifacts.require("./Token");

require('chai')
	.use(require('chai-as-promised'))
	.should()


 contract('Token' , ([deployer , receiver , exchange]) => {
		const name = 'DAO PropTech'
		const symbol = 'DAO'
		const totalSupply = tokens(1000000).toString()
		const decimals = '18'
		let token
	    beforeEach(async () => {
		token = await Token.new();
			})

		describe('deployment' , () => {
			it('tracks the name ' , async () => {
				// fetch token from blockchain

				//const token = await Token.new();
				//read the token name here ..

				const result = await token.name();
				// check if the token name is 'MY NAME'

				result.should.equal(name)
			})

			it('tracks the symbol' , async () => {
				const result = await token.symbol();
				result.should.equal(symbol)

			})
			it('tracks the decimals' , async () => {
				const result = await token.decimals();
				result.toString().should.equal(decimals)
			})
			it('tracks the total supply' , async () => {
				const result = await token.totalSupply();
				result.toString().should.equal(totalSupply.toString())
			})
			it('assigns the total supply to the deployer' , async () => {
				const result = await token.balanceOf(deployer);
				result.toString().should.equal(totalSupply.toString())
			})
		})

	describe('sending tokens' , ()=> {
			let result;
			let amount;

			describe('success' , async() => {

				beforeEach(async () => {
				// // trasnfer
				amount = tokens(100)
				result = await token.transfer(receiver,amount ,{ from: deployer})
				})
				it('transfers token balances' , async() => {
					let balanceOf
					// before transfer
					// balanceOf = await token.balanceOf(deployer)
					// console.log("deployer's balance before" , balanceOf.toString())
					// balanceOf = await token.balanceOf(receiver)
					// console.log("receiver's balance before" , balanceOf.toString())
					// after transfer
					balanceOf = await token.balanceOf(deployer)
					balanceOf.toString().should.equal(tokens(999900).toString())
					//console.log("deployer's balance after" , balanceOf.toString())
					balanceOf = await token.balanceOf(receiver)
					balanceOf.toString().should.equal(tokens(100).toString())
					//console.log("receiver's balance after",balanceOf.toString())

				})
				it('emits a Transfer event' , async() => {
					// console.log(result);
					//console.log(result.logs);
					const log = result.logs[0]
					log.event.should.eq('Transfer') // eq= equal
					const event = log.args
					event.from.toString().should.equal(deployer, 'from is correct')
					event.to.should.equal(receiver, 'to is correct')
					event.value.toString().should.equal(amount.toString() , 'value is correct')
				})
			})

				describe('failure' , async ()=> {

					it('rejects insufficent balances' , async() => {
						let invalidAmount;
						invalidAmount = tokens(100000000) // 100million -greater than supply
						await token.transfer(receiver, invalidAmount, {from: deployer }).should.be.rejectedWith(EVM_REVERT); 
						//await token.transfer(receiver, invalidAmount, {from: deployer }).should.be.rejectedWith('VM Exception while processing transaction: revert');

						//attempt to transfer tokens when you have none 
						invalidAmount = tokens(10)
						await token.transfer(deployer, invalidAmount, {from: receiver }).should.be.rejectedWith(EVM_REVERT); 
							


					})
					it('rejects invalid receipients' , async () => {
						await token.transfer(0x0, amount , {from : deployer}).should.be.rejected; 						
					})
					
				})
	
	   })	


	describe('approving tokens', async() => {
		let amount;
		let result;

		beforeEach(async() => {
			amount = tokens(100)
			result = await token.approve(exchange,amount, {from : deployer})
		      })


			describe('success' , async() => {
					it('allocates an allowance for delegated token spending on exchange', async()=> {
					const allowance = await token.allowance(deployer, exchange )
					allowance.toString().should.equal(amount.toString());

					   })

					it('emits an Approval event' , async() => {
				// console.log(result);
				//console.log(result.logs);
				const log = result.logs[0]
				log.event.should.eq('Approval') // eq= equal
				const event = log.args
				event.owner.toString().should.equal(deployer, 'owner is correct')
				event.spender.should.equal(exchange, 'spender is correct')
				event.value.toString().should.equal(amount.toString() , 'value is correct')



					})

							})
				describe('failure' , async() => {
					it('rejects invalid spenders' , async() => {
						await token.approve(0x0, amount, {from :deployer }).should.be.rejected
					})
				})
			})


		describe('delegated tokens transfer' , ()=> {
				let result;
				let amount;

				beforeEach(async () => {
					amount = tokens(100)
					await token.approve(exchange, amount , {from : deployer})	
				})

				

				describe('success' , async() => {

					beforeEach(async () => {
					// // trasnfer
					result = await token.transferFrom(deployer, receiver,amount ,{ from: exchange})
					

			})
					it('transfers token balances' , async() => {
						let balanceOf
						
						balanceOf = await token.balanceOf(deployer)
						balanceOf.toString().should.equal(tokens(999900).toString())
					
						balanceOf = await token.balanceOf(receiver)
						balanceOf.toString().should.equal(tokens(100).toString())
					
					})

					it('resets the allowance', async()=> {
					const allowance = await token.allowance(deployer, exchange )
					allowance.toString().should.equal('0');
					})

					it('emits a Transfer event' , async() => {
						
						const log = result.logs[0]
						log.event.should.eq('Transfer') // eq= equal
						const event = log.args
						event.from.toString().should.equal(deployer, 'from is correct')
						event.to.should.equal(receiver, 'to is correct')
						event.value.toString().should.equal(amount.toString() , 'value is correct')
					})
				})

					describe('failure' , async ()=> {

						it('rejects insufficent amounts' , async() => {
							//Attempt to transfer too many tokens
					
						    const invalidAmount = tokens(100000000) // 100million -greater than supply
							await token.transferFrom(receiver, invalidAmount, {from: exchange }).should.be.rejectedWith(EVM_REVERT); 
							//await token.transfer(receiver, invalidAmount, {from: deployer }).should.be.rejectedWith('VM Exception while processing transaction: revert');

						})
						it('rejects invalid receipients' , async () => {
							 await token.transferFrom(deployer, 0x0, amount , {from : exchange}).should.be.rejected; 						
						})
						
					 })
	
	   		})


	})