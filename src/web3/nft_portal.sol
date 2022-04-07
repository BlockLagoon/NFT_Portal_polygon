// SPDX-License-Identifier: MIT
pragma solidity >= 0.6.0 <= 0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.4/contracts/token/ERC721/ERC721.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.4/contracts/access/Ownable.sol";

contract newNFT is ERC721, Ownable {
    uint256 public tokenCounter;
    string public burners;
    string[] public audioTokens;
    string[] public videoTokens;
    string[] public imageTokens;
    uint256[] public soldTokens;
    mapping(uint256 => uint256) public tokenIdToPrice;
    string public myBaseURI;

    constructor() ERC721("Block_Lagoon", "BLG")
    {
        tokenCounter = 0;
    }

    //get the CID of the metadata for the specific NFT and assign it to the myBaseURI variable
    function setBaseURI(string memory baseURI) public returns(string memory){
        myBaseURI = baseURI;
        return myBaseURI;
    }

    //required implementation for metadata
    function tokenURI(uint256 tokenId) public view override returns(string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

    	string memory base = "ipfs://";
        return string(abi.encodePacked(base, myBaseURI));
    }

    //mint a new NFT and set its price into the mapping
    function createNFT(string memory theURI, uint256 price) public returns(uint256) {
        tokenCounter++;
    
    	uint256 newItemId = tokenCounter;
        _safeMint(msg.sender, newItemId);
        _setTokenURI(newItemId, theURI);

        //set the price of the new token
        tokenIdToPrice[newItemId] = price;

        return newItemId;
    }

    //add data specific to each newly created NFT
    function createCID(string memory myCID, string memory myName, string memory myEdition, uint nft_type, string memory user_acct, string memory txHash) public {
    	string memory addOn = string(abi.encodePacked(myCID, '|', myName, '|', myEdition, '|', uint2str(tokenCounter), '|', user_acct, '|', txHash));
        if (nft_type == 1) {
            audioTokens.push(addOn);
        } else if (nft_type == 2) {
            videoTokens.push(addOn);
        } else if (nft_type == 3) {
            imageTokens.push(addOn);
        }
    }

    //get the price of a specific NFT token
    function returnTokenPrice(uint key) public view returns(uint) {
        return tokenIdToPrice[key];
    }

    //gets the concatenated string of data specific to each NFT type (createCID function creates the data originally)
    function getTokens(uint nft_type) public view returns(string memory) {
    	string memory theConcat;
        if (nft_type == 1) {
            theConcat = audioTokens[0];
            for (uint i = 1; i < audioTokens.length; i++) {
                theConcat = string(abi.encodePacked(theConcat, '||', audioTokens[i]));
            }
        } else if (nft_type == 2) {
            theConcat = videoTokens[0];
            for (uint i = 1; i < videoTokens.length; i++) {
                theConcat = string(abi.encodePacked(theConcat, '||', videoTokens[i]));
            }
        } else if (nft_type == 3) {
            theConcat = imageTokens[0];
            for (uint i = 1; i < imageTokens.length; i++) {
                theConcat = string(abi.encodePacked(theConcat, '||', imageTokens[i]));
            }
        }
        return theConcat;
    }

    //get the primary sold NFTs in the contract
    function getSold() public view returns(uint256[] memory) {
        return (soldTokens);
    }

    //transfer an NFT
    function transferToken(address from_add, address to_add, uint256 tokenId) public {
        require((_exists(tokenId)), "Token does not exist");
        require(msg.sender == ownerOf(tokenId), "Not token owner");
        safeTransferFrom(from_add, to_add, tokenId);
    }

    //purchase an NFT and add it's token id to the sold array
    function purchaseToken(uint256 tokenId) external payable {
        require((_exists(tokenId)), "Token does not exist");
      	address seller = ownerOf(tokenId);
        _transfer(seller, msg.sender, tokenId);
        payable(seller).transfer(msg.value);

        soldTokens.push(tokenId);
    }

    //burn token
    function theburn(uint256 tokenId) public {
        _isApprovedOrOwner(msg.sender, tokenId);
        _burn(tokenId);

        //write to the burn state variable
        burners = string(abi.encodePacked(burners, '||', uint2str(tokenId)));
    }

    //get all burned addresses in the contract and return em
    function getBurners() public view returns(string memory) {
        return burners;
    }

    //get the owner of an NFT
    function getOwner(uint256 myToken) public view returns(address) {
      	address myOwner;
        myOwner = ownerOf(myToken);
        return myOwner;
    }

    //convert uint to string
    function uint2str(uint256 _i) internal pure returns(string memory str) {
        if (_i == 0) {
            return "0";
        }

    	uint256 j = _i;
    	uint256 length;

        while (j != 0) {
            length++;
            j /= 10;
        }

    	bytes memory bstr = new bytes(length);
    	uint256 k = length;
        j = _i;

        while (j != 0) {
            bstr[--k] = bytes1(uint8(48 + j % 10));
            j /= 10;
        }
        str = string(bstr);
    }
}