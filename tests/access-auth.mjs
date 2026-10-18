import assert from 'node:assert/strict';
import {passwordHash,equal,digest,randomToken} from '../lib/password-auth.mjs';
const salt=randomToken(),hash=await passwordHash('synthetic-test-password',salt);
assert.ok(equal(hash,await passwordHash('synthetic-test-password',salt)));
assert.ok(!equal(hash,await passwordHash('different-password',salt)));
assert.ok(!equal(hash,await passwordHash('synthetic-test-password',randomToken())));
assert.equal((await digest(randomToken())).length,64);
assert.notEqual(randomToken(),randomToken());
console.log('PASS: password hashing, salt isolation, wrong-password rejection and random session tokens.');
