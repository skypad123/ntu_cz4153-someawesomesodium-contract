//SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.7.0 <0.9.0;

interface IPercentRecord{
    struct Allocation {
        address objAddress;
        uint32 percentCount;
    }

    function createAllocation( address _walletAddress, uint32 _initPercentCount ) external;
    function addAllocation( address _walletAddress, uint32 _percentCount ) external; 
    function subtractAllocation( address _walletAddress, uint32 _percentCount ) external; 
    function getAllocationValue( address _walletAddress ) external returns(uint32); 
    function removeAllocation( address _walletAddress ) external;

    event Allocation_Creation( address indexed _walletAddress, uint _percentAmount );
    event Allocation_Add( address indexed _walletAddress, uint _percentAmount );
    event Allocation_Subtract( address indexed _walletAddress, uint _percentAmount );
    event Allocation_Removal( address indexed _walletAddress );
}


contract PercentRecord is IPercentRecord{

    mapping(address => uint32)  public addressMap;
    mapping(uint32 => Allocation)  public allocationMap; 
    uint32 public count = 0;
    uint32 public percentSum = 0;

    function createAllocation( address _objAddress, uint32 _initPercentCount ) public virtual override{
        require(addressMap[_objAddress] == 0, "specified address's allocation has already been created.");
        require(percentSum + _initPercentCount <= 1000000000, "total percent count cannot pass 100%.");
        addressMap[_objAddress] = count + 1;
        allocationMap[count] = Allocation(_objAddress, _initPercentCount);
        count += 1; 
        percentSum += _initPercentCount;
    }

    function addAllocation( address _objAddress, uint32 _percentCount ) public virtual override{
        require(addressMap[_objAddress] != 0, "specified address's allocation has not been created.");
        require(percentSum + _percentCount <= 1000000000, "total percent count cannot pass 100%.");
        uint32 index = addressMap[_objAddress];
        allocationMap[index].percentCount += _percentCount;
        percentSum += _percentCount;
    }

    function subtractAllocation( address _objAddress, uint32 _percentCount ) public virtual override {
        require(addressMap[_objAddress] != 0, "specified address's allocation has not been created.");
        uint32 index = addressMap[_objAddress];
        require(_percentCount > allocationMap[index].percentCount, "cannot subtract more than already allocated.");
        allocationMap[index].percentCount -= _percentCount;
        percentSum -= _percentCount;
    } 

    function getAllocationValue( address _objAddress ) public view  virtual override returns(uint32){
        require(addressMap[_objAddress] != 0, "specified address's allocation has not been created.");
        uint32 index = addressMap[_objAddress];
        return allocationMap[index].percentCount;
    } 

    function removeAllocation( address _objAddress ) public virtual override{
        require(addressMap[_objAddress] != 0, "specified address allocation has not been created.");
        uint32 index = addressMap[_objAddress];
        percentSum -= allocationMap[index].percentCount;
        allocationMap[index].percentCount = 0;
        addressMap[_objAddress] = 0;
    }
    
}