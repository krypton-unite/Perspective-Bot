import analyzeText from '../src/perspective.js';
import chai from 'chai';
const should = chai.should();

describe('Should correctly identify offences\' traits in:', async () => {
    describe('- Portuguese:', async () => {
        it('\'Você vai para o inferno!\'', async () => {
            const result = await analyzeText('Você vai para o inferno!');
            result.INSULT.should.equal(true)
            result.TOXICITY.should.equal(true)
            result.THREAT.should.equal(true)
            result.PROFANITY.should.equal(true)
            result.SEVERE_TOXICITY.should.equal(false)
            result.IDENTITY_ATTACK.should.equal(false)
        });
        it('\'Seu imbecil!\'', async () => {
            const result = await analyzeText('Seu imbecil!');
            result.INSULT.should.equal(true)
            result.TOXICITY.should.equal(true)
            result.THREAT.should.equal(false)
            result.PROFANITY.should.equal(true)
            result.SEVERE_TOXICITY.should.equal(true)
            result.IDENTITY_ATTACK.should.equal(false)
        });
    });
    describe('- English:', async () => {
        it('\'You will go to hell!\'', async () => {
            const result = await analyzeText('You will go to hell!');
            result.INSULT.should.equal(true)
            result.TOXICITY.should.equal(true)
            result.THREAT.should.equal(true)
            result.PROFANITY.should.equal(true)
            result.SEVERE_TOXICITY.should.equal(true)
            result.IDENTITY_ATTACK.should.equal(false)
        });
        it('\'You dumb!\'', async () => {
            const result = await analyzeText('You dumb!');
            result.INSULT.should.equal(true)
            result.TOXICITY.should.equal(true)
            result.THREAT.should.equal(false)
            result.PROFANITY.should.equal(true)
            result.SEVERE_TOXICITY.should.equal(true)
            result.IDENTITY_ATTACK.should.equal(false)
        });
    });
});