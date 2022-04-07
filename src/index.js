//below block gets oracle of current price of matic and eth (see Chainlink Data Feeds) 
const aggregatorV3InterfaceABI = [
	{
		inputs: [],
		name: "decimals",
		outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "description",
		outputs: [{ internalType: "string", name: "", type: "string" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [{ internalType: "uint80", name: "_roundId", type: "uint80" }],
		name: "getRoundData",
		outputs: [
			{ internalType: "uint80", name: "roundId", type: "uint80" },
			{ internalType: "int256", name: "answer", type: "int256" },
			{ internalType: "uint256", name: "startedAt", type: "uint256" },
			{ internalType: "uint256", name: "updatedAt", type: "uint256" },
			{ internalType: "uint80", name: "answeredInRound", type: "uint80" },
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "latestRoundData",
		outputs: [
			{ internalType: "uint80", name: "roundId", type: "uint80" },
			{ internalType: "int256", name: "answer", type: "int256" },
			{ internalType: "uint256", name: "startedAt", type: "uint256" },
			{ internalType: "uint256", name: "updatedAt", type: "uint256" },
			{ internalType: "uint80", name: "answeredInRound", type: "uint80" },
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "version",
		outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
];

let priceMatic, priceEth;

//WHEN ON POLYGON MUMBAI
//current mainnet matic price
const rpcURL = "https://rpc-mainnet.maticvigil.com/v1/6d15630b7453696102ad39f4b6fbf678ec4244be"; //polygon mainnet
const web3a = new Web3(rpcURL);
const addr = "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0"; //matic/usd
const priceMain = new web3a.eth.Contract(aggregatorV3InterfaceABI, addr);
priceMain.methods.latestRoundData().call().then((roundData) => {
	priceMatic = roundData[1] / 100000000;
	console.log("Current Matic Price: " + roundData[1] / 100000000);
});

//current mumbai matic price
const rpcURL2 = "https://rpc-mumbai.maticvigil.com/v1/6d15630b7453696102ad39f4b6fbf678ec4244be"; //polygon mumbai
const web3 = new Web3(rpcURL2);
const addr2 = "0x0715A7794a1dc8e42615F059dD6e406A6594651A";
const priceMumbai = new web3.eth.Contract(aggregatorV3InterfaceABI, addr2);
priceMumbai.methods.latestRoundData().call().then((roundData) => {
	priceEth = roundData[1] / 100000000; //one matic = this many dollars
	console.log("Current Eth Price: " + roundData[1] / 100000000);
});

//address of the contract we're connecting to
const contract_address = "0x0e64ffd67dAbdB17A451D6838Cbe8aC77a95856c";

//create an instance of the contract
const contract = new web3.eth.Contract(contractABI, contract_address);
const ipfs_gateway = "https://blocklagoon.mypinata.cloud/ipfs/";

let sourceFiles1 = [], sourceFiles2 = [], sourceFiles3 = [];
let info1 = [], info2 = [], info3 = [];
let vrFiles = [];
let sourceArt1 = [];
let theJSONs1 = [], theJSONs2 = [], theJSONs3 = [];
let jsonArray1 = [[], [], [], [], [], [], [], [], [], []],
	jsonArray2 = [[], [], [], [], [], [], [], [], [], []],
	jsonArray3 = [[], [], [], [], [], [], [], [], [], []];
let tokenStats1 = [], tokenStats2 = [], tokenStats3 = [];
let txHashes1 = [], txHashes2 = [], txHashes3 = [];
let soundArray = [];
let videoArray = [];
let soldArray = [], soldArray2 = [];
let theType;

$(document).ready(function () {
	$("#videoElementID").bind("contextmenu", function () {
		return false;
	});
});

//create an IPFS instance
let myCreate1 = createIpfs((resolve, reject) => {
	resolve("success");
});

function pageNFT(category, myJSON, myStats) {
	contract.methods.getTokens(category).call(function (error, result) {
		if (!error) {
			contract.methods.getSold().call(function (error, result2) {
				if (!error) {
					let array1 = [],
						array2 = [],
						seriesArray = [],
						namesArray = [];
					let firstArray = result.split("||");
					for (let i = 0; i < firstArray.length; i++) {
						let secondArray = firstArray[i].split("|");
						array1.push(secondArray[3] + "|" + secondArray[0] + "|" + secondArray[2] + "|" + secondArray[1]);
						namesArray.push(secondArray[1]); //nft name
					}

					//remove any possible dups in result2 - reason: secondary sales could create a dup
					let soldIDs = [...new Set(result2)];
					soldArray = soldIDs; //global array (soldArray) = sold nfts

					//an array of unique nft names - remove dups
					let uniqueNames = [...new Set(namesArray)];

					//get all 1/1 nfts (sold or not) and put em in array2
					for (let xx = 0; xx < array1.length; xx++) {
						let q = array1[xx].indexOf("|");
						let q2 = array1[xx].indexOf("|", q + 1);
						let q3 = array1[xx].indexOf("|", q2 + 1); //third pipe

						if (array1[xx].substr(q2 + 1, q3 - (q2 + 1)) == "1/1") {
							array2.push(array1[xx]);
						} else {
							seriesArray.push(array1[xx]);
						}
					}

					//get any nfts that are part of a series  ie  are not 1/1
					let array3 = [];
					for (let y = 0; y < seriesArray.length; y++) {
						let q = seriesArray[y].indexOf("|"); //gets first pipe
						let q2 = seriesArray[y].indexOf("|", q + 1); //gets second pipe
						let bx = seriesArray[y].substr(q2 + 1, seriesArray[y].length - q2); //the edition eg. '1/2'
						let gx = seriesArray[y].substr(0, q); //gets the token id

						//remove sold nfts from seriesArray and put result into array3
						if (soldIDs.includes(gx) == false) {
							//if the token id is not found in sold array
							//not found means it can be possible added to array2
							//add to a new array which contains array 2 candidates
							array3.push(seriesArray[y]);
						}
					}

					//for each series add the lowest unsold edition
					for (let kk = 0; kk < uniqueNames.length; kk++) {
						let lowt = 10000;
						let addem = "";
						for (let k = 0; k < array3.length; k++) {
							let q = array3[k].indexOf("|");
							let q2 = array3[k].indexOf("|", q + 1);
							let q3 = array3[k].indexOf("|", q2 + 1);
							let q4 = array3[k].indexOf("|", q3 + 1);
							let bx = array3[k].substring(q3 + 1, array3[k].length - q3); //the edition eg. '1/2'
							let gx = array3[k].substring(q2 + 1, 3);

							if (bx == uniqueNames[kk] && gx.substring(0, gx.indexOf("/")) < lowt) {
								lowt = gx.substring(0, gx.indexOf("/"));
								addem = uniqueNames[kk];
							} else {
								lowt = lowt;
							}
						}

						for (let w = 0; w < array3.length; w++) {
							let q = array3[w].indexOf("|");
							let q2 = array3[w].indexOf("|", q + 1);
							let bx = array3[w].substr(q2 + 1, 3); //the edition eg. '1/2'
							let gx = bx.substring(0, bx.indexOf("/"));

							if (array3[w].includes(addem) && array3[w].includes(lowt + "/")) {
								array2.push(array3[w]);
							}
						}
					}

					//add to myJSON
					for (let x = 0; x < array2.length; x++) {
						let b = array2[x].indexOf("|");
						let b2 = array2[x].indexOf("|", b + 1);
						let b3;
						if (array2[x].substring(9, b2).includes("/")) {
							b3 = array2[x].substring(10, 56);
						} else {
							b3 = array2[x].substring(9, b2);
						}

						myJSON.push(b3);
						for (let b = 0; b < firstArray.length; b++) {
							if (firstArray[b].includes(array2[x].substring(9, b2))) {
								myStats.push(firstArray[b]);
							}
						}
					}
					setNFT(category);
				} else {
					console.log(error);
				}
			});
		} else {
			console.log(error);
		}
	});
}

pageNFT(3, theJSONs3, tokenStats3);
pageNFT(2, theJSONs2, tokenStats2);
pageNFT(1, theJSONs1, tokenStats1);

function setNFT(theCat) {
	myCreate1.then((value) => {
		if (theCat == 3) {
			let myIndex3 = 0;
			for (let v = 0; v < theJSONs3.length; v++) {
				let getCID3 = get_metadata(value, theJSONs3[v], (resolve, reject) => {
					resolve("Success");
				});
				getCID3.then((value) => {
					let one = value.Image.indexOf("Qm");
					let meeko = one + 46;
					if (value.Watermark == "no watermarked image") {
						sourceFiles3.push(ipfs_gateway + value.Image.substring(one, meeko));
					} else {
						sourceFiles3.push(ipfs_gateway + value.Watermark.substring(one, meeko));
					}
					info3.push(ipfs_gateway + value.Copyright.substring(one, meeko));
					jsonArray3[myIndex3][0] = value.Name; //Name of the nft
					jsonArray3[myIndex3][1] = value.Description;
					jsonArray3[myIndex3][2] = value.Created;
					jsonArray3[myIndex3][3] = value.Creator;
					jsonArray3[myIndex3][4] = value.Copyright;
					jsonArray3[myIndex3][5] = value.Edition;

					myIndex3++;
				});
			}
		} else if (theCat == 2) {
			let myIndex2 = 0;
			for (let z = 0; z < theJSONs2.length; z++) {
				let getCID2 = get_metadata(value, theJSONs2[z], (resolve, reject) => {
					resolve("Success");
				});
				getCID2.then((value) => {
					let one = value.Image.indexOf("Qm");
					let meeko = one + 46;

					sourceFiles2.push(ipfs_gateway + value.Image.substring(one, meeko));
					info2.push(ipfs_gateway + value.Copyright.substring(one, meeko));

					//get the vr file
					if (value.Name.includes("-vr") == true) {
						vrFiles.push(ipfs_gateway + value.Artwork.substring(one, meeko));
					} else {
						vrFiles.push("plug");
					}
					jsonArray2[myIndex2][0] = value.Name; //Name of the NFT
					jsonArray2[myIndex2][1] = value.Description;
					jsonArray2[myIndex2][2] = value.Created;
					jsonArray2[myIndex2][3] = value.Creator;
					jsonArray2[myIndex2][4] = value.Copyright;
					jsonArray2[myIndex2][5] = value.Edition;
					myIndex2++;
				});
			}
		} else if (theCat == 1) {
			let myIndex1 = 0;
			for (let q = 0; q < theJSONs1.length; q++) {
				let getCID1 = get_metadata(value, theJSONs1[q], (resolve, reject) => {
					//resolve('Success');
				});
				getCID1.then((value) => {
					let one = value.Image.indexOf("Qm");
					let meeko = one + 46;
					sourceFiles1.push(ipfs_gateway + value.Animation.substring(one, meeko));
					info1.push(ipfs_gateway + value.Copyright.substring(one, meeko));
					sourceArt1.push(ipfs_gateway + value.Artwork.substring(one, meeko));
					jsonArray1[myIndex1][0] = value.Name; //Name of the NFT
					jsonArray1[myIndex1][1] = value.Description;
					jsonArray1[myIndex1][2] = value.Created;
					jsonArray1[myIndex1][3] = value.Creator;
					jsonArray1[myIndex1][4] = value.Copyright;
					jsonArray1[myIndex1][5] = value.Edition;
					myIndex1++;
				});
			}
		}
	});
}

let isBought;
//create html elements on the fly based on number of nfts in smart contract
function openNFT(evt, NFTname) {
	//set for use outside of this function
	theType = NFTname;

	//configure the tab control at top of page
	let p, tabcontent, tablinks;
	tabcontent = document.getElementsByClassName("tabcontent");
	for (p = 0; p < tabcontent.length; p++) {
		tabcontent[p].style.display = "none";
	}
	tablinks = document.getElementsByClassName("tablinks");
	for (g = 0; g < tablinks.length; g++) {
		tablinks[g].className = tablinks[g].className.replace(" active", "");
	}
	document.getElementById(NFTname).style.display = "block";
	evt.currentTarget.className += " active";

	//remove all the divs
	$(".myaudio").remove();
	$(".myvideo").remove();
	$(".myimage").remove();

	//set let for number of NFTs in selected category
	//and create an array of txHashes for each category
	let once;
	if (NFTname == 1) {
		once = theJSONs1.length;
		for (let z = 0; z < once; z++) {
			let res = tokenStats1[z].split("|");

			txHashes1.push(res[5]);
		}
	} else if (NFTname == 2) {
		once = theJSONs2.length;
		for (let k = 0; k < once; k++) {
			let res2 = tokenStats2[k].split("|");
			txHashes2.push(res2[5]);
		}
	} else if (NFTname == 3) {
		once = theJSONs3.length;
		for (let m = 0; m < once; m++) {
			let res3 = tokenStats3[m].split("|");
			txHashes3.push(res3[5]);
		}
	}

	let myID;
	for (let i = 0; i < once; i++) {
		//paragraph tag for metadata excluding the description on front page
		let s1, s1a, s2, s2a, s3, s3a, s4, s4a, s5, s5a, s6, s6a;
		let span1, span1a, span2, span2a, span3, span3a, span4, span4a, span5, span5a, span6, span6a;
		let pFront = document.createElement("p");

		//paragraph tag for description/artist metadata on the back page
		let s7, s8, s9, s10, span7, span8, span9, span10;
		let pBack1 = document.createElement("p");
		let pBack2 = document.createElement("p");
		let frontDiv = document.createElement("div");
		let backDiv = document.createElement("div");
		if (NFTname == 1) {
			//create div that will contain audio control
			let div = document.createElement("div");
			div.className = "myaudio";

			//add audio div to document
			document.getElementById("masterdiv").appendChild(div);

			//create container div and append it to outer div
			let innerDiv = document.createElement("div");
			innerDiv.className = "flip-card-inner";
			myFlip = "flip" + i;
			innerDiv.id = myFlip;
			div.appendChild(innerDiv);

			//now create the flip-card-front div
			myID = "image" + i;
			frontDiv.id = myID;
			frontDiv.className = "flip-card-front";
			innerDiv.appendChild(frontDiv);

			//create a div to contain audio controls
			let controlsDiv = document.createElement("div");
			controlsDiv.className = "audcontrols";
			frontDiv.appendChild(controlsDiv);

			//create the create back-card-div
			backDiv.className = "flip-card-back";
			innerDiv.appendChild(backDiv);

			soundArray.push(document.createElement("audio"));
			soundArray[i].id = "sound" + i;
			//sound.type = 'audio/wav';
			soundArray[i].src = sourceFiles1[i];
			soundArray[i].crossOrigin = "anonymous";

			let res = tokenStats1[i].split("|");

			//add the active playing animated gif
			let playing_img = document.createElement("img");
			playing_img.className = "playinglogo";
			playing_img.id = "playing" + i;
			playing_img.src = ipfs_gateway + "QmPK4Xu3W73GCwWTPuDA6bKpMhRex31wn2WtzNsJfkx99u";
			frontDiv.appendChild(playing_img);

			//add the audio PLAY control
			let controls_play = document.createElement("img");
			controls_play.id = i;
			controls_play.className = "audcontrolsplaybtn";
			controls_play.src = ipfs_gateway + "QmTwRbUHFkpqWmhSa4tCDMpjxhNznGMk8sB2yLxHyJaenW";
			controls_play.addEventListener("click", controlPlay, true);
			function controlPlay(e) {
				console.log(this.id);
				soundArray[this.id].play();
				document.getElementById("playing" + this.id).style.visibility = "visible";
			}

			//add the audio PAUSE control
			let controls_pause = document.createElement("img");
			controls_pause.id = i;
			controls_pause.className = "audcontrolspausebtn";
			controls_pause.src = ipfs_gateway + "QmZA3xRYTS6WELBDhdQwA2B6AN7RTndS46Qik4946PkKpo";
			controls_pause.addEventListener("click", controlPause, true);
			function controlPause(e) {
				soundArray[this.id].pause();
				document.getElementById("playing" + this.id).style.visibility = "hidden";
			}

			//add sound sound element and sound controls to frontdiv
			frontDiv.appendChild(soundArray[i]);
			frontDiv.appendChild(controls_play);
			frontDiv.appendChild(controls_pause);

			//create the copyright logo image element
			let copyright_img = document.createElement("img");
			crID = "copyright" + i;
			copyright_img.id = crID;
			copyright_img.className = "audcopyrightlogo";
			copyright_img.src = ipfs_gateway + "QmbvfGfgiEUo3jVZrTDHNRBzXpUy8hgceLokeyTgY6Tp2Z";

			//create the info image element
			let info_img = document.createElement("img");
			cpID = "info" + i;
			info_img.id = cpID;
			info_img.className = "audinfologo";
			info_img.src = ipfs_gateway + "QmXwWzbs6vsi2qLecmGBSr6fMawwnsJmhHxH4fjtFKra5n";
			info_img.addEventListener("click", myInfo, false);

			//create the buy dollar image element
			let buy_img = document.createElement("img");
			buyID = "buy" + res[3];
			buy_img.id = buyID;
			buy_img.className = "audbuylogo";
			buy_img.src = ipfs_gateway + "QmPyUWM9xUcZDTWoqS6eiJamMpAUGJE4kz4hUMXbdXVDFY";
			buy_img.addEventListener("click", buyNFT, false);

			//add elements to front div
			frontDiv.appendChild(info_img);
			frontDiv.appendChild(buy_img);
			frontDiv.appendChild(copyright_img);
			//call async functions that populates the front and back with content
			let theJson = "jsonArray1";
			let myIndex = parseInt(res[3]); //+ 1;
			setPages(i, myIndex, pFront, pBack1, jsonArray1, theJson.substring(theJson.length - 1));

			//create and add 'See Back' button on frontDiv
			let back_btn1 = document.createElement("button");
			backID = "back" + i;
			back_btn1.id = backID;
			back_btn1.className = "audioseebackbtn";
			back_btn1.innerHTML = "See Back";
			back_btn1.addEventListener("click", flipfront, false);
			frontDiv.appendChild(back_btn1);

			//create and add See Front button on backDiv
			let btn2 = document.createElement("button");
			btnID = "btn" + i;
			btn2.id = btnID;
			btn2.className = "audioseefrontbtn";
			btn2.addEventListener("click", flipback, false);
			btn2.innerHTML = "See Front";
			backDiv.appendChild(btn2);

			//create and add Verify button on frontDiv
			let vrf1 = document.createElement("button");
			vrfID = "vrf" + i;
			vrf1.id = btnID;
			vrf1.className = "imageverifybtn";
			vrf1.addEventListener("click", txHash1, false);
			vrf1.innerHTML = "Verify NFT";
			backDiv.appendChild(vrf1);

			drawArt(i, myID);

			//insert image of the metadata on the backpage
			let ipfs_img = document.createElement("img");
			ipfs_img.className = "ipfsimage";
			ipfs_img.src = ipfs_gateway + "QmUpbn8hnTAt6LxS1LQ32bdsy3qfFZfjf8K6CsqXHjN2Yu";
			backDiv.appendChild(ipfs_img);
		} else if (NFTname == 2) {
			//create div that will contain video control
			let div = document.createElement("div");
			div.className = "myvideo";
			div.id = "myvideo" + i;

			//add audio div to document
			document.getElementById("masterdiv").appendChild(div);

			//create inner div and append it to outer div
			let innerDiv = document.createElement("div");
			innerDiv.className = "flip-card-inner";
			myFlip = "flip" + i;
			innerDiv.id = myFlip;
			div.appendChild(innerDiv);

			//now create the flip-card-front div
			myID = "image" + i;
			frontDiv.id = myID;
			frontDiv.className = "flip-card-front";
			innerDiv.appendChild(frontDiv);

			//create a div to contain video controls
			let controlsDiv = document.createElement("div");
			controlsDiv.className = "vidcontrols";
			frontDiv.appendChild(controlsDiv);

			//create the create back-card-div
			backDiv.className = "flip-card-back";
			innerDiv.appendChild(backDiv);

			//add video div to document
			videoArray.push(document.createElement("VIDEO"));
			videoArray[i].id = "video" + i;
			videoArray[i].className = "embedvid";
			videoArray[i].controlsList = "nodownload";
			videoArray[i].loop = "true;";
			if (videoArray[i].canPlayType("video/mp4")) {
				videoArray[i].setAttribute("src", sourceFiles2[i]);
			} else {
				videoArray[i].setAttribute("src", "movie.ogg");
			}
			let res = tokenStats2[i].split("|");
			let isVR = jsonArray2[i][0] + " [" + res[3] + "]";

			//create and add zoom image button
			let vid_expand = document.createElement("img");
			exID = "vidx" + i;
			vid_expand.id = exID;
			vid_expand.className = "videozoombtn";
			vid_expand.alt = "";

			//add zoom or 3d icon
			if (isVR.includes("-vr") == true) {
				vid_expand.src = ipfs_gateway + "QmZboS7Jj1oALtRUrMpWmzhfdk2qSDpUG6V2JRyH19BvkC";
			} else {
				vid_expand.src = ipfs_gateway + "Qma8iwJUrWC7eG5BUs2awcPEA1UJ2DtfnqWxJrTn99VahL";
			}

			vid_expand.addEventListener("click", myVideo2, false);
			frontDiv.appendChild(vid_expand);

			//add the video PLAY control
			let video_play = document.createElement("img");
			video_play.id = i;
			video_play.className = "vidcontrolsplaybtn";
			video_play.src = ipfs_gateway + "QmTwRbUHFkpqWmhSa4tCDMpjxhNznGMk8sB2yLxHyJaenW";
			video_play.addEventListener("click", videoPlay, true);
			function videoPlay(e) {
				videoArray[this.id].play();
			}

			//add the video PAUSE control
			let video_pause = document.createElement("img");
			video_pause.id = i;
			video_pause.className = "vidcontrolspausebtn";
			video_pause.src = ipfs_gateway + "QmZA3xRYTS6WELBDhdQwA2B6AN7RTndS46Qik4946PkKpo";
			video_pause.addEventListener("click", videoPause, true);
			function videoPause(e) {
				videoArray[this.id].pause();
			}

			//add video element and video controls to frontdiv
			frontDiv.appendChild(videoArray[i]);
			frontDiv.appendChild(video_play);
			frontDiv.appendChild(video_pause);

			//create the copyright logo image element
			let copyright_img2 = document.createElement("img");
			crID = "copyright" + i;
			copyright_img2.id = crID;
			copyright_img2.className = "vidcopyrightlogo";
			copyright_img2.src = ipfs_gateway + "QmbvfGfgiEUo3jVZrTDHNRBzXpUy8hgceLokeyTgY6Tp2Z";

			//create the info image element
			let info_img2 = document.createElement("img");
			cpID = "info" + i;
			info_img2.id = cpID;
			info_img2.className = "vidinfologo";
			info_img2.src = ipfs_gateway + "QmXwWzbs6vsi2qLecmGBSr6fMawwnsJmhHxH4fjtFKra5n";
			info_img2.addEventListener("click", myInfo, false);

			//create the buy dollar image element
			let buy_img2 = document.createElement("img");
			buyID = "buy" + res[3];
			buy_img2.id = buyID;
			buy_img2.className = "vidbuylogo";
			buy_img2.src = ipfs_gateway + "QmPyUWM9xUcZDTWoqS6eiJamMpAUGJE4kz4hUMXbdXVDFY";
			buy_img2.addEventListener("click", buyNFT, false);

			//add elements to front div
			frontDiv.appendChild(info_img2);
			frontDiv.appendChild(buy_img2);
			frontDiv.appendChild(copyright_img2);
			//call async functions that populates the front and back with content
			let theJson = "jsonArray2";
			let myIndex = parseInt(res[3]); //+ 1;
			setPages(i, myIndex, pFront, pBack1, jsonArray2, theJson.substring(theJson.length - 1));

			//create and add 'See Back' button on frontDiv
			let back_btn2 = document.createElement("button");
			backID = "back" + i;
			back_btn2.id = backID;
			back_btn2.className = "videoseebackbtn";
			back_btn2.innerHTML = "See Back";
			back_btn2.addEventListener("click", flipfront, false);
			frontDiv.appendChild(back_btn2);

			//create and add See Front button on backDiv
			let btn2 = document.createElement("button");
			btnID = "btn" + i;
			btn2.id = btnID;
			btn2.className = "videoseefrontbtn";
			btn2.addEventListener("click", flipback, false);
			btn2.innerHTML = "See Front";
			backDiv.appendChild(btn2);

			//create and add Verify button on frontDiv
			let vrf2 = document.createElement("button");
			vrfID = "vrf" + i;
			vrf2.id = btnID;
			vrf2.className = "imageverifybtn";
			vrf2.addEventListener("click", txHash2, false);
			vrf2.innerHTML = "Verify NFT";
			backDiv.appendChild(vrf2);

			//insert image of the metadata on the backpage
			let ipfs_img = document.createElement("img");
			ipfs_img.className = "ipfsimage";
			ipfs_img.src = ipfs_gateway + "QmUpbn8hnTAt6LxS1LQ32bdsy3qfFZfjf8K6CsqXHjN2Yu";
			backDiv.appendChild(ipfs_img);
		} else if (NFTname == 3) {
			//create outer div
			let div = document.createElement("div");
			div.className = "myimage";

			//append outer div to body
			document.getElementById("masterdiv").appendChild(div);

			//create inner div and append it to outer div
			let innerDiv = document.createElement("div");
			innerDiv.className = "flip-card-inner";
			myFlip = "flip" + i;
			innerDiv.id = myFlip;
			div.appendChild(innerDiv);

			//now create the flip-card-front div
			myID = "image" + i;
			frontDiv.id = myID;
			frontDiv.className = "flip-card-front";
			innerDiv.appendChild(frontDiv);

			//create the create back-card-div
			backDiv.className = "flip-card-back";
			innerDiv.appendChild(backDiv);

			//spacer
			pFront.appendChild(document.createElement("br"));

			let res = tokenStats3[i].split("|");

			//create and add zoom image button
			let img_expand = document.createElement("img");
			exID = "imgx" + i;
			img_expand.id = exID;
			img_expand.className = "imagezoombtn";
			img_expand.alt = "";
			img_expand.src = ipfs_gateway + "QmSv2sqCPzW4DRiTf636YFuzMFkZHxiQgQenoreP46s2fa";

			//add zoom icon
			img_expand.addEventListener("click", myZoom, false);
			frontDiv.appendChild(img_expand);

			//create the copyright logo image element
			let copyright_img3 = document.createElement("img");
			crID = "copyright" + i;
			copyright_img3.id = crID;
			copyright_img3.className = "imgcopyrightlogo";
			copyright_img3.src = ipfs_gateway + "QmbvfGfgiEUo3jVZrTDHNRBzXpUy8hgceLokeyTgY6Tp2Z";

			//create the info image element
			let info_img3 = document.createElement("img");
			cpID = "info" + i;
			info_img3.id = cpID;
			info_img3.className = "imginfologo";
			info_img3.src = ipfs_gateway + "QmXwWzbs6vsi2qLecmGBSr6fMawwnsJmhHxH4fjtFKra5n";
			info_img3.addEventListener("click", myInfo, false);

			//create the buy dollar image element
			let buy_img3 = document.createElement("img");
			buyID = "buy" + res[3];
			buy_img3.id = buyID;
			buy_img3.className = "imgbuylogo";
			buy_img3.src = ipfs_gateway + "QmPyUWM9xUcZDTWoqS6eiJamMpAUGJE4kz4hUMXbdXVDFY";
			buy_img3.addEventListener("click", buyNFT, false);

			//add elements to frontdiv
			frontDiv.appendChild(info_img3);
			frontDiv.appendChild(buy_img3);
			frontDiv.appendChild(copyright_img3);
			//call async functions that populates the front and back with metadata content
			let theJson = "jsonArray3";
			setPages(i, res[3], pFront, pBack1, jsonArray3, theJson.substring(theJson.length - 1));

			//create and add 'See Back' button on frontDiv
			let back_btn3 = document.createElement("button");
			backID = "back" + i;
			back_btn3.id = backID;
			back_btn3.className = "imageseebackbtn";
			back_btn3.innerHTML = "See Back";
			back_btn3.addEventListener("click", flipfront, false);
			frontDiv.appendChild(back_btn3);

			//create and add See Front button on back page
			let btn2 = document.createElement("button");
			btnID = "btn" + i;
			btn2.id = btnID;
			btn2.className = "imageseefrontbtn";
			btn2.addEventListener("click", flipback, false);
			btn2.innerHTML = "See Front";
			backDiv.appendChild(btn2);

			//create and add Verify button on frontDiv
			let vrf3 = document.createElement("button");
			vrfID = "vrf" + i;
			vrf3.id = btnID;
			vrf3.className = "imageverifybtn";
			vrf3.addEventListener("click", txHash3, false);
			vrf3.innerHTML = "Verify NFT";
			backDiv.appendChild(vrf3);

			//insert image of the metadata on the backpage
			let ipfs_img = document.createElement("img");
			ipfs_img.className = "ipfsimage";
			ipfs_img.src = ipfs_gateway + "QmUpbn8hnTAt6LxS1LQ32bdsy3qfFZfjf8K6CsqXHjN2Yu";
			backDiv.appendChild(ipfs_img);

			//draw the image on the canvas
			drawImg(i, myID);
		}

		//add the metadata div inside the parent div (2 p tags:  pBack1 is the description)
		frontDiv.appendChild(pFront);
		backDiv.appendChild(pBack1);
		backDiv.appendChild(pBack2);
	}
}

function openMeta() {
	window.open('https://cyber.xyz/leshea_audio');
}

function openHelp() {
	alert("Documents are pending.");
}

function flipfront() {
	let q = document.getElementById(this.id.replace("back", "flip"));
	q.style.transform = "rotateY(180deg)";
}

function flipback() {
	let q = document.getElementById(this.id.replace("btn", "flip"));
	q.style.transform = "rotateY(0deg)";
}

function txHash1() {
	let goober = this.id.substring(this.id.indexOf("n") + 1, this.id.length);
	let oneBtn = document.getElementById(this.id); //btn0, btn1, etc
	//oneBtn.onclick=window.open('https://rinkeby.etherscan.io/tx/' + txHashes1[goober]);
	oneBtn.onclick = window.open("https://mumbai.polygonscan.com/tx/" + txHashes1[goober]);
	//oneBtn.onclick=window.open('https://polygonscan.com/tx/' + txHashes1[goober]);
}

function txHash2() {
	let goober = this.id.substring(this.id.indexOf("n") + 1, this.id.length);
	let twoBtn = document.getElementById(this.id); //btn0, btn1, etc
	//twoBtn.onclick=window.open('https://rinkeby.etherscan.io/tx/' + txHashes2[goober]);
	twoBtn.onclick = window.open("https://mumbai.polygonscan.com/tx/" + txHashes2[goober]);
	//twoBtn.onclick=window.open('https://polygonscan.com/tx/' + txHashes2[goober]);
}

function txHash3() {
	let goober = this.id.substring(this.id.indexOf("n") + 1, this.id.length);
	let threeBtn = document.getElementById(this.id); //btn0, btn1, etc
	//threeBtn.onclick=window.open('https://rinkeby.etherscan.io/tx/' + txHashes3[goober]);
	threeBtn.onclick = window.open("https://mumbai.polygonscan.com/tx/" + txHashes3[goober]);
	//threeBtn.onclick=window.open('https://polygonscan.com/tx/' + txHashes3[goober]);
}

//returns a promise to the function (setPages) from which it was called.
function getOwner(input) {
	return new Promise((resolve) => {
		//get owner from contract
		contract.methods.getOwner(input).call(function (error, owner) {
			resolve(owner);
		});
	});
}

function returnPrice(input) {
	return new Promise((resolve) => {
		//get price from contract
		contract.methods.returnTokenPrice(input).call(function (error, price) {
			resolve(price);
		});
	});
}

function myZoom() {
	//get index of selected nft
	let goober = this.id.substring(this.id.indexOf("x") + 1, this.id.length);

	//create div for the image
	let adiv = document.createElement("div");
	adiv.id = "myModal";
	adiv.className = "myimage2div";
	adiv.style.display = "block";

	//create the 3d image element
	let d_img = document.createElement("model-viewer");
	d_img.className = "image3d";
	d_img.src = vrFiles[goober];
	d_img.alt = " ";
	d_img.setAttribute("camera-controls", "true");
	d_img.setAttribute("auto-rotate", "true");

	//create the 2d image element
	let zoom_img = document.createElement("img");
	zoom_img.id = "myImg";
	zoom_img.className = "zoomImage";
	zoom_img.src = sourceFiles3[goober];

	//add the shrink button image
	let shrink = document.createElement("img");
	shrink.id = "myShrink";
	shrink.src = ipfs_gateway + "QmXFJz5PLJwTKvQSfGRH2Vx4XJebeYBDANxHpesA85WWyM";
	shrink.alt = "";

	//create the X close span element
	let close = document.createElement("span");
	close.className = "myclose";
	close.appendChild(shrink);
	close.onclick = function () {
		adiv.style.display = "none";
	};

	//add the image/vr, close image, and the div
	//if (d_img.src != 'plug'){
	//	adiv.appendChild(d_img)
	//} else {adiv.appendChild(zoom_img)}
	adiv.appendChild(zoom_img);
	adiv.appendChild(close);
	document.body.appendChild(adiv);
}

function myVideo2() {
	//get index of selected nft
	let goober = this.id.substring(this.id.indexOf("x") + 1, this.id.length);

	//create div for the video
	let bdiv = document.createElement("div");
	bdiv.id = "myModal";
	bdiv.className = "myimage2div";
	bdiv.style.display = "block";

	//create the 3d image element
	let d_img = document.createElement("model-viewer");
	d_img.className = "image3d";
	d_img.src = vrFiles[goober];
	d_img.alt = " ";
	d_img.setAttribute("camera-controls", "true");
	d_img.setAttribute("auto-rotate", "true");

	if (d_img.src != "plug") {
		bdiv.appendChild(d_img);
	} else {
		let zoom_vid = document.createElement("VIDEO");
		zoom_vid.className = "embedvid2";
		zoom_vid.controlsList = "nodownload";
		zoom_vid.controls = true;
		zoom_vid.loop = "true";
		if (zoom_vid.canPlayType("video/mp4")) {
			zoom_vid.setAttribute("src", sourceFiles2[goober]);
		} else {
			zoom_vid.setAttribute("src", "movie.ogg");
		}
		bdiv.appendChild(zoom_vid);
	}

	//add the shrink button image
	let shrink = document.createElement("img");
	shrink.id = "myShrink";
	shrink.src = ipfs_gateway + "QmXFJz5PLJwTKvQSfGRH2Vx4XJebeYBDANxHpesA85WWyM";
	shrink.alt = "";

	//create the X close span element
	let close = document.createElement("span");
	close.className = "myclose";
	close.appendChild(shrink);
	close.onclick = function () {
		bdiv.style.display = "none";
		zoom_vid.pause();
	};
	bdiv.appendChild(close);
	document.body.appendChild(bdiv);
}

//show the supporting NFT pdf doc
function myInfo() {
	//get index of selected nft
	let goober = this.id.substring(this.id.length - 1, this.id.length);
	let buzz;
	switch (theType) {
		case 1:
			buzz = info1;
			break;
		case 2:
			buzz = info2;
			break;
		case 3:
			buzz = info3;
			break;
	}

	//create div for the image
	let adiv = document.createElement("div");
	adiv.id = "myModal";
	adiv.className = "myimage2div";
	adiv.style.display = "block";

	//add the supporting pdf for the NFT
	let webObj = document.createElement("iframe");
	webObj.src = buzz[goober];
	webObj.style.marginTop = "-85px";
	webObj.style.marginLeft = "290px";
	webObj.style.width = "60%";
	webObj.style.height = "720px";

	//add the shrink button image
	let shrink = document.createElement("img");
	shrink.id = "myShrink";
	shrink.src = ipfs_gateway + "QmXFJz5PLJwTKvQSfGRH2Vx4XJebeYBDANxHpesA85WWyM";
	shrink.alt = "";

	//create the X close span element
	let close = document.createElement("span");
	close.className = "myclose";
	close.appendChild(shrink);
	close.onclick = function () {
		adiv.style.display = "none";
	};

	//add the image, close button, and the div
	adiv.appendChild(webObj);
	adiv.appendChild(close);
	document.body.appendChild(adiv);
}

//create a semi-transparent div for modal effect
let coverDiv = document.createElement("div");
coverDiv.id = "coverdiv";
document.body.appendChild(coverDiv);
coverDiv.style.display = "none";

//buy an NFT
async function buyNFT(e) {
	//get tokenID of selected nft
	let goober = this.id.substring(this.id.length - 1, this.id.length);
	let tokenID = goober;

	//get the price of the specific token from contract
	let thePrice = await returnPrice(tokenID);
	//set cost and value of payable transaction
	let theCost = await setCost("dollar", priceMatic, priceEth, thePrice);

	coverDiv.style.display = "block";
	document.body.style.overflowY = "hidden"; //disable vertical scrolling

	//create the input form container
	let cursorX = e.pageX;
	let cursorY = e.pageY;
	let px = cursorX - 155;
	let py = cursorY - 675;
	buyDiv = document.createElement("div");
	buyDiv.id = "buydiv";
	buyDiv.style.left = px.toString() + "px";
	buyDiv.style.marginTop = py.toString() + "px";

	//create the input form
	let buyForm = document.createElement("form");
	buyForm.className = "form-container";
	//keep the form from reloading the page
	buyForm.addEventListener("submit", handleForm);
	function handleForm(event) {
		event.preventDefault();
	}

	//create the close button
	let closeBtn = document.createElement("button");
	closeBtn.id = "btnclose";
	closeBtn.innerText = "X";
	closeBtn.onclick = function () {
		coverDiv.style.display = "none";
		buyForm.style.display = "none";
		buyDiv.style.display = "none";
		document.body.style.overflowY = "visible";
	};
	buyForm.appendChild(closeBtn);

	//create label at top of form
	buyForm.appendChild(document.createElement("br"));
	let buyLabel = document.createElement("label");
	buyLabel.className = "initlabel";
	buyLabel.innerHTML = "Purchase NFT";
	buyLabel.style.fontSize = "20px";
	buyLabel.style.fontWeight = "700";
	buyForm.appendChild(buyLabel);
	buyForm.appendChild(document.createElement("br"));
	buyForm.appendChild(document.createElement("br"));

	// Create description and link to detailed instructions
	let buyDesc = document.createTextNode(
		"Open Metamask and set the blockchain network to Matic Mainnet.  Connect to the user account" +
		" that will be used to purchase the NFT.  The account must have a sufficient Matic balance to complete the purchase."
	);
	buySpan = document.createElement("span");
	buySpan.appendChild(buyDesc);
	buyForm.appendChild(buySpan);

	//create label that is the link to 'details' pdf document on ipfs
	let linkLabel = document.createElement("label");
	linkLabel.innerHTML = " See Details";
	linkLabel.style.color = "blue";
	linkLabel.style.fontWeight = 520;
	linkLabel.onclick = function () {
		window.open(ipfs_gateway + "Qmbom1mkU19Y6UKySRPPESnZiG51wtHV1t6a1k1X3jCgyo");
	};
	//buyForm.appendChild(linkLabel);
	buyForm.appendChild(document.createElement("br"));
	buyForm.appendChild(document.createElement("br"));

	d1 = document.createTextNode("$" + thePrice);
	d2 = document.createTextNode("(Matic: " + setCost("matic", priceMatic, priceEth, thePrice) + ")");
	buySpan1 = document.createElement("span");
	buySpan2 = document.createElement("span");
	buySpan1.style.marginLeft = "30%";
	buySpan2.style.marginLeft = "30%";
	buySpan1.style.fontSize = "40px";
	buySpan2.style.fontSize = "17px";
	buySpan1.style.fontWeight = "700";
	buySpan2.style.fontWeight = "600";
	buySpan1.appendChild(d1);
	buySpan2.appendChild(d2);
	buyForm.appendChild(buySpan1);
	buyForm.appendChild(document.createElement("br"));
	buyForm.appendChild(buySpan2);

	let sendBtn = document.createElement("button");
	sendBtn.className = "btnpurchase";
	sendBtn.innerText = "Submit Purchase";
	buyForm.appendChild(sendBtn);
	sendBtn.addEventListener("click", async function () {
		//pop up metamask
		const accounts = await window.ethereum.request({
			method: "eth_requestAccounts",
		});
		const account = accounts[0]; //this is the active connected account in metamask

		//set up your Ethereum transaction
		const transactionParameters = {
			to: contract_address, //Required
			from: account, //the account of the purchaser
			value: web3.utils.toWei(theCost, "ether"),
			data: contract.methods.purchaseToken(tokenID).encodeABI(), //make call to NFT smart contract
		};

		await window.ethereum
			.request({
				method: "eth_sendTransaction",
				params: [transactionParameters],
			})
			.then((result) => {
				//return a transaction hash (result)
				buyDiv.style.display = "none";
				createSoldForm(cursorX, cursorY, tokenID);
			})
			.catch((error) => {
				//Promise rejected with an error.
				console.log(error);
			});
		coverDiv.style.display = "none";
	});

	buyForm.appendChild(sendBtn);
	buyDiv.appendChild(buyForm);
	document.getElementById("masterdiv").appendChild(buyDiv);
	buyDiv.style.display = "block"; //show the purchase form
}

let isCopied = "false";
function createSoldForm(myX, myY, myID) {
	let px = myX - 180;
	let py = myY - 670;

	let soldDiv = document.createElement("div");
	soldDiv.id = "solddiv";
	soldDiv.style.left = px.toString() + "px";
	soldDiv.style.marginTop = py.toString() + "px";

	//create the input form
	let soldForm = document.createElement("form");
	soldForm.className = "form-container";
	//keep the form from reloading the page
	soldForm.addEventListener("submit", handleForm);
	function handleForm(event) {
		event.preventDefault();
	}

	//create the close button
	let closeBtn2 = document.createElement("button");
	closeBtn2.id = "btnclose2";
	closeBtn2.innerText = "X";
	closeBtn2.onclick = function () {
		if (isCopied == "true") {
			soldDiv.style.display = "none";
			coverDiv.style.display = "none";
			switch (theType) {
				case 1:
					document.getElementById("btnone").click();
					break;
				case 2:
					document.getElementById("btntwo").click();
					break;
				case 3:
					document.getElementById("btnthree").click();
					break;
			}
		} else {
			alert("Copy the metadata link before exiting");
		}
	};
	soldForm.appendChild(closeBtn2);

	//create label at top of form
	soldForm.appendChild(document.createElement("br"));
	let soldLabel = document.createElement("label");
	soldLabel.className = "initlabel3";
	soldLabel.innerHTML = "Purchase Complete";
	soldLabel.style.fontSize = "22px";
	soldLabel.style.fontWeight = "700";
	soldLabel.style.color = "#30b11f";
	soldForm.appendChild(soldLabel);
	soldForm.appendChild(document.createElement("br"));
	soldForm.appendChild(document.createElement("br"));

	let soldLabel2 = document.createElement("label");
	soldLabel2.className = "initlabel2";
	soldLabel2.innerHTML = "What did you buy and where is it?";
	soldLabel2.style.fontSize = "17px";
	soldLabel2.style.fontWeight = "600";
	soldForm.appendChild(soldLabel2);

	soldForm.appendChild(document.createElement("br"));
	soldForm.appendChild(document.createElement("br"));

	// Create description and link to detailed instructions
	let soldDesc = document.createTextNode(
		"Your user account is now the owner of this NFT on the Polygon blockchain.  Click Verify NFT for details." +
		" The purchased asset and supporting documents are contained in metadata stored in the IPFS distributed file system." +
		" Copy the metadata link below and paste into a browser.  To download your files:"
	);

	soldSpan = document.createElement("span");
	soldSpan.appendChild(soldDesc);
	soldForm.appendChild(soldSpan);

	//create label that is the link to 'details' pdf document on ipfs
	let linkLabel = document.createElement("label");
	linkLabel.innerHTML = " See Details";
	linkLabel.style.color = "blue";
	linkLabel.style.fontWeight = 520;
	linkLabel.onclick = function () {
		window.open(ipfs_gateway + "QmZnZWrvJ7jhVgwJCXQzV5B9MZ4JPdY5chWUpU2ZesDGD4");
	};
	soldForm.appendChild(linkLabel);
	soldForm.appendChild(document.createElement("br"));
	soldForm.appendChild(document.createElement("br"));
	soldForm.appendChild(document.createElement("br"));
	soldForm.appendChild(document.createElement("br"));

	//create metadata link and 'copy link' button
	let metaLink = document.createElement("input");
	metaLink.id = "metalink";
	metaLink.setAttribute("type", "text");
	getMetalink(myID); //sets the value
	soldForm.appendChild(metaLink);

	let copyLinkBtn = document.createElement("button");
	copyLinkBtn.innerHTML = "Copy Link";
	copyLinkBtn.id = "copylinkbtn";
	copyLinkBtn.onclick = function () {
		metaLink.select();
		metaLink.setSelectionRange(0, 99999);
		navigator.clipboard.writeText(metaLink.value);
		isCopied = "true";
	};
	soldForm.appendChild(copyLinkBtn);

	soldDiv.appendChild(soldForm);
	document.getElementById("masterdiv").appendChild(soldDiv);
	soldDiv.style.display = "block"; //show the purchase completed form
}

function getMetalink(theID) {
	contract.methods.getTokens(theType).call(function (error, result) {
		if (!error) {
			let firstArray = result.split("||");
			for (let i = 0; i < firstArray.length; i++) {
				let secondArray = firstArray[i].split("|");
				if (secondArray[3] == theID) {
					document.getElementById("metalink").value =
						"https://blocklagoon.mypinata.cloud/ipfs/" + secondArray[0].substr(7, secondArray[0].length - 7);
					break;
				}
			}
		} else {
			console.log(error);
		}
	});
}

function setCost(type, priceMatic, priceEth, theUSD) {
	let x = theUSD / priceMatic;
	if (type == "dollar") {
		let y = priceMatic / priceEth;
		let xy = x * y;
		let z = xy / 3;
		let bb = xy + z;
		let gg = Number(bb).toFixed(6);
		return gg.toString();
	} else if (type == "matic") {
		return Number(x).toFixed(2);
	}
}

//abbreviate the creator address
function setcreator(inCreator) {
	let newCreator;
	newCreator = inCreator.substr(0, 6) + "......" + inCreator.substr(inCreator.length - 4, inCreator.length);
	return newCreator;
}

function drawImg(unt, theID) {
	let canv = document.createElement("canvas");
	canv.className = "imagecanvas";
	canv.width = 300;
	canv.height = 280;
	let context = canv.getContext("2d");
	let imageObj = new Image();
	imageObj.src = sourceFiles3[unt];
	let fitImageOn = function (canv, imageObj) {
		let imageAspectRatio = imageObj.width / imageObj.height;
		let canvasAspectRatio = canv.width / canv.height;
		let renderableHeight, renderableWidth, xStart, yStart;

		//If image's aspect ratio is less than canvas's then fit on height and place the image centrally along width
		if (imageAspectRatio < canvasAspectRatio) {
			renderableHeight = canv.height;
			renderableWidth = imageObj.width * (renderableHeight / imageObj.height);
			xStart = (canv.width - renderableWidth) / 2;
			yStart = 0;
		}
		//If image's aspect ratio is greater than canvas's then fit on width and place the image centrally along height
		else if (imageAspectRatio > canvasAspectRatio) {
			renderableWidth = canv.width;
			renderableHeight = imageObj.height * (renderableWidth / imageObj.width);
			xStart = 0;
			yStart = (canv.height - renderableHeight) / 2;
		}
		//keep aspect ratio of original
		else {
			renderableHeight = canv.height;
			renderableWidth = canv.width;
			xStart = 0;
			yStart = 0;
		}
		context.drawImage(imageObj, xStart, yStart, renderableWidth, renderableHeight);
	};

	imageObj.onload = function () {
		fitImageOn(canv, imageObj);
	};
	document.getElementById(theID).appendChild(canv);
}

function drawArt(wok, theID) {
	let canv = document.createElement("canvas");
	canv.className = "audiocanvas";
	let ctx = canv.getContext("2d");
	let img = new Image();

	if (sourceArt1[wok].indexOf("no artwork") == -1) {
		//filter out any having 'no artwork' value
		img.src = sourceArt1[wok];
	} else {
		//the location on ipfs of the noArt image
		img.src = ipfs_gateway + "QmdbAEmsfWiJtPr9LgaHW8wsJCBuKGWGSxRuQ89MfdWpB2";
	}
	img.onload = function () {
		ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canv.width, canv.height);
	};

	document.getElementById(theID).appendChild(canv);
}

async function get_metadata(myfs, CID) {
	for await (const insp_rec of myfs.cat(CID)) {
		const jsonObj = await JSON.parse(insp_rec);
		//return jsonObj;
		let obj_attributes = {
			Name: jsonObj.name,
			Description: jsonObj.description,
			Image: jsonObj.image,
			Created: jsonObj.created,
			Creator: jsonObj.creator,
			Artwork: jsonObj.artwork,
			Copyright: jsonObj.copyright,
			Watermark: jsonObj.watermark,
			Animation: jsonObj.animation_url,
			Edition: jsonObj.edition,
		};
		return obj_attributes;
	}
}

//creates an IFPS instance
async function createIpfs() {
	const ipfs = await Ipfs.create();
	return ipfs;
}

//async function that will await for getOwner function to complete before continuing
async function setPages(index, myres, front, back1, myJsonArray, whichJson) {
	//runs the getOwner function
	const result = await getOwner(myres); //get owner of the tokenID
	//get the sold NFTs
	await contract.methods.getSold().call(function (error, result2) {
		if (!error) {
			let soldIDs = [...new Set(result2)]; //remove dups
			soldArray2 = soldIDs;
		} else {
			console.log(error);
		}
	});

	//front page
	s1 = document.createTextNode("Name/ID:  ");
	s2 = document.createTextNode(myJsonArray[index][0] + " [" + myres + "]");
	span1 = document.createElement("span");
	span2 = document.createElement("span");
	span1.style.fontSize = "15px";
	span2.style.fontSize = "15px";
	span1.style.fontWeight = "700";
	span2.style.fontWeight = "700";
	span2.style.color = "blue";
	span1.appendChild(s1);
	span2.appendChild(s2);
	front.appendChild(span1);
	front.appendChild(span2);
	front.appendChild(document.createElement("br"));

	s1a = document.createTextNode("Collection:  ");
	s2a = document.createTextNode("Block_Lagoon");
	span1a = document.createElement("span");
	span2a = document.createElement("span");
	span1a.style.fontSize = "15px";
	span2a.style.fontSize = "15px";
	span1a.style.fontWeight = "700";
	span1a.appendChild(s1a);
	span2a.appendChild(s2a);
	front.appendChild(span1a);
	front.appendChild(span2a);
	front.appendChild(document.createElement("br"));

	s3 = document.createTextNode("Creator:  ");
	s4 = document.createTextNode("BlockLagoon");
	//s4 = document.createTextNode(setcreator(myJsonArray[index][3]));
	span3 = document.createElement("span");
	span4 = document.createElement("span");
	span3.style.fontSize = "15px";
	span4.style.fontSize = "15px";
	span3.style.fontWeight = "700";
	span3.appendChild(s3);
	span4.appendChild(s4);
	front.appendChild(span3);
	front.appendChild(span4);
	front.appendChild(document.createElement("br"));

	s3a = document.createTextNode("Owner:  ");
	s4a = document.createTextNode(setcreator(result));
	span3a = document.createElement("span");
	span4a = document.createElement("span");
	span3a.style.fontSize = "15px";
	span4a.style.fontSize = "15px";
	span3a.style.fontWeight = "700";
	span3a.appendChild(s3a);
	span4a.appendChild(s4a);

	front.appendChild(span3a);
	front.appendChild(span4a);
	front.appendChild(document.createElement("br"));

	s5 = document.createTextNode("Date Created:  ");
	s6 = document.createTextNode(myJsonArray[index][2]);
	span5 = document.createElement("span");
	span6 = document.createElement("span");
	span5.style.fontWeight = "700";
	span5.style.fontSize = "15px";
	span6.style.fontSize = "15px";
	span5.appendChild(s5);
	span6.appendChild(s6);
	front.appendChild(span5);
	front.appendChild(span6);
	front.appendChild(document.createElement("br"));

	s5a = document.createTextNode("Edition:  ");
	s6a = document.createTextNode("sold out");
	//manage sold vs for sale status of nft
	let gx = myJsonArray[index][5];
	let bind = gx.indexOf("/");
	let ed1 = gx.substring(0, bind);
	let ed2 = gx.substr(bind + 1, gx.length - bind);
	//console.log(ed1 + '/' + ed2)
	if (ed1 == ed2 && gx != "1/1") {
		s6a = document.createTextNode("sold out");
		document.getElementById("buy" + myres).style.visibility = "hidden";
	} else if (gx == "1/1") {
		s6a = document.createTextNode(single(myres, gx));
	} else {
		s6a = document.createTextNode(gx + " - for sale");
	}

	span5a = document.createElement("span");
	span6a = document.createElement("span");
	span5a.style.fontSize = "15px";
	span6a.style.fontSize = "15px";
	span5a.style.fontWeight = "700";
	span5a.appendChild(s5a);
	span6a.appendChild(s6a);
	front.appendChild(span5a);
	front.appendChild(span6a);
	front.appendChild(document.createElement("br"));

	if (whichJson == 3) {
		front.style.marginTop = "-15px";
	} else if (whichJson == 2) {
		front.style.marginTop = "215px";
	} else if (whichJson == 1) {
		front.style.marginTop = "8px";
	}
	front.style.lineHeight = 1.4;
	front.style.marginLeft = "15px";

	//back page
	s7 = document.createTextNode("NFT Description:");
	s8 = document.createTextNode(myJsonArray[index][1]);
	span7 = document.createElement("span");
	span8 = document.createElement("span");
	span7.style.fontSize = "15px";
	span8.style.fontSize = "15px";
	span7.style.fontWeight = "700";
	span7.appendChild(s7);
	span8.appendChild(s8);
	back1.appendChild(span7);
	back1.appendChild(document.createElement("br"));
	back1.appendChild(span8);
	back1.appendChild(document.createElement("br"));
	back1.appendChild(document.createElement("br"));

	s9 = document.createTextNode("About the Artist:");
	//add the artist image and bio
	let artist_img = document.createElement("img");

	// BlockLagoon
	s10 = document.createTextNode(
		"BlockLagoon DAO is a group of engineers, artists, and visionaries that are bringing " +
		"clarity and professionalism to the NFT experience.  Our tools allow creators to create, manage, and sell their " +
		"unique and respsonsibly crafted NFTs to an audience of collectors who seek the highest quality audited and documented NFTs."
	);

	//add the artist image
	artist_img.src = ipfs_gateway + "QmbB2digjQFHHUB8EkemySXVN5nJyeHVqreHJRgM7hm7E2";

	span9 = document.createElement("span");
	span10 = document.createElement("span");
	span9.style.fontSize = "14px";
	span10.style.fontSize = "14px";
	span9.style.fontWeight = "700";
	span9.appendChild(s9);
	span10.appendChild(s10);
	back1.appendChild(span9);
	back1.appendChild(artist_img);
	back1.appendChild(span10);
	back1.style.lineHeight = 1.1;
	back1.style.marginLeft = "15px";
	back1.style.marginRight = "10px";
	back1.style.marginTop = "-30px";
}

function single(theres, bx) {
	if (soldArray2.includes(theres.toString())) {
		document.getElementById("buy" + theres).style.visibility = "hidden";
		return "sold out";
	} else {
		return bx + " - for sale";
	}
}