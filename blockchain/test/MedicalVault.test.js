require('@nomicfoundation/hardhat-chai-matchers');
const { expect } = require('chai');
const { ethers } = require('hardhat');
const { loadFixture } = require('@nomicfoundation/hardhat-toolbox/network-helpers');

async function deployFixture() {
  const [owner, patient, doctor, other] = await ethers.getSigners();
  const MedicalVault = await ethers.getContractFactory('MedicalVault');
  const vault = await MedicalVault.deploy();
  return { vault, owner, patient, doctor, other };
}

describe('MedicalVault', function () {
  describe('Deployment', function () {
    it('sets deployer as owner', async function () {
      const { vault, owner } = await loadFixture(deployFixture);
      expect(await vault.owner()).to.equal(owner.address);
    });
  });

  describe('registerMedicalRecord', function () {
    it('registers a new record', async function () {
      const { vault, patient } = await loadFixture(deployFixture);
      await expect(vault.connect(patient).registerMedicalRecord(1, 'QmTestCID'))
        .to.emit(vault, 'RecordRegistered')
        .withArgs(1, 'QmTestCID', patient.address);
    });

    it('reverts on duplicate record id', async function () {
      const { vault, patient } = await loadFixture(deployFixture);
      await vault.connect(patient).registerMedicalRecord(1, 'QmTestCID');
      await expect(vault.connect(patient).registerMedicalRecord(1, 'QmOtherCID'))
        .to.be.revertedWith('Record already exists');
    });

    it('reverts on empty CID', async function () {
      const { vault, patient } = await loadFixture(deployFixture);
      await expect(vault.connect(patient).registerMedicalRecord(2, ''))
        .to.be.revertedWith('CID cannot be empty');
    });
  });

  describe('grantAccess', function () {
    it('grants access to a doctor', async function () {
      const { vault, patient, doctor } = await loadFixture(deployFixture);
      await vault.connect(patient).registerMedicalRecord(1, 'QmTestCID');
      await expect(vault.connect(patient).grantAccess(1, doctor.address))
        .to.emit(vault, 'AccessGranted')
        .withArgs(1, doctor.address, patient.address);
      expect(await vault.accessMap(1, doctor.address)).to.be.true;
    });

    it('reverts if not record owner', async function () {
      const { vault, patient, doctor, other } = await loadFixture(deployFixture);
      await vault.connect(patient).registerMedicalRecord(1, 'QmTestCID');
      await expect(vault.connect(other).grantAccess(1, doctor.address))
        .to.be.revertedWith('Not record owner');
    });

    it('reverts on duplicate grant', async function () {
      const { vault, patient, doctor } = await loadFixture(deployFixture);
      await vault.connect(patient).registerMedicalRecord(1, 'QmTestCID');
      await vault.connect(patient).grantAccess(1, doctor.address);
      await expect(vault.connect(patient).grantAccess(1, doctor.address))
        .to.be.revertedWith('Access already granted');
    });

    it('reverts on zero address', async function () {
      const { vault, patient } = await loadFixture(deployFixture);
      await vault.connect(patient).registerMedicalRecord(1, 'QmTestCID');
      await expect(vault.connect(patient).grantAccess(1, ethers.ZeroAddress))
        .to.be.revertedWith('Invalid doctor address');
    });
  });

  describe('revokeAccess', function () {
    it('revokes access', async function () {
      const { vault, patient, doctor } = await loadFixture(deployFixture);
      await vault.connect(patient).registerMedicalRecord(1, 'QmTestCID');
      await vault.connect(patient).grantAccess(1, doctor.address);
      await expect(vault.connect(patient).revokeAccess(1, doctor.address))
        .to.emit(vault, 'AccessRevoked')
        .withArgs(1, doctor.address, patient.address);
      expect(await vault.accessMap(1, doctor.address)).to.be.false;
    });

    it('reverts if access was not granted', async function () {
      const { vault, patient, other } = await loadFixture(deployFixture);
      await vault.connect(patient).registerMedicalRecord(1, 'QmTestCID');
      await expect(vault.connect(patient).revokeAccess(1, other.address))
        .to.be.revertedWith('Access not granted');
    });

    it('reverts if not record owner', async function () {
      const { vault, patient, doctor, other } = await loadFixture(deployFixture);
      await vault.connect(patient).registerMedicalRecord(1, 'QmTestCID');
      await vault.connect(patient).grantAccess(1, doctor.address);
      await expect(vault.connect(other).revokeAccess(1, doctor.address))
        .to.be.revertedWith('Not record owner');
    });
  });

  describe('getRecord', function () {
    it('owner can read their record', async function () {
      const { vault, patient } = await loadFixture(deployFixture);
      await vault.connect(patient).registerMedicalRecord(1, 'QmTestCID');
      const rec = await vault.connect(patient).getRecord(1);
      expect(rec.cid).to.equal('QmTestCID');
      expect(rec.recordOwner).to.equal(patient.address);
    });

    it('granted doctor can read record', async function () {
      const { vault, patient, doctor } = await loadFixture(deployFixture);
      await vault.connect(patient).registerMedicalRecord(1, 'QmTestCID');
      await vault.connect(patient).grantAccess(1, doctor.address);
      const rec = await vault.connect(doctor).getRecord(1);
      expect(rec.cid).to.equal('QmTestCID');
    });

    it('reverts for unauthorized accessor', async function () {
      const { vault, patient, other } = await loadFixture(deployFixture);
      await vault.connect(patient).registerMedicalRecord(1, 'QmTestCID');
      await expect(vault.connect(other).getRecord(1))
        .to.be.revertedWith('Access denied');
    });

    it('reverts for non-existent record', async function () {
      const { vault, patient } = await loadFixture(deployFixture);
      await expect(vault.connect(patient).getRecord(99))
        .to.be.revertedWith('Record not found');
    });
  });

  describe('checkAccess', function () {
    it('returns true for record owner', async function () {
      const { vault, patient } = await loadFixture(deployFixture);
      await vault.connect(patient).registerMedicalRecord(1, 'QmTestCID');
      expect(await vault.checkAccess(1, patient.address)).to.be.true;
    });

    it('returns false for unauthorized address', async function () {
      const { vault, patient, other } = await loadFixture(deployFixture);
      await vault.connect(patient).registerMedicalRecord(1, 'QmTestCID');
      expect(await vault.checkAccess(1, other.address)).to.be.false;
    });

    it('returns true after access granted', async function () {
      const { vault, patient, doctor } = await loadFixture(deployFixture);
      await vault.connect(patient).registerMedicalRecord(1, 'QmTestCID');
      await vault.connect(patient).grantAccess(1, doctor.address);
      expect(await vault.checkAccess(1, doctor.address)).to.be.true;
    });

    it('returns false after access revoked', async function () {
      const { vault, patient, doctor } = await loadFixture(deployFixture);
      await vault.connect(patient).registerMedicalRecord(1, 'QmTestCID');
      await vault.connect(patient).grantAccess(1, doctor.address);
      await vault.connect(patient).revokeAccess(1, doctor.address);
      expect(await vault.checkAccess(1, doctor.address)).to.be.false;
    });
  });

  describe('transferOwnership', function () {
    it('transfers contract ownership', async function () {
      const { vault, owner, other } = await loadFixture(deployFixture);
      await vault.connect(owner).transferOwnership(other.address);
      expect(await vault.owner()).to.equal(other.address);
    });

    it('reverts if not contract owner', async function () {
      const { vault, patient, other } = await loadFixture(deployFixture);
      await expect(vault.connect(patient).transferOwnership(other.address))
        .to.be.revertedWith('Not contract owner');
    });

    it('reverts on zero address', async function () {
      const { vault, owner } = await loadFixture(deployFixture);
      await expect(vault.connect(owner).transferOwnership(ethers.ZeroAddress))
        .to.be.revertedWith('Invalid address');
    });
  });
});
