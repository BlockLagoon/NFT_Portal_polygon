//*************************************************************************************************************
//Note: this is a Node.js template for minting an NFT from the nft_portal.sol
//smart contract on the Polygon blockchain.  Metadata for the NFT is generated and 
//pinned to Pinata.  
//*************************************************************************************************************

const fs = require('fs');
const pinataSDK = require('@pinata/sdk');
const pinata = pinataSDK('5a60eac7dc5dd69c42cf', 'e89b10e72176dd6514470465c2ce3929b1ed55f40e0b3c8383098deb032dc1e5');
const Web3 = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const client_URL = "https://rpc-mumbai.maticvigil.com/v1/6d15630b7453696102ad39f4b6fbf678ec4244be";
const mnemonic = "####### ##### #### #### ##### ####### ##### ###### ### ####### ##### ####";
const provider = new HDWalletProvider(mnemonic, client_URL);
const web3 = new Web3(provider);

const source_file1 = ''
const source_file2 = ''
const source_file3 = ''
const filename1 = ''
const filename2 = ''
const description = ''
const nft_type = ''
const copyright = ''
const blg_account = ''
const edition = ''
const client_account = ''
const nft_name = ''
const contract_address = ''
const tokenID = ''
const tokenPrice = ''
var current_datetime = ''
var theCID;
var myData;

//create the contract instance (need to get the abi of the contract)
const contract = new web3.eth.Contract('abi goes here', contract_address);

// pin artwork image to pinata
var to_IPFS1 = fs.createReadStream(source_file2);
pinata.pinFileToIPFS(to_IPFS1).then((result1) => {
    if (filename1 == "noArt.jpg") {
        artValue = "no artwork";
    } else {
        for (key in result1) {
            if (result1.hasOwnProperty(key)) {
                var value = result1[key];
                artValue = "ipfs://" + value;
                break;
            }
        }
    }

    //pin copyright file to pinata
    var to_IPFS2 = fs.createReadStream(copyright);
    pinata.pinFileToIPFS(to_IPFS2).then((result1) => {
        for (key in result1) {
            if (result1.hasOwnProperty(key)) {
                var value = result1[key];
                copValue = "ipfs://" + value;
                break;
            }
        }

        //pin nft source file (video, image, audio) to pinata
        var to_IPFS3 = fs.createReadStream(source_file1);
        pinata.pinFileToIPFS(to_IPFS3).then((result2) => {
            for (key in result2) {
                if (result2.hasOwnProperty(key)) {
                    var value = result2[key];
                    var theValue = "ipfs://" + value;
                    break;
                }
            }

            //pin watermark image file to pinata
            var to_IPFS4 = fs.createReadStream(source_file3);
            pinata.pinFileToIPFS(to_IPFS4).then((result3) => {
                if (filename2 == "noWatermark.jpg") {
                    wmValue = "no watermarked image";
                } else {
                    for (key in result3) {
                        if (result3.hasOwnProperty(key)) {
                            var value = result3[key];
                            wmValue = "ipfs://" + value;
                            break;
                        }
                    }
                }

                //create metadata object
                var theDate = current_datetime.getFullYear() + "-" + (current_datetime.getMonth() + 1) + "-" + current_datetime.getDate() + " " + current_datetime.getHours() + ":" + current_datetime.getMinutes() + ":" + current_datetime.getSeconds();
                const metadataTemplate = CreateMetadata(nft_name, description, theValue, wmValue, blg_account, theDate, copValue, artValue, edition, contract_address, tokenID);
                myData = JSON.stringify(metadataTemplate)

                //pin metadata json object to pinata
                pinata.pinJSONToIPFS(metadataTemplate).then((result4) => {
                    for (key in result4) {
                        if (result4.hasOwnProperty(key)) {
                            var value2 = result4[key];
                            theCID = value2;
                            break;
                        }
                    }
                    //create NFT from smart contract
                    Create_NFT(theCID);
                });
            });
        });
    });

    function CreateMetadata(nft_namex, descriptionx, theValuex, wmValuex, blg_accountx, theDatex, copValuex, artValuex, editionx, theContract, tokenIDx) {
        if (nft_type != 1) {   //video2 or image3
            const myObject = {
                "name": nft_namex,
                "description": descriptionx,
                "image": theValuex,
                "watermark": wmValuex,
                "creator": blg_accountx,
                "created": theDatex,
                "copyright": copValuex,
                "artwork": artValuex,
                "edition": editionx,
                "contract": theContract,
                "tokenID": tokenIDx
            }
            return myObject;
        } else if (nft_type == 1) {    //audio1  
            const myObject = {
                "name": nft_namex,
                "description": descriptionx,
                "image": artValuex,
                "watermark": wmValuex,
                "animation_url": theValuex,
                "creator": blg_accountx,
                "created": theDatex,
                "copyright": copValuex,
                "artwork": artValuex,
                "edition": editionx,
                "contract": theContract,
                "tokenID": tokenIDx
            }
            return myObject;
        }
    }

    async function Create_NFT(theURI) {
        try {
            //set the current metadata URI in the contract
            await contract.methods.setBaseURI(theURI).send({ from: blg_account });

            //create NFT via smart contract
            var myHash;
            await contract.methods.createNFT("ipfs://" + theURI, tokenPrice).send({ from: blg_account }) //acct must have matic in it
                .on('transactionHash', function (hash) {
                    myHash = hash;
                })

            //c
            await contract.methods.createCID("ipfs://" + theURI, nft_name, edition, nft_type, blg_account, myHash).send({ from: blg_account });

            //transfer the new NFT from BLG owner to client account
            var theToken;
            await contract.methods.totalSupply().call(function (error, result) {
                if (!error) {
                    theToken = result;
                } else { 'error in totalsupply()' }
            });
            await contract.methods.transferToken(blg_account, client_account, theToken).send({ from: blg_account, to: contract_address });
        } catch (err) {
            console.log('error while creating NFT', err)
        }
    }
}).catch((err) => {
    console.log(err);
});
