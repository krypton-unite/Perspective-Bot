const perspective = require('../src/perspective.js');
var should = require('chai').should();

// beforeEach(async function () {
// });

describe('#should correctly identify offence', function () {
    it('\'Você vai para o inferno!\'', async function () {
        result = await perspective.analyzeText('Você vai para o inferno!');
        result.INSULT.should.equal(true)
        result.TOXICITY.should.equal(true)
        result.THREAT.should.equal(true)
        result.PROFANITY.should.equal(true)
        result.SEVERE_TOXICITY.should.equal(false)
        result.IDENTITY_ATTACK.should.equal(false)
    });
    it('\'Seu imbecil!\'', async function () {
        result = await perspective.analyzeText('Seu imbecil!');
        result.INSULT.should.equal(true)
        result.TOXICITY.should.equal(true)
        result.THREAT.should.equal(false)
        result.PROFANITY.should.equal(true)
        result.SEVERE_TOXICITY.should.equal(true)
        result.IDENTITY_ATTACK.should.equal(false)
    });
});