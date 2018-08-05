const sinon = require('sinon');
var createError = require('http-errors');
const chai = require('chai');

const Rating = require('../../app/models/Rating');
const RC = require('../../app/controllers/RatingController');

const sandbox = sinon.createSandbox();
const expect = chai.expect;

describe('Test for RatingController:addOrUpdateRating', function () {
    let req, res, resJsonSpy, resStatusSpy, nextSpy;

    // before each test
    beforeEach( function (done) {
        req = {
            user: {
                _id: 'abcd'
            },
            body: {
                rating: '2',
                review: 'good'
            },
            params: {
                id: 'wxyz'
            }
        };
        resJsonSpy = sandbox.spy();
        res = {
            json: resJsonSpy
        };
        resStatusSpy = sandbox.stub().returns(res);
        nextSpy =  sandbox.spy();
        sandbox.stub(Rating, 'create')
            .callsFake( function (rating) {
                return new Promise( function (resolve) {
                    rating._id = '1234';
                    resolve(rating);
                });
            });
        done();
    });

    // after each test
    afterEach( function (done) {
        sandbox.restore();
        done();
    });

    // tests

    it('placeholder', function (done) {
        expect(1+1).to.equal(2);
        done();
    });

    it('a valid rating', function (done) {
        sandbox.stub(Rating, 'findOne')
            .resolves(null);
        
        RC.addOrUpdateRating(req, { status: resStatusSpy }, nextSpy);
        
        setTimeout(function() {
            expect(nextSpy.callCount).to.equal(0);
            expect(resJsonSpy.callCount).to.equal(1);
            expect(resJsonSpy.args[0][0].rating).to.equal('1234');
            done();
        }, 250);
    });

    it('rating faces internal error', function (done) {
        sandbox.stub(Rating, 'findOne')
            .rejects(createError(500,'internal'));
        
        RC.addOrUpdateRating(req, { status: resStatusSpy }, nextSpy);
            
        setTimeout(function() {
            expect(nextSpy.callCount).to.equal(1);
            expect(resJsonSpy.callCount).to.equal(0);
            expect(nextSpy.args[0][0].status).to.equal(500);
            done();
        }, 250);
    });
});