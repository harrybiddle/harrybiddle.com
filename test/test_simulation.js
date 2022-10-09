import { strict as assert } from 'assert';
import { intersect } from '../src/routes/blog/renting-versus-buying/simulation.js';

describe('simulation', function() {
	describe('intersect', function() {
		it('empty', function() {
			assert.equal(intersect([], []), null);
		});
		it('single point, failed', function() {
			assert.equal(intersect([[0, -1]], [[0, 1]]), null);
		});
		it('single point, found', function() {
			assert.deepEqual(intersect([[0, 1]], [[0, -1]]), [0, 0]);
		});
		it('intersection at end of line segment', function() {
			assert.deepEqual(
				intersect(
					[
						[0, 0],
						[1, 1]
					],
					[
						[0, 2],
						[1, 1]
					]
				),
				[1, 1]
			);
		});
		it('intersection in centre of line segment', function() {
			assert.deepEqual(
				intersect(
					[
						[0, 0],
						[1, 1]
					],
					[
						[0, 1],
						[1, 0]
					]
				),
				[0.5, 0.5]
			);
		});
	});
});
