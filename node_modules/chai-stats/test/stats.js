var tmp;
if (!chai) {
  var chai = require('chai')
    , stats = require('..');
  chai.use(stats);
  tmp = stats;
}
else {
  tmp = chai_stats;
}

var should = chai.should()
  , assert = chai.assert
  , expect = chai.expect
  , chai_stats = tmp;

describe('Chai Stats', function () {

  describe('Math Basics', function () {
    var nums = [ 1, 3, 5, 7, 9 ];

    it('should be able to get the sum of a set of numbers', function () {
      nums.should.have.sum.equal(25);
    });

    it('should be able to get the mean of a set of numbers', function () {
      nums.should.have.mean.equal(5);
    });

    it('should be able to get the standard deviation', function () {
      nums.should.have.stdev.equal(3.1622776601683795);
      nums.should.have.deviation.equal(3.1622776601683795);
      [ 1, 2, 3, 4 ].should.have.deviation.almost.equal(1.290, 2);
    });
  });

  describe('almost equal / eql', function () {
    it('should work: .almost.equal // almostEqual', function() {
      (3.1416).should.almost.equal(3.14159, 3);
      assert.almostEqual(3.1416, 3.14159, 3);

      (function () {
        assert.almostEqual(3.1416, 3.14159, 6);
      }).should.throw(chai.AssertionError, "expected 3.1416 to equal 3.14159 up to 6 decimal places");

      (function () {
        assert.almostEqual(3.1416, 3.14159);
      }).should.throw(chai.AssertionError,  "expected 3.1416 to equal 3.14159 up to 7 decimal places");

    });

    it('should work: .almost.eql // deepAlmostEqual', function() {
      ({ pi: 3.1416 }).should.almost.eql({ pi: 3.14159 }, 3);
      assert.deepAlmostEqual({pi: 3.1416}, {pi: 3.14159}, 3);

      (function () {
        assert.deepAlmostEqual({pi: 3.1416}, {pi: 3.14159}, 6);
      }).should.throw(chai.AssertionError, "expected { pi: 3.1416 } to equal { pi: 3.14159 } up to 6 decimal places");

      (function () {
        assert.deepAlmostEqual({pi: 3.1416}, {pi: 3.14159});
      }).should.throw(chai.AssertionError, "expected { pi: 3.1416 } to equal { pi: 3.14159 } up to 7 decimal places");

    });
    
    it('should round to nearest number if explicitely given 0 precision', function() {
      ({ pi: 3.1416 }).should.almost.eql({ pi: 3 }, 0);
      assert.deepAlmostEqual({pi: 3.1416}, {pi: 3}, 0);
      expect(3.1415).to.almost.equal(3, 0); // precision 0 => rounding
      expect(3.1415).to.not.almost.equal(3); // precision undefined => 7 decimal places
      expect(5.8).to.almost.equal(6, 0); // precision 0 => rounding
    });
  });

  describe('math functions are publicly available',function(){

    var nums = [ 1, 3, 5, 7, 9 ];

    it('almostEqual',function(){
      expect(chai_stats.almostEqual(3.1415,3,0)).to.be.true;
      expect(chai_stats.almostEqual(3.1415,3.1416,3)).to.be.true;
      expect(chai_stats.almostEqual(3.1415,3.1416,4)).to.be.false;
    });
    it('deepAlmostEqual',function(){
      expect(chai_stats.deepAlmostEqual({ pi: 3.1416 },{ pi: 3 },0)).to.be.true;
      expect(chai_stats.deepAlmostEqual({ pi: 3.1416 },{ pi: 3.14159 },4)).to.be.true;
      expect(chai_stats.deepAlmostEqual({ pi: 3.1416 },{ pi: 3.14159 },5)).to.be.false;
    });
    it('mean',function(){
      expect(chai_stats.mean(nums)).to.equal(5);
    });
    it('sum',function(){
      expect(chai_stats.sum(nums)).to.equal(25);
    });
    it('sdeviation',function(){
      expect(chai_stats.sdeviation(nums)).to.equal(3.1622776601683795);
    })
  });
});
