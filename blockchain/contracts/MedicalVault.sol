// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MedicalVault {
    address public owner;

    struct Record {
        uint256 id;
        string cid;
        address recordOwner;
        bool exists;
    }

    mapping(uint256 => Record) public records;
    mapping(uint256 => mapping(address => bool)) public accessMap;

    event RecordRegistered(uint256 indexed id, string cid, address indexed recordOwner);
    event AccessGranted(uint256 indexed id, address indexed doctor, address indexed recordOwner);
    event AccessRevoked(uint256 indexed id, address indexed doctor, address indexed recordOwner);
    event AuditLogged(uint256 indexed id, string action, address indexed actor);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not contract owner");
        _;
    }

    modifier onlyRecordOwner(uint256 id) {
        require(records[id].exists, "Record not found");
        require(records[id].recordOwner == msg.sender, "Not record owner");
        _;
    }

    modifier recordExists(uint256 id) {
        require(records[id].exists, "Record not found");
        _;
    }

    modifier hasAccess(uint256 id) {
        require(
            records[id].recordOwner == msg.sender || accessMap[id][msg.sender],
            "Access denied"
        );
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerMedicalRecord(uint256 id, string calldata cid) external {
        require(!records[id].exists, "Record already exists");
        require(bytes(cid).length > 0, "CID cannot be empty");
        records[id] = Record(id, cid, msg.sender, true);
        emit RecordRegistered(id, cid, msg.sender);
        emit AuditLogged(id, "UPLOAD", msg.sender);
    }

    function grantAccess(uint256 id, address doctor) external onlyRecordOwner(id) {
        require(doctor != address(0), "Invalid doctor address");
        require(!accessMap[id][doctor], "Access already granted");
        accessMap[id][doctor] = true;
        emit AccessGranted(id, doctor, msg.sender);
        emit AuditLogged(id, "GRANT", msg.sender);
    }

    function revokeAccess(uint256 id, address doctor) external onlyRecordOwner(id) {
        require(accessMap[id][doctor], "Access not granted");
        accessMap[id][doctor] = false;
        emit AccessRevoked(id, doctor, msg.sender);
        emit AuditLogged(id, "REVOKE", msg.sender);
    }

    function logAudit(uint256 id, string calldata action) external recordExists(id) hasAccess(id) {
        emit AuditLogged(id, action, msg.sender);
    }

    function getRecord(uint256 id) external view recordExists(id) hasAccess(id) returns (Record memory) {
        return records[id];
    }

    function checkAccess(uint256 id, address accessor) external view recordExists(id) returns (bool) {
        return records[id].recordOwner == accessor || accessMap[id][accessor];
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
}
