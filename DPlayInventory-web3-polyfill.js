// 이미 보관함에 의해 생성되었으면 더 이상 생성하지 않습니다.
if (window.DPlayInventory !== undefined) {
	// ignore.
}

// 만약 web3 환경도 아니라면
else if (window.web3 === undefined) {
	
	// DPlay 보관함 설치 안내 띄우기
	//TODO:
	alert('DPlay 보관함을 설치해주시기 바랍니다. (https://inventory.dplay.games)');
}

else {
	
	let TO_DELETE = null;
	
	let SHOW_ERROR = (tag, errorMsg, params) => {
		//REQUIRED: tag
		//REQUIRED: errorMsg
		//OPTIONAL: params
		
		let cal = CALENDAR();
			
		console.error(cal.getYear() + '-' + cal.getMonth(true) + '-' + cal.getDate(true) + ' ' + cal.getHour(true) + ':' + cal.getMinute(true) + ':' + cal.getSecond(true) + ' [' + tag + '] 오류가 발생했습니다. 오류 메시지: ' + errorMsg);
		
		if (params !== undefined) {
			console.error('다음은 오류를 발생시킨 파라미터입니다.');
			console.error(JSON.stringify(params, TO_DELETE, 4));
		}
	};
	
	let CHECK_IS_DATA = (target) => {
		//OPTIONAL: target

		if (
		target !== undefined &&
		target !== TO_DELETE &&
		CHECK_IS_ARRAY(target) !== true &&
		target instanceof Date !== true &&
		target instanceof RegExp !== true &&
		typeof target === 'object') {
			return true;
		}

		return false;
	};
	
	let CHECK_IS_ARRAY = (target) => {
		//OPTIONAL: target

		if (
		target !== undefined &&
		target !== TO_DELETE &&
		typeof target === 'object' &&
		Object.prototype.toString.call(target) === '[object Array]') {
			return true;
		}

		return false;
	};
	
	let EACH = (dataOrArrayOrString, func) => {
		//OPTIONAL: dataOrArrayOrString
		//REQUIRED: func
		
		if (dataOrArrayOrString === undefined) {
			return false;
		}

		// when dataOrArrayOrString is data
		else if (CHECK_IS_DATA(dataOrArrayOrString) === true) {

			for (let name in dataOrArrayOrString) {
				if (dataOrArrayOrString.hasOwnProperty === undefined || dataOrArrayOrString.hasOwnProperty(name) === true) {
					if (func(dataOrArrayOrString[name], name) === false) {
						return false;
					}
				}
			}
		}

		// when dataOrArrayOrString is func
		else if (func === undefined) {

			func = dataOrArrayOrString;
			dataOrArrayOrString = undefined;

			return (dataOrArrayOrString) => {
				return EACH(dataOrArrayOrString, func);
			};
		}

		// when dataOrArrayOrString is array or string
		else {

			let length = dataOrArrayOrString.length;

			for (let i = 0; i < length; i += 1) {

				if (func(dataOrArrayOrString[i], i) === false) {
					return false;
				}

				// when shrink
				if (dataOrArrayOrString.length < length) {
					i -= length - dataOrArrayOrString.length;
					length -= length - dataOrArrayOrString.length;
				}

				// when stretch
				else if (dataOrArrayOrString.length > length) {
					length += dataOrArrayOrString.length - length;
				}
			}
		}

		return true;
	};
	
	let STRINGIFY = (data) => {
		//REQUIRED: data
		
		if (CHECK_IS_DATA(data) === true) {
			return JSON.stringify(PACK_DATA(data));
		}
		
		else if (CHECK_IS_ARRAY(data) === true) {
			
			let f = (array) => {
				
				let newArray = [];
				
				EACH(array, (data) => {
					if (CHECK_IS_DATA(data) === true) {
						newArray.push(PACK_DATA(data));
					} else if (CHECK_IS_ARRAY(data) === true) {
						newArray.push(f(data));
					} else {
						newArray.push(data);
					}
				});
				
				return newArray;
			};
			
			return JSON.stringify(f(data));
		}
		
		else {
			return JSON.stringify(data);
		}
	};
	
	window.DPlayInventory = (() => {
		let self = {};
		
		let contracts = {};
		let methodMap = {};
		
		// 이더리움 네트워크 이름을 가져옵니다.
		let getNetworkName = self.getNetworkName = (callback) => {
			//REQUIRED: callback
			
			web3.version.getNetwork((error, networkId) => {
				
				if (networkId === '1') {
					callback('Mainnet');
				} else if (networkId === '3') {
					callback('Ropsten');
				} else if (networkId === '4') {
					callback('Rinkeby');
				} else if (networkId === '42') {
					callback('Kovan');
				} else {
					callback('Unknown');
				}
			});
		};
		
		// 이더리움 네트워크를 변경합니다.
		let changeNetwork = self.changeNetwork = (networkName, callback) => {
			//REQUIRED: networkName
			//REQUIRED: callback
			
			// 네트워크 변경 안내 띄우기
			//TODO:
			alert('메타 마스크를 열어 네트워크를 ' + networkName + '로 변경해주시기 바랍니다.');
		};
		
		// 보관함에 로그인합니다.
		let login = self.login = (callback) => {
			//OPTIONAL: callback
			
			ethereum.enable().then(() => {
				if (callback !== undefined) {
					callback();
				}
			});
		};
		
		// 계정의 ID를 가져옵니다.
		let getAccountId = self.getAccountId = (callback) => {
			//REQUIRED: callback
			
			web3.eth.getAccounts((error, accounts) => {
				callback(accounts[0] !== undefined ? web3.toChecksumAddress(accounts[0]) : undefined);
			});
		};
		
		// 문자열에 서명합니다.
		let signText = self.signText = (text, callbackOrHandlers) => {
			//REQUIRED: text
			//REQUIRED: callbackOrHandlers
			//OPTIONAL: callbackOrHandlers.error
			//REQUIRED: callbackOrHandlers.success
			
			let errorHandler;
			let callback;
			
			if (CHECK_IS_DATA(callbackOrHandlers) !== true) {
				callback = callbackOrHandlers;
			} else {
				errorHandler = callbackOrHandlers.error;
				callback = callbackOrHandlers.success;
			}
			
			getAccountId((accountId) => {
				
				web3.personal.sign(text, accountId.toLowerCase(), (error, hash) => {
					
					// 오류 발생
					if (error !== TO_DELETE) {
						if (errorHandler === undefined) {
							SHOW_ERROR('DPlayInventory.sign (web3.js polyfill)', error.toString(), text);
						} else {
							errorHandler(error.toString());
						}
					}
					
					else {
						callback(hash);
					}
				});
			});
		};
		
		let signData = self.signData = (data, callbackOrHandlers) => {
			//REQUIRED: data
			//REQUIRED: callbackOrHandlers
			//OPTIONAL: callbackOrHandlers.error
			//REQUIRED: callbackOrHandlers.success
			
			let sortedData = {};
			Object.keys(data).sort().forEach((key) => {
				sortedData[key] = data[key];
			});
			
			signText(STRINGIFY(sortedData), callbackOrHandlers);
		};
		
		// 계정의 이더 잔고를 가져옵니다.
		let getEtherBalance = self.getEtherBalance = (callbackOrHandlers) => {
			//REQUIRED: callbackOrHandlers
			//OPTIONAL: callbackOrHandlers.error
			//REQUIRED: callbackOrHandlers.success
			
			let errorHandler;
			let callback;
			
			if (CHECK_IS_DATA(callbackOrHandlers) !== true) {
				callback = callbackOrHandlers;
			} else {
				errorHandler = callbackOrHandlers.error;
				callback = callbackOrHandlers.success;
			}
			
			getAccountId((accountId) => {
				
				web3.eth.getBalance(accountId, (error, balanceBN) => {
					
					// 오류 발생
					if (error !== TO_DELETE) {
						if (errorHandler === undefined) {
							SHOW_ERROR('DPlayInventory.getEtherBalance (web3.js polyfill)', error.toString());
						} else {
							errorHandler(error.toString());
						}
					}
					
					else {
						callback(web3.fromWei(balanceBN.toNumber(), 'ether'));
					}
				});
			});
		};
		
		// 스마트 계약을 배포합니다.
		let deploySmartContract = self.deploySmartContract = () => {
			//TODO:
		};
		
		// DPlay 보관함의 스킨을 변경합니다.
		let changeInventorySkin = self.changeInventorySkin = () => {
			//TODO:
		};
		
		let addChangeNetworkHandler = self.addChangeNetworkHandler = (changeNetworkHandler) => {
			//REQUIRED: changeNetworkHandler
			
			ethereum.on('networkChanged', () => {
				changeNetworkHandler();
			});
		};
		
		let addChangeAccountHandler = self.addChangeAccountHandler = (changeAccountHandler) => {
			//REQUIRED: changeAccountHandler
			
			ethereum.on('accountsChanged', (accounts) => {
				changeAccountHandler(accounts[0]);
			});
		};
		
		// 스마트 계약 인터페이스를 생성합니다.
		let createSmartContractInterface = self.createSmartContractInterface = (params, callback) => {
			//REQUIRED: params
			//REQUIRED: params.abi
			//REQUIRED: params.address
			//OPTIONAL: params.onEvent
			//REQUIRED: callback
			
			let abi = params.abi;
			let address = params.address;
			let onEvent = params.onEvent;
			
			let contract = contracts[address] = web3.eth.contract(abi).at(address);
			
			if (onEvent !== undefined) {
				
				// 계약의 이벤트 핸들링
				contract.allEvents((error, info) => {
					if (error === TO_DELETE) {
						
						let args = info.args;
						
						EACH(info.args, (value, name) => {
							
							// 숫자인 경우
							if (value.toNumber !== undefined) {
								args[name] = value.toNumber();
							}
						});
						
						onEvent(info.event, args);
					}
				});
			}
			
			let methods = methodMap[address] = {};
			
			// 메소드 분석 및 생성
			EACH(abi, (methodInfo) => {
				if (methodInfo.type === 'function') {
					methods[methodInfo.name] = methodInfo;
				}
			});
			
			callback();
		};
		
		// 트랜잭션이 완료될 때 까지 확인합니다.
		let watchTransaction = self.watchTransaction = (transactionHash, callbackOrHandlers) => {
			//REQUIRED: transactionHash
			//REQUIRED: callbackOrHandlers
			//OPTIONAL: callbackOrHandlers.error
			//REQUIRED: callbackOrHandlers.success
			
			let callback;
			let errorHandler;
			
			// 콜백 정리
			if (CHECK_IS_DATA(callbackOrHandlers) !== true) {
				callback = callbackOrHandlers;
			} else {
				callback = callbackOrHandlers.success;
				errorHandler = callbackOrHandlers.error;
			}
			
			let retry = RAR(() => {
				
				web3.eth.getTransactionReceipt(transactionHash, (error, result) => {
					
					// 트랜잭선 오류 발생
					if (error !== TO_DELETE) {
						if (errorHandler !== undefined) {
							errorHandler(error.toString());
						} else {
							SHOW_ERROR(methodInfo.name, error.toString(), params);
						}
					}
					
					// 아무런 값이 없으면 재시도
					else if (result === TO_DELETE || result.blockHash === TO_DELETE) {
						retry();
					}
					
					// 트랜잭션 완료
					else {
						callback();
					}
				});
			});
		};
		
		// 결과를 정돈합니다.
		let cleanResult = (outputs, result) => {
			
			// output이 없는 경우
			if (outputs.length === 0) {
				return undefined;
			}
			
			// output이 1개인 경우
			else if (outputs.length === 1) {
				
				let type = outputs[0].type;
				
				// 숫자인 경우
				if (result.toNumber !== undefined) {
					return {
						value : result.toNumber(),
						str : result.toString(10)
					};
				}
				
				// 배열인 경우
				else if (type.substring(type.length - 2) === '[]') {
					
					let array = [];
					let strArray = [];
					EACH(result, (value, i) => {
						
						// 숫자인 경우
						if (value.toNumber !== undefined) {
							array.push(value.toNumber());
							strArray.push(value.toString(10));
						}
						
						// 주소인 경우
						else if (type.substring(0, type.length - 2) === 'address') {
							array.push(web3.toChecksumAddress(value));
							strArray.push(String(value));
						}
						
						// 기타
						else {
							array.push(value);
							strArray.push(String(value));
						}
					});
					
					return {
						value : array,
						str : strArray
					};
				}
				
				// 주소인 경우
				else if (type === 'address') {
					return {
						value : web3.toChecksumAddress(result),
						str : String(result)
					};
				}
				
				// 기타
				else {
					return {
						value : result,
						str : String(result)
					};
				}
			}
			
			// output이 여러개인 경우
			else if (outputs.length > 1) {
				
				let resultArray = [];
				
				EACH(outputs, (output, i) => {
					
					let type = output.type;
					
					// 숫자인 경우
					if (result[i].toNumber !== undefined) {
						resultArray.push(result[i].toNumber());
					}
					
					// 배열인 경우
					else if (type.substring(type.length - 2) === '[]') {
						
						let array = [];
						EACH(result[i], (value, j) => {
							
							// 숫자인 경우
							if (value.toNumber !== undefined) {
								array.push(value.toNumber());
							}
							
							// 주소인 경우
							else if (type.substring(0, type.length - 2) === 'address') {
								array.push(web3.toChecksumAddress(value));
							}
							
							// 기타
							else {
								array.push(value);
							}
						});
						
						resultArray.push(array);
					}
					
					// 주소인 경우
					else if (type === 'address') {
						resultArray.push(web3.toChecksumAddress(result[i]));
					}
					
					// 기타
					else {
						resultArray.push(result[i]);
					}
				});
				
				EACH(outputs, (output, i) => {
					
					let type = output.type;
					
					// 숫자인 경우
					if (result[i].toNumber !== undefined) {
						resultArray.push(result[i].toString(10));
					}
					
					// 배열인 경우
					else if (type.substring(type.length - 2) === '[]') {
						
						let strArray = [];
						EACH(result[i], (value, j) => {
							
							// 숫자인 경우
							if (value.toNumber !== undefined) {
								strArray.push(value.toString(10));
							}
							
							// 기타
							else {
								strArray.push(String(value));
							}
						});
						
						resultArray.push(strArray);
					}
					
					// 주소인 경우
					else if (type === 'address') {
						resultArray.push(web3.toChecksumAddress(result[i]));
					}
					
					// 기타
					else {
						resultArray.push(String(result[i]));
					}
				});
				
				return {
					array : resultArray
				};
			}
		};
		
		// 스마트 계약의 메소드를 실행합니다.
		let runSmartContractMethod = self.runSmartContractMethod = (_params, callbackOrHandlers) => {
			//REQUIRED: params
			//REQUIRED: params.address
			//REQUIRED: params.methodName
			//REQUIRED: params.params
			//REQUIRED: callbackOrHandlers
			//OPTIONAL: callbackOrHandlers.error
			//REQUIRED: callbackOrHandlers.success
			
			let address = _params.address;
			let methodName = _params.methodName;
			let params = _params.params;
			
			let errorHandler;
			let transactionHashCallback;
			let callback;
			
			if (CHECK_IS_DATA(callbackOrHandlers) !== true) {
				callback = callbackOrHandlers;
			} else {
				errorHandler = callbackOrHandlers.error;
				transactionHashCallback = callbackOrHandlers.transactionHash;
				callback = callbackOrHandlers.success;
			}
			
			let contract = contracts[address];
			let methods = methodMap[address];
			
			if (contract !== undefined && methods !== undefined) {
				
				let methodInfo = methods[methodName];
				
				let args = [];
				
				// 파라미터가 없거나 1개인 경우
				if (methodInfo.payable !== true && methodInfo.inputs.length <= 1) {
					args.push(params);
				}
				
				// 파라미터가 여러개인 경우
				else {
					
					let paramsArray = [];
					EACH(params, (param) => {
						paramsArray.push(param);
					});
					
					EACH(methodInfo.inputs, (input, i) => {
						if (input.name !== '') {
							args.push(params[input.name]);
						} else {
							args.push(paramsArray[i]);
						}
					});
				}
				
				// 이더 추가
				if (methodInfo.payable === true) {
					args.push({
						value : web3.toWei(params.ether, 'ether')
					});
				}
				
				// 콜백 추가
				args.push((error, result) => {
					
					// 계약 실행 오류 발생
					if (error !== TO_DELETE) {
						if (errorHandler !== undefined) {
							errorHandler(JSON.stringify(error));
						} else {
							SHOW_ERROR(methodInfo.name, JSON.stringify(error), params);
						}
					}
					
					// 정상 작동
					else {
						
						// constant 함수인 경우
						if (methodInfo.constant === true) {
							
							if (callback !== undefined) {
								
								// output이 없는 경우
								if (methodInfo.outputs.length === 0) {
									callback();
								}
								
								// output이 1개인 경우
								else if (methodInfo.outputs.length === 1) {
									result = cleanResult(methodInfo.outputs, result);
									callback(result.value, result.str);
								}
								
								// output이 여러개인 경우
								else if (methodInfo.outputs.length > 1) {
									result = cleanResult(methodInfo.outputs, result);
									callback.apply(TO_DELETE, result.array);
								}
							}
						}
						
						// 트랜잭션이 필요한 함수인 경우
						else {
							
							if (transactionHashCallback !== undefined) {
								transactionHashCallback(result);
							}
							
							if (callback !== undefined) {
								watchTransaction(result, {
									error : errorHandler,
									success : callback
								});
							}
						}
					}
				});
				
				let run = () => {
					contract[methodInfo.name].apply(contract, args);
				};
				
				// 트랜잭션이 필요한 함수인 경우, 지갑이 잠겨있다면 지갑을 사용 가능하게 합니다.
				if (methodInfo.constant !== true) {
					
					getAccountId((accountId) => {
						if (accountId === undefined) {
							login(run);
						} else {
							run();
						}
					});
				}
				
				else {
					run();
				}
			}
		};
		
		return self;
	})();
}